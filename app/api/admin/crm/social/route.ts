import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSocialMessage } from '@/lib/whatsapp';

// GET — Unified Social Inbox with filters
export async function GET(req: NextRequest) {
    try {
        const sp = req.nextUrl.searchParams;
        const page = parseInt(sp.get('page') || '1');
        const limit = parseInt(sp.get('limit') || '50');
        const direction = sp.get('direction') || ''; // inbound, outbound
        const platform = sp.get('platform') || ''; // whatsapp, facebook, instagram
        const phone = sp.get('phone') || ''; // This is used as the universal identifier (phone or socialId)
        const search = sp.get('search') || '';
        const isFromGuest = sp.get('isFromGuest'); // true/false
        const fromDate = sp.get('fromDate') || '';
        const toDate = sp.get('toDate') || '';
        const view = sp.get('view') || 'messages'; // messages, conversations, templates

        if (view === 'templates') {
            const templates = await prisma.whatsAppTemplate.findMany({
                where: { isActive: true },
                orderBy: { useCount: 'desc' },
            });
            return NextResponse.json({ templates });
        }

        if (view === 'conversations') {
            const rawConversations = await prisma.$queryRaw`
                SELECT 
                    COALESCE("phone", "socialId") as identifier,
                    "platform",
                    COUNT(*) as _count,
                    MAX("createdAt") as lastMessageAt
                FROM "SocialMessage"
                GROUP BY COALESCE("phone", "socialId"), "platform"
                ORDER BY MAX("createdAt") DESC
                LIMIT ${limit} OFFSET ${(page - 1) * limit}
            ` as any[];

            const enriched = await Promise.all(
                rawConversations.map(async conv => {
                    const guest = await prisma.guestProfile.findFirst({
                        where: {
                            phone: conv.identifier
                        },
                        select: { id: true, name: true, surname: true, country: true, totalStays: true },
                    });

                    const lastMessage = await prisma.socialMessage.findFirst({
                        where: {
                            platform: conv.platform,
                            OR: [
                                { phone: conv.identifier },
                                { socialId: conv.identifier }
                            ]
                        },
                        orderBy: { createdAt: 'desc' },
                        select: { content: true, direction: true, createdAt: true },
                    });

                    return {
                        identifier: conv.identifier,
                        platform: conv.platform,
                        messageCount: Number(conv._count),
                        lastMessageAt: conv.lastmessageat || conv.lastMessageAt,
                        guest,
                        lastMessage,
                    };
                })
            );

            return NextResponse.json({ conversations: enriched, page, limit });
        }

        // Messages view — flat list
        const where: any = {};
        if (direction) where.direction = direction;
        if (platform) where.platform = platform;
        if (search) where.content = { contains: search };
        if (isFromGuest === 'true') where.isFromGuest = true;
        if (isFromGuest === 'false') where.isFromGuest = false;

        if (phone) {
            where.OR = [
                { phone: phone },
                { socialId: phone }
            ]
        }

        if (fromDate) where.createdAt = { gte: new Date(fromDate) };
        if (toDate) where.createdAt = { ...where.createdAt, lte: new Date(toDate) };

        const [messages, total] = await Promise.all([
            prisma.socialMessage.findMany({
                where,
                include: {
                    guest: { select: { id: true, name: true, surname: true, country: true, totalStays: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.socialMessage.count({ where }),
        ]);

        return NextResponse.json({ messages, total, page, limit });
    } catch (error) {
        console.error('[CRM Social]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST — Send reply
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        if (body.action === 'reply') {
            const { phone, platform, content, templateId } = body;

            // TODO: Here we would route to WhatsApp, Facebook, or Instagram based on "platform"
            // For now, if whatsapp we use the existing sendSocialMessage wrapper
            if (platform === 'whatsapp') {
                await sendSocialMessage(phone, content);
            } else {
                console.log(`[Omnichannel] Mock sending to ${platform} for ${phone}: ${content}`);
            }

            // Record sent message
            const guest = await prisma.guestProfile.findFirst({
                where: {
                    phone: phone
                }
            });

            await prisma.socialMessage.create({
                data: {
                    platform: platform || 'whatsapp',
                    phone: platform === 'whatsapp' ? phone : null,
                    socialId: platform !== 'whatsapp' ? phone : null,
                    direction: 'outbound',
                    type: templateId ? 'template' : 'text',
                    content: content,
                    templateId,
                    guestId: guest?.id || null,
                    status: 'sent',
                },
            });

            return NextResponse.json({ success: true });
        }

        // Create WhatsApp template
        if (body.action === 'createTemplate') {
            const { name, content, category } = body;
            const newTpl = await prisma.whatsAppTemplate.create({
                data: {
                    name,
                    content,
                    category: category || 'general',
                    language: 'tr',
                    isActive: true,
                },
            });
            return NextResponse.json({ success: true, template: newTpl });
        }

        // Delete WhatsApp template
        if (body.action === 'deleteTemplate') {
            const { id } = body;
            await prisma.whatsAppTemplate.delete({ where: { id } });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[CRM Social] Action error:', error);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
