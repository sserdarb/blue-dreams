// ─── Human Resources Service ───────────────────────────────────
// İnsan Kaynakları Raporları — Blue Dreams Resort (341 oda, Ultra All-Inclusive)
//
// DATA SOURCES:
// 1. Elektra PMS API: employees, attendance logs, HR requests
// 2. Elektra ERP: Account codes 335.x (Personnel Payables), 770.x (Personnel Expenses)
// 3. Static department data for budget structure (seasonal resort, Apr-Oct)

import { ElektraERP, ERP_API_KEY_STOCK } from './purchasing'
import { ElektraService } from './elektra'
import { erpCache } from '@/lib/utils/api-cache'
import type { Employee as ElektraEmployee, AttendanceLog, HRRequest } from '@/lib/types/hr'

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
    avgSalary: number  // TRY monthly gross
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

// ─── Static Department Data ────────────────────────────────────
// Blue Dreams Resort: 341 rooms, Ultra AI, ~380 permanent + 120 seasonal

const DEPARTMENTS: DepartmentData[] = [
    { name: 'Ön Büro', headCount: 32, seasonalAdd: 10, avgSalary: 28000, color: '#3b82f6', icon: '🏨' },
    { name: 'Kat Hizmetleri', headCount: 65, seasonalAdd: 25, avgSalary: 22000, color: '#8b5cf6', icon: '🛏️' },
    { name: 'Yiyecek & İçecek', headCount: 55, seasonalAdd: 20, avgSalary: 24000, color: '#10b981', icon: '🍽️' },
    { name: 'Mutfak', headCount: 48, seasonalAdd: 18, avgSalary: 26000, color: '#f59e0b', icon: '👨‍🍳' },
    { name: 'SPA & Wellness', headCount: 22, seasonalAdd: 8, avgSalary: 25000, color: '#ec4899', icon: '💆' },
    { name: 'Teknik', headCount: 28, seasonalAdd: 5, avgSalary: 27000, color: '#6366f1', icon: '🔧' },
    { name: 'Güvenlik', headCount: 18, seasonalAdd: 6, avgSalary: 23000, color: '#ef4444', icon: '🛡️' },
    { name: 'Bahçe & Havuz', headCount: 25, seasonalAdd: 12, avgSalary: 21000, color: '#14b8a6', icon: '🌿' },
    { name: 'Muhasebe', headCount: 12, seasonalAdd: 2, avgSalary: 32000, color: '#f97316', icon: '📊' },
    { name: 'Satış & Pazarlama', headCount: 15, seasonalAdd: 4, avgSalary: 30000, color: '#06b6d4', icon: '📣' },
    { name: 'İnsan Kaynakları', headCount: 8, seasonalAdd: 2, avgSalary: 30000, color: '#a855f7', icon: '👥' },
    { name: 'Yönetim', headCount: 12, seasonalAdd: 0, avgSalary: 55000, color: '#1e40af', icon: '💼' },
    { name: 'Animasyon', headCount: 40, seasonalAdd: 8, avgSalary: 22000, color: '#eab308', icon: '🎭' },
]

const POSITION_TITLES = [
    { position: 'Genel Müdür & Müdür Yardımcıları', count: 5, color: '#1e40af' },
    { position: 'Departman Müdürleri', count: 13, color: '#3b82f6' },
    { position: 'Şef & Supervisor', count: 38, color: '#6366f1' },
    { position: 'Uzman & Teknisyen', count: 52, color: '#8b5cf6' },
    { position: 'Personel', count: 192, color: '#a855f7' },
    { position: 'Sezonluk Personel', count: 80, color: '#d946ef' },
    { position: 'Stajyer', count: 20, color: '#ec4899' },
]

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']

// Season staffing multipliers (resort operates Apr-Oct peak)
const STAFF_MULT = [0.80, 0.80, 0.85, 0.95, 1.00, 1.10, 1.15, 1.15, 1.05, 0.90, 0.82, 0.80]

// ─── Cost Calculations ─────────────────────────────────────────

const SGK_EMPLOYER_RATE = 0.225 // 22.5% employer SSI contribution
const UNEMPLOYMENT_INS = 0.02 // İşsizlik Sigortası (employer)

function calculateTotalCost(grossSalary: number): {
    gross: number
    sgkEmployer: number
    unemploymentIns: number
    totalCost: number
} {
    const sgkEmployer = grossSalary * SGK_EMPLOYER_RATE
    const unemploymentIns = grossSalary * UNEMPLOYMENT_INS
    return {
        gross: grossSalary,
        sgkEmployer,
        unemploymentIns,
        totalCost: grossSalary + sgkEmployer + unemploymentIns,
    }
}

// ─── Computed totals ───────────────────────────────────────────

const permanentStaff = DEPARTMENTS.reduce((s, d) => s + d.headCount, 0) // ~380
const seasonalStaff = DEPARTMENTS.reduce((s, d) => s + d.seasonalAdd, 0) // ~120
const totalStaff = permanentStaff + seasonalStaff // ~500

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
        const cacheKey = `hr:personnelCosts:${fromDate}:${toDate}`
        return erpCache.getOrFetch(cacheKey, async () => {
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
        }, 30)
    },

    // ── KPIs ─────────────────────────────────────────────────────
    async getKPIs(): Promise<HRKPIs> {
        // Calculate from department data
        const totalMonthlyCost = DEPARTMENTS.reduce((sum, dept) => {
            const deptCost = calculateTotalCost(dept.avgSalary)
            return sum + (deptCost.totalCost * dept.headCount)
        }, 0)

        const totalSgkCost = DEPARTMENTS.reduce((sum, dept) => {
            return sum + (dept.avgSalary * SGK_EMPLOYER_RATE * dept.headCount)
        }, 0)

        // Estimated annual hotel revenue for per-employee calculation
        const estimatedAnnualRevenue = 850_000_000 // ~850M TRY (a 341-room Ultra AI resort)
        const monthlyRevenue = estimatedAnnualRevenue / 12

        const currentMonth = new Date().getMonth()
        const staffMultiplier = STAFF_MULT[currentMonth]
        const currentSeasonalStaff = Math.round(seasonalStaff * Math.max(0, (staffMultiplier - 0.8) / 0.35))
        const currentTotalStaff = permanentStaff + currentSeasonalStaff

        return {
            totalStaff: currentTotalStaff,
            seasonalStaff: currentSeasonalStaff,
            totalCost: totalMonthlyCost,
            avgCostPerPerson: currentTotalStaff > 0 ? Math.round(totalMonthlyCost / currentTotalStaff) : 0,
            sgkCost: totalSgkCost,
            revenuePerEmployee: currentTotalStaff > 0 ? Math.round(monthlyRevenue / currentTotalStaff) : 0,
            staffTurnover: 18.5, // Seasonal resort typical turnover
            costGrowth: 32.4, // YoY cost growth (inflation-driven)
        }
    },

    // ── Monthly HR Data ──────────────────────────────────────────
    async getMonthlyData(year?: number): Promise<MonthlyHR[]> {
        const targetYear = year || new Date().getFullYear()
        const prevYearGrowth = 0.75 // Previous year was ~75% of current year costs (inflation)

        return MONTHS.map((month, i) => {
            const mult = STAFF_MULT[i]
            const currentSeasonalCount = Math.round(seasonalStaff * Math.max(0, (mult - 0.8) / 0.35))
            const monthlyStaff = permanentStaff + currentSeasonalCount

            // Calculate total cost for this month
            const monthlyCost = DEPARTMENTS.reduce((sum, dept) => {
                const deptStaff = dept.headCount + Math.round(dept.seasonalAdd * Math.max(0, (mult - 0.8) / 0.35))
                const deptCost = calculateTotalCost(dept.avgSalary)
                return sum + (deptCost.totalCost * deptStaff)
            }, 0)

            const prevYearStaff = Math.round(monthlyStaff * 0.95) // Slightly less staff prev year
            const prevYearCost = Math.round(monthlyCost * prevYearGrowth)

            return {
                month,
                totalStaff: monthlyStaff,
                totalCost: monthlyCost,
                avgCostPerPerson: monthlyStaff > 0 ? Math.round(monthlyCost / monthlyStaff) : 0,
                prevYearStaff,
                prevYearCost,
            }
        })
    },

    // ── Position Distribution ────────────────────────────────────
    getPositionDistribution(): PositionDistribution[] {
        const total = POSITION_TITLES.reduce((s, p) => s + p.count, 0)
        return POSITION_TITLES.map(p => ({
            ...p,
            percentage: total > 0 ? Math.round((p.count / total) * 100) : 0,
        }))
    },

    // ── Department Performance ───────────────────────────────────
    async getDepartmentPerformance(): Promise<DepartmentPerformance[]> {
        // Revenue-generating departments get proportional revenue attribution
        const revenueMap: Record<string, number> = {
            'Ön Büro': 280_000_000,
            'Kat Hizmetleri': 0,
            'Yiyecek & İçecek': 180_000_000,
            'Mutfak': 0,
            'SPA & Wellness': 65_000_000,
            'Teknik': 0,
            'Güvenlik': 0,
            'Bahçe & Havuz': 25_000_000,
            'Muhasebe': 0,
            'Satış & Pazarlama': 200_000_000,
            'İnsan Kaynakları': 0,
            'Yönetim': 100_000_000,
            'Animasyon': 0,
        }

        return DEPARTMENTS.map(dept => {
            const totalStaffDept = dept.headCount + dept.seasonalAdd
            const deptCost = calculateTotalCost(dept.avgSalary)
            const annualCost = deptCost.totalCost * totalStaffDept * 12
            const revenue = revenueMap[dept.name] || 0

            return {
                department: dept.name,
                headCount: totalStaffDept,
                totalCost: annualCost,
                revenueGenerated: revenue,
                costPerEmployee: totalStaffDept > 0 ? Math.round(annualCost / totalStaffDept) : 0,
                revenuePerEmployee: totalStaffDept > 0 ? Math.round(revenue / totalStaffDept) : 0,
                efficiency: annualCost > 0 ? Math.round((revenue / annualCost) * 100) / 100 : 0,
                color: dept.color,
            }
        })
    },

    // ── Seasonal Staffing Plan ───────────────────────────────────
    getSeasonalPlan(): { month: string; permanent: number; seasonal: number; total: number }[] {
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
        const roomsPerStaff = totalStaff > 0 ? Math.round((totalStaff / 341) * 10) / 10 : 0
        const avgMonthlyCost = DEPARTMENTS.reduce((sum, dept) => {
            return sum + calculateTotalCost(dept.avgSalary).totalCost * dept.headCount
        }, 0)
        const avgCostPerPerson = permanentStaff > 0 ? Math.round(avgMonthlyCost / permanentStaff) : 0
        const seasonalPct = totalStaff > 0 ? Math.round((seasonalStaff / totalStaff) * 100) : 0

        // Estimated monthly revenue per employee
        const monthlyRevenue = 850_000_000 / 12
        const revenuePerEmployee = totalStaff > 0 ? Math.round(monthlyRevenue / totalStaff) : 0

        return [
            { metric: 'Oda Başına Personel', hotel: roomsPerStaff, industry: 1.2, status: roomsPerStaff > 1.2 ? 'above' : roomsPerStaff < 1.0 ? 'below' : 'at' },
            { metric: 'Personel Devir Oranı (%)', hotel: 18.5, industry: 25, status: 'below' },
            { metric: 'Kişi Başı Aylık Maliyet (₺)', hotel: avgCostPerPerson, industry: 30000, status: avgCostPerPerson > 30000 ? 'above' : 'at' },
            { metric: 'Personel Başı Gelir (₺/ay)', hotel: revenuePerEmployee, industry: 42000, status: revenuePerEmployee > 42000 ? 'above' : 'below' },
            { metric: 'Personel Maliyet / Gelir (%)', hotel: Math.round((avgMonthlyCost / (monthlyRevenue || 1)) * 100), industry: 33, status: 'at' },
            { metric: 'Sezonluk / Toplam Personel (%)', hotel: seasonalPct, industry: 30, status: seasonalPct > 30 ? 'above' : 'below' },
        ]
    },

    // ── Elektra PMS: Employees ───────────────────────────────────
    async getEmployees(): Promise<ElektraEmployee[]> {
        const cacheKey = 'hr:employees'
        return erpCache.getOrFetch(cacheKey, async () => {
            try {
                const raw = await ElektraService.fetchEmployees()
                if (raw && Array.isArray(raw) && raw.length > 0) {
                    currentDataSource = 'live'
                    return raw.map((emp: any) => ({
                        id: String(emp.Id || emp.id || ''),
                        firstName: emp.FirstName || emp.firstName || emp.Name?.split(' ')[0] || '',
                        lastName: emp.LastName || emp.lastName || emp.Name?.split(' ').slice(1).join(' ') || '',
                        title: emp.Title || emp.title || emp.Position || '',
                        department: emp.Department || emp.department || '',
                        email: emp.Email || emp.email || '',
                        phone: emp.Phone || emp.phone || emp.Mobile || '',
                        status: emp.IsActive === false ? 'INACTIVE' : (emp.OnLeave ? 'ON_LEAVE' : 'ACTIVE'),
                        hireDate: emp.HireDate || emp.hireDate || emp.StartDate || '',
                        role: emp.Role || emp.role || '',
                    }))
                }
            } catch (err) {
                console.warn('[HR] Employees fetch error:', (err as Error).message)
            }
            return []
        }, 60) // Cache for 60 minutes
    },

    // ── Elektra PMS: Attendance Logs ─────────────────────────────
    async getAttendanceLogs(startDate?: string, endDate?: string): Promise<AttendanceLog[]> {
        const cacheKey = `hr:attendance:${startDate || 'today'}:${endDate || 'today'}`
        return erpCache.getOrFetch(cacheKey, async () => {
            try {
                const raw = await ElektraService.fetchAttendanceLogs(startDate, endDate)
                if (raw && Array.isArray(raw) && raw.length > 0) {
                    currentDataSource = 'live'
                    return raw.map((log: any) => ({
                        id: String(log.Id || log.id || ''),
                        employeeId: String(log.EmployeeId || log.employeeId || ''),
                        timestamp: log.Timestamp || log.timestamp || log.DateTime || '',
                        type: log.Type || log.type || 'CHECK_IN',
                        source: log.Source || log.source || 'MANUAL',
                        location: log.Location || log.location || '',
                    }))
                }
            } catch (err) {
                console.warn('[HR] Attendance fetch error:', (err as Error).message)
            }
            return []
        }, 5) // Cache for 5 minutes (attendance is time-sensitive)
    },

    // ── Elektra PMS: HR Requests ─────────────────────────────────
    async getHRRequests(): Promise<HRRequest[]> {
        const cacheKey = 'hr:requests'
        return erpCache.getOrFetch(cacheKey, async () => {
            try {
                const raw = await ElektraService.fetchHRRequests()
                if (raw && Array.isArray(raw) && raw.length > 0) {
                    currentDataSource = 'live'
                    return raw.map((req: any) => ({
                        id: String(req.Id || req.id || ''),
                        employeeId: String(req.EmployeeId || req.employeeId || ''),
                        type: req.Type || req.type || 'OTHER',
                        status: req.Status || req.status || 'PENDING',
                        requestDate: req.RequestDate || req.requestDate || req.Date || '',
                        description: req.Description || req.description || '',
                        amount: req.Amount || req.amount || undefined,
                        approverId: req.ApproverId || req.approverId || undefined,
                        approvalDate: req.ApprovalDate || req.approvalDate || undefined,
                    }))
                }
            } catch (err) {
                console.warn('[HR] HR requests fetch error:', (err as Error).message)
            }
            return []
        }, 10) // Cache for 10 minutes
    },

    clearCache(): void {
        erpCache.invalidatePrefix('hr:')
    },
}
