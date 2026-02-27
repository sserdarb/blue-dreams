'use client'

import { useEffect, useState } from 'react'
import { Calendar, CreditCard, CheckCircle2, XCircle, Clock, RefreshCcw, Search } from 'lucide-react'

interface Booking {
    id: string
    referenceId: string
    status: string
    guestName: string
    guestEmail: string
    guestPhone: string
    roomType: string
    checkIn: string
    checkOut: string
    nights: number
    adults: number
    children: number
    totalPrice: number
    currency: string
    paymentMethod: string | null
    elektraStatus: string | null
    elektraResId: string | null
    createdAt: string
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Beklemede', color: 'bg-amber-100 text-amber-800', icon: Clock },
    paid: { label: 'Ödendi', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
    confirmed: { label: 'Onaylandı', color: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
    failed: { label: 'Başarısız', color: 'bg-red-100 text-red-800', icon: XCircle },
    cancelled: { label: 'İptal', color: 'bg-gray-100 text-gray-800', icon: XCircle },
    refunded: { label: 'İade', color: 'bg-purple-100 text-purple-800', icon: RefreshCcw },
}

export default function AdminBookingsClient() {
    const [bookings, setBookings] = useState<Booking[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        fetchBookings()
    }, [page, statusFilter])

    const fetchBookings = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '20', status: statusFilter })
            const res = await fetch(`/api/admin/bookings?${params}`)
            const data = await res.json()
            setBookings(data.bookings || [])
            setTotal(data.total || 0)
        } catch { }
        setLoading(false)
    }

    const fmtDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
    const fmtPrice = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <CreditCard size={24} className="text-cyan-500" />
                        Online Rezervasyonlar
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{total} kayıt bulundu</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
                        className="flex-1 sm:flex-none px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-white"
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="pending">Beklemede</option>
                        <option value="paid">Ödendi</option>
                        <option value="confirmed">Onaylandı</option>
                        <option value="failed">Başarısız</option>
                        <option value="cancelled">İptal</option>
                    </select>
                    <button onClick={fetchBookings} className="p-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 transition-colors shrink-0">
                        <RefreshCcw size={16} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <Search size={40} className="mx-auto mb-4 opacity-50" />
                        <p>Henüz online rezervasyon bulunmuyor</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Referans</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Misafir</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Oda</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Tarih</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Tutar</th>
                                    <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Durum</th>
                                    <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">PMS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map((b) => {
                                    const st = STATUS_MAP[b.status] || STATUS_MAP.pending
                                    return (
                                        <tr key={b.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3 font-mono text-xs font-bold text-cyan-600">{b.referenceId}</td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-slate-900 dark:text-white">{b.guestName}</p>
                                                <p className="text-xs text-slate-400">{b.guestEmail}</p>
                                            </td>
                                            <td className="px-4 py-3 text-slate-700 dark:text-slate-300">{b.roomType}</td>
                                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">
                                                {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}<br />
                                                <span className="text-slate-400">{b.nights} gece</span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white">
                                                ₺{fmtPrice(b.totalPrice)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                                                    <st.icon size={12} />
                                                    {st.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {b.elektraStatus === 'synced' ? (
                                                    <span className="text-emerald-600 text-xs font-medium">✓ Senkron</span>
                                                ) : b.elektraStatus === 'failed' ? (
                                                    <span className="text-red-500 text-xs font-medium">✕ Hata</span>
                                                ) : (
                                                    <span className="text-slate-400 text-xs">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {total > 20 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50">Önceki</button>
                    <span className="text-sm text-slate-500">Sayfa {page}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={bookings.length < 20} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50">Sonraki</button>
                </div>
            )}
        </div>
    )
}
