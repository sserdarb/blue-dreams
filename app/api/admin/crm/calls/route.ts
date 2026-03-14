import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — List calls (optionally filter by guestId)
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const guestId = searchParams.get('guestId');

        const calls = await prisma.crmCall.findMany({
            where: guestId ? { guestId } : undefined,
            orderBy: { callDate: 'desc' },
            include: {
                guest: {
                    select: { name: true, surname: true, phone: true }
                }
            }
        });
        
        return NextResponse.json(calls);
    } catch (error) {
        console.error('[CRM Calls GET]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST — Create a new call
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const call = await prisma.crmCall.create({
            data: {
                guestId: body.guestId || null,
                agentName: body.agentName,
                direction: body.direction || 'outbound',
                status: body.status || 'completed',
                duration: body.duration ? parseInt(body.duration, 10) : 0,
                notes: body.notes || null,
                callDate: body.callDate ? new Date(body.callDate) : new Date(),
            },
            include: {
                guest: {
                    select: { name: true, surname: true, phone: true }
                }
            }
        });
        return NextResponse.json(call);
    } catch (error) {
        console.error('[CRM Calls POST]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// DELETE — Delete a call
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        await prisma.crmCall.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CRM Calls DELETE]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
