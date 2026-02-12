'use client'

import { useState, useMemo } from 'react'
import { Calendar, Search, ChevronLeft, ChevronRight, Eye, Check, X, Clock, Download, RefreshCw } from 'lucide-react'

interface ReservationRow {
    id: number
    voucherNo: string
    guestName: string
    contactEmail: string | null
    contactPhone: string | null
    agency: string
    channel: string
    roomType: string
    boardType: string
    rateType: string
    checkIn: string
    checkOut: string
    nights: number
    totalPrice: number
    paidPrice: number
    currency: string
    roomCount: number
    status: string
    saleDate: string
    lastUpdate: string
    nationality: string
    dailyAverage: number
}

const CHANNELS = ['all', 'OTA', 'Call Center', 'Tur Operatörü', 'Website', 'Direkt']
const STATUSES = ['all', 'Reservation', 'InHouse', 'CheckOut', 'Waiting']

const CHANNEL_COLORS: Record<string, string> = {
    'OTA': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'Call Center': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Tur Operatörü': 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    'Website': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'Direkt': 'bg-rose-500/20 text-rose-400 border-rose-500/30',
}

function formatCurrency(amount: number, currency: string = 'TRY'): string {
    const sym = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '₺'
    return `${sym}${amount.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

interface Props {
    initialData: ReservationRow[]
    error: string | null
}

export default function ReservationsClient({ initialData, error }: Props) {
    const [channel, setChannel] = useState('all')
    const [status, setStatus] = useState('all')
    const [search, setSearch] = useState('')
    const [dateRange, setDateRange] = useState({ start: '', end: '' })
    const [priceRange, setPriceRange] = useState({ min: '', max: '' })
    const [page, setPage] = useState(1)
    const [selectedRes, setSelectedRes] = useState<ReservationRow | null>(null)
    const limit = 50

    // Client-side filtering
    const filtered = useMemo(() => {
        let data = initialData

        if (channel !== 'all') {
            data = data.filter(r => r.channel === channel)
        }

        if (status !== 'all') {
            data = data.filter(r => r.status === status)
        }

        if (dateRange.start) data = data.filter(r => r.checkIn >= dateRange.start)
        if (dateRange.end) data = data.filter(r => r.checkIn <= dateRange.end)

        if (priceRange.min && !isNaN(parseFloat(priceRange.min))) {
            data = data.filter(r => r.totalPrice >= parseFloat(priceRange.min))
        }
        if (priceRange.max && !isNaN(parseFloat(priceRange.max))) {
            data = data.filter(r => r.totalPrice <= parseFloat(priceRange.max))
        }

        if (search.trim()) {
            const q = search.toLowerCase()
            data = data.filter(r =>
                r.guestName.toLowerCase().includes(q) ||
                r.voucherNo.toLowerCase().includes(q) ||
                r.agency.toLowerCase().includes(q)
            )
        }

        return data
    }, [initialData, channel, status, search, dateRange, priceRange])

    // Stats
    const totalRevenue = useMemo(() =>
        filtered.reduce((sum, r) => sum + (r.currency === 'TRY' ? r.totalPrice : r.totalPrice * 38), 0),
        [filtered]
    )

    const channelSummary = useMemo(() => {
        const summary: Record<string, { count: number; revenue: number }> = {}
        for (const r of filtered) {
            if (!summary[r.channel]) summary[r.channel] = { count: 0, revenue: 0 }
            summary[r.channel].count++
            summary[r.channel].revenue += r.currency === 'TRY' ? r.totalPrice : r.totalPrice * 38
        }
        return summary
    }, [filtered])

    // Pagination
    const totalPages = Math.ceil(filtered.length / limit)
    const paginated = filtered.slice((page - 1) * limit, page * limit)

    // CSV Export
    const exportCSV = () => {
        if (!filtered.length) return
        const headers = ['Voucher No', 'Misafir', 'Uyruk', 'Acente', 'Kanal', 'Oda Tipi', 'Pansiyon', 'Giriş', 'Çıkış', 'Gece', 'Tutar', 'Günlük Ort.', 'Döviz', 'Durum', 'Satış Tarihi']
        const rows = filtered.map(r => [
            r.voucherNo, r.guestName, r.nationality, r.agency, r.channel, r.roomType, r.boardType,
            r.checkIn, r.checkOut, r.nights, r.totalPrice, r.dailyAverage, r.currency, r.status, r.saleDate
        ])
        const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n')
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `rezervasyonlar_son30gun.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    const getStatusBadge = (s: string) => {
        switch (s) {
            case 'Reservation':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded"><Check size={12} /> Onaylı</span>
            case 'Waiting':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded"><Clock size={12} /> Beklemede</span>
            case 'InHouse':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs font-medium rounded"><Check size={12} /> Konaklamada</span>
            case 'CheckOut':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-medium rounded"><Check size={12} /> Çıkış Yaptı</span>
            case 'Cancelled':
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded"><X size={12} /> İptal</span>
            default:
                return <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-500/20 text-slate-400 text-xs font-medium rounded">{s}</span>
        }
    }

    if (error) {
        return (
            <div className="p-12 text-center">
                <p className="text-red-400 text-lg">{error}</p>
                <p className="text-slate-500 mt-2">Lütfen sayfayı yenileyin</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        Rezervasyonlar
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full font-medium">Canlı</span>
                    </h1>
                    <p className="text-slate-400 mt-1">Elektra PMS — Son 30 gün satış verileri ({initialData.length} kayıt)</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={exportCSV} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-white/10">
                        <Download size={16} /> CSV İndir
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-slate-500 text-xs uppercase mb-1">Toplam Rezervasyon</p>
                    <p className="text-2xl font-bold text-white">{filtered.length.toLocaleString('tr-TR')}</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <p className="text-slate-500 text-xs uppercase mb-1">Toplam Gelir (TRY)</p>
                    <p className="text-2xl font-bold text-emerald-400">₺{Math.round(totalRevenue).toLocaleString('tr-TR')}</p>
                </div>
                {Object.entries(channelSummary).sort(([, a], [, b]) => b.count - a.count).slice(0, 2).map(([ch, v]) => (
                    <div key={ch} className="bg-white/5 border border-white/10 rounded-xl p-4">
                        <p className="text-slate-500 text-xs uppercase mb-1">{ch}</p>
                        <p className="text-xl font-bold text-white">{v.count} <span className="text-sm text-slate-400">rez</span></p>
                        <p className="text-slate-500 text-xs">₺{Math.round(v.revenue).toLocaleString('tr-TR')}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={channel}
                        onChange={e => { setChannel(e.target.value); setPage(1) }}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                        {CHANNELS.map(ch => (
                            <option key={ch} value={ch}>{ch === 'all' ? 'Tüm Kanallar' : ch}</option>
                        ))}
                    </select>

                    <select
                        value={status}
                        onChange={e => { setStatus(e.target.value); setPage(1) }}
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500"
                    >
                        {STATUSES.map(s => (
                            <option key={s} value={s}>
                                {s === 'all' ? 'Tüm Durumlar' : s === 'Reservation' ? 'Onaylı' : s === 'InHouse' ? 'Konaklamada' : s === 'CheckOut' ? 'Çıkış' : 'Beklemede'}
                            </option>
                        ))}
                    </select>

                    {/* Date Range */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
                        <input
                            type="date"
                            className="bg-transparent text-white text-sm outline-none px-2 py-1"
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                        />
                        <span className="text-slate-500">-</span>
                        <input
                            type="date"
                            className="bg-transparent text-white text-sm outline-none px-2 py-1"
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                        />
                    </div>

                    {/* Price Range */}
                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1">
                        <input
                            type="number"
                            placeholder="Min TL"
                            className="bg-transparent text-white text-sm outline-none px-2 py-1 w-20"
                            value={priceRange.min}
                            onChange={e => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        />
                        <span className="text-slate-500">-</span>
                        <input
                            type="number"
                            placeholder="Max TL"
                            className="bg-transparent text-white text-sm outline-none px-2 py-1 w-20"
                            value={priceRange.max}
                            onChange={e => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        />
                    </div>

                    <div className="flex-1 min-w-[200px] relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Misafir, voucher, acente..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1) }}
                            className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500"
                        />
                    </div>
                </div>
            </div>

            {/* Channel Summary Pills */}
            {Object.keys(channelSummary).length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {Object.entries(channelSummary)
                        .sort(([, a], [, b]) => b.count - a.count)
                        .map(([ch, v]) => (
                            <button
                                key={ch}
                                onClick={() => { setChannel(channel === ch ? 'all' : ch); setPage(1) }}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${channel === ch
                                    ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500/50'
                                    : CHANNEL_COLORS[ch] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                    }`}
                            >
                                {ch}
                                <span className="opacity-70">{v.count}</span>
                            </button>
                        ))
                    }
                </div>
            )}

            {/* Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                {paginated.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-slate-400">Bu filtrelere uygun rezervasyon bulunamadı</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Voucher</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Misafir / Uyruk</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Acente / Kanal</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Oda</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Giriş</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Çıkış</th>
                                    <th className="text-right py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Tutar</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Satış</th>
                                    <th className="text-left py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest">Durum</th>
                                    <th className="text-right py-3 px-4 text-slate-500 text-xs font-medium uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((res, i) => (
                                    <tr
                                        key={`${res.id}-${i}`}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <p className="text-white font-mono text-sm">{res.voucherNo || `#${res.id}`}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-white text-sm">{res.guestName}</p>
                                            <p className="text-slate-500 text-xs">{res.nationality} · {res.roomCount} oda · {res.nights} gece</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-white text-sm">{res.agency}</p>
                                            <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium ${CHANNEL_COLORS[res.channel] || 'bg-slate-500/20 text-slate-400'}`}>
                                                {res.channel}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-white text-sm">{res.roomType}</p>
                                            <p className="text-slate-500 text-xs">{res.boardType}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-white text-sm">{res.checkIn}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-white text-sm">{res.checkOut}</p>
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <p className="text-white font-medium text-sm">{formatCurrency(res.totalPrice, res.currency)}</p>
                                            {res.paidPrice > 0 && res.paidPrice < res.totalPrice && (
                                                <p className="text-emerald-400 text-xs">{formatCurrency(res.paidPrice, res.currency)} ödendi</p>
                                            )}
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-slate-400 text-sm">{res.saleDate}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            {getStatusBadge(res.status)}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <button
                                                onClick={() => setSelectedRes(res)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <p className="text-slate-500 text-sm">
                        {filtered.length.toLocaleString('tr-TR')} kayıttan {((page - 1) * limit) + 1}–{Math.min(page * limit, filtered.length)} gösteriliyor
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-30"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const start = Math.max(1, Math.min(page - 2, totalPages - 4))
                            const p = start + i
                            if (p > totalPages) return null
                            return (
                                <button
                                    key={p}
                                    onClick={() => setPage(p)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-cyan-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                                >
                                    {p}
                                </button>
                            )
                        })}
                        <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className="p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors disabled:opacity-30"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRes && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setSelectedRes(null)}>
                    <div
                        className="bg-[#1e293b] border border-white/10 rounded-xl max-w-lg w-full p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-white">{selectedRes.voucherNo || `#${selectedRes.id}`}</h3>
                                <p className="text-slate-400 text-sm mt-1">{selectedRes.agency} · {selectedRes.channel}</p>
                            </div>
                            <button onClick={() => setSelectedRes(null)} className="text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Misafir</p>
                                    <p className="text-white">{selectedRes.guestName}</p>
                                    <p className="text-slate-400 text-xs">{selectedRes.nationality}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Durum</p>
                                    {getStatusBadge(selectedRes.status)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">E-posta</p>
                                    <p className="text-white text-sm">{selectedRes.contactEmail || 'Belirtilmemiş'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Telefon</p>
                                    <p className="text-white text-sm">{selectedRes.contactPhone || 'Belirtilmemiş'}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Giriş</p>
                                    <p className="text-white">{selectedRes.checkIn}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Çıkış</p>
                                    <p className="text-white">{selectedRes.checkOut}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Gece</p>
                                    <p className="text-white">{selectedRes.nights} gece</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Oda Tipi</p>
                                    <p className="text-white">{selectedRes.roomType}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Pansiyon</p>
                                    <p className="text-white">{selectedRes.boardType}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Oda Sayısı</p>
                                    <p className="text-white">{selectedRes.roomCount}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Satış Tarihi</p>
                                    <p className="text-white">{selectedRes.saleDate}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 text-xs uppercase mb-1">Rate Tipi</p>
                                    <p className="text-white">{selectedRes.rateType}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-sm">Toplam Tutar</p>
                                        {selectedRes.paidPrice > 0 && (
                                            <p className="text-emerald-400 text-xs mt-1">{formatCurrency(selectedRes.paidPrice, selectedRes.currency)} ödendi</p>
                                        )}
                                    </div>
                                    <p className="text-2xl font-bold text-white">{formatCurrency(selectedRes.totalPrice, selectedRes.currency)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
