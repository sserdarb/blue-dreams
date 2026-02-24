import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/users/assignable — Get users with workflow/task permissions
export async function GET() {
    try {
        const users = await prisma.adminUser.findMany({
            where: { isActive: true },
            select: { id: true, name: true, email: true, role: true, permissions: true },
            orderBy: { name: 'asc' },
        })

        // Filter users who have task/workflow permissions OR are superadmin/admin
        const assignableUsers = users.filter(u => {
            if (u.role === 'superadmin') return true
            if (!u.permissions) return false
            try {
                const perms: string[] = JSON.parse(u.permissions)
                return perms.includes('task_management') || perms.includes('workflow_management')
            } catch { return false }
        }).map(u => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
        }))

        return NextResponse.json(assignableUsers)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
