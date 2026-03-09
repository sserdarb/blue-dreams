import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

async function getGoogleAdsAccessToken() {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
    let refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN
    try {
        const fs = require('fs')
        if (fs.existsSync('.env')) {
            const envText = fs.readFileSync('.env', 'utf-8')
            const match = envText.match(/GOOGLE_ADS_REFRESH_TOKEN="?(.*?)"?(?:\n|$)/)
            if (match && match[1]) refreshToken = match[1]
        }
    } catch (e) { }
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

// GET /api/admin/ads/ad-groups?campaignId=XXX&dateFrom=YYYY-MM-DD&dateTo=YYYY-MM-DD
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const campaignId = searchParams.get('campaignId')
        const dateFrom = searchParams.get('dateFrom')
        const dateTo = searchParams.get('dateTo')

        if (!campaignId) {
            return NextResponse.json({ error: 'campaignId parametresi zorunludur' }, { status: 400 })
        }

        const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
        const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '')
        const managerId = (process.env.GOOGLE_ADS_MANAGER_ID || '').replace(/-/g, '')

        if (!devToken || !customerId) {
            return NextResponse.json({ error: 'Google Ads credentials missing' }, { status: 400 })
        }

        const accessToken = await getGoogleAdsAccessToken()
        if (!accessToken) {
            return NextResponse.json({ error: 'Google Ads token alınamadı' }, { status: 401 })
        }

        let dateClause = ''
        if (dateFrom && dateTo) {
            dateClause = ` AND segments.date BETWEEN '${dateFrom}' AND '${dateTo}'`
        }

        const query = `
            SELECT
                ad_group.id,
                ad_group.name,
                ad_group.status,
                ad_group.type,
                campaign.id,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.conversions_value,
                metrics.average_cpc,
                metrics.ctr
            FROM ad_group
            WHERE campaign.id = ${campaignId}${dateClause}
            ORDER BY metrics.cost_micros DESC
            LIMIT 50`

        const headers: any = {
            'Authorization': `Bearer ${accessToken}`,
            'developer-token': devToken,
            'Content-Type': 'application/json'
        }
        if (managerId) headers['login-customer-id'] = managerId

        const res = await fetch(`https://googleads.googleapis.com/v23/customers/${customerId}/googleAds:searchStream`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query })
        })

        if (!res.ok) {
            const errText = await res.text()
            console.error('[AdGroups API] Google Ads error:', errText)
            return NextResponse.json({ success: false, error: 'Google Ads API hatası', details: errText }, { status: res.status })
        }

        const dataArray = await res.json()
        let flatResults: any[] = []
        if (Array.isArray(dataArray)) {
            for (const batch of dataArray) {
                if (batch.results) flatResults = flatResults.concat(batch.results)
            }
        }

        const adGroups = flatResults.map(row => {
            const m = row.metrics || {}
            const costMicros = parseInt(m.costMicros || '0', 10)
            return {
                id: row.adGroup?.id,
                name: row.adGroup?.name,
                status: (row.adGroup?.status || '').toLowerCase(),
                type: row.adGroup?.type || 'UNKNOWN',
                campaignId: row.campaign?.id,
                impressions: parseInt(m.impressions || '0', 10),
                clicks: parseInt(m.clicks || '0', 10),
                spend: costMicros / 1000000,
                conversions: parseFloat(m.conversions || '0'),
                conversionsValue: parseFloat(m.conversionsValue || '0'),
                cpc: parseInt(m.averageCpc || '0', 10) / 1000000,
                ctr: parseFloat(m.ctr || '0') * 100,
                roas: costMicros > 0 ? (parseFloat(m.conversionsValue || '0') / (costMicros / 1000000)) : 0,
            }
        })

        return NextResponse.json({ success: true, adGroups, totalCount: adGroups.length })
    } catch (error: any) {
        console.error('[AdGroups API Error]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
