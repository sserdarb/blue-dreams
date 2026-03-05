export const dynamic = 'force-dynamic'

import { AdCampaign, AdPlatform, MarketingOverview } from '@/lib/services/marketing'
import MarketingClient from './MarketingClient'

export default async function MarketingPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    // We enforce real data logic now. No more mock fallbacks.
    let liveData = null
    let errorMsg = null

    try {
        const HOST = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
        const res = await fetch(`${HOST}/api/admin/analytics/ads`, { cache: 'no-store' })
        if (res.ok) {
            const data = await res.json()
            if (data.success) {
                liveData = data.data
            } else {
                errorMsg = data.error || 'Failed to parse ads data'
            }
        } else {
            errorMsg = `API request failed with status: ${res.status}`
        }
    } catch (e: any) {
        console.warn('Failed to fetch live marketing data:', e)
        errorMsg = e.message || 'Connection error'
    }

    const overview: MarketingOverview = {
        totalSpend: 0,
        totalRevenue: 0,
        totalROAS: 0,
        platformBreakdown: []
    }
    const campaigns: AdCampaign[] = []

    if (liveData) {
        overview.totalSpend = liveData.totalSpend || 0

        // Meta Ads Summary
        if (liveData.metaAds) {
            const spend = liveData.metaAds.spend || 0
            const roas = liveData.metaAds.roas || 0
            overview.platformBreakdown.push({
                platform: 'Meta (Facebook & Instagram)' as AdPlatform,
                spend,
                roas
            })

            campaigns.push({
                id: 'meta_summary',
                platform: 'Meta (Facebook & Instagram)' as AdPlatform,
                name: 'Meta Ads - Account Summary (Last 30 Days)',
                status: liveData.metaAds.status === 'Connected' ? 'active' : 'paused',
                spend: spend,
                impressions: liveData.metaAds.impressions || 0,
                clicks: liveData.metaAds.clicks || 0,
                ctr: liveData.metaAds.impressions ? ((liveData.metaAds.clicks || 0) / liveData.metaAds.impressions) * 100 : 0,
                cpc: liveData.metaAds.clicks ? (spend / liveData.metaAds.clicks) : 0,
                conversions: 0, // Need pixel/conversion API data
                roas: roas
            })
        }

        // Google Ads Summary
        if (liveData.googleAds) {
            const spend = liveData.googleAds.spend || 0
            const roas = liveData.googleAds.roas || 0
            overview.platformBreakdown.push({
                platform: 'Google Ads' as AdPlatform,
                spend,
                roas
            })

            campaigns.push({
                id: 'google_summary',
                platform: 'Google Ads' as AdPlatform,
                name: 'Google Ads - Account Summary (Last 30 Days)',
                status: liveData.googleAds.status === 'Connected' ? 'active' : 'paused',
                spend: spend,
                impressions: liveData.googleAds.impressions || 0,
                clicks: liveData.googleAds.clicks || 0,
                ctr: liveData.googleAds.impressions ? ((liveData.googleAds.clicks || 0) / liveData.googleAds.impressions) * 100 : 0,
                cpc: liveData.googleAds.clicks ? (spend / liveData.googleAds.clicks) : 0,
                conversions: 0, // Need conversion tracking setup
                roas: roas
            })
        }

        // Recalculate average ROAS based on live data
        let totalLiveRoasWeight = 0
        let platformsWithLiveRoas = 0

        if (liveData.metaAds?.roas) {
            totalLiveRoasWeight += liveData.metaAds.roas
            platformsWithLiveRoas++
        }
        if (liveData.googleAds?.roas) {
            totalLiveRoasWeight += liveData.googleAds.roas
            platformsWithLiveRoas++
        }

        if (platformsWithLiveRoas > 0) {
            overview.totalROAS = totalLiveRoasWeight / platformsWithLiveRoas
        }
    }

    const hasLiveConnection = liveData?.metaAds?.status === 'Connected' || liveData?.googleAds?.status === 'Connected'

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Marketing Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track ad performance across Google & Meta. Data is loaded directly from real APIs.</p>
                </div>
                <div className="text-right text-sm text-slate-500 flex flex-col items-end">
                    <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${hasLiveConnection ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                        {hasLiveConnection ? 'Live Data Connected' : 'Missing API Credentials'}
                    </span>
                    {errorMsg && <span className="text-red-500 text-xs mt-1">{errorMsg}</span>}
                </div>
            </div>

            {!hasLiveConnection && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
                    <strong>Bilgi:</strong> {liveData?.metaAds?.status === 'Token Expired'
                        ? <>Meta Access Token süresi dolmuş. <a href="/api/admin/settings/meta-token" target="_blank" className="underline font-semibold">Token durumunu kontrol edin</a> ve yeni bir token ile yenileyin.</>
                        : <>API bağlantıları kurulamadı veya eksik. Gerçek zamanlı verileri görebilmek için
                            <code className="mx-1">.env</code> dosyasındaki <code>META_ACCESS_TOKEN</code> ve <code>GOOGLE_ADS_*</code> kimlik bilgilerini tanımlayınız.</>
                    }
                </div>
            )}

            <MarketingClient overview={overview} campaigns={campaigns} />
        </div>
    )
}
