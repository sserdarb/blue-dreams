import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    try {
        // Fetch the last 100 activities
        const events = await prisma.analyticsEvent.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        // Group by visitorId for summary if needed, or just return flat
        return NextResponse.json({ success: true, events })
    } catch (error: any) {
        console.error('[Visitor API Error]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
