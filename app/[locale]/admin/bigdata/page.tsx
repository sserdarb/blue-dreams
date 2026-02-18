import { BigDataService } from '@/lib/services/bigdata'
import BigDataClient from './BigDataClient'

export const dynamic = 'force-dynamic'

export default async function BigDataPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    let data: any = null
    let error: string | null = null

    try {
        const { ElektraService } = await import('@/lib/services/elektra')
        const now = new Date()
        const year = now.getFullYear()

        // Parallel fetch all data sources
        const [currentReservations, prevYearReservations, occupancy, rates] = await Promise.all([
            ElektraService.getAllSeasonReservations().catch(() => []),
            ElektraService.getReservationsByBookingDate(
                new Date(year - 2, 10, 1), new Date(year - 1, 11, 31)
            ).catch(() => []),
            ElektraService.getOccupancy(
                new Date(year, 0, 1), new Date(year, 11, 31)
            ).catch(() => []),
            ElektraService.getExchangeRates().catch(() => ({ EUR_TO_TRY: 38.5, USD_TO_TRY: 35.7, fetchedAt: 0 })),
        ])

        // Serialize reservation data for client (strip unnecessary fields)
        const reservations = currentReservations.map((r: any) => ({
            id: r.id,
            voucherNo: r.voucherNo,
            agency: r.agency,
            channel: r.channel,
            boardType: r.boardType,
            roomType: r.roomType,
            rateType: r.rateType,
            checkIn: r.checkIn?.slice(0, 10) || '',
            checkOut: r.checkOut?.slice(0, 10) || '',
            totalPrice: r.totalPrice,
            paidPrice: r.paidPrice,
            currency: r.currency,
            roomCount: r.roomCount,
            nationality: r.nationality,
            nights: r.nights,
            dailyAverage: r.dailyAverage,
            lastUpdate: r.lastUpdate?.slice(0, 10) || '',
            reservationDate: r.reservationDate?.slice(0, 10) || '',
            status: r.status,
        }))

        const prevReservations = prevYearReservations.map((r: any) => ({
            id: r.id,
            voucherNo: r.voucherNo || '',
            agency: r.agency,
            channel: r.channel,
            boardType: r.boardType,
            roomType: r.roomType,
            rateType: r.rateType || '',
            checkIn: r.checkIn?.slice(0, 10) || '',
            checkOut: r.checkOut?.slice(0, 10) || '',
            totalPrice: r.totalPrice,
            paidPrice: r.paidPrice,
            currency: r.currency,
            roomCount: r.roomCount,
            nationality: r.nationality,
            nights: r.nights || 1,
            dailyAverage: r.dailyAverage || 0,
            lastUpdate: r.lastUpdate?.slice(0, 10) || '',
            reservationDate: r.reservationDate?.slice(0, 10) || '',
            status: r.status,
        }))

        const occData = occupancy.map((o: any) => ({
            date: o.date,
            totalRooms: o.totalRooms,
            availableRooms: o.availableRooms,
            occupiedRooms: o.occupiedRooms,
            occupancyRate: o.occupancyRate,
        }))

        data = {
            reservations,
            prevReservations,
            occupancy: occData,
            rates,
            lastUpdated: new Date().toISOString(),
        }
    } catch (err) {
        console.error('[BigData] Error:', err)
        error = 'Veri yüklenirken hata oluştu'
    }

    return <BigDataClient data={data} error={error} locale={locale} />
}
