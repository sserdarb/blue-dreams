'use client'
import React, { useState, useMemo } from 'react'
import { BigDataService } from '@/lib/services/bigdata'
import { getAdminTranslations, AdminLocale } from '@/lib/admin-translations'
import { ChartCard, MiniLine, MiniBar, DualBar, DualLine, MiniPie, DonutChart, MiniArea, MiniScatter, ForecastChart, HeatmapGrid, DataTable, StackedBar } from './charts'
import { BarChart3, TrendingUp, BedDouble, Users, Globe, CalendarDays, Target, Zap, Database, LayoutDashboard } from 'lucide-react'
import { getMonthlyBudgetData, getSeasonTotal, getSeasonComparison, getChannelBudgetSummary } from '@/lib/services/budget-2026'
import ModuleOffline from '@/components/admin/ModuleOffline'

const fmt = (n: number) => n?.toLocaleString('tr-TR') || '0'
const fmtK = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : fmt(n)
const fmtEur = (n: number) => n >= 1_000_000 ? `€${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `€${(n / 1_000).toFixed(0)}K` : `€${Math.round(n)}`
const EUR_RATE = 38.5

const getTabs = (t: any) => [
    { id: 'overview', label: t.tabs.overview, icon: LayoutDashboard },
    { id: 'revenue', label: t.tabs.revenue, icon: TrendingUp },
    { id: 'occupancy', label: t.tabs.occupancy, icon: BedDouble },
    { id: 'channels', label: t.tabs.channels, icon: BarChart3 },
    { id: 'guests', label: t.tabs.guests, icon: Globe },
    { id: 'booking', label: t.tabs.booking, icon: CalendarDays },
    { id: 'performance', label: t.tabs.performance, icon: Target },
    { id: 'forecast', label: t.tabs.forecast, icon: Zap },
    { id: 'comparative', label: t.tabs.comparative, icon: Users },
    { id: 'rawdata', label: t.tabs.rawdata, icon: Database },
]

export default function BigDataClient({ data, error, locale }: { data: any; error: string | null; locale: string }) {
    const [tab, setTab] = useState('overview')
    const t = getAdminTranslations(locale as AdminLocale).bigDataPage
    const TABS = getTabs(t)

    const reservations = data?.reservations || []
    const prevReservations = data?.prevReservations || []
    const occupancy = data?.occupancy || []

    // Pre-compute all analytics
    const analytics = useMemo(() => {
        if (!reservations.length) return null
        const S = BigDataService
        const totalRooms = occupancy[0]?.totalRooms || 341
        const totalRev = reservations.reduce((s: number, r: any) => s + r.totalPrice, 0)
        const totalNights = reservations.reduce((s: number, r: any) => s + r.nights * r.roomCount, 0)
        const avgADR = totalNights > 0 ? totalRev / totalNights : 0

        return {
            // Revenue
            dailyRevenue: S.dailyRevenueTrend(reservations),
            weeklyRevenue: S.weeklyRevenue(reservations),
            monthlyRevenue: S.monthlyRevenueSummary(reservations),
            revenueForecast: S.revenueForecast(reservations),
            adrTrend: S.adrTrend(reservations),
            revparTrend: S.revparTrend(reservations, occupancy),
            currencyBreakdown: S.revenueByCurrency(reservations),
            totalVsPaid: S.totalVsPaidRevenue(reservations),
            revenueHeatmap: S.revenueHeatmap(reservations),
            // Occupancy
            dailyOccupancy: S.dailyOccupancyTrend(occupancy),
            occForecast: S.occupancyForecast(occupancy),
            roomTypeOcc: S.roomTypeOccupancy(reservations),
            occVsAdr: S.occupancyVsADR(reservations, occupancy),
            occHeatmap: S.occupancyHeatmap(occupancy),
            weekdayWeekend: S.weekdayVsWeekend(reservations),
            seasonal: S.seasonalComparison(reservations),
            vacantLoss: S.vacantRoomLoss(occupancy, avgADR),
            // Channels
            channels: S.channelDistribution(reservations),
            channelRevTrend: S.channelRevenueTrend(reservations),
            channelPerfTrend: S.channelPerformanceTrend(reservations),
            otaVsDirect: S.otaVsDirect(reservations),
            agencyRanking: S.agencyRanking(reservations),
            channelMix: S.channelMixTrend(reservations),
            channelADR: S.channelADR(reservations),
            // Guests
            countries: S.countryDistribution(reservations),
            revByCountry: S.revenueByCountry(reservations),
            stayByCountry: S.avgStayByCountry(reservations),
            natTrend: S.countryTrend(reservations),
            guestSegments: S.guestSegmentation(reservations),
            natChannelMatrix: S.countryChannelMatrix(reservations),
            rateByCountry: S.avgRateByCountry(reservations),
            // Booking Patterns
            leadTime: S.leadTimeDistribution(reservations),
            bookingDay: S.bookingDayAnalysis(reservations),
            cancellation: S.cancellationAnalysis(reservations),
            avgStayTrend: S.avgStayTrend(reservations),
            roomCountDist: S.roomCountDistribution(reservations),
            boardTypeDist: S.boardTypeDistribution(reservations),
            roomTypePref: S.roomTypePreference(reservations),
            stayLengthDist: S.stayLengthDistribution(reservations),
            // Performance
            kpis: S.kpiScorecard(reservations, occupancy),
            goppar: S.goppar(reservations, totalRooms),
            trevpar: S.trevpar(reservations, totalRooms),
            monthlyPerf: S.monthlyPerformanceIndex(reservations, occupancy),
            revenueConc: S.revenueConcentration(reservations),
            rateTypeAnalysis: S.rateTypeAnalysis(reservations),
            checkInDay: S.checkInDayDistribution(reservations),
            priceSegTrend: S.priceSegmentTrend(reservations),
            // Forecast & Pace
            pace: S.paceReport(reservations, prevReservations),
            pickup: S.pickupAnalysis(reservations),
            // YoY
            yoy: S.yoyRevenueComparison(reservations, prevReservations),
        }
    }, [reservations, prevReservations, occupancy])

    if (error) return <ModuleOffline moduleName="Big Data & Analytics" dataSource="elektra" offlineReason={error} />
    if (!analytics) return <div className="p-8 text-slate-400">{t.header.loadingData}</div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">{t.header.title}</h1>
                            <p className="text-xs text-slate-400 mt-1">{reservations.length} {t.header.reservations} • {new Set(reservations.map((r: any) => r.country)).size} {t.header.countries} • {t.header.lastUpdate} {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString('tr-TR') : '-'}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-xs text-emerald-400 font-medium">{t.header.liveApi}</span>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
                        {TABS.map(t => {
                            const Icon = t.icon
                            return <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${tab === t.id ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}><Icon size={14} />{t.label}</button>
                        })}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {tab === 'overview' && <OverviewTab a={analytics} t={t} />}
                {tab === 'revenue' && <RevenueTab a={analytics} t={t} />}
                {tab === 'occupancy' && <OccupancyTab a={analytics} t={t} />}
                {tab === 'channels' && <ChannelsTab a={analytics} t={t} />}
                {tab === 'guests' && <GuestsTab a={analytics} t={t} />}
                {tab === 'booking' && <BookingTab a={analytics} t={t} />}
                {tab === 'performance' && <PerformanceTab a={analytics} t={t} />}
                {tab === 'forecast' && <ForecastTab a={analytics} t={t} />}
                {tab === 'comparative' && <ComparativeTab a={analytics} t={t} />}
                {tab === 'rawdata' && <RawDataTab reservations={data?.reservations || []} a={analytics} t={t} />}
            </div>
        </div>
    )
}

// ═══ TAB 1: OVERVIEW ═══
function OverviewTab({ a, t }: { a: any, t: any }) {
    // Budget comparison
    const totalRevTRY = a.monthlyRevenue.reduce((s: number, m: any) => s + m.revenue, 0)
    const totalRevEUR = totalRevTRY / EUR_RATE
    const seasonBudget = getSeasonTotal()
    const seasonComp = getSeasonComparison(totalRevEUR)
    const budgetMonths = getMonthlyBudgetData()

    return <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {a.kpis.map((k: any, i: number) => (
                <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{k.label}</p>
                    <p className="text-lg font-bold text-white">{k.value}</p>
                    {k.subValue && <p className="text-xs text-cyan-400">{k.subValue}</p>}
                </div>
            ))}
            {/* Budget KPI */}
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-xl border border-amber-700/50 p-4">
                <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">{t.overview.budgetRealization}</p>
                <p className={`text-lg font-bold ${seasonComp.realization >= 100 ? 'text-emerald-400' : seasonComp.realization >= 70 ? 'text-amber-400' : 'text-red-400'}`}>%{seasonComp.realization}</p>
                <p className="text-xs text-slate-400">{fmtEur(totalRevEUR)} / {fmtEur(seasonBudget)}</p>
            </div>
        </div>
        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title={t.overview.monthlyRevVsBudget}>
                <DualBar data={a.monthlyRevenue.map((m: any) => {
                    const mi = m.monthIndex != null ? m.monthIndex + 1 : parseInt((m.month || '').split(' ')[0]) || 0
                    const bm = budgetMonths.find(b => b.month === mi)
                    return { month: m.month, actual: Math.round(m.revenue / EUR_RATE), budget: bm?.budget || 0 }
                })} xKey="month" y1="actual" y2="budget" c1="#06b6d4" c2="#f59e0b" />
            </ChartCard>
            <ChartCard title={t.overview.channelDist}><DonutChart data={a.channels} nameKey="channel" valueKey="share" /></ChartCard>
            <ChartCard title={t.overview.adrTrendMonthly}><MiniLine data={a.adrTrend} xKey="date" yKey="revenue" color="#8b5cf6" /></ChartCard>
            <ChartCard title={t.overview.occupancyRate}><MiniLine data={a.dailyOccupancy.slice(-60)} xKey="date" yKey="rate" color="#10b981" /></ChartCard>
            <ChartCard title={t.overview.nationalityDist}><MiniPie data={a.countries.slice(0, 8)} nameKey="country" valueKey="count" /></ChartCard>
            <ChartCard title={t.overview.boardType}><DonutChart data={a.boardTypeDist} nameKey="boardType" valueKey="count" /></ChartCard>
        </div>
    </div>
}

// ═══ TAB 2: REVENUE ═══
function RevenueTab({ a, t }: { a: any, t: any }) {
    const budgetMonths = getMonthlyBudgetData()
    const seasonBudget = getSeasonTotal()
    const totalRevTRY = a.monthlyRevenue.reduce((s: number, m: any) => s + m.revenue, 0)
    const totalRevEUR = totalRevTRY / EUR_RATE
    const seasonComp = getSeasonComparison(totalRevEUR)

    // Build monthly data with budget
    const monthlyWithBudget = a.monthlyRevenue.map((m: any) => {
        const mi = m.monthIndex != null ? m.monthIndex + 1 : 0
        const bm = budgetMonths.find(b => b.month === mi)
        const actualEUR = Math.round(m.revenue / EUR_RATE)
        const budget = bm?.budget || 0
        return {
            ...m,
            budgetEUR: budget,
            actualEUR,
            remainingEUR: budget - actualEUR,
            realization: budget > 0 ? Math.round((actualEUR / budget) * 100) : 0,
        }
    })

    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">{t.revenue.title}</h2>

        {/* Budget Summary Banner */}
        <div className="bg-gradient-to-r from-amber-900/20 to-slate-800 rounded-xl border border-amber-700/30 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs text-amber-400 font-medium">{t.revenue.seasonBudget}</p>
                    <p className="text-sm text-slate-300">{t.revenue.target} <span className="font-bold text-white">{fmtEur(seasonBudget)}</span> • {t.revenue.actual} <span className="font-bold text-cyan-400">{fmtEur(totalRevEUR)}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className={`text-2xl font-bold ${seasonComp.realization >= 100 ? 'text-emerald-400' : seasonComp.realization >= 70 ? 'text-amber-400' : 'text-red-400'}`}>%{seasonComp.realization}</p>
                        <p className="text-[10px] text-slate-400">{t.revenue.realization}</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-bold ${seasonComp.remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{fmtEur(Math.abs(seasonComp.remaining))}</p>
                        <p className="text-[10px] text-slate-400">{seasonComp.remaining > 0 ? t.revenue.remaining : t.revenue.excess}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title={t.revenue.r1} span={2}><MiniLine data={a.dailyRevenue.slice(-90)} xKey="date" yKey="revenue" /></ChartCard>
            <ChartCard title={t.revenue.r2}><MiniBar data={a.weeklyRevenue.slice(-20)} xKey="date" yKey="revenue" color="#8b5cf6" /></ChartCard>
            <ChartCard title={`R3: ${t.overview.monthlyRevVsBudget} (€)`}>
                <DualBar data={monthlyWithBudget.map((m: any) => ({ month: m.month, actual: m.actualEUR, budget: m.budgetEUR }))} xKey="month" y1="actual" y2="budget" c1="#06b6d4" c2="#f59e0b" />
            </ChartCard>
            <ChartCard title={t.revenue.r5} span={2}><ForecastChart data={a.revenueForecast.slice(-60)} /></ChartCard>
            <ChartCard title={t.revenue.r6}><MiniLine data={a.revparTrend.slice(-60)} xKey="date" yKey="revenue" color="#10b981" /></ChartCard>
            <ChartCard title={t.revenue.r7}><MiniLine data={a.adrTrend} xKey="date" yKey="revenue" color="#f59e0b" /></ChartCard>
            <ChartCard title={t.revenue.r8}><DonutChart data={a.currencyBreakdown} nameKey="currency" valueKey="share" /></ChartCard>
            <ChartCard title={t.revenue.r9}><DualBar data={a.totalVsPaid} xKey="month" y1="total" y2="paid" c1="#06b6d4" c2="#10b981" /></ChartCard>
            <ChartCard title={t.revenue.r10} span={2}><HeatmapGrid data={a.revenueHeatmap} /></ChartCard>
        </div>
        {/* Revenue Table with Budget */}
        <ChartCard title={t.revenue.tableTitle}>
            <DataTable data={monthlyWithBudget} columns={[
                { key: 'month', label: t.tableCols.month },
                { key: 'count', label: t.tableCols.resCount, format: (v: number) => fmt(v) },
                { key: 'revenue', label: t.tableCols.revenueYtl, format: (v: number) => `₺${fmt(v)}` },
                { key: 'budgetEUR', label: t.tableCols.budgetEur, format: (v: number) => fmtEur(v) },
                { key: 'actualEUR', label: t.tableCols.actualEur, format: (v: number) => fmtEur(v) },
                { key: 'remainingEUR', label: t.tableCols.remainingEur, format: (v: number) => v >= 0 ? fmtEur(v) : `-${fmtEur(Math.abs(v))}` },
                { key: 'realization', label: '%', format: (v: number) => `%${v}` },
                { key: 'adr', label: t.tableCols.adrYtl, format: (v: number) => `₺${fmt(v)}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 3: OCCUPANCY ═══
function OccupancyTab({ a, t }: { a: any, t: any }) {
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">{t.occupancy.title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title={`R11: Günlük ${t.overview.occupancyRate} (%)`} span={2}><MiniLine data={a.dailyOccupancy.slice(-90)} xKey="date" yKey="rate" color="#10b981" /></ChartCard>
            <ChartCard title={t.occupancy.r12}><ForecastChart data={a.occForecast.slice(-60)} /></ChartCard>
            <ChartCard title={t.occupancy.r13}><MiniBar data={a.roomTypeOcc} xKey="roomType" yKey="count" color="#8b5cf6" /></ChartCard>
            <ChartCard title={t.occupancy.r14}><MiniScatter data={a.occVsAdr} xKey="occupancy" yKey="adr" label="Ay bazlı" /></ChartCard>
            <ChartCard title={t.occupancy.r15} ><HeatmapGrid data={a.occHeatmap} /></ChartCard>
            <ChartCard title={t.occupancy.r16}>
                <div className="grid grid-cols-2 gap-3">
                    {a.weekdayWeekend.map((w: any) => (
                        <div key={w.type} className="bg-slate-700/30 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-400">{w.type}</p>
                            <p className="text-xl font-bold text-white">{fmt(w.count)}</p>
                            <p className="text-xs text-cyan-400">ADR: ₺{fmt(w.adr)}</p>
                            <p className="text-xs text-slate-400">{w.avgNights} {t.occupancy.avgNightsSuffix}</p>
                        </div>
                    ))}
                </div>
            </ChartCard>
            <ChartCard title={t.occupancy.r17}><MiniBar data={a.seasonal} xKey="season" yKey="revenue" color="#f59e0b" /></ChartCard>
            <ChartCard title={t.occupancy.r18} span={2}><MiniLine data={a.vacantLoss.slice(-60)} xKey="date" yKey="potentialLoss" color="#ef4444" /></ChartCard>
        </div>
        <ChartCard title={t.occupancy.tableTitle}>
            <DataTable data={a.roomTypeOcc} columns={[
                { key: 'roomType', label: t.tableCols.roomType },
                { key: 'count', label: t.tableCols.resCount, format: (v: number) => fmt(v) },
                { key: 'revenue', label: t.tableCols.revenueYtl, format: (v: number) => `₺${fmt(v)}` },
                { key: 'avgRate', label: t.tableCols.avgRate, format: (v: number) => `₺${fmt(v)}` },
                { key: 'avgNights', label: t.tableCols.avgNights },
                { key: 'share', label: t.tableCols.share, format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 4: CHANNELS ═══
function ChannelsTab({ a, t }: { a: any, t: any }) {
    const channelKeys = a.channels.map((c: any) => c.channel)
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">{t.channels.title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title={`R19: ${t.overview.channelDist}`}><DonutChart data={a.channels} nameKey="channel" valueKey="share" /></ChartCard>
            <ChartCard title={t.channels.r20}><StackedBar data={a.channelRevTrend} xKey="month" keys={channelKeys} /></ChartCard>
            <ChartCard title={t.channels.r21}><MiniBar data={a.channelADR} xKey="channel" yKey="adr" color="#8b5cf6" /></ChartCard>
            <ChartCard title={t.channels.r22}><MiniArea data={a.channelPerfTrend} xKey="month" keys={channelKeys} /></ChartCard>
            <ChartCard title={t.channels.r23}><DualBar data={a.otaVsDirect} xKey="month" y1="OTA" y2="Direct" c1="#f59e0b" c2="#10b981" /></ChartCard>
            <ChartCard title={t.channels.r25} ><MiniArea data={a.channelMix} xKey="month" keys={channelKeys} /></ChartCard>
        </div>
        <ChartCard title={t.channels.r24}>
            <DataTable data={a.agencyRanking} columns={[
                { key: 'agency', label: t.tableCols.agency },
                { key: 'channel', label: t.tableCols.channel },
                { key: 'count', label: t.tableCols.resCount, format: (v: number) => fmt(v) },
                { key: 'revenue', label: t.tableCols.revenueYtl, format: (v: number) => `₺${fmt(v)}` },
                { key: 'adr', label: t.tableCols.adrYtl, format: (v: number) => `₺${fmt(v)}` },
            ]} />
        </ChartCard>
        <ChartCard title={t.channels.tableTitle}>
            <DataTable data={a.channels} columns={[
                { key: 'channel', label: t.tableCols.channel },
                { key: 'count', label: t.tableCols.resCount, format: (v: number) => fmt(v) },
                { key: 'revenue', label: t.tableCols.revenueYtl, format: (v: number) => `₺${fmt(v)}` },
                { key: 'adr', label: 'ADR', format: (v: number) => `₺${fmt(v)}` },
                { key: 'avgNights', label: t.tableCols.avgNights },
                { key: 'share', label: t.tableCols.share, format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 5: GUESTS ═══
function GuestsTab({ a, t }: { a: any, t: any }) {
    const topCountries = a.countries.slice(0, 6).map((n: any) => n.country)
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">{t.guests.title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title={`R26: ${t.overview.nationalityDist}`}><DonutChart data={a.countries.slice(0, 10)} nameKey="country" valueKey="count" /></ChartCard>
            <ChartCard title={t.guests.r27}><MiniBar data={a.revByCountry.slice(0, 10)} xKey="country" yKey="revenue" color="#f59e0b" /></ChartCard>
            <ChartCard title={t.guests.r28}><MiniBar data={a.stayByCountry.slice(0, 10)} xKey="country" yKey="avgNights" color="#10b981" /></ChartCard>
            <ChartCard title={t.guests.r29}><MiniArea data={a.natTrend} xKey="month" keys={topCountries} /></ChartCard>
            <ChartCard title={t.guests.r30}><MiniBar data={a.guestSegments} xKey="segment" yKey="count" color="#8b5cf6" /></ChartCard>
            <ChartCard title={t.guests.r31}><HeatmapGrid data={a.natChannelMatrix} /></ChartCard>
            <ChartCard title={t.guests.r32}><MiniBar data={a.rateByCountry.slice(0, 10)} xKey="country" yKey="avgRate" color="#ec4899" /></ChartCard>
        </div>
        <ChartCard title={t.guests.tableTitle}>
            <DataTable data={a.countries} columns={[
                { key: 'country', label: t.tableCols.country },
                { key: 'count', label: t.tableCols.resCount, format: (v: number) => fmt(v) },
                { key: 'revenue', label: t.tableCols.revenueYtl, format: (v: number) => `₺${fmt(v)}` },
                { key: 'avgNights', label: t.tableCols.avgNights },
                { key: 'avgRate', label: t.tableCols.avgRateYtl, format: (v: number) => `₺${fmt(v)}` },
                { key: 'share', label: t.tableCols.share, format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 6: BOOKING PATTERNS ═══
function BookingTab({ a, t }: { a: any, t: any }) {
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">{t.booking.title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title={t.booking.r33}><MiniBar data={a.leadTime} xKey="range" yKey="count" color="#06b6d4" /></ChartCard>
            <ChartCard title={t.booking.r34}><MiniBar data={a.bookingDay} xKey="day" yKey="count" color="#8b5cf6" /></ChartCard>
            <ChartCard title={t.booking.r35}><MiniBar data={a.cancellation} xKey="month" yKey="rate" color="#ef4444" /></ChartCard>
            <ChartCard title={t.booking.r36}><MiniLine data={a.avgStayTrend} xKey="month" yKey="avgNights" color="#10b981" /></ChartCard>
            <ChartCard title={t.booking.r37}><DonutChart data={a.roomCountDist} nameKey="rooms" valueKey="count" /></ChartCard>
            <ChartCard title={`R38: ${t.overview.boardType} Dağılımı`}><DonutChart data={a.boardTypeDist} nameKey="boardType" valueKey="count" /></ChartCard>
            <ChartCard title={t.booking.r39}><MiniBar data={a.roomTypePref} xKey="roomType" yKey="count" color="#f59e0b" /></ChartCard>
            <ChartCard title={t.booking.r40}><MiniBar data={a.stayLengthDist} xKey="nights" yKey="count" color="#ec4899" /></ChartCard>
        </div>
        <ChartCard title={t.booking.leadTimeTable}>
            <DataTable data={a.leadTime} columns={[
                { key: 'range', label: t.tableCols.durationRange },
                { key: 'count', label: t.tableCols.resCountLong, format: (v: number) => fmt(v) },
                { key: 'share', label: t.tableCols.share, format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
        <ChartCard title={t.booking.stayLengthTable}>
            <DataTable data={a.stayLengthDist} columns={[
                { key: 'nights', label: t.tableCols.duration },
                { key: 'count', label: t.tableCols.resCountLong, format: (v: number) => fmt(v) },
                { key: 'revenue', label: t.tableCols.revenueYtl, format: (v: number) => `₺${fmt(v)}` },
                { key: 'share', label: t.tableCols.share, format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 7: PERFORMANCE ═══
function PerformanceTab({ a, t }: { a: any, t: any }) {
    const budgetMonths = getMonthlyBudgetData()
    const perfWithBudget = a.monthlyPerf.map((m: any) => {
        const mi = m.monthIndex != null ? m.monthIndex + 1 : 0
        const bm = budgetMonths.find(b => b.month === mi)
        const actualEUR = Math.round(m.revenue / EUR_RATE)
        const budget = bm?.budget || 0
        return { ...m, budgetEUR: budget, actualEUR, realization: budget > 0 ? Math.round((actualEUR / budget) * 100) : 0 }
    })

    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">{t.performance.title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title={t.performance.r41}><MiniBar data={a.goppar} xKey="month" yKey="goppar" color="#10b981" /></ChartCard>
            <ChartCard title={t.performance.r42}><MiniBar data={a.trevpar} xKey="month" yKey="trevpar" color="#06b6d4" /></ChartCard>
            <ChartCard title={t.performance.r46}><MiniBar data={a.checkInDay} xKey="day" yKey="count" color="#8b5cf6" /></ChartCard>
            <ChartCard title={t.performance.r47}><StackedBar data={a.priceSegTrend} xKey="month" keys={['ekonomik', 'orta', 'ust', 'premium', 'vip']} /></ChartCard>
            <ChartCard title={t.performance.r48} span={2}>
                <DataTable data={perfWithBudget} columns={[
                    { key: 'month', label: t.tableCols.month },
                    { key: 'count', label: t.tableCols.resCount },
                    { key: 'revenue', label: t.tableCols.revenueYtl, format: (v: number) => `₺${fmt(v)}` },
                    { key: 'budgetEUR', label: t.tableCols.budgetEur, format: (v: number) => fmtEur(v) },
                    { key: 'actualEUR', label: t.tableCols.actualEur, format: (v: number) => fmtEur(v) },
                    { key: 'realization', label: t.tableCols.realization, format: (v: number) => `%${v}` },
                    { key: 'occupancyRate', label: t.tableCols.occupancyRate, format: (v: number) => `%${v}` },
                    { key: 'adr', label: t.tableCols.adrYtl, format: (v: number) => `₺${fmt(v)}` },
                    { key: 'revpar', label: t.tableCols.revparYtl, format: (v: number) => `₺${fmt(v)}` },
                ]} />
            </ChartCard>
            <ChartCard title={t.performance.r49}><MiniLine data={a.revenueConc} xKey="percentile" yKey="revenueShare" color="#f59e0b" /></ChartCard>
            <ChartCard title={t.performance.r50}><MiniBar data={a.rateTypeAnalysis.slice(0, 10)} xKey="rateType" yKey="revenue" color="#ec4899" /></ChartCard>
        </div>
        <ChartCard title={t.performance.tableTitle}>
            <DataTable data={a.rateTypeAnalysis} columns={[
                { key: 'rateType', label: t.tableCols.rateType },
                { key: 'count', label: t.tableCols.resCount, format: (v: number) => fmt(v) },
                { key: 'revenue', label: t.tableCols.revenueYtl, format: (v: number) => `₺${fmt(v)}` },
                { key: 'adr', label: t.tableCols.adrYtl, format: (v: number) => `₺${fmt(v)}` },
                { key: 'share', label: t.tableCols.share, format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 8: FORECAST & PACE ═══
function ForecastTab({ a, t }: { a: any, t: any }) {
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">{t.forecast.title}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title={t.forecast.r5} span={2}><ForecastChart data={a.revenueForecast.slice(-45)} /></ChartCard>
            <ChartCard title={t.forecast.r43} span={2}><DualLine data={a.pace} xKey="label" y1="currentYear" y2="prevYear" c1="#06b6d4" c2="#f59e0b" /></ChartCard>
            <ChartCard title={t.forecast.r44} span={2}><MiniBar data={a.pickup.slice(-60)} xKey="date" yKey="newBookings" color="#10b981" /></ChartCard>
            <ChartCard title={t.forecast.r12}><ForecastChart data={a.occForecast.slice(-45)} /></ChartCard>
            <ChartCard title={t.forecast.seasonalComp}><MiniBar data={a.seasonal} xKey="season" yKey="count" color="#8b5cf6" /></ChartCard>
        </div>
    </div>
}

// ═══ TAB 9: COMPARATIVE ═══
function ComparativeTab({ a, t }: { a: any, t: any }) {
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">{t.comparative.title}</h2>
        {/* YoY Table */}
        <ChartCard title={t.comparative.r4}>
            <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-700"><th className="p-3 text-left text-slate-400">{t.comparative.metric}</th><th className="p-3 text-right text-slate-400">{t.comparative.thisSeason}</th><th className="p-3 text-right text-slate-400">{t.comparative.lastSeason}</th><th className="p-3 text-right text-slate-400">{t.comparative.change}</th><th className="p-3 text-right text-slate-400">%</th></tr></thead><tbody>
                {a.yoy.map((y: any, i: number) => (
                    <tr key={i} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                        <td className="p-3 text-slate-200 font-medium">{y.metric}</td>
                        <td className="p-3 text-right text-white font-bold">{fmt(y.current)}</td>
                        <td className="p-3 text-right text-slate-400">{fmt(y.previous)}</td>
                        <td className={`p-3 text-right font-medium ${y.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{y.change >= 0 ? '+' : ''}{fmt(y.change)}</td>
                        <td className={`p-3 text-right font-bold ${y.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{y.changePercent >= 0 ? '↑' : '↓'} {Math.abs(y.changePercent)}%</td>
                    </tr>
                ))}
            </tbody></table></div>
        </ChartCard>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title={t.comparative.paceComp}><DualLine data={a.pace} xKey="label" y1="currentYear" y2="prevYear" /></ChartCard>
            <ChartCard title={t.comparative.seasonalRevComp}><MiniBar data={a.seasonal} xKey="season" yKey="revenue" color="#f59e0b" /></ChartCard>
            <ChartCard title={t.comparative.channelAdrComp}><MiniBar data={a.channelADR} xKey="channel" yKey="adr" color="#8b5cf6" /></ChartCard>
            <ChartCard title={t.comparative.roomTypeRevComp}><MiniBar data={a.roomTypeOcc} xKey="roomType" yKey="revenue" color="#10b981" /></ChartCard>
        </div>
    </div>
}

// ═══ TAB 10: RAW DATA ═══
function RawDataTab({ reservations, a, t }: { reservations: any[]; a: any, t: any }) {
    const [search, setSearch] = useState('')
    const filtered = reservations.filter((r: any) =>
        !search || r.agency?.toLowerCase().includes(search.toLowerCase()) ||
        r.country?.toLowerCase().includes(search.toLowerCase()) ||
        r.voucherNo?.toLowerCase().includes(search.toLowerCase()) ||
        r.roomType?.toLowerCase().includes(search.toLowerCase())
    )
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">{t.rawdata.title}</h2>
        <div className="flex gap-3 items-center">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t.rawdata.searchPlaceholder} className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 w-96 focus:outline-none focus:border-cyan-500" />
            <span className="text-xs text-slate-400">{filtered.length} / {reservations.length} {t.rawdata.recordsSuffix}</span>
        </div>
        <ChartCard title={`${t.rawdata.tableTitle} (${filtered.length})`}>
            <DataTable data={filtered} columns={[
                { key: 'voucherNo', label: t.tableCols.voucher },
                { key: 'agency', label: t.tableCols.agency },
                { key: 'channel', label: t.tableCols.channel },
                { key: 'roomType', label: t.tableCols.roomType },
                { key: 'boardType', label: t.tableCols.boardType },
                { key: 'checkIn', label: t.tableCols.checkIn },
                { key: 'checkOut', label: t.tableCols.checkOut },
                { key: 'nights', label: t.tableCols.nights },
                { key: 'totalPrice', label: t.tableCols.price, format: (v: number) => fmt(v) },
                { key: 'currency', label: t.tableCols.currency },
                { key: 'country', label: t.tableCols.country },
                { key: 'status', label: t.tableCols.status },
            ]} height={600} />
        </ChartCard>
    </div>
}
