import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import OpenAI from "openai"
import { getGeminiApiKey, GEMINI_MODEL, ZHIPU_API_KEY, ZHIPU_MODEL } from '@/lib/ai-config'

export async function POST(request: Request) {
    try {
        const { sourceLocale, targetLocale, keys } = await request.json() as {
            sourceLocale: string
            targetLocale: string
            keys: Record<string, string>
        }

        if (!sourceLocale || !targetLocale || !keys || Object.keys(keys).length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
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

        // Multi-provider fallback: Gemini → Zhipu
        const providers: { name: string; fn: () => Promise<string> }[] = []

        const { key: geminiKey, source } = await getGeminiApiKey()
        console.log(`[AI Translate] Using API key from ${source}`)

        if (geminiKey) {
            providers.push({
                name: 'Gemini',
                fn: async () => {
                    const ai = new GoogleGenAI({ apiKey: geminiKey })
                    const response = await ai.models.generateContent({
                        model: GEMINI_MODEL,
                        contents: prompt,
                        config: { temperature: 0.3 }
                    })
                    return typeof response.text === 'string' ? response.text : ''
                }
            })
        }

        if (ZHIPU_API_KEY) {
            providers.push({
                name: 'Zhipu',
                fn: async () => {
                    const openai = new OpenAI({ apiKey: ZHIPU_API_KEY, baseURL: 'https://open.bigmodel.cn/api/paas/v4/' })
                    const r = await openai.chat.completions.create({
                        model: ZHIPU_MODEL,
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.3,
                        max_tokens: 4096
                    })
                    return r.choices[0]?.message?.content || ''
                }
            })
        }

        let text = ''
        for (const provider of providers) {
            try {
                console.log(`[AI Translate] Trying ${provider.name}`)
                text = await provider.fn()
                console.log(`[AI Translate] Success with ${provider.name}`)
                break
            } catch (err: any) {
                console.error(`[AI Translate] ${provider.name} failed:`, err.message)
            }
        }

        if (!text) {
            return NextResponse.json({ error: 'Tüm AI servisleri yanıt veremedi.' }, { status: 503 })
        }

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
