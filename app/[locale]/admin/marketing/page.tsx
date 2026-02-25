export const dynamic = 'force-dynamic'

import { MarketingService } from '@/lib/services/marketing'
import MarketingClient from './MarketingClient'

export default async function MarketingPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    // const { locale } = await params // Not used yet but available

    // Fetch Marketing Data (Last 30 days) from our new Service and mock fallback
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    // We fetch real data from our internal API (which connects to Meta / Google)
    // For Server Components we can use fetch directly with an absolute URL but since
    // we don't know the host, we'll try to fetch or fall back to the mock if no ENV 
    // variables are set
    let liveData = null
    try {
        const HOST = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
        const res = await fetch(`${HOST}/api/admin/analytics/ads`, { cache: 'no-store' })
        if (res.ok) {
            const data = await res.json()
            if (data.success) {
                liveData = data.data
            }
        }
    } catch (e) {
        console.warn('Failed to fetch live marketing data:', e)
    }

    // Default mock data via Service
    const overview = await MarketingService.getOverview(thirtyDaysAgo, today)
    const campaigns = await MarketingService.getCampaigns(thirtyDaysAgo, today)

    // Merge live data into overview if available
    if (liveData && liveData.totalSpend > 0) {
        overview.totalSpend = liveData.totalSpend

        // Find platforms and update stats
        const metaIdx = overview.platformBreakdown.findIndex(p => p.platform === 'Meta (Facebook & Instagram)' || p.platform === 'Meta')
        if (metaIdx > -1 && liveData.metaAds) {
            overview.platformBreakdown[metaIdx].spend = liveData.metaAds.spend
            overview.platformBreakdown[metaIdx].roas = liveData.metaAds.roas
        }

        const googleIdx = overview.platformBreakdown.findIndex(p => p.platform === 'Google Ads' || p.platform === 'Google')
        if (googleIdx > -1 && liveData.googleAds && typeof liveData.googleAds.spend === 'number') {
            overview.platformBreakdown[googleIdx].spend = liveData.googleAds.spend
            overview.platformBreakdown[googleIdx].roas = liveData.googleAds.roas
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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Marketing Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400">Track ad performance across Google, Meta, and TikTok.</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                    <span className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${liveData?.totalSpend > 0 ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                        {liveData?.totalSpend > 0 ? 'Live Data (Meta/Google)' : 'Mock Data (API Credentials Required)'}
                    </span>
                </div>
            </div>

            <MarketingClient overview={overview} campaigns={campaigns} />
        </div>
    )
}
