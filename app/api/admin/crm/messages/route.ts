// CRM WhatsApp Inbox API — Messages and templates
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSocialMessage } from '@/lib/whatsapp';
import { isDemoSession } from '@/lib/demo-session';

// GET — WhatsApp inbox with filters
export async function GET(req: NextRequest) {
    try {
        const siteSettings = await prisma.siteSettings.findFirst();
        const demoSession = await isDemoSession();
        const isDemo = demoSession || (siteSettings?.demoModeInbox ?? false);

        const sp = req.nextUrl.searchParams;
        const page = parseInt(sp.get('page') || '1');
        const limit = parseInt(sp.get('limit') || '50');
        const direction = sp.get('direction') || ''; // inbound, outbound
        const phone = sp.get('phone') || '';
        const search = sp.get('search') || '';
        const isFromGuest = sp.get('isFromGuest'); // true/false
        const fromDate = sp.get('fromDate') || '';
        const toDate = sp.get('toDate') || '';
        const view = sp.get('view') || 'messages'; // messages, conversations, templates

        // Templates view
        if (view === 'templates') {
            const templates = await prisma.whatsAppTemplate.findMany({
                where: { isActive: true },
                orderBy: { useCount: 'desc' },
            });
            return NextResponse.json({ templates });
        }

        // Conversations view — group by phone number
        if (view === 'conversations') {
            if (isDemo) {
                const mockConvs = Array.from({ length: 5 }).map((_, i) => ({
                    phone: `+90555123456${i}`,
                    messageCount: Math.floor(Math.random() * 20) + 1,
                    lastMessageAt: new Date(Date.now() - i * 3600000).toISOString(),
                    guest: { id: `g${i}`, name: `Guest ${i}`, surname: 'Demo', country: 'TR', totalStays: 2 },
                    lastMessage: { content: i % 2 === 0 ? "When is check-in?" : "Your room is ready.", direction: i % 2 === 0 ? 'inbound' : 'outbound', createdAt: new Date(Date.now() - i * 3600000).toISOString() }
                }));
                return NextResponse.json({ conversations: mockConvs, total: 5, page, limit });
            }

            const conversations = await prisma.socialMessage.groupBy({
                by: ['phone'],
                _count: true,
                _max: { createdAt: true },
                orderBy: { _max: { createdAt: 'desc' } },
                take: limit,
                skip: (page - 1) * limit,
            });

            // Enrich with guest info and last message
            const enriched = await Promise.all(
                conversations.map(async conv => {
                    const guest = await prisma.guestProfile.findFirst({
                        where: { phone: conv.phone },
                        select: { id: true, name: true, surname: true, country: true, totalStays: true },
                    });
                    const lastMessage = await prisma.socialMessage.findFirst({
                        where: { phone: conv.phone },
                        orderBy: { createdAt: 'desc' },
                        select: { content: true, direction: true, createdAt: true },
                    });
                    return {
                        phone: conv.phone,
                        messageCount: conv._count,
                        lastMessageAt: conv._max.createdAt,
                        guest,
                        lastMessage,
                    };
                })
            );

            const total = await prisma.socialMessage.groupBy({
                by: ['phone'],
                _count: true,
            });

            return NextResponse.json({ conversations: enriched, total: total.length, page, limit });
        }

        // Messages view — flat list
        if (isDemo) {
            const mockMsgs = Array.from({ length: 15 }).map((_, i) => ({
                id: `msg_${i}`,
                phone: `+90555123456${i % 3}`,
                direction: i % 2 === 0 ? 'inbound' : 'outbound',
                content: i % 2 === 0 ? 'Can I get my room cleaned?' : 'We have scheduled housekeeping for your room.',
                type: 'text',
                status: 'delivered',
                createdAt: new Date(Date.now() - i * 1800000).toISOString(),
                guest: { id: `g${i % 3}`, name: `Guest ${i % 3}`, surname: 'Demo', country: 'TR', totalStays: 1 }
            }));
            return NextResponse.json({ messages: mockMsgs, total: 15, page, limit });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (direction) where.direction = direction;
        if (phone) where.phone = { contains: phone };
        if (search) where.content = { contains: search, mode: 'insensitive' };
        if (isFromGuest === 'true') where.isFromGuest = true;
        if (isFromGuest === 'false') where.isFromGuest = false;
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
        console.error('[CRM WhatsApp]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// POST — Send reply or manage templates
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Send a reply message
        if (body.action === 'reply') {
            const { phone, content, templateId } = body;

            let messageContent = content;

            // If using a template, merge it
            if (templateId) {
                const template = await prisma.whatsAppTemplate.findUnique({ where: { id: templateId } });
                if (template) {
                    messageContent = template.content;
                    // Replace variables if guest info available
                    const guest = await prisma.guestProfile.findFirst({ where: { phone } });
                    if (guest) {
                        messageContent = messageContent
                            .replace(/\{\{name\}\}/g, guest.name)
                            .replace(/\{\{surname\}\}/g, guest.surname);
                    }
                    await prisma.whatsAppTemplate.update({
                        where: { id: templateId },
                        data: { useCount: { increment: 1 } },
                    });
                }
            }

            await sendSocialMessage(phone, messageContent);

            // Record sent message
            const guest = await prisma.guestProfile.findFirst({ where: { phone } });
            await prisma.socialMessage.create({
                data: {
                    phone,
                    direction: 'outbound',
                    type: templateId ? 'template' : 'text',
                    content: messageContent,
                    templateId,
                    guestId: guest?.id || null,
                    status: 'sent',
                },
            });

            return NextResponse.json({ success: true });
        }

        // Create WhatsApp template
        if (body.action === 'createTemplate') {
            const template = await prisma.whatsAppTemplate.create({
                data: {
                    name: body.name,
                    content: body.content,
                    category: body.category || 'general',
                    language: body.language || 'tr',
                },
            });
            return NextResponse.json(template);
        }

        // Update template
        if (body.action === 'updateTemplate') {
            const template = await prisma.whatsAppTemplate.update({
                where: { id: body.id },
                data: {
                    name: body.name,
                    content: body.content,
                    category: body.category,
                    language: body.language,
                    isActive: body.isActive,
                },
            });
            return NextResponse.json(template);
        }

        // Delete template
        if (body.action === 'deleteTemplate') {
            await prisma.whatsAppTemplate.delete({ where: { id: body.id } });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('[CRM WhatsApp POST]', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
