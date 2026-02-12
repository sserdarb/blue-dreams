import { ElektraService } from '@/lib/services/elektra'
import ReportsClient from './ReportsClient'

export default async function StatisticsPage() {
    const today = new Date()

    // Fetch reservations for the entire season
    let allReservations: any[] = []
    let error: string | null = null

    try {
        const rawReservations = await ElektraService.getAllSeasonReservations()

        allReservations = rawReservations.map(r => ({
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
    } catch (err) {
        console.error('[Reports] Error fetching data:', err)
        error = 'Rapor verileri yüklenirken hata oluştu'
    }

    return <ReportsClient reservations={allReservations} error={error} />
}
