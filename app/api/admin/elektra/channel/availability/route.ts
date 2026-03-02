import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ElektraCache } from '@/lib/services/elektra-cache'

// This endpoint receives availability updates from Elektra PMS
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('[Elektra Webhook] Received Availability Update:', JSON.stringify(body).slice(0, 200))

        await prisma.elektraChannelLog.create({
            data: {
                type: 'availability',
                payload: JSON.stringify(body),
                status: 'success'
            }
        })

        setTimeout(() => {
            ElektraCache.refresh().catch(console.error)
        }, 1000)

        return NextResponse.json({ success: true, message: 'Availability update received' }, { status: 200 })
    } catch (error) {
        console.error('[Elektra Webhook] Availability error:', error)

        try {
            await prisma.elektraChannelLog.create({
                data: {
                    type: 'availability',
                    payload: 'Parse Error',
                    status: 'error',
                    errorMsg: error instanceof Error ? error.message : 'Unknown error'
                }
            })
        } catch (e) { }

        return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
    }
}
