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
    console.log('[Cache] Fetching reservation data from DB Cache...')
    const start = Date.now()

    // Use DB Cache
    const raw = await ElektraCache.getReservations()

    const reservations = raw.map(r => ({
        id: r.id,
        voucherNo: r.voucherNo,
        agency: r.agency,
        channel: r.channel,
        roomType: r.roomType,
        boardType: r.boardType,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        nights: r.nights,
        totalPrice: r.totalPrice,
        paidPrice: r.paidPrice,
        currency: r.currency,
        roomCount: r.roomCount,
        status: r.status,
        saleDate: r.lastUpdate.slice(0, 10),
        nationality: r.nationality,
    }))

    cache = { data: reservations, fetchedAt: Date.now() }
    console.log(`[Cache] Retrieved ${reservations.length} reservations from DB in ${Date.now() - start}ms`)
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
