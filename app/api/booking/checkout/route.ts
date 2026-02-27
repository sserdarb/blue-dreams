export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { IyzicoService } from '@/lib/services/payment-iyzico'
import { PayTRService } from '@/lib/services/payment-paytr'

// Determine primary provider from env or default to iyzico
const PRIMARY_PROVIDER = process.env.PRIMARY_PAYMENT_PROVIDER || 'iyzico'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { roomTypeId, roomType, checkIn, checkOut, nights, adults, children, childAges, guestName, guestEmail, guestPhone, guestNotes, totalPrice, currency } = body

        // 1. Create a Pending Booking Record
        const referenceId = `BDR-${Date.now().toString(36).toUpperCase()}`

        // Simple stringification for childAges if exists
        const childAgesStr = childAges && childAges.length > 0 ? JSON.stringify(childAges) : null

        const booking = await prisma.booking.create({
            data: {
                referenceId,
                status: 'pending',
                guestName,
                guestEmail,
                guestPhone,
                guestNotes,
                roomTypeId,
                roomType,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                nights,
                adults,
                children,
                childAges: childAgesStr,
                totalPrice,
                currency: currency || 'TRY',
            }
        })

        // Read Client IP
        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

        // 2. Initialize Payment with Provider
        if (PRIMARY_PROVIDER === 'paytr') {
            const paytrResponse = await PayTRService.getIframeToken({
                bookingId: booking.id,
                price: totalPrice,
                guestName,
                guestEmail,
                guestPhone,
                clientIp: clientIp.split(',')[0].trim(),
                basketItems: [[roomType, (totalPrice).toString(), 1]]
            })

            if (paytrResponse.success) {
                // Update booking with provider
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { paymentMethod: 'paytr' }
                })
                return NextResponse.json({ success: true, provider: 'paytr', token: paytrResponse.token, referenceId })
            } else {
                return NextResponse.json({ success: false, error: paytrResponse.errorMessage }, { status: 400 })
            }
        } else {
            // Default: iyzico
            const guestNameParts = guestName.split(' ')
            const iyzicoResponse = await IyzicoService.initializeCheckoutForm({
                bookingId: booking.id,
                price: totalPrice,
                guestName: guestName,
                guestSurname: guestNameParts.length > 1 ? guestNameParts[guestNameParts.length - 1] : 'Misafir',
                guestEmail: guestEmail,
                guestPhone: guestPhone,
                clientIp: clientIp.split(',')[0].trim()
            })

            if (iyzicoResponse.success) {
                // Update booking with provider and paymentId
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { paymentMethod: 'iyzico', paymentId: iyzicoResponse.paymentId }
                })
                return NextResponse.json({ success: true, provider: 'iyzico', htmlContent: iyzicoResponse.htmlContent, referenceId })
            } else {
                return NextResponse.json({ success: false, error: iyzicoResponse.errorMessage }, { status: 400 })
            }
        }

    } catch (error: any) {
        console.error('[Checkout Route] Error:', error)
        return NextResponse.json({ success: false, error: 'Sunucu hatası: ' + error.message }, { status: 500 })
    }
}
