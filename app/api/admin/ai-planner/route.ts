import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import OpenAI from 'openai'
import { getGeminiApiKey, GEMINI_MODEL, GROK_API_KEY, GROK_MODEL, ZHIPU_API_KEY, ZHIPU_MODEL } from '@/lib/ai-config'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { topic, tone, language, dateInfo, keywords, imageContext } = body

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

        if (imageContext) {
            promptText += `\n\nAyrıca gönderiyi şu görseli düşünerek yaz: ${imageContext}`
        }

        // Multi-provider fallback: Gemini → Grok → Zhipu
        const providers: { name: string; fn: () => Promise<string> }[] = []

        const { key: geminiKey } = await getGeminiApiKey('tr')
        if (geminiKey) {
            providers.push({
                name: 'Gemini',
                fn: async () => {
                    const ai = new GoogleGenAI({ apiKey: geminiKey })
                    const response = await ai.models.generateContent({
                        model: GEMINI_MODEL,
                        contents: promptText,
                        config: { systemInstruction: systemPrompt, temperature: 0.7 }
                    })
                    return typeof response.text === 'string' ? response.text : ''
                }
            })
        }

        if (GROK_API_KEY) {
            providers.push({
                name: 'Grok',
                fn: async () => {
                    const openai = new OpenAI({ apiKey: GROK_API_KEY, baseURL: 'https://api.x.ai/v1' })
                    const r = await openai.chat.completions.create({
                        model: GROK_MODEL,
                        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: promptText }],
                        temperature: 0.7,
                    })
                    return r.choices[0]?.message?.content || ''
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
                        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: promptText }],
                        temperature: 0.7,
                    })
                    return r.choices[0]?.message?.content || ''
                }
            })
        }

        let textOutput = ''
        for (const provider of providers) {
            try {
                console.log(`[AI Planner] Trying ${provider.name}`)
                textOutput = await provider.fn()
                console.log(`[AI Planner] Success with ${provider.name}`)
                break
            } catch (err: any) {
                console.error(`[AI Planner] ${provider.name} failed:`, err.message)
            }
        }

        if (!textOutput) {
            return NextResponse.json({ error: 'Tüm AI servisleri yanıt veremedi.' }, { status: 503 })
        }

        return NextResponse.json({ text: textOutput })

    } catch (error: any) {
        console.error('AI Content Planner Error:', error)
        return NextResponse.json({ error: error.message || 'AI Generation Failed' }, { status: 500 })
    }
}
