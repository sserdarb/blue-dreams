export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { IyzicoService } from '@/lib/services/payment-iyzico'

// iyzico redirects via POST with a token
export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const token = formData.get('token') as string

        if (!token) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/booking/failed?error=MissingToken`)
        }

        // Add client IP logic or fallback
        const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

        // Retrieve payment result using the token
        const authData = await IyzicoService.retrieveCheckoutResult(token)

        if (authData.success && authData.result && authData.result.basketId) {
            const bookingId = authData.result.basketId
            const amount = parseFloat(authData.result.paidPrice)
            const installments = parseInt(authData.result.installment) || 1

            // Log successful payment
            await prisma.paymentLog.create({
                data: {
                    bookingId: bookingId,
                    provider: 'iyzico',
                    action: 'callback',
                    status: 'success',
                    amount: amount,
                    currency: authData.result.currency || 'TRY',
                    responseData: JSON.stringify(authData.result),
                    ipAddress: clientIp.split(',')[0].trim()
                }
            })

            // Update booking status
            const booking = await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'paid',
                    paidAt: new Date(),
                    installments,
                    paymentId: authData.result.paymentId || token
                }
            })

            // Trigger Elektra Reservation auto-creation (async, don't wait to rediect)
            fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/booking/sync-elektra`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id })
            }).catch(console.error) // Fire and forget 

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/booking/success?ref=${booking.referenceId}`)
        } else {
            const bookingId = authData.result?.basketId
            if (bookingId) {
                // Log failed attempt
                await prisma.paymentLog.create({
                    data: {
                        bookingId: bookingId,
                        provider: 'iyzico',
                        action: 'callback',
                        status: 'failed',
                        amount: 0,
                        currency: 'TRY',
                        responseData: JSON.stringify(authData.result),
                        errorMessage: authData.errorMessage,
                        ipAddress: clientIp.split(',')[0].trim()
                    }
                })

                await prisma.booking.update({
                    where: { id: bookingId },
                    data: { status: 'failed' }
                })
            }

            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/booking/failed?ref=${bookingId}&error=${encodeURIComponent(authData.errorMessage || 'Ödeme reddedildi')}`)
        }

    } catch (error: any) {
        console.error('[Iyzico Callback] Error:', error)
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/booking/failed?error=ServerError`)
    }
}
