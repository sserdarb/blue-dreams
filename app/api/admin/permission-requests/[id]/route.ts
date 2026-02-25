import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get(COOKIE_NAME)
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const sessionData = JSON.parse(session.value)
        if (sessionData.role !== 'superadmin') {
            return NextResponse.json({ error: 'Sadece süper yönetici yetki taleplerini onaylayabilir' }, { status: 403 })
        }

        const { id } = await params
        const body = await request.json()
        const { status, reviewNote } = body // status: 'approved' | 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return NextResponse.json({ error: 'Geçersiz durum' }, { status: 400 })
        }

        const permRequest = await prisma.permissionRequest.update({
            where: { id },
            data: {
                status,
                reviewedBy: sessionData.email,
                reviewNote: reviewNote || null,
            }
        })

        // If approved, update user permissions
        if (status === 'approved') {
            const requestedPerms = JSON.parse(permRequest.requestedPermissions) as string[]
            const user = await prisma.adminUser.findUnique({ where: { id: permRequest.userId } })

            if (user) {
                const currentPerms = user.permissions ? JSON.parse(user.permissions) as string[] : []
                const mergedPerms = [...new Set([...currentPerms, ...requestedPerms])]

                // Determine new role based on permissions
                let newRole = user.role
                if (mergedPerms.length > 1 && user.role === 'viewer') {
                    newRole = 'editor' // Upgrade viewer to editor when given more permissions
                }

                await prisma.adminUser.update({
                    where: { id: user.id },
                    data: {
                        permissions: JSON.stringify(mergedPerms),
                        role: newRole,
                    }
                })
            }
        }

        return NextResponse.json(permRequest)
    } catch (error) {
        console.error('[PermissionRequests PUT]', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
