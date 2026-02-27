'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Info, Calendar } from 'lucide-react'

export default function DashboardFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [showInfo, setShowInfo] = useState(false)

    useEffect(() => {
        const urlFrom = searchParams.get('from')
        const urlTo = searchParams.get('to')

        if (urlFrom) setFrom(urlFrom)
        else {
            const d = new Date()
            d.setDate(d.getDate() - 30) // Default 30 days
            setFrom(d.toISOString().split('T')[0])
        }

        if (urlTo) setTo(urlTo)
        else {
            const d = new Date()
            setTo(d.toISOString().split('T')[0])
        }
    }, [searchParams])

    const applyFilter = () => {
        const params = new URLSearchParams(searchParams.toString())
        if (from) params.set('from', from)
        if (to) params.set('to', to)
        router.push(`${pathname}?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex flex-1 items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                    <Calendar size={18} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="text-sm px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-cyan-500"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="text-sm px-3 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-cyan-500"
                    />
                </div>
                <button
                    onClick={applyFilter}
                    className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    Filtrele
                </button>
            </div>

            <div className="relative">
                <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-cyan-600 flex items-center justify-center transition-colors"
                    title="Veri Toplama Hakkında Bilgi"
                >
                    <Info size={16} />
                </button>

                {showInfo && (
                    <div className="absolute right-0 top-10 w-72 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-slate-900 dark:text-white">Veri Toplama Prensipleri</h4>
                            <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-2 list-disc pl-4">
                            <li><strong>Rezervasyon Trendleri:</strong> Gerçek zamanlı olarak PMS sistemine (Elektra) kaydedilmiş güncel onaylı rezervasyonları yansıtır.</li>
                            <li><strong>Kanal Trendleri:</strong> OTA, Call Center, Web Arayüzü gibi kaynak kanallara göre gruplanan ciro bilgileridir.</li>
                            <li><strong>Misafir Yorumları:</strong> Google, Booking ve anket verilerinin otomatik olarak duygu (sentiment) analizine girmesiyle hesaplanır.</li>
                            <li><strong>Döviz Çevirimi:</strong> PMS'de bulunan anlık çapraz kur verileri kullanılarak çevrilir. Tutar (TL & Euro) bazında gösterilir.</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    )
}
