import { ElektraService } from '@/lib/services/elektra'
import ReservationsClient from './ReservationsClient'

export default async function ReservationsPage({ searchParams }: { searchParams: Promise<{ bookingStart?: string, bookingEnd?: string, compareYear?: string }> }) {
    const params = await searchParams
    const today = new Date()

    // Default range for booking date: Last 30 days
    const defaultStart = new Date(today)
    defaultStart.setDate(today.getDate() - 30)

    const bookingStartStr = params.bookingStart
    const bookingEndStr = params.bookingEnd
    const compareYearStr = params.compareYear

    const bookingStart = bookingStartStr ? new Date(bookingStartStr) : defaultStart
    const bookingEnd = bookingEndStr ? new Date(bookingEndStr) : today

    let initialData: any[] = []
    let comparisonData: any[] = []
    let comparisonMode: 'pace' | 'aggregate' = 'aggregate'
    let error: string | null = null

    try {
        // Use getReservationsByBookingDateForYear for current year
        // This fetches the full year's check-in range, then filters by reservationDate
        // → removes the 1-month limit that getAllSeasonReservations imposed
        const currentYear = bookingStart.getFullYear()
        const reservations = await ElektraService.getReservationsByBookingDateForYear(bookingStart, bookingEnd, currentYear)

        initialData = reservations
            .sort((a, b) => b.reservationDate.localeCompare(a.reservationDate))
            .map(r => ({
                id: r.id,
                voucherNo: r.voucherNo,
                guestName: r.guests.length > 0
                    ? `${r.guests[0].name} ${r.guests[0].surname}`
                    : r.contactName || 'N/A',
                contactEmail: r.contactEmail,
                contactPhone: r.contactPhone,
                agency: r.agency,
                channel: r.channel,
                roomType: r.roomType,
                boardType: r.boardType,
                rateType: r.rateType,
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
                lastUpdate: r.lastUpdate,
                nationality: r.nationality,
                dailyAverage: r.dailyAverage,
            }))

        // ─── YoY Comparison — 364-Day Weekday-Aligned ───
        if (compareYearStr) {
            const y = parseInt(compareYearStr)
            if (!isNaN(y)) {
                // 364-day (52 weeks) shift for weekday alignment
                const compStart = new Date(bookingStart)
                compStart.setDate(compStart.getDate() - 364)
                const compEnd = new Date(bookingEnd)
                compEnd.setDate(compEnd.getDate() - 364)

                console.log(`[YoY] 364-day shift: ${compStart.toISOString().split('T')[0]} → ${compEnd.toISOString().split('T')[0]} (year ${y})`)
                const compReservations = await ElektraService.getReservationsByBookingDateForYear(compStart, compEnd, y)
                console.log(`[YoY] Found ${compReservations.length} reservations for comparison`)

                comparisonMode = compReservations.length > 0 ? 'pace' : 'aggregate'

                if (compReservations.length > 0) {
                    comparisonData = compReservations.map(r => ({
                        saleDate: r.reservationDate.slice(0, 10),
                        checkIn: r.checkIn.slice(0, 10),
                        totalPrice: r.totalPrice,
                        currency: r.currency,
                        channel: r.channel
                    }))
                } else {
                    // Fallback: aggregate — all check-ins for comparison year
                    console.log(`[YoY/Aggregate] Falling back to full check-in data for ${y}`)
                    const compSeasonStart = new Date(y, 0, 1)
                    const compSeasonEnd = new Date(y, 11, 31)
                    const fallbackRes = await ElektraService.getReservations(compSeasonStart, compSeasonEnd)
                    console.log(`[YoY/Aggregate] Found ${fallbackRes.length} reservations for ${y}`)

                    comparisonData = fallbackRes.map(r => ({
                        saleDate: r.reservationDate.slice(0, 10),
                        checkIn: r.checkIn.slice(0, 10),
                        totalPrice: r.totalPrice,
                        currency: r.currency,
                        channel: r.channel
                    }))
                }
            }
        }

    } catch (err) {
        console.error('[Reservations] Error fetching:', err)
        error = 'Veri yüklenirken hata oluştu'
    }

    const rates = await ElektraService.getExchangeRates()

    return (
        <ReservationsClient
            initialData={initialData}
            comparisonData={comparisonData}
            comparisonMode={comparisonMode}
            error={error}
            rates={rates}
            initialBookingStart={bookingStart.toISOString().slice(0, 10)}
            initialBookingEnd={bookingEnd.toISOString().slice(0, 10)}
            initialCompareYear={compareYearStr || ''}
        />
    )
}
