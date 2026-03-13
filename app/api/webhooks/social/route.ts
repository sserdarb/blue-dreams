import { NextRequest, NextResponse } from 'next/server';
import { sendSocialMessage } from '@/lib/whatsapp';
import { prisma } from '@/lib/prisma';

// ─── Guest Profile Upsert ───────────────────────────────────────────────
async function upsertGuest(params: { phone?: string; socialId?: string; name?: string; platform: string }) {
    try {
        const { phone, socialId, name, platform } = params;
        if (!phone && !socialId) return null;

        // Find existing guest by phone
        if (phone) {
            const existing = await prisma.guestProfile.findFirst({
                where: { phone: { contains: phone.replace(/^\+/, '') } }
            });
            if (existing) return existing;
        }

        // For FB/IG: check if we've seen this socialId before in messages and linked a guest
        if (socialId && !phone) {
            const existingMsg = await prisma.socialMessage.findFirst({
                where: { socialId, guestId: { not: null } },
                select: { guestId: true },
            });
            if (existingMsg?.guestId) {
                return await prisma.guestProfile.findUnique({ where: { id: existingMsg.guestId } });
            }
        }

        // Create new guest from social contact
        const nameParts = (name || 'Misafir').split(' ');
        return await prisma.guestProfile.create({
            data: {
                name: nameParts[0] || 'Misafir',
                surname: nameParts.slice(1).join(' ') || '',
                phone: phone || null,
                notes: socialId ? `${platform}:${socialId}` : null,
                source: 'social',
            },
        });
    } catch (err) {
        console.error('[Webhook] Guest upsert error:', err);
        return null;
    }
}

// ─── Fetch Sender Name from Meta Graph API ──────────────────────────────
async function fetchSenderName(senderId: string): Promise<string> {
    try {
        const token = process.env.META_ACCESS_TOKEN;
        if (!token) return senderId;
        const res = await fetch(
            `https://graph.facebook.com/v21.0/${senderId}?fields=name&access_token=${token}`
        );
        if (!res.ok) return senderId;
        const data = await res.json();
        return data.name || senderId;
    } catch {
        return senderId;
    }
}

// ─── Save Message (upsert to avoid duplicates) ──────────────────────────
async function saveMessage(params: {
    platform: string;
    phone?: string | null;
    socialId?: string | null;
    content: string;
    direction: 'inbound' | 'outbound';
    waMessageId?: string | null;
    type?: string;
    senderName?: string;
    guestId?: string | null;
    metadata?: string;
}) {
    try {
        const { platform, phone, socialId, content, direction, waMessageId, type, senderName, guestId, metadata } = params;

        // Use upsert for deduplication when we have waMessageId
        if (waMessageId) {
            await prisma.socialMessage.upsert({
                where: { waMessageId },
                update: {}, // Already exists — skip
                create: {
                    waMessageId,
                    platform,
                    phone: phone || null,
                    socialId: socialId || null,
                    direction,
                    type: type || 'text',
                    content,
                    senderName: senderName || null,
                    guestId: guestId || null,
                    isFromGuest: direction === 'inbound',
                    status: direction === 'inbound' ? 'received' : 'sent',
                    metadata: metadata || null,
                },
            });
        } else {
            await prisma.socialMessage.create({
                data: {
                    platform,
                    phone: phone || null,
                    socialId: socialId || null,
                    direction,
                    type: type || 'text',
                    content,
                    senderName: senderName || null,
                    guestId: guestId || null,
                    isFromGuest: direction === 'inbound',
                    status: direction === 'inbound' ? 'received' : 'sent',
                },
            });
        }
    } catch (err) {
        console.error(`[Webhook] Failed to save ${params.platform} message:`, err);
    }
}

// ─── AI Auto-Reply Check ────────────────────────────────────────────────
async function checkAutoReply(sender: string, text: string, platform: string) {
    try {
        const settings = await prisma.aiSettings.findFirst({ where: { isActive: true } });
        if (!settings?.whatsappAutoReply) return;

        // Only auto-reply for WhatsApp (FB/IG needs Page Send permissions)
        if (platform !== 'whatsapp') return;

        const apiKey = settings.apiKey;
        if (!apiKey) return;

        const systemPrompt = settings.whatsappSystemPrompt || settings.systemPrompt ||
            'Sen Blue Dreams Resort\'un dijital asistanısın. Kısa, samimi ve yardımcı cevaplar ver.';

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `${systemPrompt}\n\nMisafir mesajı: ${text}` }] }],
                    generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
                }),
            }
        );

        if (!res.ok) return;
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!reply) return;

        await sendSocialMessage(sender, reply);

        await saveMessage({
            platform: 'whatsapp',
            phone: sender,
            content: reply,
            direction: 'outbound',
            senderName: 'AI Bot',
        });

        console.log(`[Webhook] AI auto-reply sent to ${sender}`);
    } catch (err) {
        console.error('[Webhook] Auto-reply error:', err);
    }
}

// ─── Process Incoming Messages ──────────────────────────────────────────

async function processWhatsApp(entry: any) {
    for (const change of (entry.changes || [])) {
        if (change.field !== 'messages') continue;
        const value = change.value;
        const messages = value?.messages || [];
        const contacts = value?.contacts || [];

        for (const msg of messages) {
            const phone = msg.from;
            const contact = contacts.find((c: any) => c.wa_id === phone);
            const senderName = contact?.profile?.name || phone;
            const msgType = msg.type || 'text';

            let content = '';
            if (msgType === 'text') content = msg.text?.body || '';
            else if (msgType === 'image') content = msg.image?.caption || '[Resim]';
            else if (msgType === 'video') content = msg.video?.caption || '[Video]';
            else if (msgType === 'audio') content = '[Ses Mesajı]';
            else if (msgType === 'document') content = msg.document?.filename || '[Dosya]';
            else if (msgType === 'location') content = `[Konum: ${msg.location?.latitude}, ${msg.location?.longitude}]`;
            else if (msgType === 'reaction') content = `[Tepki: ${msg.reaction?.emoji}]`;
            else content = `[${msgType}]`;

            const guest = await upsertGuest({ phone, name: senderName, platform: 'whatsapp' });

            await saveMessage({
                platform: 'whatsapp',
                phone,
                waMessageId: msg.id,
                direction: 'inbound',
                type: msgType,
                content,
                senderName,
                guestId: guest?.id,
                metadata: JSON.stringify(msg),
            });

            console.log(`[Webhook] WA from ${senderName} (${phone}): ${content.slice(0, 50)}`);

            if (msgType === 'text' && content) {
                await checkAutoReply(phone, content, 'whatsapp');
            }
        }
    }
}

async function processFacebookMessenger(entry: any) {
    for (const event of (entry.messaging || [])) {
        if (!event.message || event.message.is_echo) continue;

        const senderId = event.sender?.id;
        if (!senderId) continue;

        const content = event.message.text || '[Medya]';
        const msgId = event.message.mid;
        const senderName = await fetchSenderName(senderId);
        const guest = await upsertGuest({ socialId: senderId, name: senderName, platform: 'facebook' });

        await saveMessage({
            platform: 'facebook',
            socialId: senderId,
            waMessageId: msgId,
            direction: 'inbound',
            type: event.message.attachments ? 'attachment' : 'text',
            content,
            senderName,
            guestId: guest?.id,
            metadata: JSON.stringify(event),
        });

        console.log(`[Webhook] FB from ${senderName} (${senderId}): ${content.slice(0, 50)}`);
    }
}

async function processInstagramDM(entry: any) {
    for (const event of (entry.messaging || [])) {
        if (!event.message || event.message.is_echo) continue;

        const senderId = event.sender?.id;
        if (!senderId) continue;

        const content = event.message.text || '[Medya]';
        const msgId = event.message.mid;
        const senderName = await fetchSenderName(senderId);
        const guest = await upsertGuest({ socialId: senderId, name: senderName, platform: 'instagram' });

        await saveMessage({
            platform: 'instagram',
            socialId: senderId,
            waMessageId: msgId,
            direction: 'inbound',
            type: event.message.attachments ? 'attachment' : 'text',
            content,
            senderName,
            guestId: guest?.id,
            metadata: JSON.stringify(event),
        });

        console.log(`[Webhook] IG from ${senderName} (${senderId}): ${content.slice(0, 50)}`);
    }
}

// ─── Meta Webhook Verification (GET) ────────────────────────────────────

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const mode = sp.get('hub.mode');
    const token = sp.get('hub.verify_token');
    const challenge = sp.get('hub.challenge');

    const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || process.env.WHATSAPP_VERIFY_TOKEN || 'bluedreams_wa_secret_2025';

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('[Webhook] ✅ Verification successful');
        return new NextResponse(challenge, { status: 200 });
    }

    console.warn('[Webhook] ❌ Verification failed — token mismatch');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

// ─── Incoming Message Handler (POST) ────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Process async — Meta expects fast response 
        const processAsync = async () => {
            try {
                if (!body.entry?.length) return;
                for (const entry of body.entry) {
                    if (body.object === 'whatsapp_business_account') {
                        await processWhatsApp(entry);
                    } else if (body.object === 'page') {
                        await processFacebookMessenger(entry);
                    } else if (body.object === 'instagram') {
                        await processInstagramDM(entry);
                    }
                }
            } catch (err) {
                console.error('[Webhook] Async processing error:', err);
            }
        };

        processAsync(); // Fire-and-forget
        return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } catch (error) {
        console.error('[Webhook] Parse error:', error);
        return new NextResponse('EVENT_RECEIVED', { status: 200 }); // Always 200 to prevent retries
    }
}
