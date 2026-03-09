import { NextResponse } from 'next/server';
import { ElektraService } from '@/lib/services/elektra';
import { BigDataService } from '@/lib/services/bigdata';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const res = await ElektraService.getAllSeasonReservations();
        const dist = BigDataService.countryDistribution(res);

        // Find the first few reservations that resulted in "Unknown"
        const unknowns = res.filter(r => r.country === 'Unknown');

        return NextResponse.json({
            total: res.length,
            dist: dist.slice(0, 10),
            sampleUnknowns: unknowns.slice(0, 3).map(u => ({
                guests: u.guests,
                computedCountry: u.country
            }))
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
