import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getGeminiApiKey, GEMINI_MODEL, getAlternativeKey } from '@/lib/ai-config'

const LANG_MAP: Record<string, string> = {
    tr: 'Turkish', en: 'English', de: 'German', ru: 'Russian'
}

export async function POST(request: Request) {
    try {
        const { title, locale, widgets } = await request.json()

        if (!title || !locale) {
            return NextResponse.json({ error: 'Missing title or locale' }, { status: 400 })
        }

        const lang = LANG_MAP[locale] || 'Turkish'

        let contentContext = ''
        if (widgets && Array.isArray(widgets) && widgets.length > 0) {
            // Join first 3 widgets text content to avoid huge prompts
            const texts = widgets.slice(0, 3).map(w => {
                try {
                    const parsed = JSON.parse(w)
                    // basic heuristic to extract useful strings
                    return Object.values(parsed).filter(v => typeof v === 'string').join(' ')
                } catch (e) { return w }
            })
            contentContext = texts.join('\n---\n').substring(0, 2000)
        }

        const prompt = `You are an expert SEO copywriter for a 5-star luxury resort (Blue Dreams Resort - Bodrum).
Write a compelling meta description for a page in ${lang}.
Page Title: "${title}"
${contentContext ? `Page Content Context: ${contentContext}` : ''}

Rules:
1. MAX 160 characters (strict limit).
2. Must be highly engaging, professional, and SEO-optimized.
3. Don't include hashtags, emojis, or any introductory text. JUST return the final meta description string.
4. Language: EXCLUSIVELY ${lang}
`

        const { key: apiKey } = await getGeminiApiKey(locale)
        if (!apiKey) return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 })

        let currentKey = apiKey
        let text = ''

        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const ai = new GoogleGenAI({ apiKey: currentKey })
                const response = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt,
                    config: { temperature: 0.7, maxOutputTokens: 100 }
                })
                text = typeof response.text === 'string' ? response.text.trim() : ''
                break
            } catch (err: any) {
                if (err?.status === 429 || err?.message?.includes('429')) {
                    const alt = await getAlternativeKey(currentKey, locale)
                    if (alt) { currentKey = alt.key; continue }
                }
                throw err
            }
        }

        if (!text) return NextResponse.json({ error: 'Failed to generate SEO description' }, { status: 502 })

        // Remove quotes if Gemini added them
        text = text.replace(/^["']|["']$/g, '')

        return NextResponse.json({ description: text })

    } catch (error: any) {
        console.error('[CMS SEO Generate] Error:', error)
        return NextResponse.json({ error: error.message || 'SEO Generation failed' }, { status: 500 })
    }
}
