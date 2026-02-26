import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, GEMINI_MODEL } from '@/lib/ai-config';
import { prisma } from '@/lib/prisma';

// Save incoming/outgoing WhatsApp message to DB and match guest
async function saveMessage(phone: string, content: string, direction: 'inbound' | 'outbound', waMessageId?: string, type: string = 'text') {
    try {
        // Try to match with existing guest profile
        const guest = await prisma.guestProfile.findFirst({
            where: { phone: { contains: phone.replace(/^\+/, '') } },
        });

        await prisma.whatsAppMessage.create({
            data: {
                waMessageId: waMessageId || null,
                phone,
                direction,
                type,
                content,
                guestId: guest?.id || null,
                isFromGuest: !!guest,
                status: direction === 'inbound' ? 'received' : 'sent',
            },
        });
    } catch (err) {
        console.error('[WhatsApp] Failed to save message:', err);
    }
}

// Check if WhatsApp auto-reply is enabled in AiSettings
async function isAutoReplyEnabled(): Promise<{ enabled: boolean; systemPrompt: string | null }> {
    try {
        const settings = await prisma.aiSettings.findFirst({
            where: { language: 'tr' },
            select: { whatsappAutoReply: true, whatsappSystemPrompt: true },
        });
        return {
            enabled: settings?.whatsappAutoReply ?? false,
            systemPrompt: settings?.whatsappSystemPrompt || null,
        };
    } catch {
        return { enabled: false, systemPrompt: null };
    }
}

const processWhatsAppMessage = async (message: any, phoneNumberId: string) => {
    const sender = message.from;
    console.log(`[WhatsApp] Received message from ${sender}`, message);

    // Save inbound message to DB
    const textData = message.type === 'text' ? message.text?.body : `[${message.type}]`;
    await saveMessage(sender, textData || '[unsupported message type]', 'inbound', message.id, message.type);

    // Only auto-reply to text messages and only if enabled in admin settings
    if (message.type === 'text' && textData) {
        const { enabled, systemPrompt } = await isAutoReplyEnabled();

        if (!enabled) {
            console.log('[WhatsApp] Auto-reply disabled, message saved only.');
            return;
        }

        try {
            const { key: apiKey } = await getGeminiApiKey('tr');
            if (apiKey) {
                const ai = new GoogleGenAI({ apiKey });
                const prompt = systemPrompt ||
                    `Sen Blue Dreams Resort'un dijital WhatsApp asistanısın. Kısa, samimi ve yardımcı cevaplar ver. Sadece metin tabanlı yanıtlar üretebilirsin, buton veya arayüz gönderemezsin. Fiyat ve müsaitlik konularında kullanıcıyı web sitemizdeki rezervasyon modülüne yönlendir.`;

                const response = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: [{ role: 'user', parts: [{ text: textData }] }],
                    config: { systemInstruction: prompt }
                });

                let replyText = "";
                if (typeof response.text === 'string') replyText = response.text;
                else if (typeof response.text === 'function') replyText = (response as any).text();
                else if (response.candidates?.[0]?.content?.parts?.[0]?.text) replyText = response.candidates[0].content.parts[0].text;

                if (replyText) {
                    await sendWhatsAppMessage(sender, replyText);
                    await saveMessage(sender, replyText, 'outbound', undefined, 'text');
                }
            }
        } catch (err) {
            console.error('[WhatsApp] AI Gen Error:', err);
        }
    }
};

// Meta Webhook Verification handler
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'bluedreams_wa_secret_2025';

    if (mode === 'subscribe' && token === verifyToken) {
        console.log('[WhatsApp Webhook] Verified successfully');
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse('Forbidden', { status: 403 });
}

// Meta Webhook Event receiver
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Check if this is a WhatsApp API event
        if (body.object === 'whatsapp_business_account') {

            for (const entry of body.entry) {
                for (const change of entry.changes) {
                    if (change.value && change.value.messages) {
                        const phoneNumberId = change.value.metadata.phone_number_id;
                        for (const message of change.value.messages) {
                            await processWhatsAppMessage(message, phoneNumberId);
                        }
                    }
                }
            }
            return new NextResponse('EVENT_RECEIVED', { status: 200 });
        } else {
            return new NextResponse('Not a WhatsApp event', { status: 404 });
        }
    } catch (error) {
        console.error('[WhatsApp Webhook] Processing error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
