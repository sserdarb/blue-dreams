'use client'

import React, { useState, useEffect } from 'react'
import { Database, RefreshCcw, Clock, AlertTriangle } from 'lucide-react'

export default function ElektraSettingsForm() {
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [ttl, setTtl] = useState<number>(30)

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/admin/settings/elektra-cache')
            const data = await res.json()
            setStatus(data)
            setTtl(data.ttlMinutes || 30)
            setLoading(false)
        } catch (error) {
            console.error('Failed to fetch cache status', error)
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    const handleRefresh = async () => {
        setRefreshing(true)
        try {
            await fetch('/api/admin/settings/elektra-cache', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'refresh' })
            })
            await fetchStatus()
        } catch (error) {
            console.error('Failed to refresh cache', error)
        } finally {
            setRefreshing(false)
        }
    }

    const handleUpdateTtl = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await fetch('/api/admin/settings/elektra-cache', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_ttl', ttlMinutes: ttl })
            })
            await fetchStatus()
        } catch (error) {
            console.error('Failed to update TTL', error)
        }
    }

    if (loading) return <div className="text-slate-500">Yükleniyor...</div>

    return (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 max-w-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Database className="text-blue-500" /> Elektra PMS Veri Senkronizasyonu
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-50 dark:bg-[#0f172a] p-4 rounded-lg border border-slate-100 dark:border-white/5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Önbellek Durumu</p>
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${status?.isStale ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {status?.isStale ? 'Senkronizasyon Gerekli (Eski)' : 'Güncel'}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0f172a] p-4 rounded-lg border border-slate-100 dark:border-white/5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Toplam Rezervasyon (Önbellek)</p>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-lg">
                        {status?.reservationCount || 0}
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#0f172a] p-4 rounded-lg border border-slate-100 dark:border-white/5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Son Güncelleme</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                        {status?.lastUpdated ? new Date(status.lastUpdated).toLocaleString('tr-TR') : 'Hiç güncellenmedi'}
                    </p>
                </div>

                <div className="bg-slate-50 dark:bg-[#0f172a] p-4 rounded-lg border border-slate-100 dark:border-white/5">
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sonraki Planlı Güncelleme</p>
                    <p className="font-medium text-slate-800 dark:text-slate-200 text-sm">
                        {status?.nextRefresh ? new Date(status.nextRefresh).toLocaleString('tr-TR') : '-'}
                    </p>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/10 pt-6">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-slate-400" /> Senkronizasyon Ayarları & Yenileme
                </h3>

                <form onSubmit={handleUpdateTtl} className="flex flex-col sm:flex-row items-end sm:items-center gap-4 mb-6">
                    <div className="flex-1 w-full relative">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">Geçerlilik Süresi (Dakika)</label>
                        <input
                            type="number"
                            min="5"
                            max="1440"
                            value={ttl}
                            onChange={e => setTtl(Number(e.target.value))}
                            className="w-full bg-slate-50 dark:bg-[#0f172a] border border-slate-200 dark:border-white/10 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-white outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <button
                        type="submit"
                        className="bg-slate-800 hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors w-full sm:w-auto"
                    >
                        Süreyi Kaydet
                    </button>
                </form>

                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                        <div>
                            <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Manuel Veri Çekimi</p>
                            <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">Eğer önbellek çok eskiyse rezervasyon verisini Elektra PMS üzerinden şimdi zorla güncelleyebilirsiniz. Dış istek sınırlarına dikkat ediniz.</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 w-full sm:w-auto"
                    >
                        <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
                        {refreshing ? 'Çekiliyor...' : 'Şimdi Senkronize Et'}
                    </button>
                </div>
            </div>
        </div>
    )
}
