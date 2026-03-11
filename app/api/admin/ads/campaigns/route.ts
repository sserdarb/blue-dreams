import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isDemoSession } from '@/lib/demo-session'

export const dynamic = 'force-dynamic'

async function isDemoMode(): Promise<boolean> {
    try {
        if (await isDemoSession()) return true

        // If demo mode is explicitly forced via env vars
        if (process.env.DEMO_MODE === 'true' || process.env.DEMO_MODE_ADS === 'true') return true

        // As a fallback to preserve UI state when no real tokens are connected:
        // Use demo mock campaigns so the page isn't totally empty.
        const metaToken = process.env.META_ACCESS_TOKEN
        const googleToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
        if (!metaToken && !googleToken) {
            return true
        }

        return false
    } catch { return false }
}

// ─── Campaign Management API ──────────────────────────────────────
// GET: List all campaigns from Meta + Google Ads
// POST: Create new campaign (Meta Marketing API)
// PATCH: Update campaign status (pause/activate)

const META_API_VERSION = 'v19.0'
const FB_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

async function getGoogleAdsAccessToken() {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN
    if (!clientId || !clientSecret || !refreshToken) return null
    try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' })
        })
        if (!res.ok) return null
        return (await res.json()).access_token
    } catch { return null }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const platform = searchParams.get('platform') || 'all'
        const datePreset = searchParams.get('datePreset') || 'last_30d'
        const statusFilter = searchParams.get('status') || 'all' // all, active, paused

        const results: any[] = []
        let metaStatus = 'Bağlantı Bekleniyor'
        let googleStatus = 'Bağlantı Bekleniyor'

        // ─── Meta Ads Campaigns ───
        if (platform === 'all' || platform === 'meta') {
            const token = process.env.META_ACCESS_TOKEN
            const adAccountId = process.env.META_ADS_ACCOUNT_ID || process.env.FB_AD_ACCOUNT_ID
            if (token && adAccountId) {
                metaStatus = 'Bağlı'
                const acct = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`
                console.log('[Campaign API] Fetching Meta campaigns for account:', acct, 'statusFilter:', statusFilter)
                // Build status filter for Meta
                let metaStatusFilter = ''
                if (statusFilter === 'active') metaStatusFilter = '&effective_status=["ACTIVE"]'
                else if (statusFilter === 'paused') metaStatusFilter = '&effective_status=["PAUSED"]'
                else metaStatusFilter = '&effective_status=["ACTIVE","PAUSED","ARCHIVED","IN_PROCESS","WITH_ISSUES"]'

                try {
                    const url = `${FB_BASE_URL}/${acct}/campaigns?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,created_time,start_time,stop_time,insights.date_preset(${datePreset}){spend,impressions,clicks,cpc,ctr,reach,actions,cost_per_action_type}&limit=100${metaStatusFilter}&access_token=${token}`
                    console.log('[Campaign API] Fetching URL:', url.replace(token, 'TOKEN_HIDDEN'))
                    const res = await fetch(url)
                    if (res.ok) {
                        const data = await res.json()
                        for (const c of (data.data || [])) {
                            const insights = c.insights?.data?.[0] || {}
                            const conversions = (insights.actions || [])
                                .filter((a: any) => ['offsite_conversion.fb_pixel_purchase', 'lead', 'complete_registration'].includes(a.action_type))
                                .reduce((s: number, a: any) => s + parseInt(a.value || '0'), 0)

                            results.push({
                                id: c.id,
                                platform: 'meta',
                                name: c.name,
                                status: (c.status || '').toLowerCase(),
                                objective: c.objective,
                                dailyBudget: c.daily_budget ? parseInt(c.daily_budget) / 100 : null,
                                lifetimeBudget: c.lifetime_budget ? parseInt(c.lifetime_budget) / 100 : null,
                                spend: parseFloat(insights.spend || '0'),
                                impressions: parseInt(insights.impressions || '0'),
                                clicks: parseInt(insights.clicks || '0'),
                                cpc: parseFloat(insights.cpc || '0'),
                                ctr: parseFloat(insights.ctr || '0'),
                                reach: parseInt(insights.reach || '0'),
                                conversions,
                                roas: 0,
                                createdAt: c.created_time,
                                startDate: c.start_time,
                                endDate: c.stop_time,
                            })
                        }
                    } else {
                        const errData = await res.json().catch(() => ({}))
                        console.error('[Campaign API] Meta not ok:', res.status, errData)
                        metaStatus = `API Hatası: ${errData.error?.message || res.statusText}`
                    }
                } catch (err: any) {
                    metaStatus = 'Bağlantı Hatası'
                    console.error('[Campaign API] Meta fetch error:', err.message)
                }
            }
        }

        // ─── Google Ads Campaigns ───
        if (platform === 'all' || platform === 'google') {
            const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
            const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '')
            if (devToken && customerId) {
                const accessToken = await getGoogleAdsAccessToken()
                if (accessToken) {
                    googleStatus = 'Bağlı'
                    let statusClause = ''
                    if (statusFilter === 'active') statusClause = " AND campaign.status = 'ENABLED'"
                    else if (statusFilter === 'paused') statusClause = " AND campaign.status = 'PAUSED'"

                    const query = `
                        SELECT
                            campaign.id, campaign.name, campaign.status,
                            campaign.advertising_channel_type, campaign.start_date, campaign.end_date,
                            campaign_budget.amount_micros,
                            metrics.impressions, metrics.clicks, metrics.cost_micros,
                            metrics.conversions, metrics.conversions_value,
                            metrics.average_cpc, metrics.ctr
                        FROM campaign
                        WHERE segments.date DURING LAST_30_DAYS${statusClause}
                        ORDER BY metrics.cost_micros DESC
                        LIMIT 100`

                    try {
                        const res = await fetch(`https://googleads.googleapis.com/v23/customers/${customerId}/googleAds:search`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${accessToken}`,
                                'developer-token': devToken,
                                'login-customer-id': customerId,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ query })
                        })
                        if (res.ok) {
                            const data = await res.json()
                            for (const row of (data.results || [])) {
                                const m = row.metrics || {}
                                const costMicros = parseInt(m.costMicros || '0', 10)
                                const budgetMicros = parseInt(row.campaignBudget?.amountMicros || '0', 10)
                                results.push({
                                    id: row.campaign?.id,
                                    platform: 'google',
                                    name: row.campaign?.name,
                                    status: (row.campaign?.status || '').toLowerCase(),
                                    objective: row.campaign?.advertisingChannelType,
                                    dailyBudget: budgetMicros > 0 ? budgetMicros / 1000000 : null,
                                    lifetimeBudget: null,
                                    spend: costMicros / 1000000,
                                    impressions: parseInt(m.impressions || '0', 10),
                                    clicks: parseInt(m.clicks || '0', 10),
                                    cpc: parseInt(m.averageCpc || '0', 10) / 1000000,
                                    ctr: parseFloat(m.ctr || '0') * 100,
                                    reach: 0,
                                    conversions: parseFloat(m.conversions || '0'),
                                    roas: costMicros > 0 ? (parseFloat(m.conversionsValue || '0') / (costMicros / 1000000)) : 0,
                                    createdAt: null,
                                    startDate: row.campaign?.startDate,
                                    endDate: row.campaign?.endDate,
                                })
                            }
                        } else {
                            const errData = await res.json().catch(() => ({}))
                            console.error('[Campaign API] Google not ok:', res.status, errData)
                            googleStatus = `API Hatası: ${errData[0]?.error?.message || res.statusText}`
                        }
                    } catch (err: any) {
                        googleStatus = 'API Bağlantı Ağı Hatası'
                        console.error('[Campaign API] Google fetch error:', err.message)
                    }
                } else {
                    googleStatus = 'API Bağlantı Hatası'
                }
            }
        }

        // Sort by spend desc
        results.sort((a, b) => b.spend - a.spend)

        // SADECE demo modu açıksa mock data bas. Kullanıcı talebi: Test et ve fullstack kodla.
        const demoRequested = searchParams.get('demo') === 'true' || await isDemoMode()

        if (results.length === 0 && demoRequested) {
            metaStatus = 'Bağlı (Demo)'
            googleStatus = 'Bağlı (Demo)'
            const mocks = [
                { id: 'mock_m_1', platform: 'meta', name: 'Yaz Erken Rezervasyon (Meta)', status: 'active', objective: 'OUTCOME_TRAFFIC', dailyBudget: 50, spend: 1250.40, impressions: 45000, clicks: 1250, cpc: 1.0, ctr: 2.7, conversions: 45, roas: 4.2 },
                { id: 'mock_m_2', platform: 'meta', name: 'Spa Paketleri Hedefli', status: 'paused', objective: 'AWARENESS', dailyBudget: 25, spend: 400.0, impressions: 12000, clicks: 300, cpc: 1.33, ctr: 2.5, conversions: 5, roas: 1.5 },
                { id: 'mock_g_1', platform: 'google', name: 'Bodrum Lüks Otel Arama Ağı', status: 'active', objective: 'SEARCH', dailyBudget: 100, spend: 3200.50, impressions: 15000, clicks: 2100, cpc: 1.52, ctr: 14.0, conversions: 80, roas: 6.5 },
                { id: 'mock_g_2', platform: 'google', name: 'Almanya & İngiltere Dönüşüm', status: 'active', objective: 'DISPLAY', dailyBudget: 150, spend: 4500.00, impressions: 200000, clicks: 4500, cpc: 1.0, ctr: 2.25, conversions: 120, roas: 8.0 },
                { id: 'mock_m_3', platform: 'meta', name: 'Kış Sezonu İndirimi (Pasif)', status: 'paused', objective: 'OUTCOME_LEADS', dailyBudget: 60, spend: 100.0, impressions: 5000, clicks: 100, cpc: 1.0, ctr: 2.0, conversions: 2, roas: 1.2 }
            ]

            for (const m of mocks) {
                if (statusFilter === 'active' && m.status !== 'active') continue;
                if (statusFilter === 'paused' && m.status !== 'paused') continue;
                results.push(m);
            }
        }

        // Totals
        const totals = {
            totalCampaigns: results.length,
            activeCampaigns: results.filter(c => c.status === 'active' || c.status === 'enabled').length,
            pausedCampaigns: results.filter(c => c.status === 'paused').length,
            totalSpend: results.reduce((s, c) => s + c.spend, 0),
            totalImpressions: results.reduce((s, c) => s + c.impressions, 0),
            totalClicks: results.reduce((s, c) => s + c.clicks, 0),
            totalConversions: results.reduce((s, c) => s + c.conversions, 0),
            avgCpc: 0,
            avgCtr: 0,
        }
        if (totals.totalClicks > 0) totals.avgCpc = totals.totalSpend / totals.totalClicks
        if (totals.totalImpressions > 0) totals.avgCtr = (totals.totalClicks / totals.totalImpressions) * 100

        return NextResponse.json({ success: true, campaigns: results, totals, datePreset, metaStatus, googleStatus })
    } catch (error: any) {
        console.error('[Campaign API Error]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// ─── PATCH: Update campaign status ───
export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const { campaignId, platform, newStatus } = body

        if (platform === 'meta') {
            const token = process.env.META_ACCESS_TOKEN
            if (!token) return NextResponse.json({ error: 'Meta token missing' }, { status: 400 })

            const res = await fetch(`${FB_BASE_URL}/${campaignId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus.toUpperCase(), access_token: token })
            })
            const data = await res.json()
            return NextResponse.json({ success: data.success !== false, data })
        }

        if (platform === 'google') {
            const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
            const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '')
            const accessToken = await getGoogleAdsAccessToken()
            if (!accessToken || !devToken || !customerId) {
                return NextResponse.json({ error: 'Google Ads credentials missing' }, { status: 400 })
            }

            const statusMap: Record<string, number> = { enabled: 2, paused: 3, removed: 4 }
            const res = await fetch(`https://googleads.googleapis.com/v23/customers/${customerId}/campaigns:mutate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'developer-token': devToken,
                    'login-customer-id': customerId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    operations: [{
                        update: {
                            resourceName: `customers/${customerId}/campaigns/${campaignId}`,
                            status: statusMap[newStatus] || 3
                        },
                        updateMask: 'status'
                    }]
                })
            })
            const data = await res.json()
            return NextResponse.json({ success: res.ok, data })
        }

        return NextResponse.json({ error: 'Unsupported platform' }, { status: 400 })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// ─── POST: Create new campaign ───
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { platform, name, objective, dailyBudget, status = 'PAUSED', startDate, endDate, targetUrl } = body

        if (!platform || !name) {
            return NextResponse.json({ error: 'Platform ve kampanya adı zorunludur' }, { status: 400 })
        }

        if (platform === 'meta') {
            const token = process.env.META_ACCESS_TOKEN
            const adAccountId = process.env.META_ADS_ACCOUNT_ID || process.env.FB_AD_ACCOUNT_ID
            if (!token || !adAccountId) {
                return NextResponse.json({ error: 'Meta API kimlik bilgileri eksik. META_ACCESS_TOKEN ve META_ADS_ACCOUNT_ID gereklidir.', code: 'MISSING_CREDENTIALS' }, { status: 400 })
            }

            const acct = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`

            // Step 1: Create campaign
            const campaignParams: Record<string, string> = {
                name,
                objective: objective || 'OUTCOME_TRAFFIC',
                status: status.toUpperCase(),
                special_ad_categories: '[]',
                access_token: token,
            }
            if (dailyBudget) {
                campaignParams.daily_budget = String(Math.round(dailyBudget * 100)) // Meta uses cents
            }
            if (startDate) campaignParams.start_time = new Date(startDate).toISOString()
            if (endDate) campaignParams.end_time = new Date(endDate).toISOString()

            const res = await fetch(`${FB_BASE_URL}/${acct}/campaigns`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(campaignParams),
            })

            const data = await res.json()

            if (!res.ok) {
                return NextResponse.json({
                    success: false,
                    error: data.error?.message || 'Meta kampanya oluşturulamadı',
                    errorCode: data.error?.code,
                    details: data.error,
                }, { status: res.status })
            }

            return NextResponse.json({
                success: true,
                campaignId: data.id,
                platform: 'meta',
                message: `Meta kampanya "${name}" başarıyla oluşturuldu`,
            })
        }

        if (platform === 'google') {
            const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
            const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '')
            const accessToken = await getGoogleAdsAccessToken()

            if (!accessToken || !devToken || !customerId) {
                return NextResponse.json({ error: 'Google Ads API kimlik bilgileri eksik.', code: 'MISSING_CREDENTIALS' }, { status: 400 })
            }

            // Google Ads requires budget and campaign to be created separately
            // Step 1: Create campaign budget
            const budgetRes = await fetch(`https://googleads.googleapis.com/v23/customers/${customerId}/campaignBudgets:mutate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'developer-token': devToken,
                    'login-customer-id': customerId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operations: [{
                        create: {
                            name: `${name}_budget`,
                            amountMicros: String(Math.round((dailyBudget || 100) * 1000000)),
                            deliveryMethod: 'STANDARD',
                        }
                    }]
                })
            })

            if (!budgetRes.ok) {
                const budgetError = await budgetRes.json()
                return NextResponse.json({
                    success: false,
                    error: 'Google Ads bütçe oluşturulamadı',
                    details: budgetError,
                }, { status: budgetRes.status })
            }

            const budgetData = await budgetRes.json()
            const budgetResourceName = budgetData.results?.[0]?.resourceName

            // Step 2: Create campaign
            const objectiveMap: Record<string, string> = {
                'SEARCH': 'SEARCH',
                'DISPLAY': 'DISPLAY',
                'VIDEO': 'VIDEO',
                'SHOPPING': 'SHOPPING',
            }

            const campaignRes = await fetch(`https://googleads.googleapis.com/v23/customers/${customerId}/campaigns:mutate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'developer-token': devToken,
                    'login-customer-id': customerId,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    operations: [{
                        create: {
                            name,
                            advertisingChannelType: objectiveMap[objective] || 'SEARCH',
                            status: status === 'ACTIVE' ? 'ENABLED' : 'PAUSED',
                            campaignBudget: budgetResourceName,
                            ...(startDate && { startDate: startDate.replace(/-/g, '') }),
                            ...(endDate && { endDate: endDate.replace(/-/g, '') }),
                        }
                    }]
                })
            })

            const campaignData = await campaignRes.json()

            if (!campaignRes.ok) {
                return NextResponse.json({
                    success: false,
                    error: 'Google Ads kampanya oluşturulamadı',
                    details: campaignData,
                }, { status: campaignRes.status })
            }

            return NextResponse.json({
                success: true,
                campaignId: campaignData.results?.[0]?.resourceName,
                platform: 'google',
                message: `Google Ads kampanya "${name}" başarıyla oluşturuldu`,
            })
        }

        return NextResponse.json({ error: 'Desteklenmeyen platform. "meta" veya "google" kullanın.' }, { status: 400 })
    } catch (error: any) {
        console.error('[Campaign Create Error]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
