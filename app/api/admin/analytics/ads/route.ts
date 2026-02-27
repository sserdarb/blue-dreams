import { NextResponse } from 'next/server'

// ─── Ads API Service ──────────────────────────────────────────────────
// Fetches Ad Spend, Impressions, Clicks, and ROAS from Meta Ads & Google Ads
// Requires: META_ACCESS_TOKEN, FB_AD_ACCOUNT_ID
// Google Ads Requires: 
// GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, GOOGLE_ADS_REFRESH_TOKEN, 
// GOOGLE_ADS_DEVELOPER_TOKEN, GOOGLE_ADS_CUSTOMER_ID

const META_API_VERSION = 'v19.0'
const FB_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

async function getGoogleAdsAccessToken() {
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) return null;

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
        });

        if (!res.ok) {
            console.error('[Google Ads] Failed to refresh token:', await res.text());
            return null;
        }

        const data = await res.json();
        return data.access_token;
    } catch (e) {
        console.error('[Google Ads] Error refreshing token', e);
        return null;
    }
}

export async function GET() {
    try {
        const metaToken = process.env.META_ACCESS_TOKEN
        const fbAdAccountId = process.env.FB_AD_ACCOUNT_ID
        const googleDevToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN
        const googleCustomerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '') // remove dashes

        const results = {
            metaAds: null as any,
            googleAds: null as any,
            totalSpend: 0,
            totalImpressions: 0,
            totalClicks: 0
        }

        // 1. Fetch Meta Ads Data
        if (metaToken && fbAdAccountId) {
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
                    status: 'Connected',
                    spend: parseFloat(insights.spend || 0),
                    impressions: parseInt(insights.impressions || 0, 10),
                    clicks: parseInt(insights.clicks || 0, 10),
                    roas: roas
                }
            } else {
                results.metaAds = { status: 'Failed to fetch', spend: 0, impressions: 0, clicks: 0, roas: 0 }
                console.warn('[Ads API] Failed to fetch Meta Ads data', await response.text())
            }
        } else {
            results.metaAds = { status: 'Missing Meta Credentials', spend: 0, impressions: 0, clicks: 0, roas: 0 }
        }

        // 2. Fetch Google Ads Data
        if (googleDevToken && googleCustomerId && process.env.GOOGLE_ADS_REFRESH_TOKEN) {
            const accessToken = await getGoogleAdsAccessToken();
            if (accessToken) {
                // GAQL to get metrics for the last 30 days
                const query = `
                    SELECT metrics.cost_micros, metrics.impressions, metrics.clicks 
                    FROM customer 
                    WHERE segments.date DURING LAST_30_DAYS
                `;

                const response = await fetch(`https://googleads.googleapis.com/v16/customers/${googleCustomerId}/googleAds:search`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'developer-token': googleDevToken,
                        'login-customer-id': googleCustomerId,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query })
                });

                if (response.ok) {
                    const data = await response.json();
                    let spendMicros = 0, impressions = 0, clicks = 0;

                    if (data.results && data.results.length > 0) {
                        for (const row of data.results) {
                            if (row.metrics) {
                                spendMicros += parseInt(row.metrics.costMicros || '0', 10);
                                impressions += parseInt(row.metrics.impressions || '0', 10);
                                clicks += parseInt(row.metrics.clicks || '0', 10);
                            }
                        }
                    }

                    results.googleAds = {
                        status: 'Connected',
                        spend: spendMicros / 1000000, // cost_micros to standard currency
                        impressions,
                        clicks,
                        roas: 0 // Need conversion tracking to calculate ROAS reliably
                    }
                } else {
                    results.googleAds = { status: 'Failed to fetch API', spend: 0, impressions: 0, clicks: 0, roas: 0 }
                    console.warn('[Ads API] Failed to fetch Google Ads data', await response.text());
                }
            } else {
                results.googleAds = { status: 'Token Refresh Failed', spend: 0, impressions: 0, clicks: 0, roas: 0 }
            }
        } else {
            results.googleAds = {
                status: 'Missing Google Ads Credentials',
                spend: 0,
                impressions: 0,
                clicks: 0,
                roas: 0
            }
        }

        // Calculate Totals
        results.totalSpend = (results.metaAds?.spend || 0) + (results.googleAds?.spend || 0)
        results.totalImpressions = (results.metaAds?.impressions || 0) + (results.googleAds?.impressions || 0)
        results.totalClicks = (results.metaAds?.clicks || 0) + (results.googleAds?.clicks || 0)

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
