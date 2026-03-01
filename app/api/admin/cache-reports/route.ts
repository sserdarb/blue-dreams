import { NextResponse } from 'next/server'
import { ElektraCache } from '@/lib/services/elektra-cache'
import { ElektraService } from '@/lib/services/elektra'

// ─── Fully DB-first cache-reports ───────────────────────────────
// All historical data comes from PostgreSQL.
// Only "today's live" data is still fetched from PMS (for real-time accuracy).

export async function GET() {
    try {
        console.log('[Cache-Reports] Building hybrid dataset: DB History + Live Real-Time...')
        const start = Date.now()

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Parallel fetch: DB Cache (Up to Yesterday) + Live Today's Reservations + Live Season Cancellations
        const [dbRaw, todayLiveReservations, seasonCancellations] = await Promise.all([
            ElektraCache.getReservations(),
            ElektraService.getReservationsByBookingDate(today, new Date(today.getTime() + 86400000)).catch(() => []),
            ElektraService.getAllSeasonCancellations().catch(() => [])
        ])

        // Convert Cancelled list into a fast lookup Set based on IDs
        const cancelledIds = new Set(seasonCancellations.map(c => c.id))

        // 1. Filter out DB Cache items that have been Cancelled in real-time
        let validCacheReservations = dbRaw.filter(r => !cancelledIds.has(r.id))

        // 2. Filter out DB Cache items that share an ID with a "Today" update
        const liveMap = new Map()
        todayLiveReservations.forEach(r => liveMap.set(r.id, r))
        validCacheReservations = validCacheReservations.filter(r => !liveMap.has(r.id))

        // 3. Merge Cache + Live
        const mergedRaw = [...validCacheReservations, ...todayLiveReservations.filter(r => !cancelledIds.has(r.id))]

        const reservations = mergedRaw.map(r => ({
            id: r.id,
            voucherNo: r.voucherNo,
            agency: r.agency,
            channel: r.channel,
            roomType: r.roomType,
            boardType: r.boardType,
            checkIn: typeof r.checkIn === 'string' ? r.checkIn.slice(0, 10) : new Date(r.checkIn).toISOString().slice(0, 10),
            checkOut: typeof r.checkOut === 'string' ? r.checkOut.slice(0, 10) : new Date(r.checkOut).toISOString().slice(0, 10),
            nights: r.nights,
            totalPrice: r.totalPrice,
            paidPrice: r.paidPrice,
            currency: r.currency,
            roomCount: r.roomCount,
            status: r.status,
            saleDate: (r.reservationDate || r.lastUpdate || '').slice(0, 10),
            country: r.country,
        }))

        const fetchedAt = Date.now()
        console.log(`[Cache-Reports] Hybrid Sync Complete. Built ${reservations.length} records in ${Date.now() - start}ms`)

        return NextResponse.json({
            reservations,
            lastUpdated: new Date(fetchedAt).toISOString(),
            cacheAge: 0,
            fromCache: true,
        })
    } catch (err: any) {
        console.error('[Cache-Reports] Error:', err?.message)
        return NextResponse.json({ error: 'Veri yüklenemedi', reservations: [] }, { status: 500 })
    }
}

// POST — force refresh of the underlying DB cache
export async function POST() {
    try {
        await ElektraCache.refresh()
        return NextResponse.json({ success: true, message: 'Cache refreshed' })
    } catch (err: any) {
        console.error('[Cache-Reports] Force refresh error:', err?.message)
        return NextResponse.json({ error: 'Yenileme başarısız' }, { status: 500 })
    }
}
