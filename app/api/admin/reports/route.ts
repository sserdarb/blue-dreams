import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ── Helpers ──────────────────────────────────────────────────────────────────

async function fetchMetaInsights(datePreset: string) {
    const token = process.env.META_ACCESS_TOKEN
    const adAccount = process.env.FB_AD_ACCOUNT_ID || process.env.META_ADS_ACCOUNT_ID
    if (!token || !adAccount) return null

    try {
        const accountId = adAccount.startsWith('act_') ? adAccount : `act_${adAccount}`

        // Account-level insights 
        const insightsUrl = `https://graph.facebook.com/v21.0/${accountId}/insights?fields=impressions,clicks,spend,ctr,cpc,actions,reach,frequency&date_preset=${datePreset}&access_token=${token}`
        const insRes = await fetch(insightsUrl)
        const insData = await insRes.json()

        if (insData.error) {
            console.error('[Reports Meta] API error:', insData.error.message)
            return null
        }

        // Page fans & engagement via page
        const pageId = process.env.META_PAGE_ID
        let pageData: any = null
        if (pageId) {
            const pUrl = `https://graph.facebook.com/v21.0/${pageId}?fields=fan_count,followers_count,name&access_token=${token}`
            const pRes = await fetch(pUrl)
            pageData = await pRes.json()
        }

        const row = insData?.data?.[0] || {}
        const conversions = row.actions?.find((a: any) => a.action_type === 'offsite_conversion.fb_pixel_purchase')?.value || 0

        return {
            platform: 'Meta',
            impressions: parseInt(row.impressions || '0'),
            clicks: parseInt(row.clicks || '0'),
            spend: parseFloat(row.spend || '0'),
            ctr: parseFloat(row.ctr || '0'),
            cpc: parseFloat(row.cpc || '0'),
            reach: parseInt(row.reach || '0'),
            frequency: parseFloat(row.frequency || '0'),
            conversions: parseInt(conversions),
            followers: pageData?.followers_count || pageData?.fan_count || 0,
            pageName: pageData?.name || 'Meta Page'
        }
    } catch (e: any) {
        console.error('[Reports Meta]', e?.message)
        return null
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
        // Get access token
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
        const accessToken = tokenData.access_token
        if (!accessToken) {
            console.error('[Reports Google] Token refresh failed:', tokenData.error_description || tokenData.error)
            return null
        }

        // Date range
        const now = new Date()
        let startDate = new Date()
        if (datePreset === 'last_7d') startDate.setDate(now.getDate() - 7)
        else if (datePreset === 'last_30d') startDate.setDate(now.getDate() - 30)
        else if (datePreset === 'last_90d') startDate.setDate(now.getDate() - 90)
        else startDate.setDate(now.getDate() - 30)

        const startStr = startDate.toISOString().slice(0, 10)
        const endStr = now.toISOString().slice(0, 10)

        const cid = customerId.replace(/-/g, '')

        // Use v23 search endpoint (not deprecated searchStream)
        const query = `SELECT metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.ctr, metrics.average_cpc, metrics.conversions FROM customer WHERE segments.date BETWEEN '${startStr}' AND '${endStr}'`

        const headers: Record<string, string> = {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': devToken,
            'Content-Type': 'application/json'
        }
        // MCC (Manager) account header — required when using a manager account
        if (managerId) {
            headers['login-customer-id'] = managerId.replace(/-/g, '')
        }

        const searchRes = await fetch(`https://googleads.googleapis.com/v23/customers/${cid}/googleAds:search`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, pageSize: 10000 })
        })

        if (!searchRes.ok) {
            const errBody = await searchRes.text()
            console.error('[Reports Google] API error:', searchRes.status, errBody)
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

        const spend = totalCostMicros / 1_000_000

        return {
            platform: 'Google Ads',
            impressions: totalImpressions,
            clicks: totalClicks,
            spend: Math.round(spend * 100) / 100,
            ctr: totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0,
            cpc: totalClicks > 0 ? (spend / totalClicks) : 0,
            reach: 0,
            frequency: 0,
            conversions: Math.round(totalConversions)
        }
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
