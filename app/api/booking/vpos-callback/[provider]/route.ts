import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ElektraService } from '@/lib/services/elektra'

export const dynamic = 'force-dynamic'

// Disabling CSRF check for this webhook
export async function POST(req: Request, { params }: { params: Promise<{ provider: string }> }) {
    try {
        const formData = await req.formData()
        const { provider } = await params

        let orderId = ''
        let status = 'failed'
        let errorMessage = ''
        let amount = 0
        let currency = 'TRY'

        if (provider === 'isbank' || provider === 'denizbank') {
            // EST 3D Secure Callback logic
            const mdStatus = formData.get('mdStatus') as string
            orderId = formData.get('oid') as string
            const responseHash = formData.get('HASH') as string
            const procReturnCode = formData.get('ProcReturnCode') as string
            amount = parseFloat(formData.get('amount') as string || '0')

            // mdStatus 1,2,3,4 means 3D authentication was successful.
            if (['1', '2', '3', '4'].includes(mdStatus)) {
                // In a real integration, here we would make an Authorization XML request to complete the payment
                // For this implementation, we assume successful auth if 3D passes for demonstration
                if (procReturnCode === '00' || !procReturnCode) {
                    status = 'success'
                } else {
                    errorMessage = (formData.get('ErrMsg') as string) || 'Banka reddetti.'
                }
            } else {
                errorMessage = '3D Secure doğrulama başarısız. (mdStatus: ' + mdStatus + ')'
            }
        }
        else if (provider === 'yapikredi') {
            // Posnet OOS / XML Callback
            orderId = formData.get('XID') as string || formData.get('oid') as string // Depends on exact Posnet config
            const posnetResponse = formData.get('HostMsg') as string || formData.get('mdStatus') as string

            // Assume success if HostMsg doesn't signify error
            if (posnetResponse && !posnetResponse.includes('ERROR')) {
                status = 'success'
            } else {
                errorMessage = 'Yapı Kredi 3D işlemi başarısız.'
            }
        }

        if (!orderId) {
            return NextResponse.json({ error: 'Rezervasyon numarası bulunamadı (oid)' }, { status: 400 })
        }

        const booking = await prisma.booking.findUnique({ where: { id: orderId } })
        if (!booking) {
            return NextResponse.json({ error: 'Rezervasyon bulunamadı' }, { status: 404 })
        }

        // Log payment result
        await prisma.paymentLog.create({
            data: {
                bookingId: orderId,
                provider: provider,
                action: 'auth_callback',
                status: status,
                amount: amount || booking.totalPrice,
                currency: currency || booking.currency,
                requestData: JSON.stringify(Object.fromEntries(formData)),
                errorMessage: errorMessage.substring(0, 200)
            }
        })

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

        if (status === 'success') {
            // Mark booking as paid
            await prisma.booking.update({
                where: { id: orderId },
                data: {
                    status: 'paid',
                    paidAt: new Date()
                }
            })

            // Push to Elektra PMS
            try {
                // Pass paidAmount to the service
                const elektraResult = await ElektraService.createReservation({
                    ...booking,
                    paidAmount: amount || booking.totalPrice
                })
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: {
                        elektraStatus: elektraResult.success ? 'synced' : 'failed',
                        elektraResId: elektraResult.pmsId || 'unknown'
                    }
                })
            } catch (err) {
                console.error('[Elektra Sync Error after POS]', err)
                await prisma.booking.update({
                    where: { id: booking.id },
                    data: { elektraStatus: 'failed' }
                })
            }

            return NextResponse.redirect(`${baseUrl}/tr/booking/success?status=success&ref=${booking.referenceId}`, 303)
        } else {
            // Failed
            return NextResponse.redirect(`${baseUrl}/tr/booking/failed?error=${encodeURIComponent(errorMessage)}`, 303)
        }
    } catch (err: any) {
        console.error('[VPOS Callback] System Error:', err)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        return NextResponse.redirect(`${baseUrl}/tr/booking/failed?error=${encodeURIComponent('Sistem hatası: ' + err.message)}`, 303)
    }
}
