import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const period = searchParams.get('period') || '30' // days

        const since = new Date()
        since.setDate(since.getDate() - parseInt(period))

        // Total counts
        const [totalViews, uniqueVisitors, todayViews, recentViews] = await Promise.all([
            prisma.pageView.count({ where: { createdAt: { gte: since } } }),
            prisma.pageView.groupBy({
                by: ['sessionId'],
                where: { createdAt: { gte: since }, sessionId: { not: null } },
            }).then(r => r.length),
            prisma.pageView.count({
                where: {
                    createdAt: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0))
                    }
                }
            }),
            // Last 1 hour = "active now" approximation
            prisma.pageView.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 60 * 60 * 1000)
                    }
                }
            }),
        ])

        // Top pages
        const topPagesRaw = await prisma.pageView.groupBy({
            by: ['path'],
            where: { createdAt: { gte: since } },
            _count: { path: true },
            orderBy: { _count: { path: 'desc' } },
            take: 10,
        })

        const topPages = topPagesRaw.map(p => ({
            path: p.path,
            views: p._count.path,
        }))

        // Daily breakdown (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const dailyRaw = await prisma.pageView.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: sevenDaysAgo } },
            _count: true,
        })

        // Aggregate by day
        const dailyMap: Record<string, number> = {}
        dailyRaw.forEach(row => {
            const day = new Date(row.createdAt).toISOString().split('T')[0]
            dailyMap[day] = (dailyMap[day] || 0) + row._count
        })

        const daily = Object.entries(dailyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, views]) => ({ date, views }))

        // Top referrers
        const referrersRaw = await prisma.pageView.groupBy({
            by: ['referrer'],
            where: {
                createdAt: { gte: since },
                referrer: { not: null },
            },
            _count: { referrer: true },
            orderBy: { _count: { referrer: 'desc' } },
            take: 5,
        })

        const topReferrers = referrersRaw.map(r => ({
            referrer: r.referrer || 'Direct',
            count: r._count.referrer,
        }))

        return NextResponse.json({
            success: true,
            source: 'internal',
            totals: {
                visitors: uniqueVisitors,
                pageViews: totalViews,
                todayViews,
                activeNow: recentViews,
                bounceRate: 0, // Not tracked internally
            },
            topPages,
            daily,
            topReferrers,
        })
    } catch (error) {
        console.error('[Internal Analytics Error]', error)
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch internal analytics',
        }, { status: 500 })
    }
}
