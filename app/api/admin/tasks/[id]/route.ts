import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tasks/[id] — Get single task with full details
export async function GET(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                department: true,
                comments: { orderBy: { createdAt: 'desc' } },
                attachments: { orderBy: { createdAt: 'desc' } },
            },
        })

        if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

        // Get subtasks
        const subtasks = await prisma.task.findMany({
            where: { parentId: task.id },
            include: { department: true },
            orderBy: { order: 'asc' },
        })

        // Resolve user names
        const userIds = [...new Set([task.assigneeId, task.creatorId, ...task.comments.map(c => c.authorId)].filter(Boolean))] as string[]
        const users = await prisma.adminUser.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
        const userMap = Object.fromEntries(users.map(u => [u.id, u]))

        return NextResponse.json({
            ...task,
            assignee: task.assigneeId ? userMap[task.assigneeId] : null,
            creator: userMap[task.creatorId] || null,
            subtasks,
            comments: task.comments.map(c => ({ ...c, author: userMap[c.authorId] || null })),
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT /api/admin/tasks/[id] — Update task
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        const body = await request.json()
        const { title, description, status, priority, dueDate, departmentId, assigneeId, parentId, tags, estimatedMin, order, visibilityDepts, visibilityUsers, visibilityRoles } = body

        const existing = await prisma.task.findUnique({ where: { id } })
        if (!existing) return NextResponse.json({ error: 'Task not found' }, { status: 404 })

        const data: any = {}
        if (title !== undefined) data.title = title
        if (description !== undefined) data.description = description
        if (status !== undefined) {
            data.status = status
            if (status === 'done' && existing.status !== 'done') data.completedAt = new Date()
            if (status !== 'done') data.completedAt = null
        }
        if (priority !== undefined) data.priority = priority
        if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null
        if (departmentId !== undefined) data.departmentId = departmentId || null
        if (assigneeId !== undefined) data.assigneeId = assigneeId || null
        if (parentId !== undefined) data.parentId = parentId || null
        if (tags !== undefined) data.tags = tags ? JSON.stringify(tags) : null
        if (estimatedMin !== undefined) data.estimatedMin = estimatedMin
        if (order !== undefined) data.order = order
        if (visibilityDepts !== undefined) data.visibilityDepts = visibilityDepts || null
        if (visibilityUsers !== undefined) data.visibilityUsers = visibilityUsers || null
        if (visibilityRoles !== undefined) data.visibilityRoles = visibilityRoles || null

        const task = await prisma.task.update({
            where: { id },
            data,
            include: { department: true },
        })

        // Notify on reassignment
        if (assigneeId && assigneeId !== existing.assigneeId) {
            await prisma.notification.create({
                data: {
                    userId: assigneeId,
                    type: 'task_assigned',
                    title: 'Görev Atandı',
                    message: `"${task.title}" görevi size atandı.`,
                    link: `/tasks?id=${task.id}`,
                },
            })
        }

        // Log status change as comment
        if (status && status !== existing.status) {
            await prisma.taskComment.create({
                data: {
                    taskId: task.id,
                    authorId: existing.creatorId,
                    content: `Durum değiştirildi: ${existing.status} → ${status}`,
                    type: 'status_change',
                },
            })
        }

        return NextResponse.json(task)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE /api/admin/tasks/[id]
export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params
        await prisma.task.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
