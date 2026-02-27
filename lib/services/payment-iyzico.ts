import Iyzipay from 'iyzipay'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'
import { EncryptionUtils } from '@/lib/utils/encryption'

export interface PaymentRequestData {
    bookingId: string
    price: number
    guestName: string
    guestSurname: string
    guestEmail: string
    guestPhone: string
    identityNumber?: string
    clientIp: string
}

export class IyzicoService {

    private static async getProviderSettings() {
        const settings = await prisma.paymentSettings.findUnique({
            where: { provider: 'iyzico' }
        })

        if (!settings || !settings.isActive) {
            throw new Error("iyzico ödeme altyapısı aktif değil veya ayarları eksik.")
        }

        const apiKey = settings.apiKey ? EncryptionUtils.decrypt(settings.apiKey) : ''
        const secretKey = settings.secretKey ? EncryptionUtils.decrypt(settings.secretKey) : ''
        const uri = settings.mode === 'live' ? 'https://api.iyzipay.com' : 'https://sandbox-api.iyzipay.com'

        return new Iyzipay({ apiKey, secretKey, uri })
    }

    /**
     * Initializes 3D Secure checkout form and returns the payment HTML.
     */
    static async initializeCheckoutForm(data: PaymentRequestData): Promise<{ success: boolean; htmlContent?: string; errorMessage?: string; paymentId?: string }> {
        const conversationId = uuidv4()
        const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://new.bluedreamsresort.com'}/api/booking/callback/iyzico`

        // Split name (we require Name Surname, fallback just in case)
        const nameParts = data.guestName.split(' ')
        const name = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : data.guestName
        const surname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Misafir'

        const request = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: conversationId,
            price: data.price.toString(),
            paidPrice: data.price.toString(),
            currency: Iyzipay.CURRENCY.TRY,
            basketId: data.bookingId,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: callbackUrl,
            enabledInstallments: [2, 3, 6, 9, 12],
            buyer: {
                id: data.bookingId,
                name: name,
                surname: surname,
                gsmNumber: data.guestPhone.startsWith('+') ? data.guestPhone : `+90${data.guestPhone}`,
                email: data.guestEmail,
                identityNumber: data.identityNumber || "11111111111",
                lastLoginDate: "2023-01-01 00:00:00",
                registrationDate: "2023-01-01 00:00:00",
                registrationAddress: "Muğla Bodrum",
                ip: data.clientIp,
                city: "Muğla",
                country: "Turkey",
                zipCode: "48400"
            },
            shippingAddress: {
                contactName: data.guestName,
                city: "Muğla",
                country: "Turkey",
                address: "Blue Dreams Resort Torba",
                zipCode: "48400"
            },
            billingAddress: {
                contactName: data.guestName,
                city: "Muğla",
                country: "Turkey",
                address: "Blue Dreams Resort Torba",
                zipCode: "48400"
            },
            basketItems: [
                {
                    id: data.bookingId,
                    name: "Oda Konaklaması",
                    category1: "Konaklama",
                    category2: "Oda",
                    itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                    price: data.price.toString()
                }
            ]
        }

        try {
            const iyzipay = await this.getProviderSettings()
            return new Promise((resolve, reject) => {
                iyzipay.checkoutFormInitialize.create(request as any, async function (err: any, result: any) {
                    if (err) {
                        console.error('[Iyzico] Init Error:', err)
                        // Log failed attempt
                        await prisma.paymentLog.create({
                            data: {
                                bookingId: data.bookingId,
                                provider: 'iyzico',
                                action: 'init',
                                status: 'failed',
                                amount: data.price,
                                currency: 'TRY',
                                errorMessage: err.message,
                                ipAddress: data.clientIp
                            }
                        })
                        resolve({ success: false, errorMessage: err.message })
                    } else {
                        if (result.status === 'success') {
                            // Log pending attempt
                            await prisma.paymentLog.create({
                                data: {
                                    bookingId: data.bookingId,
                                    provider: 'iyzico',
                                    action: 'init',
                                    status: 'pending',
                                    amount: data.price,
                                    currency: 'TRY',
                                    requestData: JSON.stringify(request),
                                    responseData: JSON.stringify(result),
                                    ipAddress: data.clientIp
                                }
                            })
                            resolve({ success: true, htmlContent: result.checkoutFormContent, paymentId: result.token })
                        } else {
                            // Log failed response from API
                            await prisma.paymentLog.create({
                                data: {
                                    bookingId: data.bookingId,
                                    provider: 'iyzico',
                                    action: 'init',
                                    status: 'failed',
                                    amount: data.price,
                                    currency: 'TRY',
                                    requestData: JSON.stringify(request),
                                    responseData: JSON.stringify(result),
                                    errorMessage: result.errorMessage,
                                    ipAddress: data.clientIp
                                }
                            })
                            resolve({ success: false, errorMessage: result.errorMessage })
                        }
                    }
                })
            })
        } catch (error: any) {
            console.error('[Iyzico] Setup Error:', error)
            return { success: false, errorMessage: error.message }
        }
    }

    /**
     * Retrieves the checkout form result via the token provided in the callback.
     */
    static async retrieveCheckoutResult(token: string): Promise<{ success: boolean; result?: any; errorMessage?: string }> {
        const request = {
            locale: Iyzipay.LOCALE.TR,
            token: token
        }

        try {
            const iyzipay = await this.getProviderSettings()
            return new Promise((resolve, reject) => {
                iyzipay.checkoutForm.retrieve(request, function (err: any, result: any) {
                    if (err) {
                        resolve({ success: false, errorMessage: err.message })
                    } else {
                        if (result.status === 'success' && result.paymentStatus === 'SUCCESS') {
                            resolve({ success: true, result: result })
                        } else {
                            resolve({ success: false, errorMessage: result.errorMessage || 'Ödeme reddedildi.', result })
                        }
                    }
                })
            })
        } catch (error: any) {
            return { success: false, errorMessage: error.message }
        }
    }
}
