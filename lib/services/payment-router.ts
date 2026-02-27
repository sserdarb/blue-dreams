import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export class PaymentRouter {
    // Determine the best POS provider based on BIN and installment requirements
    static async selectProvider(bin: string, installment: number, isForeign: boolean) {
        // According to requirements:
        // - Single payment (installment = 1) -> YapiKredi
        // - Foreign cards -> YapiKredi
        // - Other installments -> The bank that supports it (IsBank or Denizbank)

        if (installment === 1 || isForeign) {
            const yk = await prisma.paymentSettings.findUnique({ where: { provider: 'yapikredi' } })
            if (yk?.isActive) return yk
        }

        // For installments > 1, find the bank that supports this installment
        // Note: In a real system, we also check if the BIN matches the bank's BIN list.
        // For now, we look for an active bank providing the requested installment.
        const possibleBanks = await prisma.paymentSettings.findMany({
            where: {
                isActive: true,
                installments: {
                    some: {
                        installments: installment
                    }
                }
            },
            include: { installments: true }
        })

        if (possibleBanks.length > 0) {
            // Prefer the bank that matches rules, say Isbank first or Denizbank
            return possibleBanks[0]
        }

        // Fallback
        return await prisma.paymentSettings.findFirst({ where: { isActive: true } })
    }

    // Generate 3D Secure HTML Form
    static generate3DForm(provider: any, amount: number, bookingId: string, cardInfo: any, callbackUrl: string) {
        // Mocked implementation for EST (Nestpay) and Posnet
        if (provider.provider === 'yapikredi') {
            return this.generatePosnet3DForm(provider, amount, bookingId, cardInfo, callbackUrl)
        } else {
            return this.generateEST3DForm(provider, amount, bookingId, cardInfo, callbackUrl)
        }
    }

    private static generateEST3DForm(provider: any, amount: number, bookingId: string, cardInfo: any, callbackUrl: string) {
        const { clientId, apiUsername, storeKey } = provider
        const rnd = crypto.randomBytes(16).toString('hex')
        const amountStr = amount.toFixed(2)
        const okUrl = callbackUrl + "/ok"
        const failUrl = callbackUrl + "/fail"
        const trantype = "Auth"

        // Hash = base64(sha1(clientId + oid + amount + okUrl + failUrl + trantype + installment + rnd + storeKey))
        const hashStr = `${clientId}${bookingId}${amountStr}${okUrl}${failUrl}${trantype}${cardInfo.installment || ''}${rnd}${storeKey}`
        const hash = crypto.createHash('sha1').update(hashStr).digest('base64')

        const actionUrl = provider.provider === 'isbank'
            ? 'https://sanalpos.isbank.com.tr/fim/est3Dgate'
            : 'https://sanalpos.denizbank.com/fim/est3Dgate' // Or appropriate EST URL

        return `
            <form id="payForm" method="post" action="${actionUrl}">
                <input type="hidden" name="clientid" value="${clientId}">
                <input type="hidden" name="amount" value="${amountStr}">
                <input type="hidden" name="oid" value="${bookingId}">
                <input type="hidden" name="okUrl" value="${okUrl}">
                <input type="hidden" name="failUrl" value="${failUrl}">
                <input type="hidden" name="rnd" value="${rnd}">
                <input type="hidden" name="hash" value="${hash}">
                <input type="hidden" name="storetype" value="3d">
                <input type="hidden" name="trantype" value="${trantype}">
                <input type="hidden" name="hashAlgorithm" value="ver2">
                
                <input type="hidden" name="pan" value="${cardInfo.cardNumber}">
                <input type="hidden" name="cv2" value="${cardInfo.cvv}">
                <input type="hidden" name="Ecom_Payment_Card_ExpDate_Year" value="${cardInfo.expYear}">
                <input type="hidden" name="Ecom_Payment_Card_ExpDate_Month" value="${cardInfo.expMonth}">
                <input type="hidden" name="cardType" value="1">
            </form>
            <script>document.getElementById('payForm').submit();</script>
        `
    }

    private static generatePosnet3DForm(provider: any, amount: number, bookingId: string, cardInfo: any, callbackUrl: string) {
        // YapiKredi Posnet OOS or XML 3D form generation logic 
        // using terminalId, posnetId (clientId), mac
        return `
            <form id="payForm" method="post" action="https://setmpos.ykb.com/PosnetWebService/XML">
              <!-- Posnet parameters goes here -->
              <input type="hidden" name="mid" value="${provider.clientId}">
              <input type="hidden" name="tid" value="${provider.terminalId}">
            </form>
            <script>document.getElementById('payForm').submit();</script>
        `
    }
}
