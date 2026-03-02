import { NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { prisma } from '@/lib/prisma'

function getClient(clientEmail: string, privateKey: string) {
    // Fix newlines in Vercel/Coolify
    // It's possible the var comes as a literal "\n" string instead of actual newlines.
    const formattedKey = typeof privateKey === 'string'
        ? privateKey.replace(/\\n/g, '\n')
        : privateKey

    return new BetaAnalyticsDataClient({
        credentials: {
            client_email: clientEmail,
            private_key: formattedKey
        }
    })
}

export async function GET(request: Request) {
    try {
        const db = prisma as any
        let config: any = null
        try {
            config = await db.analyticsConfig?.findFirst?.()
        } catch (configErr: any) {
            // AnalyticsConfig table may not exist yet – fall through safely
            console.warn('[GA4 API] AnalyticsConfig lookup failed (table may not exist):', configErr?.message)
        }

        let propertyId = config?.gaPropertyId || process.env.GA_PROPERTY_ID
        let clientEmail = process.env.GA_CLIENT_EMAIL
        let privateKey = process.env.GA_PRIVATE_KEY

        if (config?.gaServiceKey) {
            try {
                const serviceAccount = JSON.parse(config.gaServiceKey)
                if (serviceAccount.client_email && serviceAccount.private_key) {
                    clientEmail = serviceAccount.client_email
                    privateKey = serviceAccount.private_key
                }
            } catch (e) {
                // If it's pure Base64, try decoding
                try {
                    const decoded = Buffer.from(config.gaServiceKey, 'base64').toString('utf-8')
                    const serviceAccount = JSON.parse(decoded)
                    if (serviceAccount.client_email && serviceAccount.private_key) {
                        clientEmail = serviceAccount.client_email
                        privateKey = serviceAccount.private_key
                    }
                } catch (e2) {
                    // invalid JSON
                }
            }
        }

        if (!propertyId || !clientEmail || !privateKey) {
            return NextResponse.json({
                success: false,
                data: [],
                totals: { users: 0, pageViews: 0, sessions: 0, averageBounceRate: 0 },
                error: 'Google Analytics API kimlik bilgileri eksik. Lütfen Ayarlar sekmesinden yapılandırın veya .env dosyanızı kontrol edin.'
            }, { status: 200 })
        }

        // Optional date range from query string, defaults to last 30 days
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate') || '30daysAgo'
        const endDate = searchParams.get('endDate') || 'today'

        const client = getClient(clientEmail, privateKey)

        // Make the API calls to GA4 concurrently
        const [
            [trafficResponse],
            [channelsResponse],
            [countriesResponse]
        ] = await Promise.all([
            // 1. Daily Traffic
            client.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'date' }],
                metrics: [
                    { name: 'activeUsers' },
                    { name: 'screenPageViews' },
                    { name: 'sessions' },
                    { name: 'bounceRate' }
                ],
                orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }]
            }),
            // 2. Channels
            client.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'sessionDefaultChannelGroup' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
                limit: 5 // Top 5
            }),
            // 3. Countries
            client.runReport({
                property: `properties/${propertyId}`,
                dateRanges: [{ startDate, endDate }],
                dimensions: [{ name: 'country' }],
                metrics: [{ name: 'activeUsers' }],
                orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
                limit: 5 // Top 5
            })
        ])

        // Format Daily Traffic
        let formattedTraffic: any[] = []
        if (trafficResponse && trafficResponse.rows) {
            formattedTraffic = trafficResponse.rows.map(row => {
                const dateStr = row.dimensionValues?.[0]?.value || ''
                const formattedDate = dateStr.length === 8
                    ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
                    : dateStr

                return {
                    date: formattedDate,
                    users: parseInt(row.metricValues?.[0]?.value || '0', 10),
                    pageViews: parseInt(row.metricValues?.[1]?.value || '0', 10),
                    sessions: parseInt(row.metricValues?.[2]?.value || '0', 10),
                    bounceRate: parseFloat(row.metricValues?.[3]?.value || '0').toFixed(2)
                }
            })
        }

        // Format Channels
        let formattedChannels: any[] = []
        if (channelsResponse && channelsResponse.rows) {
            formattedChannels = channelsResponse.rows.map(row => ({
                name: row.dimensionValues?.[0]?.value || 'Unknown',
                value: parseInt(row.metricValues?.[0]?.value || '0', 10)
            }))
        }

        // Format Countries
        let formattedCountries: any[] = []
        if (countriesResponse && countriesResponse.rows) {
            const totalUsersAllCountries = countriesResponse.rows.reduce((sum, row) => sum + parseInt(row.metricValues?.[0]?.value || '0', 10), 0)
            formattedCountries = countriesResponse.rows.map(row => {
                const users = parseInt(row.metricValues?.[0]?.value || '0', 10)
                const percentage = totalUsersAllCountries > 0 ? Math.round((users / totalUsersAllCountries) * 100) : 0
                return {
                    name: row.dimensionValues?.[0]?.value || 'Unknown',
                    users: users,
                    percentage: percentage
                }
            })
        }

        // Calculate totals across traffic
        const totals = {
            users: formattedTraffic.reduce((acc, curr) => acc + curr.users, 0),
            pageViews: formattedTraffic.reduce((acc, curr) => acc + curr.pageViews, 0),
            sessions: formattedTraffic.reduce((acc, curr) => acc + curr.sessions, 0),
            averageBounceRate: formattedTraffic.length > 0
                ? (formattedTraffic.reduce((acc, curr) => acc + parseFloat(curr.bounceRate as any), 0) / formattedTraffic.length).toFixed(2)
                : 0
        }

        return NextResponse.json({
            success: true,
            data: formattedTraffic, // legacy support 
            traffic: formattedTraffic,
            channels: formattedChannels,
            countries: formattedCountries,
            totals
        })

    } catch (error: any) {
        console.error('[GA4 API Route Error]', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch Google Analytics data' },
            { status: 500 }
        )
    }
}
