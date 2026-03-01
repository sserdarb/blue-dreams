import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''

export async function POST(request: Request) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: 'GEMINI_API_KEY is missing' }, { status: 500 })
    }

    try {
        const body = await request.json()
        const { topic, tone, language, dateInfo, keywords, imageContext } = body

        // Initialize Gemini via the official SDK
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

        let systemPrompt = `Sen lüks bir otel olan "Blue Dreams Resort & Spa" (Bodrum, Türkiye) için profesyonel bir sosyal medya yöneticisisin. 
Marka Tone of Voice: Lüks, Aile Dostu, Davetkar, Zarif, Doğayla İç İçe, Eğlenceli.

Aşağıdaki parametrelere uygun bir sosyal medya gönderi metni oluştur. Gönderi mutlaka bir başlık, ana metin ve uygun emojiler ile hashtag'ler içermelidir.
İçerik Dili: ${language === 'en' ? 'İngilizce' : language === 'ru' ? 'Rusça' : language === 'de' ? 'Almanca' : 'Türkçe'}
İçerik Tonu: ${tone || 'Kurumsal ve Lüks'}
Konu/Hedef: ${topic || 'Genel Otel Tanıtımı'}
Etkinlik/Tarih Bilgisi: ${dateInfo || 'Genel'}
Kullanılması İstenen Anahtar Kelimeler: ${keywords || 'Bodrum, Tatil, Lüks'}
`
        let promptText = 'Lütfen bu bilgilere göre yaratıcı bir Instagram/Facebook gönderisi hazırla. Çıktıyı doğrudan kullanılabilecek şekide ver.'

        // If vision context is provided (url or base64)
        if (imageContext) {
            // Because we don't have the File API proxy natively in the App Router easily without uploading, 
            // we will ask Gemini to generate text based on the visual description if provided,
            // or we just pass the text context about the image.
            promptText += `\n\nAyrıca gönderiyi şu görseli düşünerek yaz: ${imageContext}`
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: promptText,
            config: {
                systemInstruction: systemPrompt,
                temperature: 0.7,
            }
        })

        const textOutput = response.text

        return NextResponse.json({ text: textOutput })

    } catch (error: any) {
        console.error('AI Content Planner Error:', error)
        return NextResponse.json({ error: error.message || 'AI Generation Failed' }, { status: 500 })
    }
}
