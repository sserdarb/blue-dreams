import { NextResponse } from 'next/server'
import { ElektraCache } from '@/lib/services/elektra-cache'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    // Region detection via standard headers
    const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || request.headers.get('x-country-code') || 'TR'
    const isTR = country.toUpperCase() === 'TR'

    // Fetch site settings for correct contracts dynamically
    const siteSettings = await prisma.siteSettings.findFirst()
    const agencyName = isTR
        ? (siteSettings?.bookingContractTR || 'CALL CENTER TL')
        : (siteSettings?.bookingContractWorld || 'CALL CENTER EUR')
    const currency = searchParams.get('currency') || (isTR ? 'TRY' : 'EUR')

    if (!from || !to) {
        return NextResponse.json({ error: 'from and to are required' }, { status: 400 })
    }

    try {
        const fromDate = new Date(from)
        const toDate = new Date(to)
        const availability = await ElektraCache.getAvailability(fromDate, toDate, currency, agencyName)

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
