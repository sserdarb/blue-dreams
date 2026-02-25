import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'admin_session'

function getSession() {
    // Synchronous-ish helper won't work in route handlers, we parse inline
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get(COOKIE_NAME)
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const sessionData = JSON.parse(session.value)

        if (sessionData.role === 'superadmin') {
            // Superadmin sees all requests
            const requests = await prisma.permissionRequest.findMany({
                orderBy: { createdAt: 'desc' }
            })
            return NextResponse.json(requests)
        } else {
            // Regular user sees only their own requests
            const requests = await prisma.permissionRequest.findMany({
                where: { userId: sessionData.userId },
                orderBy: { createdAt: 'desc' }
            })
            return NextResponse.json(requests)
        }
    } catch (error) {
        console.error('[PermissionRequests GET]', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const session = cookieStore.get(COOKIE_NAME)
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const sessionData = JSON.parse(session.value)
        const body = await request.json()
        const { requestedPermissions, reason } = body

        if (!requestedPermissions || !reason) {
            return NextResponse.json({ error: 'İzin ve sebep gerekli' }, { status: 400 })
        }

        // Check for existing pending request
        const existing = await prisma.permissionRequest.findFirst({
            where: {
                userId: sessionData.userId,
                status: 'pending'
            }
        })

        if (existing) {
            return NextResponse.json({ error: 'Zaten bekleyen bir talebiniz var' }, { status: 409 })
        }

        const req = await prisma.permissionRequest.create({
            data: {
                userId: sessionData.userId,
                userEmail: sessionData.email,
                userName: sessionData.name,
                requestedPermissions: JSON.stringify(requestedPermissions),
                reason,
                status: 'pending',
            }
        })

        return NextResponse.json(req)
    } catch (error) {
        console.error('[PermissionRequests POST]', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
