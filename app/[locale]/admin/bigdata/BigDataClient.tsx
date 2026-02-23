'use client'
import React, { useState, useMemo } from 'react'
import { BigDataService } from '@/lib/services/bigdata'
import { ChartCard, MiniLine, MiniBar, DualBar, DualLine, MiniPie, DonutChart, MiniArea, MiniScatter, ForecastChart, HeatmapGrid, DataTable, StackedBar } from './charts'
import { BarChart3, TrendingUp, BedDouble, Users, Globe, CalendarDays, Target, Zap, Database, LayoutDashboard } from 'lucide-react'
import { getMonthlyBudgetData, getSeasonTotal, getSeasonComparison, getChannelBudgetSummary } from '@/lib/services/budget-2026'
import ModuleOffline from '@/components/admin/ModuleOffline'

const fmt = (n: number) => n?.toLocaleString('tr-TR') || '0'
const fmtK = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : fmt(n)
const fmtEur = (n: number) => n >= 1_000_000 ? `€${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `€${(n / 1_000).toFixed(0)}K` : `€${Math.round(n)}`
const EUR_RATE = 38.5

const TABS = [
    { id: 'overview', label: 'Genel Bakış', icon: LayoutDashboard },
    { id: 'revenue', label: 'Gelir Analizi', icon: TrendingUp },
    { id: 'occupancy', label: 'Doluluk', icon: BedDouble },
    { id: 'channels', label: 'Kanal & Acenta', icon: BarChart3 },
    { id: 'guests', label: 'Misafir & Demografik', icon: Globe },
    { id: 'booking', label: 'Rez. Kalıpları', icon: CalendarDays },
    { id: 'performance', label: 'Performans', icon: Target },
    { id: 'forecast', label: 'Tahmin & Pace', icon: Zap },
    { id: 'comparative', label: 'Karşılaştırma', icon: Users },
    { id: 'rawdata', label: 'Ham Veri', icon: Database },
]

export default function BigDataClient({ data, error, locale }: { data: any; error: string | null; locale: string }) {
    const [tab, setTab] = useState('overview')

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
            nationalities: S.nationalityDistribution(reservations),
            revByCountry: S.revenueByCountry(reservations),
            stayByCountry: S.avgStayByCountry(reservations),
            natTrend: S.nationalityTrend(reservations),
            guestSegments: S.guestSegmentation(reservations),
            natChannelMatrix: S.nationalityChannelMatrix(reservations),
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
    if (!analytics) return <div className="p-8 text-slate-400">Veri yükleniyor...</div>

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header */}
            <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-30">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Big Data Analytics</h1>
                            <p className="text-xs text-slate-400 mt-1">{reservations.length} rezervasyon • {new Set(reservations.map((r: any) => r.nationality)).size} ülke • Son güncelleme: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString('tr-TR') : '-'}</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                            <span className="text-xs text-emerald-400 font-medium">Canlı API</span>
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
                {tab === 'overview' && <OverviewTab a={analytics} />}
                {tab === 'revenue' && <RevenueTab a={analytics} />}
                {tab === 'occupancy' && <OccupancyTab a={analytics} />}
                {tab === 'channels' && <ChannelsTab a={analytics} />}
                {tab === 'guests' && <GuestsTab a={analytics} />}
                {tab === 'booking' && <BookingTab a={analytics} />}
                {tab === 'performance' && <PerformanceTab a={analytics} />}
                {tab === 'forecast' && <ForecastTab a={analytics} />}
                {tab === 'comparative' && <ComparativeTab a={analytics} />}
                {tab === 'rawdata' && <RawDataTab reservations={data?.reservations || []} a={analytics} />}
            </div>
        </div>
    )
}

// ═══ TAB 1: OVERVIEW ═══
function OverviewTab({ a }: { a: any }) {
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
                <p className="text-[10px] text-amber-400 uppercase tracking-wider mb-1">Bütçe Gerçekleşme</p>
                <p className={`text-lg font-bold ${seasonComp.realization >= 100 ? 'text-emerald-400' : seasonComp.realization >= 70 ? 'text-amber-400' : 'text-red-400'}`}>%{seasonComp.realization}</p>
                <p className="text-xs text-slate-400">{fmtEur(totalRevEUR)} / {fmtEur(seasonBudget)}</p>
            </div>
        </div>
        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Aylık Gelir vs Bütçe">
                <DualBar data={a.monthlyRevenue.map((m: any) => {
                    const mi = m.monthIndex != null ? m.monthIndex + 1 : parseInt((m.month || '').split(' ')[0]) || 0
                    const bm = budgetMonths.find(b => b.month === mi)
                    return { month: m.month, actual: Math.round(m.revenue / EUR_RATE), budget: bm?.budget || 0 }
                })} xKey="month" y1="actual" y2="budget" c1="#06b6d4" c2="#f59e0b" />
            </ChartCard>
            <ChartCard title="Kanal Dağılımı"><DonutChart data={a.channels} nameKey="channel" valueKey="share" /></ChartCard>
            <ChartCard title="ADR Trendi (Aylık)"><MiniLine data={a.adrTrend} xKey="date" yKey="revenue" color="#8b5cf6" /></ChartCard>
            <ChartCard title="Doluluk Oranı"><MiniLine data={a.dailyOccupancy.slice(-60)} xKey="date" yKey="rate" color="#10b981" /></ChartCard>
            <ChartCard title="Milliyet Dağılımı"><MiniPie data={a.nationalities.slice(0, 8)} nameKey="country" valueKey="count" /></ChartCard>
            <ChartCard title="Pansiyon Tipi"><DonutChart data={a.boardTypeDist} nameKey="boardType" valueKey="count" /></ChartCard>
        </div>
    </div>
}

// ═══ TAB 2: REVENUE ═══
function RevenueTab({ a }: { a: any }) {
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
        <h2 className="text-lg font-bold text-cyan-400">💰 Gelir Analitiği — 10 Rapor & Grafik</h2>

        {/* Budget Summary Banner */}
        <div className="bg-gradient-to-r from-amber-900/20 to-slate-800 rounded-xl border border-amber-700/30 p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <p className="text-xs text-amber-400 font-medium">📊 2026 Sezon Bütçesi</p>
                    <p className="text-sm text-slate-300">Hedef: <span className="font-bold text-white">{fmtEur(seasonBudget)}</span> • Gerçekleşen: <span className="font-bold text-cyan-400">{fmtEur(totalRevEUR)}</span></p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <p className={`text-2xl font-bold ${seasonComp.realization >= 100 ? 'text-emerald-400' : seasonComp.realization >= 70 ? 'text-amber-400' : 'text-red-400'}`}>%{seasonComp.realization}</p>
                        <p className="text-[10px] text-slate-400">Gerçekleşme</p>
                    </div>
                    <div className="text-center">
                        <p className={`text-lg font-bold ${seasonComp.remaining > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>{fmtEur(Math.abs(seasonComp.remaining))}</p>
                        <p className="text-[10px] text-slate-400">{seasonComp.remaining > 0 ? 'Kalan' : 'Aşım'}</p>
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="R1: Günlük Gelir Trendi" span={2}><MiniLine data={a.dailyRevenue.slice(-90)} xKey="date" yKey="revenue" /></ChartCard>
            <ChartCard title="R2: Haftalık Gelir"><MiniBar data={a.weeklyRevenue.slice(-20)} xKey="date" yKey="revenue" color="#8b5cf6" /></ChartCard>
            <ChartCard title="R3: Aylık Gelir vs Bütçe (€)">
                <DualBar data={monthlyWithBudget.map((m: any) => ({ month: m.month, actual: m.actualEUR, budget: m.budgetEUR }))} xKey="month" y1="actual" y2="budget" c1="#06b6d4" c2="#f59e0b" />
            </ChartCard>
            <ChartCard title="R5: Gelir Tahmini (7 Günlük MA)" span={2}><ForecastChart data={a.revenueForecast.slice(-60)} /></ChartCard>
            <ChartCard title="R6: RevPAR Trendi"><MiniLine data={a.revparTrend.slice(-60)} xKey="date" yKey="revenue" color="#10b981" /></ChartCard>
            <ChartCard title="R7: ADR Trendi"><MiniLine data={a.adrTrend} xKey="date" yKey="revenue" color="#f59e0b" /></ChartCard>
            <ChartCard title="R8: Para Birimi Dağılımı"><DonutChart data={a.currencyBreakdown} nameKey="currency" valueKey="share" /></ChartCard>
            <ChartCard title="R9: Toplam vs Ödenen Gelir"><DualBar data={a.totalVsPaid} xKey="month" y1="total" y2="paid" c1="#06b6d4" c2="#10b981" /></ChartCard>
            <ChartCard title="R10: Gelir Isı Haritası (Gün×Ay, ₺K)" span={2}><HeatmapGrid data={a.revenueHeatmap} /></ChartCard>
        </div>
        {/* Revenue Table with Budget */}
        <ChartCard title="Aylık Gelir & Bütçe Tablosu">
            <DataTable data={monthlyWithBudget} columns={[
                { key: 'month', label: 'Ay' },
                { key: 'count', label: 'Rez.', format: (v: number) => fmt(v) },
                { key: 'revenue', label: 'Gelir (₺)', format: (v: number) => `₺${fmt(v)}` },
                { key: 'budgetEUR', label: 'Bütçe (€)', format: (v: number) => fmtEur(v) },
                { key: 'actualEUR', label: 'Gerçek (€)', format: (v: number) => fmtEur(v) },
                { key: 'remainingEUR', label: 'Kalan (€)', format: (v: number) => v >= 0 ? fmtEur(v) : `-${fmtEur(Math.abs(v))}` },
                { key: 'realization', label: '%', format: (v: number) => `%${v}` },
                { key: 'adr', label: 'ADR (₺)', format: (v: number) => `₺${fmt(v)}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 3: OCCUPANCY ═══
function OccupancyTab({ a }: { a: any }) {
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">🛏️ Doluluk & Oda Analizi — 8 Rapor & Grafik</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="R11: Günlük Doluluk Oranı (%)" span={2}><MiniLine data={a.dailyOccupancy.slice(-90)} xKey="date" yKey="rate" color="#10b981" /></ChartCard>
            <ChartCard title="R12: Doluluk Tahmini"><ForecastChart data={a.occForecast.slice(-60)} /></ChartCard>
            <ChartCard title="R13: Oda Tipi Dağılımı"><MiniBar data={a.roomTypeOcc} xKey="roomType" yKey="count" color="#8b5cf6" /></ChartCard>
            <ChartCard title="R14: Doluluk vs ADR Korelasyon"><MiniScatter data={a.occVsAdr} xKey="occupancy" yKey="adr" label="Ay bazlı" /></ChartCard>
            <ChartCard title="R15: Doluluk Isı Haritası (Gün×Ay, %)" ><HeatmapGrid data={a.occHeatmap} /></ChartCard>
            <ChartCard title="R16: Hafta İçi vs Hafta Sonu">
                <div className="grid grid-cols-2 gap-3">
                    {a.weekdayWeekend.map((w: any) => (
                        <div key={w.type} className="bg-slate-700/30 rounded-lg p-3 text-center">
                            <p className="text-xs text-slate-400">{w.type}</p>
                            <p className="text-xl font-bold text-white">{fmt(w.count)}</p>
                            <p className="text-xs text-cyan-400">ADR: ₺{fmt(w.adr)}</p>
                            <p className="text-xs text-slate-400">{w.avgNights} gece ort.</p>
                        </div>
                    ))}
                </div>
            </ChartCard>
            <ChartCard title="R17: Sezonluk Karşılaştırma"><MiniBar data={a.seasonal} xKey="season" yKey="revenue" color="#f59e0b" /></ChartCard>
            <ChartCard title="R18: Boş Oda Kaybı (₺)" span={2}><MiniLine data={a.vacantLoss.slice(-60)} xKey="date" yKey="potentialLoss" color="#ef4444" /></ChartCard>
        </div>
        <ChartCard title="Oda Tipi Detay Tablosu">
            <DataTable data={a.roomTypeOcc} columns={[
                { key: 'roomType', label: 'Oda Tipi' },
                { key: 'count', label: 'Rez.', format: (v: number) => fmt(v) },
                { key: 'revenue', label: 'Gelir (₺)', format: (v: number) => `₺${fmt(v)}` },
                { key: 'avgRate', label: 'Ort. Fiyat', format: (v: number) => `₺${fmt(v)}` },
                { key: 'avgNights', label: 'Ort. Kalış' },
                { key: 'share', label: 'Pay (%)', format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 4: CHANNELS ═══
function ChannelsTab({ a }: { a: any }) {
    const channelKeys = a.channels.map((c: any) => c.channel)
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">📡 Kanal & Acenta Analizi — 7 Rapor & Grafik</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="R19: Kanal Dağılımı"><DonutChart data={a.channels} nameKey="channel" valueKey="share" /></ChartCard>
            <ChartCard title="R20: Kanal Bazlı Gelir Trendi"><StackedBar data={a.channelRevTrend} xKey="month" keys={channelKeys} /></ChartCard>
            <ChartCard title="R21: Kanal Bazlı ADR"><MiniBar data={a.channelADR} xKey="channel" yKey="adr" color="#8b5cf6" /></ChartCard>
            <ChartCard title="R22: Kanal Performans Trendi"><MiniArea data={a.channelPerfTrend} xKey="month" keys={channelKeys} /></ChartCard>
            <ChartCard title="R23: OTA vs Direkt"><DualBar data={a.otaVsDirect} xKey="month" y1="OTA" y2="Direct" c1="#f59e0b" c2="#10b981" /></ChartCard>
            <ChartCard title="R25: Kanal Mix Değişimi (%)" ><MiniArea data={a.channelMix} xKey="month" keys={channelKeys} /></ChartCard>
        </div>
        <ChartCard title="R24: Acenta Sıralaması (Top 30)">
            <DataTable data={a.agencyRanking} columns={[
                { key: 'agency', label: 'Acenta' },
                { key: 'channel', label: 'Kanal' },
                { key: 'count', label: 'Rez.', format: (v: number) => fmt(v) },
                { key: 'revenue', label: 'Gelir (₺)', format: (v: number) => `₺${fmt(v)}` },
                { key: 'adr', label: 'ADR (₺)', format: (v: number) => `₺${fmt(v)}` },
            ]} />
        </ChartCard>
        <ChartCard title="Kanal Özet Tablosu">
            <DataTable data={a.channels} columns={[
                { key: 'channel', label: 'Kanal' },
                { key: 'count', label: 'Rez.', format: (v: number) => fmt(v) },
                { key: 'revenue', label: 'Gelir (₺)', format: (v: number) => `₺${fmt(v)}` },
                { key: 'adr', label: 'ADR', format: (v: number) => `₺${fmt(v)}` },
                { key: 'avgNights', label: 'Ort. Kalış' },
                { key: 'share', label: 'Pay (%)', format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 5: GUESTS ═══
function GuestsTab({ a }: { a: any }) {
    const topCountries = a.nationalities.slice(0, 6).map((n: any) => n.country)
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">🌍 Misafir & Demografik Analiz — 7 Rapor & Grafik</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="R26: Milliyet Dağılımı"><DonutChart data={a.nationalities.slice(0, 10)} nameKey="country" valueKey="count" /></ChartCard>
            <ChartCard title="R27: Ülke Bazlı Gelir (₺)"><MiniBar data={a.revByCountry.slice(0, 10)} xKey="country" yKey="revenue" color="#f59e0b" /></ChartCard>
            <ChartCard title="R28: Ülke Bazlı Ort. Kalış"><MiniBar data={a.stayByCountry.slice(0, 10)} xKey="country" yKey="avgNights" color="#10b981" /></ChartCard>
            <ChartCard title="R29: Milliyet Trendi (Aylık)"><MiniArea data={a.natTrend} xKey="month" keys={topCountries} /></ChartCard>
            <ChartCard title="R30: Misafir Segmentasyonu"><MiniBar data={a.guestSegments} xKey="segment" yKey="count" color="#8b5cf6" /></ChartCard>
            <ChartCard title="R31: Milliyet-Kanal Matrisi"><HeatmapGrid data={a.natChannelMatrix} /></ChartCard>
            <ChartCard title="R32: Ülke Bazlı Ort. Fiyat"><MiniBar data={a.rateByCountry.slice(0, 10)} xKey="country" yKey="avgRate" color="#ec4899" /></ChartCard>
        </div>
        <ChartCard title="Milliyet Detay Tablosu">
            <DataTable data={a.nationalities} columns={[
                { key: 'country', label: 'Ülke' },
                { key: 'count', label: 'Rez.', format: (v: number) => fmt(v) },
                { key: 'revenue', label: 'Gelir (₺)', format: (v: number) => `₺${fmt(v)}` },
                { key: 'avgNights', label: 'Ort. Kalış' },
                { key: 'avgRate', label: 'Ort. Fiyat (₺)', format: (v: number) => `₺${fmt(v)}` },
                { key: 'share', label: 'Pay (%)', format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 6: BOOKING PATTERNS ═══
function BookingTab({ a }: { a: any }) {
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">📋 Rezervasyon Kalıpları — 8 Rapor & Grafik</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="R33: Rez. Lead Time Dağılımı"><MiniBar data={a.leadTime} xKey="range" yKey="count" color="#06b6d4" /></ChartCard>
            <ChartCard title="R34: Rez. Günü Analizi (Hangi Gün)"><MiniBar data={a.bookingDay} xKey="day" yKey="count" color="#8b5cf6" /></ChartCard>
            <ChartCard title="R35: İptal Oranı (Aylık)"><MiniBar data={a.cancellation} xKey="month" yKey="rate" color="#ef4444" /></ChartCard>
            <ChartCard title="R36: Ortalama Kalış Süresi Trendi"><MiniLine data={a.avgStayTrend} xKey="month" yKey="avgNights" color="#10b981" /></ChartCard>
            <ChartCard title="R37: Oda Sayısı Dağılımı"><DonutChart data={a.roomCountDist} nameKey="rooms" valueKey="count" /></ChartCard>
            <ChartCard title="R38: Pansiyon Tipi Dağılımı"><DonutChart data={a.boardTypeDist} nameKey="boardType" valueKey="count" /></ChartCard>
            <ChartCard title="R39: Oda Tipi Tercihi"><MiniBar data={a.roomTypePref} xKey="roomType" yKey="count" color="#f59e0b" /></ChartCard>
            <ChartCard title="R40: Kalış Süresi Dağılımı"><MiniBar data={a.stayLengthDist} xKey="nights" yKey="count" color="#ec4899" /></ChartCard>
        </div>
        <ChartCard title="Lead Time Detay Tablosu">
            <DataTable data={a.leadTime} columns={[
                { key: 'range', label: 'Süre Aralığı' },
                { key: 'count', label: 'Rez. Sayısı', format: (v: number) => fmt(v) },
                { key: 'share', label: 'Pay (%)', format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
        <ChartCard title="Kalış Süresi Detay">
            <DataTable data={a.stayLengthDist} columns={[
                { key: 'nights', label: 'Süre' },
                { key: 'count', label: 'Sayı', format: (v: number) => fmt(v) },
                { key: 'revenue', label: 'Gelir (₺)', format: (v: number) => `₺${fmt(v)}` },
                { key: 'share', label: 'Pay (%)', format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 7: PERFORMANCE ═══
function PerformanceTab({ a }: { a: any }) {
    const budgetMonths = getMonthlyBudgetData()
    const perfWithBudget = a.monthlyPerf.map((m: any) => {
        const mi = m.monthIndex != null ? m.monthIndex + 1 : 0
        const bm = budgetMonths.find(b => b.month === mi)
        const actualEUR = Math.round(m.revenue / EUR_RATE)
        const budget = bm?.budget || 0
        return { ...m, budgetEUR: budget, actualEUR, realization: budget > 0 ? Math.round((actualEUR / budget) * 100) : 0 }
    })

    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">🎯 Performans Göstergeleri — 8 Rapor & Grafik</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="R41: GOPPAR (Brüt Operasyonel Kâr / Oda)"><MiniBar data={a.goppar} xKey="month" yKey="goppar" color="#10b981" /></ChartCard>
            <ChartCard title="R42: TRevPAR (Toplam Gelir / Mevcut Oda)"><MiniBar data={a.trevpar} xKey="month" yKey="trevpar" color="#06b6d4" /></ChartCard>
            <ChartCard title="R46: Check-in Gün Dağılımı"><MiniBar data={a.checkInDay} xKey="day" yKey="count" color="#8b5cf6" /></ChartCard>
            <ChartCard title="R47: Fiyat Segmenti Trendi"><StackedBar data={a.priceSegTrend} xKey="month" keys={['ekonomik', 'orta', 'ust', 'premium', 'vip']} /></ChartCard>
            <ChartCard title="R48: Aylık Performans & Bütçe İndeksi" span={2}>
                <DataTable data={perfWithBudget} columns={[
                    { key: 'month', label: 'Ay' },
                    { key: 'count', label: 'Rez.' },
                    { key: 'revenue', label: 'Gelir (₺)', format: (v: number) => `₺${fmt(v)}` },
                    { key: 'budgetEUR', label: 'Bütçe (€)', format: (v: number) => fmtEur(v) },
                    { key: 'actualEUR', label: 'Gerçek (€)', format: (v: number) => fmtEur(v) },
                    { key: 'realization', label: 'Gerçekleşme', format: (v: number) => `%${v}` },
                    { key: 'occupancyRate', label: 'Doluluk (%)', format: (v: number) => `%${v}` },
                    { key: 'adr', label: 'ADR (₺)', format: (v: number) => `₺${fmt(v)}` },
                    { key: 'revpar', label: 'RevPAR (₺)', format: (v: number) => `₺${fmt(v)}` },
                ]} />
            </ChartCard>
            <ChartCard title="R49: Gelir Yoğunlaşma (Pareto)"><MiniLine data={a.revenueConc} xKey="percentile" yKey="revenueShare" color="#f59e0b" /></ChartCard>
            <ChartCard title="R50: Rate Tipi Analizi"><MiniBar data={a.rateTypeAnalysis.slice(0, 10)} xKey="rateType" yKey="revenue" color="#ec4899" /></ChartCard>
        </div>
        <ChartCard title="Rate Tipi Detay Tablosu">
            <DataTable data={a.rateTypeAnalysis} columns={[
                { key: 'rateType', label: 'Rate Tipi' },
                { key: 'count', label: 'Rez.', format: (v: number) => fmt(v) },
                { key: 'revenue', label: 'Gelir (₺)', format: (v: number) => `₺${fmt(v)}` },
                { key: 'adr', label: 'ADR (₺)', format: (v: number) => `₺${fmt(v)}` },
                { key: 'share', label: 'Pay (%)', format: (v: number) => `%${v}` },
            ]} />
        </ChartCard>
    </div>
}

// ═══ TAB 8: FORECAST & PACE ═══
function ForecastTab({ a }: { a: any }) {
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">⚡ Tahmin & Pace Raporu — 5 Rapor & Grafik</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="R5: Gelir Tahmin (MA-7)" span={2}><ForecastChart data={a.revenueForecast.slice(-45)} /></ChartCard>
            <ChartCard title="R43: Pace Raporu (Bu Yıl vs Geçen Yıl)" span={2}><DualLine data={a.pace} xKey="label" y1="currentYear" y2="prevYear" c1="#06b6d4" c2="#f59e0b" /></ChartCard>
            <ChartCard title="R44: Pick-up Analizi (Günlük Yeni Rez.)" span={2}><MiniBar data={a.pickup.slice(-60)} xKey="date" yKey="newBookings" color="#10b981" /></ChartCard>
            <ChartCard title="R12: Doluluk Tahmin"><ForecastChart data={a.occForecast.slice(-45)} /></ChartCard>
            <ChartCard title="Sezonluk Tahmin Karşılaştırma"><MiniBar data={a.seasonal} xKey="season" yKey="count" color="#8b5cf6" /></ChartCard>
        </div>
    </div>
}

// ═══ TAB 9: COMPARATIVE ═══
function ComparativeTab({ a }: { a: any }) {
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">📊 Karşılaştırmalı Raporlar — 5 Rapor & Grafik</h2>
        {/* YoY Table */}
        <ChartCard title="R4: Yıllık Karşılaştırma (YoY)">
            <div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="border-b border-slate-700"><th className="p-3 text-left text-slate-400">Metrik</th><th className="p-3 text-right text-slate-400">Bu Sezon</th><th className="p-3 text-right text-slate-400">Geçen Sezon</th><th className="p-3 text-right text-slate-400">Değişim</th><th className="p-3 text-right text-slate-400">%</th></tr></thead><tbody>
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
            <ChartCard title="Pace: Bu Yıl vs Geçen Yıl"><DualLine data={a.pace} xKey="label" y1="currentYear" y2="prevYear" /></ChartCard>
            <ChartCard title="Sezonluk Gelir Karşılaştırma"><MiniBar data={a.seasonal} xKey="season" yKey="revenue" color="#f59e0b" /></ChartCard>
            <ChartCard title="Kanal Bazlı ADR Karşılaştırma"><MiniBar data={a.channelADR} xKey="channel" yKey="adr" color="#8b5cf6" /></ChartCard>
            <ChartCard title="Oda Tipi Gelir Karşılaştırma"><MiniBar data={a.roomTypeOcc} xKey="roomType" yKey="revenue" color="#10b981" /></ChartCard>
        </div>
    </div>
}

// ═══ TAB 10: RAW DATA ═══
function RawDataTab({ reservations, a }: { reservations: any[]; a: any }) {
    const [search, setSearch] = useState('')
    const filtered = reservations.filter((r: any) =>
        !search || r.agency?.toLowerCase().includes(search.toLowerCase()) ||
        r.nationality?.toLowerCase().includes(search.toLowerCase()) ||
        r.voucherNo?.toLowerCase().includes(search.toLowerCase()) ||
        r.roomType?.toLowerCase().includes(search.toLowerCase())
    )
    return <div className="space-y-6">
        <h2 className="text-lg font-bold text-cyan-400">🗄️ Ham Veri & Tablolar</h2>
        <div className="flex gap-3 items-center">
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Ara (acenta, ülke, voucher, oda tipi)..." className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 w-96 focus:outline-none focus:border-cyan-500" />
            <span className="text-xs text-slate-400">{filtered.length} / {reservations.length} kayıt</span>
        </div>
        <ChartCard title={`Tüm Rezervasyonlar (${filtered.length})`}>
            <DataTable data={filtered} columns={[
                { key: 'voucherNo', label: 'Voucher' },
                { key: 'agency', label: 'Acenta' },
                { key: 'channel', label: 'Kanal' },
                { key: 'roomType', label: 'Oda Tipi' },
                { key: 'boardType', label: 'Pansiyon' },
                { key: 'checkIn', label: 'Giriş' },
                { key: 'checkOut', label: 'Çıkış' },
                { key: 'nights', label: 'Gece' },
                { key: 'totalPrice', label: 'Fiyat', format: (v: number) => fmt(v) },
                { key: 'currency', label: 'Döviz' },
                { key: 'nationality', label: 'Milliyet' },
                { key: 'status', label: 'Durum' },
            ]} height={600} />
        </ChartCard>
    </div>
}
