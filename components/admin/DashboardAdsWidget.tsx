'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { Megaphone, DollarSign, MousePointer, Eye, Percent, TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'

interface DashboardAdsWidgetProps {
    currency: 'TRY' | 'EUR' | 'USD'
    exchangeRate?: number // EUR_TO_TRY
    usdRate?: number      // USD_TO_TRY
}

export default function DashboardAdsWidget({ currency, exchangeRate = 1, usdRate = 1 }: DashboardAdsWidgetProps) {
    const [adsData, setAdsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchAds = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/analytics/ads')
            if (res.ok) {
                const json = await res.json()
                if (json.success && json.data) {
                    setAdsData(json.data)
                }
            }
        } catch (error) {
            console.error('Error fetching Ads Analytics:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchAds()
        const interval = setInterval(fetchAds, 60000 * 5) // every 5 mins
        return () => clearInterval(interval)
    }, [fetchAds])

    // Ads accounts usually return in EUR (or TRY). Let's assume base is EUR.
    // If currency is TRY, we multiply by exchangeRate.
    // If currency is USD, we multiply by exchangeRate / usdRate.
    const convertValue = (val: number) => {
        if (!val) return 0
        if (currency === 'TRY') return val * exchangeRate
        if (currency === 'USD' && usdRate > 0) return val * (exchangeRate / usdRate)
        return val // Default EUR
    }

    const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '₺'

    const formatCurrency = (val: number) => {
        return `${currencySymbol}${convertValue(val).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`
    }

    const mAds = adsData?.metaAds || {}
    const gAds = adsData?.googleAds || {}
    const totalSpend = adsData?.totalSpend || 0
    const totalImpressions = adsData?.totalImpressions || 0
    const totalClicks = adsData?.totalClicks || 0

    // Average ROAS weighted by spend if possible, or just max.
    // If Meta has ROAS 4.0 and Google 3.0, simple average for now
    let avgRoas = 0
    let roasCount = 0
    if (mAds.roas > 0) { avgRoas += mAds.roas; roasCount++ }
    if (gAds.roas > 0) { avgRoas += gAds.roas; roasCount++ }
    const displayRoas = roasCount > 0 ? (avgRoas / roasCount).toFixed(2) : '0.00'

    const hasError = mAds.status !== 'Connected' && gAds.status !== 'Connected' && !loading

    return (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm relative overflow-hidden h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                        <Megaphone className="text-orange-500" size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Reklam Performansı</h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            Google Ads & Meta Ads Son 30 Gün
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {loading ? <RefreshCw size={14} className="animate-spin text-slate-400" /> : (
                        adsData ? (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Aktif
                            </span>
                        ) : (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Kurulum Bekliyor</span>
                        )
                    )}
                    <button onClick={fetchAds} disabled={loading} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50">
                        <RefreshCw size={14} className={`text-slate-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {hasError && (
                <div className="mb-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle size={14} /> 
                    <span>Hem Meta Ads hem Google Ads bağlanamadı veya token süresi doldu. Ayarlar &gt; API Yapılandırmalarını kontrol edin.</span>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 flex-grow">
                {/* 1. Toplam Harcama */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <DollarSign size={12} className="text-emerald-500" /> Toplam Harcama
                        </p>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {loading ? '...' : formatCurrency(totalSpend)}
                    </p>
                </div>

                {/* 2. Toplam Gösterim */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <Eye size={12} className="text-blue-500" /> Toplam Gösterim
                        </p>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {loading ? '...' : totalImpressions.toLocaleString('tr-TR')}
                    </p>
                </div>

                {/* 3. Toplam Tıklama */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <MousePointer size={12} className="text-sky-500" /> Toplam Tıklama
                        </p>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {loading ? '...' : totalClicks.toLocaleString('tr-TR')}
                    </p>
                </div>

                {/* 4. Google Harcama */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center border-l-2 border-red-500">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                            </svg>
                            Google Harcama
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? '...' : formatCurrency(gAds?.spend || 0)}
                        </p>
                        {gAds.status && gAds.status !== 'Connected' && !loading && (
                            <span className="text-[10px] text-rose-500 bg-rose-100 dark:bg-rose-900/30 px-1 py-0.5 rounded truncate max-w-[80px]" title={gAds.message || gAds.status}>
                                Hata
                            </span>
                        )}
                    </div>
                </div>

                {/* 5. Meta Harcama */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center border-l-2 border-blue-600">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <svg className="w-3 h-3 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Meta Harcama
                        </p>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {loading ? '...' : formatCurrency(mAds?.spend || 0)}
                        </p>
                        {mAds.status && mAds.status !== 'Connected' && !loading && (
                            <span className="text-[10px] text-rose-500 bg-rose-100 dark:bg-rose-900/30 px-1 py-0.5 rounded truncate max-w-[80px]" title={mAds.message || mAds.status}>
                                Hata
                            </span>
                        )}
                    </div>
                </div>

                {/* 6. Ortalama ROAS */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <TrendingUp size={12} className="text-emerald-500" /> Ortalama ROAS
                        </p>
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                        {loading ? '...' : `${displayRoas}x`}
                    </p>
                </div>
            </div>
        </div>
    )
}
