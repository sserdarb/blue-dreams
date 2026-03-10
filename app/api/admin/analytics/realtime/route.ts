import { NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'

export async function GET() {
    try {
        // Get GA4 credentials from env or DB
        const propertyId = process.env.GA_PROPERTY_ID || process.env.GA4_PROPERTY_ID
        const serviceKeyBase64 = process.env.GA_SERVICE_KEY || process.env.GA4_SERVICE_KEY
        const clientEmail = process.env.GA_CLIENT_EMAIL
        const privateKey = process.env.GA_PRIVATE_KEY

        if (!propertyId || (!serviceKeyBase64 && (!clientEmail || !privateKey))) {
            return NextResponse.json({
                success: false,
                error: 'GA4 Property ID veya Service Key (veya Email/PrivateKey) eksik',
                activeUsers: 0
            })
        }

        let credentials: any = {}

        if (clientEmail && privateKey) {
            let formattedKey: string = privateKey;
            formattedKey = formattedKey.replace(/\\n/g, '\n').replace(/"/g, '');
            if (!formattedKey.includes('\n')) {
                const header = '-----BEGIN PRIVATE KEY-----';
                const footer = '-----END PRIVATE KEY-----';
                if (formattedKey.startsWith(header) && formattedKey.endsWith(footer)) {
                    const body = formattedKey.slice(header.length, -footer.length).trim().replace(/ /g, '\n');
                    formattedKey = `${header}\n${body}\n${footer}\n`;
                }
            }
            credentials = {
                client_email: clientEmail,
                private_key: formattedKey
            }
        } else if (serviceKeyBase64) {
            try {
                const decoded = Buffer.from(serviceKeyBase64, 'base64').toString('utf-8')
                credentials = JSON.parse(decoded)
            } catch {
                return NextResponse.json({
                    success: false,
                    error: 'Service Key decode edilemedi',
                    activeUsers: 0
                })
            }
        }

        const client = new BetaAnalyticsDataClient({ credentials })

        // Run realtime report
        const [report] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [
                { name: 'activeUsers' },
            ],
            dimensions: [
                { name: 'country' },
            ],
        })

        let totalActiveUsers = 0
        const countryBreakdown: { country: string; users: number }[] = []

        if (report?.rows) {
            for (const row of report.rows) {
                const country = row.dimensionValues?.[0]?.value || 'Unknown'
                const users = parseInt(row.metricValues?.[0]?.value || '0', 10)
                totalActiveUsers += users
                countryBreakdown.push({ country, users })
            }
        }

        // Sort by users desc
        countryBreakdown.sort((a, b) => b.users - a.users)

        // Also get page breakdown
        const [pageReport] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [{ name: 'activeUsers' }],
            dimensions: [{ name: 'unifiedScreenName' }],
        })

        const pageBreakdown: { page: string; users: number }[] = []
        if (pageReport?.rows) {
            for (const row of pageReport.rows) {
                const page = row.dimensionValues?.[0]?.value || 'Unknown'
                const users = parseInt(row.metricValues?.[0]?.value || '0', 10)
                pageBreakdown.push({ page, users })
            }
            pageBreakdown.sort((a, b) => b.users - a.users)
        }

        // Device breakdown
        const [deviceReport] = await client.runRealtimeReport({
            property: `properties/${propertyId}`,
            metrics: [{ name: 'activeUsers' }],
            dimensions: [{ name: 'deviceCategory' }],
        })

        const deviceBreakdown: { device: string; users: number }[] = []
        if (deviceReport?.rows) {
            for (const row of deviceReport.rows) {
                const device = row.dimensionValues?.[0]?.value || 'Unknown'
                const users = parseInt(row.metricValues?.[0]?.value || '0', 10)
                deviceBreakdown.push({ device, users })
            }
        }

        return NextResponse.json({
            success: true,
            activeUsers: totalActiveUsers,
            countries: countryBreakdown.slice(0, 10),
            pages: pageBreakdown.slice(0, 10),
            devices: deviceBreakdown,
            updatedAt: new Date().toISOString(),
        })
    } catch (error: any) {
        console.error('[GA4 Realtime]', error)
        return NextResponse.json({
            success: false,
            error: error.message || 'GA4 Realtime API hatası',
            activeUsers: 0
        })
    }
}
