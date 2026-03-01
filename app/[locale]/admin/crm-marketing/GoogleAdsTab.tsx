'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, MousePointerClick, DollarSign, Activity } from 'lucide-react'

interface AdCampaign {
    id: string
    name: string
    impressions: number
    clicks: number
    cost: number
    conversions: number
}

export default function GoogleAdsTab() {
    const [campaigns, setCampaigns] = useState<AdCampaign[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchAds() {
            try {
                const res = await fetch('/api/admin/ads?action=stats')
                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || 'Server error')
                }
                const data = await res.json()
                setCampaigns(data.campaigns || [])
            } catch (err: any) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchAds()
    }, [])

    if (loading) return <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
    if (error) return <div className="p-8 text-center text-red-500">Google Ads Bağlantı Hatası: {error}</div>

    const totalCost = campaigns.reduce((acc, c) => acc + c.cost, 0)
    const totalClicks = campaigns.reduce((acc, c) => acc + c.clicks, 0)
    const totalConversions = campaigns.reduce((acc, c) => acc + c.conversions, 0)
    const totalImpressions = campaigns.reduce((acc, c) => acc + c.impressions, 0)

    const avgCpc = totalClicks > 0 ? (totalCost / totalClicks).toFixed(2) : '0.00'
    const conversionRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : '0.00'

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center gap-2"><BarChart3 size={20} /> Reklam Performansı (Son 30 Gün)</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-slate-900 border-none">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><DollarSign size={14} /> Toplam Harcama</p>
                    <p className="text-2xl font-bold mt-1">₺{totalCost.toFixed(2)}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-slate-900 border-none">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MousePointerClick size={14} /> Toplam Tıklama</p>
                    <p className="text-2xl font-bold mt-1">{totalClicks}</p>
                    <p className="text-xs text-muted-foreground mt-1">CPC: ₺{avgCpc}</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-slate-900 border-none">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Target size={14} /> Dönüşümler (Rez)</p>
                    <p className="text-2xl font-bold mt-1">{totalConversions}</p>
                    <p className="text-xs text-muted-foreground mt-1">% {conversionRate} Dönüşüm</p>
                </Card>
                <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-slate-900 border-none">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Activity size={14} /> Görüntülenme</p>
                    <p className="text-2xl font-bold mt-1">{totalImpressions.toLocaleString()}</p>
                </Card>
            </div>

            <Card className="overflow-hidden mt-4">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 dark:bg-slate-800/50">
                            <tr>
                                <th className="p-3">Kampanya Adı</th>
                                <th className="p-3 text-right">Görüntülenme</th>
                                <th className="p-3 text-right">Tıklama</th>
                                <th className="p-3 text-right">Harcama</th>
                                <th className="p-3 text-right">Dönüşüm</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Veri bulunamadı.</td></tr>
                            ) : (
                                campaigns.map(c => (
                                    <tr key={c.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                        <td className="p-3 font-medium">{c.name}</td>
                                        <td className="p-3 text-right">{c.impressions.toLocaleString()}</td>
                                        <td className="p-3 text-right">{c.clicks.toLocaleString()}</td>
                                        <td className="p-3 text-right">₺{c.cost.toFixed(2)}</td>
                                        <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{c.conversions}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

function Target(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinelinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
}
