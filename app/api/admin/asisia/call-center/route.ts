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

        // Fetch specialized data for call center
        const stats = await fetchCallCenterStats(start || undefined, end || undefined);

        return NextResponse.json(stats);
    } catch (error) {
        console.error('API /api/admin/asisia/call-center GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
