import React from 'react'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Reservation } from '@/lib/services/elektra'

interface DashboardLastReservationsProps {
    reservations: Reservation[]
    locale?: string
    currency?: 'TRY' | 'EUR' | 'USD'
    exchangeRate?: number
}

export default function DashboardLastReservationsWidget({ reservations, locale = 'tr', currency = 'TRY', exchangeRate = 38.5 }: DashboardLastReservationsProps) {
    if (!reservations || reservations.length === 0) return null

    const usdRate = 35.7
    const symbol = currency === 'EUR' ? '€' : (currency === 'USD' ? '$' : '₺')

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

    const convertedReservations = reservations.map(r => ({
        ...r,
        convertedDailyAverage: convertPrice(r.dailyAverage, r.currency),
        convertedTotalPrice: convertPrice(r.totalPrice, r.currency)
    }))

    // Calculate the baseline ADR for the same date range 
    // (using the provided reservations as a representative sample for ADR average)
    const validReservations = convertedReservations.filter(r => r.convertedDailyAverage > 0 && r.status !== 'Cancelled')
    const totalAdr = validReservations.reduce((sum, r) => sum + r.convertedDailyAverage, 0)
    const baselineAdr = validReservations.length > 0 ? totalAdr / validReservations.length : 0

    // Determine performance for each reservation
    const analyzedReservations = convertedReservations.map(res => {
        const isHigh = res.convertedDailyAverage > baselineAdr
        return {
            ...res,
            isHigh
        }
    })

    // Calculate which agencies are doing best (most green) and worst (most red)
    const agencyPerformance: Record<string, { green: number, red: number }> = {}
    analyzedReservations.forEach(res => {
        const agencyName = res.agency || res.channel || 'Bilinmiyor'
        if (!agencyPerformance[agencyName]) agencyPerformance[agencyName] = { green: 0, red: 0 }
        if (res.isHigh) agencyPerformance[agencyName].green++
        else agencyPerformance[agencyName].red++
    })

    let bestAgency = { name: '-', score: -1 }
    let worstAgency = { name: '-', score: -1 }

    Object.entries(agencyPerformance).forEach(([name, stats]) => {
        if (stats.green > bestAgency.score) {
            bestAgency = { name, score: stats.green }
        }
        if (stats.red > worstAgency.score) {
            worstAgency = { name, score: stats.red }
        }
    })

    return (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Son Rezervasyonlar</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Canlı
                    </span>
                </div>
                <Link href={`/${locale}/admin/reservations`} className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    Tümünü Gör <ArrowRight size={16} />
                </Link>
            </div>

            {/* Performance Summary Banner */}
            {validReservations.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">En Başarılı Acente (Yüksek ADR)</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{bestAgency.name} <span className="opacity-70 text-xs font-normal">({bestAgency.score} rez)</span></p>
                        </div>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-lg p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 flex items-center justify-center shrink-0">
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase tracking-wider">Gelişime Açık Acente (Düşük ADR)</p>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{worstAgency.name} <span className="opacity-70 text-xs font-normal">({worstAgency.score} rez)</span></p>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-y border-slate-200 dark:border-white/10">
                        <tr>
                            <th className="px-4 py-3 font-medium">Voucher & İsim</th>
                            <th className="px-4 py-3 font-medium">Acente / Kanal</th>
                            <th className="px-4 py-3 font-medium">Tarih</th>
                            <th className="px-4 py-3 font-medium">Oda & Gece</th>
                            <th className="px-4 py-3 font-medium text-right">Günlük Ort. (ADR)</th>
                            <th className="px-4 py-3 font-medium text-right">Performans</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {analyzedReservations.map((res) => {
                            const name = res.guests?.[0] ? `${res.guests[0].name} ${res.guests[0].surname}` : res.contactName || 'Belirtilmemiş'
                            const formatter = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: currency, maximumFractionDigits: 0, minimumFractionDigits: 0 })
                            const entryDate = (res as any).createdAt || (res as any).reservationDate || (res as any).lastUpdate
                            const entryTime = entryDate ? new Date(entryDate).toLocaleString('tr-TR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' }) : ''

                            return (
                                <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer relative group">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-800 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            <Link href={`/${locale}/admin/reservations`} className="absolute inset-0 z-10" />
                                            {name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            {res.voucherNo || `#${res.id}`} • {res.channel}
                                            {entryTime && <span className="ml-1">• Giriş: {entryTime}</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-700 dark:text-slate-300">{res.agency}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{res.channel}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-slate-700 dark:text-slate-300">{new Date(res.checkIn).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })} - {new Date(res.checkOut).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="text-slate-700 dark:text-slate-300">{res.roomType}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">{res.nights} Gece, {res.roomCount} Oda</div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="font-bold text-slate-900 dark:text-white">
                                            {formatter.format(res.convertedDailyAverage)}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-0.5">Top: {formatter.format(res.convertedTotalPrice)}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {res.status === 'Cancelled' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                                İptal
                                            </span>
                                        ) : res.isHigh ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                <TrendingUp size={12} /> Yüksek
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                                <TrendingDown size={12} /> Alçak
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
                <div>Hesaplanan Ortalama ADR: <strong className="text-slate-700 dark:text-slate-300">{(baselineAdr || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}</strong></div>
                <div>Satırların üzerine tıklayarak tüm rezervasyonlar listesine gidebilirsiniz.</div>
            </div>
        </div>
    )
}
