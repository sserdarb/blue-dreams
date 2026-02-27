export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PayTRService } from '@/lib/services/payment-paytr'

// PayTR sends Webhook via POST form-data
export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const postData = Object.fromEntries(formData.entries())

        // 1. Verify Hash
        const isValid = PayTRService.validateCallback(postData)
        if (!isValid) {
            console.error('[PayTR Callback] Invalid hash signature')
            return new NextResponse('OK', { status: 200 }) // Return OK to prevent retries even if invalid
        }

        const bookingId = postData.merchant_oid as string
        const status = postData.status as string // 'success' or 'failed'
        const totalAmount = postData.total_amount as string // total amount with installments
        const failReason = postData.failed_reason_msg as string

        // Add client IP logic or fallback
        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

        // Wait to find booking
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId }
        })

        if (!booking) {
            console.error('[PayTR Callback] Booking not found:', bookingId)
            return new NextResponse('OK', { status: 200 })
        }

        if (status === 'success') {
            const amount = parseFloat(totalAmount) / 100 // Convert back to standard unit

            // Log successful payment
            await prisma.paymentLog.create({
                data: {
                    bookingId: bookingId,
                    provider: 'paytr',
                    action: 'callback',
                    status: 'success',
                    amount: amount,
                    currency: booking.currency || 'TRY',
                    responseData: JSON.stringify(postData),
                    ipAddress: clientIp.split(',')[0].trim()
                }
            })

            // Update booking status
            await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'paid',
                    paidAt: new Date(),
                    paymentId: postData.payment_amount as string // optional tracking info
                }
            })

            // Trigger Elektra Reservation
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/booking/sync-elektra`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId })
            }).catch(console.error)

            return new NextResponse('OK', { status: 200 })
        } else {
            // Failed payment
            await prisma.paymentLog.create({
                data: {
                    bookingId: bookingId,
                    provider: 'paytr',
                    action: 'callback',
                    status: 'failed',
                    amount: booking.totalPrice,
                    currency: booking.currency || 'TRY',
                    responseData: JSON.stringify(postData),
                    errorMessage: failReason,
                    ipAddress: clientIp.split(',')[0].trim()
                }
            })

            await prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'failed' }
            })

            return new NextResponse('OK', { status: 200 })
        }

    } catch (error: any) {
        console.error('[PayTR Callback] Error:', error)
        // MUST return OK to PayTR so they stop retrying
        return new NextResponse('OK', { status: 200 })
    }
}
