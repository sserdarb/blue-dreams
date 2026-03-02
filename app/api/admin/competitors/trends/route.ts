import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/actions/auth';

export async function GET(req: Request) {
    try {
        const isAuthed = await isAuthenticated();
        if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Generate synthetic time-series data for the demonstration of trends.
        // In a real environment, this data would come from historical SerpApi / Exa scrapes saved in the DB.

        const url = new URL(req.url);
        const market = url.searchParams.get('market') || 'domestic'; // domestic or international
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

        const priceMultiplier = market === 'international' ? 1.4 : 1; // 40% higher in EUR baseline

        const pricingTrends = months.map(month => {
            return {
                name: month,
                'Blue Dreams': Math.floor((6000 + Math.random() * 8000) * priceMultiplier),
                'Duja Bodrum': Math.floor((5500 + Math.random() * 7000) * priceMultiplier),
                'La Blanche': Math.floor((7000 + Math.random() * 9000) * priceMultiplier),
                'Samara Bodrum': Math.floor((8000 + Math.random() * 5000) * priceMultiplier),
                'Kefaluka': Math.floor((6500 + Math.random() * 6000) * priceMultiplier),
            };
        });

        const reviewsTrends = months.map((month, idx) => {
            // Incremental cumulative growth
            return {
                name: month,
                'Blue Dreams': 3000 + (idx * Math.floor(Math.random() * 50)),
                'Duja Bodrum': 3200 + (idx * Math.floor(Math.random() * 80)),
                'La Blanche': 3800 + (idx * Math.floor(Math.random() * 40)),
                'Samara Bodrum': 1600 + (idx * Math.floor(Math.random() * 30)),
                'Kefaluka': 2700 + (idx * Math.floor(Math.random() * 60)),
            };
        });

        const brandInterestTrends = months.map((month, idx) => {
            // Random volatile search volume interest relative score (0-100)
            return {
                name: month,
                'Blue Dreams': Math.floor(40 + Math.random() * 40 + (idx === 6 || idx === 7 ? 20 : 0)), // Peaks in summer
                'Duja Bodrum': Math.floor(30 + Math.random() * 50 + (idx === 6 || idx === 7 ? 10 : 0)),
                'La Blanche': Math.floor(50 + Math.random() * 30 + (idx === 6 || idx === 7 ? 15 : 0)),
                'Samara Bodrum': Math.floor(20 + Math.random() * 40),
                'Kefaluka': Math.floor(35 + Math.random() * 45),
            };
        });

        return NextResponse.json({
            success: true,
            pricingTrends,
            reviewsTrends,
            brandInterestTrends
        });

    } catch (error) {
        console.error('API /api/admin/competitors/trends GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
