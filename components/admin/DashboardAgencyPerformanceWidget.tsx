import React, { useMemo } from 'react'
import { Building2, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import type { Reservation } from '@/lib/services/elektra'

interface DashboardAgencyPerformanceProps {
    reservations: Reservation[]
    currency?: 'TRY' | 'EUR' | 'USD'
    exchangeRate?: number
}

export default function DashboardAgencyPerformanceWidget({ reservations, currency = 'TRY', exchangeRate = 38.5 }: DashboardAgencyPerformanceProps) {
    const symbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺')
    const usdRate = 35.7

    const convertPrice = (price: number, nativeCurrency: string) => {
        let p = price
        nativeCurrency = (nativeCurrency || 'EUR').trim()
        if (currency === 'TRY') {
            return nativeCurrency === 'EUR' ? p * exchangeRate : (nativeCurrency === 'USD' ? p * usdRate : p)
        } else if (currency === 'EUR') {
            return nativeCurrency === 'TRY' ? p / exchangeRate : (nativeCurrency === 'USD' ? (p * usdRate) / exchangeRate : p)
        } else if (currency === 'USD') {
            return nativeCurrency === 'TRY' ? p / usdRate : (nativeCurrency === 'EUR' ? (p * exchangeRate) / usdRate : p)
        }
        return p
    }

    // Group reservations by Agency
    const agencyData = useMemo(() => {
        const agencyMap = new Map<string, { count: number; totalRevenue: number; cancelCount: number; cancelRevenue: number; roomNights: number }>()

        reservations.forEach(r => {
            const agencyName = (r.agency || 'Bilinmeyen Acente').trim().toUpperCase()
            if (!agencyMap.has(agencyName)) {
                agencyMap.set(agencyName, { count: 0, totalRevenue: 0, cancelCount: 0, cancelRevenue: 0, roomNights: 0 })
            }
            const data = agencyMap.get(agencyName)!
            const convertedPrice = convertPrice(r.totalPrice || 0, r.currency || 'EUR')
            const nights = Math.max(1, r.nights || 1)
            const roomCount = Math.max(1, r.roomCount || 1)

            if (r.status === 'Cancelled' || r.status === 'İptal') {
                data.cancelCount += 1
                data.cancelRevenue += convertedPrice
            } else {
                data.count += 1
                data.totalRevenue += convertedPrice
                data.roomNights += (nights * roomCount)
            }
        })

        // Format to array and sort by total revenue (highest first)
        return Array.from(agencyMap.entries())
            .map(([name, data]) => ({
                name,
                ...data,
                // Net is revenue minus cancel revenue (if you just want pure revenue contribution)
                netRevenue: data.totalRevenue, // Adjust if you want netRevenue = total - cancelled
                adr: data.roomNights > 0 ? data.totalRevenue / data.roomNights : 0
            }))
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 10) // Show top 10 agencies

    }, [reservations, currency, exchangeRate])

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400 p-2 rounded-lg">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">Acente Performans Analizi</h3>
                        <p className="text-xs text-slate-500">En çok ciro üreten acenteler</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
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
                                <th className="px-4 py-3 font-medium text-center">Rez. Adeti</th>
                                <th className="px-4 py-3 font-medium text-center">İptal</th>
                                <th className="px-4 py-3 font-medium text-center">Room Night</th>
                                <th className="px-4 py-3 font-medium text-right">Ort. ADR</th>
                                <th className="px-4 py-3 font-medium text-right">Ciro ({symbol})</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                            {agencyData.map((agency, index) => (
                                <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col sm:table-row py-3 sm:py-0 border-b sm:border-b-0 border-slate-100 dark:border-slate-800 last:border-b-0">
                                    <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell">
                                        <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Acente Adı:</span>
                                        <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                                            {agency.name}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-center">
                                        <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Rez. Adeti:</span>
                                        <div className="inline-flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                            {agency.count}
                                        </div>
                                    </td>
                                    <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-center">
                                        <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">İptal:</span>
                                        {agency.cancelCount > 0 ? (
                                            <span className="text-red-500 text-xs font-semibold bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded">
                                                {agency.cancelCount}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </td>
                                    <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-center">
                                        <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Room Night:</span>
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">{agency.roomNights} RN</span>
                                    </td>
                                    <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-right">
                                        <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Ort. ADR:</span>
                                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                                            {symbol}{agency.adr.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:py-3 py-1 flex items-center justify-between sm:table-cell text-right">
                                        <span className="sm:hidden text-xs text-slate-400 font-medium uppercase">Ciro:</span>
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {symbol}{agency.netRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                        </div>
                                    </td>
                                </tr>
                            ))}
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
