import { ElektraService } from '@/lib/services/elektra'
import ReservationsClient from './ReservationsClient'

export default async function ReservationsPage() {
    const today = new Date()
    const thirtyAgo = new Date(today)
    thirtyAgo.setDate(today.getDate() - 30)

    let initialData: any[] = []
    let error: string | null = null

    try {
        const reservations = await ElektraService.getReservationsByBookingDate(thirtyAgo, today)

        initialData = reservations
            .sort((a, b) => b.lastUpdate.localeCompare(a.lastUpdate))
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
                saleDate: r.lastUpdate.slice(0, 10),
                lastUpdate: r.lastUpdate,
                nationality: r.nationality, // Added
                dailyAverage: r.dailyAverage, // Added
            }))
    } catch (err) {
        console.error('[Reservations] Error fetching:', err)
        error = 'Veri yüklenirken hata oluştu'
    }

    return <ReservationsClient initialData={initialData} error={error} />
}
