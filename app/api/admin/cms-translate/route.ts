import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { getGeminiApiKey, GEMINI_MODEL, markKeyExhausted, getAlternativeKey } from '@/lib/ai-config'
import { prisma } from '@/lib/prisma'

const LANG_NAMES: Record<string, string> = {
    tr: 'Turkish', en: 'English', de: 'German', ru: 'Russian'
}

export async function POST(request: Request) {
    const startTime = Date.now()
    try {
        const { pageId, targetLocale } = await request.json()

        if (!pageId || !targetLocale) {
            return NextResponse.json({ error: 'Missing pageId or targetLocale' }, { status: 400 })
        }

        // 1. Fetch source page with widgets
        const sourcePage = await prisma.page.findUnique({
            where: { id: pageId },
            include: { widgets: { orderBy: { order: 'asc' } } }
        })

        if (!sourcePage) {
            return NextResponse.json({ error: 'Source page not found' }, { status: 404 })
        }

        if (sourcePage.locale === targetLocale) {
            return NextResponse.json({ error: 'Target locale is the same as source' }, { status: 400 })
        }

        const sourceLang = LANG_NAMES[sourcePage.locale] || sourcePage.locale
        const targetLang = LANG_NAMES[targetLocale] || targetLocale

        // 2. Build translation payload  
        const translationPayload: Record<string, any> = {
            pageTitle: sourcePage.title,
            pageMetaDescription: sourcePage.metaDescription || '',
        }

        // Collect all widget data
        const widgetDatas: { id: string; type: string; data: any }[] = []
        for (const widget of sourcePage.widgets) {
            try {
                const parsed = JSON.parse(widget.data)
                widgetDatas.push({ id: widget.id, type: widget.type, data: parsed })
                translationPayload[`widget_${widget.order}_${widget.type}`] = parsed
            } catch {
                widgetDatas.push({ id: widget.id, type: widget.type, data: widget.data })
            }
        }

        // 3. Send to Gemini for batch translation
        const prompt = `You are a professional translator for a luxury hotel website. Translate ALL text content from ${sourceLang} to ${targetLang}.

CRITICAL RULES:
- Translate ALL string values that contain human-readable text
- Keep URLs, image paths, email addresses, phone numbers, coordinates EXACTLY as-is
- Keep JSON structure keys EXACTLY as-is (do not translate keys)
- Keep technical values (hex colors, CSS classes, icon names) as-is
- Translate button labels, titles, descriptions, paragraphs, headings, subtitles
- Keep the same JSON structure
- Return ONLY valid JSON, no markdown fences or explanations

Source content (${sourceLang}):
${JSON.stringify(translationPayload, null, 2)}

Return the translated JSON object with the same structure.`

        const { key: apiKey } = await getGeminiApiKey(targetLocale)
        if (!apiKey) {
            return NextResponse.json({ error: 'AI API key not configured' }, { status: 500 })
        }

        let text = ''
        let currentKey = apiKey

        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                const ai = new GoogleGenAI({ apiKey: currentKey })
                const response = await ai.models.generateContent({
                    model: GEMINI_MODEL,
                    contents: prompt,
                    config: { temperature: 0.3, maxOutputTokens: 8000 }
                })
                text = typeof response.text === 'string' ? response.text : ''
                break
            } catch (err: any) {
                if (err?.status === 429 || err?.message?.includes('429')) {
                    const alt = await getAlternativeKey(currentKey, targetLocale)
                    if (alt) { currentKey = alt.key; continue }
                }
                throw err
            }
        }

        if (!text) {
            return NextResponse.json({ error: 'AI returned empty translation' }, { status: 502 })
        }

        // 4. Parse translated content
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (!jsonMatch) {
            return NextResponse.json({ error: 'Could not parse translated content', raw: text.substring(0, 500) }, { status: 500 })
        }

        const translated = JSON.parse(jsonMatch[0])

        // 5. Upsert the translated page
        const targetPage = await prisma.page.upsert({
            where: {
                slug_locale: { slug: sourcePage.slug, locale: targetLocale }
            },
            update: {
                title: translated.pageTitle || sourcePage.title,
                metaDescription: translated.pageMetaDescription || sourcePage.metaDescription,
            },
            create: {
                slug: sourcePage.slug,
                locale: targetLocale,
                title: translated.pageTitle || sourcePage.title,
                metaDescription: translated.pageMetaDescription || sourcePage.metaDescription,
                status: sourcePage.status,
                visibility: sourcePage.visibility,
                template: sourcePage.template,
                featuredImage: sourcePage.featuredImage,
            }
        })

        // 6. Delete existing widgets on target page and create translated ones
        await prisma.widget.deleteMany({ where: { pageId: targetPage.id } })

        for (let i = 0; i < sourcePage.widgets.length; i++) {
            const srcWidget = sourcePage.widgets[i]
            const translatedKey = `widget_${srcWidget.order}_${srcWidget.type}`
            const translatedData = translated[translatedKey]

            await prisma.widget.create({
                data: {
                    pageId: targetPage.id,
                    type: srcWidget.type,
                    name: srcWidget.name,
                    order: srcWidget.order,
                    data: JSON.stringify(translatedData || JSON.parse(srcWidget.data)),
                }
            })
        }

        const duration = Date.now() - startTime
        console.log(`[CMS Translate] ${sourcePage.locale}→${targetLocale} for "${sourcePage.slug}" in ${duration}ms (${sourcePage.widgets.length} widgets)`)

        return NextResponse.json({
            success: true,
            pageId: targetPage.id,
            slug: targetPage.slug,
            locale: targetLocale,
            title: targetPage.title,
            widgetCount: sourcePage.widgets.length,
            duration,
        })
    } catch (error: any) {
        const duration = Date.now() - startTime
        console.error(`[CMS Translate] Error after ${duration}ms:`, error)
        return NextResponse.json({ error: error.message || 'Translation failed', duration }, { status: 500 })
    }
}
