import ReportsClient from './ReportsClient'

export const dynamic = 'force-dynamic'

async function getCachedReservations() {
    try {
        // Use internal API to get cached data
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/admin/cache-reports`, {
            cache: 'no-store',
        })
        if (res.ok) {
            const data = await res.json()
            return {
                reservations: data.reservations || [],
                lastUpdated: data.lastUpdated || null,
                error: data.error || null,
            }
        }
    } catch (err) {
        console.error('[Reports] Cache API error, falling back to direct fetch:', err)
    }

    // Fallback: direct fetch if cache API fails
    try {
        const { ElektraService } = await import('@/lib/services/elektra')
        const raw = await ElektraService.getAllSeasonReservations()
        const reservations = raw.map(r => ({
            id: r.id,
            voucherNo: r.voucherNo,
            agency: r.agency,
            channel: r.channel,
            roomType: r.roomType,
            boardType: r.boardType,
            checkIn: r.checkIn.slice(0, 10),
            checkOut: r.checkOut.slice(0, 10),
            nights: Math.max(1, Math.ceil(
                (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 86400000
            )),
            totalPrice: r.totalPrice,
            paidPrice: r.paidPrice,
            currency: r.currency,
            roomCount: r.roomCount,
            status: r.status,
            saleDate: r.lastUpdate.slice(0, 10),
        }))
        return { reservations, lastUpdated: new Date().toISOString(), error: null }
    } catch (err) {
        console.error('[Reports] Direct fetch error:', err)
        return { reservations: [], lastUpdated: null, error: 'Rapor verileri yüklenirken hata oluştu' }
    }
}

export default async function StatisticsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    // Fetch Data
    const { ElektraService } = await import('@/lib/services/elektra')

    let reservations: any[] = []
    let comparisonReservations: any[] = []
    let error: string | null = null
    let lastUpdated: string | null = null

    try {
        // Current Season (e.g., 2025)
        const raw = await ElektraService.getAllSeasonReservations()

        // Previous Year for Comparison (e.g., 2024)
        // Assuming "Season" is roughly current calendar year or April-Nov. 
        // Let's fetch full previous year for broad comparison.
        const prevYear = new Date().getFullYear() - 1
        const prevStart = new Date(prevYear - 1, 10, 1) // Start from Nov 1 of year prior (Pace logic)
        const prevEnd = new Date(`${prevYear}-12-31`)
        const rawComp = await ElektraService.getReservationsByBookingDate(prevStart, prevEnd)

        reservations = raw.map(r => ({
            id: r.id,
            voucherNo: r.voucherNo,
            agency: r.agency,
            channel: r.channel,
            roomType: r.roomType,
            boardType: r.boardType,
            checkIn: r.checkIn.slice(0, 10),
            checkOut: r.checkOut.slice(0, 10),
            nights: Math.max(1, Math.ceil(
                (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 86400000
            )),
            totalPrice: r.totalPrice,
            paidPrice: r.paidPrice,
            currency: r.currency,
            roomCount: r.roomCount,
            status: r.status,
            saleDate: r.lastUpdate.slice(0, 10),
            nationality: r.nationality, // Added
        }))

        comparisonReservations = rawComp.map(r => ({
            id: r.id,
            totalPrice: r.totalPrice,
            currency: r.currency,
            saleDate: r.lastUpdate.slice(0, 10),
            checkIn: r.checkIn.slice(0, 10),
            nights: Math.max(1, Math.ceil(
                (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 86400000
            )),
            roomCount: r.roomCount,
            nationality: r.nationality,
        }))

        lastUpdated = new Date().toISOString()

    } catch (err) {
        console.error('[Reports] Error fetching:', err)
        error = 'Veri yüklenirken hata oluştu'
    }

    return <ReportsClient reservations={reservations} comparisonReservations={comparisonReservations} error={error} lastUpdated={lastUpdated} locale={locale} />
}
