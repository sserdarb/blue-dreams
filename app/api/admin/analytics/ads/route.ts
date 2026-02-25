import { NextResponse } from 'next/server'

// ─── Ads API Service ──────────────────────────────────────────────────
// Fetches Ad Spend, Impressions, Clicks, and ROAS from Meta Ads & Google Ads
// Requires: META_ACCESS_TOKEN, FB_AD_ACCOUNT_ID, GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID

const META_API_VERSION = 'v19.0'
const FB_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`
// Google Ads typically requires the 'google-ads-api' node package, but we'll mock the fetch 
// structure until the specific Google Ads Node library or OAuth2 setup is ready, 
// since Google Ads REST API requires complex OAuth2 signed requests.

export async function GET() {
    try {
        const metaToken = process.env.META_ACCESS_TOKEN
        const fbAdAccountId = process.env.FB_AD_ACCOUNT_ID
        // const googleDeveloperToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
        // const googleCustomerId = process.env.GOOGLE_ADS_CUSTOMER_ID

        const results = {
            metaAds: null as any,
            googleAds: null as any,
            totalSpend: 0,
            totalImpressions: 0,
            totalClicks: 0
        }

        // 1. Fetch Meta Ads Data
        // Needs ads_read permission
        if (metaToken && fbAdAccountId) {
            // Using level=account to get aggregated data for the last 30 days
            const response = await fetch(
                `${FB_BASE_URL}/act_${fbAdAccountId}/insights?fields=spend,impressions,clicks,purchase_roas,action_values&date_preset=last_30d&access_token=${metaToken}`
            )

            if (response.ok) {
                const data = await response.json()
                const insights = data.data?.[0] || {}

                let roas = 0
                if (insights.purchase_roas && insights.purchase_roas.length > 0) {
                    roas = parseFloat(insights.purchase_roas[0].value) || 0
                }

                results.metaAds = {
                    spend: parseFloat(insights.spend || 0),
                    impressions: parseInt(insights.impressions || 0, 10),
                    clicks: parseInt(insights.clicks || 0, 10),
                    roas: roas
                }
            } else {
                console.warn('[Ads API] Failed to fetch Meta Ads data', await response.text())
            }
        }

        // 2. Fetch Google Ads Data (Placeholder for when OAuth2 is setup)
        // Usually implemented via the google-ads-api client library:
        // const customer = client.Customer({ customer_id: googleCustomerId, ... })
        // const query = "SELECT metrics.cost_micros, metrics.impressions, metrics.clicks FROM customer"
        results.googleAds = {
            status: 'Pending Google Ads OAuth2 Credentials',
            spend: 0,
            impressions: 0,
            clicks: 0,
            roas: 0
        }

        // Calculate Totals
        results.totalSpend = (results.metaAds?.spend || 0) + (results.googleAds?.spend || 0)
        results.totalImpressions = (results.metaAds?.impressions || 0) + (results.googleAds?.impressions || 0)
        results.totalClicks = (results.metaAds?.clicks || 0) + (results.googleAds?.clicks || 0)

        // Return the combined metrics
        return NextResponse.json({
            success: true,
            data: results
        })

    } catch (error: any) {
        console.error('[Ads API Route Error]', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch Ads data' },
            { status: 500 }
        )
    }
}
