import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/tasks/capacity — Team workload and capacity overview
export async function GET() {
    try {
        // Get all admin users
        const users = await prisma.adminUser.findMany({
            select: { id: true, name: true, email: true, role: true },
        })

        // Get all active tasks (not done/cancelled) with estimated time
        const activeTasks = await prisma.task.findMany({
            where: { status: { notIn: ['done', 'cancelled'] } },
            select: {
                id: true, title: true, status: true, priority: true,
                assigneeId: true, estimatedMin: true, dueDate: true,
            },
        })

        // Get time entries for current week
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay())
        weekStart.setHours(0, 0, 0, 0)

        const timeEntries = await prisma.timeEntry.findMany({
            where: { startTime: { gte: weekStart } },
            select: { userId: true, duration: true, billable: true },
        })

        // Build capacity report per user
        const WEEKLY_CAPACITY_HOURS = 40 // Standard work week

        const capacityReport = users.map(user => {
            const userTasks = activeTasks.filter(t => t.assigneeId === user.id)
            const estimatedHours = userTasks.reduce((sum, t) => sum + (t.estimatedMin || 0), 0) / 60
            const loggedMinutes = timeEntries.filter(e => e.userId === user.id).reduce((sum, e) => sum + (e.duration || 0), 0)
            const loggedHours = Math.round(loggedMinutes / 60 * 10) / 10
            const utilization = Math.round((estimatedHours / WEEKLY_CAPACITY_HOURS) * 100)

            let capacityStatus: 'available' | 'busy' | 'overloaded' = 'available'
            if (utilization > 90) capacityStatus = 'overloaded'
            else if (utilization > 70) capacityStatus = 'busy'

            return {
                user: { id: user.id, name: user.name, email: user.email },
                activeTasks: userTasks.length,
                urgentTasks: userTasks.filter(t => t.priority === 'urgent').length,
                estimatedHours: Math.round(estimatedHours * 10) / 10,
                loggedHoursThisWeek: loggedHours,
                capacityHours: WEEKLY_CAPACITY_HOURS,
                utilization,
                capacityStatus,
                upcomingDeadlines: userTasks
                    .filter(t => t.dueDate)
                    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
                    .slice(0, 3)
                    .map(t => ({ id: t.id, title: t.title, dueDate: t.dueDate })),
            }
        })

        // Team summary
        const teamSummary = {
            totalActiveTask: activeTasks.length,
            unassignedTasks: activeTasks.filter(t => !t.assigneeId).length,
            totalEstimatedHours: Math.round(capacityReport.reduce((s, r) => s + r.estimatedHours, 0) * 10) / 10,
            totalLoggedHours: Math.round(capacityReport.reduce((s, r) => s + r.loggedHoursThisWeek, 0) * 10) / 10,
            avgUtilization: Math.round(capacityReport.reduce((s, r) => s + r.utilization, 0) / Math.max(capacityReport.length, 1)),
        }

        return NextResponse.json({ team: capacityReport, summary: teamSummary })
    } catch (error: any) {
        console.error('[Capacity API Error]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
