// CRM Segments API — CRUD for marketing segments
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — List all segments
export async function GET() {
    try {
        const segments = await prisma.marketingSegment.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { members: true, campaigns: true } },
            },
        });
        return NextResponse.json(segments);
    } catch (error) {
        console.error('[CRM Segments]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST — Create segment
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const segment = await prisma.marketingSegment.create({
            data: {
                name: body.name,
                description: body.description || null,
                color: body.color || '#3b82f6',
                icon: body.icon || 'users',
                filterJson: body.filterJson ? JSON.stringify(body.filterJson) : null,
                isAutomatic: body.isAutomatic || false,
            },
        });
        return NextResponse.json(segment);
    } catch (error) {
        console.error('[CRM Segments POST]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// PUT — Update segment
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const segment = await prisma.marketingSegment.update({
            where: { id: body.id },
            data: {
                name: body.name,
                description: body.description,
                color: body.color,
                icon: body.icon,
                filterJson: body.filterJson ? JSON.stringify(body.filterJson) : undefined,
                isAutomatic: body.isAutomatic,
            },
        });
        return NextResponse.json(segment);
    } catch (error) {
        console.error('[CRM Segments PUT]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// DELETE — Delete segment
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        await prisma.guestSegmentMember.deleteMany({ where: { segmentId: id } });
        await prisma.marketingSegment.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CRM Segments DELETE]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
