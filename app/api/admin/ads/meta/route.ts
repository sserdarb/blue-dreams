import { NextResponse } from 'next/server'
import { MetaSocialService } from '@/lib/services/meta-social'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const datePreset = searchParams.get('datePreset') || 'last_30d'

        const [campaigns, accountInsights] = await Promise.all([
            MetaSocialService.getMetaAdsCampaigns(datePreset),
            MetaSocialService.getMetaAdsAccountInsights(datePreset),
        ])

        // Format campaigns
        const formattedCampaigns = campaigns.map((c: any) => {
            const insights = c.insights?.data?.[0] || {}
            return {
                id: c.id,
                name: c.name,
                status: c.status,
                objective: c.objective,
                dailyBudget: c.daily_budget ? parseInt(c.daily_budget) / 100 : null,
                lifetimeBudget: c.lifetime_budget ? parseInt(c.lifetime_budget) / 100 : null,
                impressions: parseInt(insights.impressions || '0'),
                clicks: parseInt(insights.clicks || '0'),
                spend: parseFloat(insights.spend || '0'),
                cpc: parseFloat(insights.cpc || '0'),
                ctr: parseFloat(insights.ctr || '0'),
                reach: parseInt(insights.reach || '0'),
                conversions: (insights.actions || [])
                    .filter((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase' || a.action_type === 'lead')
                    .reduce((s: number, a: any) => s + parseInt(a.value || '0'), 0),
            }
        })

        // Account totals
        const totals = accountInsights ? {
            totalImpressions: parseInt(accountInsights.impressions || '0'),
            totalClicks: parseInt(accountInsights.clicks || '0'),
            totalSpend: parseFloat(accountInsights.spend || '0'),
            avgCpc: parseFloat(accountInsights.cpc || '0'),
            avgCtr: parseFloat(accountInsights.ctr || '0'),
            totalReach: parseInt(accountInsights.reach || '0'),
        } : null

        return NextResponse.json({
            success: true,
            platform: 'meta',
            campaigns: formattedCampaigns,
            totals,
            datePreset,
        })
    } catch (error: any) {
        console.error('[Meta Ads API]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
