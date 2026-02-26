import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import { GoogleGenAI } from '@google/genai';
import { getGeminiApiKey, GEMINI_MODEL } from '@/lib/ai-config';

const processWhatsAppMessage = async (message: any, phoneNumberId: string) => {
    const sender = message.from;
    console.log(`[WhatsApp] Received message from ${sender}`, message);

    // Check if text message
    if (message.type === 'text') {
        const textData = message.text.body;
        console.log(`[WhatsApp] Processing text: ${textData}`);

        try {
            // Get API key for AI response (using default locale 'tr')
            const { key: apiKey } = await getGeminiApiKey('tr');
            if (apiKey) {
                const ai = new GoogleGenAI({ apiKey });
                const systemPrompt = `Sen Blue Dreams Resort'un dijital WhatsApp asistanısın. Kısa, samimi ve yardımcı cevaplar ver. Sadece metin tabanlı yanıtlar üretebilirsin, buton veya arayüz gönderemezsin. Fiyat ve müsaitlik konularında kullanıcıyı web sitemizdeki rezervasyon modülüne yönlendir.`;

                const response = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: [{ role: 'user', parts: [{ text: textData }] }],
                    config: { systemInstruction: systemPrompt }
                });

                let replyText = "";
                if (typeof response.text === 'string') replyText = response.text;
                else if (typeof response.text === 'function') replyText = (response as any).text();
                else if (response.candidates?.[0]?.content?.parts?.[0]?.text) replyText = response.candidates[0].content.parts[0].text;

                if (replyText) {
                    await sendWhatsAppMessage(sender, replyText);
                }
            } else {
                await sendWhatsAppMessage(sender, "Merhaba, şu an sistemde güncelleme yapıyoruz. En kısa sürede size döneceğiz.");
            }
        } catch (err) {
            console.error('[WhatsApp] AI Gen Error:', err);
            await sendWhatsAppMessage(sender, "Üzgünüm, şu an yanıt veremiyorum. Lütfen daha sonra tekrar deneyin veya bizi arayın.");
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
