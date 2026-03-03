import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tasks/dependencies — List all dependencies (optionally filtered by taskId)
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const taskId = searchParams.get('taskId')

        const where: any = {}
        if (taskId) {
            where.OR = [{ sourceTaskId: taskId }, { targetTaskId: taskId }]
        }

        const deps = await prisma.taskDependency.findMany({
            where,
            include: {
                sourceTask: { select: { id: true, title: true, status: true } },
                targetTask: { select: { id: true, title: true, status: true } },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(deps)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/admin/tasks/dependencies — Create a dependency
export async function POST(request: NextRequest) {
    try {
        const { sourceTaskId, targetTaskId, type } = await request.json()

        if (!sourceTaskId || !targetTaskId) {
            return NextResponse.json({ error: 'sourceTaskId and targetTaskId are required' }, { status: 400 })
        }

        if (sourceTaskId === targetTaskId) {
            return NextResponse.json({ error: 'A task cannot depend on itself' }, { status: 400 })
        }

        // Check for circular dependency (simple direct check)
        const reverse = await prisma.taskDependency.findFirst({
            where: { sourceTaskId: targetTaskId, targetTaskId: sourceTaskId }
        })
        if (reverse) {
            return NextResponse.json({ error: 'Circular dependency detected' }, { status: 400 })
        }

        const dep = await prisma.taskDependency.create({
            data: {
                sourceTaskId,
                targetTaskId,
                type: type || 'finish_to_start',
            },
            include: {
                sourceTask: { select: { id: true, title: true } },
                targetTask: { select: { id: true, title: true } },
            },
        })

        return NextResponse.json(dep)
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'This dependency already exists' }, { status: 409 })
        }
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE /api/admin/tasks/dependencies — Delete a dependency
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 })
        }

        await prisma.taskDependency.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
