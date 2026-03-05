import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/app/actions/auth'
import { ElektraService } from '@/lib/services/elektra'
import { isDemoSession } from '@/lib/demo-session'

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

        const siteSettings = await prisma.siteSettings.findFirst()
        const demoSession = await isDemoSession()
        const isDemo = demoSession || (siteSettings?.demoModeTasks ?? false)

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

        // Fetch Elektra tasks and blend
        let elektraTasks: any[] = []
        try {
            if (isDemo) {
                elektraTasks = [
                    { id: 'mock-e-1', title: 'Fix AC in Room 101', description: 'Guest complained about AC not cooling.', status: 'todo', priority: 'high', sourceType: 'elektra_pms', createdAt: new Date() },
                    { id: 'mock-e-2', title: 'Clean Pool Area', description: 'Routine cleaning required.', status: 'in_progress', priority: 'medium', sourceType: 'elektra_pms', createdAt: new Date() }
                ]
            } else {
                const liveTasks = await ElektraService.fetchTasks()
                elektraTasks = liveTasks.map((t: any) => ({
                    id: `elektra-${t.TaskId || t.Id || Math.random()}`,
                    title: t.TaskName || t.Description || 'PMS Task',
                    description: t.Description || '',
                    status: t.Status === 'Completed' || t.Status === 3 ? 'done' : t.Status === 'In Progress' || t.Status === 2 ? 'in_progress' : 'todo',
                    priority: t.Priority === 1 ? 'high' : t.Priority === 2 ? 'medium' : 'low',
                    sourceType: 'elektra_pms',
                    sourceRef: t.TaskId?.toString() || t.Id?.toString() || '',
                    createdAt: t.CreateDate ? new Date(t.CreateDate) : new Date(),
                    dueDate: t.DueDate ? new Date(t.DueDate) : null,
                    location: t.Location || ''
                }))
            }
        } catch (e) {
            console.error('[Tasks] Error blending Elektra tasks:', e)
        }

        const finalMergedTasks = [...elektraTasks, ...enriched]

        return NextResponse.json(finalMergedTasks)
    } catch (error: any) {
        console.error('[Tasks] GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/admin/tasks — Create task
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        let { title, description, status, priority, dueDate, departmentId, assigneeId, creatorId, parentId, workflowId, tags, sourceType, sourceRef, estimatedMin, visibilityDepts, visibilityUsers, visibilityRoles, elektraDefId, location } = body

        if (!title || !creatorId) {
            return NextResponse.json({ error: 'title and creatorId are required' }, { status: 400 })
        }

        // --- ELEKTRA SYNC ---
        if (elektraDefId && elektraDefId.trim() !== '') {
            try {
                const elektraRes = await ElektraService.createTask({
                    taskDefinitionId: parseInt(elektraDefId, 10),
                    location: location || '',
                    description: description || title,
                })
                sourceType = 'elektra_pms'
                if (elektraRes && elektraRes.success !== false) {
                    sourceRef = elektraRes.TaskId?.toString() || elektraRes.id?.toString() || 'unknown'
                }
            } catch (pmsErr) {
                console.error('[Tasks] Failed to push to Elektra:', pmsErr)
                // Continue creating local task anyway, but maybe label it failed?
            }
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
