export type AdPlatform = 'Google' | 'Meta' | 'TikTok'

export type AdCampaign = {
    id: string
    platform: AdPlatform
    name: string
    status: 'active' | 'paused' | 'ended'
    spend: number
    impressions: number
    clicks: number
    ctr: number
    cpc: number
    conversions: number
    roas: number
}

export type MarketingOverview = {
    totalSpend: number
    totalRevenue: number
    totalROAS: number
    platformBreakdown: { platform: AdPlatform, spend: number, roas: number }[]
}

export const MarketingService = {
    async getCampaigns(startDate: Date, endDate: Date): Promise<AdCampaign[]> {
        // Mock Data
        const campaigns: AdCampaign[] = []
        const platforms: AdPlatform[] = ['Google', 'Meta', 'TikTok']

        for (let i = 0; i < 15; i++) {
            const platform = platforms[i % 3]
            const spend = Math.floor(Math.random() * 5000) + 500
            const impressions = spend * (Math.random() * 100 + 50)
            const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01))
            const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.01))
            const revenue = conversions * 4000 // Average booking value

            campaigns.push({
                id: `cmp_${i}`,
                platform,
                name: `${platform} Summer Promo ${i + 1}`,
                status: i < 10 ? 'active' : 'paused',
                spend,
                impressions,
                clicks,
                ctr: (clicks / impressions) * 100,
                cpc: spend / clicks,
                conversions,
                roas: revenue / spend
            })
        }
        return campaigns
    },

    async getOverview(startDate: Date, endDate: Date): Promise<MarketingOverview> {
        const campaigns = await this.getCampaigns(startDate, endDate)

        const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0)
        // Revenue derived from ROAS * Spend
        const totalRevenue = campaigns.reduce((sum, c) => sum + (c.spend * c.roas), 0)

        const breakdown = ['Google', 'Meta', 'TikTok'].map(p => {
            const platformCampaigns = campaigns.filter(c => c.platform === p)
            const spend = platformCampaigns.reduce((sum, c) => sum + c.spend, 0)
            const revenue = platformCampaigns.reduce((sum, c) => sum + (c.spend * c.roas), 0)
            return {
                platform: p as AdPlatform,
                spend,
                roas: spend > 0 ? revenue / spend : 0
            }
        })

        return {
            totalSpend,
            totalRevenue,
            totalROAS: totalSpend > 0 ? totalRevenue / totalSpend : 0,
            platformBreakdown: breakdown
        }
    }
}
