import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/services/booking-service'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const adults = parseInt(searchParams.get('adults') || '2', 10)
    const children = parseInt(searchParams.get('children') || '0', 10)

    // Geolocation from Vercel / Cloudflare headers
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-vercel-ip-country') || 'TR'

    const requestedCurrency = searchParams.get('currency')
    const defaultCurrency = country === 'TR' ? 'TRY' : 'EUR'
    const currency = requestedCurrency || defaultCurrency

    if (!checkIn || !checkOut) {
        return NextResponse.json(
            { error: 'checkIn and checkOut are required (YYYY-MM-DD format)' },
            { status: 400 }
        )
    }

    // Validate dates
    const ciDate = new Date(checkIn)
    const coDate = new Date(checkOut)
    if (isNaN(ciDate.getTime()) || isNaN(coDate.getTime())) {
        return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
    }
    if (coDate <= ciDate) {
        return NextResponse.json({ error: 'checkOut must be after checkIn' }, { status: 400 })
    }

    try {
        const settings = await prisma.siteSettings.findFirst()
        const contractTR = settings?.bookingContractTR || 'CALL CENTER TL'
        const contractWorld = settings?.bookingContractWorld || 'CALL CENTER EUR'

        const agency = country === 'TR' ? contractTR : contractWorld

        const availability = await BookingService.getAvailability(checkIn, checkOut, adults, children, currency, agency)
        return NextResponse.json({
            checkIn,
            checkOut,
            nights: Math.ceil((coDate.getTime() - ciDate.getTime()) / (1000 * 60 * 60 * 24)),
            adults,
            children,
            currency,
            country, // For debugging/frontend awareness
            agency,  // Exposing the selected contract
            roomTypes: availability
        })
    } catch (error) {
        console.error('[API] Availability error:', error)
        return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { roomTypeId, roomType, checkIn, checkOut, adults, children, guestName, guestEmail, guestPhone, notes, totalPrice, currency } = body

        if (!roomType || !checkIn || !checkOut || !guestName || !guestEmail || !guestPhone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const result = await BookingService.submitBookingRequest({
            roomTypeId,
            roomType,
            checkIn,
            checkOut,
            adults: adults || 2,
            children: children || 0,
            guestName,
            guestEmail,
            guestPhone,
            notes,
            totalPrice,
            currency: currency || 'TRY'
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('[API] Booking request error:', error)
        return NextResponse.json({ error: 'Failed to process booking request' }, { status: 500 })
    }
}
