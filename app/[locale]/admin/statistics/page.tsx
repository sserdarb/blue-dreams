import ReportsClient from './ReportsClient'
import { getTaxSettings } from '@/app/actions/settings'

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
            saleDate: r.reservationDate.slice(0, 10),
            country: r.country,
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
    const [{ ElektraService }, taxRates] = await Promise.all([
        import('@/lib/services/elektra'),
        getTaxSettings(),
    ])

    let reservations: any[] = []
    let comparisonReservations: any[] = []
    let error: string | null = null
    let lastUpdated: string | null = null

    // Fetch live exchange rates and total rooms first
    const [rates, totalRooms] = await Promise.all([
        ElektraService.getExchangeRates().catch(() => ({ EUR_TO_TRY: 1, USD_TO_TRY: 1, fetchedAt: 0 })),
        ElektraService.getTotalRooms().catch(() => 341)
    ])
    const EUR_RATE_CURRENT = rates.EUR_TO_TRY || 1

    try {
        // Current Season (e.g., 2025)
        const raw = await ElektraService.getAllSeasonReservations()

        // EUR_RATE_CURRENT is fetched from API above
        reservations = raw.map(r => {
            const amountTry = r.currency === 'EUR' ? r.totalPrice * EUR_RATE_CURRENT : r.totalPrice
            const amountEur = r.currency === 'EUR' ? r.totalPrice : r.totalPrice / EUR_RATE_CURRENT
            return {
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
                saleDate: r.reservationDate.slice(0, 10),
                country: r.country,
                amountTry,
                amountEur,
            }
        })

        // Use minute-level timestamp to avoid hydration mismatch
        const now = new Date()
        now.setSeconds(0, 0)
        lastUpdated = now.toISOString()

    } catch (err) {
        console.error('[Reports] Error fetching current:', err)
        error = 'Veri yüklenirken hata oluştu'
    }

    // Previous Year for Pace Comparison — fetch reservations booked by this same calendar day last year
    // This gives us true OTB (On The Books) pace: "how many bookings were made by today last year"
    try {
        const today = new Date()
        const prevYear = today.getFullYear() - 1
        // Sales window: from earliest possible booking date to the same calendar day last year
        const salesFrom = new Date(prevYear - 1, 0, 1) // booking start (wide range to capture early bookings)
        const salesTo = new Date(prevYear, today.getMonth(), today.getDate()) // same calendar day last year
        const rawComp = await ElektraService.getReservationsByBookingDateForYear(salesFrom, salesTo, prevYear)

        // EUR_RATE_CURRENT is fetched from API above
        comparisonReservations = rawComp.map(r => {
            const amountTry = r.currency === 'EUR' ? r.totalPrice * EUR_RATE_CURRENT : r.totalPrice
            const amountEur = r.currency === 'EUR' ? r.totalPrice : r.totalPrice / EUR_RATE_CURRENT
            return {
                id: r.id,
                totalPrice: r.totalPrice,
                currency: r.currency,
                saleDate: r.reservationDate.slice(0, 10),
                checkIn: r.checkIn.slice(0, 10),
                nights: Math.max(1, Math.ceil(
                    (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 86400000
                )),
                roomCount: r.roomCount,
                country: r.country,
                amountTry,
                amountEur,
            }
        })
        console.log(`[Reports] Pace comparison: ${comparisonReservations.length} reservations from ${prevYear} booked by ${salesTo.toISOString().split('T')[0]}`)
    } catch (err) {
        console.error('[Reports] Error fetching comparison:', err)
    }

    return <ReportsClient reservations={reservations} comparisonReservations={comparisonReservations} error={error} lastUpdated={lastUpdated} locale={locale} taxRates={taxRates} eurRate={EUR_RATE_CURRENT} totalRooms={totalRooms} />
}
