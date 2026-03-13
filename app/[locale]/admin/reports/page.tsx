export const dynamic = 'force-dynamic'

import { ElektraService } from '@/lib/services/elektra'
import { FinanceService } from '@/lib/services/finance'
import { HRService } from '@/lib/services/hr'
import { PurchasingService } from '@/lib/services/purchasing'
import ManagementReportsClient from './ManagementReportsClient'
import MarketingReportsClient from './ReportsClient'
import FinanceReportsClient from './FinanceReportsClient'
import HRReportsClient from './HRReportsClient'
import PurchasingReportsClient from './PurchasingReportsClient'
import ReportGroupNav from './ReportGroupNav'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'
import { getTaxSettings } from '@/app/actions/settings'

export default async function ManagementReportsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ group?: string, year?: string }>
}) {
    const { locale } = await params
    const { group = 'management', year } = await searchParams
    const t = getAdminTranslations(locale as AdminLocale)

    // Season transition logic: if the user specifies a year use it, else default to 2025 (active selling season)
    const currentYear = year ? parseInt(year) : (new Date().getFullYear() === 2024 ? 2025 : new Date().getFullYear())
    const prevYear = currentYear - 1
    const taxRates = await getTaxSettings()

    // Only fetch data for the active group
    let content: React.ReactNode = null
    let dataSourceLabel = 'Demo'

    if (group === 'management') {
        // Use explicit date strings to avoid timezone shifts (toISOString shifts dates in UTC+3)
        const cyStart = new Date(`${currentYear}-01-01T00:00:00Z`)
        const cyEnd = new Date(`${currentYear}-12-31T23:59:59Z`)
        const pyStart = new Date(`${prevYear}-01-01T00:00:00Z`)
        const pyEnd = new Date(`${prevYear}-12-31T23:59:59Z`)

        console.log(`[Reports] Fetching reservations: CY=${currentYear} (${cyStart.toISOString()} - ${cyEnd.toISOString()}), PY=${prevYear} (${pyStart.toISOString()} - ${pyEnd.toISOString()})`)

        const [currentYearRes, prevYearRes, exchangeRates, totalRooms] = await Promise.all([
            ElektraService.getReservations(cyStart, cyEnd),
            ElektraService.getReservations(pyStart, pyEnd),
            ElektraService.getExchangeRates(),
            ElektraService.getTotalRooms()
        ])

        console.log(`[Reports] CY reservations: ${currentYearRes.length}, PY reservations: ${prevYearRes.length}`)
        if (prevYearRes.length > 0) {
            const sample = prevYearRes.slice(0, 3)
            console.log(`[Reports] PY sample: ${JSON.stringify(sample.map(r => ({ id: r.id, checkIn: r.checkIn, nights: r.nights, roomCount: r.roomCount, totalPrice: r.totalPrice, currency: r.currency, status: r.status })))}`)
        } else {
            console.log(`[Reports] WARNING: PY has ZERO reservations for year ${prevYear}!`)
        }

        const serialized = {
            currentYear,
            currentYearReservations: currentYearRes.map(r => ({
                id: r.id, checkIn: r.checkIn, checkOut: r.checkOut,
                nights: r.nights, roomCount: r.roomCount, totalPrice: r.totalPrice,
                currency: r.currency, channel: r.channel || 'Direkt',
                agency: r.agency, country: r.country,
                dailyAverage: r.dailyAverage, status: r.status,
                reservationDate: r.reservationDate, roomType: r.roomType, rateType: r.rateType,
            })),
            prevYearReservations: prevYearRes.map(r => ({
                id: r.id, checkIn: r.checkIn, checkOut: r.checkOut,
                nights: r.nights, roomCount: r.roomCount, totalPrice: r.totalPrice,
                currency: r.currency, channel: r.channel || 'Direkt',
                agency: r.agency, country: r.country,
                dailyAverage: r.dailyAverage, status: r.status,
                reservationDate: r.reservationDate, roomType: r.roomType, rateType: r.rateType,
            })),
            exchangeRates: {
                EUR_TO_TRY: exchangeRates.EUR_TO_TRY,
                USD_TO_TRY: exchangeRates.USD_TO_TRY,
            },
            totalRooms
        }

        dataSourceLabel = ElektraService.isFullyLive ? 'Elektra Live' : 'Mock Data'
        content = <ManagementReportsClient data={serialized} taxRates={taxRates} />
    }

    if (group === 'finance') {
        const startDate = `${currentYear}-01-01`
        const endDate = `${currentYear}-12-31`

        const [kpis, monthlyData, trialBalance, departmentRevenue, paymentMethods, expenseBreakdown] = await Promise.all([
            FinanceService.getKPIs(currentYear),
            FinanceService.getMonthlyData(currentYear),
            FinanceService.getTrialBalance(startDate, endDate),
            FinanceService.getDepartmentRevenue(),
            FinanceService.getPaymentMethodBreakdown(),
            FinanceService.getExpenseBreakdown(),
        ])

        dataSourceLabel = ElektraService.isFullyLive ? 'Elektra Live (PMS)' : (FinanceService.dataSource === 'live' ? 'Elektra Live' : 'Demo')
        content = (
            <FinanceReportsClient
                kpis={kpis}
                monthlyData={monthlyData}
                trialBalance={trialBalance}
                departmentRevenue={departmentRevenue}
                paymentMethods={paymentMethods}
                expenseBreakdown={expenseBreakdown}
                dataSource={FinanceService.dataSource}
                taxRates={taxRates}
            />
        )
    }

    if (group === 'purchasing') {
        const [kpis, stockItems, purchaseOrders, vendors, inventoryNeeds, priceTrends] = await Promise.all([
            PurchasingService.getKPIs(),
            PurchasingService.getStockItems(),
            PurchasingService.getPurchaseOrders(),
            PurchasingService.getVendors(),
            PurchasingService.analyzeInventory(),
            PurchasingService.getPriceTrends(),
        ])

        dataSourceLabel = kpis.dataSource === 'live' ? 'Elektra Live' : 'Demo'
        content = (
            <PurchasingReportsClient
                kpis={kpis}
                stockItems={stockItems}
                purchaseOrders={purchaseOrders}
                vendors={vendors}
                inventoryNeeds={inventoryNeeds}
                priceTrends={priceTrends}
                dataSource={kpis.dataSource}
            />
        )
    }

    if (group === 'hr') {
        const startDate = `${currentYear}-01-01`
        const endDate = `${currentYear}-12-31`

        const [kpis, departments, personnelCosts, monthlyData, positionDistribution, departmentPerformance, benchmarks, seasonalPlan] = await Promise.all([
            HRService.getKPIs(),
            Promise.resolve(HRService.getDepartments()),
            HRService.getPersonnelCosts(startDate, endDate),
            HRService.getMonthlyData(currentYear),
            Promise.resolve(HRService.getPositionDistribution()),
            HRService.getDepartmentPerformance(),
            Promise.resolve(HRService.getBenchmarks()),
            Promise.resolve(HRService.getSeasonalPlan()),
        ])

        dataSourceLabel = HRService.dataSource === 'live' ? 'Elektra Live' : 'Demo'
        content = (
            <HRReportsClient
                kpis={kpis}
                departments={departments}
                personnelCosts={personnelCosts}
                monthlyData={monthlyData}
                positionDistribution={positionDistribution}
                departmentPerformance={departmentPerformance}
                benchmarks={benchmarks}
                seasonalPlan={seasonalPlan}
                dataSource={HRService.dataSource}
            />
        )
    }

    if (group === 'marketing') {
        dataSourceLabel = 'Meta & Google Ads API'
        content = <MarketingReportsClient />
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        {group === 'management' ? 'Yönetim Raporları' :
                            group === 'finance' ? 'Finans Raporları' :
                                group === 'purchasing' ? 'Satın Alma Raporları' :
                                    group === 'marketing' ? 'Pazarlama & Reklam Raporları' :
                                        'İnsan Kaynakları Raporları'}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">Elektra ERP entegrasyonu ile güncel veriler.</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                    Data Source: {dataSourceLabel}
                </div>
            </div>
            <ReportGroupNav activeGroup={group} />
            {content}
        </div>
    )
}
