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

// GET /api/admin/ads/keywords?adGroupId=XXX&campaignId=YYY
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const adGroupId = searchParams.get('adGroupId')
        const campaignId = searchParams.get('campaignId')

        if (!adGroupId && !campaignId) {
            return NextResponse.json({ error: 'adGroupId veya campaignId parametresi zorunludur' }, { status: 400 })
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

        let whereClause = ''
        if (adGroupId) whereClause = `WHERE ad_group.id = ${adGroupId}`
        else if (campaignId) whereClause = `WHERE campaign.id = ${campaignId}`

        const query = `
            SELECT
                ad_group_criterion.criterion_id,
                ad_group_criterion.keyword.text,
                ad_group_criterion.keyword.match_type,
                ad_group_criterion.status,
                ad_group_criterion.quality_info.quality_score,
                ad_group.id,
                ad_group.name,
                campaign.id,
                metrics.impressions,
                metrics.clicks,
                metrics.cost_micros,
                metrics.conversions,
                metrics.average_cpc,
                metrics.ctr,
                metrics.search_impression_share
            FROM keyword_view
            ${whereClause}
            ORDER BY metrics.impressions DESC
            LIMIT 100`

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
            console.error('[Keywords API] Google Ads error:', errText)
            // Graceful degradation for test token limitations
            if (errText.includes('PERMISSION_DENIED') || errText.includes('DEVELOPER_TOKEN')) {
                return NextResponse.json({
                    success: true,
                    keywords: [],
                    totalCount: 0,
                    notice: 'Anahtar kelime verileri için Google Ads Standard Access gereklidir. Developer token yetki seviyeniz yükseltildiğinde bu veriler otomatik olarak görünecektir.'
                })
            }
            return NextResponse.json({ success: false, error: 'Google Ads API hatası', details: errText }, { status: res.status })
        }

        const dataArray = await res.json()
        let flatResults: any[] = []
        if (Array.isArray(dataArray)) {
            for (const batch of dataArray) {
                if (batch.results) flatResults = flatResults.concat(batch.results)
            }
        }

        const keywords = flatResults.map(row => {
            const m = row.metrics || {}
            const costMicros = parseInt(m.costMicros || '0', 10)
            return {
                id: row.adGroupCriterion?.criterionId,
                keyword: row.adGroupCriterion?.keyword?.text || '',
                matchType: row.adGroupCriterion?.keyword?.matchType || 'UNKNOWN',
                status: (row.adGroupCriterion?.status || '').toLowerCase(),
                qualityScore: row.adGroupCriterion?.qualityInfo?.qualityScore || null,
                adGroupId: row.adGroup?.id,
                adGroupName: row.adGroup?.name,
                campaignId: row.campaign?.id,
                impressions: parseInt(m.impressions || '0', 10),
                clicks: parseInt(m.clicks || '0', 10),
                spend: costMicros / 1000000,
                conversions: parseFloat(m.conversions || '0'),
                cpc: parseInt(m.averageCpc || '0', 10) / 1000000,
                ctr: parseFloat(m.ctr || '0') * 100,
                searchImpressionShare: m.searchImpressionShare ? parseFloat(m.searchImpressionShare) * 100 : null,
            }
        })

        return NextResponse.json({ success: true, keywords, totalCount: keywords.length })
    } catch (error: any) {
        console.error('[Keywords API Error]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
