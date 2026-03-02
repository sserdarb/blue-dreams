import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ElektraCache } from '@/lib/services/elektra-cache'

// This endpoint receives restriction updates (Min Stay, CTA, CTD) from Elektra PMS
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('[Elektra Webhook] Received Restriction Update:', JSON.stringify(body).slice(0, 200))

        await prisma.elektraChannelLog.create({
            data: {
                type: 'restriction',
                payload: JSON.stringify(body),
                status: 'success'
            }
        })

        // Rate limits may apply if we refresh on every push, but PMS usually batches
        setTimeout(() => {
            ElektraCache.refresh().catch(console.error)
        }, 1000)

        return NextResponse.json({ success: true, message: 'Restriction update received' }, { status: 200 })
    } catch (error) {
        console.error('[Elektra Webhook] Restriction error:', error)

        try {
            await prisma.elektraChannelLog.create({
                data: {
                    type: 'restriction',
                    payload: 'Parse Error',
                    status: 'error',
                    errorMsg: error instanceof Error ? error.message : 'Unknown error'
                }
            })
        } catch (e) { }

        return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
    }
}
