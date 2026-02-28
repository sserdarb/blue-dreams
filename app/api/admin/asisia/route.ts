import { NextResponse } from 'next/server';
import { fetchRecentReservations, fetchDashboardStats } from '@/lib/services/pms-asisia';
import { isAuthenticated } from '@/app/actions/auth';

export async function GET(req: Request) {
    try {
        const isAuthed = await isAuthenticated()
        if (!isAuthed) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(req.url);
        const action = url.searchParams.get('action') || 'reservations';
        const start = url.searchParams.get('start') || undefined;
        const end = url.searchParams.get('end') || undefined;

        if (action === 'stats') {
            const stats = await fetchDashboardStats(start, end);
            return NextResponse.json(stats);
        } else {
            const limit = parseInt(url.searchParams.get('limit') || '50', 10);
            const data = await fetchRecentReservations(limit);
            return NextResponse.json(data);
        }

    } catch (error) {
        console.error('API /api/admin/asisia GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
