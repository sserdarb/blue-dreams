import { NextResponse } from 'next/server'
import { GEMINI_API_KEY } from '@/lib/ai-config'

export async function POST(request: Request) {
    try {
        const { widgetTitle, widgetDescription, data, locale = 'tr' } = await request.json()

        if (!data || !widgetTitle) {
            return NextResponse.json({ error: 'Missing data or widgetTitle' }, { status: 400 })
        }

        const langInstruction: Record<string, string> = {
            tr: 'Yanıtını Türkçe ver.',
            en: 'Respond in English.',
            de: 'Antworte auf Deutsch.',
            ru: 'Ответь на русском языке.',
        }
        const langText = langInstruction[locale as string] || 'Yanıtını Türkçe ver.'

        const descBlock = widgetDescription ? `\nRapor Açıklaması: ${widgetDescription}\n` : ''

        const prompt = `Sen bir otel yönetim danışmanısın. Aşağıdaki rapor widget verilerini analiz et ve kısa, öz, aksiyon odaklı bir yorum yap. Raporun amacını ve yorumlama mantığını göz önünde bulundur. ${langText}

Widget: ${widgetTitle}
${descBlock}
Veri:
${JSON.stringify(data, null, 2)}

Kurallar:
- En fazla 3-4 cümle yaz
- Önemli trendleri belirt
- Aksiyon önerileri sun
- Rakamları kullan
- Emoji kullanma
- Raporun amacına uygun yorum yap`

        const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 })
        }

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
                })
            }
        )

        if (!res.ok) {
            console.error('[AI Interpret] Gemini error:', res.status)
            return NextResponse.json({ error: 'AI servisi yanıt vermedi' }, { status: 502 })
        }

        const result = await res.json()
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || 'Yorum üretilemedi.'

        return NextResponse.json({ interpretation: text })
    } catch (error: any) {
        console.error('[AI Interpret] Error:', error)
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
    }
}
