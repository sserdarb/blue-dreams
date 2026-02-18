import { NextRequest, NextResponse } from 'next/server'
import { BookingService } from '@/lib/services/booking-service'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)

    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const adults = parseInt(searchParams.get('adults') || '2', 10)
    const children = parseInt(searchParams.get('children') || '0', 10)
    const currency = searchParams.get('currency') || 'TRY'

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
        const availability = await BookingService.getAvailability(checkIn, checkOut, adults, children, currency)
        return NextResponse.json({
            checkIn,
            checkOut,
            nights: Math.ceil((coDate.getTime() - ciDate.getTime()) / (1000 * 60 * 60 * 24)),
            adults,
            children,
            currency,
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
