import { NextResponse } from 'next/server'
import { fetchAvailability, fetchReservations, computeOccupancy } from '@/lib/services/elektra'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const fromDate = searchParams.get('from') || new Date().toISOString().slice(0, 10)
        const days = parseInt(searchParams.get('days') || '14', 10)
        const currency = searchParams.get('currency') || 'EUR'

        // Calculate toDate
        const from = new Date(fromDate)
        const to = new Date(from)
        to.setDate(to.getDate() + days)
        const toDate = to.toISOString().slice(0, 10)

        // Fetch availability (prices + rooms) from Elektra PMS
        const availability = await fetchAvailability(fromDate, toDate, currency)

        // Compute occupancy from availability data
        const occupancy = computeOccupancy(availability)

        // Fetch recent reservations (last 30 days check-ins)
        const resFrom = new Date()
        resFrom.setDate(resFrom.getDate() - 30)
        const reservations = await fetchReservations(
            resFrom.toISOString().slice(0, 10),
            toDate
        )

        // Channel breakdown from reservations
        const channelMap = new Map<string, { count: number; revenue: number }>()
        for (const res of reservations) {
            const ch = res.channel || 'Diğer'
            const existing = channelMap.get(ch) || { count: 0, revenue: 0 }
            existing.count++
            existing.revenue += res.totalPrice
            channelMap.set(ch, existing)
        }

        const channelBreakdown = Array.from(channelMap.entries())
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.revenue - a.revenue)

        // Group availability by date for the pricing calendar
        const priceCalendar: Record<string, any[]> = {}
        for (const item of availability) {
            if (!priceCalendar[item.date]) {
                priceCalendar[item.date] = []
            }
            priceCalendar[item.date].push({
                roomType: item.roomType,
                roomTypeId: item.roomTypeId,
                available: item.availableCount,
                basePrice: item.basePrice,
                discountedPrice: item.discountedPrice,
                stopsell: item.stopsell
            })
        }

        // Summary stats
        const totalReservations = reservations.length
        const totalRevenue = reservations.reduce((sum, r) => sum + r.totalPrice, 0)
        const averageADR = totalReservations > 0
            ? reservations.reduce((sum, r) => sum + r.dailyAverage, 0) / totalReservations
            : 0

        return NextResponse.json({
            success: true,
            data: {
                priceCalendar,
                occupancy,
                channelBreakdown,
                reservations: reservations.slice(0, 50), // Last 50
                summary: {
                    totalReservations,
                    totalRevenue,
                    averageADR,
                    currency,
                    dateRange: { from: fromDate, to: toDate }
                }
            }
        })
    } catch (error: any) {
        console.error('[Channel Manager API]', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch channel data' },
            { status: 500 }
        )
    }
}
