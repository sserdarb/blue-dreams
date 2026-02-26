// CRM Email Templates API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — List email templates
export async function GET() {
    try {
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(templates);
    } catch (error) {
        console.error('[CRM Templates]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST — Create template
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const template = await prisma.emailTemplate.create({
            data: {
                name: body.name,
                subject: body.subject,
                htmlContent: body.htmlContent,
                jsonContent: body.jsonContent || null,
                category: body.category || 'general',
                thumbnail: body.thumbnail || null,
            },
        });
        return NextResponse.json(template);
    } catch (error) {
        console.error('[CRM Templates POST]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// PUT — Update template
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const template = await prisma.emailTemplate.update({
            where: { id: body.id },
            data: {
                name: body.name,
                subject: body.subject,
                htmlContent: body.htmlContent,
                jsonContent: body.jsonContent,
                category: body.category,
                thumbnail: body.thumbnail,
                isActive: body.isActive,
            },
        });
        return NextResponse.json(template);
    } catch (error) {
        console.error('[CRM Templates PUT]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// DELETE — Delete template
export async function DELETE(req: NextRequest) {
    try {
        const { id } = await req.json();
        await prisma.emailTemplate.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[CRM Templates DELETE]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
