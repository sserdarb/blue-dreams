// Admin API: Elektra Cache status + manual refresh
import { NextResponse } from 'next/server'
import { ElektraCache } from '@/lib/services/elektra-cache'

// GET — Return cache status
export async function GET() {
    try {
        const status = await ElektraCache.getStatus()
        return NextResponse.json(status)
    } catch (err) {
        console.error('[ElektraCache API] Status error:', err)
        return NextResponse.json({ error: 'Cache status unavailable' }, { status: 500 })
    }
}

// POST — Manual refresh
export async function POST() {
    try {
        const start = Date.now()
        await ElektraCache.refresh()
        const status = await ElektraCache.getStatus()
        const elapsed = Date.now() - start

        return NextResponse.json({
            success: true,
            reservationCount: status.reservationCount,
            availabilityCount: 0, // Not tracking availability count in status currently
            fetchedAt: status.lastUpdated,
            elapsedMs: elapsed,
        })
    } catch (err) {
        console.error('[ElektraCache API] Refresh error:', err)
        return NextResponse.json({ error: 'Cache refresh failed' }, { status: 500 })
    }
}
