import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ElektraCache } from '@/lib/services/elektra-cache'

// This endpoint receives price updates from Elektra PMS
// Example payload: { "HotelId": 33264, "RoomTypeId": 12, "Date": "2026-03-01", "Price": 150.0, "Currency": "EUR" }
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        console.log('[Elektra Webhook] Received Price Update:', JSON.stringify(body).slice(0, 200))

        // Log the incoming webhook payload for auditing
        await prisma.elektraChannelLog.create({
            data: {
                type: 'price',
                payload: JSON.stringify(body),
                status: 'success'
            }
        })

        // Here we would typically update our local ElektraRoomInventory 
        // Wait until array mapping is clear from the actual Elektra pushing structure

        // For now, trigger a background cache refresh so the dashboard stays updated
        // We do this non-blocking
        setTimeout(() => {
            ElektraCache.refresh().catch(console.error)
        }, 1000)

        return NextResponse.json({ success: true, message: 'Price update received' }, { status: 200 })

    } catch (error) {
        console.error('[Elektra Webhook] Price error:', error)

        // Attempt to log the error if possible
        try {
            await prisma.elektraChannelLog.create({
                data: {
                    type: 'price',
                    payload: 'Parse Error',
                    status: 'error',
                    errorMsg: error instanceof Error ? error.message : 'Unknown error'
                }
            })
        } catch (e) { /* ignore db error */ }

        return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 })
    }
}
