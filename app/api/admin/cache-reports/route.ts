import { NextResponse } from 'next/server'
import { ElektraCache } from '@/lib/services/elektra-cache'

// ─── In-memory cache (Optional: DB is fast, but we can keep this for ultra-fast response) ───
const CACHE_TTL = 30 * 60 * 1000 // 30 mins to match DB sync

interface CacheEntry {
    data: any[]
    fetchedAt: number
}

let cache: CacheEntry | null = null

async function fetchAndCache(): Promise<CacheEntry> {
    console.log('[Cache] Building hybrid dataset: DB History + Live Real-Time...')
    const start = Date.now()

    const today = new Date()
    // Align today strictly to the local date of the hotel server (zeroed)
    today.setHours(0, 0, 0, 0)

    // Parallel fetch: DB Cache (Up to Yesterday) + Live Today's Reservations + Live Season Cancellations
    const [dbRaw, todayLiveReservations, seasonCancellations] = await Promise.all([
        ElektraCache.getReservations(),
        import('@/lib/services/elektra').then(m => m.ElektraService.getReservationsByBookingDate(today, new Date(today.getTime() + 86400000))),
        import('@/lib/services/elektra').then(m => m.ElektraService.getAllSeasonCancellations())
    ])

    // Convert Cancelled list into a fast lookup Set based on Vouchers or IDs
    const cancelledIds = new Set(seasonCancellations.map(c => c.id))

    // 1. Filter out DB Cache items that have been Cancelled in real-time
    let validCacheReservations = dbRaw.filter(r => !cancelledIds.has(r.id))

    // 2. Filter out DB Cache items that share an ID with a "Today" update
    // This handles the edge case where a booking from 3 days ago was modified today
    const liveMap = new Map()
    todayLiveReservations.forEach(r => liveMap.set(r.id, r))
    validCacheReservations = validCacheReservations.filter(r => !liveMap.has(r.id))

    // 3. Merge Cache + Live
    // Note: DB cache returns slightly differently mapped reservations, so we normalize
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
        nationality: r.nationality,
    }))

    cache = { data: reservations, fetchedAt: Date.now() }
    console.log(`[Cache] Hybrid Sync Complete. Built ${reservations.length} records in ${Date.now() - start}ms`)
    return cache
}

function isCacheValid(): boolean {
    return !!cache && (Date.now() - cache.fetchedAt) < CACHE_TTL
}

// GET — return cached data (auto-refresh if >6hr)
export async function GET() {
    try {
        if (!isCacheValid()) {
            await fetchAndCache()
        }
        return NextResponse.json({
            reservations: cache!.data,
            lastUpdated: new Date(cache!.fetchedAt).toISOString(),
            cacheAge: Math.round((Date.now() - cache!.fetchedAt) / 1000),
            fromCache: true,
        })
    } catch (err: any) {
        console.error('[Cache] Error:', err?.message)
        // Return stale cache if available
        if (cache) {
            return NextResponse.json({
                reservations: cache.data,
                lastUpdated: new Date(cache.fetchedAt).toISOString(),
                cacheAge: Math.round((Date.now() - cache.fetchedAt) / 1000),
                fromCache: true,
                stale: true,
                error: 'Yeni veri çekilemedi, eski veriler gösteriliyor',
            })
        }
        return NextResponse.json({ error: 'Veri yüklenemedi', reservations: [] }, { status: 500 })
    }
}

// POST — force refresh
export async function POST() {
    try {
        const entry = await fetchAndCache()
        return NextResponse.json({
            reservations: entry.data,
            lastUpdated: new Date(entry.fetchedAt).toISOString(),
            cacheAge: 0,
            fromCache: false,
        })
    } catch (err: any) {
        console.error('[Cache] Force refresh error:', err?.message)
        return NextResponse.json({ error: 'Yenileme başarısız' }, { status: 500 })
    }
}
