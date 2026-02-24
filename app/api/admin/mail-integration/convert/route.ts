import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getGeminiApiKey, GEMINI_REST_MODEL } from '@/lib/ai-config'

// POST /api/admin/mail-integration/convert — AI email→task
export async function POST(request: NextRequest) {
    try {
        const { subject, body, from, locale = 'tr' } = await request.json()
        if (!subject && !body) return NextResponse.json({ error: 'subject or body required' }, { status: 400 })

        const { key: apiKey } = await getGeminiApiKey(locale)
        if (!apiKey) return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 })

        const prompt = `Sen bir otel yönetim asistanısın. Aşağıdaki e-postayı analiz et ve bir görev önerisi oluştur.

E-posta:
Konu: ${subject || '(Konu yok)'}
Gönderen: ${from || '(Bilinmiyor)'}
İçerik: ${body || '(İçerik yok)'}

Yanıtını şu JSON formatında ver (başka hiçbir şey yazma):
{
  "title": "Görev başlığı (kısa ve aksiyon odaklı)",
  "description": "Görev açıklaması (e-postadan çıkarılan detaylar)",
  "priority": "low|medium|high|urgent",
  "suggestedDepartment": "Ön Büro|Housekeeping|F&B|Teknik|Yönetim|Muhasebe|Satış|Diğer",
  "estimatedMin": 30,
  "tags": ["tag1", "tag2"]
}`

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_REST_MODEL}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: 500, temperature: 0.3 },
                }),
            }
        )

        if (!res.ok) return NextResponse.json({ error: 'AI servisi yanıt vermedi' }, { status: 502 })

        const result = await res.json()
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) return NextResponse.json({ error: 'AI yanıtı parse edilemedi', raw: text }, { status: 422 })

        const taskSuggestion = JSON.parse(jsonMatch[0])
        return NextResponse.json({
            ...taskSuggestion,
            sourceType: 'email',
            sourceRef: `${from}: ${subject}`,
        })
    } catch (error: any) {
        console.error('[Mail Convert] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
