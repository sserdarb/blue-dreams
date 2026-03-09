import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getGeminiApiKey, GEMINI_MODEL, markKeyExhausted, getAlternativeKey } from '@/lib/ai-config'

const BRAND_CONTEXT = `
Blue Dreams Resort & Spa — Torba Bay, Bodrum, Turkey
- 5-star luxury all-inclusive resort
- Torba Mahallesi, Herodot Bulvarı No:11, Bodrum/Muğla
- Features: Infinity pool, Naya Spa, 4 restaurants, 10+ bars, private beach, 340+ rooms
- Room types: Club Rooms (20-22m²), Deluxe Rooms (25-28m²), Club Family Rooms (35m²)
- Brand voice: Luxury, warm hospitality, Aegean lifestyle, serenity
`.trim()

const LANG_MAP: Record<string, string> = {
    tr: 'Turkish', en: 'English', de: 'German', ru: 'Russian'
}

// Widget-specific prompt templates
function getWidgetPrompt(widgetType: string, topic: string, locale: string, context?: string): string {
    const lang = LANG_MAP[locale] || 'Turkish'
    const base = `You are a content expert for a luxury hotel resort website. Write in ${lang}.\n\n${BRAND_CONTEXT}\n\n${context ? `Additional context: ${context}\n\n` : ''}`

    const prompts: Record<string, string> = {
        'hero': `${base}Generate a hero section for the topic "${topic}". Return ONLY valid JSON:
{"backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","titleLine1":"...","titleLine2":"...","subtitle":"...","scrollText":"...","buttons":[{"text":"...","url":"/","style":"primary"}]}`,

        'page-header': `${base}Generate a page header for "${topic}". Return ONLY valid JSON:
{"title":"...","subtitle":"...","backgroundImage":"https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg","breadcrumbs":[{"label":"...","href":"/"}]}`,

        'text-block': `${base}Generate a rich text block about "${topic}" for the resort website. Return ONLY valid JSON:
{"label":"...","heading":"...","headingAccent":"...","content":"A detailed paragraph (100-200 words)","backgroundColor":"white"}`,

        'text-image': `${base}Generate a text+image section about "${topic}". Return ONLY valid JSON:
{"label":"...","heading":"...","headingAccent":"...","paragraphs":["paragraph 1","paragraph 2"],"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","imageAlt":"...","badge":{"value":"...","label":"..."}}`,

        'features': `${base}Generate a features section about "${topic}" with 3-4 feature items. Return ONLY valid JSON:
{"heading":"...","headingAccent":"...","items":[{"icon":"🌊","title":"...","description":"..."},{"icon":"✨","title":"...","description":"..."},{"icon":"🌿","title":"...","description":"..."}]}`,

        'icon-grid': `${base}Generate an icon grid section about "${topic}" with 3-4 items. Return ONLY valid JSON:
{"label":"...","heading":"...","items":[{"icon":"🌊","title":"...","description":"..."},{"icon":"✨","title":"...","description":"..."},{"icon":"🌿","title":"...","description":"..."}]}`,

        'stats': `${base}Generate statistics about "${topic}" for a luxury resort. Return ONLY valid JSON:
{"items":[{"icon":"award","value":"...","label":"..."},{"icon":"users","value":"...","label":"..."},{"icon":"calendar","value":"...","label":"..."},{"icon":"mappin","value":"...","label":"..."}]}`,

        'cta': `${base}Generate a call-to-action section about "${topic}". Return ONLY valid JSON:
{"heading":"...","subtitle":"...","backgroundColor":"brand","buttons":[{"text":"...","url":"/","variant":"primary"},{"text":"...","url":"tel:+902523371111","variant":"outline"}]}`,

        'gallery': `${base}Generate a gallery section about "${topic}" with 4-6 items. Use real hotel images from bluedreamsresort.com. Return ONLY valid JSON:
{"images":[{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"...","category":"..."},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"...","category":"..."},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","title":"...","category":"..."},{"src":"https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg","title":"...","category":"..."}]}`,

        'image-grid': `${base}Generate an image grid about "${topic}" with 3-4 items. Return ONLY valid JSON:
{"label":"...","heading":"...","items":[{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg","title":"...","description":"..."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg","title":"...","description":"..."},{"image":"https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg","title":"...","description":"..."}],"variant":"card","columns":3}`,

        'contact': `${base}Generate contact information for "${topic}". Return ONLY valid JSON:
{"infoLabel":"...","infoHeading":"...","infoHeadingAccent":"...","address":"Torba Mahallesi Herodot Bulvarı No:11\\nBodrum / MUĞLA / TÜRKİYE","phone":"+90 252 337 11 11","whatsapp":"+90 549 516 78 03","email":"sales@bluedreamsresort.com","subjects":[{"value":"reservation","label":"..."},{"value":"info","label":"..."},{"value":"other","label":"..."}]}`,

        'youtube': `${base}Generate a YouTube embed section about "${topic}". Return ONLY valid JSON:
{"videos":[{"url":"https://www.youtube.com/embed/JJc20SjIENQ","title":"..."}],"columns":1}`,

        'reviews': `${base}Generate a reviews section about "${topic}" with 3 guest reviews. Return ONLY valid JSON:
{"label":"...","heading":"...","headingAccent":"...","description":"...","bookingScore":"9.4","bookingLabel":"...","reviews":[{"author":"...","text":"...","rating":5},{"author":"...","text":"...","rating":5},{"author":"...","text":"...","rating":5}],"sourceLabel":"Google & Tripadvisor"}`,
    }

    return prompts[widgetType] || `${base}Generate content for a "${widgetType}" widget about "${topic}". Return ONLY a valid JSON object with appropriate fields for this widget type. Do not include any markdown, explanations or code fences.`
}

export async function POST(request: Request) {
    const startTime = Date.now()
    try {
        const { widgetType, topic, locale, context, sourceUrl } = await request.json()

        if (!widgetType || !topic || !locale) {
            return NextResponse.json({ error: 'Missing required fields: widgetType, topic, locale' }, { status: 400 })
        }

        let finalContext = context || ''
        if (sourceUrl) {
            try {
                // Internal fetch to our scraper endpoint
                const protocol = request.headers.get('x-forwarded-proto') || 'http'
                const host = request.headers.get('host') || 'localhost:3000'
                const baseUrl = `${protocol}://${host}`

                console.log(`[CMS Generate] Fetching source URL content: ${sourceUrl}`)
                const scrapeRes = await fetch(`${baseUrl}/api/admin/cms-scrape`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: sourceUrl })
                })

                if (scrapeRes.ok) {
                    const scrapeData = await scrapeRes.json()
                    if (scrapeData.text) {
                        finalContext += `\n\nReference Material from ${sourceUrl}:\n${scrapeData.text}`
                    }
                } else {
                    console.warn(`[CMS Generate] Scraper returned non-ok status: ${scrapeRes.status}`)
                }
            } catch (e) {
                console.error('[CMS Generate] Scrape error:', e)
            }
        }

        const prompt = getWidgetPrompt(widgetType, topic, locale, finalContext)
        const { key: apiKey, source } = await getGeminiApiKey(locale)
        console.log(`[CMS Generate] Widget: ${widgetType}, Locale: ${locale}, Key source: ${source}`)

        if (!apiKey) {
            return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 })
        }

        let text = ''
        let currentKey = apiKey

        // Try up to 2 times (primary key + 1 alternative)
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const ai = new GoogleGenAI({ apiKey: currentKey })
                const response = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt,
                    config: { temperature: 0.8, maxOutputTokens: 2000 }
                })
                text = typeof response.text === 'string' ? response.text : ''
                break
            } catch (err: any) {
                if (err?.status === 429 || err?.message?.includes('429')) {
                    console.warn(`[CMS Generate] 429 on attempt ${attempt + 1}, rotating key...`)
                    const alt = await getAlternativeKey(currentKey, locale)
                    if (alt) {
                        currentKey = alt.key
                        continue
                    }
                }
                throw err
            }
        }

        if (!text) {
            return NextResponse.json({ error: 'AI returned empty response' }, { status: 502 })
        }

        // Parse JSON from response (strip any markdown fences)
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({ error: 'Could not parse AI response as JSON', raw: text }, { status: 500 })
        }

        const data = JSON.parse(jsonMatch[0])
        const duration = Date.now() - startTime

        console.log(`[CMS Generate] Success in ${duration}ms for ${widgetType}/${locale}`)

        return NextResponse.json({ data, widgetType, locale, duration })
    } catch (error: any) {
        const duration = Date.now() - startTime
        console.error(`[CMS Generate] Error after ${duration}ms:`, error)
        return NextResponse.json({ error: error.message || 'Content generation failed', duration }, { status: 500 })
    }
}
