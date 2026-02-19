export const dynamic = 'force-dynamic'

import { MarketingService } from '@/lib/services/marketing'
import MarketingClient from './MarketingClient'

export default async function MarketingPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    // const { locale } = await params // Not used yet but available

    // Fetch Marketing Data (Last 30 days default)
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const overview = await MarketingService.getOverview(thirtyDaysAgo, today)
    const campaigns = await MarketingService.getCampaigns(thirtyDaysAgo, today)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Marketing Overview</h1>
                    <p className="text-slate-400">Track ad performance across Google, Meta, and TikTok.</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                    Data Source: Mock Data (API Credentials Required)
                </div>
            </div>

            <MarketingClient overview={overview} campaigns={campaigns} />
        </div>
    )
}
