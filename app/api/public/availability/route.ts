import { NextResponse } from 'next/server'
import { BookingService } from '@/lib/services/booking-service'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const checkIn = searchParams.get('checkIn')
        const checkOut = searchParams.get('checkOut')
        const adults = parseInt(searchParams.get('adults') || '2')
        const children = parseInt(searchParams.get('children') || '0')

        if (!checkIn || !checkOut) {
            return NextResponse.json(
                { error: 'checkIn and checkOut are required' },
                { status: 400 }
            )
        }

        // Main availability
        const availability = await BookingService.getAvailability(
            checkIn, checkOut, adults, children
        )

        // Alternative dates: check ±1, ±2, ±3 day shifts
        const alternatives = []
        const baseDate = new Date(checkIn)
        const nights = Math.round(
            (new Date(checkOut).getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        for (const shift of [-3, -2, -1, 1, 2, 3]) {
            const altCheckIn = new Date(baseDate)
            altCheckIn.setDate(altCheckIn.getDate() + shift)

            // Skip past dates
            if (altCheckIn < new Date()) continue

            const altCheckOut = new Date(altCheckIn)
            altCheckOut.setDate(altCheckOut.getDate() + nights)

            const altCheckInStr = altCheckIn.toISOString().split('T')[0]
            const altCheckOutStr = altCheckOut.toISOString().split('T')[0]

            try {
                const altAvailability = await BookingService.getAvailability(
                    altCheckInStr, altCheckOutStr, adults, children
                )

                // Find the cheapest available room
                const cheapest = altAvailability
                    .filter(r => r.isAvailable)
                    .sort((a, b) => a.totalPrice - b.totalPrice)[0]

                if (cheapest) {
                    alternatives.push({
                        checkIn: altCheckInStr,
                        checkOut: altCheckOutStr,
                        nights,
                        shift,
                        cheapestRoom: cheapest.roomType,
                        totalPrice: Math.round(cheapest.totalPrice),
                        totalPriceEur: Math.round(cheapest.totalPriceEur),
                        avgPerNight: Math.round(cheapest.avgPricePerNight),
                        avgPerNightEur: Math.round(cheapest.avgPricePerNightEur),
                    })
                }
            } catch {
                // Skip failed alternative queries
            }
        }

        // Find original cheapest for comparison
        const originalCheapest = availability
            .filter(r => r.isAvailable)
            .sort((a, b) => a.totalPrice - b.totalPrice)[0]

        const originalPrice = originalCheapest?.totalPrice || 0

        // Annotate alternatives with savings
        const annotatedAlternatives = alternatives.map(alt => ({
            ...alt,
            savings: originalPrice > 0
                ? Math.round(((originalPrice - alt.totalPrice) / originalPrice) * 100)
                : 0,
            savingsAmount: originalPrice > 0
                ? Math.round(originalPrice - alt.totalPrice)
                : 0,
        })).sort((a, b) => a.totalPrice - b.totalPrice)

        return NextResponse.json({
            availability,
            alternatives: annotatedAlternatives,
            meta: {
                checkIn, checkOut, adults, children, nights,
                originalCheapestPrice: originalPrice,
            }
        })
    } catch (error) {
        console.error('[PublicAvailability] Error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch availability', details: String(error) },
            { status: 500 }
        )
    }
}
