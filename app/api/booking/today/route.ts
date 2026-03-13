import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'
import { ElektraCache } from '@/lib/services/elektra-cache'

/**
 * On-demand endpoint for today's live data.
 * The ElektraCache.refresh() intentionally excludes today's data (to avoid caching
 * dynamically changing data). This endpoint provides real-time today data by:
 * 1. Fetching cached historical data from DB for context
 * 2. Making a live Elektra PMS call for today's reservations
 */
export async function GET() {
    try {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().split('T')[0]

        // Live fetch today's reservations from Elektra PMS
        const [liveReservations, cachedRates] = await Promise.all([
            ElektraService.getReservations(
                new Date(todayStr),
                new Date(tomorrowStr)
            ),
            ElektraCache.getExchangeRates()
        ])

        // Also get cache status for freshness indicator
        const cacheStatus = await ElektraCache.getStatus()

        return NextResponse.json({
            success: true,
            date: todayStr,
            reservations: liveReservations,
            reservationCount: liveReservations.length,
            exchangeRates: cachedRates,
            cacheStatus: {
                lastUpdated: cacheStatus.lastUpdated,
                isStale: cacheStatus.isStale,
                totalCachedReservations: cacheStatus.reservationCount
            },
            fetchedAt: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('[API] Today data fetch error:', error)
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        )
    }
}
