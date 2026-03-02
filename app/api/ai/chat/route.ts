import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai"
import OpenAI from "openai"
import { prisma } from '@/lib/prisma'
import { fetchSheetData, extractSheetId } from '@/lib/services/google-sheets'
import { getGeminiApiKey, GEMINI_MODEL, GEMINI_15_MODEL, GROK_API_KEY, GROK_MODEL, ZHIPU_API_KEY, ZHIPU_MODEL } from '@/lib/ai-config'
import { ElektraService } from '@/lib/services/elektra'
import { FACTSHEET_TR } from '@/lib/factsheet'
import { fetchBodrumAttractions, fetchBodrumEvents } from '@/lib/services/serpapi'
import fs from 'fs'
import path from 'path'

// Tool Definitions (Gemini format)
const priceCheckTool: FunctionDeclaration = {
    name: "check_room_availability",
    description: "Checks real-time room prices and availability from the hotel's PMS for specific dates. Always use this when a user asks about prices, rates, or availability.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            checkInDate: { type: Type.STRING, description: "Check-in date in YYYY-MM-DD format" },
            checkOutDate: { type: Type.STRING, description: "Check-out date in YYYY-MM-DD format. If not specified, default to 3 days after check-in." },
            adults: { type: Type.NUMBER, description: "Number of adults" }
        },
        required: ["checkInDate", "adults"]
    }
}

const renderUiTool: FunctionDeclaration = {
    name: "render_ui",
    description: "Renders a specific visual UI component.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            componentType: {
                type: Type.STRING,
                enum: ["rooms", "location", "contact", "reviews", "amenities", "dining", "spa", "room_detail", "transfer_form", "meeting", "meeting_form", "booking_form"],
                description: "The type of UI widget to render. ALWAYS use this tool to show visual content or forms."
            },
            detailId: {
                type: Type.STRING,
                description: "Optional: The name or ID of the item to show details for (e.g., specific room title)."
            },
            message: {
                type: Type.STRING,
                description: "A specific, helpful response text to display to the user above the widget."
            }
        },
        required: ["componentType", "message"]
    }
}

// OpenAI-format tools (for Grok/Zhipu fallback)
const openaiTools = [
    {
        type: "function" as const,
        function: {
            name: "check_room_availability",
            description: "Checks real-time room prices and availability from the hotel's PMS for specific dates.",
            parameters: {
                type: "object",
                properties: {
                    checkInDate: { type: "string", description: "Check-in date in YYYY-MM-DD format" },
                    checkOutDate: { type: "string", description: "Check-out date in YYYY-MM-DD format" },
                    adults: { type: "number", description: "Number of adults" }
                },
                required: ["checkInDate", "adults"]
            }
        }
    },
    {
        type: "function" as const,
        function: {
            name: "render_ui",
            description: "Renders a specific visual UI component.",
            parameters: {
                type: "object",
                properties: {
                    componentType: { type: "string", enum: ["rooms", "location", "contact", "reviews", "amenities", "dining", "spa", "room_detail", "transfer_form", "meeting", "meeting_form", "booking_form"], description: "The type of UI widget to render." },
                    detailId: { type: "string", description: "Optional item ID" },
                    message: { type: "string", description: "Response text to display above the widget." }
                },
                required: ["componentType", "message"]
            }
        }
    }
]

async function getContextData(locale: string) {
    try {
        const [rooms, dining, meeting, amenities, settings] = await Promise.all([
            prisma.room.findMany({ where: { locale }, orderBy: { order: 'asc' } }).catch(() => []),
            prisma.dining.findMany({ where: { locale }, orderBy: { order: 'asc' } }).catch(() => []),
            prisma.meetingRoom.findMany({ where: { locale }, orderBy: { order: 'asc' } }).catch(() => []),
            prisma.amenity.findMany({ where: { locale }, orderBy: { order: 'asc' } }).catch(() => []),
            prisma.aiSettings.findFirst({ where: { language: locale } }).catch(() => null)
        ])

        let sheetContext = ''
        const sheetId = (settings as any)?.googleSheetId
        if (sheetId) {
            const extracted = extractSheetId(sheetId)
            if (extracted) {
                const sheetData = await fetchSheetData(extracted)
                if (sheetData.text) {
                    sheetContext = sheetData.text
                    console.log(`[AI Chat] Google Sheets data loaded: ${sheetData.rowCount} rows from ${sheetData.sheetNames.length} sheets`)
                }
            }
        }

        return { rooms, dining, meeting, amenities, settings, sheetContext }
    } catch (error) {
        console.error('[AI Chat] DB context fetch error:', error)
        return { rooms: [], dining: [], meeting: [], amenities: [], settings: null, sheetContext: '' }
    }
}

function getApprovedLocalGuideIds() {
    const file = path.join(process.cwd(), 'data', 'approved-local-guide.json')
    if (fs.existsSync(file)) {
        try { return JSON.parse(fs.readFileSync(file, 'utf-8')) } catch { }
    }
    return { attractions: [], events: [] }
}

async function getLocalGuideContext() {
    const approved = getApprovedLocalGuideIds()
    if (approved.attractions.length === 0 && approved.events.length === 0) return ''

    try {
        const [allAttr, allEvt] = await Promise.all([
            fetchBodrumAttractions(),
            fetchBodrumEvents()
        ])

        const myAttr = allAttr.filter(a => approved.attractions.includes(a.id))
        const myEvt = allEvt.filter(e => approved.events.includes(e.id))

        let text = ''
        if (myAttr.length > 0) {
            text += '\nÖNERİLEN BODRUM ÇEVRESİ GEZİLECEK YERLER (SerpAPI Onaylı):\n'
            myAttr.forEach(a => {
                text += `- ${a.title} (${a.type || 'Turistik Yer'}): ${a.description}. Adres: ${a.address}\n`
                if (a.link) text += `  Yol tarifi/Link: ${a.link}\n`
            })
        }
        if (myEvt.length > 0) {
            text += '\nÖNERİLEN BODRUM ETKİNLİKLERİ:\n'
            myEvt.forEach(e => {
                text += `- ${e.title} (${e.date || ''} ${e.time || ''}): ${e.venue || ''}. Adres: ${e.address || ''}. ${e.description || ''}\n`
                if (e.link) text += `  Detay/Link: ${e.link}\n`
            })
        }
        return text
    } catch (e) {
        return ''
    }
}

// Safely extract text from Gemini response
function extractGeminiText(response: any): string {
    try {
        if (typeof response.text === 'string') return response.text
        if (typeof response.text === 'function') return response.text()
        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            return response.candidates[0].content.parts[0].text
        }
        return ""
    } catch (e) {
        return ""
    }
}

function buildSystemPrompt(context: any, localGuideContext: string) {
    let systemPrompt = context.settings?.systemPrompt || `Sen Blue Dreams Resort'un dijital misafir asistanı "Blue Concierge"sin.

    KURUMSAL KİMLİK & GÖREV:
    - SADECE otel misafirlerine (potansiyel veya konaklayan) hizmet verirsin.
    - Görevin: Otel bilgisi vermek, oda fiyatı/müsaitliği sunmak ve misafiri SATIŞA / REZERVASYONA yönlendirmektir.
    - Asla hayali fiyat uydurma.

    KATI ETKİLEŞİM KURALLARI (BUNLARA KESİNLİKLE UY):
    1. ARACI ZORUNLU KULLAN: Kullanıcı senden odalar, fiyatlar, restoranlar, spa, toplantı gibi konularda bilgi istediğinde SADECE DÜZ METİN YAZMA. Mutlaka \`render_ui\` aracını veya \`check_room_availability\` aracını ÇAĞIR.
    2. GÖRSEL KULLANIMI YASAKTIR: Sohbette markdown ile dışarıdan rastgele veya uydurma görsel (<img> veya ![]) EKLEME. Görsel göstermek istersen SADECE \`render_ui\` aracını kullan (Örn: componentType="rooms"). Asla sahte/alakasız fotoğraf URL'si uydurma. Verdiğin tüm içerikler resmi factsheet ile BİREBİR uyumlu olmalıdır.
    3. FİYAT SORGULAMASI: Müsaitlik, fiyat veya rezervasyon sorulduğunda ASLA geçiştiren düz metin cevapları verme. HER ZAMAN zımni veya açık bir tarih aralığı bularak \`check_room_availability\` aracını çağır. 
    4. TOPLANTI / ZİYAFET (MICE): Kullanıcı otelde toplantı, düğün, kongre veya etkinlik düzenlemek isterse \`render_ui\` aracını kullanarak \`componentType="meeting_form"\` ÇAĞIR. Böylece taleplerini resmi olarak alabiliriz.
    5. SATIŞ ODAKLILIK: Müsait olan araçları kullanarak misafiri doğrudan aksiyona (rezervasyon, form doldurma) yönlendir.

    OTEL BİLGİLERİ (GÜNCEL):
    
    ODALAR:
    ${context.rooms.map((r: any) => `- ${r.title}: ${r.description} (${r.size}, ${r.view})`).join('\n')}
    
    YEME & İÇME:
    ${context.dining.map((d: any) => `- ${d.title} (${d.type}): ${d.description}`).join('\n')}
    
    TOPLANTI & ETKİNLİK:
    ${context.meeting.map((m: any) => `- ${m.title}: ${m.capacity}, ${m.area}`).join('\n')}
    
    HİZMETLER & SPA:
    ${context.amenities.map((a: any) => `- ${a.title}`).join('\n')}
    
    KONUM:
    - Torba, Bodrum. Havalimanı 25km, Bodrum Merkez 10km. Özel plaj, iskele.
    `

    if (context.sheetContext) {
        systemPrompt += `\n\nEKSPERT BİLGİSİ (Google Sheets SSS):\n${context.sheetContext}\n`
    }
    if (localGuideContext) {
        systemPrompt += `\n\n${localGuideContext}\n(Bodrum gezilecek yerler ve etkinlikler sorulduğunda yukarıdaki SerpAPI ile admin onaylı olan bu listeyi kullan, güzelce anlat ve mutlaka yol tarifi için sunduğun lokasyonun linkini tavsiye et.)\n`
    }
    systemPrompt += `\n\nRESMİ FACTSHEET BİLGİLERİ:\n${FACTSHEET_TR}\n`
    return systemPrompt
}

// ─── Primary: Gemini ────────────────────────────────────────────────────
async function tryGemini(apiKey: string, systemPrompt: string, chatHistory: any[], model: string = GEMINI_MODEL) {
    const ai = new GoogleGenAI({ apiKey })
    const geminiHistory = chatHistory.map((m: any) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.text || m.content) }]
    }))

    const response = await ai.models.generateContent({
        model,
        contents: geminiHistory,
        config: {
            systemInstruction: systemPrompt,
            tools: [{ functionDeclarations: [priceCheckTool, renderUiTool] }],
        }
    })

    // Return normalized result
    const calls = response.functionCalls
    return {
        text: extractGeminiText(response),
        toolCalls: calls ? calls.map(c => ({ name: c.name, args: c.args || {} })) : null,
        provider: 'gemini'
    }
}

// ─── Fallback: OpenAI-compatible (Grok or Zhipu) ───────────────────────
async function tryOpenAICompat(apiKey: string, baseURL: string, model: string, providerName: string, systemPrompt: string, chatHistory: any[]) {
    const openai = new OpenAI({ apiKey, baseURL })
    const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...chatHistory.map((m: any) => ({
            role: (m.role === 'model' || m.role === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
            content: String(m.text || m.content)
        }))
    ]

    const response = await openai.chat.completions.create({
        model,
        messages,
        tools: openaiTools,
        tool_choice: "auto"
    })

    const msg = response.choices[0]?.message
    let toolCalls = null
    if (msg?.tool_calls && msg.tool_calls.length > 0) {
        toolCalls = msg.tool_calls.map((tc: any) => {
            let args: Record<string, any> = {}
            try { args = JSON.parse(tc.function?.arguments || "{}") } catch { }
            return { name: tc.function?.name, args }
        })
    }

    return {
        text: msg?.content || '',
        toolCalls,
        provider: providerName
    }
}

export async function POST(request: Request) {
    console.log('[AI Chat] POST handler called at', new Date().toISOString())
    try {
        const body = await request.json()
        console.log('[AI Chat] Request body received, locale:', body?.locale, 'messages:', body?.messages?.length)
        const { messages, locale = 'tr' } = body

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 })
        }

        // 1. Fetch Dynamic Content from DB
        const [context, localGuideContext] = await Promise.all([
            getContextData(locale),
            getLocalGuideContext()
        ])

        const systemPrompt = buildSystemPrompt(context, localGuideContext)

        const chatHistory = messages
            .filter((m: any) => m.text && m.text.trim())

        if (chatHistory.length === 0) {
            return NextResponse.json({
                text: "Merhaba! Blue Dreams Resort'a hoş geldiniz. Size tatil planınızda nasıl yardımcı olabilirim?",
                uiPayload: null,
                data: null
            })
        }

        // 2. Multi-provider AI call with fallback chain: Gemini → Grok → Zhipu
        let aiResult: { text: string; toolCalls: any[] | null; provider: string } | null = null
        const providers: { name: string; fn: () => Promise<any> }[] = []

        // Primary: Gemini 2.5 Flash
        const { key: geminiKey } = await getGeminiApiKey(locale)
        if (geminiKey) {
            providers.push({
                name: 'Gemini-2.5-Flash',
                fn: () => tryGemini(geminiKey, systemPrompt, chatHistory, GEMINI_MODEL)
            })
            // Fallback: Gemini 1.5 Pro (different quota pool)
            providers.push({
                name: 'Gemini-1.5-Pro',
                fn: () => tryGemini(geminiKey, systemPrompt, chatHistory, GEMINI_15_MODEL)
            })
        }

        // Fallback 1: Grok
        if (GROK_API_KEY) {
            providers.push({
                name: 'Grok',
                fn: () => tryOpenAICompat(GROK_API_KEY, 'https://api.x.ai/v1', GROK_MODEL, 'grok', systemPrompt, chatHistory)
            })
        }

        // Fallback 2: Zhipu GLM
        if (ZHIPU_API_KEY) {
            providers.push({
                name: 'Zhipu',
                fn: () => tryOpenAICompat(ZHIPU_API_KEY, 'https://open.bigmodel.cn/api/paas/v4/', ZHIPU_MODEL, 'zhipu', systemPrompt, chatHistory)
            })
        }

        for (const provider of providers) {
            try {
                console.log(`[AI Chat] Trying provider: ${provider.name}`)
                aiResult = await provider.fn()
                console.log(`[AI Chat] Success with ${provider.name}`)
                break
            } catch (err: any) {
                console.error(`[AI Chat] ${provider.name} failed:`, err.message)
                // Continue to next provider
            }
        }

        if (!aiResult) {
            return NextResponse.json({
                text: "AI servisi şu anda yoğun veya kullanım limitine ulaştı. Lütfen rezervasyon sayfamızı ziyaret edin veya daha sonra tekrar deneyin.",
                uiPayload: { type: 'booking_form' },
                data: null
            })
        }

        // 3. Handle Response & Tools
        let finalResponse = {
            text: aiResult.text,
            uiPayload: null as any,
            data: null as any
        }

        if (aiResult.toolCalls && aiResult.toolCalls.length > 0) {
            const call = aiResult.toolCalls[0]
            const args = call.args || {}

            if (call.name === 'check_room_availability') {
                const checkIn = args.checkInDate || new Date().toISOString().split('T')[0]
                let checkOut = args.checkOutDate
                if (!checkOut) {
                    const co = new Date(checkIn)
                    co.setDate(co.getDate() + 3)
                    checkOut = co.toISOString().split('T')[0]
                }

                try {
                    const availability = await ElektraService.getAvailability(new Date(checkIn), new Date(checkOut), 'EUR')

                    const byRoom = new Map<string, { prices: number[]; basePrices: number[]; available: number; stopsell: boolean }>()
                    for (const item of availability) {
                        if (!byRoom.has(item.roomType)) {
                            byRoom.set(item.roomType, { prices: [], basePrices: [], available: 0, stopsell: false })
                        }
                        const r = byRoom.get(item.roomType)!
                        if (item.discountedPrice || item.basePrice) {
                            r.prices.push(item.discountedPrice || item.basePrice || 0)
                            r.basePrices.push(item.basePrice || 0)
                        }
                        r.available += item.availableCount
                        if (item.stopsell) r.stopsell = true
                    }

                    const rooms = Array.from(byRoom.entries()).map(([name, data]) => ({
                        name,
                        minPrice: data.prices.length > 0 ? Math.round(Math.min(...data.prices)) : 0,
                        avgPrice: data.prices.length > 0 ? Math.round(data.prices.reduce((s, p) => s + p, 0) / data.prices.length) : 0,
                        maxBasePrice: data.basePrices.length > 0 ? Math.round(Math.max(...data.basePrices)) : 0,
                        hasDiscount: data.prices.some((p, i) => p < data.basePrices[i]),
                        available: data.available > 0 && !data.stopsell,
                        currency: 'EUR'
                    }))

                    finalResponse.text = args.message || "İşte seçtiğiniz tarihler için güncel oda fiyatları:"
                    finalResponse.uiPayload = { type: 'price_result' }
                    finalResponse.data = {
                        checkIn,
                        checkOut,
                        rooms: rooms.length > 0 ? rooms : [{ name: 'Standart Oda', available: true, minPrice: 0, hasDiscount: false, currency: 'EUR' }],
                        source: 'elektra',
                        bookingUrl: `/tr/booking?arrival=${checkIn}&departure=${checkOut}`
                    }
                } catch (err) {
                    console.error('[AI Chat] Elektra pricing error:', err)
                    finalResponse.text = "Fiyat bilgisi şu anda alınamıyor. Lütfen rezervasyon sayfamızı ziyaret edin."
                    finalResponse.uiPayload = { type: 'booking_form' }
                    finalResponse.data = null
                }
            }
            else if (call.name === 'render_ui') {
                const { componentType, detailId, message: tMsg } = args
                finalResponse.text = tMsg || "İşte detaylar:"

                let payloadData = null

                if (componentType === 'rooms') {
                    payloadData = context.rooms
                } else if (componentType === 'dining') {
                    payloadData = context.dining
                } else if (componentType === 'amenities') {
                    payloadData = context.amenities
                } else if (componentType === 'meeting') {
                    payloadData = context.meeting
                } else if (componentType === 'room_detail' && detailId) {
                    const rooms = context.rooms || []
                    payloadData = rooms.find((r: any) => r?.title?.toLowerCase()?.includes(detailId.toLowerCase()))
                        || (rooms.length > 0 ? rooms[0] : null)
                }

                finalResponse.uiPayload = {
                    type: componentType,
                    ...(componentType === 'room_detail' && detailId ? { detailId } : {}),
                    ...(args.message ? { message: args.message } : {})
                }
                finalResponse.data = payloadData
            }
        }

        // Ensure we always have some text
        if (!finalResponse.text && !finalResponse.uiPayload) {
            finalResponse.text = "Üzgünüm, isteğinizi anlayamadım. Lütfen tekrar deneyin."
        }

        console.log('[AI Chat] Response ready, text length:', finalResponse.text?.length, 'hasUI:', !!finalResponse.uiPayload, 'provider:', aiResult.provider)
        return NextResponse.json(finalResponse)

    } catch (error: any) {
        console.error('[AI Chat] Outer error:', error?.message || error)
        console.error('[AI Chat] Stack:', error?.stack)

        // Always return a friendly message, never expose raw errors
        return NextResponse.json({
            text: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
            uiPayload: null,
            data: null,
            _debug: String(error?.message || error).slice(0, 200)
        })
    }
}
