import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendSocialMessage } from '@/lib/whatsapp';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const contactId = searchParams.get('contactId');

        if (contactId) {
            // Fetch messages for a specific contact (phone or socialId)
            const messages = await prisma.socialMessage.findMany({
                where: {
                    OR: [
                        { phone: contactId },
                        { socialId: contactId }
                    ]
                },
                orderBy: { createdAt: 'asc' },
            });
            return NextResponse.json({ success: true, messages });
        } else {
            // Group by contact (using phone or socialId as the unique thread key)
            // In a production app, we might use a dedicated 'Thread' model. Here we just query distinct.

            // To get recent threads, we can get the latest message per contact.
            // Since Prisma doesn't support complex distinct easily on multiple columns with latest, 
            // we'll fetch recently active messages and group them in-memory.

            const recentMessages = await prisma.socialMessage.findMany({
                orderBy: { createdAt: 'desc' },
                take: 500, // Look at last 500 messages
                include: {
                    guest: {
                        select: { name: true, surname: true }
                    }
                }
            });

            const threadsMap = new Map();
            recentMessages.forEach(msg => {
                const threadKey = msg.platform === 'whatsapp' ? msg.phone : msg.socialId;
                if (!threadKey) return;

                if (!threadsMap.has(threadKey)) {
                    threadsMap.set(threadKey, {
                        contactId: threadKey,
                        platform: msg.platform,
                        guestName: msg.guest ? `${msg.guest.name} ${msg.guest.surname}` : 'Unknown Guest',
                        lastMessage: msg.content,
                        lastMessageDate: msg.createdAt,
                        unreadCount: msg.status === 'received' ? 1 : 0
                    });
                } else if (msg.status === 'received') {
                    // Accumulate unread
                    const t = threadsMap.get(threadKey);
                    t.unreadCount += 1;
                }
            });

            return NextResponse.json({ success: true, threads: Array.from(threadsMap.values()) });
        }
    } catch (error) {
        console.error('[Settings] Fetch err:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { platform, contactId, content } = body;

        if (!contactId || !content || !platform) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Try to match with existing guest profile
        const guest = await prisma.guestProfile.findFirst({
            where: {
                OR: [
                    { phone: { contains: contactId.replace(/^\+/, '') } }
                ]
            }
        });

        // Save outbound message to DB
        const savedMessage = await prisma.socialMessage.create({
            data: {
                platform,
                phone: platform === 'whatsapp' ? contactId : null,
                socialId: platform !== 'whatsapp' ? contactId : null,
                direction: 'outbound',
                type: 'text',
                content,
                guestId: guest?.id || null,
                isFromGuest: false,
                status: 'sent',
            },
        });

        // Send via provider
        if (platform === 'whatsapp') {
            await sendSocialMessage(contactId, content);
        } else {
            console.log(`[Omnichannel] Mock sending outbound message to ${platform} for ${contactId}: ${content}`);
        }

        return NextResponse.json({ success: true, message: savedMessage });
    } catch (error) {
        console.error('[Social Messages API] Send error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
