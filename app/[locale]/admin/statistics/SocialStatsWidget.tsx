'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Instagram, Facebook, Search, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'

export default function SocialStatsWidget() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/social-stats')
                if (!res.ok) throw new Error('API Error')
                const json = await res.json()
                setData(json)
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) {
        return (
            <Card className="p-5 flex items-center justify-center h-48 bg-slate-50 dark:bg-slate-900 border-none">
                <div className="flex flex-col items-center text-muted-foreground gap-2">
                    <Loader2 className="animate-spin" size={24} />
                    <span>Sosyal Medya Verileri Yükleniyor...</span>
                </div>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="p-5 flex items-center justify-center h-48 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900">
                <div className="flex flex-col items-center text-red-500 gap-2">
                    <AlertCircle size={24} />
                    <span className="text-sm font-medium">Veri çekilemedi: {error}</span>
                </div>
            </Card>
        )
    }

    const { meta, serp } = data || {}

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Instagram */}
            <Card className="p-4 bg-gradient-to-br from-pink-500 to-purple-600 border-none text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-20"><Instagram size={100} /></div>
                <div className="relative z-10">
                    <h3 className="font-bold flex items-center gap-2"><Instagram size={18} /> Instagram</h3>
                    {meta?.error || !meta?.instagram ? (
                        <p className="mt-4 text-sm opacity-80">{meta?.error || 'Bağlantı eksik.'}</p>
                    ) : (
                        <div className="mt-4 space-y-1">
                            <div className="text-3xl font-black">{meta.instagram.followers_count?.toLocaleString()}</div>
                            <div className="text-sm opacity-90">Takipçi</div>
                            <div className="text-xs opacity-75 mt-2">Toplam {meta.instagram.media_count} gönderi</div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Facebook */}
            <Card className="p-4 bg-gradient-to-br from-blue-600 to-blue-800 border-none text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-20"><Facebook size={100} /></div>
                <div className="relative z-10">
                    <h3 className="font-bold flex items-center gap-2"><Facebook size={18} /> Facebook</h3>
                    {meta?.error || !meta?.facebook ? (
                        <p className="mt-4 text-sm opacity-80">{meta?.error || 'Bağlantı eksik.'}</p>
                    ) : (
                        <div className="mt-4 space-y-1">
                            <div className="text-3xl font-black">{meta.facebook.followers_count?.toLocaleString()}</div>
                            <div className="text-sm opacity-90">Takipçi ({meta.facebook.fan_count} Beğeni)</div>
                            <div className="text-xs opacity-75 mt-2">{meta.facebook.name}</div>
                        </div>
                    )}
                </div>
            </Card>

            {/* Google SERP Rank */}
            <Card className="p-4 bg-white dark:bg-slate-800 border-none text-slate-900 dark:text-white shadow-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 opacity-5 text-slate-400"><Search size={100} /></div>
                <div className="relative z-10">
                    <h3 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300"><Search size={18} /> Arama Motoru Sıralaması</h3>
                    {serp?.error ? (
                        <p className="mt-4 text-sm text-red-400 font-medium">{serp.error}</p>
                    ) : (
                        <div className="mt-4">
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400">#{serp?.ourRank || '?'}</span>
                                <span className="text-sm font-medium text-slate-500">Organik Sıra</span>
                            </div>
                            <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                                Anahtar Kelime: "{serp?.organicKeyword}"
                            </div>
                            {serp?.topOrganicPlaces && (
                                <div className="mt-3">
                                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Rakip Tablosu (İlk 3)</span>
                                    <ul className="text-xs space-y-1 text-slate-600 dark:text-slate-400 font-medium">
                                        {serp.topOrganicPlaces.map((title: string, i: number) => (
                                            <li key={i} className="truncate">{i + 1}. {title}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}
