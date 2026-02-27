export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const status = url.searchParams.get('status')
        const provider = url.searchParams.get('provider')
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '50')

        const where: any = {}
        if (status && status !== 'all') where.status = status
        if (provider && provider !== 'all') where.provider = provider

        const [logs, total] = await Promise.all([
            prisma.paymentLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: { booking: { select: { referenceId: true, guestName: true, status: true } } }
            }),
            prisma.paymentLog.count({ where })
        ])

        return NextResponse.json({
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        })
    } catch (error: any) {
        console.error('[Admin Payment Logs] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
