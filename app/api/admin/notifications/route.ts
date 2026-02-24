import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/admin/notifications — Get unread notifications for user
export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId')
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        })

        const unreadCount = await prisma.notification.count({ where: { userId, isRead: false } })

        return NextResponse.json({ notifications, unreadCount })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT /api/admin/notifications — Mark as read
export async function PUT(request: NextRequest) {
    try {
        const { ids, userId, markAll } = await request.json()

        if (markAll && userId) {
            await prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } })
        } else if (ids?.length) {
            await prisma.notification.updateMany({ where: { id: { in: ids } }, data: { isRead: true } })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
