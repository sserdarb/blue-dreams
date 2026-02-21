import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/services/booking-service'

/**
 * GET /api/booking/calendar?month=2026-06&adults=2&children=0
 * Returns daily pricing and availability for a 42-day window (6 calendar weeks)
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // YYYY-MM
    const adults = parseInt(searchParams.get('adults') || '2', 10)
    const children = parseInt(searchParams.get('children') || '0', 10)

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json({ error: 'month is required (YYYY-MM format)' }, { status: 400 })
    }

    try {
        const [year, mo] = month.split('-').map(Number)
        const firstDay = new Date(year, mo - 1, 1)
        const lastDay = new Date(year, mo, 0)

        // Fetch availability for each day of the month (check single-night stays)
        const days: Array<{
            date: string
            available: boolean
            roomTypes: Array<{
                roomType: string
                roomTypeId: number
                price: number
                priceEur: number
                isAvailable: boolean
            }>
            minPrice: number
            minPriceEur: number
            totalAvailable: number
            hasDiscount: boolean
        }> = []

        // We query availability for every day of the month — 1-night stays
        const promises = []
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const dateStr = `${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const nextDate = new Date(year, mo - 1, d + 1)
            const nextDateStr = nextDate.toISOString().split('T')[0]
            promises.push(
                BookingService.getAvailability(dateStr, nextDateStr, adults, children, 'TRY')
                    .then(rooms => ({ date: dateStr, rooms }))
                    .catch(() => ({ date: dateStr, rooms: [] as any[] }))
            )
        }

        const results = await Promise.all(promises)

        // Find average price to determine discount threshold
        const allPrices = results.flatMap(r =>
            (r.rooms || []).filter((rm: any) => rm.isAvailable).map((rm: any) => rm.avgPricePerNight || rm.minPrice || 0)
        ).filter(p => p > 0)
        const avgPrice = allPrices.length > 0 ? allPrices.reduce((a: number, b: number) => a + b, 0) / allPrices.length : 0
        const discountThreshold = avgPrice * 0.85 // 15% below average = discount

        for (const result of results) {
            const rooms = (result.rooms || []).map((rm: any) => ({
                roomType: rm.roomType,
                roomTypeId: rm.roomTypeId,
                price: rm.avgPricePerNight || rm.minPrice || 0,
                priceEur: rm.avgPricePerNightEur || rm.minPriceEur || 0,
                isAvailable: rm.isAvailable,
            }))

            const availableRooms = rooms.filter((r: any) => r.isAvailable)
            const minPrice = availableRooms.length > 0 ? Math.min(...availableRooms.map((r: any) => r.price)) : 0
            const minPriceEur = availableRooms.length > 0 ? Math.min(...availableRooms.map((r: any) => r.priceEur)) : 0

            days.push({
                date: result.date,
                available: availableRooms.length > 0,
                roomTypes: rooms,
                minPrice,
                minPriceEur,
                totalAvailable: availableRooms.length,
                hasDiscount: minPrice > 0 && minPrice < discountThreshold,
            })
        }

        return NextResponse.json({
            month,
            adults,
            children,
            days,
            avgPrice: Math.round(avgPrice),
        })
    } catch (error) {
        console.error('[API] Calendar error:', error)
        return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 })
    }
}
