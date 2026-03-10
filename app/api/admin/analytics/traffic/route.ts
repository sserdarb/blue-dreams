import { NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { prisma } from '@/lib/prisma'
import { EncryptionUtils } from '@/lib/utils/encryption'

// ─── Demo Data for Analytics Traffic ────────────────────────────────────
function getAnalyticsDemoData() {
    const days = 30
    const data = []
    const now = new Date()
    for (let i = days; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const baseUsers = 120 + Math.floor(Math.random() * 80)
        data.push({
            date: dateStr,
            users: baseUsers,
            pageViews: baseUsers * 3 + Math.floor(Math.random() * 100),
            sessions: baseUsers + Math.floor(Math.random() * 40),
            bounceRate: (35 + Math.random() * 15).toFixed(2)
        })
    }
    return {
        success: true, demo: true,
        data, traffic: data,
        channels: [
            { name: 'Organic Search', value: 1840 },
            { name: 'Direct', value: 1250 },
            { name: 'Social', value: 620 },
            { name: 'Referral', value: 340 },
            { name: 'Email', value: 180 }
        ],
        countries: [
            { name: 'Turkey', users: 2100, percentage: 42 },
            { name: 'Germany', users: 980, percentage: 20 },
            { name: 'United Kingdom', users: 650, percentage: 13 },
            { name: 'Russia', users: 520, percentage: 10 },
            { name: 'Netherlands', users: 380, percentage: 8 }
        ],
        totals: {
            users: data.reduce((a, c) => a + c.users, 0),
            pageViews: data.reduce((a, c) => a + c.pageViews, 0),
            sessions: data.reduce((a, c) => a + c.sessions, 0),
            averageBounceRate: '42.50'
        }
    }
}

async function isDemoMode(key: string): Promise<boolean> {
    if (process.env[`DEMO_MODE_${key.toUpperCase()}`] === 'true') return true
    try {
        const db = prisma as any
        const setting = await db.siteSetting?.findUnique?.({ where: { key: `demo_mode_${key}` } })
        return setting?.value === 'true'
    } catch { return false }
}

function getClient(clientEmail: string, privateKey: string) {
    let formattedKey: string = privateKey;
    if (typeof formattedKey === "string") {
        formattedKey = formattedKey.replace(/\\n/g, "\n").replace(/"/g, "");
        if (!formattedKey.includes('\n')) {
            const header = '-----BEGIN PRIVATE KEY-----';
            const footer = '-----END PRIVATE KEY-----';
            if (formattedKey.startsWith(header) && formattedKey.endsWith(footer)) {
                const body = formattedKey.slice(header.length, -footer.length).trim().replace(/ /g, '\n');
                formattedKey = `${header}\n${body}\n${footer}\n`;
            }
        }
    }

    return new BetaAnalyticsDataClient({
        credentials: {
            client_email: clientEmail,
            private_key: formattedKey,
        }
    })
}

export async function GET(request: Request) {
    try {
        // Check demo mode
        const { searchParams } = new URL(request.url)
        if (searchParams.get('demo') === 'true' || await isDemoMode('analytics')) {
            return NextResponse.json(getAnalyticsDemoData())
        }
        const db = prisma as any
        let config: any = null
        try {
            config = await db.analyticsConfig?.findFirst?.()
        } catch (configErr: any) {
            // AnalyticsConfig table may not exist yet – fall through safely
            console.warn('[GA4 API] AnalyticsConfig lookup failed (table may not exist):', configErr?.message)
        }

        let propertyId = process.env.GA_PROPERTY_ID || config?.gaPropertyId
        let clientEmail = process.env.GA_CLIENT_EMAIL
        let privateKey = process.env.GA_PRIVATE_KEY

        if (config?.gaServiceKey) {
            // First decrypt (EncryptionUtils safely returns original if not encrypted)
            const decryptedKey = EncryptionUtils.decrypt(config.gaServiceKey)

            try {
                // Try parsing directly (in case it was saved as JSON)
                const serviceAccount = JSON.parse(decryptedKey)
                if (serviceAccount.client_email && serviceAccount.private_key) {
                    clientEmail = serviceAccount.client_email
                    privateKey = serviceAccount.private_key
                }
            } catch (e) {
                // If it's pure Base64, try decoding
                try {
                    const decoded = Buffer.from(decryptedKey, 'base64').toString('utf-8')
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
