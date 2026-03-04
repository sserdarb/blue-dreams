// Meta Social Service — Instagram, Facebook, WhatsApp integration via Graph API

const META_GRAPH_URL = 'https://graph.facebook.com/v21.0'

async function getToken(): Promise<string> {
    return process.env.META_ACCESS_TOKEN || ''
}

export const MetaSocialService = {
    // ─── Instagram ─────────────────────────────────────────

    async getInstagramProfile() {
        const token = await getToken()
        const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
        if (!token || !igId) return null

        const res = await fetch(
            `${META_GRAPH_URL}/${igId}?fields=username,name,followers_count,follows_count,media_count,profile_picture_url,biography&access_token=${token}`
        )
        if (!res.ok) return null
        return res.json()
    },

    async getInstagramInsights(period: 'day' | 'week' | 'days_28' = 'day') {
        const token = await getToken()
        const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
        if (!token || !igId) return null

        const metrics = 'impressions,reach,profile_views'
        const res = await fetch(
            `${META_GRAPH_URL}/${igId}/insights?metric=${metrics}&period=${period}&access_token=${token}`
        )
        if (!res.ok) return null
        return res.json()
    },

    async getInstagramMedia(limit = 12) {
        const token = await getToken()
        const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
        if (!token || !igId) return []

        const res = await fetch(
            `${META_GRAPH_URL}/${igId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=${limit}&access_token=${token}`
        )
        if (!res.ok) return []
        const data = await res.json()
        return data.data || []
    },

    // ─── Facebook Page ────────────────────────────────────

    async getFacebookPageInfo() {
        const token = await getToken()
        const pageId = process.env.META_PAGE_ID
        if (!token || !pageId) return null

        const res = await fetch(
            `${META_GRAPH_URL}/${pageId}?fields=name,fan_count,followers_count,talking_about_count,posts.limit(5){message,created_time,shares,likes.summary(true),comments.summary(true)}&access_token=${token}`
        )
        if (!res.ok) return null
        return res.json()
    },

    async getFacebookInsights(period: 'day' | 'week' | 'days_28' = 'day') {
        const token = await getToken()
        const pageId = process.env.META_PAGE_ID
        if (!token || !pageId) return null

        const metrics = 'page_impressions,page_engaged_users,page_post_engagements,page_fans'
        const res = await fetch(
            `${META_GRAPH_URL}/${pageId}/insights?metric=${metrics}&period=${period}&access_token=${token}`
        )
        if (!res.ok) return null
        return res.json()
    },

    // ─── WhatsApp ──────────────────────────────────────────

    async sendWhatsAppMessage(to: string, text: string) {
        const token = await getToken()
        const phoneId = process.env.WHATSAPP_PHONE_ID
        if (!token || !phoneId) return { success: false, error: 'Missing config' }

        const res = await fetch(`${META_GRAPH_URL}/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'text',
                text: { preview_url: false, body: text },
            }),
        })

        const data = await res.json()
        return { success: res.ok, data }
    },

    async sendWhatsAppTemplate(to: string, templateName: string, language = 'tr') {
        const token = await getToken()
        const phoneId = process.env.WHATSAPP_PHONE_ID
        if (!token || !phoneId) return { success: false, error: 'Missing config' }

        const res = await fetch(`${META_GRAPH_URL}/${phoneId}/messages`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'template',
                template: {
                    name: templateName,
                    language: { code: language },
                },
            }),
        })

        const data = await res.json()
        return { success: res.ok, data }
    },

    async getWhatsAppBusinessProfile() {
        const token = await getToken()
        const phoneId = process.env.WHATSAPP_PHONE_ID
        if (!token || !phoneId) return null

        const res = await fetch(
            `${META_GRAPH_URL}/${phoneId}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical&access_token=${token}`
        )
        if (!res.ok) return null
        return res.json()
    },

    // ─── Meta Ads ──────────────────────────────────────────

    async getMetaAdsCampaigns(datePreset = 'last_30d') {
        const token = await getToken()
        const adAccountId = process.env.META_ADS_ACCOUNT_ID
        if (!token || !adAccountId) return []

        const res = await fetch(
            `${META_GRAPH_URL}/${adAccountId}/campaigns?fields=name,status,objective,daily_budget,lifetime_budget,insights.date_preset(${datePreset}){impressions,clicks,spend,cpc,ctr,reach,actions}&access_token=${token}`
        )
        if (!res.ok) return []
        const data = await res.json()
        return data.data || []
    },

    async getMetaAdsAccountInsights(datePreset = 'last_30d') {
        const token = await getToken()
        const adAccountId = process.env.META_ADS_ACCOUNT_ID
        if (!token || !adAccountId) return null

        const res = await fetch(
            `${META_GRAPH_URL}/${adAccountId}/insights?date_preset=${datePreset}&fields=impressions,clicks,spend,cpc,ctr,reach,actions,cost_per_action_type&access_token=${token}`
        )
        if (!res.ok) return null
        const data = await res.json()
        return data.data?.[0] || null
    },
}
