import { NextResponse } from 'next/server'
import { GEMINI_API_KEY } from '@/lib/ai-config'

const BRAND_CONTEXT = `
Blue Dreams Resort & Spa — Torba Bay, Bodrum, Turkey
- 5-star luxury all-inclusive resort  
- Torba Mahallesi, Herodot Bulvarı No:11, Bodrum/Muğla
- Features: Infinity pool, Naya Spa, 4 restaurants, 10+ bars, private beach
- Room types: Club Rooms (20-22m²), Deluxe Rooms (25-28m²), Club Family Rooms (35m²)
- Meeting & Events: 6 conference halls, MICE capabilities
- Social: @clubbluedreamsresort (Instagram), Blue Dreams Resort (Facebook/LinkedIn)
- Brand voice: Luxury, warm hospitality, Aegean lifestyle, serenity
- Booking: blue-dreams.rezervasyonal.com
`.trim()

const PLATFORM_GUIDES: Record<string, string> = {
    instagram: 'Instagram post: 2200 char max caption, use emojis, strong hook first line, 20-30 hashtags at end, use line breaks for readability.',
    facebook: 'Facebook post: conversational, longer form OK, can include links, 1-5 hashtags max, engage with questions.',
    twitter: 'Twitter/X post: 280 char max, punchy and concise, 2-3 hashtags max, use thread format if needed.',
    linkedin: 'LinkedIn post: professional tone, industry insights, storytelling, 3-5 hashtags, add call-to-action.'
}

const LANG_INSTRUCTIONS: Record<string, string> = {
    tr: 'Türkçe olarak yaz.',
    en: 'Write in English.',
    de: 'Schreibe auf Deutsch.',
    ru: 'Напиши на русском.'
}

export async function POST(request: Request) {
    try {
        const { topic, platform, tone, languages, includeHashtags } = await request.json()

        if (!topic || !platform || !languages?.length) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY || GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
        }

        const toneMap: Record<string, string> = {
            professional: 'Professional and authoritative',
            casual: 'Casual, friendly and approachable',
            luxury: 'Luxurious, elegant and aspirational',
            promotional: 'Promotional with urgency and excitement'
        }

        const results: Record<string, { title: string; body: string; hashtags: string[] }> = {}

        for (const lang of languages) {
            const prompt = `You are a social media content expert for a luxury hotel resort.

${BRAND_CONTEXT}

${PLATFORM_GUIDES[platform] || ''}

Tone: ${toneMap[tone] || tone}
Topic: ${topic}
${LANG_INSTRUCTIONS[lang] || ''}

Generate a social media post with:
1. "title": A compelling one-line title/hook
2. "body": The full post content optimized for ${platform}
3. "hashtags": An array of relevant hashtags (${includeHashtags ? '15-25 hashtags' : '3-5 hashtags only'})

Return ONLY valid JSON: {"title":"...","body":"...","hashtags":["#tag1","#tag2"]}`

            const res = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.9, maxOutputTokens: 1500 }
                    })
                }
            )

            if (!res.ok) {
                console.error(`Gemini error for ${lang}:`, await res.text())
                results[lang] = { title: 'Error generating content', body: `API error for ${lang}`, hashtags: [] }
                continue
            }

            const data = await res.json()
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''

            try {
                const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
                const parsed = JSON.parse(cleaned)
                results[lang] = {
                    title: parsed.title || '',
                    body: parsed.body || '',
                    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : []
                }
            } catch {
                results[lang] = { title: 'Content Generated', body: text, hashtags: [] }
            }
        }

        return NextResponse.json({ results })
    } catch (error) {
        console.error('Social content generation error:', error)
        return NextResponse.json({ error: 'Content generation failed' }, { status: 500 })
    }
}
