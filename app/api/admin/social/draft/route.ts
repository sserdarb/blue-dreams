import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { GoogleGenAI } from '@google/genai'

export async function POST(req: NextRequest) {
    try {
        const { topicId, topic, description, language } = await req.json()

        if (!topic || !description) {
            return NextResponse.json({ error: 'Missing topic or description' }, { status: 400 })
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
        }
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

        let languagePrompt = "Türkçe (Turkish)"
        if (language === 'en') languagePrompt = "İngilizce (English)"
        else if (language === 'de') languagePrompt = "Almanca (German)"
        else if (language === 'ru') languagePrompt = "Rusça (Russian)"

        const prompt = `
      Aşağıdaki onaylanmış konu (topic) ve açıklama (description) için Instagram ve Facebook sayfalarımızda paylaşılacak tek bir gönderi metni (caption) hazırla.
      Otelimiz Blue Dreams Resort, Muğla/Bodrum'da lüks bir 5 yıldızlı tatil köyüdür.
      
      Konu: ${topic}
      Açıklama: ${description}
      
      Yönergeler:
      - Sıcak, ikna edici ve lüks bir dil kullan.
      - Emojileri dozunda ve profesyonelce ekle.
      - Sonuna en fazla 5-6 tane uygun hashtag ekle (örnek: #BlueDreamsResort #Bodrum #LüksTatil).
      - Metin sadece gönderi metninden ibaret olsun (Fazladan "İşte metniniz" gibi giriş cümleleri olmasın).
      - İÇERİK DİLİ KESİNLİKLE ŞU OLMALIDIR: ${languagePrompt}
    `

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7
            }
        })

        const generatedContent = response.text?.trim() || ''

        if (!generatedContent) {
            return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
        }

        // Save as draft
        const post = await prisma.socialMediaPost.create({
            data: {
                topicId: topicId || null,
                content: generatedContent,
                status: 'draft'
            }
        })

        // If it was linked to a topic, mark the topic as having a draft
        if (topicId) {
            await prisma.socialTopicSuggestion.update({
                where: { id: topicId },
                data: { postDraftId: post.id }
            })
        }

        return NextResponse.json(post)

    } catch (error) {
        console.error('Error generating draft:', error)
        return NextResponse.json({ error: 'Failed to generate post draft' }, { status: 500 })
    }
}
