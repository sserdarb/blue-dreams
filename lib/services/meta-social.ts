// Meta Social Service — Instagram, Facebook, WhatsApp integration via Graph API
import { prisma } from '@/lib/prisma'
import { isDemoSession } from '@/lib/demo-session'

const META_GRAPH_URL = 'https://graph.facebook.com/v21.0'

async function checkSettings() {
    try {
        if (await isDemoSession()) return true
        const s = await prisma.siteSettings.findFirst()
        return s?.demoModeSocial ?? false
    } catch {
        return false
    }
}

async function getToken(): Promise<string> {
    return process.env.META_ACCESS_TOKEN || ''
}

export const MetaSocialService = {
    // ─── Instagram ─────────────────────────────────────────

    async getInstagramProfile() {
        const isDemo = await checkSettings()
        if (isDemo) {
            return {
                username: "bluedreamsresort",
                name: "Blue Dreams Resort & Spa",
                followers_count: 52000,
                follows_count: 140,
                media_count: 980,
                profile_picture_url: "https://ui-avatars.com/api/?name=BD&background=0D8ABC&color=fff",
                biography: "5 Star Ultra All Inclusive Resort in Bodrum"
            }
        }
        const token = await getToken()
        const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || process.env.IG_ACCOUNT_ID
        if (!token || !igId) return null

        const res = await fetch(
            `${META_GRAPH_URL}/${igId}?fields=username,name,followers_count,follows_count,media_count,profile_picture_url,biography&access_token=${token}`
        )
        if (!res.ok) return null
        return res.json()
    },

    async getInstagramInsights(period: 'day' | 'week' | 'days_28' = 'day') {
        const isDemo = await checkSettings()
        if (isDemo) {
            return {
                data: [
                    { name: 'impressions', values: [{ value: Math.floor(Math.random() * 20000) + 5000 }] },
                    { name: 'reach', values: [{ value: Math.floor(Math.random() * 10000) + 2000 }] },
                    { name: 'profile_views', values: [{ value: Math.floor(Math.random() * 800) + 100 }] }
                ]
            }
        }
        const token = await getToken()
        const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || process.env.IG_ACCOUNT_ID
        if (!token || !igId) return null

        const metrics = 'impressions,reach,profile_views'
        const res = await fetch(
            `${META_GRAPH_URL}/${igId}/insights?metric=${metrics}&period=${period}&access_token=${token}`
        )
        if (!res.ok) return null
        return res.json()
    },

    async getInstagramMedia(limit = 12) {
        const isDemo = await checkSettings()
        if (isDemo) {
            return Array.from({ length: limit }).map((_, i) => ({
                id: `ig_media_${i}`,
                caption: `Amazing view from Blue Dreams Resort! #bodrum #holiday ${i}`,
                media_type: i % 3 === 0 ? 'VIDEO' : 'IMAGE',
                media_url: `https://picsum.photos/seed/${i}/800/800`,
                thumbnail_url: `https://picsum.photos/seed/${i}/400/400`,
                timestamp: new Date(Date.now() - i * 86400000).toISOString(),
                like_count: Math.floor(Math.random() * 1000) + 50,
                comments_count: Math.floor(Math.random() * 50) + 5,
                permalink: '#'
            }))
        }
        const token = await getToken()
        const igId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || process.env.IG_ACCOUNT_ID
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
        const isDemo = await checkSettings()
        if (isDemo) {
            return {
                name: "Blue Dreams Resort & Spa",
                fan_count: 125000,
                followers_count: 128000,
                talking_about_count: 450,
                posts: {
                    data: [
                        { message: "Welcome to paradise!", created_time: new Date().toISOString(), shares: { count: 15 }, likes: { summary: { total_count: 230 } }, comments: { summary: { total_count: 40 } } },
                        { message: "Summer is coming 🌴", created_time: new Date(Date.now() - 86400000).toISOString(), shares: { count: 5 }, likes: { summary: { total_count: 150 } }, comments: { summary: { total_count: 20 } } }
                    ]
                }
            }
        }
        const token = await getToken()
        const pageId = process.env.META_PAGE_ID || process.env.FB_PAGE_ID
        if (!token || !pageId) return null

        const res = await fetch(
            `${META_GRAPH_URL}/${pageId}?fields=name,fan_count,followers_count,talking_about_count,posts.limit(5){message,created_time,shares,likes.summary(true),comments.summary(true)}&access_token=${token}`
        )
        if (!res.ok) return null
        return res.json()
    },

    async getFacebookInsights(period: 'day' | 'week' | 'days_28' = 'day') {
        const isDemo = await checkSettings()
        if (isDemo) {
            return {
                data: [
                    { name: 'page_impressions', values: [{ value: Math.floor(Math.random() * 50000) + 10000 }] },
                    { name: 'page_engaged_users', values: [{ value: Math.floor(Math.random() * 5000) + 1000 }] },
                    { name: 'page_post_engagements', values: [{ value: Math.floor(Math.random() * 3000) + 500 }] },
                    { name: 'page_fans', values: [{ value: 125000 }] }
                ]
            }
        }
        const token = await getToken()
        const pageId = process.env.META_PAGE_ID || process.env.FB_PAGE_ID
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
        const isDemo = await checkSettings()
        if (isDemo) {
            return [
                { name: "Summer Early Bird 2025", status: "ACTIVE", objective: "CONVERSIONS", daily_budget: 5000, spend: 3500, cpc: 2.5, ctr: 3.2, reach: 45000, impressions: 120000 },
                { name: "Brand Awareness TR", status: "ACTIVE", objective: "REACH", daily_budget: 2000, spend: 1200, cpc: 0.8, ctr: 1.5, reach: 85000, impressions: 250000 },
                { name: "Retargeting Website Visitors", status: "PAUSED", objective: "CONVERSIONS", daily_budget: 1500, spend: 1000, cpc: 3.5, ctr: 4.8, reach: 15000, impressions: 30000 }
            ]
        }
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
        const isDemo = await checkSettings()
        if (isDemo) {
            return {
                impressions: 400000,
                clicks: 12500,
                spend: 5700,
                cpc: 0.45,
                ctr: 3.1,
                reach: 145000,
                actions: [{ action_type: "onsite_conversion", value: 85 }]
            }
        }
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
