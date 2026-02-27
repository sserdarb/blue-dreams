import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EncryptionUtils } from '@/lib/utils/encryption'

// We don't want these cached
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    try {
        const url = new URL(request.url)
        const provider = url.searchParams.get('provider')

        const where = provider ? { provider } : {}

        const settings = await prisma.paymentSettings.findMany({
            where,
            include: {
                installments: {
                    orderBy: { installments: 'asc' }
                }
            }
        })

        // Decrypt sensitive fields before sending to admin panel
        const decryptedSettings = settings.map(setting => ({
            ...setting,
            apiKey: setting.apiKey ? EncryptionUtils.decrypt(setting.apiKey) : null,
            secretKey: setting.secretKey ? EncryptionUtils.decrypt(setting.secretKey) : null,
            merchantId: setting.merchantId ? EncryptionUtils.decrypt(setting.merchantId) : null,
            merchantSalt: setting.merchantSalt ? EncryptionUtils.decrypt(setting.merchantSalt) : null,
        }))

        return NextResponse.json({ settings: decryptedSettings })
    } catch (error: any) {
        console.error('[Payment Settings GET] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { provider, apiKey, secretKey, merchantId, merchantSalt, mode, isActive, baseCommissionRate, installments } = body

        if (!provider) {
            return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
        }

        // Encrypt sensitive fields before saving
        const encryptedApiKey = apiKey ? EncryptionUtils.encrypt(apiKey) : null
        const encryptedSecretKey = secretKey ? EncryptionUtils.encrypt(secretKey) : null
        const encryptedMerchantId = merchantId ? EncryptionUtils.encrypt(merchantId) : null
        const encryptedMerchantSalt = merchantSalt ? EncryptionUtils.encrypt(merchantSalt) : null

        // Format installments data
        const installmentsData = installments ? installments.map((inst: any) => ({
            installments: parseInt(inst.installments as string),
            commissionRate: parseFloat(inst.commissionRate as string)
        })) : []

        // Upsert the main setting record
        const updatedSetting = await prisma.paymentSettings.upsert({
            where: { provider },
            update: {
                apiKey: encryptedApiKey,
                secretKey: encryptedSecretKey,
                merchantId: encryptedMerchantId,
                merchantSalt: encryptedMerchantSalt,
                mode,
                isActive,
                baseCommissionRate: parseFloat(baseCommissionRate || 0)
            },
            create: {
                provider,
                apiKey: encryptedApiKey,
                secretKey: encryptedSecretKey,
                merchantId: encryptedMerchantId,
                merchantSalt: encryptedMerchantSalt,
                mode: mode || 'sandbox',
                isActive: isActive || false,
                baseCommissionRate: parseFloat(baseCommissionRate || 0)
            }
        })

        // Handle installments (delete existing and recreate is easiest for UI arrays)
        if (installments) {
            await prisma.paymentInstallmentRate.deleteMany({
                where: { paymentSettingsId: updatedSetting.id }
            })

            if (installmentsData.length > 0) {
                await prisma.paymentInstallmentRate.createMany({
                    data: installmentsData.map((data: any) => ({
                        paymentSettingsId: updatedSetting.id,
                        installments: data.installments,
                        commissionRate: data.commissionRate
                    }))
                })
            }
        }

        return NextResponse.json({ success: true, settingId: updatedSetting.id })
    } catch (error: any) {
        console.error('[Payment Settings POST] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
