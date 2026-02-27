import { NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

// Initialize the Google Analytics Data API client
// We initialize it lazily to not crash the app if env vars are missing at boot
let analyticsDataClient: BetaAnalyticsDataClient | null = null

function getClient() {
    if (analyticsDataClient) return analyticsDataClient

    // Require credentials from ENV
    const clientEmail = process.env.GA_CLIENT_EMAIL
    const privateKey = process.env.GA_PRIVATE_KEY?.replace(/\\n/g, '\n') // Fix newlines in Vercel/Coolify

    if (!clientEmail || !privateKey) {
        throw new Error('Missing Google Analytics Configuration (GA_CLIENT_EMAIL or GA_PRIVATE_KEY)')
    }

    analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey
        }
    })

    return analyticsDataClient
}

export async function GET(request: Request) {
    try {
        const propertyId = process.env.GA_PROPERTY_ID
        const clientEmail = process.env.GA_CLIENT_EMAIL
        const privateKey = process.env.GA_PRIVATE_KEY

        if (!propertyId || !clientEmail || !privateKey) {
            // Return empty data gracefully instead of 500 error
            return NextResponse.json({
                success: true,
                data: [],
                totals: { users: 0, pageViews: 0, sessions: 0, averageBounceRate: 0 },
                warning: 'Google Analytics yapılandırılmamış. GA_PROPERTY_ID, GA_CLIENT_EMAIL ve GA_PRIVATE_KEY env değişkenlerini ayarlayın.'
            })
        }

        // Optional date range from query string, defaults to last 30 days
        const { searchParams } = new URL(request.url)
        const startDate = searchParams.get('startDate') || '30daysAgo'
        const endDate = searchParams.get('endDate') || 'today'

        const client = getClient()

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
