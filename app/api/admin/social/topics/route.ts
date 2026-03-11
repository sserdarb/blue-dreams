import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenAI } from '@google/genai'

export async function GET(req: NextRequest) {
    try {
        const topics = await prisma.socialTopicSuggestion.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(topics)
    } catch (error) {
        console.error('Error fetching social topics:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

        const prompt = `
      Sen lüks bir 5 yıldızlı otel (Blue Dreams Resort - Muğla/Bodrum) için yetkin bir Sosyal Medya Yöneticisisin. 
      Lütfen Instagram ve Facebook'ta paylaşılmak üzere otelin hedef kitlesini (tatilciler, aileler, lüks arayan çiftler vb.) etkileyecek ve markaya değer katacak 3 adet benzersiz, yaratıcı ve ilgi çekici gönderi FİKRİ (topic) üret. 
      Sadece konuyu, amacını/açıklamasını vereceksin (Gönderi metni/caption şu an yazılmayacak).

      Format olarak sadece aşağıdaki gibi saf bir JSON dizisi (Array) döndür, hiçbir markdown, backtick veya fazladan cümle kullanma:
      [
        {
          "topic": "Harika Gün Batımı ve Kokteyl",
          "description": "Infinity barda gün batımına karşı hazırlanan imza kokteyllerimizden birinin estetik videosu."
        },
        ...
      ]
    `

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7
            }
        })

        const rawText = response.text || "[]"
        // Clean up potential markdown formatting if model still adds it
        const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim()

        let suggestions: any[] = []
        try {
            suggestions = JSON.parse(cleanText)
        } catch (parseError) {
            console.error("AI JSON parse error:", parseError, "Raw output:", cleanText)
            return NextResponse.json({ error: 'AI output parse error' }, { status: 500 })
        }

        if (!Array.isArray(suggestions)) {
            return NextResponse.json({ error: 'AI output is not an array' }, { status: 500 })
        }

        // Save to database
        const savedTopics = await Promise.all(
            suggestions.map(async (s) => {
                return await prisma.socialTopicSuggestion.create({
                    data: {
                        topic: s.topic,
                        description: s.description,
                        source: 'ai',
                        status: 'pending'
                    }
                })
            })
        )

        return NextResponse.json(savedTopics)

    } catch (error) {
        console.error('Error generating social topics:', error)
        return NextResponse.json({ error: 'Failed to generate topics' }, { status: 500 })
    }
}
