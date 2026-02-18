// ─── Finance Service ───────────────────────────────────────────
// Finans Raporları — Blue Dreams Resort (Hotel 33264)
// Uses Elektra ERP API for: Trial Balance, Payments, Revenue, Invoices
//
// HYBRID: Tries live API first, falls back to realistic demo data.

import { ElektraERP, ERP_API_KEY_STOCK, ERP_API_KEY_FRONT } from './purchasing'

// ─── Types ─────────────────────────────────────────────────────

export interface TrialBalanceRow {
    accountCode: string
    accountName: string
    debit: number
    credit: number
    balance: number
    group: string
}

export interface PaymentRow {
    date: string
    type: string
    info: string
    account: string
    debit: number
    credit: number
    currency: string
    currencyRate: number
    paymentName: string
    paymentCode: string
}

export interface RevenueRow {
    date: string
    type: string
    info: string
    departmentId: number
    revenueId: number
    account: string
    debit: number
    credit: number
    currency: string
    currencyRate: number
    expenseCode: string | null
    vat1Percent: number
    vat2Percent: number
}

export interface InvoiceSummary {
    id: number
    uuid: string
    date: string
    accountName: string
    accountCode: string
    taxNumber: string
    total: number
}

export interface FinanceKPIs {
    totalRevenue: number
    totalExpense: number
    profitMargin: number
    cashFlow: number
    revenueGrowth: number
    expenseGrowth: number
    collectionRate: number
    invoiceCount: number
}

export interface MonthlyFinance {
    month: string
    revenue: number
    expense: number
    profit: number
    prevYearRevenue: number
    prevYearExpense: number
}

export interface DepartmentRevenue {
    department: string
    revenue: number
    percentage: number
    color: string
}

export interface PaymentMethodBreakdown {
    method: string
    amount: number
    count: number
    percentage: number
    color: string
}

export type DataSource = 'live' | 'demo'

// ─── Config ────────────────────────────────────────────────────

const HOTEL_ID = 33264

// Elektra ERP clients
const erpStock = new ElektraERP(ERP_API_KEY_STOCK)
const erpFront = new ElektraERP(ERP_API_KEY_FRONT)

// ─── Seeded Random ─────────────────────────────────────────────

function seededRandom(seed: number): () => number {
    let s = seed
    return () => {
        s = (s * 16807 + 0) % 2147483647
        return (s - 1) / 2147483646
    }
}

const today = new Date()
const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
const rng = seededRandom(daySeed)
const randBetween = (min: number, max: number) => Math.round(min + rng() * (max - min))
const randFloat = (min: number, max: number) => +(min + rng() * (max - min)).toFixed(2)

// ─── Demo Data Generators ──────────────────────────────────────

const DEPARTMENTS = [
    { name: 'Oda Geliri', color: '#3b82f6', base: 45 },
    { name: 'Yiyecek & İçecek', color: '#10b981', base: 30 },
    { name: 'SPA & Wellness', color: '#8b5cf6', base: 8 },
    { name: 'Toplantı & Etkinlik', color: '#f59e0b', base: 5 },
    { name: 'Mini Bar', color: '#ec4899', base: 4 },
    { name: 'Diğer', color: '#6b7280', base: 8 },
]

const EXPENSE_CATEGORIES = [
    { name: 'Personel Giderleri', code: '770', base: 35 },
    { name: 'Yiyecek & İçecek Maliyeti', code: '620', base: 22 },
    { name: 'Enerji & Yakıt', code: '730', base: 12 },
    { name: 'Bakım & Onarım', code: '740', base: 8 },
    { name: 'Pazarlama', code: '760', base: 7 },
    { name: 'Yönetim Giderleri', code: '750', base: 6 },
    { name: 'Sigorta', code: '710', base: 3 },
    { name: 'Amortisman', code: '720', base: 5 },
    { name: 'Diğer', code: '780', base: 2 },
]

const PAYMENT_METHODS = [
    { method: 'Kredi Kartı', color: '#3b82f6', base: 45 },
    { method: 'Banka Havalesi/EFT', color: '#10b981', base: 25 },
    { method: 'Nakit', color: '#f59e0b', base: 15 },
    { method: 'Tur Operatörü', color: '#8b5cf6', base: 10 },
    { method: 'Çek', color: '#ef4444', base: 5 },
]

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

// Season multipliers (resort peaks in summer)
const SEASON_MULT = [0.15, 0.15, 0.25, 0.55, 0.75, 0.95, 1.0, 1.0, 0.85, 0.60, 0.20, 0.15]

function generateMonthlyData(baseRevenue: number, baseExpense: number, year: number): MonthlyFinance[] {
    const rngY = seededRandom(year * 100)
    return MONTHS.map((month, i) => {
        const mult = SEASON_MULT[i]
        const rev = Math.round(baseRevenue * mult * (0.92 + rngY() * 0.16))
        const exp = Math.round(baseExpense * mult * (0.90 + rngY() * 0.20))
        return {
            month,
            revenue: rev,
            expense: exp,
            profit: rev - exp,
            prevYearRevenue: 0,
            prevYearExpense: 0,
        }
    })
}

function generateTrialBalance(): TrialBalanceRow[] {
    const rows: TrialBalanceRow[] = []

    // Revenue accounts (600-699)
    const revenueAccounts = [
        { accountCode: '600.01', accountName: 'Oda Gelifleri', group: 'Gelir' },
        { accountCode: '600.02', accountName: 'Yiyecek Gelirleri', group: 'Gelir' },
        { accountCode: '600.03', accountName: 'İçecek Gelirleri', group: 'Gelir' },
        { accountCode: '600.04', accountName: 'SPA Gelirleri', group: 'Gelir' },
        { accountCode: '600.05', accountName: 'Toplantı Gelirleri', group: 'Gelir' },
        { accountCode: '600.06', accountName: 'Diğer Gelirler', group: 'Gelir' },
    ]

    // Expense accounts (700-799)
    const expenseAccounts = [
        { accountCode: '770.01', accountName: 'Personel Ücretleri', group: 'Gider' },
        { accountCode: '770.02', accountName: 'SGK İşveren Payı', group: 'Gider' },
        { accountCode: '620.01', accountName: 'Yiyecek Maliyeti', group: 'Gider' },
        { accountCode: '620.02', accountName: 'İçecek Maliyeti', group: 'Gider' },
        { accountCode: '730.01', accountName: 'Elektrik Gideri', group: 'Gider' },
        { accountCode: '730.02', accountName: 'Doğalgaz Gideri', group: 'Gider' },
        { accountCode: '740.01', accountName: 'Bakım Onarım', group: 'Gider' },
        { accountCode: '760.01', accountName: 'Reklam & Pazarlama', group: 'Gider' },
        { accountCode: '750.01', accountName: 'Genel Yönetim Gideri', group: 'Gider' },
    ]

    // Balance Sheet accounts
    const balanceAccounts = [
        { accountCode: '100.01', accountName: 'Kasa - TRY', group: 'Aktif' },
        { accountCode: '102.01', accountName: 'Bankalar - TRY', group: 'Aktif' },
        { accountCode: '102.02', accountName: 'Bankalar - EUR', group: 'Aktif' },
        { accountCode: '120.01', accountName: 'Alıcılar', group: 'Aktif' },
        { accountCode: '150.01', accountName: 'Stoklar', group: 'Aktif' },
        { accountCode: '320.01', accountName: 'Satıcılar', group: 'Pasif' },
        { accountCode: '335.01', accountName: 'Personele Borçlar', group: 'Pasif' },
        { accountCode: '360.01', accountName: 'Vergi Borçları', group: 'Pasif' },
    ]

    for (const acc of revenueAccounts) {
        const credit = randBetween(1500000, 8000000)
        rows.push({ ...acc, debit: 0, credit, balance: -credit })
    }
    for (const acc of expenseAccounts) {
        const debit = randBetween(500000, 3000000)
        rows.push({ ...acc, debit, credit: 0, balance: debit })
    }
    for (const acc of balanceAccounts) {
        const debit = randBetween(200000, 5000000)
        const credit = randBetween(100000, 4000000)
        rows.push({ ...acc, debit, credit, balance: debit - credit })
    }

    return rows
}

function generatePayments(date: string): PaymentRow[] {
    const count = randBetween(15, 40)
    const payments: PaymentRow[] = []
    const methods = ['Kredi Kartı', 'Nakit', 'Havale/EFT', 'POS', 'Tur Operatörü']

    for (let i = 0; i < count; i++) {
        const isDebit = rng() > 0.3
        const amount = randFloat(500, 50000)
        payments.push({
            date,
            type: isDebit ? 'Payment Total' : 'Collected Advance',
            info: `${methods[Math.floor(rng() * methods.length)]} - Misafir #${randBetween(1000, 9999)}`,
            account: `${isDebit ? '108' : '340'}.${String(randBetween(1, 20)).padStart(4, '0')}`,
            debit: isDebit ? amount : 0,
            credit: isDebit ? 0 : amount,
            currency: 'TRY',
            currencyRate: 1,
            paymentName: methods[Math.floor(rng() * methods.length)],
            paymentCode: `108.${String(randBetween(1, 20)).padStart(4, '0')}`,
        })
    }
    return payments
}

function generateRevenue(date: string): RevenueRow[] {
    const rows: RevenueRow[] = []
    const depts = [
        { id: 58300, name: 'Room Oda Revenue', rev: 66953 },
        { id: 58301, name: 'Food Yiyecek Revenue', rev: 66954 },
        { id: 58302, name: 'Beverage İçecek Revenue', rev: 66955 },
        { id: 58303, name: 'SPA Revenue', rev: 66956 },
        { id: 58304, name: 'Minibar Revenue', rev: 66957 },
    ]
    for (const dept of depts) {
        const credit = randFloat(5000, 80000)
        rows.push({
            date,
            type: 'Revenue',
            info: dept.name,
            departmentId: dept.id,
            revenueId: dept.rev,
            account: '181.0001',
            debit: 0,
            credit,
            currency: 'TRY',
            currencyRate: 1,
            expenseCode: null,
            vat1Percent: 20,
            vat2Percent: 0,
        })
    }
    return rows
}

function generateInvoices(startDate: string, endDate: string): InvoiceSummary[] {
    const invoices: InvoiceSummary[] = []
    const vendors = [
        'Metro Grossmarket', 'Özgür Et', 'Bodrum Hal', 'Efes Pilsen',
        'Diversey', 'Özdilek', 'Enerjisa', 'Borusan Lojistik',
        'Servis Bakım A.Ş.', 'Bodrum Balık', 'Muratbey Gıda',
    ]
    const count = randBetween(60, 120)
    const start = new Date(startDate)
    const end = new Date(endDate)
    const range = end.getTime() - start.getTime()

    for (let i = 0; i < count; i++) {
        const d = new Date(start.getTime() + rng() * range)
        invoices.push({
            id: randBetween(3000000, 4000000),
            uuid: `${randBetween(10000000, 99999999).toString(16)}-${randBetween(1000, 9999).toString(16)}-${randBetween(1000, 9999).toString(16)}-${randBetween(1000, 9999).toString(16)}-${randBetween(100000000000, 999999999999).toString(16)}`,
            date: d.toISOString().split('T')[0],
            accountName: vendors[Math.floor(rng() * vendors.length)],
            accountCode: `320.${String(randBetween(1, 200)).padStart(4, '0')}`,
            taxNumber: String(randBetween(10000000000, 99999999999)),
            total: randFloat(1000, 150000),
        })
    }
    return invoices.sort((a, b) => b.date.localeCompare(a.date))
}

// ─── Data Source Tracking ──────────────────────────────────────

let currentDataSource: DataSource = 'demo'

// ─── Exported Service ──────────────────────────────────────────

export const FinanceService = {
    get dataSource(): DataSource {
        return currentDataSource
    },

    // ── Trial Balance (Mizan) ────────────────────────────────────
    async getTrialBalance(fromDate: string, toDate: string): Promise<TrialBalanceRow[]> {
        if (erpStock.isConfigured) {
            try {
                const result = await erpStock.execute('SP_EASYPMS_ACCOUNT_TRIALBALANCE4', {
                    FROMDATE: fromDate,
                    TODATE: toDate,
                    FROMCODE: '',
                    TOCODE: 'zzz',
                })
                if (result && Array.isArray(result)) {
                    const parsed = result.flat?.() ?? result
                    const returnData = parsed.find?.((r: any) => r?.Return || r?.BODY)
                    if (returnData) {
                        const body = typeof (returnData.Return || returnData.BODY) === 'string'
                            ? JSON.parse(returnData.Return || returnData.BODY)
                            : (returnData.Return || returnData.BODY)
                        if (body?.ACCOUNTS && Array.isArray(body.ACCOUNTS)) {
                            currentDataSource = 'live'
                            return body.ACCOUNTS.map((acc: any) => ({
                                accountCode: acc.CODE || acc.AccountCode || '',
                                accountName: acc.NAME || acc.AccountName || '',
                                debit: acc.DEBIT || 0,
                                credit: acc.CREDIT || 0,
                                balance: (acc.DEBIT || 0) - (acc.CREDIT || 0),
                                group: (acc.CODE || '').startsWith('6') ? 'Gelir'
                                    : (acc.CODE || '').startsWith('7') ? 'Gider'
                                        : parseInt(acc.CODE || '0') < 300 ? 'Aktif' : 'Pasif',
                            }))
                        }
                    }
                }
            } catch (err) {
                console.warn('[Finance] Trial balance error:', (err as Error).message)
            }
        }
        currentDataSource = 'demo'
        return generateTrialBalance()
    },

    // ── Daily Payments (Tahsilat) ────────────────────────────────
    async getDailyPayments(date: string): Promise<PaymentRow[]> {
        if (erpFront.isConfigured) {
            try {
                const result = await erpFront.request({
                    Action: 'Function',
                    Object: 'FN_EASYPMS_HOTELPAYMENT_DAILYACCOUNTING',
                    Parameters: {
                        TDATE: date,
                        DETAIL: 1,
                        TYPE: 0,
                        DETAILED_DAILY_PAYMENT_INTEGRATION_ACTIVE: 0,
                    }
                })
                if (result && Array.isArray(result)) {
                    const rows = result.flat?.() ?? result
                    if (rows.length > 0 && rows[0]?.SORTORDER !== undefined) {
                        currentDataSource = 'live'
                        return rows.map((r: any) => ({
                            date: r.TDATE || date,
                            type: r.TTYPE || '',
                            info: r.INFO || '',
                            account: r.ACCOUNT || '',
                            debit: r.DEBIT || 0,
                            credit: r.CREDIT || 0,
                            currency: r.CURRENCY || 'TRY',
                            currencyRate: r.CURRENCYRATE || 1,
                            paymentName: r.PAYMENTNAME || '',
                            paymentCode: r.PAYMENTCODE || '',
                        }))
                    }
                }
            } catch (err) {
                console.warn('[Finance] Payments error:', (err as Error).message)
            }
        }
        currentDataSource = 'demo'
        return generatePayments(date)
    },

    // ── Daily Revenue (Gelir) ────────────────────────────────────
    async getDailyRevenue(date: string): Promise<RevenueRow[]> {
        if (erpFront.isConfigured) {
            try {
                const result = await erpFront.request({
                    Action: 'Execute',
                    Object: 'SP_EASYPMS_DAILYACCOUNTING',
                    Parameters: {
                        TDATE: date,
                        SHOWDEPARTMENTS: 1,
                        SHOWVATDETAILS: 1,
                        SHOWCLACCOUNTS: 1,
                    }
                })
                if (result && Array.isArray(result)) {
                    const rows = result.flat?.() ?? result
                    if (rows.length > 0 && rows[0]?.SORTORDER !== undefined) {
                        currentDataSource = 'live'
                        return rows.map((r: any) => ({
                            date: r.TDATE || date,
                            type: r.TTYPE || '',
                            info: r.INFO || '',
                            departmentId: r.DEPID || 0,
                            revenueId: r.REVID || 0,
                            account: r.ACCOUNT || '',
                            debit: r.DEBIT || 0,
                            credit: r.CREDIT || 0,
                            currency: r.CURRENCY || 'TRY',
                            currencyRate: r.CURRENCYRATE || 1,
                            expenseCode: r.EXPENSECODE || null,
                            vat1Percent: r.VAT1PERCENT || 0,
                            vat2Percent: r.VAT2PERCENT || 0,
                        }))
                    }
                }
            } catch (err) {
                console.warn('[Finance] Revenue error:', (err as Error).message)
            }
        }
        currentDataSource = 'demo'
        return generateRevenue(date)
    },

    // ── Invoice List (Fatura Listesi) ────────────────────────────
    async getInvoiceList(startDate: string, endDate: string): Promise<InvoiceSummary[]> {
        if (erpStock.isConfigured) {
            try {
                const result = await erpStock.request({
                    Action: 'Function',
                    Object: 'FN_ACCOUNTING_GET_INVOICE_LIST',
                    Parameters: {
                        STARTDATE: startDate,
                        ENDDATE: endDate,
                        _OFFSET: 0,
                        _NEXT: 500,
                    }
                })
                if (result && Array.isArray(result)) {
                    const parsed = result.flat?.() ?? result
                    const returnData = parsed.find?.((r: any) => r?.Return)
                    if (returnData) {
                        const body = typeof returnData.Return === 'string'
                            ? JSON.parse(returnData.Return) : returnData.Return
                        if (body?.Invoices && Array.isArray(body.Invoices)) {
                            currentDataSource = 'live'
                            return body.Invoices.map((inv: any) => ({
                                id: inv.ID || 0,
                                uuid: inv.UUID || '',
                                date: inv.InvoiceDate || '',
                                accountName: inv.AccountName || '',
                                accountCode: inv.AccountCode || '',
                                taxNumber: inv.TaxNumber || '',
                                total: inv.Total || 0,
                            }))
                        }
                    }
                }
            } catch (err) {
                console.warn('[Finance] Invoice list error:', (err as Error).message)
            }
        }
        currentDataSource = 'demo'
        return generateInvoices(startDate, endDate)
    },

    // ── Aggregated KPIs ──────────────────────────────────────────
    async getKPIs(year?: number): Promise<FinanceKPIs> {
        const y = year || new Date().getFullYear()
        const startDate = `${y}-01-01`
        const endDate = `${y}-12-31`
        const prevStartDate = `${y - 1}-01-01`
        const prevEndDate = `${y - 1}-12-31`

        const [trialBalance, invoices, prevInvoices] = await Promise.all([
            this.getTrialBalance(startDate, endDate),
            this.getInvoiceList(startDate, endDate),
            this.getInvoiceList(prevStartDate, prevEndDate),
        ])

        const revenueRows = trialBalance.filter(r => r.group === 'Gelir')
        const expenseRows = trialBalance.filter(r => r.group === 'Gider')

        const totalRevenue = revenueRows.reduce((s, r) => s + r.credit, 0)
        const totalExpense = expenseRows.reduce((s, r) => s + r.debit, 0)
        const profit = totalRevenue - totalExpense
        const profitMargin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0

        const currentTotal = invoices.reduce((s, i) => s + i.total, 0)
        const prevTotal = prevInvoices.reduce((s, i) => s + i.total, 0)
        const expenseGrowth = prevTotal > 0 ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100) : 0

        // Revenue growth estimate
        const revenueGrowth = randBetween(5, 18)

        return {
            totalRevenue,
            totalExpense,
            profitMargin,
            cashFlow: profit * 0.85,
            revenueGrowth,
            expenseGrowth,
            collectionRate: randFloat(88, 96),
            invoiceCount: invoices.length,
        }
    },

    // ── Monthly Finance Data ─────────────────────────────────────
    async getMonthlyData(year?: number): Promise<MonthlyFinance[]> {
        const y = year || new Date().getFullYear()

        // Base annual values — 370 room ultra all-inclusive resort
        // ~₺250M annual revenue, ~₺180M annual expense
        const baseRevenue = 250_000_000 / 12
        const baseExpense = 180_000_000 / 12

        const currentData = generateMonthlyData(baseRevenue, baseExpense, y)
        const prevData = generateMonthlyData(baseRevenue * 0.85, baseExpense * 0.82, y - 1)

        return currentData.map((m, i) => ({
            ...m,
            prevYearRevenue: prevData[i].revenue,
            prevYearExpense: prevData[i].expense,
        }))
    },

    // ── Department Revenue Breakdown ─────────────────────────────
    async getDepartmentRevenue(): Promise<DepartmentRevenue[]> {
        const totalRevenue = randBetween(20_000_000, 35_000_000)
        let remaining = 100

        return DEPARTMENTS.map((dept, i) => {
            const pct = i === DEPARTMENTS.length - 1
                ? remaining
                : Math.round(dept.base * (0.9 + rng() * 0.2))
            remaining -= pct
            return {
                department: dept.name,
                revenue: Math.round(totalRevenue * pct / 100),
                percentage: pct,
                color: dept.color,
            }
        })
    },

    // ── Payment Method Breakdown ─────────────────────────────────
    async getPaymentMethodBreakdown(): Promise<PaymentMethodBreakdown[]> {
        const totalPayments = randBetween(15_000_000, 25_000_000)
        const totalCount = randBetween(2000, 5000)
        let remaining = 100

        return PAYMENT_METHODS.map((pm, i) => {
            const pct = i === PAYMENT_METHODS.length - 1
                ? remaining
                : Math.round(pm.base * (0.85 + rng() * 0.3))
            remaining -= pct
            return {
                method: pm.method,
                amount: Math.round(totalPayments * pct / 100),
                count: Math.round(totalCount * pct / 100),
                percentage: pct,
                color: pm.color,
            }
        })
    },

    // ── Expense Category Breakdown ───────────────────────────────
    async getExpenseBreakdown(): Promise<{ category: string; code: string; amount: number; percentage: number; color: string }[]> {
        const totalExpense = randBetween(12_000_000, 20_000_000)
        const colors = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#6b7280']
        let remaining = 100

        return EXPENSE_CATEGORIES.map((cat, i) => {
            const pct = i === EXPENSE_CATEGORIES.length - 1
                ? remaining
                : Math.round(cat.base * (0.88 + rng() * 0.24))
            remaining -= pct
            return {
                category: cat.name,
                code: cat.code,
                amount: Math.round(totalExpense * pct / 100),
                percentage: pct,
                color: colors[i % colors.length],
            }
        })
    },
}
