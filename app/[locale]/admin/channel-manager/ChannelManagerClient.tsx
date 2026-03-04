'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Globe, Settings, RefreshCw, AlertCircle, CheckCircle2,
    CalendarDays, BarChart3, Link as LinkIcon, ArrowRightLeft,
    Search, Filter, Plus, FileText, ChevronRight, TrendingUp,
    DollarSign, BedDouble, Users, AlertTriangle
} from 'lucide-react'

interface PriceEntry {
    roomType: string
    roomTypeId: number
    available: number
    basePrice: number | null
    discountedPrice: number | null
    stopsell: boolean
}

interface ChannelBreakdownItem {
    name: string
    count: number
    revenue: number
}

interface ChannelData {
    priceCalendar: Record<string, PriceEntry[]>
    occupancy: any[]
    channelBreakdown: ChannelBreakdownItem[]
    reservations: any[]
    summary: {
        totalReservations: number
        totalRevenue: number
        averageADR: number
        currency: string
        dateRange: { from: string; to: string }
    }
}

const CHANNEL_COLORS: Record<string, string> = {
    'Booking.com': '#003b95',
    'Expedia': '#fbbf24',
    'Web': '#10b981',
    'Direct': '#8b5cf6',
    'Agency': '#f97316',
    'Tour Operator': '#ec4899',
    'Diğer': '#94a3b8'
}

export default function ChannelManagerClient() {
    const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'channels' | 'logs'>('overview')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<ChannelData | null>(null)
    const [isSyncing, setIsSyncing] = useState(false)
    const [currency, setCurrency] = useState('EUR')

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/channel-manager?currency=${currency}&days=14`)
            const json = await res.json()
            if (json.success) {
                setData(json.data)
                setError(null)
            } else {
                setError(json.error || 'Veri alınamadı')
            }
        } catch (e: any) {
            setError(e.message || 'API hatası')
        } finally {
            setLoading(false)
        }
    }, [currency])

    useEffect(() => { fetchData() }, [fetchData])

    const handleSync = async () => {
        setIsSyncing(true)
        await fetchData()
        setIsSyncing(false)
    }

    const sortedDates = data?.priceCalendar ? Object.keys(data.priceCalendar).sort() : []
    const roomTypes = data?.priceCalendar && sortedDates.length > 0
        ? [...new Set(data.priceCalendar[sortedDates[0]].map(p => p.roomType))]
        : []

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2"><Globe className="text-blue-500" /> Kanal Yöneticisi</h1>
                    <p className="text-sm text-muted-foreground mt-1">Elektra PMS üzerinden gerçek zamanlı fiyat, müsaitlik ve kanal performansı</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="border rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900"
                    >
                        <option value="EUR">€ EUR</option>
                        <option value="TRY">₺ TRY</option>
                        <option value="USD">$ USD</option>
                    </select>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
                        Senkronize Et
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg overflow-x-auto border border-slate-200 dark:border-slate-700">
                {[
                    { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
                    { id: 'pricing', label: 'Fiyat Takvimi', icon: CalendarDays },
                    { id: 'channels', label: 'Kanal Performansı', icon: TrendingUp },
                    { id: 'logs', label: 'Son Rezervasyonlar', icon: FileText },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="flex items-center justify-center py-20 text-slate-500">
                    <RefreshCw size={24} className="animate-spin mr-3" /> Elektra PMS'den veri çekiliyor...
                </div>
            )}

            {error && !loading && (
                <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                    <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                        <AlertCircle size={20} />
                        <div>
                            <p className="font-medium">API Hatası</p>
                            <p className="text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </Card>
            )}

            {!loading && data && (
                <>
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card className="p-5 border-l-4 border-l-blue-500">
                                    <p className="text-sm font-medium text-muted-foreground">Toplam Rezervasyon</p>
                                    <h3 className="text-3xl font-bold mt-2">{data.summary.totalReservations}</h3>
                                    <p className="text-xs text-muted-foreground mt-1">Son 30 gün</p>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-emerald-500">
                                    <p className="text-sm font-medium text-muted-foreground">Toplam Gelir</p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {data.summary.currency === 'EUR' ? '€' : data.summary.currency === 'USD' ? '$' : '₺'}
                                        {data.summary.totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                    </h3>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-purple-500">
                                    <p className="text-sm font-medium text-muted-foreground">Ort. Günlük Fiyat (ADR)</p>
                                    <h3 className="text-3xl font-bold mt-2">
                                        {data.summary.currency === 'EUR' ? '€' : data.summary.currency === 'USD' ? '$' : '₺'}
                                        {data.summary.averageADR.toFixed(0)}
                                    </h3>
                                </Card>
                                <Card className="p-5 border-l-4 border-l-amber-500">
                                    <p className="text-sm font-medium text-muted-foreground">Aktif Kanal</p>
                                    <h3 className="text-3xl font-bold mt-2">{data.channelBreakdown.length}</h3>
                                </Card>
                            </div>

                            {/* Channel Revenue Distribution */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Kanal Gelir Dağılımı</h3>
                                    <div className="space-y-3">
                                        {data.channelBreakdown.map((ch, i) => {
                                            const pct = data.summary.totalRevenue > 0 ? (ch.revenue / data.summary.totalRevenue) * 100 : 0
                                            return (
                                                <div key={i} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium">{ch.name}</span>
                                                        <span className="text-muted-foreground">
                                                            {ch.count} rez. — {data.summary.currency === 'EUR' ? '€' : '₺'}{ch.revenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                                        <div
                                                            className="h-2 rounded-full transition-all"
                                                            style={{
                                                                width: `${pct}%`,
                                                                backgroundColor: CHANNEL_COLORS[ch.name] || '#94a3b8'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        {data.channelBreakdown.length === 0 && (
                                            <p className="text-sm text-muted-foreground italic">Henüz kanal verisi yok.</p>
                                        )}
                                    </div>
                                </Card>

                                <Card className="p-6">
                                    <h3 className="text-lg font-semibold mb-4">Doluluk Oranı (14 Gün)</h3>
                                    <div className="space-y-2">
                                        {data.occupancy.slice(0, 14).map((occ, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className="text-xs text-muted-foreground w-20 shrink-0">
                                                    {new Date(occ.date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                                </span>
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-4 relative overflow-hidden">
                                                    <div
                                                        className={`h-4 rounded-full transition-all ${occ.occupancyRate > 80 ? 'bg-red-500' : occ.occupancyRate > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${occ.occupancyRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-bold w-12 text-right">{occ.occupancyRate.toFixed(0)}%</span>
                                            </div>
                                        ))}
                                        {data.occupancy.length === 0 && (
                                            <p className="text-sm text-muted-foreground italic">Doluluk verisi hesaplanamadı.</p>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}

                    {/* Pricing Calendar Tab */}
                    {activeTab === 'pricing' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Card className="overflow-hidden">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/30 border-b flex justify-between items-center">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <CalendarDays size={18} className="text-blue-500" />
                                        Tarih Bazlı Fiyat ve Müsaitlik
                                    </h3>
                                    <Badge variant="outline" className="text-xs">
                                        {sortedDates.length} gün · {roomTypes.length} oda tipi
                                    </Badge>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                                            <tr>
                                                <th className="p-3 text-left font-medium text-slate-500 sticky left-0 bg-slate-100 dark:bg-slate-800/50 z-10">Tarih</th>
                                                {roomTypes.map(rt => (
                                                    <th key={rt} className="p-3 text-center font-medium text-slate-500 min-w-[140px]">
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <BedDouble size={14} />
                                                            <span className="text-[11px]">{rt}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {sortedDates.map(date => {
                                                const entries = data.priceCalendar[date] || []
                                                const dayName = new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' })
                                                const isWeekend = [0, 6].includes(new Date(date).getDay())
                                                return (
                                                    <tr key={date} className={`hover:bg-slate-50 dark:hover:bg-slate-800/30 ${isWeekend ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
                                                        <td className="p-3 font-medium sticky left-0 bg-white dark:bg-slate-900 z-10 border-r">
                                                            <div className="flex flex-col">
                                                                <span className="text-slate-900 dark:text-white">
                                                                    {new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                                                </span>
                                                                <span className={`text-[10px] uppercase tracking-wider ${isWeekend ? 'text-blue-600 font-bold' : 'text-slate-400'}`}>
                                                                    {dayName}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {roomTypes.map(rt => {
                                                            const entry = entries.find(e => e.roomType === rt)
                                                            if (!entry) return <td key={rt} className="p-3 text-center text-slate-300">—</td>
                                                            return (
                                                                <td key={rt} className="p-3 text-center">
                                                                    {entry.stopsell ? (
                                                                        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px]">
                                                                            <AlertTriangle size={10} className="mr-1" /> STOPSELL
                                                                        </Badge>
                                                                    ) : (
                                                                        <div className="flex flex-col items-center gap-0.5">
                                                                            <span className="font-bold text-slate-900 dark:text-white">
                                                                                {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '₺'}
                                                                                {(entry.discountedPrice || entry.basePrice || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                                            </span>
                                                                            <span className={`text-[10px] ${entry.available <= 2 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                                                                                {entry.available} oda
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </td>
                                                            )
                                                        })}
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                {sortedDates.length === 0 && (
                                    <div className="p-12 text-center text-muted-foreground">
                                        <CalendarDays size={40} className="mx-auto mb-4 opacity-30" />
                                        <p>Fiyat verisi bulunamadı.</p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* Channel Performance Tab */}
                    {activeTab === 'channels' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.channelBreakdown.map((ch, i) => {
                                    const pct = data.summary.totalRevenue > 0 ? (ch.revenue / data.summary.totalRevenue) * 100 : 0
                                    const avgPerRes = ch.count > 0 ? ch.revenue / ch.count : 0
                                    return (
                                        <Card key={i} className="p-5 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-3 h-10 rounded-full"
                                                        style={{ backgroundColor: CHANNEL_COLORS[ch.name] || '#94a3b8' }}
                                                    />
                                                    <div>
                                                        <h3 className="font-bold text-lg">{ch.name}</h3>
                                                        <p className="text-xs text-muted-foreground">{pct.toFixed(1)}% gelir payı</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200">
                                                    <CheckCircle2 size={12} className="mr-1" /> Aktif
                                                </Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-y-3 text-sm">
                                                <div className="text-muted-foreground">Rezervasyon:</div>
                                                <div className="font-medium text-right">{ch.count}</div>
                                                <div className="text-muted-foreground">Toplam Gelir:</div>
                                                <div className="font-medium text-right">
                                                    {data.summary.currency === 'EUR' ? '€' : '₺'}{ch.revenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                </div>
                                                <div className="text-muted-foreground">Ort. Rez. Tutarı:</div>
                                                <div className="font-medium text-right">
                                                    {data.summary.currency === 'EUR' ? '€' : '₺'}{avgPerRes.toFixed(0)}
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                                {data.channelBreakdown.length === 0 && (
                                    <Card className="p-8 col-span-full text-center text-muted-foreground">
                                        Henüz kanal verisi bulunmuyor.
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recent Reservations Tab */}
                    {activeTab === 'logs' && (
                        <Card className="overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="p-4 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
                                <h3 className="font-semibold">Son Rezervasyonlar (Elektra PMS)</h3>
                                <Badge variant="outline">{data.reservations.length} kayıt</Badge>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-100 dark:bg-slate-800/50">
                                        <tr>
                                            <th className="p-4 py-3 font-medium">Voucher</th>
                                            <th className="p-4 py-3 font-medium">Kanal</th>
                                            <th className="p-4 py-3 font-medium">Oda Tipi</th>
                                            <th className="p-4 py-3 font-medium">Giriş</th>
                                            <th className="p-4 py-3 font-medium">Çıkış</th>
                                            <th className="p-4 py-3 font-medium text-right">Tutar</th>
                                            <th className="p-4 py-3 font-medium">Ülke</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.reservations.map((res) => (
                                            <tr key={res.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                                <td className="p-4 py-3 font-mono text-xs">{res.voucherNo || `#${res.id}`}</td>
                                                <td className="p-4 py-3">
                                                    <Badge variant="outline" className="text-[10px]" style={{
                                                        borderColor: CHANNEL_COLORS[res.channel] || '#94a3b8',
                                                        color: CHANNEL_COLORS[res.channel] || '#94a3b8'
                                                    }}>
                                                        {res.channel}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 py-3 text-muted-foreground">{res.roomType}</td>
                                                <td className="p-4 py-3 whitespace-nowrap">
                                                    {new Date(res.checkIn).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                                </td>
                                                <td className="p-4 py-3 whitespace-nowrap">
                                                    {new Date(res.checkOut).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                                                </td>
                                                <td className="p-4 py-3 text-right font-medium">
                                                    {res.currency === 'EUR' ? '€' : res.currency === 'USD' ? '$' : '₺'}
                                                    {res.totalPrice.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}
                                                </td>
                                                <td className="p-4 py-3 text-xs">{res.country || '—'}</td>
                                            </tr>
                                        ))}
                                        {data.reservations.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="p-8 text-center text-muted-foreground italic">Rezervasyon bulunamadı.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
