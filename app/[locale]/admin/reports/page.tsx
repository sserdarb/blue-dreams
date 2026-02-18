import { ElektraService } from '@/lib/services/elektra'
import { FinanceService } from '@/lib/services/finance'
import { HRService } from '@/lib/services/hr'
import { PurchasingService } from '@/lib/services/purchasing'
import ManagementReportsClient from './ManagementReportsClient'
import FinanceReportsClient from './FinanceReportsClient'
import HRReportsClient from './HRReportsClient'
import PurchasingReportsClient from './PurchasingReportsClient'
import ReportGroupNav from './ReportGroupNav'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'

export default async function ManagementReportsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ group?: string }>
}) {
    const { locale } = await params
    const { group = 'management' } = await searchParams
    const t = getAdminTranslations(locale as AdminLocale)

    const currentYear = new Date().getFullYear()
    const prevYear = currentYear - 1

    // Only fetch data for the active group
    let content: React.ReactNode = null
    let dataSourceLabel = 'Demo'

    if (group === 'management') {
        const cyStart = new Date(currentYear, 0, 1)
        const cyEnd = new Date(currentYear, 11, 31)
        const pyStart = new Date(prevYear, 0, 1)
        const pyEnd = new Date(prevYear, 11, 31)

        const [currentYearRes, prevYearRes, exchangeRates] = await Promise.all([
            ElektraService.getReservations(cyStart, cyEnd),
            ElektraService.getReservations(pyStart, pyEnd),
            ElektraService.getExchangeRates()
        ])

        const serialized = {
            currentYear,
            currentYearReservations: currentYearRes.map(r => ({
                id: r.id, checkIn: r.checkIn, checkOut: r.checkOut,
                nights: r.nights, roomCount: r.roomCount, totalPrice: r.totalPrice,
                currency: r.currency, channel: r.channel || 'Direkt',
                agency: r.agency, nationality: r.nationality,
                dailyAverage: r.dailyAverage, status: r.status,
                reservationDate: r.reservationDate, roomType: r.roomType, rateType: r.rateType,
            })),
            prevYearReservations: prevYearRes.map(r => ({
                id: r.id, checkIn: r.checkIn, checkOut: r.checkOut,
                nights: r.nights, roomCount: r.roomCount, totalPrice: r.totalPrice,
                currency: r.currency, channel: r.channel || 'Direkt',
                agency: r.agency, nationality: r.nationality,
                dailyAverage: r.dailyAverage, status: r.status,
                reservationDate: r.reservationDate, roomType: r.roomType, rateType: r.rateType,
            })),
            exchangeRates: {
                EUR_TO_TRY: exchangeRates.EUR_TO_TRY,
                USD_TO_TRY: exchangeRates.USD_TO_TRY,
            }
        }

        dataSourceLabel = ElektraService.isFullyLive ? 'Elektra Live' : 'Mock Data'
        content = <ManagementReportsClient data={serialized} />
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

        dataSourceLabel = FinanceService.dataSource === 'live' ? 'Elektra Live' : 'Demo'
        content = (
            <FinanceReportsClient
                kpis={kpis}
                monthlyData={monthlyData}
                trialBalance={trialBalance}
                departmentRevenue={departmentRevenue}
                paymentMethods={paymentMethods}
                expenseBreakdown={expenseBreakdown}
                dataSource={FinanceService.dataSource}
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
                        {group === 'management' ? 'Yönetim Raporları' :
                            group === 'finance' ? 'Finans Raporları' :
                                group === 'purchasing' ? 'Satın Alma Raporları' :
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
