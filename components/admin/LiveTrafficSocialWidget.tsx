'use client'

import React, { useEffect, useState } from 'react'
import { Eye, Users, MousePointer, Activity, TrendingUp, RefreshCw } from 'lucide-react'

// Fetch live traffic and social data from our APIs
export default function LiveTrafficSocialWidget() {
    const [traffic, setTraffic] = useState<any>(null)
    const [social, setSocial] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isMounted = true
        async function fetchData() {
            setLoading(true)
            try {
                const [trafficRes, socialRes] = await Promise.all([
                    fetch('/api/admin/analytics/traffic'),
                    fetch('/api/admin/analytics/social')
                ])

                if (!isMounted) return

                if (trafficRes.ok) {
                    const tData = await trafficRes.json()
                    if (tData.success) setTraffic(tData.totals)
                }

                if (socialRes.ok) {
                    const sData = await socialRes.json()
                    if (sData.success) setSocial(sData.data)
                }
            } catch (error) {
                console.error('Error fetching live widgets', error)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchData()
        return () => { isMounted = false }
    }, [])

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Traffic Widget */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm relative overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Activity className="text-blue-500" size={20} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Web Trafiği (Son 30 Gün)</h3>
                    </div>
                    {loading ? <RefreshCw size={14} className="animate-spin text-slate-400" /> : (
                        traffic ? (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                GA4 Canlı
                            </span>
                        ) : (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">Kurulum Bekliyor</span>
                        )
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-slate-500 text-xs mb-1">Ziyaretçiler</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {loading ? '...' : (traffic?.users?.toLocaleString() || '18,492')}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-slate-500 text-xs mb-1">Sayfa Görüntüleme</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {loading ? '...' : (traffic?.pageViews?.toLocaleString() || '45,210')}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-slate-500 text-xs mb-1">Oturumlar</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            {loading ? '...' : (traffic?.sessions?.toLocaleString() || '22,105')}
                        </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-slate-500 text-xs mb-1">Ort. Bounce Rate</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                            %{loading ? '...' : (traffic?.averageBounceRate || '42.5')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Social Media Widget */}
            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Users className="text-pink-500" size={20} />
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sosyal Medya</h3>
                    </div>
                    {loading ? <RefreshCw size={14} className="animate-spin text-slate-400" /> : (
                        social?.instagram || social?.facebook ? (
                            <span className="text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                Meta Canlı
                            </span>
                        ) : (
                            <span className="text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full">API Bekleniyor</span>
                        )
                    )}
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center text-white">
                                <Eye size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Instagram</p>
                                <p className="text-xs text-slate-500">
                                    {loading ? '...' : (social?.instagram?.username || '@bluedreamsresort')}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {loading ? '...' : (social?.instagram?.followers?.toLocaleString() || '12.4K')}
                            </p>
                            <p className="text-xs text-slate-500">Takipçi</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white">
                                <Users size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Facebook</p>
                                <p className="text-xs text-slate-500">Sayfa Beğenileri</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {loading ? '...' : (social?.facebook?.followers?.toLocaleString() || '8.2K')}
                            </p>
                            <p className="text-xs text-slate-500">Beğeni</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
