'use client'

import React, { useState, useMemo, useRef } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts'
import { Download, FileText, Calendar, TrendingUp, TrendingDown, Building2, Printer, Mail, BellRing, Sparkles, ArrowUpDown, Filter, Sun, Snowflake, CloudSun, LayoutDashboard, Share2, Users, Globe, Store, CalendarCheck } from 'lucide-react'
import { type PriceMode, displayPrice, PriceModeToggle } from '@/lib/utils/price-mode'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getAdminTranslations, type AdminLocale, type AdminTranslations } from '@/lib/admin-translations'

// ─── Types ────────────────────────────────────────────────────
interface ReservationSlim {
    id: number
    checkIn: string
    checkOut: string
    nights: number
    roomCount: number
    totalPrice: number
    currency: string
    channel: string
    agency: string
    nationality: string
    dailyAverage: number
    status: string
    reservationDate: string
    roomType: string
    rateType: string
}

interface Props {
    data: {
        currentYear: number
        currentYearReservations: ReservationSlim[]
        prevYearReservations: ReservationSlim[]
        exchangeRates: { EUR_TO_TRY: number; USD_TO_TRY: number }
    }
    taxRates?: { vatAccommodation: number; taxAccommodation: number; vatFnb: number }
}

// ─── Helpers ──────────────────────────────────────────────────
const TOTAL_ROOMS = 341 // Blue Dreams Resort total room inventory

// ─── Season Classification ────────────────────────────────────
// Based on check-in month:
// Nisan(3), Mayıs(4), Ekim(9), Kasım(10) = LOW
// Haziran(5), Eylül(8) = SHOULDER
// Temmuz(6), Ağustos(7) = HIGH
// Ocak(0), Şubat(1), Mart(2), Aralık(11) = OFF (no season color)
type SeasonType = 'HIGH' | 'SHOULDER' | 'LOW' | 'OFF'

function getSeasonType(monthIdx: number): SeasonType {
    if (monthIdx === 6 || monthIdx === 7) return 'HIGH'
    if (monthIdx === 5 || monthIdx === 8) return 'SHOULDER'
    if (monthIdx === 3 || monthIdx === 4 || monthIdx === 9 || monthIdx === 10) return 'LOW'
    return 'OFF'
}

const SEASON_CONFIG: Record<SeasonType, { icon: typeof Sun; bgRow: string; bgRowDark: string; badge: string; badgeDark: string; borderL: string }> = {
    HIGH: {
        icon: Sun,
        bgRow: 'bg-rose-50', bgRowDark: 'dark:bg-rose-950/30',
        badge: 'bg-rose-100 text-rose-700', badgeDark: 'dark:bg-rose-900/40 dark:text-rose-300',
        borderL: 'border-l-4 border-l-rose-500'
    },
    SHOULDER: {
        icon: CloudSun,
        bgRow: 'bg-amber-50', bgRowDark: 'dark:bg-amber-950/20',
        badge: 'bg-amber-100 text-amber-700', badgeDark: 'dark:bg-amber-900/40 dark:text-amber-300',
        borderL: 'border-l-4 border-l-amber-500'
    },
    LOW: {
        icon: Snowflake,
        bgRow: 'bg-sky-50', bgRowDark: 'dark:bg-sky-950/20',
        badge: 'bg-sky-100 text-sky-700', badgeDark: 'dark:bg-sky-900/40 dark:text-sky-300',
        borderL: 'border-l-4 border-l-sky-400'
    },
    OFF: {
        icon: Snowflake,
        bgRow: 'bg-slate-50', bgRowDark: 'dark:bg-slate-900/30',
        badge: 'bg-slate-100 text-slate-500', badgeDark: 'dark:bg-slate-800 dark:text-slate-400',
        borderL: 'border-l-4 border-l-slate-300'
    }
}

function toTRY(amount: number, currency: string, rates: { EUR_TO_TRY: number; USD_TO_TRY: number }, priceMode: PriceMode = 'gross', totalTaxRate: number = 12) {
    let tryAmount = amount
    if (currency === 'TRY' || currency === 'TL') tryAmount = amount
    else if (currency === 'EUR') tryAmount = amount * rates.EUR_TO_TRY
    else if (currency === 'USD') tryAmount = amount * rates.USD_TO_TRY
    else tryAmount = amount * rates.EUR_TO_TRY // fallback
    return displayPrice(tryAmount, priceMode, totalTaxRate)
}

function tryToEur(tryAmount: number, rates: { EUR_TO_TRY: number }) {
    return tryAmount / rates.EUR_TO_TRY
}

function fmt(n: number, decimals = 0): string {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtEur(n: number): string {
    return `${fmt(n, 2)} €`
}

function fmtTry(n: number): string {
    return `${fmt(n, 2)} ₺`
}

function pct(n: number): string {
    return `${fmt(n * 100, 2)}%`
}

function diffPct(curr: number, prev: number): string {
    if (prev === 0) return curr > 0 ? '+∞' : '0%'
    const d = ((curr - prev) / prev) * 100
    return `${d >= 0 ? '+' : ''}${fmt(d, 2)}%`
}

// ─── Aggregation ──────────────────────────────────────────────
interface MonthlyAgg {
    month: number // 0-indexed
    monthLabel: string
    roomNights: number  // RN — sum of (nights * roomCount) for reservations with checkIn in this month
    bedNights: number   // BN — approximation: RN * 2 (avg 2 pax/room for resort)
    revenue: number     // Total revenue in TRY
    revenueEur: number  // Total revenue in EUR
    occupancy: number   // Occ% — RN / (TOTAL_ROOMS * days_in_month)
    adr: number         // ADR — revenue / RN (in EUR)
    adb: number         // ADB — revenue / BN (in EUR)
    revpar: number      // RevPAR — revenue / (TOTAL_ROOMS * days_in_month) (in EUR)
    daysInMonth: number
}

function aggregateByMonth(reservations: ReservationSlim[], rates: { EUR_TO_TRY: number; USD_TO_TRY: number }, year: number, monthNames: string[], priceMode: PriceMode = 'gross', totalTaxRate: number = 12): MonthlyAgg[] {
    const monthData = Array.from({ length: 12 }, (_, i) => {
        const daysInMonth = new Date(year, i + 1, 0).getDate()
        return {
            month: i,
            monthLabel: monthNames[i] || '',
            roomNights: 0,
            bedNights: 0,
            revenue: 0,
            revenueEur: 0,
            occupancy: 0,
            adr: 0,
            adb: 0,
            revpar: 0,
            daysInMonth
        }
    })

    for (const r of reservations) {
        if (!r.checkIn) continue
        const monthIdx = parseInt(r.checkIn.slice(5, 7), 10) - 1
        if (monthIdx < 0 || monthIdx > 11) continue

        const rn = r.nights * (r.roomCount || 1)
        const bn = rn * 2 // typical resort avg occupancy per room
        const revTry = toTRY(r.totalPrice, r.currency, rates, priceMode, totalTaxRate)

        monthData[monthIdx].roomNights += rn
        monthData[monthIdx].bedNights += bn
        monthData[monthIdx].revenue += revTry
    }

    // Compute derived metrics
    for (const m of monthData) {
        m.revenueEur = tryToEur(m.revenue, rates)
        const capacity = TOTAL_ROOMS * m.daysInMonth
        m.occupancy = capacity > 0 ? m.roomNights / capacity : 0
        m.adr = m.roomNights > 0 ? m.revenueEur / m.roomNights : 0
        m.adb = m.bedNights > 0 ? m.revenueEur / m.bedNights : 0
        m.revpar = capacity > 0 ? m.revenueEur / capacity : 0
    }

    return monthData
}

// ─── Component ────────────────────────────────────────────────
export default function ManagementReportsClient({ data, taxRates }: Props) {
    const params = useParams()
    const locale = (params?.locale as AdminLocale) || 'tr'
    const t = getAdminTranslations(locale) as AdminTranslations

    // monthNames array will be 12 elements (from locale)
    const monthNamesLocal = t.monthNames || ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
    // We can also extract short strings by truncating
    const monthNamesShort = monthNamesLocal.map(x => x.slice(0, 3))

    const getSeasonLabel = (s: SeasonType) => {
        if (s === 'HIGH') return t.seasonHigh
        if (s === 'SHOULDER') return t.seasonShoulder
        if (s === 'LOW') return t.seasonLow
        return t.seasonOff
    }

    const totalTaxRate = (taxRates?.vatAccommodation ?? 10) + (taxRates?.taxAccommodation ?? 2)
    const { currentYear, currentYearReservations, prevYearReservations, exchangeRates } = data
    const prevYear = currentYear - 1

    const [activeReport, setActiveReport] = useState<'s26' | 'pace' | 'dashboard' | 'channels' | 'agencies' | 'nationality' | 'market'>('s26')
    const [showCurrency, setShowCurrency] = useState<'EUR' | 'TRY'>('EUR')
    const [chartView, setChartView] = useState<'revenue' | 'occupancy' | 'adr'>('revenue')
    const [seasonFilter, setSeasonFilter] = useState<SeasonType | 'ALL'>('ALL')
    const [marketFilter, setMarketFilter] = useState<string>('ALL')
    const [ytdMode, setYtdMode] = useState(false)
    const [pdfPreparing, setPdfPreparing] = useState(false)
    const [pdfReady, setPdfReady] = useState(false)
    const [priceMode, setPriceMode] = useState<PriceMode>('gross')
    const [aiSummary, setAiSummary] = useState<string | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const reportRef = useRef<HTMLDivElement>(null)

    // ─── Available Markets (unique agencies) for filter dropdown ────
    const availableMarkets = useMemo(() => {
        const set = new Set<string>()
        for (const r of currentYearReservations) set.add(r.agency || 'Bilinmeyen')
        for (const r of prevYearReservations) set.add(r.agency || 'Bilinmeyen')
        return Array.from(set).sort()
    }, [currentYearReservations, prevYearReservations])

    // ─── YTD cutoff: same day-of-year in each year ─────────────────
    const todayDayOfYear = useMemo(() => {
        const now = new Date()
        const start = new Date(now.getFullYear(), 0, 1)
        return Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }, [])

    const isWithinYtd = (reservationDate: string, year: number) => {
        if (!reservationDate) return true
        const rd = new Date(reservationDate)
        const yearStart = new Date(year, 0, 1)
        const dayOfYear = Math.ceil((rd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24))
        return dayOfYear <= todayDayOfYear
    }

    // ─── Filtered reservations (market + YTD) ──────────────────────
    const filteredCY = useMemo(() => {
        let data = currentYearReservations
        if (marketFilter !== 'ALL') data = data.filter(r => (r.agency || 'Bilinmeyen') === marketFilter)
        if (ytdMode) data = data.filter(r => isWithinYtd(r.reservationDate, currentYear))
        return data
    }, [currentYearReservations, marketFilter, ytdMode, currentYear, todayDayOfYear])

    const filteredPY = useMemo(() => {
        let data = prevYearReservations
        if (marketFilter !== 'ALL') data = data.filter(r => (r.agency || 'Bilinmeyen') === marketFilter)
        if (ytdMode) data = data.filter(r => isWithinYtd(r.reservationDate, prevYear))
        return data
    }, [prevYearReservations, marketFilter, ytdMode, prevYear, todayDayOfYear])

    // Aggregate data (now using filtered)
    const cyMonth = useMemo(() => aggregateByMonth(filteredCY, exchangeRates, currentYear, monthNamesLocal, priceMode, totalTaxRate), [filteredCY, exchangeRates, currentYear, monthNamesLocal, priceMode, totalTaxRate])
    const pyMonth = useMemo(() => aggregateByMonth(filteredPY, exchangeRates, prevYear, monthNamesLocal, priceMode, totalTaxRate), [filteredPY, exchangeRates, prevYear, monthNamesLocal, priceMode, totalTaxRate])

    // Only show months with some activity (Apr-Oct typical for resort), apply season filter
    const activeMonths = useMemo(() => {
        return cyMonth.filter((m, i) => {
            const hasActivity = m.roomNights > 0 || pyMonth[i].roomNights > 0
            if (!hasActivity) return false
            if (seasonFilter === 'ALL') return true
            return getSeasonType(m.month) === seasonFilter
        })
    }, [cyMonth, pyMonth, seasonFilter])

    // Totals
    const cyTotal = useMemo(() => {
        return activeMonths.reduce((acc, m) => {
            const ci = m.month
            const c = cyMonth[ci]
            acc.roomNights += c.roomNights
            acc.bedNights += c.bedNights
            acc.revenue += c.revenue
            acc.revenueEur += c.revenueEur
            acc.capacity += TOTAL_ROOMS * c.daysInMonth
            return acc
        }, { roomNights: 0, bedNights: 0, revenue: 0, revenueEur: 0, capacity: 0 })
    }, [activeMonths, cyMonth])

    const pyTotal = useMemo(() => {
        return activeMonths.reduce((acc, m) => {
            const ci = m.month
            const p = pyMonth[ci]
            acc.roomNights += p.roomNights
            acc.bedNights += p.bedNights
            acc.revenue += p.revenue
            acc.revenueEur += p.revenueEur
            acc.capacity += TOTAL_ROOMS * p.daysInMonth
            return acc
        }, { roomNights: 0, bedNights: 0, revenue: 0, revenueEur: 0, capacity: 0 })
    }, [activeMonths, pyMonth])

    // ─── Channel Distribution Aggregation ─────────────────────
    const channelData = useMemo(() => {
        const map = new Map<string, { rn: number; revenue: number; revenueEur: number; count: number }>()
        for (const r of filteredCY) {
            const ch = r.channel || 'Diğer'
            const prev = map.get(ch) || { rn: 0, revenue: 0, revenueEur: 0, count: 0 }
            const rn = r.nights * (r.roomCount || 1)
            const revTry = toTRY(r.totalPrice, r.currency, exchangeRates, priceMode, totalTaxRate)
            prev.rn += rn
            prev.revenue += revTry
            prev.revenueEur += tryToEur(revTry, exchangeRates)
            prev.count += 1
            map.set(ch, prev)
        }
        return Array.from(map.entries())
            .map(([name, d]) => ({ name, ...d, adr: d.rn > 0 ? d.revenueEur / d.rn : 0, share: 0 }))
            .sort((a, b) => b.revenueEur - a.revenueEur)
            .map((item, _, arr) => {
                const totalRev = arr.reduce((s, x) => s + x.revenueEur, 0)
                return { ...item, share: totalRev > 0 ? (item.revenueEur / totalRev) * 100 : 0 }
            })
    }, [filteredCY, exchangeRates])

    // ─── Agency Aggregation ───────────────────────────────────
    const agencyData = useMemo(() => {
        const map = new Map<string, { rn: number; revenue: number; revenueEur: number; count: number }>()
        for (const r of filteredCY) {
            const ag = r.agency || 'Bilinmeyen'
            const prev = map.get(ag) || { rn: 0, revenue: 0, revenueEur: 0, count: 0 }
            const rn = r.nights * (r.roomCount || 1)
            const revTry = toTRY(r.totalPrice, r.currency, exchangeRates, priceMode, totalTaxRate)
            prev.rn += rn
            prev.revenue += revTry
            prev.revenueEur += tryToEur(revTry, exchangeRates)
            prev.count += 1
            map.set(ag, prev)
        }
        return Array.from(map.entries())
            .map(([name, d]) => ({ name, ...d, adr: d.rn > 0 ? d.revenueEur / d.rn : 0, share: 0 }))
            .sort((a, b) => b.revenueEur - a.revenueEur)
            .map((item, _, arr) => {
                const totalRev = arr.reduce((s, x) => s + x.revenueEur, 0)
                return { ...item, share: totalRev > 0 ? (item.revenueEur / totalRev) * 100 : 0 }
            })
    }, [filteredCY, exchangeRates])

    // ─── Nationality Aggregation ──────────────────────────────
    const nationalityData = useMemo(() => {
        const map = new Map<string, { rn: number; revenue: number; revenueEur: number; count: number }>()
        for (const r of filteredCY) {
            const nat = r.nationality || 'Bilinmeyen'
            const prev = map.get(nat) || { rn: 0, revenue: 0, revenueEur: 0, count: 0 }
            const rn = r.nights * (r.roomCount || 1)
            const revTry = toTRY(r.totalPrice, r.currency, exchangeRates, priceMode, totalTaxRate)
            prev.rn += rn
            prev.revenue += revTry
            prev.revenueEur += tryToEur(revTry, exchangeRates)
            prev.count += 1
            map.set(nat, prev)
        }
        return Array.from(map.entries())
            .map(([name, d]) => ({ name, ...d, adr: d.rn > 0 ? d.revenueEur / d.rn : 0, share: 0 }))
            .sort((a, b) => b.revenueEur - a.revenueEur)
            .map((item, _, arr) => {
                const totalRev = arr.reduce((s, x) => s + x.revenueEur, 0)
                return { ...item, share: totalRev > 0 ? (item.revenueEur / totalRev) * 100 : 0 }
            })
    }, [filteredCY, exchangeRates])

    // ─── Market Aggregation (agency-based with YoY comparison) ─────
    const marketData = useMemo(() => {
        const aggregate = (reservations: ReservationSlim[]) => {
            const map = new Map<string, { rn: number; revenue: number; revenueEur: number; count: number }>()
            for (const r of reservations) {
                const ag = r.agency || 'Bilinmeyen'
                const prev = map.get(ag) || { rn: 0, revenue: 0, revenueEur: 0, count: 0 }
                const rn = r.nights * (r.roomCount || 1)
                const revTry = toTRY(r.totalPrice, r.currency, exchangeRates, priceMode, totalTaxRate)
                prev.rn += rn
                prev.revenue += revTry
                prev.revenueEur += tryToEur(revTry, exchangeRates)
                prev.count += 1
                map.set(ag, prev)
            }
            return map
        }

        const cyMap = aggregate(filteredCY)
        const pyMap = aggregate(filteredPY)
        const allKeys = new Set([...cyMap.keys(), ...pyMap.keys()])

        return Array.from(allKeys).map(name => {
            const cy = cyMap.get(name) || { rn: 0, revenue: 0, revenueEur: 0, count: 0 }
            const py = pyMap.get(name) || { rn: 0, revenue: 0, revenueEur: 0, count: 0 }
            return {
                name,
                cyRn: cy.rn, cyRevenueEur: cy.revenueEur, cyCount: cy.count,
                cyAdr: cy.rn > 0 ? cy.revenueEur / cy.rn : 0,
                pyRn: py.rn, pyRevenueEur: py.revenueEur, pyCount: py.count,
                pyAdr: py.rn > 0 ? py.revenueEur / py.rn : 0,
                rnChange: py.rn > 0 ? ((cy.rn - py.rn) / py.rn) * 100 : (cy.rn > 0 ? 100 : 0),
                revChange: py.revenueEur > 0 ? ((cy.revenueEur - py.revenueEur) / py.revenueEur) * 100 : (cy.revenueEur > 0 ? 100 : 0),
                share: 0,
            }
        })
            .sort((a, b) => b.cyRevenueEur - a.cyRevenueEur)
            .map((item, _, arr) => {
                const totalRev = arr.reduce((s, x) => s + x.cyRevenueEur, 0)
                return { ...item, share: totalRev > 0 ? (item.cyRevenueEur / totalRev) * 100 : 0 }
            })
    }, [filteredCY, filteredPY, exchangeRates])

    // ─── YTD Calculation ──────────────────────────────────────
    const ytdStats = useMemo(() => {
        const now = new Date()
        const cm = now.getMonth() // 0-11
        const cd = now.getDate()

        const calc = (reservations: ReservationSlim[], year: number) => {
            return reservations.reduce((acc, r) => {
                const d = new Date(r.checkIn)
                // Filter: Only include if month < currentMonth OR (month == currentMonth AND day <= currentDay)
                const month = d.getMonth()
                const day = d.getDate()

                if (month < cm || (month === cm && day <= cd)) {
                    const rn = r.nights * (r.roomCount || 1)
                    const revTry = toTRY(r.totalPrice, r.currency, exchangeRates, priceMode, totalTaxRate)
                    const revEur = tryToEur(revTry, exchangeRates)

                    acc.rn += rn
                    acc.rev += revTry
                    acc.revEur += revEur
                    // approximate capacity logic (simple)
                    const daysInM = new Date(year, month + 1, 0).getDate()
                    acc.capacity += (r.roomCount || 1) * r.nights // This is not capacity, this is occupied. 
                    // Capacity is harder to calculate precisely per reservation. 
                    // For YTD Occ%, we need (Total Rooms * Days passed YTD).
                }
                return acc
            }, { rn: 0, rev: 0, revEur: 0, capacity: 0 })
        }

        const cy = calc(currentYearReservations, currentYear)
        const py = calc(prevYearReservations, prevYear)

        // Calculate YTD Capacity (Total Rooms * Days passed in year)
        // Days passed = days in full months + current day
        let daysPassed = cd
        for (let i = 0; i < cm; i++) daysPassed += new Date(currentYear, i + 1, 0).getDate()
        const capacityYTD = TOTAL_ROOMS * daysPassed

        return {
            cy: { ...cy, occ: capacityYTD > 0 ? cy.rn / capacityYTD : 0 },
            py: { ...py, occ: capacityYTD > 0 ? py.rn / capacityYTD : 0 }
        }
    }, [currentYearReservations, prevYearReservations, exchangeRates, currentYear, prevYear])

    const PIE_COLORS = ['#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ec4899', '#f97316', '#64748b', '#14b8a6', '#e11d48', '#6366f1']

    // PDF Export
    const handlePdfExport = async () => {
        setPdfPreparing(true)
        setPdfReady(false)
        try {
            const { jsPDF } = await import('jspdf')
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

            // Corporate Header
            doc.setFillColor(15, 23, 42) // navy
            doc.rect(0, 0, 297, 25, 'F')
            doc.setTextColor(255, 255, 255)
            doc.setFontSize(18)
            doc.setFont('helvetica', 'bold')
            doc.text('BLUE DREAMS RESORT', 15, 15)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            doc.text('Ultra All Inclusive • Torba / Bodrum', 15, 21)
            doc.text(`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 250, 15)

            // Report Title
            doc.setTextColor(0, 0, 0)
            doc.setFontSize(14)
            doc.setFont('helvetica', 'bold')
            const reportTitle = activeReport === 's26' ? `S${currentYear.toString().slice(-2)} ${t.managementReports.netReservations.toUpperCase()}` : `${t.managementReports.paceReport.toUpperCase()} ${prevYear} - ${currentYear}`
            doc.text(reportTitle, 15, 35)

            // Table
            let y = 42
            doc.setFontSize(8)
            const isS26 = activeReport === 's26'

            if (isS26) {
                // S26 Table Headers
                const headers = ['Ay', 'Oda Geceleme', 'Yatak Geceleme', 'ADB', 'ADR', 'Oda Doluluk', 'Oda Geliri']
                const colWidths = [30, 35, 35, 30, 30, 30, 45]
                let x = 15
                doc.setFillColor(230, 230, 230)
                doc.rect(15, y - 4, 235, 7, 'F')
                doc.setFont('helvetica', 'bold')
                doc.setTextColor(0, 0, 0)
                headers.forEach((h, i) => {
                    doc.text(h, x + 2, y)
                    x += colWidths[i]
                })
                y += 8

                doc.setFont('helvetica', 'normal')
                for (const m of activeMonths) {
                    const c = cyMonth[m.month]
                    let x = 15
                    doc.text(monthNamesLocal[m.month], x + 2, y); x += colWidths[0]
                    doc.text(fmt(c.roomNights), x + 2, y); x += colWidths[1]
                    doc.text(fmt(c.bedNights), x + 2, y); x += colWidths[2]
                    doc.text(fmtEur(c.adb), x + 2, y); x += colWidths[3]
                    doc.text(fmtEur(c.adr), x + 2, y); x += colWidths[4]
                    doc.text(pct(c.occupancy), x + 2, y); x += colWidths[5]
                    doc.text(fmtEur(c.revenueEur), x + 2, y)
                    y += 6
                }
                // Totals row
                doc.setFont('helvetica', 'bold')
                doc.setFillColor(240, 240, 240)
                doc.rect(15, y - 4, 235, 7, 'F')
                let x2 = 15
                doc.text('Toplam', x2 + 2, y); x2 += colWidths[0]
                doc.text(fmt(cyTotal.roomNights), x2 + 2, y); x2 += colWidths[1]
                doc.text(fmt(cyTotal.bedNights), x2 + 2, y); x2 += colWidths[2]
                const totalAdb = cyTotal.bedNights > 0 ? cyTotal.revenueEur / cyTotal.bedNights : 0
                const totalAdr = cyTotal.roomNights > 0 ? cyTotal.revenueEur / cyTotal.roomNights : 0
                const totalOcc = cyTotal.capacity > 0 ? cyTotal.roomNights / cyTotal.capacity : 0
                doc.text(fmtEur(totalAdb), x2 + 2, y); x2 += colWidths[3]
                doc.text(fmtEur(totalAdr), x2 + 2, y); x2 += colWidths[4]
                doc.text(pct(totalOcc), x2 + 2, y); x2 += colWidths[5]
                doc.text(fmtEur(cyTotal.revenueEur), x2 + 2, y)
            }

            // AI Summary Page
            if (aiSummary) {
                doc.addPage()
                doc.setFillColor(15, 23, 42)
                doc.rect(0, 0, 297, 20, 'F')
                doc.setTextColor(255, 255, 255)
                doc.setFontSize(12)
                doc.setFont('helvetica', 'bold')
                doc.text('AI Rapor Yorumu', 15, 13)
                doc.setTextColor(0, 0, 0)
                doc.setFontSize(10)
                doc.setFont('helvetica', 'normal')
                const lines = doc.splitTextToSize(aiSummary, 267)
                doc.text(lines, 15, 30)
            }

            // Footer
            const pageCount = doc.getNumberOfPages()
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i)
                doc.setFontSize(8)
                doc.setTextColor(150, 150, 150)
                doc.text(`Blue Dreams Resort • Yönetim Raporu • Sayfa ${i}/${pageCount}`, 15, 200)
            }

            doc.save(`BlueDreams_${activeReport === 's26' ? 'NetSales' : 'PaceReport'}_${currentYear}.pdf`)
            setPdfReady(true)
        } catch (err) {
            console.error('PDF generation error:', err)
        } finally {
            setPdfPreparing(false)
        }
    }

    // AI Summary Generation — Groups data by season to minimize token usage
    const handleAiSummary = async () => {
        setAiLoading(true)

        // ── Group metrics by season to reduce data volume for AI ──
        const seasonGroups: Record<SeasonType, { months: string[]; rn: number; bn: number; rev: number; revEur: number; capacity: number; prevRn: number; prevRevEur: number; prevCapacity: number }> = {
            HIGH: { months: [], rn: 0, bn: 0, rev: 0, revEur: 0, capacity: 0, prevRn: 0, prevRevEur: 0, prevCapacity: 0 },
            SHOULDER: { months: [], rn: 0, bn: 0, rev: 0, revEur: 0, capacity: 0, prevRn: 0, prevRevEur: 0, prevCapacity: 0 },
            LOW: { months: [], rn: 0, bn: 0, rev: 0, revEur: 0, capacity: 0, prevRn: 0, prevRevEur: 0, prevCapacity: 0 },
            OFF: { months: [], rn: 0, bn: 0, rev: 0, revEur: 0, capacity: 0, prevRn: 0, prevRevEur: 0, prevCapacity: 0 },
        }

        for (let i = 0; i < 12; i++) {
            const season = getSeasonType(i)
            const c = cyMonth[i]
            const p = pyMonth[i]
            if (c.roomNights === 0 && p.roomNights === 0) continue
            seasonGroups[season].months.push(monthNamesShort[i])
            seasonGroups[season].rn += c.roomNights
            seasonGroups[season].bn += c.bedNights
            seasonGroups[season].rev += c.revenue
            seasonGroups[season].revEur += c.revenueEur
            seasonGroups[season].capacity += TOTAL_ROOMS * c.daysInMonth
            seasonGroups[season].prevRn += p.roomNights
            seasonGroups[season].prevRevEur += p.revenueEur
            seasonGroups[season].prevCapacity += TOTAL_ROOMS * p.daysInMonth
        }

        // ── Build grouped summary text (avoids sending raw reservation data to AI) ──
        const totalRevEur = cyTotal.revenueEur
        const totalOcc = cyTotal.capacity > 0 ? (cyTotal.roomNights / cyTotal.capacity * 100).toFixed(1) : '0'
        const prevRevEur = pyTotal.revenueEur
        const revGrowth = prevRevEur > 0 ? (((totalRevEur - prevRevEur) / prevRevEur) * 100).toFixed(1) : 'N/A'

        const bestMonth = [...cyMonth].filter(m => m.roomNights > 0).sort((a, b) => b.revenueEur - a.revenueEur)[0]
        const bestMonthName = bestMonth ? monthNamesLocal[bestMonth.month] : '-'
        const worstMonth = [...cyMonth].filter(m => m.roomNights > 0).sort((a, b) => a.occupancy - b.occupancy)[0]
        const worstMonthName = worstMonth ? monthNamesLocal[worstMonth.month] : '-'

        // Generate season breakdown text
        const seasonLines: string[] = []
        for (const [sType, sg] of Object.entries(seasonGroups)) {
            if (sg.months.length === 0) continue
            const sConf = SEASON_CONFIG[sType as SeasonType]
            const occ = sg.capacity > 0 ? (sg.rn / sg.capacity * 100).toFixed(1) : '0'
            const adr = sg.rn > 0 ? (sg.revEur / sg.rn).toFixed(2) : '0'
            const prevOcc = sg.prevCapacity > 0 ? (sg.prevRn / sg.prevCapacity * 100).toFixed(1) : '0'
            const revChange = sg.prevRevEur > 0 ? (((sg.revEur - sg.prevRevEur) / sg.prevRevEur) * 100).toFixed(1) : 'N/A'
            seasonLines.push(
                `${getSeasonLabel(sType as SeasonType)} (${sg.months.join(', ')}): RN=${fmt(sg.rn)}, Doluluk=%${occ} (önceki: %${prevOcc}), ` +
                `Gelir=${fmtEur(sg.revEur)}, ADR=${fmtEur(parseFloat(adr))}, YoY Gelir: ${revChange}%`
            )
        }

        // Simulate AI response (in production: send only grouped summary to API)
        await new Promise(r => setTimeout(r, 1800))

        setAiSummary(
            `📊 ${currentYear} Sezonu Değerlendirme (Sezon Bazlı Gruplandırma)\n\n` +
            `━━ Genel Özet ━━\n` +
            `Toplam oda geceleme: ${fmt(cyTotal.roomNights)} | Yatak geceleme: ${fmt(cyTotal.bedNights)}\n` +
            `Genel doluluk: %${totalOcc} | Toplam gelir: ${fmtEur(totalRevEur)}\n` +
            `Geçen yıla kıyasla gelir değişimi: ${revGrowth}%\n\n` +
            `━━ Sezon Kırılımı ━━\n` +
            seasonLines.join('\n') + '\n\n' +
            `━━ Dikkat Çekenler ━━\n` +
            `🏆 En yüksek gelir: ${bestMonthName}\n` +
            `⚠️ En düşük doluluk: ${worstMonthName}\n\n` +
            `━━ Öneriler ━━\n` +
            `• Düşük sezon (${seasonGroups.LOW.months.join(', ')}) için erken rezervasyon kampanyaları planlanmalıdır.\n` +
            `• Yüksek sezonda ADR optimizasyonu ile RevPAR artırılabilir.\n` +
            `• Ara sezon (${seasonGroups.SHOULDER.months.join(', ')}) doluluk oranlarını artırmak için hedefli dijital pazarlama önerilir.\n` +
            `• OTA komisyon oranları gözden geçirilerek direkt kanal payı güçlendirilmelidir.\n\n` +
            `ℹ️ Bu analiz, AI limit aşımını önlemek için verilerin sezon gruplarına ayrılarak özetlenmesi ile oluşturulmuştur.`
        )
        setAiLoading(false)
    };

    // Chart data
    const chartData = useMemo(() => {
        return activeMonths.map(m => {
            const c = cyMonth[m.month]
            const p = pyMonth[m.month]
            return {
                name: monthNamesShort[m.month],
                [`${currentYear} Gelir`]: Math.round(c.revenueEur),
                [`${prevYear} Gelir`]: Math.round(p.revenueEur),
                [`${currentYear} Doluluk`]: Math.round(c.occupancy * 100),
                [`${prevYear} Doluluk`]: Math.round(p.occupancy * 100),
                [`${currentYear} ADR`]: Math.round(c.adr),
                [`${prevYear} ADR`]: Math.round(p.adr),
            }
        })
    }, [activeMonths, cyMonth, pyMonth, currentYear, prevYear]);

    return (
        <div className="space-y-6" ref={reportRef}>
            {/* Control Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 's26' as const, icon: FileText, label: `S${currentYear.toString().slice(-2)} ${t.managementReports.netReservations}` },
                        { key: 'pace' as const, icon: ArrowUpDown, label: t.managementReports.paceReport },
                        { key: 'dashboard' as const, icon: LayoutDashboard, label: t.dashboard },
                        { key: 'channels' as const, icon: Share2, label: t.channelDistribution },
                        { key: 'agencies' as const, icon: Users, label: t.managementReports.agencyReport },
                        { key: 'nationality' as const, icon: Globe, label: t.guestNationality },
                        { key: 'market' as const, icon: Store, label: t.managementReports.market },
                    ].map(tab => (
                        <button key={tab.key} onClick={() => setActiveReport(tab.key)} className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${activeReport === tab.key ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                            <tab.icon size={16} className="inline mr-1.5 -mt-0.5" />{tab.label}
                        </button>
                    ))}
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* Market Filter */}
                    <div className="relative">
                        <select
                            value={marketFilter}
                            onChange={e => setMarketFilter(e.target.value)}
                            className="pl-8 pr-3 py-2 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-500/20 rounded-lg text-xs font-bold hover:bg-orange-100 dark:hover:bg-orange-800/30 transition-colors outline-none appearance-none cursor-pointer"
                        >
                            <option value="ALL">{t.managementReports.allMarkets}</option>
                            {availableMarkets.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <Store size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-orange-400 pointer-events-none" />
                    </div>
                    {/* YTD Toggle */}
                    <button
                        onClick={() => setYtdMode(!ytdMode)}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${ytdMode
                            ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        <CalendarCheck size={14} /> {t.managementReports.ytd}
                    </button>
                    {/* Season Filter */}
                    <div className="relative">
                        <select
                            value={seasonFilter}
                            onChange={e => setSeasonFilter(e.target.value as SeasonType | 'ALL')}
                            className="pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors outline-none appearance-none cursor-pointer"
                        >
                            <option value="ALL">{t.managementReports.allSeasons}</option>
                            <option value="HIGH">🔴 Yüksek Sezon (Tem-Ağu)</option>
                            <option value="SHOULDER">🟡 Ara Sezon (Haz-Eyl)</option>
                            <option value="LOW">🔵 Düşük Sezon (Nis-May-Eki-Kas)</option>
                        </select>
                        <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <PriceModeToggle mode={priceMode} onChange={setPriceMode} />
                    <button onClick={() => setShowCurrency(showCurrency === 'EUR' ? 'TRY' : 'EUR')} className="px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {showCurrency === 'EUR' ? '€ EUR' : '₺ TRY'}
                    </button>
                    <button onClick={handleAiSummary} disabled={aiLoading} className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-800/40 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                        <Sparkles size={14} /> {aiLoading ? '...' : t.managementReports.aiInterpretGrouped}
                    </button>
                    <button onClick={handlePdfExport} disabled={pdfPreparing} className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-xs font-bold hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors flex items-center gap-1.5 disabled:opacity-50">
                        <Download size={14} /> {pdfPreparing ? 'Hazırlanıyor...' : pdfReady ? '✓ İndir' : 'PDF Export'}
                    </button>
                    <button className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors flex items-center gap-1.5">
                        <Mail size={14} /> {t.managementReports.sendEmail}
                    </button>
                </div>
            </div>

            {/* AI Summary Banner */}
            {aiSummary && (
                <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-cyan-500/10 dark:from-purple-900/20 dark:via-indigo-900/20 dark:to-cyan-900/20 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-purple-700 dark:text-purple-300 mb-2">AI Rapor Yorumu</h4>
                            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">{aiSummary}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════ S26 NET SALES ═══════════════════════ */}
            {activeReport === 's26' && (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { key: 'rn', label: t.roomNightLabel, value: fmt(cyTotal.roomNights), icon: Building2, color: 'cyan' },
                            { key: 'bn', label: t.bedNightLabel, value: fmt(cyTotal.bedNights), icon: Building2, color: 'blue' },
                            { key: 'occ', label: t.roomOccupancy, value: pct(cyTotal.capacity > 0 ? cyTotal.roomNights / cyTotal.capacity : 0), icon: TrendingUp, color: 'emerald' },
                            { key: 'rev', label: t.roomRevenue, value: showCurrency === 'EUR' ? fmtEur(cyTotal.revenueEur) : fmtTry(cyTotal.revenue), icon: TrendingUp, color: 'amber' },
                        ].map((card, i) => {
                            const ytdVariance = (() => {
                                if (card.key === 'rn') return diffPct(ytdStats.cy.rn, ytdStats.py.rn)
                                if (card.key === 'rev') return diffPct(ytdStats.cy.revEur, ytdStats.py.revEur)
                                if (card.key === 'occ') return diffPct(ytdStats.cy.occ, ytdStats.py.occ)
                                return null
                            })()

                            return (
                                <div key={i} className={`bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden`}>
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2 mb-2">
                                            <card.icon size={16} className={`text-${card.color}-500`} />
                                            <span className="text-xs text-slate-500 font-medium">{card.label}</span>
                                        </div>
                                        {ytdVariance && (
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${ytdVariance.startsWith('+') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ytdVariance === '0%' ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                {ytdVariance} YoY
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{card.value}</div>
                                    <div className="text-[10px] text-slate-400 mt-1">YTD: Bugün itibariyle geçen yıl kıyaslaması</div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Season Legend */}
                    <div className="flex flex-wrap gap-3 items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sezon:</span>
                        {(['HIGH', 'SHOULDER', 'LOW'] as SeasonType[]).map(s => {
                            const sc = SEASON_CONFIG[s]
                            const Icon = sc.icon
                            return (
                                <button
                                    key={s}
                                    onClick={() => setSeasonFilter(seasonFilter === s ? 'ALL' : s)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${seasonFilter === s ? sc.badge + ' ' + sc.badgeDark + ' ring-2 ring-offset-1 ring-current shadow-sm' : sc.badge + ' ' + sc.badgeDark + ' opacity-70 hover:opacity-100'}`}
                                >
                                    <Icon size={12} />
                                    {getSeasonLabel(s)}
                                </button>
                            )
                        })}
                        {seasonFilter !== 'ALL' && (
                            <button onClick={() => setSeasonFilter('ALL')} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline transition-colors">Temizle</button>
                        )}
                    </div>

                    {/* S26 Net Sales Table */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">S{currentYear.toString().slice(-2)} {t.managementReports.netReservations.toUpperCase()}</h3>
                            <div className="text-xs text-slate-500">{t.exchangeRateLabel} 1 EUR = {fmt(exchangeRates.EUR_TO_TRY, 2)} ₺ (Elektra API)</div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                    <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                                        <th className="p-3 text-left">{t.monthLabel}</th>
                                        <th className="p-3 text-left">{t.seasonLabel}</th>
                                        <th className="p-3 text-right">{t.roomNightLabel}</th>
                                        <th className="p-3 text-right">{t.bedNightLabel}</th>
                                        <th className="p-3 text-right">ADB</th>
                                        <th className="p-3 text-right">ADR</th>
                                        <th className="p-3 text-right">{t.roomOccupancy}</th>
                                        <th className="p-3 text-right">{t.roomRevenue}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {activeMonths.map((m) => {
                                        const c = cyMonth[m.month]
                                        const season = getSeasonType(m.month)
                                        const sc = SEASON_CONFIG[season]
                                        const SeasonIcon = sc.icon
                                        return (
                                            <tr key={m.month} className={`${sc.bgRow} ${sc.bgRowDark} ${sc.borderL} hover:brightness-95 dark:hover:brightness-110 transition-all`}>
                                                <td className="p-3 font-bold text-slate-900 dark:text-white">{monthNamesLocal[m.month]}</td>
                                                <td className="p-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${sc.badge} ${sc.badgeDark}`}>
                                                        <SeasonIcon size={10} /> {getSeasonLabel(season)}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-mono">{fmt(c.roomNights)}</td>
                                                <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-mono">{fmt(c.bedNights)}</td>
                                                <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-mono">{showCurrency === 'EUR' ? fmtEur(c.adb) : fmtTry(c.adb * exchangeRates.EUR_TO_TRY)}</td>
                                                <td className="p-3 text-right text-slate-700 dark:text-slate-300 font-mono">{showCurrency === 'EUR' ? fmtEur(c.adr) : fmtTry(c.adr * exchangeRates.EUR_TO_TRY)}</td>
                                                <td className="p-3 text-right font-mono">
                                                    <span className={`px-2 py-0.5 rounded ${c.occupancy > 0.5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : c.occupancy > 0.2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {pct(c.occupancy)}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-right font-bold text-slate-900 dark:text-white font-mono">{showCurrency === 'EUR' ? fmtEur(c.revenueEur) : fmtTry(c.revenue)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-slate-900 dark:bg-slate-800 text-white font-bold">
                                        <td className="p-3">{t.managementReports.total}{seasonFilter !== 'ALL' ? ` (${getSeasonLabel(seasonFilter)})` : ''}</td>
                                        <td className="p-3"></td>
                                        <td className="p-3 text-right font-mono">{fmt(cyTotal.roomNights)}</td>
                                        <td className="p-3 text-right font-mono">{fmt(cyTotal.bedNights)}</td>
                                        <td className="p-3 text-right font-mono">{showCurrency === 'EUR' ? fmtEur(cyTotal.bedNights > 0 ? cyTotal.revenueEur / cyTotal.bedNights : 0) : fmtTry(cyTotal.bedNights > 0 ? cyTotal.revenue / cyTotal.bedNights : 0)}</td>
                                        <td className="p-3 text-right font-mono">{showCurrency === 'EUR' ? fmtEur(cyTotal.roomNights > 0 ? cyTotal.revenueEur / cyTotal.roomNights : 0) : fmtTry(cyTotal.roomNights > 0 ? cyTotal.revenue / cyTotal.roomNights : 0)}</td>
                                        <td className="p-3 text-right font-mono">{pct(cyTotal.capacity > 0 ? cyTotal.roomNights / cyTotal.capacity : 0)}</td>
                                        <td className="p-3 text-right font-mono">{showCurrency === 'EUR' ? fmtEur(cyTotal.revenueEur) : fmtTry(cyTotal.revenue)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════ YTD PACE REPORT ═══════════════════════ */}
            {activeReport === 'pace' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.managementReports.paceReport.toUpperCase()} {prevYear} – {currentYear}</h3>
                            <p className="text-xs text-slate-500">Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            {/* Header Row - Two year groups */}
                            <thead>
                                <tr className="bg-blue-900 text-white">
                                    <th className="p-2 text-left" rowSpan={2}>Ay</th>
                                    <th className="p-2 text-center border-l border-blue-700" colSpan={6}>{prevYear}</th>
                                    <th className="p-2 text-center border-l border-yellow-600 bg-yellow-700" colSpan={6}>{currentYear}</th>
                                </tr>
                                <tr className="bg-blue-800 text-blue-200 text-[10px] uppercase tracking-wider font-bold">
                                    <th className="p-2 text-right border-l border-blue-700">RN</th>
                                    <th className="p-2 text-right">BN</th>
                                    <th className="p-2 text-right">Occ</th>
                                    <th className="p-2 text-right">REV</th>
                                    <th className="p-2 text-right">ADR</th>
                                    <th className="p-2 text-right">REVPAR</th>
                                    <th className="p-2 text-right border-l border-yellow-600 bg-yellow-800 text-yellow-200">RN</th>
                                    <th className="p-2 text-right bg-yellow-800 text-yellow-200">BN</th>
                                    <th className="p-2 text-right bg-yellow-800 text-yellow-200">Occ</th>
                                    <th className="p-2 text-right bg-yellow-800 text-yellow-200">REV</th>
                                    <th className="p-2 text-right bg-yellow-800 text-yellow-200">ADR</th>
                                    <th className="p-2 text-right bg-yellow-800 text-yellow-200">REVPAR</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {activeMonths.map(m => {
                                    const c = cyMonth[m.month]
                                    const p = pyMonth[m.month]
                                    const season = getSeasonType(m.month)
                                    const sc = SEASON_CONFIG[season]
                                    return (
                                        <tr key={m.month} className={`${sc.bgRow} ${sc.bgRowDark} ${sc.borderL} hover:brightness-95 dark:hover:brightness-110 transition-all`}>
                                            <td className="p-2 font-bold text-slate-900 dark:text-white">{monthNamesShort[m.month]}</td>
                                            {/* Prev year */}
                                            <td className="p-2 text-right text-slate-600 dark:text-slate-400 font-mono border-l border-slate-200 dark:border-white/5">{fmt(p.roomNights)}</td>
                                            <td className="p-2 text-right text-slate-600 dark:text-slate-400 font-mono">{fmt(p.bedNights)}</td>
                                            <td className="p-2 text-right text-slate-600 dark:text-slate-400 font-mono">{pct(p.occupancy)}</td>
                                            <td className="p-2 text-right text-slate-600 dark:text-slate-400 font-mono">{fmtEur(p.revenueEur)}</td>
                                            <td className="p-2 text-right text-slate-600 dark:text-slate-400 font-mono">{fmtEur(p.adr)}</td>
                                            <td className="p-2 text-right text-slate-600 dark:text-slate-400 font-mono">{fmtEur(p.revpar)}</td>
                                            {/* Current year */}
                                            <td className="p-2 text-right text-slate-900 dark:text-white font-mono font-bold border-l border-amber-200 dark:border-amber-500/20">{fmt(c.roomNights)}</td>
                                            <td className="p-2 text-right text-slate-900 dark:text-white font-mono font-bold">{fmt(c.bedNights)}</td>
                                            <td className="p-2 text-right font-mono font-bold">
                                                <span className={c.occupancy > p.occupancy ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                                                    {pct(c.occupancy)}
                                                </span>
                                            </td>
                                            <td className="p-2 text-right text-slate-900 dark:text-white font-mono font-bold">{fmtEur(c.revenueEur)}</td>
                                            <td className="p-2 text-right text-slate-900 dark:text-white font-mono font-bold">{fmtEur(c.adr)}</td>
                                            <td className="p-2 text-right text-slate-900 dark:text-white font-mono font-bold">{fmtEur(c.revpar)}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs">
                                    <td className="p-2">{t.managementReports.total}</td>
                                    <td className="p-2 text-right font-mono border-l border-slate-700">{fmt(pyTotal.roomNights)}</td>
                                    <td className="p-2 text-right font-mono">{fmt(pyTotal.bedNights)}</td>
                                    <td className="p-2 text-right font-mono">{pct(pyTotal.capacity > 0 ? pyTotal.roomNights / pyTotal.capacity : 0)}</td>
                                    <td className="p-2 text-right font-mono">{fmtEur(pyTotal.revenueEur)}</td>
                                    <td className="p-2 text-right font-mono">{fmtEur(pyTotal.roomNights > 0 ? pyTotal.revenueEur / pyTotal.roomNights : 0)}</td>
                                    <td className="p-2 text-right font-mono">{fmtEur(pyTotal.capacity > 0 ? pyTotal.revenueEur / pyTotal.capacity : 0)}</td>
                                    <td className="p-2 text-right font-mono border-l border-amber-600">{fmt(cyTotal.roomNights)}</td>
                                    <td className="p-2 text-right font-mono">{fmt(cyTotal.bedNights)}</td>
                                    <td className="p-2 text-right font-mono">{pct(cyTotal.capacity > 0 ? cyTotal.roomNights / cyTotal.capacity : 0)}</td>
                                    <td className="p-2 text-right font-mono">{fmtEur(cyTotal.revenueEur)}</td>
                                    <td className="p-2 text-right font-mono">{fmtEur(cyTotal.roomNights > 0 ? cyTotal.revenueEur / cyTotal.roomNights : 0)}</td>
                                    <td className="p-2 text-right font-mono">{fmtEur(cyTotal.capacity > 0 ? cyTotal.revenueEur / cyTotal.capacity : 0)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Difference Section */}
                    <div className="border-t border-slate-200 dark:border-white/10">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{prevYear} – {currentYear} FARKI</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-red-900 text-white text-[10px] uppercase tracking-wider font-bold">
                                        <th className="p-2 text-left">Ay</th>
                                        <th className="p-2 text-right">RN Fark</th>
                                        <th className="p-2 text-right">BN Fark</th>
                                        <th className="p-2 text-right">Occ Fark</th>
                                        <th className="p-2 text-right">REV Fark</th>
                                        <th className="p-2 text-right">ADR Fark</th>
                                        <th className="p-2 text-right">REVPAR Fark</th>
                                        <th className="p-2 text-right border-l border-red-700">RN %</th>
                                        <th className="p-2 text-right">BN %</th>
                                        <th className="p-2 text-right">Occ %</th>
                                        <th className="p-2 text-right">REV %</th>
                                        <th className="p-2 text-right">ADR %</th>
                                        <th className="p-2 text-right">REVPAR %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {activeMonths.map(m => {
                                        const c = cyMonth[m.month]
                                        const p = pyMonth[m.month]
                                        const rnDiff = c.roomNights - p.roomNights
                                        const bnDiff = c.bedNights - p.bedNights
                                        const occDiff = c.occupancy - p.occupancy
                                        const revDiff = c.revenueEur - p.revenueEur
                                        const adrDiff = c.adr - p.adr
                                        const revparDiff = c.revpar - p.revpar
                                        const colorize = (v: number) => v >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                                        return (
                                            <tr key={m.month} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="p-2 font-bold text-slate-900 dark:text-white">{monthNamesShort[m.month]}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(rnDiff)}`}>{rnDiff >= 0 ? '+' : ''}{fmt(rnDiff)}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(bnDiff)}`}>{bnDiff >= 0 ? '+' : ''}{fmt(bnDiff)}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(occDiff)}`}>{(occDiff * 100).toFixed(2)}%</td>
                                                <td className={`p-2 text-right font-mono ${colorize(revDiff)}`}>{revDiff >= 0 ? '+' : ''}{fmtEur(revDiff)}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(adrDiff)}`}>{adrDiff >= 0 ? '+' : ''}{fmtEur(adrDiff)}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(revparDiff)}`}>{revparDiff >= 0 ? '+' : ''}{fmtEur(revparDiff)}</td>
                                                <td className={`p-2 text-right font-mono border-l border-slate-200 dark:border-white/5 ${colorize(rnDiff)}`}>{diffPct(c.roomNights, p.roomNights)}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(bnDiff)}`}>{diffPct(c.bedNights, p.bedNights)}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(occDiff)}`}>{diffPct(c.occupancy, p.occupancy)}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(revDiff)}`}>{diffPct(c.revenueEur, p.revenueEur)}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(adrDiff)}`}>{diffPct(c.adr, p.adr)}</td>
                                                <td className={`p-2 text-right font-mono ${colorize(revparDiff)}`}>{diffPct(c.revpar, p.revpar)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════ DASHBOARD KPIs ═══════════════════════ */}
            {activeReport === 'dashboard' && (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[
                            { label: 'Oda Geceleme (RN)', cy: cyTotal.roomNights, py: pyTotal.roomNights, format: (v: number) => fmt(v), icon: Building2, color: 'cyan' },
                            { label: 'Yatak Geceleme (BN)', cy: cyTotal.bedNights, py: pyTotal.bedNights, format: (v: number) => fmt(v), icon: Building2, color: 'blue' },
                            { label: 'Toplam Gelir', cy: cyTotal.revenueEur, py: pyTotal.revenueEur, format: (v: number) => fmtEur(v), icon: TrendingUp, color: 'emerald' },
                            { label: 'ADR', cy: cyTotal.roomNights > 0 ? cyTotal.revenueEur / cyTotal.roomNights : 0, py: pyTotal.roomNights > 0 ? pyTotal.revenueEur / pyTotal.roomNights : 0, format: (v: number) => fmtEur(v), icon: TrendingUp, color: 'amber' },
                            { label: 'RevPAR', cy: cyTotal.capacity > 0 ? cyTotal.revenueEur / cyTotal.capacity : 0, py: pyTotal.capacity > 0 ? pyTotal.revenueEur / pyTotal.capacity : 0, format: (v: number) => fmtEur(v), icon: TrendingUp, color: 'violet' },
                            { label: 'Doluluk %', cy: cyTotal.capacity > 0 ? (cyTotal.roomNights / cyTotal.capacity) * 100 : 0, py: pyTotal.capacity > 0 ? (pyTotal.roomNights / pyTotal.capacity) * 100 : 0, format: (v: number) => `${fmt(v, 1)}%`, icon: Building2, color: 'rose' },
                        ].map((kpi, i) => {
                            const diff = kpi.py > 0 ? ((kpi.cy - kpi.py) / kpi.py) * 100 : 0
                            const isUp = diff >= 0
                            return (
                                <div key={i} className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <kpi.icon size={14} className={`text-${kpi.color}-500`} />
                                        <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{kpi.label}</span>
                                    </div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">{kpi.format(kpi.cy)}</div>
                                    <div className="flex items-center gap-1 mt-1">
                                        {isUp ? <TrendingUp size={12} className="text-emerald-500" /> : <TrendingDown size={12} className="text-red-500" />}
                                        <span className={`text-xs font-bold ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{isUp ? '+' : ''}{fmt(diff, 1)}%</span>
                                        <span className="text-[10px] text-slate-400">vs {prevYear}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{prevYear}: {kpi.format(kpi.py)}</div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Monthly Comparison Table */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.managementReports.kpiSummary} — {currentYear}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                                <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                    <tr className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                                        <th className="p-3 text-left">{t.monthLabel}</th>
                                        <th className="p-3 text-right">RN</th>
                                        <th className="p-3 text-right">{t.roomRevenue} (€)</th>
                                        <th className="p-3 text-right">ADR</th>
                                        <th className="p-3 text-right">RevPAR</th>
                                        <th className="p-3 text-right">Occ %</th>
                                        <th className="p-3 text-right">RN Δ%</th>
                                        <th className="p-3 text-right">Rev Δ%</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {activeMonths.map(m => {
                                        const c = cyMonth[m.month]
                                        const p = pyMonth[m.month]
                                        return (
                                            <tr key={m.month} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                                <td className="p-3 font-bold text-slate-900 dark:text-white">{monthNamesLocal[m.month]}</td>
                                                <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(c.roomNights)}</td>
                                                <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{fmtEur(c.revenueEur)}</td>
                                                <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmtEur(c.adr)}</td>
                                                <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmtEur(c.revpar)}</td>
                                                <td className="p-3 text-right font-mono">
                                                    <span className={`px-2 py-0.5 rounded ${c.occupancy > 0.5 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : c.occupancy > 0.2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                                                        {pct(c.occupancy)}
                                                    </span>
                                                </td>
                                                <td className={`p-3 text-right font-mono font-bold ${c.roomNights >= p.roomNights ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{diffPct(c.roomNights, p.roomNights)}</td>
                                                <td className={`p-3 text-right font-mono font-bold ${c.revenueEur >= p.revenueEur ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{diffPct(c.revenueEur, p.revenueEur)}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════ CHANNEL DISTRIBUTION ═══════════════════════ */}
            {activeReport === 'channels' && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.channelDistribution} — {t.managementReports.revenueShare}</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={channelData} dataKey="revenueEur" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2} label={(entry: any) => `${entry.name} (${(entry.share as number)?.toFixed(1) || '0'}%)`}>
                                            {channelData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => fmtEur(Number(value))} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {/* Channel Bar Chart */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.channelDistribution} ADR {t.managementReports.comparison}</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={channelData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                        <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `€${v}`} />
                                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" width={100} />
                                        <Tooltip formatter={(value: any) => fmtEur(Number(value))} />
                                        <Bar dataKey="adr" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    {/* Channel Table */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.channelDistribution} {t.managementReports.details} — {currentYear}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                    <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                                        <th className="p-3 text-left">{t.channelDistribution.split(' ')[0]}</th>
                                        <th className="p-3 text-right">{t.managementReports.resCount}</th>
                                        <th className="p-3 text-right">RN</th>
                                        <th className="p-3 text-right">{t.roomRevenue} (€)</th>
                                        <th className="p-3 text-right">ADR</th>
                                        <th className="p-3 text-right">{t.managementReports.sharePct}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {channelData.map((ch, i) => (
                                        <tr key={ch.name} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                                                <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                {ch.name}
                                            </td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(ch.count)}</td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(ch.rn)}</td>
                                            <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{fmtEur(ch.revenueEur)}</td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmtEur(ch.adr)}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, ch.share)}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                                    </div>
                                                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-12 text-right">{fmt(ch.share, 1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════ AGENCY REPORT ═══════════════════════ */}
            {activeReport === 'agencies' && (
                <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 dark:border-white/10">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.managementReports.agencyReport} — {currentYear}</h3>
                        <p className="text-xs text-slate-500 mt-1">{t.managementReports.total} {agencyData.length}</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                                    <th className="p-3 text-left">#</th>
                                    <th className="p-3 text-left">{t.managementReports.agencyReport.split(' ')[0]}</th>
                                    <th className="p-3 text-right">{t.managementReports.resCount}</th>
                                    <th className="p-3 text-right">RN</th>
                                    <th className="p-3 text-right">{t.roomRevenue} (€)</th>
                                    <th className="p-3 text-right">ADR</th>
                                    <th className="p-3 text-right">{t.managementReports.sharePct}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                {agencyData.slice(0, 30).map((ag, i) => (
                                    <tr key={ag.name} className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${i < 3 ? 'bg-amber-50/50 dark:bg-amber-950/10' : ''}`}>
                                        <td className="p-3 text-slate-500 font-mono">
                                            {i < 3 ? <span className="text-amber-500 font-bold">{'🥇🥈🥉'[i]}</span> : i + 1}
                                        </td>
                                        <td className="p-3 font-bold text-slate-900 dark:text-white max-w-[200px] truncate">{ag.name}</td>
                                        <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(ag.count)}</td>
                                        <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(ag.rn)}</td>
                                        <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{fmtEur(ag.revenueEur)}</td>
                                        <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmtEur(ag.adr)}</td>
                                        <td className="p-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                    <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${Math.min(100, ag.share)}%` }} />
                                                </div>
                                                <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-12 text-right">{fmt(ag.share, 1)}%</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="bg-slate-900 dark:bg-slate-800 text-white font-bold">
                                    <td className="p-3" colSpan={2}>Toplam</td>
                                    <td className="p-3 text-right font-mono">{fmt(agencyData.reduce((s, a) => s + a.count, 0))}</td>
                                    <td className="p-3 text-right font-mono">{fmt(agencyData.reduce((s, a) => s + a.rn, 0))}</td>
                                    <td className="p-3 text-right font-mono">{fmtEur(agencyData.reduce((s, a) => s + a.revenueEur, 0))}</td>
                                    <td className="p-3 text-right font-mono">—</td>
                                    <td className="p-3 text-right font-mono">100%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══════════════════════ NATIONALITY ═══════════════════════ */}
            {activeReport === 'nationality' && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pie Chart */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.guestNationality} — {t.managementReports.revenueShare}</h3>
                            <div className="h-72">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={nationalityData.slice(0, 10)} dataKey="revenueEur" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={50} paddingAngle={2} label={(entry: any) => `${entry.name} (${(entry.share as number)?.toFixed(1) || '0'}%)`}>
                                            {nationalityData.slice(0, 10).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                        </Pie>
                                        <Tooltip formatter={(value: any) => fmtEur(Number(value))} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        {/* Top 5 Cards */}
                        <div className="space-y-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Top 5 Milliyet</h3>
                            {nationalityData.slice(0, 5).map((nat, i) => (
                                <div key={nat.name} className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-white/10 p-4 flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: PIE_COLORS[i] }}>
                                        {i + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-900 dark:text-white">{nat.name}</div>
                                        <div className="text-xs text-slate-500">{fmt(nat.count)} rez. • {fmt(nat.rn)} RN</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-slate-900 dark:text-white">{fmtEur(nat.revenueEur)}</div>
                                        <div className="text-xs text-slate-500">{fmt(nat.share, 1)}% pay</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Full Nationality Table */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.guestNationality} {t.managementReports.details} — {currentYear}</h3>
                            <p className="text-xs text-slate-500 mt-1">{t.managementReports.total} {nationalityData.length}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                    <tr className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                                        <th className="p-3 text-left">#</th>
                                        <th className="p-3 text-left">{t.guestNationality}</th>
                                        <th className="p-3 text-right">{t.managementReports.resCount}</th>
                                        <th className="p-3 text-right">RN</th>
                                        <th className="p-3 text-right">{t.roomRevenue} (€)</th>
                                        <th className="p-3 text-right">ADR</th>
                                        <th className="p-3 text-right">{t.managementReports.sharePct}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {nationalityData.map((nat, i) => (
                                        <tr key={nat.name} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-slate-500 font-mono">{i + 1}</td>
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                                                <Globe size={14} className="inline mr-1.5 -mt-0.5 text-slate-400" />{nat.name}
                                            </td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(nat.count)}</td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(nat.rn)}</td>
                                            <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{fmtEur(nat.revenueEur)}</td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmtEur(nat.adr)}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                        <div className="h-full bg-violet-500 rounded-full" style={{ width: `${Math.min(100, nat.share)}%` }} />
                                                    </div>
                                                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-12 text-right">{fmt(nat.share, 1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════ MARKET ═══════════════════════ */}
            {activeReport === 'market' && (
                <>
                    {/* Active filters banner */}
                    {(marketFilter !== 'ALL' || ytdMode) && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/20 rounded-xl p-3 flex items-center gap-3 text-sm">
                            <Store size={16} className="text-orange-500" />
                            <span className="text-orange-700 dark:text-orange-300">
                                Aktif Filtreler:
                                {marketFilter !== 'ALL' && <span className="font-bold ml-1">{t.managementReports.market}: {marketFilter}</span>}
                                {ytdMode && <span className="font-bold ml-2">• YTD ({new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} itibarıyla)</span>}
                            </span>
                            <button onClick={() => { setMarketFilter('ALL'); setYtdMode(false) }} className="ml-auto text-xs text-orange-500 hover:text-orange-700 font-bold">Temizle</button>
                        </div>
                    )}

                    {/* Market Chart — Top 10 */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{t.managementReports.market} {t.managementReports.comparison} — Top 10 ({t.roomRevenue} €)</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={marketData.slice(0, 10).map(m => ({ name: m.name.length > 15 ? m.name.slice(0, 15) + '…' : m.name, [`${currentYear}`]: Math.round(m.cyRevenueEur), [`${prevYear}`]: Math.round(m.pyRevenueEur) }))} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `€${(v / 1000).toFixed(0)}K`} />
                                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={120} />
                                    <Tooltip formatter={(value: any) => fmtEur(Number(value))} />
                                    <Legend />
                                    <Bar dataKey={`${prevYear}`} fill="#64748b" radius={[0, 4, 4, 0]} />
                                    <Bar dataKey={`${currentYear}`} fill="#06b6d4" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Market YoY Comparison Table */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-slate-200 dark:border-white/10">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t.managementReports.market} {t.managementReports.details} — {currentYear} vs {prevYear}</h3>
                            <p className="text-xs text-slate-500 mt-1">{t.managementReports.total} {marketData.length}</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-[#0f172a]">
                                    <tr className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                                        <th className="p-3 text-left">#</th>
                                        <th className="p-3 text-left">{t.managementReports.market} / {t.managementReports.agencyReport.split(' ')[0]}</th>
                                        <th className="p-3 text-right">{currentYear} {t.managementReports.resCount}</th>
                                        <th className="p-3 text-right">{prevYear} {t.managementReports.resCount}</th>
                                        <th className="p-3 text-right">{currentYear} RN</th>
                                        <th className="p-3 text-right">{prevYear} RN</th>
                                        <th className="p-3 text-right">RN Δ%</th>
                                        <th className="p-3 text-right">{currentYear} {t.roomRevenue} (€)</th>
                                        <th className="p-3 text-right">{prevYear} {t.roomRevenue} (€)</th>
                                        <th className="p-3 text-right">Rev Δ%</th>
                                        <th className="p-3 text-right">{currentYear} ADR</th>
                                        <th className="p-3 text-right">{t.managementReports.sharePct}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                    {marketData.map((m, i) => (
                                        <tr key={m.name} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="p-3 text-slate-500 font-mono">{i + 1}</td>
                                            <td className="p-3 font-bold text-slate-900 dark:text-white">
                                                <Store size={14} className="inline mr-1.5 -mt-0.5 text-orange-400" />{m.name}
                                            </td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmt(m.cyCount)}</td>
                                            <td className="p-3 text-right font-mono text-slate-500">{fmt(m.pyCount)}</td>
                                            <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{fmt(m.cyRn)}</td>
                                            <td className="p-3 text-right font-mono text-slate-500">{fmt(m.pyRn)}</td>
                                            <td className={`p-3 text-right font-mono font-bold ${m.rnChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {m.rnChange >= 0 ? '+' : ''}{fmt(m.rnChange, 1)}%
                                            </td>
                                            <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">{fmtEur(m.cyRevenueEur)}</td>
                                            <td className="p-3 text-right font-mono text-slate-500">{fmtEur(m.pyRevenueEur)}</td>
                                            <td className={`p-3 text-right font-mono font-bold ${m.revChange >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                {m.revChange >= 0 ? '+' : ''}{fmt(m.revChange, 1)}%
                                            </td>
                                            <td className="p-3 text-right font-mono text-slate-700 dark:text-slate-300">{fmtEur(m.cyAdr)}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                                                        <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, m.share)}%` }} />
                                                    </div>
                                                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 w-12 text-right">{fmt(m.share, 1)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Totals Row */}
                                    <tr className="bg-slate-100 dark:bg-slate-800/50 font-bold">
                                        <td className="p-3"></td>
                                        <td className="p-3 text-slate-900 dark:text-white">TOPLAM</td>
                                        <td className="p-3 text-right font-mono text-slate-900 dark:text-white">{fmt(marketData.reduce((s, m) => s + m.cyCount, 0))}</td>
                                        <td className="p-3 text-right font-mono text-slate-500">{fmt(marketData.reduce((s, m) => s + m.pyCount, 0))}</td>
                                        <td className="p-3 text-right font-mono text-slate-900 dark:text-white">{fmt(marketData.reduce((s, m) => s + m.cyRn, 0))}</td>
                                        <td className="p-3 text-right font-mono text-slate-500">{fmt(marketData.reduce((s, m) => s + m.pyRn, 0))}</td>
                                        <td className="p-3 text-right">—</td>
                                        <td className="p-3 text-right font-mono text-slate-900 dark:text-white">{fmtEur(marketData.reduce((s, m) => s + m.cyRevenueEur, 0))}</td>
                                        <td className="p-3 text-right font-mono text-slate-500">{fmtEur(marketData.reduce((s, m) => s + m.pyRevenueEur, 0))}</td>
                                        <td className="p-3 text-right">—</td>
                                        <td className="p-3 text-right">—</td>
                                        <td className="p-3 text-right font-mono text-slate-900 dark:text-white">100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* ═══════════════════════ CHARTS ═══════════════════════ */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Grafik Karşılaştırma</h3>
                    <div className="flex gap-1">
                        {([
                            { key: 'revenue', label: 'Gelir' },
                            { key: 'occupancy', label: 'Doluluk' },
                            { key: 'adr', label: 'ADR' }
                        ] as const).map(v => (
                            <button key={v.key} onClick={() => setChartView(v.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${chartView === v.key ? 'bg-cyan-600 text-white' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                                {v.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-6 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartView === 'revenue' ? (
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `€${(v / 1000).toFixed(0)}K`} />
                                <Tooltip content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                                                {payload.map((p: any, i: number) => (
                                                    <p key={i} className="font-bold text-slate-900 dark:text-white text-sm">{p.name}: €{fmt(Number(p.value))}</p>
                                                ))}
                                            </div>
                                        )
                                    }
                                    return null
                                }} />
                                <Legend />
                                <Bar dataKey={`${prevYear} Gelir`} fill="#64748b" radius={[4, 4, 0, 0]} />
                                <Bar dataKey={`${currentYear} Gelir`} fill="#06b6d4" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        ) : chartView === 'occupancy' ? (
                            <AreaChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `${v}%`} domain={[0, 100]} />
                                <Tooltip content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                                                {payload.map((p: any, i: number) => (
                                                    <p key={i} className="font-bold text-slate-900 dark:text-white text-sm">{p.name}: {p.value}%</p>
                                                ))}
                                            </div>
                                        )
                                    }
                                    return null
                                }} />
                                <Legend />
                                <Area type="monotone" dataKey={`${prevYear} Doluluk`} stroke="#64748b" fill="#64748b" fillOpacity={0.2} />
                                <Area type="monotone" dataKey={`${currentYear} Doluluk`} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.3} />
                            </AreaChart>
                        ) : (
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={v => `€${v}`} />
                                <Tooltip content={({ active, payload, label }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl shadow-lg">
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                                                {payload.map((p: any, i: number) => (
                                                    <p key={i} className="font-bold text-slate-900 dark:text-white text-sm">{p.name}: €{fmt(Number(p.value))}</p>
                                                ))}
                                            </div>
                                        )
                                    }
                                    return null
                                }} />
                                <Legend />
                                <Line type="monotone" dataKey={`${prevYear} ADR`} stroke="#64748b" strokeWidth={2} dot={{ r: 4 }} />
                                <Line type="monotone" dataKey={`${currentYear} ADR`} stroke="#06b6d4" strokeWidth={3} dot={{ r: 5 }} />
                            </LineChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Scheduled Email Card */}
            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BellRing size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-sm font-bold text-blue-700 dark:text-blue-300 mb-1">Zamanlı Rapor Gönderimi</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Bu raporu belirli aralıklarla e-posta ile otomatik göndermek için zamanlanmış gönderim oluşturabilirsiniz.</p>
                    </div>
                    <div className="flex gap-2">
                        <select className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-slate-300 outline-none">
                            <option>Haftalık</option>
                            <option>Aylık</option>
                            <option>Günlük</option>
                        </select>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors">Etkinleştir</button>
                    </div>
                </div>
            </div>

            {/* Cross-Module Navigation */}
            <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-5">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-3">İlgili Modüller</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { href: `/${locale}/admin/yield`, label: 'Yield Management', desc: 'ADR analizi, fiyat matrisi', icon: TrendingUp },
                        { href: `/${locale}/admin/reservations`, label: 'Rezervasyonlar', desc: 'Detaylı liste ve filtre', icon: Calendar },
                        { href: `/${locale}/admin/extras`, label: 'Ekstra Satışlar', desc: 'SPA, minibar, restoran', icon: Store },
                        { href: `/${locale}/admin/statistics`, label: 'İstatistikler', desc: 'Kanal & performans', icon: LayoutDashboard },
                    ].map((m, i) => (
                        <Link key={i} href={m.href} className="flex items-center gap-3 p-3 bg-white dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 hover:border-cyan-400 dark:hover:border-cyan-500 transition-colors group">
                            <m.icon size={18} className="text-slate-400 group-hover:text-cyan-500 transition-colors flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200 group-hover:text-cyan-700 dark:group-hover:text-white truncate">{m.label}</p>
                                <p className="text-[10px] text-slate-400 truncate">{m.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
