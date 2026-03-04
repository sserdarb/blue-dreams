import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { visitorId, sessionId, eventType, pageUrl, elementId, metadata } = body

        if (!visitorId || !sessionId || !eventType || !pageUrl) {
            return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 })
        }

        const event = await prisma.analyticsEvent.create({
            data: {
                visitorId,
                sessionId,
                eventType,
                pageUrl,
                elementId,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        })

        return NextResponse.json({ success: true, event })
    } catch (error: any) {
        console.error('[Tracking API Error]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
