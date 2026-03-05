import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/actions/auth';
import { prisma as db } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const isAuthed = await isAuthenticated();
        if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const market = url.searchParams.get('market') || 'domestic';
        const days = parseInt(url.searchParams.get('days') || '90');

        // Fetch real competitor prices from database
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const prices = await db.competitorPrice.findMany({
            where: {
                fetchedAt: { gte: cutoffDate }
            },
            orderBy: { fetchedAt: 'asc' }
        });

        // Get list of tracked competitors
        const competitors = await db.competitorHotel.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });

        const competitorNames = competitors.map(c => c.name);

        // If we have real data, group by week/month
        if (prices.length > 0) {
            // Group prices by month for trend view
            const monthlyPrices: Record<string, Record<string, number[]>> = {};

            prices.forEach(p => {
                const monthKey = p.fetchedAt.toISOString().slice(0, 7); // YYYY-MM
                if (!monthlyPrices[monthKey]) monthlyPrices[monthKey] = {};
                if (!monthlyPrices[monthKey][p.competitorName]) monthlyPrices[monthKey][p.competitorName] = [];
                monthlyPrices[monthKey][p.competitorName].push(p.price);
            });

            const monthNames: Record<string, string> = {
                '01': 'Oca', '02': 'Şub', '03': 'Mar', '04': 'Nis',
                '05': 'May', '06': 'Haz', '07': 'Tem', '08': 'Ağu',
                '09': 'Eyl', '10': 'Eki', '11': 'Kas', '12': 'Ara'
            };

            const pricingTrends = Object.keys(monthlyPrices).sort().map(monthKey => {
                const monthNum = monthKey.split('-')[1];
                const entry: any = { name: monthNames[monthNum] || monthKey };

                Object.keys(monthlyPrices[monthKey]).forEach(comp => {
                    const avgPrice = monthlyPrices[monthKey][comp].reduce((a, b) => a + b, 0) / monthlyPrices[monthKey][comp].length;
                    entry[comp] = Math.round(avgPrice);
                });

                return entry;
            });

            // Latest prices for each competitor (last fetched)
            const latestPrices: Record<string, { price: number, currency: string, date: string }> = {};
            prices.forEach(p => {
                latestPrices[p.competitorName] = {
                    price: p.price,
                    currency: p.currency,
                    date: p.fetchedAt.toISOString()
                };
            });

            return NextResponse.json({
                success: true,
                dataSource: 'live',
                totalRecords: prices.length,
                competitors: competitorNames,
                pricingTrends,
                latestPrices,
                reviewsTrends: [], // Will be added with scraping
                brandInterestTrends: [] // Will be added with scraping
            });
        }

        // Fallback: no data in DB yet — return empty with guidance
        return NextResponse.json({
            success: true,
            dataSource: 'empty',
            totalRecords: 0,
            competitors: competitorNames,
            pricingTrends: [],
            latestPrices: {},
            reviewsTrends: [],
            brandInterestTrends: [],
            message: 'Henüz veritabanında rakip fiyat verisi bulunamadı. Scraping çalıştırarak veri toplayın.'
        });

    } catch (error) {
        console.error('API /api/admin/competitors/trends GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
