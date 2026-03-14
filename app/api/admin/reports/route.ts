import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { bigdataCache } from '@/lib/utils/api-cache'

// ── Helpers ──────────────────────────────────────────────────────────────────

function getDateRanges(datePreset: string) {
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().slice(0, 10)
    
    let startDate = new Date(now)
    if (datePreset === 'last_7d') startDate.setDate(now.getDate() - 7)
    else if (datePreset === 'last_30d') startDate.setDate(now.getDate() - 30)
    else if (datePreset === 'last_90d') startDate.setDate(now.getDate() - 90)
    else startDate.setDate(now.getDate() - 30)
    
    const startStr = startDate.toISOString().slice(0, 10)
    
    return { startStr, yesterdayStr, todayStr }
}

function mergeStats(past: any, today: any, platform: string) {
    const p = past || { impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0, frequency: 0, followers: 0, pageName: '' }
    const t = today || { impressions: 0, clicks: 0, spend: 0, conversions: 0, reach: 0, frequency: 0, followers: 0, pageName: '' }
    
    const impressions = p.impressions + t.impressions
    const clicks = p.clicks + t.clicks
    const spend = p.spend + t.spend
    const conversions = p.conversions + t.conversions
    const reach = p.reach + t.reach

    return {
        platform,
        impressions,
        clicks,
        spend: Math.round(spend * 100) / 100,
        conversions,
        reach,
        ctr: impressions > 0 ? (clicks / impressions * 100) : 0,
        cpc: clicks > 0 ? (spend / clicks) : 0,
        frequency: p.frequency || t.frequency || 0,
        followers: p.followers || t.followers || 0,
        pageName: p.pageName || t.pageName || `${platform} Account`
    }
}

async function fetchMetaRange(accountId: string, token: string, since: string, until: string) {
    const timeRange = JSON.stringify({ since, until })
    const insightsUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?fields=impressions,clicks,spend,ctr,cpc,actions,reach,frequency&time_range=${timeRange}&access_token=${token}`
    const insRes = await fetch(insightsUrl)
    const insData = await insRes.json()

    if (insData.error) {
        console.error(`[Reports Meta] API error for ${since}-${until}:`, insData.error.message)
        return null
    }

    const row = insData?.data?.[0] || {}
    const conversions = row.actions?.find((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase')?.value || 0

    return {
        impressions: parseInt(row.impressions || '0'),
        clicks: parseInt(row.clicks || '0'),
        spend: parseFloat(row.spend || '0'),
        reach: parseInt(row.reach || '0'),
        frequency: parseFloat(row.frequency || '0'),
        conversions: parseInt(conversions),
    }
}

async function fetchMetaInsights(datePreset: string) {
    const token = process.env.META_ACCESS_TOKEN
    const adAccount = process.env.FB_AD_ACCOUNT_ID || process.env.META_ADS_ACCOUNT_ID
    if (!token || !adAccount) return null

    try {
        const accountId = adAccount.startsWith('act_') ? adAccount : `act_${adAccount}`
        const { startStr, yesterdayStr, todayStr } = getDateRanges(datePreset)

        // 1. Fetch Past Data (Cached for 24 hours = 1440 mins)
        const pastKey = `meta_past_${accountId}_${startStr}_${yesterdayStr}`
        const pastData = await bigdataCache.getOrFetch(pastKey, () => fetchMetaRange(accountId, token, startStr, yesterdayStr), 1440)

        // 2. Fetch Today Data (Cached for 15 mins)
        const todayKey = `meta_today_${accountId}_${todayStr}`
        const todayData = await bigdataCache.getOrFetch(todayKey, () => fetchMetaRange(accountId, token, todayStr, todayStr), 15)

        // 3. Page Fans (Cached for 24 hours)
        const pageId = process.env.META_PAGE_ID
        let pageFollowers = 0
        let pageName = 'Meta Page'
        if (pageId) {
            const pageKey = `meta_page_${pageId}`
            const pageData = await bigdataCache.getOrFetch(pageKey, async () => {
                const pUrl = `https://graph.facebook.com/v21.0/${pageId}?fields=fan_count,followers_count,name&access_token=${token}`
                const pRes = await fetch(pUrl)
                return await pRes.json()
            }, 1440)
            
            pageFollowers = pageData?.followers_count || pageData?.fan_count || 0
            pageName = pageData?.name || 'Meta Page'
        }

        const merged = mergeStats(pastData, todayData, 'Meta')
        merged.followers = pageFollowers
        merged.pageName = pageName
        return merged
    } catch (e: any) {
        console.error('[Reports Meta]', e?.message)
        return null
    }
}

async function fetchGoogleRange(cid: string, headers: any, startDate: string, endDate: string) {
    const query = `SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.ctr, metrics.average_cpc, metrics.conversions FROM customer WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'`
    
    const searchRes = await fetch(`https://googleads.googleapis.com/v23/customers/${cid}/googleAds:search`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query, pageSize: 10000 })
    })

    if (!searchRes.ok) {
        const errBody = await searchRes.text()
        console.error(`[Reports Google] API error for ${startDate}-${endDate}:`, searchRes.status, errBody)
        return null
    }

    const searchData = await searchRes.json()
    const results = searchData?.results || []

    let totalImpressions = 0, totalClicks = 0, totalCostMicros = 0, totalConversions = 0
    results.forEach((r: any) => {
        const m = r.metrics || {}
        totalImpressions += parseInt(m.impressions || '0')
        totalClicks += parseInt(m.clicks || '0')
        totalCostMicros += parseInt(m.costMicros || '0')
        totalConversions += parseFloat(m.conversions || '0')
    })

    return {
        impressions: totalImpressions,
        clicks: totalClicks,
        spend: totalCostMicros / 1_000_000,
        reach: 0,
        frequency: 0,
        conversions: Math.round(totalConversions)
    }
}

async function fetchGoogleAdsInsights(datePreset: string) {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN
    const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
    const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID
    const managerId = process.env.GOOGLE_ADS_MANAGER_ID

    if (!clientId || !clientSecret || !refreshToken || !devToken || !customerId) return null

    try {
        // Access token cached for 55 minutes
        const tokenKey = `google_ads_token_${clientId}`
        const accessToken = await bigdataCache.getOrFetch(tokenKey, async () => {
            const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    client_id: clientId,
                    client_secret: clientSecret,
                    refresh_token: refreshToken,
                    grant_type: 'refresh_token'
                })
            })
            const tokenData = await tokenRes.json()
            return tokenData.access_token || null
        }, 55)

        if (!accessToken) {
            console.error('[Reports Google] Token refresh failed')
            return null
        }

        const cid = customerId.replace(/-/g, '')
        const headers: Record<string, string> = {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': devToken,
            'Content-Type': 'application/json'
        }
        if (managerId) {
            headers['login-customer-id'] = managerId.replace(/-/g, '')
        }

        const { startStr, yesterdayStr, todayStr } = getDateRanges(datePreset)

        // 1. Fetch Past Data (Cached for 24 hours = 1440 mins)
        const pastKey = `google_past_${cid}_${startStr}_${yesterdayStr}`
        const pastData = await bigdataCache.getOrFetch(pastKey, () => fetchGoogleRange(cid, headers, startStr, yesterdayStr), 1440)

        // 2. Fetch Today Data (Cached for 15 mins)
        const todayKey = `google_today_${cid}_${todayStr}`
        const todayData = await bigdataCache.getOrFetch(todayKey, () => fetchGoogleRange(cid, headers, todayStr, todayStr), 15)

        return mergeStats(pastData, todayData, 'Google Ads')
    } catch (e: any) {
        console.error('[Reports Google]', e?.message)
        return null
    }
}

// ── GET /api/admin/reports ──────────────────────────────────────────────────

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const datePreset = searchParams.get('datePreset') || 'last_30d'
        const generateInsights = searchParams.get('insights') === 'true'

        // Parallel fetch
        const [metaData, googleData] = await Promise.all([
            fetchMetaInsights(datePreset),
            fetchGoogleAdsInsights(datePreset)
        ])

        const platforms: any[] = []
        if (metaData) platforms.push(metaData)
        if (googleData) platforms.push(googleData)

        // Aggregate totals
        const totalSpend = platforms.reduce((s, p) => s + p.spend, 0)
        const totalImpressions = platforms.reduce((s, p) => s + p.impressions, 0)
        const totalClicks = platforms.reduce((s, p) => s + p.clicks, 0)
        const totalConversions = platforms.reduce((s, p) => s + p.conversions, 0)
        const totalReach = platforms.reduce((s, p) => s + (p.reach || 0), 0)
        const avgCtr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0
        const avgCpc = totalClicks > 0 ? (totalSpend / totalClicks) : 0

        // ── Enhanced PMS metrics (Protel/Amadeus/Fidelio style KPIs) ──
        let pmsMetrics: any = null
        try {
            const days = datePreset === 'last_7d' ? 7 : datePreset === 'last_90d' ? 90 : 30
            const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

            const [recentBookings, totalRooms, revenueData] = await Promise.all([
                prisma.booking.count({ where: { createdAt: { gte: since } } }),
                prisma.room.count(),
                prisma.booking.aggregate({
                    where: { createdAt: { gte: since } },
                    _sum: { totalPrice: true },
                    _avg: { totalPrice: true },
                })
            ])

            const totalRevenue = revenueData._sum?.totalPrice || 0
            const avgDailyRate = revenueData._avg?.totalPrice || 0
            const occupancy = totalRooms > 0 ? Math.round((recentBookings / (totalRooms * days)) * 100) : 0
            const revPAR = totalRooms > 0 ? Math.round((totalRevenue / (totalRooms * days)) * 100) / 100 : 0
            const costPerAcquisition = recentBookings > 0 ? Math.round((totalSpend / recentBookings) * 100) / 100 : 0

            pmsMetrics = {
                bookings: recentBookings,
                totalRooms,
                occupancyRate: Math.min(occupancy, 100),
                adr: Math.round(avgDailyRate * 100) / 100,   // Average Daily Rate
                revPAR,                                       // Revenue Per Available Room
                totalRevenue: Math.round(totalRevenue * 100) / 100,
                costPerAcquisition,                           // CPA from marketing spend
                days,
            }
        } catch { /* PMS data optional */ }

        // ── AI-Generated Insights (on demand) ──
        let aiInsights: string | null = null
        if (generateInsights && process.env.OPENAI_API_KEY) {
            try {
                const dataContext = JSON.stringify({
                    period: datePreset,
                    marketing: { totalSpend, totalImpressions, totalClicks, totalConversions, avgCtr, avgCpc, totalReach },
                    platforms: platforms.map(p => ({ platform: p.platform, spend: p.spend, impressions: p.impressions, clicks: p.clicks, conversions: p.conversions })),
                    hotel: pmsMetrics
                })

                const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        temperature: 0.7,
                        max_tokens: 800,
                        messages: [
                            {
                                role: 'system',
                                content: `Sen bir otel dijital pazarlama analistisin. Protel, Amadeus Fidelio, Sedna ve ElektraWeb gibi PMS verilerine hakim, RevPAR, ADR, doluluk oranı ve CPA metriklerini analiz eden bir uzmansın. Kısa ve öz, aksiyon odaklı öneriler sun. Türkçe yanıt ver. Format: madde işaretleri ile 4-6 anahtar içgörü.`
                            },
                            {
                                role: 'user',
                                content: `Aşağıdaki dönem verilerini analiz et ve önerilerde bulun:\n\n${dataContext}`
                            }
                        ]
                    })
                })
                const aiData = await aiRes.json()
                aiInsights = aiData.choices?.[0]?.message?.content || null
            } catch (err) {
                console.error('[Reports AI]', err)
            }
        }

        return NextResponse.json({
            success: true,
            datePreset,
            summary: {
                totalSpend: Math.round(totalSpend * 100) / 100,
                totalImpressions,
                totalClicks,
                totalConversions,
                totalReach,
                avgCtr: Math.round(avgCtr * 100) / 100,
                avgCpc: Math.round(avgCpc * 100) / 100
            },
            platforms,
            pmsMetrics,
            aiInsights,
            generated: new Date().toISOString()
        })
    } catch (e: any) {
        console.error('[Reports GET]', e?.message)
        return NextResponse.json({ error: e?.message || 'Report generation failed' }, { status: 500 })
    }
}
