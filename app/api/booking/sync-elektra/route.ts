export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ElektraService } from '@/lib/services/elektra'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { bookingId } = body

        if (!bookingId) {
            return NextResponse.json({ success: false, error: 'Booking ID required' }, { status: 400 })
        }

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) {
            return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 })
        }

        // Only sync if payment was successful and not already synced
        if (booking.status !== 'paid' || booking.elektraStatus === 'synced') {
            return NextResponse.json({ success: false, error: 'Geçersiz durum veya zaten senkronize edildi' }, { status: 400 })
        }

        // Call Elektra API
        const elektraRes = await ElektraService.createReservation({
            referenceId: booking.referenceId,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            roomType: booking.roomType,
            roomTypeId: booking.roomTypeId,
            nights: booking.nights,
            adults: booking.adults,
            children: booking.children,
            childAges: booking.childAges,
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            guestPhone: booking.guestPhone,
            guestNotes: `Online Tahsilat: ${booking.paymentMethod} - ${booking.totalPrice} TRY`,
            totalPrice: booking.totalPrice,
            currency: booking.currency,
            paidAmount: booking.totalPrice // Full amount since status is paid
        })

        if (elektraRes.success && elektraRes.pmsId) {
            // Update booking with PMS ID
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    elektraResId: elektraRes.pmsId,
                    elektraStatus: 'synced',
                }
            })
            return NextResponse.json({ success: true, pmsId: elektraRes.pmsId })
        } else {
            console.error('[Sync Elektra] Failed:', elektraRes.errorMessage)
            await prisma.booking.update({
                where: { id: bookingId },
                data: { elektraStatus: 'failed' }
            })
            return NextResponse.json({ success: false, error: elektraRes.errorMessage }, { status: 500 })
        }

    } catch (error: any) {
        console.error('[Sync Elektra] Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
