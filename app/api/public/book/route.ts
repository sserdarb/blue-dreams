import { NextResponse } from 'next/server'
import { BookingService, BookingRequest } from '@/lib/services/booking-service'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { roomTypeId, roomType, checkIn, checkOut, adults, children, guestName, guestEmail, guestPhone, notes, totalPrice, currency } = body

        // Validate required fields
        if (!roomType || !checkIn || !checkOut || !guestName || !guestPhone) {
            return NextResponse.json(
                { success: false, message: 'Lütfen tüm zorunlu alanları doldurun.' },
                { status: 400 }
            )
        }

        // Submit via BookingService
        const bookingRequest: BookingRequest = {
            roomTypeId: roomTypeId || 0,
            roomType,
            checkIn,
            checkOut,
            adults: adults || 2,
            children: children || 0,
            guestName,
            guestEmail: guestEmail || '',
            guestPhone,
            notes: notes || '',
            totalPrice: totalPrice || 0,
            currency: currency || 'TRY'
        }

        const result = await BookingService.submitBookingRequest(bookingRequest)

        return NextResponse.json(result)
    } catch (error) {
        console.error('[Book API] Error:', error)
        return NextResponse.json(
            { success: false, message: 'Rezervasyon talebi gönderilemedi. Lütfen tekrar deneyin.' },
            { status: 500 }
        )
    }
}
