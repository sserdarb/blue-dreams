// CRM Guests API — List, filter, and manage guest profiles
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { syncGuestsFromElektra } from '@/lib/services/guest-sync';

// GET — List guests with filters
export async function GET(req: NextRequest) {
    try {
        const sp = req.nextUrl.searchParams;
        const page = parseInt(sp.get('page') || '1');
        const limit = parseInt(sp.get('limit') || '50');
        const search = sp.get('search') || '';
        const country = sp.get('country') || '';
        const minStays = parseInt(sp.get('minStays') || '0');
        const maxStays = parseInt(sp.get('maxStays') || '999');
        const fromDate = sp.get('fromDate') || '';
        const toDate = sp.get('toDate') || '';
        const segmentId = sp.get('segmentId') || '';
        const hasPhone = sp.get('hasPhone') === 'true';
        const hasEmail = sp.get('hasEmail') === 'true';
        const sortBy = sp.get('sortBy') || 'lastCheckIn';
        const sortDir = sp.get('sortDir') === 'asc' ? 'asc' : 'desc';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { surname: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } },
            ];
        }

        if (country) where.country = { equals: country, mode: 'insensitive' };
        if (minStays > 0) where.totalStays = { gte: minStays };
        if (maxStays < 999) where.totalStays = { ...where.totalStays, lte: maxStays };
        if (hasPhone) where.phone = { not: null };
        if (hasEmail) where.email = { not: null };

        if (fromDate) where.lastCheckIn = { gte: new Date(fromDate) };
        if (toDate) where.lastCheckIn = { ...where.lastCheckIn, lte: new Date(toDate) };

        if (segmentId) {
            where.segments = { some: { segmentId } };
        }

        const [guests, total] = await Promise.all([
            prisma.guestProfile.findMany({
                where,
                include: {
                    segments: { include: { segment: { select: { id: true, name: true, color: true } } } },
                    _count: { select: { socialMessages: true } },
                },
                orderBy: { [sortBy]: sortDir },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.guestProfile.count({ where }),
        ]);

        // Get country stats
        const countries = await prisma.guestProfile.groupBy({
            by: ['country'],
            _count: true,
            orderBy: { _count: { country: 'desc' } },
            take: 30,
        });

        return NextResponse.json({ guests, total, page, limit, countries });
    } catch (error) {
        console.error('[CRM Guests]', error);
        return NextResponse.json({ error: 'Failed to fetch guests' }, { status: 500 });
    }
}

// POST — Add guests to segment or sync from Elektra
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Sync guests from Elektra
        if (body.action === 'sync') {
            const fromDate = new Date(body.fromDate || '2024-01-01');
            const toDate = new Date(body.toDate || new Date().toISOString());
            const result = await syncGuestsFromElektra(fromDate, toDate);
            return NextResponse.json({ success: true, ...result });
        }

        // Add guests to segment
        if (body.action === 'addToSegment') {
            const { guestIds, segmentId } = body as { guestIds: string[]; segmentId: string };

            const data = guestIds.map(guestId => ({
                guestId,
                segmentId,
            }));

            await prisma.guestSegmentMember.createMany({
                data,
                skipDuplicates: true,
            });

            // Update segment guest count
            const count = await prisma.guestSegmentMember.count({ where: { segmentId } });
            await prisma.marketingSegment.update({
                where: { id: segmentId },
                data: { guestCount: count },
            });

            return NextResponse.json({ success: true, added: guestIds.length });
        }

        // Remove from segment
        if (body.action === 'removeFromSegment') {
            const { guestIds, segmentId } = body as { guestIds: string[]; segmentId: string };
            await prisma.guestSegmentMember.deleteMany({
                where: { guestId: { in: guestIds }, segmentId },
            });
            const count = await prisma.guestSegmentMember.count({ where: { segmentId } });
            await prisma.marketingSegment.update({
                where: { id: segmentId },
                data: { guestCount: count },
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[CRM Guests POST]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
