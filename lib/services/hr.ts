// ─── Human Resources Service ───────────────────────────────────
// İnsan Kaynakları Raporları — Blue Dreams Resort (341 oda, Ultra All-Inclusive)
//
// NOTE: Elektra ERP has NO direct HR API. Personnel data is derived from:
// - Account codes: 335.x (Personnel Payables), 770.x (Personnel Expenses)
// - Expense centers for department breakdown
// - Seasonal staffing patterns (resort operates Apr-Oct)

import { ElektraERP, ERP_API_KEY_STOCK } from './purchasing'

// ─── Types ─────────────────────────────────────────────────────

export type Department =
    | 'Ön Büro'
    | 'Kat Hizmetleri'
    | 'Yiyecek & İçecek'
    | 'Mutfak'
    | 'SPA & Wellness'
    | 'Teknik'
    | 'Güvenlik'
    | 'Bahçe & Havuz'
    | 'Muhasebe'
    | 'Satış & Pazarlama'
    | 'İnsan Kaynakları'
    | 'Yönetim'
    | 'Animasyon'

export interface DepartmentData {
    name: Department
    headCount: number
    seasonalAdd: number // Extra staff in season
    avgSalary: number  // TRY monthly
    color: string
    icon: string
}

export interface PersonnelCost {
    category: string
    code: string
    amount: number
    percentage: number
    description: string
}

export interface MonthlyHR {
    month: string
    totalStaff: number
    totalCost: number
    avgCostPerPerson: number
    prevYearStaff: number
    prevYearCost: number
}

export interface HRKPIs {
    totalStaff: number
    seasonalStaff: number
    totalCost: number
    avgCostPerPerson: number
    sgkCost: number
    revenuePerEmployee: number
    staffTurnover: number
    costGrowth: number
}

export interface PositionDistribution {
    position: string
    count: number
    percentage: number
    color: string
}

export interface DepartmentPerformance {
    department: string
    headCount: number
    totalCost: number
    revenueGenerated: number
    costPerEmployee: number
    revenuePerEmployee: number
    efficiency: number // revenue / cost ratio
    color: string
}

export type DataSource = 'live' | 'demo'

// ─── Config ────────────────────────────────────────────────────

const erpClient = new ElektraERP(ERP_API_KEY_STOCK)

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
const rng = seededRandom(daySeed + 777) // Different seed from finance
const randBetween = (min: number, max: number) => Math.round(min + rng() * (max - min))

// ─── Static Department Data ────────────────────────────────────
// Blue Dreams Resort: 341 rooms, Ultra AI, ~380 permanent + 120 seasonal

const DEPARTMENTS: DepartmentData[] = [
    { name: 'Ön Büro', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#3b82f6', icon: '🏨' },
    { name: 'Kat Hizmetleri', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#8b5cf6', icon: '🛏️' },
    { name: 'Yiyecek & İçecek', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#10b981', icon: '🍽️' },
    { name: 'Mutfak', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#f59e0b', icon: '👨‍🍳' },
    { name: 'SPA & Wellness', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#ec4899', icon: '💆' },
    { name: 'Teknik', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#6366f1', icon: '🔧' },
    { name: 'Güvenlik', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#ef4444', icon: '🛡️' },
    { name: 'Bahçe & Havuz', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#14b8a6', icon: '🌿' },
    { name: 'Muhasebe', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#f97316', icon: '📊' },
    { name: 'Satış & Pazarlama', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#06b6d4', icon: '📣' },
    { name: 'İnsan Kaynakları', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#a855f7', icon: '👥' },
    { name: 'Yönetim', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#1e40af', icon: '💼' },
    { name: 'Animasyon', headCount: 0, seasonalAdd: 0, avgSalary: 0, color: '#eab308', icon: '🎭' },
]

const POSITION_TITLES = [
    { position: 'Genel Müdür & Müdür Yardımcıları', count: 0, color: '#1e40af' },
    { position: 'Departman Müdürleri', count: 0, color: '#3b82f6' },
    { position: 'Şef & Supervisor', count: 0, color: '#6366f1' },
    { position: 'Uzman & Teknisyen', count: 0, color: '#8b5cf6' },
    { position: 'Personel', count: 0, color: '#a855f7' },
    { position: 'Sezonluk Personel', count: 0, color: '#d946ef' },
    { position: 'Stajyer', count: 0, color: '#ec4899' },
]

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

// Season staffing multipliers
const STAFF_MULT = [0.80, 0.80, 0.85, 0.95, 1.00, 1.10, 1.15, 1.15, 1.05, 0.90, 0.82, 0.80]

// ─── Cost Calculations ─────────────────────────────────────────

const SGK_EMPLOYER_RATE = 0.225 // 22.5% employer SSI contribution
const INCOME_TAX_AVG = 0.20 // Average income tax rate
const STAMP_TAX = 0.00759 // Damga Vergisi
const UNEMPLOYMENT_INS = 0.02 // İşsizlik Sigortası (employer)

function calculateTotalCost(grossSalary: number): {
    gross: number
    sgkEmployer: number
    incomeTax: number
    stampTax: number
    unemploymentIns: number
    totalCost: number
} {
    const sgkEmployer = grossSalary * SGK_EMPLOYER_RATE
    const incomeTax = grossSalary * INCOME_TAX_AVG
    const stampTax = grossSalary * STAMP_TAX
    const unemploymentIns = grossSalary * UNEMPLOYMENT_INS
    return {
        gross: grossSalary,
        sgkEmployer,
        incomeTax,
        stampTax,
        unemploymentIns,
        totalCost: grossSalary + sgkEmployer + unemploymentIns,
    }
}

// ─── Data Source Tracking ──────────────────────────────────────

let currentDataSource: DataSource = 'live'

// ─── Exported Service ──────────────────────────────────────────

export const HRService = {
    get dataSource(): DataSource {
        return currentDataSource
    },

    // ── Department Data ──────────────────────────────────────────
    getDepartments(): DepartmentData[] {
        return DEPARTMENTS
    },

    // ── Personnel Costs (from Trial Balance accounts) ────────────
    async getPersonnelCosts(fromDate: string, toDate: string): Promise<PersonnelCost[]> {
        if (erpClient.isConfigured) {
            try {
                const result = await erpClient.execute('SP_EASYPMS_ACCOUNT_TRIALBALANCE4', {
                    FROMDATE: fromDate,
                    TODATE: toDate,
                    FROMCODE: '335',
                    TOCODE: '780',
                })
                if (result && Array.isArray(result)) {
                    const parsed = result.flat?.() ?? result
                    const returnData = parsed.find?.((r: any) => r?.Return || r?.BODY)
                    if (returnData) {
                        const body = typeof (returnData.Return || returnData.BODY) === 'string'
                            ? JSON.parse(returnData.Return || returnData.BODY)
                            : (returnData.Return || returnData.BODY)
                        if (body?.ACCOUNTS) {
                            const hrAccounts = body.ACCOUNTS.filter((acc: any) => {
                                const code = acc.CODE || ''
                                return code.startsWith('335') || code.startsWith('360') ||
                                    code.startsWith('770') || code.startsWith('771')
                            })
                            if (hrAccounts.length > 0) {
                                currentDataSource = 'live'
                                const total = hrAccounts.reduce((s: number, a: any) => s + (a.DEBIT || 0), 0)
                                return hrAccounts.map((acc: any) => ({
                                    category: acc.NAME || '',
                                    code: acc.CODE || '',
                                    amount: acc.DEBIT || 0,
                                    percentage: total > 0 ? Math.round(((acc.DEBIT || 0) / total) * 100) : 0,
                                    description: acc.NAME || '',
                                }))
                            }
                        }
                    }
                }
            } catch (err) {
                console.warn('[HR] Personnel costs error:', (err as Error).message)
            }
        }

        currentDataSource = 'live'
        return []
    },

    // ── KPIs ─────────────────────────────────────────────────────
    async getKPIs(): Promise<HRKPIs> {
        return {
            totalStaff: 0,
            seasonalStaff: 0,
            totalCost: 0,
            avgCostPerPerson: 0,
            sgkCost: 0,
            revenuePerEmployee: 0,
            staffTurnover: 0,
            costGrowth: 0,
        }
    },

    // ── Monthly HR Data ──────────────────────────────────────────
    async getMonthlyData(year?: number): Promise<MonthlyHR[]> {
        return MONTHS.map((month) => ({
            month,
            totalStaff: 0,
            totalCost: 0,
            avgCostPerPerson: 0,
            prevYearStaff: 0,
            prevYearCost: 0,
        }))
    },

    // ── Position Distribution ────────────────────────────────────
    getPositionDistribution(): PositionDistribution[] {
        const total = POSITION_TITLES.reduce((s, p) => s + p.count, 0)
        return POSITION_TITLES.map(p => ({
            ...p,
            percentage: Math.round((p.count / total) * 100),
        }))
    },

    // ── Department Performance ───────────────────────────────────
    async getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
        return DEPARTMENTS.map(dept => ({
            department: dept.name,
            headCount: 0,
            totalCost: 0,
            revenueGenerated: 0,
            costPerEmployee: 0,
            revenuePerEmployee: 0,
            efficiency: 0,
            color: dept.color,
        }))
    },

    // ── Seasonal Staffing Plan ───────────────────────────────────
    getSeasonalPlan(): { month: string; permanent: number; seasonal: number; total: number }[] {
        const permanentStaff = DEPARTMENTS.reduce((s, d) => s + d.headCount, 0)
        const seasonalStaff = DEPARTMENTS.reduce((s, d) => s + d.seasonalAdd, 0)

        return MONTHS.map((month, i) => {
            const mult = STAFF_MULT[i]
            const seasonal = Math.round(seasonalStaff * Math.max(0, (mult - 0.8) / 0.35))
            return {
                month,
                permanent: permanentStaff,
                seasonal,
                total: permanentStaff + seasonal,
            }
        })
    },

    // ── Industry Benchmarks ──────────────────────────────────────
    getBenchmarks(): { metric: string; hotel: number; industry: number; status: 'above' | 'below' | 'at' }[] {
        return [
            { metric: 'Oda Başına Personel', hotel: 0, industry: 1.2, status: 'below' },
            { metric: 'Personel Devir Oranı (%)', hotel: 0, industry: 25, status: 'below' },
            { metric: 'Kişi Başı Aylık Maliyet (₺)', hotel: 0, industry: 30000, status: 'below' },
            { metric: 'Personel Başı Gelir (₺/ay)', hotel: 0, industry: 42000, status: 'below' },
            { metric: 'Personel Maliyet / Gelir (%)', hotel: 0, industry: 33, status: 'below' },
            { metric: 'Sezonluk / Toplam Personel (%)', hotel: 0, industry: 30, status: 'below' },
        ]
    },
}
