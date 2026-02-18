import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

// Public API — no auth required
// Caches for 5 min via Elektra's built-in revalidate
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const currency = searchParams.get('currency') || 'EUR'

    // Default: next 3 days starting from tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const fromDate = from ? new Date(from) : tomorrow

    const defaultTo = new Date(fromDate)
    defaultTo.setDate(defaultTo.getDate() + 3)
    const toDate = to ? new Date(to) : defaultTo

    try {
        const availability = await ElektraService.getAvailability(fromDate, toDate, currency)

        // Group by room type and compute summary pricing
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
            const validPrices = data.dates.filter(d => (d.discountedPrice || d.basePrice) && !d.stopsell)
            const prices = validPrices.map(d => d.discountedPrice || d.basePrice || 0)
            const basePrices = validPrices.map(d => d.basePrice || 0)
            const minPrice = prices.length > 0 ? Math.round(Math.min(...prices)) : null
            const avgPrice = prices.length > 0 ? Math.round(prices.reduce((s, p) => s + p, 0) / prices.length) : null
            const maxBasePrice = basePrices.length > 0 ? Math.round(Math.max(...basePrices)) : null
            const totalAvailable = data.dates.reduce((s, d) => s + d.available, 0)
            const hasDiscount = validPrices.some(d => d.discountedPrice && d.basePrice && d.discountedPrice < d.basePrice)

            return {
                name,
                roomTypeId: data.roomTypeId,
                minPrice,
                avgPrice,
                maxBasePrice,
                hasDiscount,
                available: totalAvailable > 0,
                currency,
            }
        })

        return NextResponse.json({
            rooms,
            period: {
                from: fromDate.toISOString().split('T')[0],
                to: toDate.toISOString().split('T')[0],
            },
            currency,
            source: 'elektra',
        })
    } catch (err) {
        console.error('[Public Pricing API] Error:', err)
        return NextResponse.json({ error: 'Pricing unavailable', rooms: [] }, { status: 500 })
    }
}
