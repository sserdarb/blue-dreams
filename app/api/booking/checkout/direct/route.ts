import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PaymentRouter } from '@/lib/services/payment-router'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { checkIn, checkOut, roomType, roomTypeId, adults, children, currency, totalPrice,
            guestName, guestSurname, guestEmail, guestPhone, guestNationality, specialRequests, cardInfo } = body

        if (!checkIn || !checkOut || !roomType || !guestName || !guestEmail || !guestPhone || !cardInfo) {
            return NextResponse.json({ success: false, error: 'Eksik bilgi' }, { status: 400 })
        }

        const isForeign = guestNationality !== 'TR' || cardInfo.installment === 1

        // Booking Pending Creation
        const referenceId = `BDR-${Date.now().toString(36).toUpperCase()}`
        const booking = await prisma.booking.create({
            data: {
                referenceId,
                status: 'pending',
                guestName: `${guestName} ${guestSurname}`,
                guestEmail,
                guestPhone,
                guestNotes: specialRequests,
                roomTypeId: roomTypeId || 0,
                roomType,
                checkIn: new Date(checkIn),
                checkOut: new Date(checkOut),
                nights: Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)),
                adults,
                children: children || 0,
                totalPrice,
                currency: currency || 'TRY',
                installments: cardInfo.installment || 1
            }
        })

        // Route Payment
        const provider = await PaymentRouter.selectProvider(cardInfo.cardNumber.substring(0, 6), cardInfo.installment, isForeign)

        if (!provider) {
            return NextResponse.json({ success: false, error: 'Uygun sanal POS bulunamadı veya kapalı.' }, { status: 400 })
        }

        // Update booking with the selected provider
        await prisma.booking.update({
            where: { id: booking.id },
            data: { paymentMethod: provider.provider }
        })

        // Initialize 3D Secure Form
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const callbackUrl = `${baseUrl}/api/booking/vpos-callback/${provider.provider}`

        const htmlContent = PaymentRouter.generate3DForm(provider, totalPrice, booking.id, cardInfo, callbackUrl)

        // Log initializing payment
        await prisma.paymentLog.create({
            data: {
                bookingId: booking.id,
                provider: provider.provider,
                action: 'init_3d',
                status: '3d_redirect',
                amount: totalPrice,
                currency: currency || 'TRY',
            }
        })

        return NextResponse.json({ success: true, htmlContent, reservationId: booking.id })

    } catch (err: any) {
        console.error('[Direct Checkout API] Error:', err)
        return NextResponse.json({ success: false, error: 'Sistem hatası: ' + err.message }, { status: 500 })
    }
}
