import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tasks/[id]/comments
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        const comments = await prisma.taskComment.findMany({
            where: { taskId: id },
            orderBy: { createdAt: 'desc' },
        })
        const userIds = [...new Set(comments.map(c => c.authorId))]
        const users = await prisma.adminUser.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
        const userMap = Object.fromEntries(users.map(u => [u.id, u]))
        return NextResponse.json(comments.map(c => ({ ...c, author: userMap[c.authorId] || null })))
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/admin/tasks/[id]/comments
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        const { authorId, content, type } = await request.json()
        if (!authorId || !content) return NextResponse.json({ error: 'authorId and content required' }, { status: 400 })

        const comment = await prisma.taskComment.create({
            data: { taskId: id, authorId, content, type: type || 'comment' },
        })

        // Notify task assignee/creator about new comment
        const task = await prisma.task.findUnique({ where: { id }, select: { assigneeId: true, creatorId: true, title: true } })
        if (task) {
            const notifyIds = [task.assigneeId, task.creatorId].filter(uid => uid && uid !== authorId) as string[]
            for (const userId of [...new Set(notifyIds)]) {
                await prisma.notification.create({
                    data: {
                        userId,
                        type: 'task_comment',
                        title: 'Yeni Yorum',
                        message: `"${task.title}" görevine yeni yorum eklendi.`,
                        link: `/tasks?id=${id}`,
                    },
                })
            }
        }

        return NextResponse.json(comment)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
