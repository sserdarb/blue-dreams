// ─── Human Resources Service ───────────────────────────────────
// İnsan Kaynakları Raporları — Blue Dreams Resort (370 oda, Ultra All-Inclusive)
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
// Blue Dreams Resort: 370 rooms, Ultra AI, ~380 permanent + 120 seasonal

const DEPARTMENTS: DepartmentData[] = [
    { name: 'Ön Büro', headCount: 28, seasonalAdd: 8, avgSalary: 32000, color: '#3b82f6', icon: '🏨' },
    { name: 'Kat Hizmetleri', headCount: 65, seasonalAdd: 30, avgSalary: 25000, color: '#8b5cf6', icon: '🛏️' },
    { name: 'Yiyecek & İçecek', headCount: 55, seasonalAdd: 20, avgSalary: 28000, color: '#10b981', icon: '🍽️' },
    { name: 'Mutfak', headCount: 45, seasonalAdd: 15, avgSalary: 30000, color: '#f59e0b', icon: '👨‍🍳' },
    { name: 'SPA & Wellness', headCount: 18, seasonalAdd: 6, avgSalary: 30000, color: '#ec4899', icon: '💆' },
    { name: 'Teknik', headCount: 25, seasonalAdd: 5, avgSalary: 32000, color: '#6366f1', icon: '🔧' },
    { name: 'Güvenlik', headCount: 22, seasonalAdd: 4, avgSalary: 27000, color: '#ef4444', icon: '🛡️' },
    { name: 'Bahçe & Havuz', headCount: 20, seasonalAdd: 10, avgSalary: 24000, color: '#14b8a6', icon: '🌿' },
    { name: 'Muhasebe', headCount: 12, seasonalAdd: 2, avgSalary: 38000, color: '#f97316', icon: '📊' },
    { name: 'Satış & Pazarlama', headCount: 15, seasonalAdd: 3, avgSalary: 40000, color: '#06b6d4', icon: '📣' },
    { name: 'İnsan Kaynakları', headCount: 8, seasonalAdd: 2, avgSalary: 36000, color: '#a855f7', icon: '👥' },
    { name: 'Yönetim', headCount: 10, seasonalAdd: 0, avgSalary: 65000, color: '#1e40af', icon: '💼' },
    { name: 'Animasyon', headCount: 22, seasonalAdd: 15, avgSalary: 26000, color: '#eab308', icon: '🎭' },
]

const POSITION_TITLES = [
    { position: 'Genel Müdür & Müdür Yardımcıları', count: 5, color: '#1e40af' },
    { position: 'Departman Müdürleri', count: 13, color: '#3b82f6' },
    { position: 'Şef & Supervisor', count: 35, color: '#6366f1' },
    { position: 'Uzman & Teknisyen', count: 45, color: '#8b5cf6' },
    { position: 'Personel', count: 200, color: '#a855f7' },
    { position: 'Sezonluk Personel', count: 120, color: '#d946ef' },
    { position: 'Stajyer', count: 30, color: '#ec4899' },
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

let currentDataSource: DataSource = 'demo'

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

        // Demo data
        currentDataSource = 'demo'
        const totalGross = DEPARTMENTS.reduce((s, d) => s + d.headCount * d.avgSalary, 0)

        return [
            { category: 'Brüt Ücretler', code: '770.01', amount: totalGross, percentage: 55, description: 'Aylık brüt maaşlar toplamı' },
            { category: 'SGK İşveren Payı', code: '770.02', amount: Math.round(totalGross * SGK_EMPLOYER_RATE), percentage: 22, description: 'Sosyal güvenlik işveren payı (%22.5)' },
            { category: 'Gelir Vergisi', code: '770.03', amount: Math.round(totalGross * INCOME_TAX_AVG * 0.5), percentage: 10, description: 'Çalışan gelir vergisi kesintisi' },
            { category: 'İşsizlik Sigortası', code: '770.04', amount: Math.round(totalGross * UNEMPLOYMENT_INS), percentage: 3, description: 'İşsizlik sigortası işveren + işçi payı' },
            { category: 'Damga Vergisi', code: '770.05', amount: Math.round(totalGross * STAMP_TAX), percentage: 1, description: 'Damga vergisi kesintisi' },
            { category: 'Yemek & Servis', code: '770.06', amount: Math.round(totalGross * 0.06), percentage: 5, description: 'Personel yemek ve servis hizmetleri' },
            { category: 'Eğitim & Geliştirme', code: '770.07', amount: Math.round(totalGross * 0.02), percentage: 2, description: 'Eğitim programları ve sertifikalar' },
            { category: 'Diğer Yan Haklar', code: '770.08', amount: Math.round(totalGross * 0.03), percentage: 2, description: 'İkramiye, prim ve diğer yan haklar' },
        ]
    },

    // ── KPIs ─────────────────────────────────────────────────────
    async getKPIs(): Promise<HRKPIs> {
        const permanentStaff = DEPARTMENTS.reduce((s, d) => s + d.headCount, 0)
        const seasonalStaff = DEPARTMENTS.reduce((s, d) => s + d.seasonalAdd, 0)
        const currentMonth = today.getMonth()
        const isHighSeason = currentMonth >= 4 && currentMonth <= 9
        const totalStaff = isHighSeason ? permanentStaff + seasonalStaff : permanentStaff

        const totalMonthlyCost = DEPARTMENTS.reduce((s, d) => {
            const count = isHighSeason ? d.headCount + d.seasonalAdd : d.headCount
            const costs = calculateTotalCost(d.avgSalary)
            return s + count * costs.totalCost
        }, 0)

        const sgkCost = DEPARTMENTS.reduce((s, d) => {
            const count = isHighSeason ? d.headCount + d.seasonalAdd : d.headCount
            return s + count * d.avgSalary * SGK_EMPLOYER_RATE
        }, 0)

        // Approximate annual revenue for RevPAR per employee
        const annualRevenue = 250_000_000 // ₺250M annual revenue estimate

        return {
            totalStaff,
            seasonalStaff,
            totalCost: totalMonthlyCost,
            avgCostPerPerson: Math.round(totalMonthlyCost / totalStaff),
            sgkCost: Math.round(sgkCost),
            revenuePerEmployee: Math.round(annualRevenue / totalStaff / 12),
            staffTurnover: randBetween(12, 22), // %
            costGrowth: randBetween(25, 45), // % YoY (driven by min wage increases)
        }
    },

    // ── Monthly HR Data ──────────────────────────────────────────
    async getMonthlyData(year?: number): Promise<MonthlyHR[]> {
        const y = year || today.getFullYear()
        const permanentStaff = DEPARTMENTS.reduce((s, d) => s + d.headCount, 0)
        const seasonalStaff = DEPARTMENTS.reduce((s, d) => s + d.seasonalAdd, 0)
        const avgMonthlyCost = DEPARTMENTS.reduce((s, d) => {
            const costs = calculateTotalCost(d.avgSalary)
            return s + d.headCount * costs.totalCost
        }, 0)

        const rngY = seededRandom(y * 100 + 333)
        const rngPrev = seededRandom((y - 1) * 100 + 333)

        return MONTHS.map((month, i) => {
            const staffMult = STAFF_MULT[i]
            const totalStaff = Math.round(permanentStaff + seasonalStaff * Math.max(0, (staffMult - 0.8) / 0.35))
            const totalCost = Math.round(avgMonthlyCost * staffMult * (0.95 + rngY() * 0.1))
            const avgCostPerPerson = Math.round(totalCost / totalStaff)

            const prevStaff = Math.round((permanentStaff * 0.95) + (seasonalStaff * 0.9) * Math.max(0, (staffMult - 0.8) / 0.35))
            const prevCost = Math.round(avgMonthlyCost * 0.75 * staffMult * (0.95 + rngPrev() * 0.1))

            return {
                month,
                totalStaff,
                totalCost,
                avgCostPerPerson,
                prevYearStaff: prevStaff,
                prevYearCost: prevCost,
            }
        })
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
        // Revenue generating departments and their contribution
        const revenueMap: Record<string, number> = {
            'Ön Büro': 0.45, // Room revenue
            'Yiyecek & İçecek': 0.20,
            'Mutfak': 0.10,
            'SPA & Wellness': 0.08,
            'Animasyon': 0.05,
            'Satış & Pazarlama': 0.07,
        }
        const annualRevenue = 250_000_000

        return DEPARTMENTS.map(dept => {
            const headCount = dept.headCount + (today.getMonth() >= 4 && today.getMonth() <= 9 ? dept.seasonalAdd : 0)
            const costs = calculateTotalCost(dept.avgSalary)
            const totalCost = headCount * costs.totalCost
            const revenueGenerated = Math.round(annualRevenue / 12 * (revenueMap[dept.name] || 0.01))
            const costPerEmployee = Math.round(costs.totalCost)
            const revenuePerEmployee = headCount > 0 ? Math.round(revenueGenerated / headCount) : 0
            const efficiency = totalCost > 0 ? +(revenueGenerated / totalCost).toFixed(2) : 0

            return {
                department: dept.name,
                headCount,
                totalCost,
                revenueGenerated,
                costPerEmployee,
                revenuePerEmployee,
                efficiency,
                color: dept.color,
            }
        }).sort((a, b) => b.efficiency - a.efficiency)
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
        const kpis: HRKPIs = {
            totalStaff: DEPARTMENTS.reduce((s, d) => s + d.headCount + d.seasonalAdd, 0),
            seasonalStaff: DEPARTMENTS.reduce((s, d) => s + d.seasonalAdd, 0),
            totalCost: 0,
            avgCostPerPerson: 32000,
            sgkCost: 0,
            revenuePerEmployee: 47000,
            staffTurnover: 18,
            costGrowth: 35,
        }

        return [
            { metric: 'Oda Başına Personel', hotel: +(kpis.totalStaff / 370).toFixed(2), industry: 1.2, status: kpis.totalStaff / 370 <= 1.2 ? 'at' : 'above' },
            { metric: 'Personel Devir Oranı (%)', hotel: kpis.staffTurnover, industry: 25, status: kpis.staffTurnover < 25 ? 'above' : 'below' },
            { metric: 'Kişi Başı Aylık Maliyet (₺)', hotel: kpis.avgCostPerPerson, industry: 30000, status: kpis.avgCostPerPerson <= 30000 ? 'above' : 'below' },
            { metric: 'Personel Başı Gelir (₺/ay)', hotel: kpis.revenuePerEmployee, industry: 42000, status: kpis.revenuePerEmployee >= 42000 ? 'above' : 'below' },
            { metric: 'Personel Maliyet / Gelir (%)', hotel: 35, industry: 33, status: 35 <= 33 ? 'above' : 'below' },
            { metric: 'Sezonluk / Toplam Personel (%)', hotel: Math.round(kpis.seasonalStaff / kpis.totalStaff * 100), industry: 30, status: 'at' },
        ]
    },
}
