import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { GoogleAdsApi } from 'google-ads-api'

const prisma = new PrismaClient()

// To be configured in environment variables or database settings
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID || ''
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET || ''
const DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || ''

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'stats'

        // 1. Fetch configured token from Settings
        const settings = await prisma.siteSetting.findMany({
            where: {
                key: { in: ['google_ads_refresh_token', 'google_ads_customer_id'] }
            }
        })

        const REFRESH_TOKEN = settings.find(s => s.key === 'google_ads_refresh_token')?.value
        const CUSTOMER_ID = settings.find(s => s.key === 'google_ads_customer_id')?.value

        if (!REFRESH_TOKEN || !CUSTOMER_ID) {
            return NextResponse.json({ error: 'Config missing', requiresAuth: true }, { status: 401 })
        }

        const client = new GoogleAdsApi({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            developer_token: DEVELOPER_TOKEN,
        })

        const customer = client.Customer({
            customer_id: CUSTOMER_ID,
            refresh_token: REFRESH_TOKEN,
        })

        if (action === 'stats') {
            // Fetch basic Campaign Stats for the last 30 days
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

            const response = await customer.query(query)

            const campaigns = response.map(row => ({
                id: row.campaign?.id,
                name: row.campaign?.name,
                impressions: row.metrics?.impressions || 0,
                clicks: row.metrics?.clicks || 0,
                cost: (row.metrics?.cost_micros || 0) / 1000000,
                conversions: row.metrics?.conversions || 0,
            }))

            return NextResponse.json({ campaigns })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    } catch (error: any) {
        console.error('Google Ads API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
