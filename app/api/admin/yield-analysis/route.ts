// AI Yield Analysis — Multi-provider with Gemini primary + Grok/Zhipu fallback
import { NextResponse } from 'next/server'
import { GoogleGenAI } from "@google/genai"
import OpenAI from "openai"
import { getGeminiApiKey, GEMINI_MODEL, GROK_API_KEY, GROK_MODEL, ZHIPU_API_KEY, ZHIPU_MODEL } from '@/lib/ai-config'
import { ScraperService } from '@/lib/services/scraper'

export async function POST(request: Request) {
    try {
        const payload = await request.json()

        // Fetch External Market Data (Mock Scraper)
        const today = new Date().toISOString().split('T')[0]
        const marketData = await ScraperService.getExternalMarketData(today)

        const prompt = `Sen bir otel gelir yönetimi (revenue management) uzmanı ve stratejistisin. 
        Blue Dreams Resort & Spa (Bodrum, 370 oda, 5 Yıldızlı Ultra All-Inclusive) için aşağıdaki iç ve dış verileri analiz et.

        ## 1. OTEL İÇ VERİLERİ (${payload.year})
        
        ### Genel Performans
        - Toplam Gelir: ${payload.totals?.revenue?.toLocaleString()} ${payload.currency}
        - Toplam Room Night: ${payload.totals?.roomNights?.toLocaleString()}
        - ADR (Ortalama Günlük Ücret): ${payload.totals?.adr?.toLocaleString()} ${payload.currency}
        - Toplam Rezervasyon: ${payload.totals?.resCount}

        ### Kanal Dağılımı
        ${payload.channelBreakdown?.map((c: any) => `- ${c.name}: %${c.pct} pay, ${c.revenue.toLocaleString()} ${payload.currency} gelir, ADR: ${c.adr.toLocaleString()} ${payload.currency}`).join('\n') || 'Veri yok'}

        ### Sezonluk Trend (Aylık)
        ${payload.monthlyAdr?.map((m: any) => `- ${m.month} (${m.season}): ADR ${m.adr.toLocaleString()} ${payload.currency}, ${m.roomNights} room night`).join('\n') || 'Veri yok'}

        ## 2. DIŞ PAZAR VERİLERİ (GÜNCEL)

        ### Rakip Analizi (Bugün itibariyle)
        ${marketData.competitors.map(c => `- ${c.hotelName} (${c.platform}): ${c.price} ${c.currency} (${c.roomType}) - Puan: ${c.score}`).join('\n')}

        ### Uçuş Verileri (Bodrum BJV Varışlı)
        ${marketData.flights.slice(0, 5).map(f => `- ${f.origin} -> BJV (${f.airline}): ${f.price} ${f.currency}`).join('\n')}

        ### Pazar Talebi
        - Arama Hacmi: ${marketData.demand.searchVolume}
        - Yaklaşan Etkinlikler: ${marketData.demand.events.join(', ') || 'Özel bir etkinlik yok'}

        ## İSTENEN ANALİZ & STRATEJİ
        Lütfen aşağıdaki başlıklarda, rakip verilerini ve uçuş fiyatlarını da dikkate alarak stratejik bir analiz yap:

        1. **Akıllı Fiyatlandırma (Smart Pricing)**: 
           - Rakiplerin fiyatlarına (${marketData.competitors.map(c => c.price).join('-')} EUR) göre bizim ADR'miz (${payload.totals?.adr} EUR) nasıl konumlanmalı? 
           - Fiyatı artırma veya düşürme fırsatı var mı?

        2. **Doluluk & Talep Tahmini**:
           - Uçuş fiyatları ve pazar aramalarına göre önümüzdeki günler için doluluk beklentisi nedir?
           - Düşük talep varsa hangi promosyonları yapmalıyız?

        3. **Kanal Stratejisi**:
           - Hangi kanallar (Booking, Expedia vs) rakiplerde daha aktif? Biz hangisine ağırlık vermeliyiz?

        4. **Aksiyon Planı**:
           - Önümüzdeki hafta için 3 somut aksiyon önerisi (Örn: "X tarihlerinde fiyatı %10 artır", "Y pazarında Flash Sale yap").

        Yanıtını profesyonel, veri odaklı ve maddeler halinde ver.
        `

        // Multi-provider fallback: Gemini → Grok → Zhipu
        const providers: { name: string; fn: () => Promise<string> }[] = []

        const { key: geminiKey, source } = await getGeminiApiKey()
        console.log(`[Yield AI] Using API key from ${source}`)

        if (geminiKey) {
            providers.push({
                name: 'Gemini',
                fn: async () => {
                    const ai = new GoogleGenAI({ apiKey: geminiKey })
                    const response = await ai.models.generateContent({
                        model: GEMINI_MODEL,
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                        config: { temperature: 0.4 }
                    })
                    return typeof response.text === 'string' ? response.text : (response.text ?? '')
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
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.4,
                    })
                    return r.choices[0]?.message?.content ?? ''
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
                        temperature: 0.4,
                    })
                    return r.choices[0]?.message?.content ?? ''
                }
            })
        }

        let text = ''
        for (const provider of providers) {
            try {
                console.log(`[Yield AI] Trying ${provider.name}`)
                text = await provider.fn()
                console.log(`[Yield AI] Success with ${provider.name}`)
                break
            } catch (err: any) {
                console.error(`[Yield AI] ${provider.name} failed:`, err.message)
            }
        }

        if (!text) {
            text = 'AI analizi şu anda yapılamıyor. Tüm AI servisleri yanıt veremedi.'
        }

        return NextResponse.json({
            analysis: text,
            marketData
        })

    } catch (err: any) {
        console.error('[Yield AI] Analysis error:', err)
        return NextResponse.json({
            error: 'AI analysis failed',
            analysis: 'AI analizi şu anda yapılamıyor. Lütfen daha sonra tekrar deneyin.',
            details: err.message
        }, { status: 500 })
    }
}
