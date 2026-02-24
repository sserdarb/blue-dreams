import { NextResponse } from 'next/server'
import { getGeminiApiKey, GEMINI_REST_MODEL } from '@/lib/ai-config'

export async function POST(request: Request) {
    try {
        const { sourceLocale, targetLocale, keys } = await request.json() as {
            sourceLocale: string
            targetLocale: string
            keys: Record<string, string> // key -> source text
        }

        if (!sourceLocale || !targetLocale || !keys || Object.keys(keys).length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const { key: apiKey, source } = await getGeminiApiKey()
        console.log(`[AI Translate] Using API key from ${source}`)
        if (!apiKey) {
            return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 })
        }

        const LANG_NAMES: Record<string, string> = {
            tr: 'Turkish', en: 'English', de: 'German', ru: 'Russian'
        }

        const prompt = `You are a professional hotel management software translator. Translate the following UI strings from ${LANG_NAMES[sourceLocale] || sourceLocale} to ${LANG_NAMES[targetLocale] || targetLocale}.

Context: These are admin panel UI labels for a luxury hotel management system (PMA Gravity). Keep translations concise, professional, and appropriate for a hotel/hospitality context.

Rules:
- Keep translations concise (similar length to source)
- Preserve technical terms (ADR, RevPAR, KPI, YTD) as-is
- For array values (JSON arrays), translate each element
- Return ONLY a valid JSON object mapping the same keys to translated values
- Do not add explanations

Source strings:
${JSON.stringify(keys, null, 2)}`

        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_REST_MODEL}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: 4096, temperature: 0.3 }
                })
            }
        )

        if (!res.ok) {
            console.error('[AI Translate] Gemini error:', res.status)
            return NextResponse.json({ error: 'AI service error' }, { status: 502 })
        }

        const result = await res.json()
        const text = result?.candidates?.[0]?.content?.parts?.[0]?.text || ''

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({ error: 'Could not parse AI response' }, { status: 500 })
        }

        const translations = JSON.parse(jsonMatch[0])
        return NextResponse.json({ translations, targetLocale })
    } catch (error: any) {
        console.error('[AI Translate] Error:', error)
        return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 })
    }
}
