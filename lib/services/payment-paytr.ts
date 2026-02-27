import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export interface PayTRRequestData {
    bookingId: string
    price: number
    guestName: string
    guestEmail: string
    guestPhone: string
    clientIp: string
    basketItems: [string, string, number][] // [Item Name, Price, Quantity]
}

export class PayTRService {
    private static merchantId = process.env.PAYTR_MERCHANT_ID || 'sandbox_merchant_id'
    private static merchantKey = process.env.PAYTR_MERCHANT_KEY || 'sandbox_merchant_key'
    private static merchantSalt = process.env.PAYTR_MERCHANT_SALT || 'sandbox_merchant_salt'

    /**
     * Get a token for the PayTR iframe
     */
    static async getIframeToken(data: PayTRRequestData): Promise<{ success: boolean; token?: string; errorMessage?: string }> {
        try {
            const user_ip = data.clientIp
            const merchant_oid = data.bookingId // Must be unique
            const email = data.guestEmail
            const payment_amount = Math.round(data.price * 100) // Kuruş cinsinden (e.g. 1000.50 -> 100050)
            const user_basket = JSON.stringify(data.basketItems)
            const no_installment = 0 // Taksit yapılabilsin
            const max_installment = 12
            const currency = "TL"
            const test_mode = process.env.PAYMENT_MODE === 'sandbox' ? 1 : 0
            const user_name = data.guestName
            const user_address = "Blue Dreams Resort, Torba, Bodrum, Muğla"
            const user_phone = data.guestPhone.startsWith('+') ? data.guestPhone : `+90${data.guestPhone}`
            const merchant_ok_url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://new.bluedreamsresort.com'}/booking/success?ref=${merchant_oid}`
            const merchant_fail_url = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://new.bluedreamsresort.com'}/booking/failed?ref=${merchant_oid}`

            const timeout_limit = 30
            const debug_on = 0

            // Generate PayTR Hash
            const hash_str = `${this.merchantId}${user_ip}${merchant_oid}${email}${payment_amount}${user_basket}${no_installment}${max_installment}${currency}${test_mode}`
            const target_str = `${hash_str}${this.merchantSalt}`
            const paytr_token = crypto.createHmac('sha256', this.merchantKey).update(target_str).digest('base64')

            const postData = new URLSearchParams()
            postData.append('merchant_id', this.merchantId)
            postData.append('user_ip', user_ip)
            postData.append('merchant_oid', merchant_oid)
            postData.append('email', email)
            postData.append('payment_amount', payment_amount.toString())
            postData.append('paytr_token', paytr_token)
            postData.append('user_basket', user_basket)
            postData.append('debug_on', debug_on.toString())
            postData.append('no_installment', no_installment.toString())
            postData.append('max_installment', max_installment.toString())
            postData.append('user_name', user_name)
            postData.append('user_address', user_address)
            postData.append('user_phone', user_phone)
            postData.append('merchant_ok_url', merchant_ok_url)
            postData.append('merchant_fail_url', merchant_fail_url)
            postData.append('timeout_limit', timeout_limit.toString())
            postData.append('currency', currency)
            postData.append('test_mode', test_mode.toString())

            // Request token from PayTR
            const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: postData
            })

            const result: any = await response.json()

            if (result.status === 'success') {
                // Log pending attempt
                await prisma.paymentLog.create({
                    data: {
                        bookingId: data.bookingId,
                        provider: 'paytr',
                        action: 'init',
                        status: 'pending',
                        amount: data.price,
                        currency: 'TRY',
                        requestData: JSON.stringify(Object.fromEntries(postData)),
                        responseData: JSON.stringify(result),
                        ipAddress: data.clientIp
                    }
                })
                return { success: true, token: result.token }
            } else {
                console.error('[PayTR] Token Error:', result)
                // Log failed attempt
                await prisma.paymentLog.create({
                    data: {
                        bookingId: data.bookingId,
                        provider: 'paytr',
                        action: 'init',
                        status: 'failed',
                        amount: data.price,
                        currency: 'TRY',
                        requestData: JSON.stringify(Object.fromEntries(postData)),
                        responseData: JSON.stringify(result),
                        errorMessage: result.reason,
                        ipAddress: data.clientIp
                    }
                })
                return { success: false, errorMessage: result.reason || 'PayTR hata döndü.' }
            }

        } catch (error: any) {
            console.error('[PayTR] Service Error:', error)
            return { success: false, errorMessage: error.message }
        }
    }

    /**
     * Validate the webhook callback received from PayTR
     */
    static validateCallback(postData: any): boolean {
        try {
            const hash_str = `${postData.merchant_oid}${this.merchantSalt}${postData.status}${postData.total_amount}`
            const hash = crypto.createHmac('sha256', this.merchantKey).update(hash_str).digest('base64')
            return hash === postData.hash
        } catch (error) {
            return false
        }
    }
}
