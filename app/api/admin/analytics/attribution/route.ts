import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/app/actions/auth';
import { fetchCallCenterStats } from '@/lib/services/pms-asisia';

export async function GET(req: Request) {
    try {
        const isAuthed = await isAuthenticated();
        if (!isAuthed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const url = new URL(req.url);
        const start = url.searchParams.get('start');
        const end = url.searchParams.get('end');

        // Use the enhanced call center stats which include source attribution
        const stats = await fetchCallCenterStats(start || undefined, end || undefined);

        // Build attribution summary
        const sourceData = stats.sourceAttribution || [];

        const totalReservations = sourceData.reduce((s: number, r: any) => s + (r.ReservationCount || 0), 0);
        const totalRevenue = sourceData.reduce((s: number, r: any) => s + (r.Revenue || 0), 0);

        const attribution = sourceData.map((row: any) => ({
            source: row.Source || 'Bilinmiyor',
            reservations: row.ReservationCount || 0,
            revenue: row.Revenue || 0,
            sharePercent: totalReservations > 0 ? ((row.ReservationCount / totalReservations) * 100).toFixed(1) : '0',
            revenueShare: totalRevenue > 0 ? ((row.Revenue / totalRevenue) * 100).toFixed(1) : '0',
        }));

        // Call center → conversion summary
        const callConversion = {
            totalCalls: stats.summary?.totalCalls || 0,
            answeredCalls: stats.summary?.answeredCalls || 0,
            missedCalls: stats.summary?.missedCalls || 0,
            missedRate: stats.summary?.missedRate || '0',
            avgDurationSeconds: stats.summary?.avgDurationSeconds || 0,
        };

        return NextResponse.json({
            success: true,
            attribution,
            totalReservations,
            totalRevenue,
            callConversion,
            agentRevenue: stats.agentRevenue || [],
            conversionStats: stats.conversionStats || [],
        });

    } catch (error: any) {
        console.error('API /api/admin/analytics/attribution GET error:', error);
        return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
    }
}
