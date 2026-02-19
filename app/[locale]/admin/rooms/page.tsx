export const dynamic = 'force-dynamic'

import { ElektraService } from '@/lib/services/elektra'
import RoomsClient from './RoomsClient'

export default async function RoomsPage() {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 30) // 30 days for initial timeline

    let roomData: any[] = []
    let error: string | null = null

    try {
        const availability = await ElektraService.getAvailability(today, endDate, 'TRY')

        // Group by room type — aggregate across dates
        const byRoom = new Map<string, {
            roomTypeId: number
            dates: { date: string; available: number; basePrice: number | null; discountedPrice: number | null; stopsell: boolean }[]
        }>()

        for (const item of availability) {
            if (!byRoom.has(item.roomType)) {
                byRoom.set(item.roomType, { roomTypeId: item.roomTypeId, dates: [] })
            }
            byRoom.get(item.roomType)!.dates.push({
                date: item.date,
                available: item.availableCount,
                basePrice: item.basePrice,
                discountedPrice: item.discountedPrice,
                stopsell: item.stopsell,
            })
        }

        roomData = Array.from(byRoom.entries()).map(([name, data]) => {
            const avgPrice = data.dates.reduce((s, d) => s + (d.discountedPrice || d.basePrice || 0), 0) / Math.max(data.dates.length, 1)
            const minPrice = Math.min(...data.dates.filter(d => d.basePrice).map(d => d.discountedPrice || d.basePrice || 999999))
            return {
                name,
                roomTypeId: data.roomTypeId,
                avgPrice: Math.round(avgPrice),
                minPrice: minPrice === 999999 ? null : Math.round(minPrice),
                dates: data.dates,
            }
        }).sort((a, b) => (b.avgPrice || 0) - (a.avgPrice || 0))

    } catch (err) {
        console.error('[Rooms] Error fetching:', err)
        error = 'Oda verileri yüklenirken hata oluştu'
    }

    return <RoomsClient initialRooms={roomData} error={error} />
}
