import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tasks — List tasks with filters
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const assigneeId = searchParams.get('assigneeId')
        const departmentId = searchParams.get('departmentId')
        const priority = searchParams.get('priority')
        const parentId = searchParams.get('parentId')
        const search = searchParams.get('search')

        const where: any = {}
        if (status) where.status = status
        if (assigneeId) where.assigneeId = assigneeId
        if (departmentId) where.departmentId = departmentId
        if (priority) where.priority = priority
        if (parentId !== null && parentId !== undefined) {
            where.parentId = parentId === '' ? null : parentId
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        const tasks = await prisma.task.findMany({
            where,
            include: {
                department: true,
                comments: { orderBy: { createdAt: 'desc' }, take: 1 },
                _count: { select: { comments: true, attachments: true } },
                dependencies: { include: { targetTask: { select: { id: true, title: true, status: true } } } },
                dependents: { include: { sourceTask: { select: { id: true, title: true, status: true } } } },
                timeEntries: { orderBy: { startTime: 'desc' }, take: 5 },
            },
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        })

        // Fetch admin users for assignee/creator names
        const userIds = [...new Set(tasks.flatMap(t => [t.assigneeId, t.creatorId].filter(Boolean)))] as string[]
        const users = userIds.length > 0
            ? await prisma.adminUser.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true, email: true } })
            : []
        const userMap = Object.fromEntries(users.map(u => [u.id, u]))

        const enriched = tasks.map(t => ({
            ...t,
            assignee: t.assigneeId ? userMap[t.assigneeId] || null : null,
            creator: userMap[t.creatorId] || null,
        }))

        return NextResponse.json(enriched)
    } catch (error: any) {
        console.error('[Tasks] GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/admin/tasks — Create task
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { title, description, status, priority, dueDate, departmentId, assigneeId, creatorId, parentId, workflowId, tags, sourceType, sourceRef, estimatedMin } = body

        if (!title || !creatorId) {
            return NextResponse.json({ error: 'title and creatorId are required' }, { status: 400 })
        }

        const task = await prisma.task.create({
            data: {
                title,
                description,
                status: status || 'todo',
                priority: priority || 'medium',
                dueDate: dueDate ? new Date(dueDate) : null,
                departmentId: departmentId || null,
                assigneeId: assigneeId || null,
                creatorId,
                parentId: parentId || null,
                workflowId: workflowId || null,
                tags: tags ? JSON.stringify(tags) : null,
                sourceType: sourceType || 'manual',
                sourceRef: sourceRef || null,
                estimatedMin: estimatedMin || null,
            },
            include: { department: true },
        })

        // Create notification for assignee (in-app + email)
        if (assigneeId && assigneeId !== creatorId) {
            try {
                const { notifyTaskAssignment } = await import('@/lib/notifications')
                await notifyTaskAssignment(assigneeId, {
                    id: task.id, title: task.title, priority: task.priority, dueDate: task.dueDate
                })
            } catch (notifErr) {
                console.warn('[Tasks] Notification failed (non-blocking):', notifErr)
            }
        }

        return NextResponse.json(task)
    } catch (error: any) {
        console.error('[Tasks] POST error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
