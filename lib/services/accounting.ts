// ─── Accounting / Muhasebe Service ──────────────────────────────
// ElektraWeb ERP API entegrasyonu
// Endpoint: https://4001.hoteladvisor.net
// Tenant 27744 → Stok/Muhasebe | Tenant 27856 → Önbüro/Forecast
//
// Available Methods:
//   SP_STOCK_LIST                      → Execute (Stok listesi)
//   FN_ACCOUNTING_GET_RECEIPT_LIST     → Execute (Muhasebe fişleri)
//   FN_FORECAST_DATE                   → Execute (Forecast - tenant 27856)
//   SP_STOCK_PRUCHASING_ORDER_API_INSERT → Execute (Sipariş kaydı)

import { ElektraERP, ERP_API_KEY } from './purchasing'

// ─── Types ─────────────────────────────────────────────────────

export type StockItem = {
    id: string
    code: string
    name: string
    group: string
    unit: string
    quantity: number
    unitPrice: number
    totalValue: number
    currency: string
    barcode: string | null
}

export type AccountingReceipt = {
    id: string
    date: string
    receiptNo: string
    type: string
    description: string
    debit: number
    credit: number
    balance: number
    currency: string
    accountCode: string
    accountName: string
}

export type ForecastDay = {
    date: string
    expectedArrivals: number
    expectedDepartures: number
    stayovers: number
    totalGuests: number
    occupancy: number
    availableRooms: number
    revenue: number
}

export type AccountingKPI = {
    totalStockItems: number
    totalStockValue: number
    receiptCount: number
    totalDebit: number
    totalCredit: number
    forecastOccupancy: number
    avgForecastRevenue: number
    dataSource: 'live' | 'demo'
}

// ─── ERP API Clients ───────────────────────────────────────────

const stockClient = new ElektraERP(ERP_API_KEY)     // Tenant 33264
const frontClient = new ElektraERP(ERP_API_KEY)     // Tenant 33264

// ─── Service ───────────────────────────────────────────────────

export const AccountingService = {

    async getStockList(): Promise<{ items: StockItem[]; source: 'live' | 'demo' }> {
        try {
            const data = await stockClient.execute('FN_ACCOUNTING_GET_STOCK_LIST', {
                HOTELID: 33264,
                STARTDATE: '2023-01-01',
                ENDDATE: new Date().toISOString().split('T')[0],
            })

            if (data && (Array.isArray(data) || data?.Result || data?.data || data?.items || data?.STOCK_LIST)) {
                let raw = Array.isArray(data) ? data : (data.Result || data.data || data.items || data.STOCK_LIST || [])
                if (typeof raw === 'string') {
                    try { raw = JSON.parse(raw) } catch (e) { raw = [] }
                }

                if (Array.isArray(raw) && raw.length > 0) {
                    console.log('[Accounting] FN_ACCOUNTING_GET_STOCK_LIST returned', raw.length, 'items')
                    const items: StockItem[] = raw.map((item: any, idx: number) => ({
                        id: String(item.ID || item.Id || item.STOCKID || item.STOK_ID || idx + 1),
                        code: item.CODE || item.Code || item.STOCKCODE || item.STOK_KODU || '',
                        name: item.NAME || item.Name || item.STOCKNAME || item.STOK_ADI || item.DEFINITION || '',
                        group: item.GROUPNAME || item.GroupName || item.STOCKGROUPNAME || item.GRUP_ADI || '',
                        unit: item.UNIT || item.Unit || item.UNITNAME || item.BIRIM || 'adet',
                        quantity: item.QUANTITY ?? item.Quantity ?? item.STOCK ?? item.KALAN_MIKTAR ?? 0,
                        unitPrice: item.UNITPRICE ?? item.UnitPrice ?? item.PRICE ?? item.ORTALAMA_FIYAT ?? 0,
                        totalValue: item.TOTAL_VALUE ?? item.TUTAR ?? ((item.QUANTITY ?? 0) * (item.UNITPRICE ?? 0)),
                        currency: item.CURRENCY || item.PARA_BIRIMI || 'TRY',
                        barcode: item.BARCODE || item.Barcode || item.BARKOD || null,
                    }))
                    return { items, source: 'live' }
                }
            }
            console.log('[Accounting] FN_ACCOUNTING_GET_STOCK_LIST: no data or unexpected format, using mock')
        } catch (err) {
            console.warn('[Accounting] SP_STOCK_LIST error:', (err as Error).message)
        }
        return { items: [], source: 'live' }
    },

    async getAccountingReceipts(fromDate?: string, toDate?: string): Promise<{ receipts: AccountingReceipt[]; source: 'live' | 'demo' }> {
        // Attempt 1: ERP API (SP function)
        try {
            const params: Record<string, unknown> = {}
            if (fromDate) params.STARTDATE = fromDate
            if (toDate) params.ENDDATE = toDate

            const data = await stockClient.execute('FN_ACCOUNTING_GET_RECEIPT_LIST', params)

            if (data && (Array.isArray(data) || data?.Result || data?.data)) {
                const raw = Array.isArray(data) ? data : (data.Result || data.data || data.items || [])
                if (Array.isArray(raw) && raw.length > 0) {
                    console.log('[Accounting] Receipts returned', raw.length, 'items')
                    const receipts: AccountingReceipt[] = raw.map((r: any, idx: number) => ({
                        id: String(r.ID || r.Id || idx + 1),
                        date: r.DATE || r.Date || r.RECEIPTDATE || '',
                        receiptNo: r.RECEIPTNO || r.ReceiptNo || r.FISCHENO || '',
                        type: r.TYPE || r.Type || r.RECEIPTTYPE || '',
                        description: r.DESCRIPTION || r.Description || r.EXPLANATION || '',
                        debit: r.DEBIT ?? r.Debit ?? r.BORCTUTAR ?? 0,
                        credit: r.CREDIT ?? r.Credit ?? r.ALACAKTUTAR ?? 0,
                        balance: r.BALANCE ?? r.Balance ?? 0,
                        currency: r.CURRENCY || 'TRY',
                        accountCode: r.ACCOUNTCODE || r.AccountCode || r.HESAPKODU || '',
                        accountName: r.ACCOUNTNAME || r.AccountName || r.HESAPADI || '',
                    }))
                    return { receipts, source: 'live' }
                }
            }
            console.log('[Accounting] Receipts: no data from ERP, trying booking API...')
        } catch (err) {
            console.warn('[Accounting] Receipts ERP error:', (err as Error).message)
        }

        // Attempt 2: Booking API folio endpoint (alternative source)
        try {
            const bookingApiBase = 'https://bookingapi.elektraweb.com'
            const hotelId = 33264
            const userCode = process.env.ELEKTRA_USER_CODE || 'asis'
            const password = process.env.ELEKTRA_PASSWORD || ''

            if (password) {
                const loginRes = await fetch(`${bookingApiBase}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 'hotel-id': hotelId, 'usercode': userCode, 'password': password }),
                    signal: AbortSignal.timeout(5000),
                })
                if (loginRes.ok) {
                    const loginData = await loginRes.json()
                    const jwt = loginData?.jwt
                    if (jwt) {
                        const from = fromDate || new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]
                        const to = toDate || new Date().toISOString().split('T')[0]

                        // Try folio/cashbook endpoints
                        for (const ep of ['folios', 'cashbook', 'receipts']) {
                            try {
                                const res = await fetch(`${bookingApiBase}/hotel/${hotelId}/${ep}?from=${from}&to=${to}`, {
                                    headers: { 'Authorization': `Bearer ${jwt}` },
                                    signal: AbortSignal.timeout(5000),
                                })
                                if (res.ok) {
                                    const raw = await res.json()
                                    const items = Array.isArray(raw) ? raw : (raw?.data || raw?.items || [])
                                    if (Array.isArray(items) && items.length > 0) {
                                        console.log(`[Accounting] ${ep} returned ${items.length} items via booking API`)
                                        const receipts: AccountingReceipt[] = items.map((r: any, idx: number) => ({
                                            id: String(r.id || r.Id || r.ID || idx + 1),
                                            date: (r.date || r.Date || r.DATE || r['transaction-date'] || '').slice(0, 10),
                                            receiptNo: r.receiptNo || r.folioNo || r['folio-no'] || r.id || '',
                                            type: r.type || r.Type || r.description || '',
                                            description: r.description || r.Description || r.explanation || '',
                                            debit: r.debit ?? r.Debit ?? r.amount ?? 0,
                                            credit: r.credit ?? r.Credit ?? 0,
                                            balance: r.balance ?? r.Balance ?? 0,
                                            currency: r.currency || r.Currency || 'TRY',
                                            accountCode: r.accountCode || r.departmentId || '',
                                            accountName: r.accountName || r.department || '',
                                        }))
                                        return { receipts, source: 'live' }
                                    }
                                }
                            } catch { /* try next */ }
                        }
                    }
                }
            }
            console.log('[Accounting] Booking API: no receipt data available')
        } catch (err) {
            console.warn('[Accounting] Booking API fallback error:', (err as Error).message)
        }

        return { receipts: [], source: 'live' }
    },

    async getForecast(): Promise<{ forecast: ForecastDay[]; source: 'live' | 'demo' }> {
        try {
            const now = new Date()
            const fromDate = now.toISOString().split('T')[0]
            const toDate = new Date(now.getTime() + 30 * 86400000).toISOString().split('T')[0]

            const data = await frontClient.execute('FN_FORECAST_DATE', {
                STARTDATE: fromDate,
                ENDDATE: toDate,
            })

            if (data && (Array.isArray(data) || data?.Result || data?.data)) {
                const raw = Array.isArray(data) ? data : (data.Result || data.data || data.items || [])
                if (Array.isArray(raw) && raw.length > 0) {
                    console.log('[Accounting] Forecast returned', raw.length, 'days')
                    const forecast: ForecastDay[] = raw.map((f: any) => ({
                        date: f.DATE || f.Date || f.FORECASTDATE || '',
                        expectedArrivals: f.ARRIVALS ?? f.Arrivals ?? f.EXPECTEDARRIVALS ?? 0,
                        expectedDepartures: f.DEPARTURES ?? f.Departures ?? f.EXPECTEDDEPARTURES ?? 0,
                        stayovers: f.STAYOVERS ?? f.Stayovers ?? 0,
                        totalGuests: f.TOTALGUESTS ?? f.TotalGuests ?? f.PAXCOUNT ?? 0,
                        occupancy: f.OCCUPANCY ?? f.Occupancy ?? f.OCCUPANCYRATE ?? 0,
                        availableRooms: f.AVAILABLEROOMS ?? f.AvailableRooms ?? 0,
                        revenue: f.REVENUE ?? f.Revenue ?? f.EXPECTEDREVENUE ?? 0,
                    }))
                    return { forecast, source: 'live' }
                }
            }
            console.log('[Accounting] Forecast: no data, using demo')
        } catch (err) {
            console.warn('[Accounting] Forecast error:', (err as Error).message)
        }
        return { forecast: [], source: 'live' }
    },

    async getKPIs(): Promise<AccountingKPI> {
        const [stockResult, receiptsResult, forecastResult] = await Promise.all([
            this.getStockList(),
            this.getAccountingReceipts(),
            this.getForecast(),
        ])

        const totalStockValue = stockResult.items.reduce((s, i) => s + i.totalValue, 0)
        const totalDebit = receiptsResult.receipts.reduce((s, r) => s + r.debit, 0)
        const totalCredit = receiptsResult.receipts.reduce((s, r) => s + r.credit, 0)
        const avgOcc = forecastResult.forecast.length > 0
            ? forecastResult.forecast.reduce((s, f) => s + f.occupancy, 0) / forecastResult.forecast.length
            : 0
        const avgRev = forecastResult.forecast.length > 0
            ? forecastResult.forecast.reduce((s, f) => s + f.revenue, 0) / forecastResult.forecast.length
            : 0

        const dataSource = 'live'

        return {
            totalStockItems: stockResult.items.length,
            totalStockValue: Math.round(totalStockValue),
            receiptCount: receiptsResult.receipts.length,
            totalDebit: Math.round(totalDebit),
            totalCredit: Math.round(totalCredit),
            forecastOccupancy: Math.round(avgOcc),
            avgForecastRevenue: Math.round(avgRev),
            dataSource,
        }
    },

    async createInvoice(payload: any): Promise<boolean> {
        try {
            const data = await stockClient.execute('SP_ACCOUNTING_API_INVOICE_INSERT', {
                HOTELID: 33264,
                ...payload
            })
            console.log('[Accounting] Invoice create success', data)
            return true
        } catch (error: any) {
            console.error('[Accounting] Failed to create invoice:', error.message)
            return false
        }
    }
}
