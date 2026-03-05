import { NextResponse } from 'next/server'

// ─── Google Ads REST API (replaces google-ads-api npm) ──────────────
// Uses GAQL over REST — same pattern as analytics/ads/route.ts
const GOOGLE_ADS_API_VERSION = 'v23'

async function getGoogleAdsAccessToken() {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN
    if (!clientId || !clientSecret || !refreshToken) return null

    try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
        })
        if (!res.ok) return null
        const data = await res.json()
        return data.access_token
    } catch { return null }
}

async function queryGoogleAds(accessToken: string, customerId: string, devToken: string, query: string) {
    const res = await fetch(
        `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/googleAds:search`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': devToken,
                'login-customer-id': customerId,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        }
    )
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error?.message || `Google Ads API error: ${res.status}`)
    }
    return res.json()
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'stats'

        const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
        const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '')

        if (!devToken || !customerId || !process.env.GOOGLE_ADS_REFRESH_TOKEN) {
            return NextResponse.json({
                error: 'Google Ads credentials not configured',
                requiresAuth: true
            }, { status: 401 })
        }

        const accessToken = await getGoogleAdsAccessToken()
        if (!accessToken) {
            return NextResponse.json({ error: 'Failed to refresh Google Ads token' }, { status: 401 })
        }

        if (action === 'campaigns') {
            // Fetch ALL campaigns (active + paused + removed)
            const statusFilter = searchParams.get('status') || 'ALL'
            let whereClause = 'WHERE segments.date DURING LAST_30_DAYS'
            if (statusFilter === 'ENABLED') whereClause += " AND campaign.status = 'ENABLED'"
            else if (statusFilter === 'PAUSED') whereClause += " AND campaign.status = 'PAUSED'"
            // ALL = no status filter

            const query = `
                SELECT
                    campaign.id,
                    campaign.name,
                    campaign.status,
                    campaign.advertising_channel_type,
                    campaign.start_date,
                    campaign.end_date,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.cost_micros,
                    metrics.conversions,
                    metrics.conversions_value
                FROM campaign
                ${whereClause}
                ORDER BY metrics.cost_micros DESC
                LIMIT 100
            `

            const data = await queryGoogleAds(accessToken, customerId, devToken, query)
            const campaigns = (data.results || []).map((row: any) => ({
                id: row.campaign?.id,
                name: row.campaign?.name,
                status: row.campaign?.status?.toLowerCase() || 'unknown',
                channelType: row.campaign?.advertisingChannelType || 'UNKNOWN',
                startDate: row.campaign?.startDate,
                endDate: row.campaign?.endDate,
                impressions: parseInt(row.metrics?.impressions || '0', 10),
                clicks: parseInt(row.metrics?.clicks || '0', 10),
                cost: (parseInt(row.metrics?.costMicros || '0', 10)) / 1000000,
                conversions: parseFloat(row.metrics?.conversions || '0'),
                conversionValue: parseFloat(row.metrics?.conversionsValue || '0'),
            }))

            return NextResponse.json({ success: true, campaigns })
        }

        if (action === 'stats') {
            // Aggregate stats
            const query = `
                SELECT
                    campaign.id,
                    campaign.name,
                    metrics.impressions,
                    metrics.clicks,
                    metrics.cost_micros,
                    metrics.conversions
                FROM campaign
                WHERE segments.date DURING LAST_30_DAYS
                ORDER BY metrics.cost_micros DESC
            `

            const data = await queryGoogleAds(accessToken, customerId, devToken, query)
            const campaigns = (data.results || []).map((row: any) => ({
                id: row.campaign?.id,
                name: row.campaign?.name,
                impressions: parseInt(row.metrics?.impressions || '0', 10),
                clicks: parseInt(row.metrics?.clicks || '0', 10),
                cost: (parseInt(row.metrics?.costMicros || '0', 10)) / 1000000,
                conversions: parseFloat(row.metrics?.conversions || '0'),
            }))

            return NextResponse.json({ success: true, campaigns })
        }

        // action=update-status — pause/enable campaign
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error: any) {
        console.error('[Google Ads API Error]', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
