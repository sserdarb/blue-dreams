import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tasks/time-entries — List time entries
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const taskId = searchParams.get('taskId')
        const userId = searchParams.get('userId')

        const where: any = {}
        if (taskId) where.taskId = taskId
        if (userId) where.userId = userId

        const entries = await prisma.timeEntry.findMany({
            where,
            include: {
                task: { select: { id: true, title: true } },
            },
            orderBy: { startTime: 'desc' },
        })

        // Aggregate totals
        const totalMinutes = entries.reduce((sum, e) => sum + (e.duration || 0), 0)
        const billableMinutes = entries.filter(e => e.billable).reduce((sum, e) => sum + (e.duration || 0), 0)

        return NextResponse.json({
            entries,
            totals: {
                totalMinutes,
                billableMinutes,
                totalHours: Math.round(totalMinutes / 60 * 10) / 10,
                billableHours: Math.round(billableMinutes / 60 * 10) / 10,
            }
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST /api/admin/tasks/time-entries — Create or stop a time entry
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { taskId, userId, startTime, endTime, duration, billable, note, action } = body

        // Action: "stop" — find the running entry and stop it
        if (action === 'stop') {
            const running = await prisma.timeEntry.findFirst({
                where: { taskId, userId, endTime: null },
                orderBy: { startTime: 'desc' },
            })
            if (!running) {
                return NextResponse.json({ error: 'No running timer found' }, { status: 404 })
            }
            const now = new Date()
            const durMin = Math.round((now.getTime() - new Date(running.startTime).getTime()) / 60000)
            const updated = await prisma.timeEntry.update({
                where: { id: running.id },
                data: { endTime: now, duration: durMin },
            })
            return NextResponse.json(updated)
        }

        // Normal creation (either start timer or manual entry)
        if (!taskId || !userId) {
            return NextResponse.json({ error: 'taskId and userId are required' }, { status: 400 })
        }

        const entry = await prisma.timeEntry.create({
            data: {
                taskId,
                userId,
                startTime: startTime ? new Date(startTime) : new Date(),
                endTime: endTime ? new Date(endTime) : null,
                duration: duration || null,
                billable: billable !== false,
                note: note || null,
            },
        })

        return NextResponse.json(entry)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE /api/admin/tasks/time-entries — Delete a time entry
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

        await prisma.timeEntry.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
