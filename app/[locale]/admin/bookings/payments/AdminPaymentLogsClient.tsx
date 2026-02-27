'use client'

import { useEffect, useState } from 'react'
import { FileText, RefreshCcw, Search, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface PaymentLog {
    id: string
    bookingId: string
    provider: string
    action: string
    status: string
    amount: number
    currency: string
    errorMessage: string | null
    ipAddress: string | null
    createdAt: string
    booking?: { referenceId: string; guestName: string; status: string }
}

export default function AdminPaymentLogsClient() {
    const [logs, setLogs] = useState<PaymentLog[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState('all')
    const [providerFilter, setProviderFilter] = useState('all')

    useEffect(() => {
        fetchLogs()
    }, [page, statusFilter, providerFilter])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '50', status: statusFilter, provider: providerFilter })
            const res = await fetch(`/api/admin/payment-logs?${params}`)
            const data = await res.json()
            setLogs(data.logs || [])
            setTotal(data.total || 0)
        } catch { }
        setLoading(false)
    }

    const fmtDateTime = (d: string) => new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    const fmtPrice = (n: number) => n.toLocaleString('tr-TR', { maximumFractionDigits: 2 })

    const statusColor = (s: string) => {
        if (s === 'success') return 'bg-emerald-100 text-emerald-800'
        if (s === 'failed') return 'bg-red-100 text-red-800'
        return 'bg-amber-100 text-amber-800'
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText size={24} className="text-purple-500" />
                        Ödeme Logları
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{total} işlem kaydı</p>
                </div>
                <div className="flex items-center gap-3">
                    <select value={providerFilter} onChange={e => { setProviderFilter(e.target.value); setPage(1) }}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-white">
                        <option value="all">Tüm Sağlayıcılar</option>
                        <option value="iyzico">iyzico</option>
                        <option value="paytr">PayTR</option>
                    </select>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                        className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-slate-800 dark:text-white">
                        <option value="all">Tüm Durumlar</option>
                        <option value="success">Başarılı</option>
                        <option value="failed">Başarısız</option>
                        <option value="pending">Beklemede</option>
                    </select>
                    <button onClick={fetchLogs} className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors">
                        <RefreshCcw size={16} />
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">
                        <Search size={40} className="mx-auto mb-4 opacity-50" />
                        <p>Henüz ödeme logu bulunmuyor</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Tarih</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Referans</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Misafir</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Sağlayıcı</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">İşlem</th>
                                    <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Tutar</th>
                                    <th className="text-center px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Durum</th>
                                    <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Hata</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">{fmtDateTime(log.createdAt)}</td>
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-cyan-600">{log.booking?.referenceId || '—'}</td>
                                        <td className="px-4 py-3 text-slate-700 dark:text-slate-300 text-xs">{log.booking?.guestName || '—'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${log.provider === 'iyzico' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                                                {log.provider}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400 text-xs">{log.action}</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                                            {log.currency === 'TRY' ? '₺' : log.currency === 'EUR' ? '€' : '$'}{fmtPrice(log.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(log.status)}`}>
                                                {log.status === 'success' ? <CheckCircle2 size={10} /> : log.status === 'failed' ? <XCircle size={10} /> : <Clock size={10} />}
                                                {log.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-red-500 max-w-[200px] truncate">{log.errorMessage || '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {total > 50 && (
                <div className="flex items-center justify-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50">Önceki</button>
                    <span className="text-sm text-slate-500">Sayfa {page}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={logs.length < 50} className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg disabled:opacity-50">Sonraki</button>
                </div>
            )}
        </div>
    )
}
