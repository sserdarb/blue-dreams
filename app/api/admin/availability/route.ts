import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const currency = searchParams.get('currency') || 'TRY'

    if (!from || !to) {
        return NextResponse.json({ error: 'from and to are required' }, { status: 400 })
    }

    try {
        const fromDate = new Date(from)
        const toDate = new Date(to)
        const availability = await ElektraService.getAvailability(fromDate, toDate, currency)

        // Group by room type
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

        const rooms = Array.from(byRoom.entries()).map(([name, data]) => {
            const avgPrice = data.dates.reduce((s, d) => s + (d.discountedPrice || d.basePrice || 0), 0) / Math.max(data.dates.length, 1)
            const minPrice = Math.min(...data.dates.filter(d => d.basePrice).map(d => d.discountedPrice || d.basePrice || 999999))
            return {
                name,
                roomTypeId: data.roomTypeId,
                avgPrice: Math.round(avgPrice),
                minPrice: minPrice === 999999 ? null : Math.round(minPrice),
                dates: data.dates,
            }
        })

        return NextResponse.json(rooms)
    } catch (err) {
        console.error('[Availability API] Error:', err)
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
    }
}
