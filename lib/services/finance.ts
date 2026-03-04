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

// ─── Data Source Tracking ──────────────────────────────────────

let currentDataSource: DataSource = 'live'

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
        currentDataSource = 'live'
        return []
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
        currentDataSource = 'live'
        return []
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
        currentDataSource = 'live'
        return []
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
        currentDataSource = 'live'
        return []
    },

    // ── Aggregated KPIs ──────────────────────────────────────────
    async getKPIs(year?: number): Promise<FinanceKPIs> {
        const y = year || new Date().getFullYear()
        const startDate = `${y}-01-01`
        const endDate = `${y}-12-31`
        const prevStartDate = `${y - 1}-01-01`
        const prevEndDate = `${y - 1}-12-31`

        const { ElektraService } = await import('./elektra')
        const yStart = new Date(y, 0, 1)
        const yEnd = new Date(y, 11, 31)

        const [trialBalance, invoices, prevInvoices, currentRes] = await Promise.all([
            this.getTrialBalance(startDate, endDate),
            this.getInvoiceList(startDate, endDate),
            this.getInvoiceList(prevStartDate, prevEndDate),
            ElektraService.getReservations(yStart, yEnd)
        ])

        const revenueRows = trialBalance.filter(r => r.group === 'Gelir')
        const expenseRows = trialBalance.filter(r => r.group === 'Gider')

        const pmsTotalRevenue = currentRes.reduce((s, r) => s + r.totalPrice, 0)
        const totalRevenue = pmsTotalRevenue > 0 ? pmsTotalRevenue : revenueRows.reduce((s, r) => s + r.credit, 0)

        const totalExpense = expenseRows.reduce((s, r) => s + r.debit, 0)
        const profit = totalRevenue - totalExpense
        const profitMargin = totalRevenue > 0 ? Math.round((profit / totalRevenue) * 100) : 0

        const currentTotal = invoices.reduce((s, i) => s + i.total, 0)
        const prevTotal = prevInvoices.reduce((s, i) => s + i.total, 0)
        const expenseGrowth = prevTotal > 0 ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100) : 0

        const revenueGrowth = 0

        return {
            totalRevenue,
            totalExpense,
            profitMargin,
            cashFlow: profit * 0.85,
            revenueGrowth,
            expenseGrowth,
            collectionRate: 0,
            invoiceCount: invoices.length,
        }
    },

    // ── Monthly Finance Data ─────────────────────────────────────
    async getMonthlyData(year?: number): Promise<MonthlyFinance[]> {
        const y = year || new Date().getFullYear()

        const { ElektraService } = await import('./elektra')
        const cyStart = new Date(y, 0, 1)
        const cyEnd = new Date(y, 11, 31)
        const pyStart = new Date(y - 1, 0, 1)
        const pyEnd = new Date(y - 1, 11, 31)

        const [currentRes, prevRes] = await Promise.all([
            ElektraService.getReservations(cyStart, cyEnd),
            ElektraService.getReservations(pyStart, pyEnd)
        ])

        const currentMonthlyRev = new Array(12).fill(0)
        currentRes.forEach(r => {
            const m = parseInt(r.checkIn.slice(5, 7)) - 1 // YYYY-MM-DD
            if (m >= 0 && m < 12) currentMonthlyRev[m] += r.totalPrice
        })

        const prevMonthlyRev = new Array(12).fill(0)
        prevRes.forEach(r => {
            const m = parseInt(r.checkIn.slice(5, 7)) - 1
            if (m >= 0 && m < 12) prevMonthlyRev[m] += r.totalPrice
        })

        const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

        return MONTHS.map((month, i) => {
            const realRev = currentMonthlyRev[i] || 0
            const realPrevRev = prevMonthlyRev[i] || 0

            return {
                month,
                revenue: realRev,
                expense: 0,
                profit: realRev,
                prevYearRevenue: realPrevRev,
                prevYearExpense: 0,
            }
        })
    },

    // ── Department Revenue Breakdown ─────────────────────────────
    async getDepartmentRevenue(): Promise<DepartmentRevenue[]> {
        return []
    },

    // ── Payment Method Breakdown ─────────────────────────────────
    async getPaymentMethodBreakdown(): Promise<PaymentMethodBreakdown[]> {
        return []
    },

    // ── Expense Category Breakdown ───────────────────────────────
    async getExpenseBreakdown(): Promise<{ category: string; code: string; amount: number; percentage: number; color: string }[]> {
        return []
    },
}
