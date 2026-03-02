import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const [totalGuests, totalStaysData, revenueData] = await Promise.all([
            prisma.guestProfile.count(),
            prisma.guestProfile.aggregate({ _sum: { totalStays: true } }),
            prisma.guestProfile.aggregate({ _sum: { totalRevenue: true } }),
        ])

        const totalRevenue = revenueData._sum.totalRevenue || 0
        const totalStays = totalStaysData._sum.totalStays || 0

        // In a real large DB, pulling all rows could be slow. 
        // Here we'll pull minimal data for a fast client-side RFM aggregation or do it via DB grouping.
        // For simplicity and to show predictive AI segments, we'll pull specific segments.
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

        const twoYearsAgo = new Date()
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2)

        const [loyalGuests, churnRisk, highSpenders] = await Promise.all([
            // Loyal (3+ visits)
            prisma.guestProfile.count({ where: { totalStays: { gte: 3 } } }),
            // Churn risk (no visit in last 2 years but multiple visits before)
            prisma.guestProfile.count({ where: { lastCheckIn: { lt: twoYearsAgo }, totalStays: { gt: 1 } } }),
            // High Spenders (> 5000 EUR/TRY approx)
            prisma.guestProfile.count({ where: { totalRevenue: { gte: 5000 } } })
        ])

        // Mock funnel data for Campaign ROI (since real tracking would require pixel/attribution logic)
        const recentCampaigns = await prisma.marketingCampaign.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { name: true, totalSent: true, totalDelivered: true, totalFailed: true }
        })

        const funnelData = [
            { step: 'Gönderilen', count: recentCampaigns.reduce((a, c) => a + c.totalSent, 0) },
            { step: 'Ulaşan', count: recentCampaigns.reduce((a, c) => a + c.totalDelivered, 0) },
            { step: 'Tıklayan', count: Math.floor(recentCampaigns.reduce((a, c) => a + c.totalDelivered, 0) * 0.15) },
            { step: 'Dönüşüm (Rezervasyon)', count: Math.floor(recentCampaigns.reduce((a, c) => a + c.totalDelivered, 0) * 0.03) }
        ]

        return NextResponse.json({
            stats: {
                totalGuests,
                totalRevenue,
                totalStays,
                avgRevenuePerGuest: totalGuests > 0 ? (totalRevenue / totalGuests).toFixed(2) : 0,
            },
            segments: {
                loyalGuests,
                churnRisk,
                highSpenders,
            },
            funnel: funnelData,
            recentCampaigns
        })
    } catch (e) {
        console.error('[CRM Overview]', e)
        return NextResponse.json({ error: 'Failed to load overview data' }, { status: 500 })
    }
}
