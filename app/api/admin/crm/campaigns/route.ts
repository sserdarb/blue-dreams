// CRM Campaigns API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — List campaigns
export async function GET() {
    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: { segment: { select: { id: true, name: true, color: true, guestCount: true } } },
        });
        return NextResponse.json(campaigns);
    } catch (error) {
        console.error('[CRM Campaigns]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST — Create campaign
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Create campaign
        if (body.action === 'create') {
            const campaign = await prisma.campaign.create({
                data: {
                    name: body.name,
                    type: body.type, // whatsapp, email
                    segmentId: body.segmentId || null,
                    templateId: body.templateId || null,
                    subject: body.subject || null,
                    content: body.content || null,
                    status: 'draft',
                    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                },
            });
            return NextResponse.json(campaign);
        }

        // Send campaign
        if (body.action === 'send') {
            const campaign = await prisma.campaign.findUnique({
                where: { id: body.campaignId },
                include: {
                    segment: {
                        include: {
                            members: {
                                include: {
                                    guest: { select: { id: true, name: true, phone: true, email: true } },
                                },
                            },
                        },
                    },
                },
            });

            if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
            if (!campaign.segment) return NextResponse.json({ error: 'No segment assigned' }, { status: 400 });

            if (campaign.type === 'whatsapp') {
                const phones = campaign.segment.members
                    .filter(m => m.guest.phone)
                    .map(m => m.guest.phone!);

                const guestNames = new Map(
                    campaign.segment.members
                        .filter(m => m.guest.phone)
                        .map(m => [m.guest.phone!, m.guest.name])
                );

                // Import dynamically to avoid circular deps
                const { sendWhatsAppCampaign } = await import('@/lib/services/campaign-service');
                const result = await sendWhatsAppCampaign(
                    campaign.id,
                    phones,
                    campaign.content || '',
                    guestNames
                );

                return NextResponse.json({ success: true, ...result });
            }

            // Email campaign (placeholder for Mailchimp/SMTP integration)
            if (campaign.type === 'email') {
                const emails = campaign.segment.members
                    .filter(m => m.guest.email)
                    .map(m => m.guest.email!);

                // TODO: Implement Mailchimp/SMTP sending
                await prisma.campaign.update({
                    where: { id: campaign.id },
                    data: { status: 'sent', sentAt: new Date(), totalSent: emails.length },
                });

                return NextResponse.json({ success: true, sent: emails.length, note: 'Email sending placeholder' });
            }
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[CRM Campaigns POST]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// PUT — Update campaign
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const campaign = await prisma.campaign.update({
            where: { id: body.id },
            data: {
                name: body.name,
                type: body.type,
                segmentId: body.segmentId,
                templateId: body.templateId,
                subject: body.subject,
                content: body.content,
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                status: body.status,
            },
        });
        return NextResponse.json(campaign);
    } catch (error) {
        console.error('[CRM Campaigns PUT]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
