import { NextRequest, NextResponse } from 'next/server'
import { ElektraCache } from '@/lib/services/elektra-cache'

export const dynamic = 'force-dynamic'

/**
 * GET /api/booking/calendar?month=2026-06&currency=TRY
 * Returns daily pricing and availability — DB-first via ElektraCache
 */
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') // YYYY-MM
    const currency = searchParams.get('currency') || 'TRY'

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return NextResponse.json({ error: 'month is required (YYYY-MM format)' }, { status: 400 })
    }

    try {
        const [year, mo] = month.split('-').map(Number)

        // Fetch from 1st of the month to the last day of the month (+1 day to get full coverage)
        const firstDay = new Date(year, mo - 1, 1)
        const lastDay = new Date(year, mo, 1) // First day of next month is effectively the bounds

        // DB-first: read availability from cache
        const availability = await ElektraCache.getAvailability(firstDay, lastDay, currency)

        const dailyData = new Map<string, { minPrice: number, available: boolean, roomType: string }>()

        for (const item of availability) {
            const currentPrice = item.discountedPrice || item.basePrice || 0
            if (item.stopsell || item.availableCount <= 0 || currentPrice === 0) continue

            const existing = dailyData.get(item.date)
            if (!existing || currentPrice < existing.minPrice) {
                dailyData.set(item.date, {
                    minPrice: currentPrice,
                    available: true,
                    roomType: item.roomType
                })
            }
        }

        // Prepare response days
        const days = []
        let sumPrice = 0
        let count = 0

        const daysInMonth = new Date(year, mo, 0).getDate()

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
            const dayInfo = dailyData.get(dateStr)

            if (dayInfo) {
                sumPrice += dayInfo.minPrice
                count++
                days.push({
                    date: dateStr,
                    available: true,
                    minPrice: dayInfo.minPrice,
                    cheapestRoom: dayInfo.roomType
                })
            } else {
                days.push({
                    date: dateStr,
                    available: false,
                    minPrice: 0,
                    cheapestRoom: ''
                })
            }
        }

        const avgPrice = count > 0 ? sumPrice / count : 0
        const discountThreshold = avgPrice * 0.90 // 10% below average is considered a discount

        for (const day of days) {
            (day as any).hasDiscount = day.minPrice > 0 && day.minPrice < discountThreshold
        }

        return NextResponse.json({
            month,
            days,
            avgPrice: Math.round(avgPrice),
            currency
        })
    } catch (error) {
        console.error('[API] Calendar error:', error)
        return NextResponse.json({ error: 'Failed to fetch calendar data' }, { status: 500 })
    }
}
