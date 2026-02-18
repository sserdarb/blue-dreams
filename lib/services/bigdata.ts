/**
 * Big Data Analytics Service
 * Processes Elektra booking API data into 50+ analytical reports
 * covering revenue, occupancy, channels, guests, booking patterns,
 * performance, forecasting, and comparative analysis.
 */

import { ElektraService, type Reservation, type RoomAvailability, type DailyOccupancy } from './elektra'

// ─── Types ────────────────────────────────────────────────────

export type TimeGranularity = 'daily' | 'weekly' | 'monthly'

export type RevenuePoint = { date: string; revenue: number; revenueEUR: number; count: number }
export type OccupancyPoint = { date: string; rate: number; available: number; occupied: number; total: number }
export type ChannelMetric = { channel: string; revenue: number; count: number; adr: number; avgNights: number; share: number; color: string }
export type NationalityMetric = { country: string; count: number; revenue: number; avgNights: number; avgRate: number; share: number }
export type RoomTypeMetric = { roomType: string; count: number; revenue: number; avgRate: number; avgNights: number; share: number }
export type BoardTypeMetric = { boardType: string; count: number; revenue: number; share: number }
export type AgencyMetric = { agency: string; channel: string; count: number; revenue: number; adr: number }
export type LeadTimeDistribution = { range: string; count: number; share: number }
export type DayOfWeekMetric = { day: string; dayIndex: number; count: number; revenue: number; avgRate: number }
export type MonthlyMetric = { month: string; monthIndex: number; revenue: number; count: number; occupancyRate: number; adr: number; revpar: number }
export type HeatmapCell = { x: string; y: string; value: number }
export type ForecastPoint = { date: string; actual: number | null; forecast: number }
export type PacePoint = { daysOut: number; currentYear: number; prevYear: number; label: string }
export type PickupPoint = { date: string; newBookings: number; cancellations: number; net: number }
export type PriceSegment = { segment: string; count: number; revenue: number; share: number }
export type CurrencyBreakdown = { currency: string; revenue: number; count: number; share: number }
export type YoYComparison = { metric: string; current: number; previous: number; change: number; changePercent: number }
export type WeekdayWeekend = { type: string; count: number; revenue: number; adr: number; avgNights: number }
export type SeasonalMetric = { season: string; count: number; revenue: number; occupancy: number; adr: number }
export type StayLengthDist = { nights: string; count: number; share: number; revenue: number }
export type KPICard = { label: string; value: string; subValue?: string; change?: number; icon: string }

// EUR/TRY rate used for conversions
const EUR_RATE = 38.5

function toTRY(amount: number, currency: string): number {
    if (currency === 'TRY') return amount
    if (currency === 'EUR') return amount * EUR_RATE
    if (currency === 'USD') return amount * 35.7
    return amount * EUR_RATE
}

function toEUR(tryAmount: number): number {
    return tryAmount / EUR_RATE
}

// ─── Channel Colors ────────────────────────────────────────────
const CHANNEL_COLORS: Record<string, string> = {
    'OTA': '#f59e0b',
    'Call Center': '#0ea5e9',
    'Tur Operatörü': '#8b5cf6',
    'Direkt': '#10b981',
    'Website': '#ec4899',
    'Unknown': '#64748b',
}

// ─── Helpers ───────────────────────────────────────────────────

function groupBy<T>(arr: T[], keyFn: (item: T) => string): Map<string, T[]> {
    const map = new Map<string, T[]>()
    for (const item of arr) {
        const key = keyFn(item)
        if (!map.has(key)) map.set(key, [])
        map.get(key)!.push(item)
    }
    return map
}

function dayOfWeekName(dayIndex: number): string {
    return ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][dayIndex] || ''
}

function monthName(monthIndex: number): string {
    return ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'][monthIndex] || ''
}

function weekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function seasonOf(month: number): string {
    if (month >= 5 && month <= 8) return 'Yaz (Haz-Eyl)'
    if (month >= 3 && month <= 4) return 'İlkbahar (Mar-May)'
    if (month >= 9 && month <= 10) return 'Sonbahar (Eyl-Kas)'
    return 'Kış (Ara-Şub)'
}

// ─── BigDataService ─────────────────────────────────────────────

export const BigDataService = {

    async fetchAllData() {
        const now = new Date()
        const year = now.getFullYear()

        // Current season reservations + previous year for comparison
        const [currentReservations, prevYearReservations, availability, occupancy, rates] = await Promise.all([
            ElektraService.getAllSeasonReservations().catch(() => [] as Reservation[]),
            ElektraService.getReservationsByBookingDate(
                new Date(year - 2, 10, 1), new Date(year - 1, 11, 31)
            ).catch(() => [] as Reservation[]),
            ElektraService.getAvailability(
                new Date(year, 0, 1), new Date(year, 11, 31)
            ).catch(() => [] as RoomAvailability[]),
            ElektraService.getOccupancy(
                new Date(year, 0, 1), new Date(year, 11, 31)
            ).catch(() => [] as DailyOccupancy[]),
            ElektraService.getExchangeRates().catch(() => ({ EUR_TO_TRY: 38.5, USD_TO_TRY: 35.7, fetchedAt: 0 })),
        ])

        return { currentReservations, prevYearReservations, availability, occupancy, rates }
    },

    // ═══════════════════════════════════════════════════════════
    // 1. REVENUE ANALYTICS (Reports 1-10)
    // ═══════════════════════════════════════════════════════════

    // R1: Daily Revenue Trend
    dailyRevenueTrend(reservations: Reservation[]): RevenuePoint[] {
        const byDate = groupBy(reservations, r => r.checkIn.slice(0, 10))
        return Array.from(byDate.entries()).map(([date, rsvs]) => ({
            date,
            revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
            revenueEUR: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0) / EUR_RATE),
            count: rsvs.length,
        })).sort((a, b) => a.date.localeCompare(b.date))
    },

    // R2: Weekly Revenue
    weeklyRevenue(reservations: Reservation[]): RevenuePoint[] {
        const byWeek = groupBy(reservations, r => {
            const d = new Date(r.checkIn)
            return `${d.getFullYear()}-W${String(weekNumber(d)).padStart(2, '0')}`
        })
        return Array.from(byWeek.entries()).map(([date, rsvs]) => ({
            date,
            revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
            revenueEUR: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0) / EUR_RATE),
            count: rsvs.length,
        })).sort((a, b) => a.date.localeCompare(b.date))
    },

    // R3: Monthly Revenue Summary
    monthlyRevenueSummary(reservations: Reservation[]): MonthlyMetric[] {
        const byMonth = groupBy(reservations, r => {
            const d = new Date(r.checkIn)
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        })
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const totalRevTRY = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const totalNights = rsvs.reduce((s, r) => s + r.nights * r.roomCount, 0)
            const adr = totalNights > 0 ? totalRevTRY / totalNights : 0
            const mi = parseInt(month.split('-')[1]) - 1
            return {
                month: monthName(mi) + ' ' + month.split('-')[0],
                monthIndex: mi,
                revenue: Math.round(totalRevTRY),
                count: rsvs.length,
                occupancyRate: 0,
                adr: Math.round(adr),
                revpar: 0,
            }
        }).sort((a, b) => a.month.localeCompare(b.month))
    },

    // R4: YoY Revenue Growth
    yoyRevenueComparison(current: Reservation[], previous: Reservation[]): YoYComparison[] {
        const curRev = current.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
        const prevRev = previous.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
        const curNights = current.reduce((s, r) => s + r.nights * r.roomCount, 0)
        const prevNights = previous.reduce((s, r) => s + r.nights * r.roomCount, 0)
        const curADR = curNights > 0 ? curRev / curNights : 0
        const prevADR = prevNights > 0 ? prevRev / prevNights : 0

        const metrics: YoYComparison[] = [
            { metric: 'Toplam Gelir (₺)', current: Math.round(curRev), previous: Math.round(prevRev), change: 0, changePercent: 0 },
            { metric: 'Toplam Gelir (€)', current: Math.round(toEUR(curRev)), previous: Math.round(toEUR(prevRev)), change: 0, changePercent: 0 },
            { metric: 'Rezervasyon Sayısı', current: current.length, previous: previous.length, change: 0, changePercent: 0 },
            { metric: 'Oda/Gece', current: curNights, previous: prevNights, change: 0, changePercent: 0 },
            { metric: 'ADR (₺)', current: Math.round(curADR), previous: Math.round(prevADR), change: 0, changePercent: 0 },
            { metric: 'Ort. Kalış (gece)', current: +(current.length > 0 ? current.reduce((s, r) => s + r.nights, 0) / current.length : 0).toFixed(1), previous: +(previous.length > 0 ? previous.reduce((s, r) => s + r.nights, 0) / previous.length : 0).toFixed(1), change: 0, changePercent: 0 },
        ]

        for (const m of metrics) {
            m.change = m.current - m.previous
            m.changePercent = m.previous > 0 ? Math.round(((m.current - m.previous) / m.previous) * 100) : 0
        }
        return metrics
    },

    // R5: Revenue Forecast (simple moving average)
    revenueForecast(reservations: Reservation[]): ForecastPoint[] {
        const daily = this.dailyRevenueTrend(reservations)
        const result: ForecastPoint[] = daily.map(d => ({ date: d.date, actual: d.revenue, forecast: 0 }))
        // 7-day moving average forecast
        for (let i = 0; i < result.length; i++) {
            const window = result.slice(Math.max(0, i - 6), i + 1)
            result[i].forecast = Math.round(window.reduce((s, w) => s + (w.actual || 0), 0) / window.length)
        }
        // Add 14-day forecast extension
        const lastDate = new Date(daily[daily.length - 1]?.date || new Date())
        const last7 = daily.slice(-7)
        const avgDaily = last7.reduce((s, d) => s + d.revenue, 0) / (last7.length || 1)
        for (let i = 1; i <= 14; i++) {
            const d = new Date(lastDate)
            d.setDate(d.getDate() + i)
            result.push({
                date: d.toISOString().split('T')[0],
                actual: null,
                forecast: Math.round(avgDaily * (1 + (Math.random() - 0.5) * 0.1)),
            })
        }
        return result
    },

    // R6: RevPAR Trend (Revenue Per Available Room)
    revparTrend(reservations: Reservation[], occupancy: DailyOccupancy[]): RevenuePoint[] {
        const revByDate = new Map<string, number>()
        for (const r of reservations) {
            const date = r.checkIn.slice(0, 10)
            revByDate.set(date, (revByDate.get(date) || 0) + toTRY(r.totalPrice, r.currency) / Math.max(1, r.nights))
        }
        return occupancy.map(o => {
            const dailyRev = revByDate.get(o.date) || 0
            const revpar = o.totalRooms > 0 ? dailyRev / o.totalRooms : 0
            return {
                date: o.date,
                revenue: Math.round(revpar),
                revenueEUR: Math.round(toEUR(revpar)),
                count: o.occupiedRooms,
            }
        }).sort((a, b) => a.date.localeCompare(b.date))
    },

    // R7: ADR Trend (Average Daily Rate)
    adrTrend(reservations: Reservation[]): RevenuePoint[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        return Array.from(byMonth.entries()).map(([date, rsvs]) => {
            const totalRev = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const totalNights = rsvs.reduce((s, r) => s + r.nights * r.roomCount, 0)
            return {
                date,
                revenue: Math.round(totalNights > 0 ? totalRev / totalNights : 0),
                revenueEUR: Math.round(totalNights > 0 ? toEUR(totalRev / totalNights) : 0),
                count: rsvs.length,
            }
        }).sort((a, b) => a.date.localeCompare(b.date))
    },

    // R8: Revenue by Currency
    revenueByCurrency(reservations: Reservation[]): CurrencyBreakdown[] {
        const byCurrency = groupBy(reservations, r => r.currency || 'TRY')
        const total = reservations.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
        return Array.from(byCurrency.entries()).map(([currency, rsvs]) => ({
            currency,
            revenue: Math.round(rsvs.reduce((s, r) => s + r.totalPrice, 0)),
            count: rsvs.length,
            share: Math.round((rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0) / (total || 1)) * 100),
        })).sort((a, b) => b.revenue - a.revenue)
    },

    // R9: Total vs Paid Revenue
    totalVsPaidRevenue(reservations: Reservation[]): { month: string; total: number; paid: number; pending: number }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const total = Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0))
            const paid = Math.round(rsvs.reduce((s, r) => s + toTRY(r.paidPrice, r.currency), 0))
            return { month, total, paid, pending: total - paid }
        }).sort((a, b) => a.month.localeCompare(b.month))
    },

    // R10: Revenue Heatmap (day of week × month)
    revenueHeatmap(reservations: Reservation[]): HeatmapCell[] {
        const cells: HeatmapCell[] = []
        const byKey = groupBy(reservations, r => {
            const d = new Date(r.checkIn)
            return `${dayOfWeekName(d.getDay())}|${monthName(d.getMonth())}`
        })
        for (const [key, rsvs] of byKey) {
            const [day, month] = key.split('|')
            cells.push({ x: month, y: day, value: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0) / 1000) })
        }
        return cells
    },

    // ═══════════════════════════════════════════════════════════
    // 2. OCCUPANCY ANALYTICS (Reports 11-18)
    // ═══════════════════════════════════════════════════════════

    // R11: Daily Occupancy Rate
    dailyOccupancyTrend(occupancy: DailyOccupancy[]): OccupancyPoint[] {
        return occupancy.map(o => ({
            date: o.date,
            rate: o.occupancyRate,
            available: o.availableRooms,
            occupied: o.occupiedRooms,
            total: o.totalRooms,
        })).sort((a, b) => a.date.localeCompare(b.date))
    },

    // R12: Occupancy Forecast
    occupancyForecast(occupancy: DailyOccupancy[]): ForecastPoint[] {
        const sorted = [...occupancy].sort((a, b) => a.date.localeCompare(b.date))
        const result: ForecastPoint[] = sorted.map(o => ({ date: o.date, actual: o.occupancyRate, forecast: 0 }))
        for (let i = 0; i < result.length; i++) {
            const window = result.slice(Math.max(0, i - 6), i + 1)
            result[i].forecast = Math.round(window.reduce((s, w) => s + (w.actual || 0), 0) / window.length)
        }
        return result
    },

    // R13: Room Type Occupancy
    roomTypeOccupancy(reservations: Reservation[]): RoomTypeMetric[] {
        const byType = groupBy(reservations, r => r.roomType || 'Standart')
        const total = reservations.length || 1
        return Array.from(byType.entries()).map(([roomType, rsvs]) => ({
            roomType,
            count: rsvs.length,
            revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
            avgRate: Math.round(rsvs.reduce((s, r) => s + r.dailyAverage, 0) / (rsvs.length || 1)),
            avgNights: +(rsvs.reduce((s, r) => s + r.nights, 0) / rsvs.length).toFixed(1),
            share: Math.round((rsvs.length / total) * 100),
        })).sort((a, b) => b.revenue - a.revenue)
    },

    // R14: Occupancy vs ADR Correlation
    occupancyVsADR(reservations: Reservation[], occupancy: DailyOccupancy[]): { occupancy: number; adr: number; month: string }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        const occByMonth = groupBy(occupancy, o => o.date.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const totalRev = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const totalNights = rsvs.reduce((s, r) => s + r.nights * r.roomCount, 0)
            const adr = totalNights > 0 ? totalRev / totalNights : 0
            const occData = occByMonth.get(month) || []
            const avgOcc = occData.length > 0 ? occData.reduce((s, o) => s + o.occupancyRate, 0) / occData.length : 0
            return { occupancy: Math.round(avgOcc), adr: Math.round(adr), month }
        })
    },

    // R15: Occupancy Heatmap (day × month)
    occupancyHeatmap(occupancy: DailyOccupancy[]): HeatmapCell[] {
        const cells: HeatmapCell[] = []
        const byKey = groupBy(occupancy, o => {
            const d = new Date(o.date)
            return `${dayOfWeekName(d.getDay())}|${monthName(d.getMonth())}`
        })
        for (const [key, data] of byKey) {
            const [day, month] = key.split('|')
            const avgRate = Math.round(data.reduce((s, o) => s + o.occupancyRate, 0) / (data.length || 1))
            cells.push({ x: month, y: day, value: avgRate })
        }
        return cells
    },

    // R16: Weekday vs Weekend Occupancy
    weekdayVsWeekend(reservations: Reservation[]): WeekdayWeekend[] {
        const weekday = reservations.filter(r => { const d = new Date(r.checkIn).getDay(); return d >= 1 && d <= 5 })
        const weekend = reservations.filter(r => { const d = new Date(r.checkIn).getDay(); return d === 0 || d === 6 })

        const genMetric = (type: string, rsvs: Reservation[]): WeekdayWeekend => ({
            type,
            count: rsvs.length,
            revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
            adr: Math.round(rsvs.length > 0 ? rsvs.reduce((s, r) => s + r.dailyAverage, 0) / rsvs.length : 0),
            avgNights: +(rsvs.length > 0 ? rsvs.reduce((s, r) => s + r.nights, 0) / rsvs.length : 0).toFixed(1),
        })

        return [genMetric('Hafta İçi', weekday), genMetric('Hafta Sonu', weekend)]
    },

    // R17: Seasonal Comparison
    seasonalComparison(reservations: Reservation[]): SeasonalMetric[] {
        const bySeason = groupBy(reservations, r => seasonOf(new Date(r.checkIn).getMonth()))
        return Array.from(bySeason.entries()).map(([season, rsvs]) => {
            const totalRev = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const totalNights = rsvs.reduce((s, r) => s + r.nights * r.roomCount, 0)
            return {
                season,
                count: rsvs.length,
                revenue: Math.round(totalRev),
                occupancy: 0,
                adr: Math.round(totalNights > 0 ? totalRev / totalNights : 0),
            }
        }).sort((a, b) => b.revenue - a.revenue)
    },

    // R18: Vacant Room Loss Analysis
    vacantRoomLoss(occupancy: DailyOccupancy[], avgADR: number): { date: string; vacantRooms: number; potentialLoss: number }[] {
        return occupancy
            .filter(o => o.availableRooms > 0)
            .map(o => ({
                date: o.date,
                vacantRooms: o.availableRooms,
                potentialLoss: Math.round(o.availableRooms * avgADR),
            }))
            .sort((a, b) => a.date.localeCompare(b.date))
    },

    // ═══════════════════════════════════════════════════════════
    // 3. CHANNEL & AGENCY ANALYTICS (Reports 19-25)
    // ═══════════════════════════════════════════════════════════

    // R19: Channel Distribution
    channelDistribution(reservations: Reservation[]): ChannelMetric[] {
        const byChannel = groupBy(reservations, r => r.channel || 'Unknown')
        const total = reservations.length || 1
        return Array.from(byChannel.entries()).map(([channel, rsvs]) => {
            const totalRev = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const totalNights = rsvs.reduce((s, r) => s + r.nights * r.roomCount, 0)
            return {
                channel,
                revenue: Math.round(totalRev),
                count: rsvs.length,
                adr: Math.round(totalNights > 0 ? totalRev / totalNights : 0),
                avgNights: +(rsvs.reduce((s, r) => s + r.nights, 0) / rsvs.length).toFixed(1),
                share: Math.round((rsvs.length / total) * 100),
                color: CHANNEL_COLORS[channel] || '#64748b',
            }
        }).sort((a, b) => b.revenue - a.revenue)
    },

    // R20: Revenue by Channel (monthly breakdown)
    channelRevenueTrend(reservations: Reservation[]): { month: string;[channel: string]: string | number }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        const channels = [...new Set(reservations.map(r => r.channel))]
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const row: { month: string;[channel: string]: string | number } = { month }
            for (const ch of channels) {
                row[ch] = Math.round(rsvs.filter(r => r.channel === ch).reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0))
            }
            return row
        }).sort((a, b) => (a.month as string).localeCompare(b.month as string))
    },

    // R21: ADR by Channel
    channelADR(reservations: Reservation[]): ChannelMetric[] {
        return this.channelDistribution(reservations)
    },

    // R22: Channel Performance over Time
    channelPerformanceTrend(reservations: Reservation[]): { month: string;[channel: string]: string | number }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        const channels = [...new Set(reservations.map(r => r.channel))]
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const row: { month: string;[ch: string]: string | number } = { month }
            for (const ch of channels) {
                const chRsvs = rsvs.filter(r => r.channel === ch)
                row[ch] = chRsvs.length
            }
            return row
        }).sort((a, b) => (a.month as string).localeCompare(b.month as string))
    },

    // R23: OTA vs Direct
    otaVsDirect(reservations: Reservation[]): { month: string; OTA: number; Direct: number; otaShare: number }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const ota = rsvs.filter(r => r.channel === 'OTA')
            const direct = rsvs.filter(r => r.channel === 'Direkt' || r.channel === 'Website')
            const total = rsvs.length || 1
            return {
                month,
                OTA: ota.length,
                Direct: direct.length,
                otaShare: Math.round((ota.length / total) * 100),
            }
        }).sort((a, b) => a.month.localeCompare(b.month))
    },

    // R24: Agency Ranking
    agencyRanking(reservations: Reservation[]): AgencyMetric[] {
        const byAgency = groupBy(reservations, r => r.agency || 'Unknown')
        return Array.from(byAgency.entries()).map(([agency, rsvs]) => {
            const totalRev = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const totalNights = rsvs.reduce((s, r) => s + r.nights * r.roomCount, 0)
            return {
                agency,
                channel: rsvs[0]?.channel || '',
                count: rsvs.length,
                revenue: Math.round(totalRev),
                adr: Math.round(totalNights > 0 ? totalRev / totalNights : 0),
            }
        }).sort((a, b) => b.revenue - a.revenue).slice(0, 30)
    },

    // R25: Channel Mix Change (area chart over months)
    channelMixTrend(reservations: Reservation[]): { month: string;[channel: string]: string | number }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        const channels = [...new Set(reservations.map(r => r.channel))]
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const total = rsvs.length || 1
            const row: { month: string;[ch: string]: string | number } = { month }
            for (const ch of channels) {
                row[ch] = Math.round((rsvs.filter(r => r.channel === ch).length / total) * 100)
            }
            return row
        }).sort((a, b) => (a.month as string).localeCompare(b.month as string))
    },

    // ═══════════════════════════════════════════════════════════
    // 4. GUEST & DEMOGRAPHICS (Reports 26-32)
    // ═══════════════════════════════════════════════════════════

    // R26: Nationality Distribution
    nationalityDistribution(reservations: Reservation[]): NationalityMetric[] {
        const byCountry = groupBy(reservations, r => r.nationality || 'Unknown')
        const total = reservations.length || 1
        return Array.from(byCountry.entries()).map(([country, rsvs]) => ({
            country,
            count: rsvs.length,
            revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
            avgNights: +(rsvs.reduce((s, r) => s + r.nights, 0) / rsvs.length).toFixed(1),
            avgRate: Math.round(rsvs.reduce((s, r) => s + r.dailyAverage, 0) / rsvs.length),
            share: Math.round((rsvs.length / total) * 100),
        })).sort((a, b) => b.count - a.count).slice(0, 25)
    },

    // R27: Revenue by Country
    revenueByCountry(reservations: Reservation[]): NationalityMetric[] {
        return this.nationalityDistribution(reservations).sort((a, b) => b.revenue - a.revenue)
    },

    // R28: Average Stay by Country
    avgStayByCountry(reservations: Reservation[]): NationalityMetric[] {
        return this.nationalityDistribution(reservations).sort((a, b) => b.avgNights - a.avgNights)
    },

    // R29: Nationality Trend (monthly)
    nationalityTrend(reservations: Reservation[]): { month: string;[country: string]: string | number }[] {
        const topCountries = this.nationalityDistribution(reservations).slice(0, 6).map(n => n.country)
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const row: { month: string;[c: string]: string | number } = { month }
            for (const country of topCountries) {
                row[country] = rsvs.filter(r => r.nationality === country).length
            }
            return row
        }).sort((a, b) => (a.month as string).localeCompare(b.month as string))
    },

    // R30: Guest Segmentation (by price tier)
    guestSegmentation(reservations: Reservation[]): PriceSegment[] {
        const segments = [
            { label: 'Ekonomik (< ₺10K)', min: 0, max: 10000 },
            { label: 'Orta (₺10K-25K)', min: 10000, max: 25000 },
            { label: 'Üst (₺25K-50K)', min: 25000, max: 50000 },
            { label: 'Premium (₺50K-100K)', min: 50000, max: 100000 },
            { label: 'VIP (> ₺100K)', min: 100000, max: Infinity },
        ]
        const total = reservations.length || 1
        return segments.map(seg => {
            const rsvs = reservations.filter(r => {
                const tryVal = toTRY(r.totalPrice, r.currency)
                return tryVal >= seg.min && tryVal < seg.max
            })
            return {
                segment: seg.label,
                count: rsvs.length,
                revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
                share: Math.round((rsvs.length / total) * 100),
            }
        })
    },

    // R31: Nationality-Channel Matrix
    nationalityChannelMatrix(reservations: Reservation[]): HeatmapCell[] {
        const top10 = this.nationalityDistribution(reservations).slice(0, 10).map(n => n.country)
        const channels = [...new Set(reservations.map(r => r.channel))]
        const cells: HeatmapCell[] = []
        for (const country of top10) {
            for (const channel of channels) {
                const count = reservations.filter(r => r.nationality === country && r.channel === channel).length
                if (count > 0) cells.push({ x: channel, y: country, value: count })
            }
        }
        return cells
    },

    // R32: Average Rate by Country
    avgRateByCountry(reservations: Reservation[]): NationalityMetric[] {
        return this.nationalityDistribution(reservations).sort((a, b) => b.avgRate - a.avgRate)
    },

    // ═══════════════════════════════════════════════════════════
    // 5. BOOKING PATTERNS (Reports 33-40)
    // ═══════════════════════════════════════════════════════════

    // R33: Booking Lead Time Distribution
    leadTimeDistribution(reservations: Reservation[]): LeadTimeDistribution[] {
        const ranges = [
            { label: 'Son Dakika (0-3 gün)', min: 0, max: 3 },
            { label: 'Kısa (4-14 gün)', min: 4, max: 14 },
            { label: 'Orta (15-30 gün)', min: 15, max: 30 },
            { label: 'Uzun (31-60 gün)', min: 31, max: 60 },
            { label: 'Çok Uzun (61-120 gün)', min: 61, max: 120 },
            { label: 'Erken (120+ gün)', min: 121, max: Infinity },
        ]
        const total = reservations.length || 1
        return ranges.map(range => {
            const count = reservations.filter(r => {
                const leadDays = Math.max(0, Math.ceil((new Date(r.checkIn).getTime() - new Date(r.reservationDate || r.lastUpdate).getTime()) / 86400000))
                return leadDays >= range.min && leadDays <= range.max
            }).length
            return { range: range.label, count, share: Math.round((count / total) * 100) }
        })
    },

    // R34: Booking Day of Week Analysis
    bookingDayAnalysis(reservations: Reservation[]): DayOfWeekMetric[] {
        const byDay = groupBy(reservations, r => {
            const d = new Date(r.reservationDate || r.lastUpdate)
            return String(d.getDay())
        })
        return Array.from(byDay.entries()).map(([dayIdx, rsvs]) => ({
            day: dayOfWeekName(parseInt(dayIdx)),
            dayIndex: parseInt(dayIdx),
            count: rsvs.length,
            revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
            avgRate: Math.round(rsvs.reduce((s, r) => s + r.dailyAverage, 0) / (rsvs.length || 1)),
        })).sort((a, b) => a.dayIndex - b.dayIndex)
    },

    // R35: Cancellation Rate (by month)
    cancellationAnalysis(reservations: Reservation[]): { month: string; total: number; cancelled: number; rate: number }[] {
        // Note: we can approximate from reservation status if available
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const cancelled = rsvs.filter(r => r.status === 'Cancelled' || r.status === 'İptal').length
            return {
                month,
                total: rsvs.length,
                cancelled,
                rate: Math.round((cancelled / (rsvs.length || 1)) * 100),
            }
        }).sort((a, b) => a.month.localeCompare(b.month))
    },

    // R36: Average Length of Stay Trend
    avgStayTrend(reservations: Reservation[]): { month: string; avgNights: number; count: number }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => ({
            month,
            avgNights: +(rsvs.reduce((s, r) => s + r.nights, 0) / (rsvs.length || 1)).toFixed(1),
            count: rsvs.length,
        })).sort((a, b) => a.month.localeCompare(b.month))
    },

    // R37: Room Count Distribution
    roomCountDistribution(reservations: Reservation[]): { rooms: string; count: number; share: number }[] {
        const byRooms = groupBy(reservations, r => String(r.roomCount))
        const total = reservations.length || 1
        return Array.from(byRooms.entries()).map(([rooms, rsvs]) => ({
            rooms: rooms === '1' ? '1 Oda' : `${rooms} Oda`,
            count: rsvs.length,
            share: Math.round((rsvs.length / total) * 100),
        })).sort((a, b) => parseInt(a.rooms) - parseInt(b.rooms))
    },

    // R38: Board Type Distribution
    boardTypeDistribution(reservations: Reservation[]): BoardTypeMetric[] {
        const byBoard = groupBy(reservations, r => r.boardType || 'Belirtilmemiş')
        const total = reservations.length || 1
        return Array.from(byBoard.entries()).map(([boardType, rsvs]) => ({
            boardType,
            count: rsvs.length,
            revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
            share: Math.round((rsvs.length / total) * 100),
        })).sort((a, b) => b.count - a.count)
    },

    // R39: Room Type Preference
    roomTypePreference(reservations: Reservation[]): RoomTypeMetric[] {
        return this.roomTypeOccupancy(reservations)
    },

    // R40: Stay Length Distribution
    stayLengthDistribution(reservations: Reservation[]): StayLengthDist[] {
        const ranges = [
            { label: '1 gece', min: 1, max: 1 },
            { label: '2-3 gece', min: 2, max: 3 },
            { label: '4-5 gece', min: 4, max: 5 },
            { label: '6-7 gece', min: 6, max: 7 },
            { label: '8-10 gece', min: 8, max: 10 },
            { label: '11-14 gece', min: 11, max: 14 },
            { label: '15+ gece', min: 15, max: Infinity },
        ]
        const total = reservations.length || 1
        return ranges.map(range => {
            const rsvs = reservations.filter(r => r.nights >= range.min && r.nights <= range.max)
            return {
                nights: range.label,
                count: rsvs.length,
                share: Math.round((rsvs.length / total) * 100),
                revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
            }
        })
    },

    // ═══════════════════════════════════════════════════════════
    // 6. PERFORMANCE & FORECASTING (Reports 41-50)
    // ═══════════════════════════════════════════════════════════

    // R41: GOPPAR approximation
    goppar(reservations: Reservation[], totalRooms: number): { month: string; goppar: number; revenue: number }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const revenue = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate()
            const availableRoomDays = totalRooms * daysInMonth
            return {
                month,
                goppar: Math.round(availableRoomDays > 0 ? (revenue * 0.35) / availableRoomDays : 0),
                revenue: Math.round(revenue),
            }
        }).sort((a, b) => a.month.localeCompare(b.month))
    },

    // R42: TRevPAR
    trevpar(reservations: Reservation[], totalRooms: number): { month: string; trevpar: number }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const revenue = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const daysInMonth = new Date(parseInt(month.split('-')[0]), parseInt(month.split('-')[1]), 0).getDate()
            return {
                month,
                trevpar: Math.round(totalRooms * daysInMonth > 0 ? revenue / (totalRooms * daysInMonth) : 0),
            }
        }).sort((a, b) => a.month.localeCompare(b.month))
    },

    // R43: Pace Report
    paceReport(current: Reservation[], previous: Reservation[]): PacePoint[] {
        const now = new Date()
        const points: PacePoint[] = []
        for (let i = 180; i >= 0; i -= 7) {
            const d = new Date(now)
            d.setDate(d.getDate() + i)
            const dateStr = d.toISOString().split('T')[0]
            const curCount = current.filter(r => r.checkIn.slice(0, 10) <= dateStr).length
            const prevCount = previous.filter(r => r.checkIn.slice(0, 10) <= dateStr).length
            points.push({
                daysOut: i,
                currentYear: curCount,
                prevYear: prevCount,
                label: i === 0 ? 'Bugün' : `${i} gün`,
            })
        }
        return points.reverse()
    },

    // R44: Pick-up Analysis (daily new bookings)
    pickupAnalysis(reservations: Reservation[]): PickupPoint[] {
        const byBookDate = groupBy(reservations, r => (r.reservationDate || r.lastUpdate).slice(0, 10))
        return Array.from(byBookDate.entries()).map(([date, rsvs]) => ({
            date,
            newBookings: rsvs.length,
            cancellations: rsvs.filter(r => r.status === 'Cancelled' || r.status === 'İptal').length,
            net: rsvs.filter(r => r.status !== 'Cancelled' && r.status !== 'İptal').length,
        })).sort((a, b) => a.date.localeCompare(b.date))
    },

    // R45: KPI Scorecard
    kpiScorecard(reservations: Reservation[], occupancy: DailyOccupancy[]): KPICard[] {
        const totalRev = reservations.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
        const totalNights = reservations.reduce((s, r) => s + r.nights * r.roomCount, 0)
        const adr = totalNights > 0 ? totalRev / totalNights : 0
        const avgOcc = occupancy.length > 0 ? occupancy.reduce((s, o) => s + o.occupancyRate, 0) / occupancy.length : 0
        const totalRooms = occupancy[0]?.totalRooms || 200
        const avgDays = occupancy.length || 1
        const revpar = (totalRooms * avgDays) > 0 ? totalRev / (totalRooms * avgDays) : 0
        const paidRev = reservations.reduce((s, r) => s + toTRY(r.paidPrice, r.currency), 0)
        const collectionRate = totalRev > 0 ? (paidRev / totalRev) * 100 : 0

        return [
            { label: 'Toplam Gelir', value: `₺${Math.round(totalRev).toLocaleString('tr-TR')}`, subValue: `€${Math.round(toEUR(totalRev)).toLocaleString('tr-TR')}`, icon: 'revenue' },
            { label: 'Rezervasyon Sayısı', value: reservations.length.toLocaleString('tr-TR'), icon: 'bookings' },
            { label: 'Oda/Gece', value: totalNights.toLocaleString('tr-TR'), icon: 'nights' },
            { label: 'ADR', value: `₺${Math.round(adr).toLocaleString('tr-TR')}`, subValue: `€${Math.round(toEUR(adr)).toLocaleString('tr-TR')}`, icon: 'adr' },
            { label: 'RevPAR', value: `₺${Math.round(revpar).toLocaleString('tr-TR')}`, icon: 'revpar' },
            { label: 'Ort. Doluluk', value: `%${Math.round(avgOcc)}`, icon: 'occupancy' },
            { label: 'Ort. Kalış', value: `${(reservations.length > 0 ? reservations.reduce((s, r) => s + r.nights, 0) / reservations.length : 0).toFixed(1)} gece`, icon: 'stay' },
            { label: 'Tahsilat Oranı', value: `%${Math.round(collectionRate)}`, icon: 'collection' },
            { label: 'Ülke Sayısı', value: String(new Set(reservations.map(r => r.nationality)).size), icon: 'countries' },
            { label: 'Kanal Sayısı', value: String(new Set(reservations.map(r => r.channel)).size), icon: 'channels' },
        ]
    },

    // R46: Check-in Day of Week Distribution
    checkInDayDistribution(reservations: Reservation[]): DayOfWeekMetric[] {
        const byDay = groupBy(reservations, r => String(new Date(r.checkIn).getDay()))
        return Array.from(byDay.entries()).map(([dayIdx, rsvs]) => ({
            day: dayOfWeekName(parseInt(dayIdx)),
            dayIndex: parseInt(dayIdx),
            count: rsvs.length,
            revenue: Math.round(rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)),
            avgRate: Math.round(rsvs.reduce((s, r) => s + r.dailyAverage, 0) / (rsvs.length || 1)),
        })).sort((a, b) => a.dayIndex - b.dayIndex)
    },

    // R47: Price Segment Trend
    priceSegmentTrend(reservations: Reservation[]): { month: string; ekonomik: number; orta: number; ust: number; premium: number; vip: number }[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => ({
            month,
            ekonomik: rsvs.filter(r => toTRY(r.totalPrice, r.currency) < 10000).length,
            orta: rsvs.filter(r => { const v = toTRY(r.totalPrice, r.currency); return v >= 10000 && v < 25000 }).length,
            ust: rsvs.filter(r => { const v = toTRY(r.totalPrice, r.currency); return v >= 25000 && v < 50000 }).length,
            premium: rsvs.filter(r => { const v = toTRY(r.totalPrice, r.currency); return v >= 50000 && v < 100000 }).length,
            vip: rsvs.filter(r => toTRY(r.totalPrice, r.currency) >= 100000).length,
        })).sort((a, b) => a.month.localeCompare(b.month))
    },

    // R48: Monthly Performance Index
    monthlyPerformanceIndex(reservations: Reservation[], occupancy: DailyOccupancy[]): MonthlyMetric[] {
        const byMonth = groupBy(reservations, r => r.checkIn.slice(0, 7))
        const occByMonth = groupBy(occupancy, o => o.date.slice(0, 7))
        return Array.from(byMonth.entries()).map(([month, rsvs]) => {
            const totalRev = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const totalNights = rsvs.reduce((s, r) => s + r.nights * r.roomCount, 0)
            const adr = totalNights > 0 ? totalRev / totalNights : 0
            const occData = occByMonth.get(month) || []
            const avgOcc = occData.length > 0 ? occData.reduce((s, o) => s + o.occupancyRate, 0) / occData.length : 0
            const totalRooms = occData[0]?.totalRooms || 200
            const daysInMonth = occData.length || 30
            const revpar = (totalRooms * daysInMonth) > 0 ? totalRev / (totalRooms * daysInMonth) : 0
            const mi = parseInt(month.split('-')[1]) - 1
            return {
                month: monthName(mi),
                monthIndex: mi,
                revenue: Math.round(totalRev),
                count: rsvs.length,
                occupancyRate: Math.round(avgOcc),
                adr: Math.round(adr),
                revpar: Math.round(revpar),
            }
        }).sort((a, b) => a.monthIndex - b.monthIndex)
    },

    // R49: Revenue Concentration (Pareto)
    revenueConcentration(reservations: Reservation[]): { percentile: number; revenueShare: number; bookingShare: number }[] {
        const sorted = [...reservations].sort((a, b) => toTRY(b.totalPrice, b.currency) - toTRY(a.totalPrice, a.currency))
        const totalRev = sorted.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
        const total = sorted.length
        const points: { percentile: number; revenueShare: number; bookingShare: number }[] = []
        let cumRev = 0
        for (let i = 0; i < total; i++) {
            cumRev += toTRY(sorted[i].totalPrice, sorted[i].currency)
            if ((i + 1) % Math.max(1, Math.floor(total / 20)) === 0 || i === total - 1) {
                points.push({
                    percentile: Math.round(((i + 1) / total) * 100),
                    revenueShare: Math.round((cumRev / totalRev) * 100),
                    bookingShare: Math.round(((i + 1) / total) * 100),
                })
            }
        }
        return points
    },

    // R50: Rate Type Analysis
    rateTypeAnalysis(reservations: Reservation[]): { rateType: string; count: number; revenue: number; adr: number; share: number }[] {
        const byRate = groupBy(reservations, r => r.rateType || 'Standard')
        const total = reservations.length || 1
        return Array.from(byRate.entries()).map(([rateType, rsvs]) => {
            const rev = rsvs.reduce((s, r) => s + toTRY(r.totalPrice, r.currency), 0)
            const nights = rsvs.reduce((s, r) => s + r.nights * r.roomCount, 0)
            return {
                rateType,
                count: rsvs.length,
                revenue: Math.round(rev),
                adr: Math.round(nights > 0 ? rev / nights : 0),
                share: Math.round((rsvs.length / total) * 100),
            }
        }).sort((a, b) => b.revenue - a.revenue)
    },
}
