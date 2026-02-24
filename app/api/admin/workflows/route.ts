import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const workflows = await prisma.workflow.findMany({
            include: { steps: { orderBy: { order: 'asc' } } },
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(workflows)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, description, steps } = await request.json()
        if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

        const workflow = await prisma.workflow.create({
            data: {
                name,
                description: description || null,
                steps: steps?.length ? {
                    create: steps.map((s: any, i: number) => ({
                        title: s.title,
                        description: s.description || null,
                        assigneeId: s.assigneeId || null,
                        departmentId: s.departmentId || null,
                        order: i,
                        duration: s.duration || null,
                    })),
                } : undefined,
            },
            include: { steps: { orderBy: { order: 'asc' } } },
        })
        return NextResponse.json(workflow)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { id, name, description, isActive, steps } = await request.json()
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

        // Update workflow
        await prisma.workflow.update({ where: { id }, data: { name, description, isActive } })

        // Replace steps if provided
        if (steps) {
            await prisma.workflowStep.deleteMany({ where: { workflowId: id } })
            for (let i = 0; i < steps.length; i++) {
                const s = steps[i]
                await prisma.workflowStep.create({
                    data: {
                        workflowId: id,
                        title: s.title,
                        description: s.description || null,
                        assigneeId: s.assigneeId || null,
                        departmentId: s.departmentId || null,
                        order: i,
                        duration: s.duration || null,
                    },
                })
            }
        }

        const updated = await prisma.workflow.findUnique({ where: { id }, include: { steps: { orderBy: { order: 'asc' } } } })
        return NextResponse.json(updated)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json()
        await prisma.workflow.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
