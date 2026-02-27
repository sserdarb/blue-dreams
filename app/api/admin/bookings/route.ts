export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const from = url.searchParams.get('from')
        const to = url.searchParams.get('to')
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '20')

        const where: any = {}
        if (status && status !== 'all') where.status = status
        if (from) where.createdAt = { ...(where.createdAt || {}), gte: new Date(from) }
        if (to) where.createdAt = { ...(where.createdAt || {}), lte: new Date(to + 'T23:59:59Z') }

        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.booking.count({ where })
        ])

        return NextResponse.json({
            bookings,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error: any) {
        console.error('[Admin Bookings] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
