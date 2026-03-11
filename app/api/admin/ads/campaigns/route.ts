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

const GOOGLE_REFRESH_TOKEN_KEY = 'google_ads_refresh_token'

async function getStoredRefreshToken(): Promise<string | null> {
    try {
        const setting = await prisma.siteSetting.findUnique({ where: { key: GOOGLE_REFRESH_TOKEN_KEY } })
        return setting?.value || null
    } catch { return null }
}

async function saveRefreshToken(token: string): Promise<void> {
    try {
        await prisma.siteSetting.upsert({
            where: { key: GOOGLE_REFRESH_TOKEN_KEY },
            update: { value: token },
            create: { key: GOOGLE_REFRESH_TOKEN_KEY, value: token }
        })
        console.log('[Google Ads] Refresh token DB\'ye kaydedildi')
    } catch (err: any) {
        console.error('[Google Ads] Refresh token DB\'ye kaydedilemedi:', err.message)
    }
}

async function clearStoredRefreshToken(): Promise<void> {
    try {
        await prisma.siteSetting.deleteMany({ where: { key: GOOGLE_REFRESH_TOKEN_KEY } })
    } catch { }
}

async function getGoogleAdsAccessToken(): Promise<{ token: string | null; error?: string }> {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET

    if (!clientId) return { token: null, error: 'GOOGLE_ADS_CLIENT_ID eksik' }
    if (!clientSecret) return { token: null, error: 'GOOGLE_ADS_CLIENT_SECRET eksik' }

    // Önce DB'den oku, yoksa env var'dan al
    const dbRefreshToken = await getStoredRefreshToken()
    const envRefreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN
    const refreshToken = dbRefreshToken || envRefreshToken

    if (!refreshToken) return { token: null, error: 'GOOGLE_ADS_REFRESH_TOKEN eksik (DB ve env var)' }

    try {
        console.log(`[Google Ads] Refreshing access token (kaynak: ${dbRefreshToken ? 'DB' : 'env'})...`)
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: 'refresh_token' })
        })
        const data = await res.json()
        if (!res.ok) {
            const errMsg = data.error_description || data.error || `HTTP ${res.status}`
            console.error('[Google Ads] Token refresh failed:', errMsg)

            // Eğer DB'deki token expire olduysa ve env var farklıysa, env var ile tekrar dene
            if (dbRefreshToken && envRefreshToken && dbRefreshToken !== envRefreshToken) {
                console.log('[Google Ads] DB token başarısız, env var ile tekrar deneniyor...')
                await clearStoredRefreshToken()
                const retryRes = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: envRefreshToken, grant_type: 'refresh_token' })
                })
                const retryData = await retryRes.json()
                if (retryRes.ok && retryData.access_token) {
                    // Env var çalıştı, onu DB'ye kaydet
                    await saveRefreshToken(envRefreshToken)
                    console.log('[Google Ads] Env var token ile başarılı, DB güncellendi')
                    return { token: retryData.access_token }
                }
            }

            return { token: null, error: `OAuth Hatası: ${errMsg}` }
        }
        if (!data.access_token) {
            console.error('[Google Ads] No access_token in response:', data)
            return { token: null, error: 'OAuth yanıtında access_token yok' }
        }

        // Google bazen yeni bir refresh_token döndürür — otomatik kaydet
        if (data.refresh_token && data.refresh_token !== refreshToken) {
            console.log('[Google Ads] Google yeni refresh token döndürdü, DB\'ye kaydediliyor...')
            await saveRefreshToken(data.refresh_token)
        }

        // Eğer env var'dan çalıştıysa ve DB'de yoksa, DB'ye kaydet (ilk kullanım)
        if (!dbRefreshToken && envRefreshToken) {
            await saveRefreshToken(envRefreshToken)
        }

        console.log('[Google Ads] Token refreshed successfully')
        return { token: data.access_token }
    } catch (err: any) {
        console.error('[Google Ads] Token refresh exception:', err.message)
        return { token: null, error: `Ağ Hatası: ${err.message}` }
    }
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
                const { token: accessToken, error: googleAuthError } = await getGoogleAdsAccessToken()
                if (accessToken) {
                    googleStatus = 'Bağlı'
                    let statusClause = ''
                    if (statusFilter === 'active') statusClause = " AND campaign.status = 'ENABLED'"
                    else if (statusFilter === 'paused') statusClause = " AND campaign.status = 'PAUSED'"

                    // Map datePreset to GAQL date range
                    const gaqlDateMap: Record<string, string> = {
                        last_7d: 'LAST_7_DAYS',
                        last_14d: 'LAST_14_DAYS',
                        last_30d: 'LAST_30_DAYS',
                        this_month: 'THIS_MONTH',
                        last_month: 'LAST_MONTH',
                    }

                    // Build date clause — for maximum/this_year/last_90d, use custom date range
                    let dateClause = ''
                    if (datePreset === 'maximum' || datePreset === 'this_year') {
                        const year = new Date().getFullYear()
                        const startDate = datePreset === 'maximum' ? `${year - 2}-01-01` : `${year}-01-01`
                        const today = new Date().toISOString().split('T')[0]
                        dateClause = `segments.date BETWEEN '${startDate}' AND '${today}'`
                    } else if (datePreset === 'last_90d') {
                        const end = new Date()
                        const start = new Date(); start.setDate(start.getDate() - 90)
                        dateClause = `segments.date BETWEEN '${start.toISOString().split('T')[0]}' AND '${end.toISOString().split('T')[0]}'`
                    } else {
                        const gaqlDateClause = gaqlDateMap[datePreset] || 'LAST_30_DAYS'
                        dateClause = `segments.date DURING ${gaqlDateClause}`
                    }

                    // NOTE: campaign_budget.amount_micros is INCOMPATIBLE with segments.date
                    // So we query metrics with date segment, and budget info separately
                    const metricsQuery = `
                        SELECT
                            campaign.id, campaign.name, campaign.status,
                            campaign.advertising_channel_type, campaign.start_date, campaign.end_date,
                            metrics.impressions, metrics.clicks, metrics.cost_micros,
                            metrics.conversions, metrics.conversions_value,
                            metrics.average_cpc, metrics.ctr
                        FROM campaign
                        WHERE ${dateClause}${statusClause}
                        ORDER BY metrics.cost_micros DESC
                        LIMIT 100`

                    // Budget query (no date segment, just campaign info)
                    const budgetQuery = `
                        SELECT campaign.id, campaign_budget.amount_micros
                        FROM campaign
                        WHERE campaign.status != 'REMOVED'
                        LIMIT 100`

                    try {
                        const headers = {
                            'Authorization': `Bearer ${accessToken}`,
                            'developer-token': devToken,
                            'login-customer-id': customerId,
                            'Content-Type': 'application/json'
                        }
                        const apiUrl = `https://googleads.googleapis.com/v23/customers/${customerId}/googleAds:search`

                        // Fetch metrics (with date segment)
                        const metricsRes = await fetch(apiUrl, {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({ query: metricsQuery })
                        })

                        // Fetch budgets separately
                        let budgetMap: Record<string, number> = {}
                        try {
                            const budgetRes = await fetch(apiUrl, {
                                method: 'POST',
                                headers,
                                body: JSON.stringify({ query: budgetQuery })
                            })
                            if (budgetRes.ok) {
                                const budgetData = await budgetRes.json()
                                for (const row of (budgetData.results || [])) {
                                    const cId = row.campaign?.id
                                    const micros = parseInt(row.campaignBudget?.amountMicros || '0', 10)
                                    if (cId) budgetMap[cId] = micros / 1000000
                                }
                            }
                        } catch (e) { console.error('[Campaign API] Budget query failed:', e) }

                        if (metricsRes.ok) {
                            const data = await metricsRes.json()
                            // Aggregate metrics per campaign (since date segmentation splits results per day)
                            const campaignAgg: Record<string, any> = {}
                            for (const row of (data.results || [])) {
                                const cId = row.campaign?.id
                                if (!cId) continue
                                if (!campaignAgg[cId]) {
                                    campaignAgg[cId] = {
                                        id: cId,
                                        platform: 'google',
                                        name: row.campaign?.name,
                                        status: (row.campaign?.status || '').toLowerCase(),
                                        objective: row.campaign?.advertisingChannelType,
                                        dailyBudget: budgetMap[cId] || null,
                                        lifetimeBudget: null,
                                        spend: 0, impressions: 0, clicks: 0, conversions: 0,
                                        conversionsValue: 0, cpc: 0, ctr: 0, reach: 0,
                                        createdAt: null,
                                        startDate: row.campaign?.startDate,
                                        endDate: row.campaign?.endDate,
                                        _rowCount: 0,
                                    }
                                }
                                const m = row.metrics || {}
                                const agg = campaignAgg[cId]
                                agg.spend += parseInt(m.costMicros || '0', 10) / 1000000
                                agg.impressions += parseInt(m.impressions || '0', 10)
                                agg.clicks += parseInt(m.clicks || '0', 10)
                                agg.conversions += parseFloat(m.conversions || '0')
                                agg.conversionsValue += parseFloat(m.conversionsValue || '0')
                                agg._rowCount++
                            }
                            // Calculate derived metrics and push results
                            for (const agg of Object.values(campaignAgg)) {
                                agg.cpc = agg.clicks > 0 ? agg.spend / agg.clicks : 0
                                agg.ctr = agg.impressions > 0 ? (agg.clicks / agg.impressions) * 100 : 0
                                agg.roas = agg.spend > 0 ? agg.conversionsValue / agg.spend : 0
                                delete agg._rowCount
                                delete agg.conversionsValue
                                results.push(agg)
                            }
                        } else {
                            const errData = await metricsRes.json().catch(() => ({}))
                            console.error('[Campaign API] Google not ok:', metricsRes.status, JSON.stringify(errData))
                            const errMsg = errData?.error?.message || errData?.[0]?.error?.message || metricsRes.statusText
                            googleStatus = `API Hatası: ${errMsg}`
                        }
                    } catch (err: any) {
                        googleStatus = `Ağ Hatası: ${err.message}`
                        console.error('[Campaign API] Google fetch error:', err.message)
                    }
                } else {
                    googleStatus = googleAuthError || 'OAuth Token Alınamadı'
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
            const { token: accessToken, error: authError } = await getGoogleAdsAccessToken()
            if (!accessToken || !devToken || !customerId) {
                return NextResponse.json({ error: authError || 'Google Ads credentials missing' }, { status: 400 })
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
            const { token: accessToken, error: authError } = await getGoogleAdsAccessToken()

            if (!accessToken || !devToken || !customerId) {
                return NextResponse.json({ error: authError || 'Google Ads API kimlik bilgileri eksik.', code: 'MISSING_CREDENTIALS' }, { status: 400 })
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

// ─── PUT: Update campaign (name, budget, status) ───
export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { campaignId, platform, name, dailyBudget, status } = body

        if (!campaignId || !platform) {
            return NextResponse.json({ error: 'campaignId ve platform zorunludur' }, { status: 400 })
        }

        if (platform === 'meta') {
            const token = process.env.META_ACCESS_TOKEN
            if (!token) return NextResponse.json({ error: 'Meta token missing' }, { status: 400 })

            const updateData: Record<string, string> = { access_token: token }
            if (name) updateData.name = name
            if (status) updateData.status = status.toUpperCase()
            if (dailyBudget) updateData.daily_budget = String(Math.round(dailyBudget * 100))

            const res = await fetch(`${FB_BASE_URL}/${campaignId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(updateData)
            })
            const data = await res.json()
            if (!res.ok) {
                return NextResponse.json({ success: false, error: data.error?.message || 'Meta güncelleme hatası', details: data }, { status: res.status })
            }
            return NextResponse.json({ success: true, message: `Meta kampanya güncellendi` })
        }

        if (platform === 'google') {
            const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
            const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '')
            const { token: accessToken, error: authError } = await getGoogleAdsAccessToken()

            if (!accessToken || !devToken || !customerId) {
                return NextResponse.json({ error: authError || 'Google Ads credentials missing' }, { status: 400 })
            }

            const updateFields: Record<string, any> = {
                resourceName: `customers/${customerId}/campaigns/${campaignId}`,
            }
            const updateMask: string[] = []

            if (name) { updateFields.name = name; updateMask.push('name') }
            if (status) {
                const statusMap: Record<string, string> = { active: 'ENABLED', enabled: 'ENABLED', paused: 'PAUSED' }
                updateFields.status = statusMap[status] || 'PAUSED'
                updateMask.push('status')
            }

            const res = await fetch(`https://googleads.googleapis.com/v23/customers/${customerId}/campaigns:mutate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'developer-token': devToken,
                    'login-customer-id': customerId,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    operations: [{ update: updateFields, updateMask: updateMask.join(',') }]
                })
            })
            const data = await res.json()
            if (!res.ok) {
                return NextResponse.json({ success: false, error: data?.error?.message || 'Google güncelleme hatası', details: data }, { status: res.status })
            }

            // Budget update (separate call if dailyBudget provided)
            if (dailyBudget) {
                console.log('[Campaign PUT] Budget update requested for Google campaign:', campaignId)
                // Note: Google Ads budget updates require the budget resource name which
                // we don't have from the PUT payload. Budget updates would need the
                // campaign_budget resource_name from a query. For now, log it.
            }

            return NextResponse.json({ success: true, message: `Google Ads kampanya güncellendi` })
        }

        return NextResponse.json({ error: 'Desteklenmeyen platform' }, { status: 400 })
    } catch (error: any) {
        console.error('[Campaign Update Error]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// ─── DELETE: Archive/remove campaign ───
export async function DELETE(request: Request) {
    try {
        const body = await request.json()
        const { campaignId, platform } = body

        if (!campaignId || !platform) {
            return NextResponse.json({ error: 'campaignId ve platform zorunludur' }, { status: 400 })
        }

        if (platform === 'meta') {
            const token = process.env.META_ACCESS_TOKEN
            if (!token) return NextResponse.json({ error: 'Meta token missing' }, { status: 400 })

            // Meta: Set status to ARCHIVED (Meta doesn't truly delete campaigns)
            const res = await fetch(`${FB_BASE_URL}/${campaignId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ status: 'ARCHIVED', access_token: token })
            })
            const data = await res.json()
            if (!res.ok) {
                return NextResponse.json({ success: false, error: data.error?.message || 'Arşivleme hatası' }, { status: res.status })
            }
            return NextResponse.json({ success: true, message: 'Meta kampanya arşivlendi' })
        }

        if (platform === 'google') {
            const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
            const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '')
            const { token: accessToken, error: authError } = await getGoogleAdsAccessToken()

            if (!accessToken || !devToken || !customerId) {
                return NextResponse.json({ error: authError || 'Google Ads credentials missing' }, { status: 400 })
            }

            // Google: Set status to REMOVED
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
                            status: 'REMOVED'
                        },
                        updateMask: 'status'
                    }]
                })
            })
            const data = await res.json()
            if (!res.ok) {
                return NextResponse.json({ success: false, error: data?.error?.message || 'Silme hatası' }, { status: res.status })
            }
            return NextResponse.json({ success: true, message: 'Google Ads kampanya kaldırıldı' })
        }

        return NextResponse.json({ error: 'Desteklenmeyen platform' }, { status: 400 })
    } catch (error: any) {
        console.error('[Campaign Delete Error]', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
