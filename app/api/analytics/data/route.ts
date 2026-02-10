import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Helper: get date N days ago
function daysAgo(n: number): Date {
    const d = new Date()
    d.setDate(d.getDate() - n)
    d.setHours(0, 0, 0, 0)
    return d
}

// Internal analytics data from PageView table
async function getInternalAnalytics(days: number = 30) {
    const since = daysAgo(days)
    const db = prisma as any

    const [
        totalViews,
        uniqueSessions,
        pageViews,
        deviceBreakdown,
        browserBreakdown,
        topPages,
        dailyViews,
        avgDuration,
        referrerBreakdown,
    ] = await Promise.all([
        // Total page views
        db.pageView.count({
            where: { createdAt: { gte: since } }
        }),
        // Unique sessions
        db.pageView.groupBy({
            by: ['sessionId'],
            where: { createdAt: { gte: since }, sessionId: { not: null } },
        }).then((r: any[]) => r.length),
        // Views by locale
        db.pageView.groupBy({
            by: ['locale'],
            where: { createdAt: { gte: since } },
            _count: { id: true }
        }),
        // Device breakdown
        db.pageView.groupBy({
            by: ['device'],
            where: { createdAt: { gte: since } },
            _count: { id: true }
        }),
        // Browser breakdown
        db.pageView.groupBy({
            by: ['browser'],
            where: { createdAt: { gte: since } },
            _count: { id: true }
        }),
        // Top pages
        db.pageView.groupBy({
            by: ['path'],
            where: { createdAt: { gte: since } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        }),
        // Daily views (last N days)
        db.$queryRawUnsafe(`
            SELECT "createdAt"::date as date, COUNT(*) as views
            FROM "PageView"
            WHERE "createdAt" >= $1
            GROUP BY "createdAt"::date
            ORDER BY date ASC
        `, since.toISOString()),
        // Average duration
        db.pageView.aggregate({
            where: { createdAt: { gte: since }, duration: { gt: 0 } },
            _avg: { duration: true }
        }),
        // Top referrers
        db.pageView.groupBy({
            by: ['referrer'],
            where: { createdAt: { gte: since }, referrer: { not: null } },
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 10
        }),
    ])

    // Calculate bounce rate (sessions with only 1 pageview)
    const sessionCounts = await db.pageView.groupBy({
        by: ['sessionId'],
        where: { createdAt: { gte: since }, sessionId: { not: null } },
        _count: { id: true }
    })
    const singlePageSessions = sessionCounts.filter((s: any) => s._count.id === 1).length
    const bounceRate = uniqueSessions > 0
        ? Math.round((singlePageSessions / uniqueSessions) * 100)
        : 0

    // Format daily views
    const formattedDaily = (dailyViews as any[]).map((d: any) => ({
        date: typeof d.date === 'string' ? d.date.split('T')[0] : new Date(d.date).toISOString().split('T')[0],
        views: Number(d.views)
    }))

    return {
        source: 'internal',
        period: `${days} gün`,
        summary: {
            totalPageViews: totalViews,
            uniqueVisitors: uniqueSessions,
            bounceRate: `${bounceRate}%`,
            avgDuration: `${Math.round(avgDuration._avg?.duration || 0)} sn`,
        },
        dailyViews: formattedDaily,
        topPages: topPages.map((p: any) => ({
            path: p.path,
            views: p._count.id
        })),
        devices: deviceBreakdown.map((d: any) => ({
            device: d.device || 'unknown',
            count: d._count.id
        })),
        browsers: browserBreakdown.map((b: any) => ({
            browser: b.browser || 'unknown',
            count: b._count.id
        })),
        locales: pageViews.map((l: any) => ({
            locale: l.locale,
            count: l._count.id
        })),
        referrers: referrerBreakdown.map((r: any) => ({
            referrer: r.referrer || 'Doğrudan',
            count: r._count.id
        })),
    }
}

// GA4 Data API integration (when configured)
async function getGA4Analytics(config: any) {
    try {
        // GA4 Reporting API v1 via REST
        // Requires service account JSON key for authentication
        if (!config.gaServiceKey || !config.gaPropertyId) {
            return null
        }

        // Decode service account key
        const serviceKeyJson = JSON.parse(
            Buffer.from(config.gaServiceKey, 'base64').toString('utf-8')
        )

        // Create JWT for Google API auth
        const jwt = await createGoogleJWT(serviceKeyJson)
        if (!jwt) return null

        const propertyId = config.gaPropertyId
        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
                    dimensions: [{ name: 'date' }],
                    metrics: [
                        { name: 'screenPageViews' },
                        { name: 'totalUsers' },
                        { name: 'bounceRate' },
                        { name: 'averageSessionDuration' },
                    ],
                })
            }
        )

        if (!response.ok) {
            console.error('GA4 API Error:', await response.text())
            return null
        }

        const data = await response.json()

        // Parse GA4 response
        const dailyViews = (data.rows || []).map((row: any) => ({
            date: `${row.dimensionValues[0].value.slice(0, 4)}-${row.dimensionValues[0].value.slice(4, 6)}-${row.dimensionValues[0].value.slice(6, 8)}`,
            views: parseInt(row.metricValues[0].value)
        }))

        const totalViews = dailyViews.reduce((sum: number, d: any) => sum + d.views, 0)
        const totalUsers = (data.rows || []).reduce((sum: number, row: any) => sum + parseInt(row.metricValues[1].value), 0)

        return {
            source: 'google_analytics',
            period: '30 gün',
            summary: {
                totalPageViews: totalViews,
                uniqueVisitors: totalUsers,
                bounceRate: data.rows?.[0]?.metricValues?.[2]?.value
                    ? `${Math.round(parseFloat(data.rows[0].metricValues[2].value) * 100)}%`
                    : 'N/A',
                avgDuration: data.rows?.[0]?.metricValues?.[3]?.value
                    ? `${Math.round(parseFloat(data.rows[0].metricValues[3].value))} sn`
                    : 'N/A',
            },
            dailyViews,
            topPages: [],
            devices: [],
            browsers: [],
            locales: [],
            referrers: [],
        }
    } catch (error) {
        console.error('GA4 fetch error:', error)
        return null
    }
}

// Simple JWT creation for Google APIs (without external library)
async function createGoogleJWT(serviceKey: any): Promise<string | null> {
    try {
        const now = Math.floor(Date.now() / 1000)
        const header = { alg: 'RS256', typ: 'JWT' }
        const payload = {
            iss: serviceKey.client_email,
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600
        }

        const headerB64 = Buffer.from(JSON.stringify(header)).toString('base64url')
        const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
        const unsigned = `${headerB64}.${payloadB64}`

        // Import private key and sign
        const crypto = await import('crypto')
        const sign = crypto.createSign('RSA-SHA256')
        sign.update(unsigned)
        const signature = sign.sign(serviceKey.private_key, 'base64url')

        const jwt = `${unsigned}.${signature}`

        // Exchange JWT for access token
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
        })

        const tokenData = await tokenRes.json()
        return tokenData.access_token || null
    } catch {
        return null
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const days = parseInt(searchParams.get('days') || '30')
        const db = prisma as any

        // Check if GA4 API is configured
        const config = await db.analyticsConfig.findFirst()

        if (config?.useGaApi && config.gaServiceKey && config.gaPropertyId) {
            const gaData = await getGA4Analytics(config)
            if (gaData) return NextResponse.json(gaData)
        }

        // Fallback to internal analytics
        const data = await getInternalAnalytics(days)
        return NextResponse.json(data)

    } catch (error) {
        console.error('Analytics data error:', error)
        return NextResponse.json({
            source: 'internal',
            period: '30 gün',
            summary: { totalPageViews: 0, uniqueVisitors: 0, bounceRate: '0%', avgDuration: '0 sn' },
            dailyViews: [],
            topPages: [],
            devices: [],
            browsers: [],
            locales: [],
            referrers: [],
        })
    }
}
