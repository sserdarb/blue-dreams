import { NextRequest, NextResponse } from 'next/server';
import { sendSocialMessage } from '@/lib/whatsapp';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, GEMINI_MODEL } from '@/lib/ai-config';
import { prisma } from '@/lib/prisma';

// Save incoming/outgoing social message to DB and match guest
async function saveMessage(platform: string, phone: string, content: string, direction: 'inbound' | 'outbound', waMessageId?: string, type: string = 'text') {
    try {
        // Try to match with existing guest profile (using phone or socialId lookup)
        const guest = await prisma.guestProfile.findFirst({
            where: {
                OR: [
                    { phone: { contains: phone.replace(/^\+/, '') } }
                ]
            }
        });

        await prisma.socialMessage.create({
            data: {
                waMessageId: waMessageId || null,
                platform,
                phone: platform === 'whatsapp' ? phone : null,
                socialId: platform !== 'whatsapp' ? phone : null,
                direction,
                type,
                content,
                guestId: guest?.id || null,
                isFromGuest: !!guest,
                status: direction === 'inbound' ? 'received' : 'sent',
            },
        });
    } catch (err) {
        console.error(`[${platform}] Failed to save message:`, err);
    }
}

// Check if auto-reply is enabled in AiSettings
async function isAutoReplyEnabled(platform: string): Promise<{ enabled: boolean; systemPrompt: string | null }> {
    try {
        const settings = await prisma.aiSettings.findFirst({
            where: { language: 'tr' },
        });

        let enabled = false;
        let systemPrompt = null;

        if (platform === 'whatsapp') {
            enabled = settings?.whatsappAutoReply ?? false;
            systemPrompt = settings?.whatsappSystemPrompt || null;
        } else if (platform === 'facebook' || platform === 'instagram') {
            // Reusing WhatsApp settings or we can create specific ones in the future
            enabled = settings?.whatsappAutoReply ?? false;
            systemPrompt = settings?.whatsappSystemPrompt || null;
        }

        return { enabled, systemPrompt };
    } catch {
        return { enabled: false, systemPrompt: null };
    }
}

const processSocialMessage = async (platform: string, sender: string, textData: string, messageId: string, messageType: string = 'text') => {
    console.log(`[${platform}] Received message from ${sender}: ${textData}`);

    await saveMessage(platform, sender, textData || '[unsupported message type]', 'inbound', messageId, messageType);

    if (messageType === 'text' && textData) {
        const { enabled, systemPrompt } = await isAutoReplyEnabled(platform);

        if (!enabled) {
            console.log(`[${platform}] Auto-reply disabled, message saved only.`);
            return;
        }

        try {
            const { key: apiKey } = await getGeminiApiKey('tr');
            if (apiKey) {
                const ai = new GoogleGenAI({ apiKey });
                const prompt = systemPrompt ||
                    `Sen Blue Dreams Resort'un dijital asistanısın. Kısa, samimi ve yardımcı cevaplar ver. Sadece metin tabanlı yanıtlar üretebilirsin, buton veya arayüz gönderemezsin. Fiyat ve müsaitlik konularında kullanıcıyı web sitemizdeki rezervasyon modülüne yönlendir.`;

                const response = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: [{ role: 'user', parts: [{ text: textData }] }],
                    config: { systemInstruction: prompt }
                });

                const replyText = response.text?.trim();

                if (replyText) {
                    if (platform === 'whatsapp') {
                        await sendSocialMessage(sender, replyText);
                    } else {
                        // For Facebook and Instagram, graph API send endpoint is needed
                        // TODO: Implement facebook/instagram graph API send wrapper
                        console.log(`[Omnichannel] Mock sending to ${platform} for ${sender}: ${replyText}`);
                    }
                    await saveMessage(platform, sender, replyText, 'outbound', undefined, 'text');
                }
            }
        } catch (err) {
            console.error(`[${platform}] AI Gen Error:`, err);
        }
    }
};

// Meta Webhook Verification handler (Shared for WhatsApp, Facebook, Instagram)
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'bluedreams_wa_secret_2025';

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('[Meta Webhook] Verified successfully');
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse('Forbidden', { status: 403 });
}

// Meta Webhook Event receiver (WhatsApp, Facebook, Instagram)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // 1. WhatsApp API events
        if (body.object === 'whatsapp_business_account') {
            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.value && change.value.messages) {
                        for (const message of change.value.messages) {
                            const textData = message.type === 'text' ? message.text?.body : `[${message.type}]`;
                            await processSocialMessage('whatsapp', message.from, textData, message.id, message.type);
                        }
                    }
                }
            }
            return new NextResponse('EVENT_RECEIVED', { status: 200 });
        }

        // 2. Facebook Messenger or Instagram Direct messages
        else if (body.object === 'page' || body.object === 'instagram') {
            for (const entry of body.entry) {
                const platform = body.object === 'instagram' ? 'instagram' : 'facebook';

                if (entry.messaging) {
                    for (const event of entry.messaging) {
                        if (event.message && !event.message.is_echo) {
                            const sender = event.sender.id;
                            const textData = event.message.text || '[attachment]';
                            const messageId = event.message.mid;
                            await processSocialMessage(platform, sender, textData, messageId, event.message.attachments ? 'attachment' : 'text');
                        }
                    }
                }
            }
            return new NextResponse('EVENT_RECEIVED', { status: 200 });
        }

        return new NextResponse('Not a supported Meta event', { status: 404 });
    } catch (error) {
        console.error('[Meta Webhook] Processing error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
