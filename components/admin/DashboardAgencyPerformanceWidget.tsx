'use client'

import React, { useMemo, useState } from 'react'
import { Building2, TrendingUp, TrendingDown, ArrowRight, ChevronDown, ChevronUp, Bed } from 'lucide-react'
import type { Reservation } from '@/lib/services/elektra'

interface DashboardAgencyPerformanceProps {
    reservations: Reservation[]
    currency?: 'TRY' | 'EUR' | 'USD'
    exchangeRate?: number
}

// Room-type level data for an agency
interface RoomTypeData {
    roomType: string
    count: number
    roomNights: number
    totalPrice: number
    adr: number
    marketAdr: number   // market average ADR for the same room type on the same stay dates
    impact: number      // (agencyAdr - marketAdr) * roomNights
    currency: string    // native currency symbol for display
}

// Agency-level aggregation
interface AgencyRow {
    name: string
    totalCount: number
    cancelCount: number
    roomTypes: RoomTypeData[]
    // Weighted overall impact (sum of all room type impacts)
    totalImpact: number
    totalRevenue: number
    totalRoomNights: number
}

export default function DashboardAgencyPerformanceWidget({ reservations, currency = 'TRY', exchangeRate }: DashboardAgencyPerformanceProps) {
    const [expandedAgency, setExpandedAgency] = useState<string | null>(null)

    const agencyData = useMemo(() => {
        const activeRes = reservations.filter(r => r.status !== 'Cancelled' && r.status !== 'İptal')

        // ── Step 1: Build market-average ADR per (roomType, stayDate, currency) ──
        // Key: `roomType|date|currency` → { totalPrice, roomNights }
        const marketMap = new Map<string, { totalPrice: number; roomNights: number }>()

        activeRes.forEach(r => {
            const roomType = (r.roomType || r.roomTitle || 'Standart').trim()
            const cur = (r.currency || 'EUR').trim()
            const checkIn = new Date((r.checkIn || '').slice(0, 10))
            const checkOut = new Date((r.checkOut || '').slice(0, 10))
            const nights = Math.max(1, r.nights || 1)
            const roomCount = Math.max(1, r.roomCount || 1)
            const perNight = r.totalPrice / nights

            // Spread across each stay night
            for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
                const ds = d.toISOString().split('T')[0]
                const key = `${roomType}|${ds}|${cur}`
                if (!marketMap.has(key)) marketMap.set(key, { totalPrice: 0, roomNights: 0 })
                const m = marketMap.get(key)!
                m.totalPrice += perNight * roomCount
                m.roomNights += roomCount
            }
        })

        const getMarketAdr = (roomType: string, date: string, cur: string) => {
            const data = marketMap.get(`${roomType}|${date}|${cur}`)
            if (!data || data.roomNights === 0) return 0
            return data.totalPrice / data.roomNights
        }

        // ── Step 2: Group by agency → roomType, keeping native currency ──
        // Key: `agencyName|roomType|currency`
        interface Bucket {
            count: number
            roomNights: number
            totalPrice: number
            weightedMarketAdr: number  // accumulated (marketAdr * roomNights)
            currency: string
        }

        const agMap = new Map<string, {
            cancelCount: number
            buckets: Map<string, Bucket>
        }>()

        reservations.forEach(r => {
            const agencyName = (r.agency || 'Bilinmeyen Acente').trim().toUpperCase()
            if (!agMap.has(agencyName)) agMap.set(agencyName, { cancelCount: 0, buckets: new Map() })
            const ag = agMap.get(agencyName)!

            if (r.status === 'Cancelled' || r.status === 'İptal') {
                ag.cancelCount += 1
                return
            }

            const roomType = (r.roomType || r.roomTitle || 'Standart').trim()
            const cur = (r.currency || 'EUR').trim()
            const bKey = `${roomType}|${cur}`
            if (!ag.buckets.has(bKey)) ag.buckets.set(bKey, { count: 0, roomNights: 0, totalPrice: 0, weightedMarketAdr: 0, currency: cur })
            const b = ag.buckets.get(bKey)!

            const checkIn = new Date((r.checkIn || '').slice(0, 10))
            const checkOut = new Date((r.checkOut || '').slice(0, 10))
            const nights = Math.max(1, r.nights || 1)
            const roomCount = Math.max(1, r.roomCount || 1)
            const rn = nights * roomCount
            const perNight = r.totalPrice / nights

            b.count += 1
            b.roomNights += rn
            b.totalPrice += r.totalPrice

            // Accumulate weighted market ADR for impact calculation
            for (let d = new Date(checkIn); d < checkOut; d.setDate(d.getDate() + 1)) {
                const ds = d.toISOString().split('T')[0]
                const mAdr = getMarketAdr(roomType, ds, cur)
                b.weightedMarketAdr += mAdr * roomCount
            }
        })

        // ── Step 3: Build final rows ──
        const rows: AgencyRow[] = []
        agMap.forEach((ag, name) => {
            const roomTypes: RoomTypeData[] = []
            let totalImpact = 0
            let totalRevenue = 0
            let totalRoomNights = 0
            let totalCount = 0

            ag.buckets.forEach(b => {
                const adr = b.roomNights > 0 ? b.totalPrice / b.roomNights : 0
                const marketAdr = b.roomNights > 0 ? b.weightedMarketAdr / b.roomNights : 0
                const impact = (adr - marketAdr) * b.roomNights
                const sym = b.currency === 'EUR' ? '€' : (b.currency === 'USD' ? '$' : '₺')

                const rtKey = b.currency // extract from bucket
                roomTypes.push({
                    roomType: Array.from(ag.buckets.entries()).find(([, v]) => v === b)?.[0]?.split('|')[0] || 'Standart',
                    count: b.count,
                    roomNights: b.roomNights,
                    totalPrice: b.totalPrice,
                    adr: Math.round(adr),
                    marketAdr: Math.round(marketAdr),
                    impact: Math.round(impact),
                    currency: sym
                })

                totalCount += b.count
                totalImpact += impact
                totalRevenue += b.totalPrice
                totalRoomNights += b.roomNights
            })

            // Sort room types by impact desc
            roomTypes.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))

            rows.push({
                name,
                totalCount,
                cancelCount: ag.cancelCount,
                roomTypes,
                totalImpact: Math.round(totalImpact),
                totalRevenue,
                totalRoomNights
            })
        })

        // Sort agencies by totalCount desc
        rows.sort((a, b) => b.totalCount - a.totalCount)
        return rows.slice(0, 15)
    }, [reservations])

    const displaySymbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺')

    return (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl shadow-sm overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 p-2 rounded-lg">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Acente Performansı ve Pazar Etkisi</h3>
                        <p className="text-xs text-slate-500">Oda tipi bazlı ADR analizi · Orijinal döviz cinsinden</p>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-y-auto">
                {agencyData.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                        <Building2 size={48} className="text-slate-200 dark:text-slate-700 mb-3" />
                        <p>Bu tarih aralığında acente verisi bulunamadı.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 hidden sm:table-header-group">
                            <tr>
                                <th className="px-4 py-3 font-medium">Acente Adı</th>
                                <th className="px-4 py-3 font-medium text-center">Rez.</th>
                                <th className="px-4 py-3 font-medium text-center">Oda Tipi</th>
                                <th className="px-4 py-3 font-medium text-right">Oda Gecl.</th>
                                <th className="px-4 py-3 font-medium text-right">Pazar Etkisi</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {agencyData.map((agency, index) => {
                                const isExpanded = expandedAgency === agency.name
                                const hasPositiveImpact = agency.totalImpact > 0
                                const hasNegativeImpact = agency.totalImpact < 0
                                return (
                                    <React.Fragment key={index}>
                                        <tr
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:table-row py-3 sm:py-0 border-b sm:border-b-0 border-slate-100 dark:border-slate-800 last:border-b-0 cursor-pointer"
                                            onClick={() => setExpandedAgency(isExpanded ? null : agency.name)}
                                        >
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Acente:</span>
                                                <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                                                    {agency.name}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-center">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Rez.:</span>
                                                <div className="font-medium text-slate-700 dark:text-slate-300">
                                                    {agency.totalCount}
                                                    {agency.cancelCount > 0 && <span className="text-red-500 text-xs ml-1">({agency.cancelCount} i)</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-center">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Oda Tipi:</span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {agency.roomTypes.length} tip
                                                </span>
                                            </td>
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-right">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Oda Gecl.:</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {agency.totalRoomNights.toLocaleString('tr-TR')}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-right">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Etki:</span>
                                                <div className={`inline-flex items-center gap-1 font-bold ${hasPositiveImpact ? 'text-emerald-600' : hasNegativeImpact ? 'text-red-500' : 'text-slate-500'}`}>
                                                    {hasPositiveImpact ? <TrendingUp size={14} /> : hasNegativeImpact ? <TrendingDown size={14} /> : null}
                                                    <span className="text-xs">{hasPositiveImpact ? '↑ Ortalama+' : hasNegativeImpact ? '↓ Ortalama-' : '—'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right hidden sm:table-cell">
                                                <button className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Expanded: Room Type Breakdown */}
                                        {isExpanded && agency.roomTypes.length > 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-0 bg-slate-50/50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-inner">
                                                    <div className="p-4 pl-6 border-l-4 border-blue-500">
                                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 flex items-center gap-1.5">
                                                            <Bed size={14} />
                                                            {agency.name} — Oda Tipi Bazlı ADR Analizi
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {agency.roomTypes.map((rt, rIdx) => {
                                                                const diff = rt.adr - rt.marketAdr
                                                                const diffPct = rt.marketAdr > 0 ? Math.round((diff / rt.marketAdr) * 100) : 0
                                                                const isAbove = diff > 0
                                                                const isBelow = diff < 0
                                                                return (
                                                                    <div key={rIdx} className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-3">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="font-semibold text-slate-900 dark:text-white text-sm">{rt.roomType}</span>
                                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                                                                isAbove ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                                                : isBelow ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                                                : 'bg-slate-100 text-slate-500'
                                                                            }`}>
                                                                                {isAbove ? '+' : ''}{diffPct}% pazar ort.
                                                                            </span>
                                                                        </div>
                                                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                                                            <div>
                                                                                <p className="text-slate-400 mb-0.5">Rez. Adeti</p>
                                                                                <p className="font-bold text-slate-800 dark:text-white">{rt.count}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-slate-400 mb-0.5">Oda Geceleme</p>
                                                                                <p className="font-bold text-slate-800 dark:text-white">{rt.roomNights}</p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-slate-400 mb-0.5">Acente ADR</p>
                                                                                <p className={`font-bold ${isAbove ? 'text-emerald-600' : isBelow ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>
                                                                                    {rt.currency}{rt.adr.toLocaleString('tr-TR')}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-slate-400 mb-0.5">Pazar ADR</p>
                                                                                <p className="font-bold text-slate-800 dark:text-white">
                                                                                    {rt.currency}{rt.marketAdr.toLocaleString('tr-TR')}
                                                                                </p>
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-slate-400 mb-0.5">Fiyat Etkisi</p>
                                                                                <p className={`font-bold flex items-center gap-1 ${isAbove ? 'text-emerald-600' : isBelow ? 'text-red-500' : 'text-slate-500'}`}>
                                                                                    {isAbove ? <TrendingUp size={12} /> : isBelow ? <TrendingDown size={12} /> : null}
                                                                                    {isAbove ? '+' : ''}{rt.currency}{rt.impact.toLocaleString('tr-TR')}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                        {/* ADR comparison bar */}
                                                                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                                                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                                                                <span>Pazar</span>
                                                                                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden relative">
                                                                                    {/* Market bar — always 100% */}
                                                                                    <div className="absolute inset-0 bg-slate-300 dark:bg-slate-600 rounded-full" />
                                                                                    {/* Agency bar — proportional */}
                                                                                    <div
                                                                                        className={`absolute inset-y-0 left-0 rounded-full ${isAbove ? 'bg-emerald-500' : isBelow ? 'bg-red-400' : 'bg-blue-400'}`}
                                                                                        style={{ width: `${Math.min(100, rt.marketAdr > 0 ? (rt.adr / rt.marketAdr) * 100 : 100)}%` }}
                                                                                    />
                                                                                </div>
                                                                                <span>Acente</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            {agencyData.length > 0 && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 text-center border-t border-slate-100 dark:border-slate-800">
                    <button className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center gap-1">
                        Tüm Acente Raporunu Gör <ArrowRight size={14} />
                    </button>
                </div>
            )}
        </div>
    )
}
