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

// ─── Demo Data ─────────────────────────────────────────────────

function seededRandom(seed: number): () => number {
    let s = seed
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646 }
}
const today = new Date()
const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
const rng = seededRandom(seed + 9999) // different seed from purchasing

const DEMO_STOCK: StockItem[] = [
    { id: '1', code: '10101001', name: 'Dana Kıyma', group: 'Et Ürünleri', unit: 'kg', quantity: 180, unitPrice: 320, totalValue: 57600, currency: 'TRY', barcode: null },
    { id: '2', code: '10101002', name: 'Tavuk Göğüs', group: 'Et Ürünleri', unit: 'kg', quantity: 350, unitPrice: 145, totalValue: 50750, currency: 'TRY', barcode: null },
    { id: '3', code: '10101003', name: 'Kuzu Pirzola', group: 'Et Ürünleri', unit: 'kg', quantity: 45, unitPrice: 550, totalValue: 24750, currency: 'TRY', barcode: null },
    { id: '4', code: '10201001', name: 'Süt', group: 'Süt Ürünleri', unit: 'lt', quantity: 120, unitPrice: 42, totalValue: 5040, currency: 'TRY', barcode: null },
    { id: '5', code: '10201002', name: 'Tereyağı', group: 'Süt Ürünleri', unit: 'kg', quantity: 65, unitPrice: 380, totalValue: 24700, currency: 'TRY', barcode: null },
    { id: '6', code: '10201003', name: 'Beyaz Peynir', group: 'Süt Ürünleri', unit: 'kg', quantity: 110, unitPrice: 250, totalValue: 27500, currency: 'TRY', barcode: null },
    { id: '7', code: '10301001', name: 'Domates', group: 'Sebze-Meyve', unit: 'kg', quantity: 80, unitPrice: 35, totalValue: 2800, currency: 'TRY', barcode: null },
    { id: '8', code: '10301002', name: 'Salatalık', group: 'Sebze-Meyve', unit: 'kg', quantity: 95, unitPrice: 28, totalValue: 2660, currency: 'TRY', barcode: null },
    { id: '9', code: '10301003', name: 'Biber', group: 'Sebze-Meyve', unit: 'kg', quantity: 60, unitPrice: 45, totalValue: 2700, currency: 'TRY', barcode: null },
    { id: '10', code: '10401001', name: 'Zeytinyağı', group: 'Yağlar', unit: 'lt', quantity: 160, unitPrice: 280, totalValue: 44800, currency: 'TRY', barcode: null },
    { id: '11', code: '10401002', name: 'Ayçiçek Yağı', group: 'Yağlar', unit: 'lt', quantity: 200, unitPrice: 85, totalValue: 17000, currency: 'TRY', barcode: null },
    { id: '12', code: '10501001', name: 'Pirinç', group: 'Kuru Gıda', unit: 'kg', quantity: 200, unitPrice: 65, totalValue: 13000, currency: 'TRY', barcode: null },
    { id: '13', code: '10501002', name: 'Un', group: 'Kuru Gıda', unit: 'kg', quantity: 450, unitPrice: 32, totalValue: 14400, currency: 'TRY', barcode: null },
    { id: '14', code: '10501003', name: 'Makarna', group: 'Kuru Gıda', unit: 'kg', quantity: 180, unitPrice: 45, totalValue: 8100, currency: 'TRY', barcode: null },
    { id: '15', code: '20101001', name: 'Bira (33cl)', group: 'Alkollü İçecek', unit: 'adet', quantity: 1200, unitPrice: 35, totalValue: 42000, currency: 'TRY', barcode: null },
    { id: '16', code: '20101002', name: 'Şarap (şişe)', group: 'Alkollü İçecek', unit: 'adet', quantity: 250, unitPrice: 180, totalValue: 45000, currency: 'TRY', barcode: null },
    { id: '17', code: '20201001', name: 'Kola (lt)', group: 'Alkolsüz İçecek', unit: 'lt', quantity: 800, unitPrice: 18, totalValue: 14400, currency: 'TRY', barcode: null },
    { id: '18', code: '20201002', name: 'Meyve Suyu', group: 'Alkolsüz İçecek', unit: 'lt', quantity: 450, unitPrice: 28, totalValue: 12600, currency: 'TRY', barcode: null },
    { id: '19', code: '20201003', name: 'Su (0.5lt)', group: 'Alkolsüz İçecek', unit: 'adet', quantity: 3000, unitPrice: 3.5, totalValue: 10500, currency: 'TRY', barcode: null },
    { id: '20', code: '30101001', name: 'Çamaşır Deterjanı', group: 'Temizlik', unit: 'kg', quantity: 200, unitPrice: 85, totalValue: 17000, currency: 'TRY', barcode: null },
    { id: '21', code: '30101002', name: 'Bulaşık Deterjanı', group: 'Temizlik', unit: 'lt', quantity: 180, unitPrice: 65, totalValue: 11700, currency: 'TRY', barcode: null },
    { id: '22', code: '30101003', name: 'Dezenfektan', group: 'Temizlik', unit: 'lt', quantity: 90, unitPrice: 120, totalValue: 10800, currency: 'TRY', barcode: null },
    { id: '23', code: '30101004', name: 'Kostik', group: 'Temizlik', unit: 'lt', quantity: 50, unitPrice: 95, totalValue: 4750, currency: 'TRY', barcode: null },
    { id: '24', code: '40101001', name: 'Şampuan', group: 'Amenities', unit: 'adet', quantity: 1500, unitPrice: 8, totalValue: 12000, currency: 'TRY', barcode: null },
    { id: '25', code: '40101002', name: 'Sabun', group: 'Amenities', unit: 'adet', quantity: 2000, unitPrice: 5, totalValue: 10000, currency: 'TRY', barcode: null },
]

function generateDemoReceipts(): AccountingReceipt[] {
    const receipts: AccountingReceipt[] = []
    const types = ['Alış Faturası', 'Satış Faturası', 'Kasa Fişi', 'Banka Havalesi', 'Masraf Fişi', 'Mahsup Fişi', 'Açılış Fişi']
    const accounts = [
        { code: '100', name: 'Kasa' },
        { code: '102', name: 'Bankalar' },
        { code: '120', name: 'Alıcılar' },
        { code: '153', name: 'Ticari Mallar' },
        { code: '191', name: 'İndirilecek KDV' },
        { code: '320', name: 'Satıcılar' },
        { code: '391', name: 'Hesaplanan KDV' },
        { code: '600', name: 'Yurt İçi Satışlar' },
        { code: '621', name: 'STMM' },
        { code: '770', name: 'Genel Yönetim Giderleri' },
    ]

    for (let i = 0; i < 120; i++) {
        const daysAgo = Math.floor(rng() * 90)
        const d = new Date(today)
        d.setDate(d.getDate() - daysAgo)
        const type = types[Math.floor(rng() * types.length)]
        const acc = accounts[Math.floor(rng() * accounts.length)]
        const amount = Math.round((rng() * 50000 + 1000) * 100) / 100
        const isDebit = rng() > 0.5

        receipts.push({
            id: `R-${String(i + 1).padStart(5, '0')}`,
            date: d.toISOString().split('T')[0],
            receiptNo: `MF-${d.getFullYear()}-${String(i + 1).padStart(4, '0')}`,
            type,
            description: `${type} - ${acc.name}`,
            debit: isDebit ? amount : 0,
            credit: isDebit ? 0 : amount,
            balance: 0,
            currency: 'TRY',
            accountCode: acc.code,
            accountName: acc.name,
        })
    }
    // Calculate running balance
    receipts.sort((a, b) => a.date.localeCompare(b.date))
    let bal = 0
    for (const r of receipts) {
        bal += r.debit - r.credit
        r.balance = Math.round(bal * 100) / 100
    }
    return receipts
}

function generateDemoForecast(): ForecastDay[] {
    const forecast: ForecastDay[] = []
    for (let i = 0; i < 30; i++) {
        const d = new Date(today)
        d.setDate(d.getDate() + i)
        const dayOfWeek = d.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const baseOcc = isWeekend ? 85 : 65
        const occ = Math.min(100, Math.max(20, baseOcc + Math.floor((rng() - 0.5) * 30)))
        const totalRooms = 370
        const occupied = Math.round(totalRooms * occ / 100)
        const arrivals = Math.floor(rng() * 80 + 20)
        const departures = Math.floor(rng() * 70 + 15)

        forecast.push({
            date: d.toISOString().split('T')[0],
            expectedArrivals: arrivals,
            expectedDepartures: departures,
            stayovers: occupied - arrivals,
            totalGuests: Math.round(occupied * 2.3),
            occupancy: occ,
            availableRooms: totalRooms - occupied,
            revenue: Math.round(occupied * (rng() * 2000 + 3000)),
        })
    }
    return forecast
}

// ─── Service ───────────────────────────────────────────────────

export const AccountingService = {

    async getStockList(): Promise<{ items: StockItem[]; source: 'live' | 'demo' }> {
        try {
            const data = await stockClient.execute('SP_STOCK_LIST', {
                QUICKINVOICEACTIVE: 0,
                STOCKGROUPID: null,
                FROMCODE: null,
                TOCODE: null,
                FROMID: null,
                TOID: null,
                GETBARCODELIST: null,
            })

            if (data && (Array.isArray(data) || data?.Result || data?.data || data?.items)) {
                const raw = Array.isArray(data) ? data : (data.Result || data.data || data.items || [])
                if (Array.isArray(raw) && raw.length > 0) {
                    console.log('[Accounting] SP_STOCK_LIST returned', raw.length, 'items')
                    const items: StockItem[] = raw.map((item: any, idx: number) => ({
                        id: String(item.ID || item.Id || item.STOCKID || idx + 1),
                        code: item.CODE || item.Code || item.STOCKCODE || '',
                        name: item.NAME || item.Name || item.STOCKNAME || item.DEFINITION || '',
                        group: item.GROUPNAME || item.GroupName || item.STOCKGROUPNAME || '',
                        unit: item.UNIT || item.Unit || item.UNITNAME || 'adet',
                        quantity: item.QUANTITY ?? item.Quantity ?? item.STOCK ?? 0,
                        unitPrice: item.UNITPRICE ?? item.UnitPrice ?? item.PRICE ?? 0,
                        totalValue: (item.QUANTITY ?? 0) * (item.UNITPRICE ?? 0),
                        currency: item.CURRENCY || 'TRY',
                        barcode: item.BARCODE || item.Barcode || null,
                    }))
                    return { items, source: 'live' }
                }
            }
            console.log('[Accounting] SP_STOCK_LIST: no data or unexpected format, using demo')
        } catch (err) {
            console.warn('[Accounting] SP_STOCK_LIST error:', (err as Error).message)
        }
        return { items: DEMO_STOCK, source: 'demo' }
    },

    async getAccountingReceipts(fromDate?: string, toDate?: string): Promise<{ receipts: AccountingReceipt[]; source: 'live' | 'demo' }> {
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
            console.log('[Accounting] Receipts: no data, using demo')
        } catch (err) {
            console.warn('[Accounting] Receipts error:', (err as Error).message)
        }
        return { receipts: generateDemoReceipts(), source: 'demo' }
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
        return { forecast: generateDemoForecast(), source: 'demo' }
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

        const dataSource = stockResult.source === 'live' || receiptsResult.source === 'live' ? 'live' : 'demo'

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
}
