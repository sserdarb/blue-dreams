import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/app/actions/auth'

// GET /api/admin/tasks — List tasks with filters
export async function GET(request: NextRequest) {
    try {
        // Authenticate the user to enforce visibility rules
        const session = await getSession()
        const currentUserId = session?.userId as string | undefined
        const currentUserRole = session?.role as string | undefined
        const currentUserEmail = session?.email as string | undefined

        // Fetch user department if available (assuming user might have a department assigned via a profile setting later, 
        // for now we enforce via explicit roles or direct assignment fields if department integration isn't fully linked to AdminUser yet)

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
            where.AND = where.AND || []
            where.AND.push({
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ]
            })
        }

        // Apply strict Visibility logic only if the user is NOT a superadmin
        if (currentUserId && currentUserRole !== 'superadmin') {
            where.AND = where.AND || []
            where.AND.push({
                OR: [
                    // Task has no visibility restrictions
                    { visibilityDepts: null, visibilityUsers: null, visibilityRoles: null },
                    { visibilityDepts: '', visibilityUsers: '', visibilityRoles: '' },

                    // Explicit User Inclusion
                    { visibilityUsers: { contains: currentUserId } },
                    ...(currentUserEmail ? [{ visibilityUsers: { contains: currentUserEmail } }] : []),

                    // Explicit Role Inclusion
                    ...(currentUserRole ? [{ visibilityRoles: { contains: currentUserRole } }] : []),

                    // Natural involvement bypasses restrictions
                    { creatorId: currentUserId },
                    { assigneeId: currentUserId }
                ]
            })
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
        const { title, description, status, priority, dueDate, departmentId, assigneeId, creatorId, parentId, workflowId, tags, sourceType, sourceRef, estimatedMin, visibilityDepts, visibilityUsers, visibilityRoles } = body

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
                visibilityDepts: visibilityDepts || null,
                visibilityUsers: visibilityUsers || null,
                visibilityRoles: visibilityRoles || null,
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
