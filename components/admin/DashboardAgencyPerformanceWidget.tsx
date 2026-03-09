'use client'

import React, { useMemo, useState } from 'react'
import { Building2, TrendingUp, TrendingDown, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import type { Reservation } from '@/lib/services/elektra'

interface DashboardAgencyPerformanceProps {
    reservations: Reservation[]
    currency?: 'TRY' | 'EUR' | 'USD'
    exchangeRate?: number
}

export default function DashboardAgencyPerformanceWidget({ reservations, currency = 'TRY', exchangeRate }: DashboardAgencyPerformanceProps) {
    const symbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺')
    const usdRate = 35.7

    const convertPrice = (price: number, nativeCurrency: string) => {
        let p = price
        nativeCurrency = (nativeCurrency || 'EUR').trim()

        const rate = exchangeRate || 38.5; // safe fallback for rendering
        if (currency === 'TRY') {
            return nativeCurrency === 'EUR' ? p * rate : (nativeCurrency === 'USD' ? p * usdRate : p)
        } else if (currency === 'EUR') {
            return nativeCurrency === 'TRY' ? p / rate : (nativeCurrency === 'USD' ? (p * usdRate) / rate : p)
        } else if (currency === 'USD') {
            return nativeCurrency === 'TRY' ? p / usdRate : (nativeCurrency === 'EUR' ? (p * rate) / usdRate : p)
        }
        return p
    }

    const [expandedAgency, setExpandedAgency] = useState<string | null>(null)

    // Group reservations by Agency and calculate market impact
    const agencyData = useMemo(() => {
        // 1. Calculate market average per day
        const dailyMarketSum = new Map<string, { revenue: number, roomNights: number }>()
        reservations.forEach(r => {
            if (r.status === 'Cancelled' || r.status === 'İptal') return
            const d = (r.checkIn || '').split('T')[0]
            if (!d) return

            const convertedPrice = convertPrice(r.totalPrice || 0, r.currency || 'EUR')
            const nights = Math.max(1, r.nights || 1)
            const roomCount = Math.max(1, r.roomCount || 1)
            const rn = nights * roomCount

            if (!dailyMarketSum.has(d)) dailyMarketSum.set(d, { revenue: 0, roomNights: 0 })
            const dayData = dailyMarketSum.get(d)!
            dayData.revenue += convertedPrice
            dayData.roomNights += rn
        })

        const getMarketAvgByDate = (d: string) => {
            const data = dailyMarketSum.get(d)
            if (!data || data.roomNights === 0) return 0
            return data.revenue / data.roomNights
        }

        // 2. Aggregate agency performance
        const agencyMap = new Map<string, { count: number; totalRevenue: number; cancelCount: number; roomNights: number, marketImpact: number, reservations: any[] }>()

        reservations.forEach(r => {
            const agencyName = (r.agency || 'Bilinmeyen Acente').trim().toUpperCase()
            if (!agencyMap.has(agencyName)) {
                agencyMap.set(agencyName, { count: 0, totalRevenue: 0, cancelCount: 0, roomNights: 0, marketImpact: 0, reservations: [] })
            }
            const data = agencyMap.get(agencyName)!
            const convertedPrice = convertPrice(r.totalPrice || 0, r.currency || 'EUR')
            const nights = Math.max(1, r.nights || 1)
            const roomCount = Math.max(1, r.roomCount || 1)
            const rn = nights * roomCount
            const dayStr = (r.checkIn || '').split('T')[0]

            if (r.status === 'Cancelled' || r.status === 'İptal') {
                data.cancelCount += 1
            } else {
                data.count += 1
                data.totalRevenue += convertedPrice
                data.roomNights += rn

                let marketAvg = 0
                let impact = 0
                let adr = 0

                if (dayStr) {
                    marketAvg = getMarketAvgByDate(dayStr)
                    adr = rn > 0 ? convertedPrice / rn : 0
                    impact = (adr - marketAvg) * rn
                    data.marketImpact += impact
                }

                data.reservations.push({
                    id: r.id || r.voucherNo,
                    voucherNo: r.voucherNo || '-',
                    checkIn: dayStr,
                    totalPrice: convertedPrice,
                    currency: currency,
                    adr: adr,
                    marketAvg: marketAvg,
                    impact: impact,
                    nights: nights
                })
            }
        })

        // Format to array and sort by total revenue
        return Array.from(agencyMap.entries())
            .map(([name, data]) => ({
                name,
                ...data,
                netRevenue: data.totalRevenue,
                adr: data.roomNights > 0 ? data.totalRevenue / data.roomNights : 0,
                // Sort internal reservations by impact desc to show most impactful first
                reservations: data.reservations.sort((a, b) => b.impact - a.impact)
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10) // Show top 10

    }, [reservations, currency, exchangeRate])

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 p-2 rounded-lg">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Acente Performansı ve Pazar Etkisi</h3>
                        <p className="text-xs text-slate-500">Konaklama tarihindeki pazar ortalamasına (ADR) göre etkisi</p>
                    </div>
                </div>
            </div>

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
                                <th className="px-4 py-3 font-medium text-right">Ort. ADR</th>
                                <th className="px-4 py-3 font-medium text-right">Ortalamaya Etkisi</th>
                                <th className="px-4 py-3 font-medium text-right">Toplam Ciro</th>
                                <th className="px-4 py-3 w-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {agencyData.map((agency, index) => {
                                const isExpanded = expandedAgency === agency.name;
                                return (
                                    <React.Fragment key={index}>
                                        <tr
                                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:table-row py-3 sm:py-0 border-b sm:border-b-0 border-slate-100 dark:border-slate-800 last:border-b-0 cursor-pointer"
                                            onClick={() => setExpandedAgency(isExpanded ? null : agency.name)}
                                        >
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Acente:</span>
                                                <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px]">
                                                    {agency.name}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-center">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Rez. Adeti:</span>
                                                <div className="font-medium text-slate-700 dark:text-slate-300">
                                                    {agency.count}
                                                    {agency.cancelCount > 0 && <span className="text-red-500 text-xs ml-1">({agency.cancelCount} i)</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-right">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Ort. ADR:</span>
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">
                                                    {symbol}{agency.adr.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                </span>
                                            </td>
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-right">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Etki:</span>
                                                <div className={`inline-flex items-center gap-1 font-bold ${agency.marketImpact > 0 ? 'text-emerald-600' : agency.marketImpact < 0 ? 'text-red-500' : 'text-slate-500'}`}>
                                                    {agency.marketImpact > 0 ? <TrendingUp size={14} /> : agency.marketImpact < 0 ? <TrendingDown size={14} /> : null}
                                                    {agency.marketImpact > 0 ? '+' : ''}{symbol}{agency.marketImpact.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                </div>
                                            </td>
                                            <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-right">
                                                <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Ciro:</span>
                                                <div className="font-bold text-slate-900 dark:text-white">
                                                    {symbol}{agency.netRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right hidden sm:table-cell">
                                                <button className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
                                                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                            </td>
                                        </tr>
                                        {isExpanded && agency.reservations.length > 0 && (
                                            <tr>
                                                <td colSpan={6} className="p-0 bg-slate-50/50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-inner">
                                                    <div className="max-h-[300px] overflow-y-auto w-full p-4 pl-8 border-l-4 border-blue-500">
                                                        <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-3">
                                                            {agency.name} — Tutar Etkisi Listesi
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                            {agency.reservations.map((res: any, rIdx: number) => (
                                                                <div key={rIdx} className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-2">
                                                                    <div className="flex justify-between items-start">
                                                                        <div className="font-medium text-slate-900 dark:text-white text-xs">Vouch: {res.voucherNo}</div>
                                                                        <div className={`text-xs font-bold px-1.5 py-0.5 rounded ${res.impact > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'}`}>
                                                                            {res.impact > 0 ? '+' : ''}{symbol}{res.impact.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-[11px] text-slate-500 dark:text-slate-400 grid grid-cols-2 gap-1 mt-1">
                                                                        <div>Giriş: <span className="font-medium text-slate-700 dark:text-slate-300">{new Date(res.checkIn).toLocaleDateString('tr-TR')}</span></div>
                                                                        <div>Gece: <span className="font-medium text-slate-700 dark:text-slate-300">{res.nights}</span></div>
                                                                        <div>Rez. ADR: <span className="font-medium text-slate-700 dark:text-slate-300">{symbol}{res.adr.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span></div>
                                                                        <div>Pazar ADR: <span className="font-medium text-slate-700 dark:text-slate-300">{symbol}{res.marketAvg.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</span></div>
                                                                    </div>
                                                                </div>
                                                            ))}
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
