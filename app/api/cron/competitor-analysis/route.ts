import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        // Here we would typically trigger the competitor analysis logic and save it to the DB.
        // For the sake of this prototype/agentic execution, we hit the main API to refresh caches.

        // Ensure this route is protected (e.g., via Vercel Cron Secret)
        const authHeader = req.headers.get('authorization');
        if (
            process.env.CRON_SECRET &&
            authHeader !== `Bearer ${process.env.CRON_SECRET}`
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('[CRON] Starting weekly competitor analysis sync...');
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

        // This simulates a background fetch that would update a DB cache
        // In reality, you'd extract the logic from the GET route to a shared service
        // and call `await performCompetitorAnalysisAndSave()`
        await fetch(`${baseUrl}/api/admin/competitor-analysis?refresh=true`);

        return NextResponse.json({ success: true, message: 'Competitor analysis sync triggered.' });
    } catch (error) {
        console.error('[CRON] Error syncing competitors:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
