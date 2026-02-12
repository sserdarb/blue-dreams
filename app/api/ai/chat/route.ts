import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai"
import { prisma } from '@/lib/prisma'
import { fetchSheetData, extractSheetId } from '@/lib/services/google-sheets'
// import { GEMINI_API_KEY } from '@/lib/ai-config'

// Tool Definitions
const priceCheckTool: FunctionDeclaration = {
    name: "check_room_availability",
    description: "Checks room prices and availability for specific dates.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            checkInDate: { type: Type.STRING, description: "Check-in date in YYYY-MM-DD format" },
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
                enum: ["rooms", "location", "contact", "reviews", "amenities", "dining", "room_detail", "transfer_form", "meeting"],
                description: "The type of UI widget to render."
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

async function getContextData(locale: string) {
    try {
        const [rooms, dining, meeting, amenities, settings] = await Promise.all([
            prisma.room.findMany({ where: { locale }, orderBy: { order: 'asc' } }).catch(() => []),
            prisma.dining.findMany({ where: { locale }, orderBy: { order: 'asc' } }).catch(() => []),
            prisma.meetingRoom.findMany({ where: { locale }, orderBy: { order: 'asc' } }).catch(() => []),
            prisma.amenity.findMany({ where: { locale }, orderBy: { order: 'asc' } }).catch(() => []),
            prisma.aiSettings.findFirst({ where: { language: locale } }).catch(() => null)
        ])

        // Fetch Google Sheets data if configured
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

// Safely extract text from Gemini response
function extractResponseText(response: any): string {
    try {
        // New SDK: response.text is a string property
        if (typeof response.text === 'string') return response.text
        // Old SDK: response.text() is a method
        if (typeof response.text === 'function') return response.text()
        // Fallback: dig into candidates
        if (response.candidates?.[0]?.content?.parts?.[0]?.text) {
            return response.candidates[0].content.parts[0].text
        }
        return ""
    } catch (e) {
        console.error('[AI Chat] Text extraction error:', e)
        // If text extraction throws (e.g. function call only response), return empty
        return ""
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { messages, locale = 'tr' } = body

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json({ error: 'Mesaj gerekli' }, { status: 400 })
        }

        // 1. Fetch Dynamic Content from DB
        const context = await getContextData(locale)

        // Use standardized key, fallback to settings if needed
        const apiKey = process.env.GEMINI_API_KEY || context.settings?.apiKey

        if (!apiKey) {
            console.error('[AI Chat] No API key configured')
            return NextResponse.json({
                text: "Üzgünüm, AI servisi şu anda yapılandırılmamış. Lütfen daha sonra tekrar deneyin.",
                uiPayload: null,
                data: null
            })
        }

        // 2. Construct System Prompt
        let systemPrompt = context.settings?.systemPrompt || `Sen Blue Dreams Resort'un dijital konsiyerjisin.
    
    KİMLİK VE TON:
    - Sofistike, çok bilgili, misafirperver ve çözüm odaklısın.
    - "Satış yap" modundan önce "Bilgi Ver ve Etkile" modundasın.
    
    KURALLAR:
    - Cevapların detaylı ve betimleyici olsun.
    - Kullanıcı bir oda, restoran veya hizmet hakkında bilgi isterse, ilgili UI Widget'ını render et ('render_ui' fonksiyonunu kullan).
    
    GÜNCEL OTEL BİLGİLERİ (VERİTABANI):
    
    ODALAR:
    ${context.rooms.map((r: any) => `- ${r.title}: ${r.description} (${r.size}, ${r.view})`).join('\n')}
    
    RESTORANLAR:
    ${context.dining.map((d: any) => `- ${d.title} (${d.type}): ${d.description}`).join('\n')}
    
    TOPLANTI SALONLARI:
    ${context.meeting.map((m: any) => `- ${m.title}: ${m.capacity}, ${m.area}`).join('\n')}
    
    HİZMETLER:
    ${context.amenities.map((a: any) => `- ${a.title}`).join('\n')}
    
    Genel Bilgiler:
    - Konum: Torba, Bodrum (Havalimanı 25km, Merkez 10km).
    - İletişim: +90 252 337 11 11
    `

        // Append Google Sheets knowledge if available
        if (context.sheetContext) {
            systemPrompt += `\n\nEK BİLGİ KAYNAĞI (Google Sheets):\n${context.sheetContext}\n`
        }

        const ai = new GoogleGenAI({ apiKey })

        // Transform messages: ensure valid roles and text
        const chatHistory = messages
            .filter((m: any) => m.text && m.text.trim())
            .map((m: any) => ({
                role: m.role === 'model' ? 'model' : 'user',
                parts: [{ text: String(m.text) }]
            }))

        if (chatHistory.length === 0) {
            return NextResponse.json({
                text: "Merhaba! Blue Dreams Resort'a hoş geldiniz. Size nasıl yardımcı olabilirim?",
                uiPayload: null,
                data: null
            })
        }

        // 3. Generate Content
        console.log('[AI Chat] Calling Gemini with', chatHistory.length, 'messages')
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: chatHistory,
            config: {
                systemInstruction: systemPrompt,
                tools: [{ functionDeclarations: [priceCheckTool, renderUiTool] }],
            }
        })

        // 4. Handle Response & Tools
        const calls = response.functionCalls
        let finalResponse = {
            text: extractResponseText(response),
            uiPayload: null as any,
            data: null as any
        }

        if (calls && calls.length > 0) {
            const call = calls[0]
            const args = (call.args || {}) as Record<string, any>

            if (call.name === 'check_room_availability') {
                finalResponse.text = args.message || "Müsaitlik durumunu kontrol ettim. İşte fiyatlar:"
                finalResponse.uiPayload = { type: 'price_result' }
                finalResponse.data = {
                    checkIn: args.checkInDate,
                    rooms: context.rooms.map((r: any) => ({
                        name: r.title,
                        price: parseInt(r.priceStart?.replace(/\D/g, '') || "250"),
                        specialOffer: false
                    }))
                }
            }
            else if (call.name === 'render_ui') {
                const { componentType, detailId, message } = args
                finalResponse.text = message || "İşte detaylar:"

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
                    payloadData = context.rooms.find((r: any) => r.title.toLowerCase().includes(detailId.toLowerCase()))
                        || (context.rooms.length > 0 ? context.rooms[0] : null)
                }

                finalResponse.uiPayload = { type: componentType }
                finalResponse.data = payloadData
            }
        }

        // Ensure we always have some text
        if (!finalResponse.text && !finalResponse.uiPayload) {
            finalResponse.text = "Üzgünüm, isteğinizi anlayamadım. Lütfen tekrar deneyin."
        }

        console.log('[AI Chat] Response ready, text length:', finalResponse.text?.length, 'hasUI:', !!finalResponse.uiPayload)
        return NextResponse.json(finalResponse)

    } catch (error: any) {
        console.error('[AI Chat] Error:', error?.message || error)
        console.error('[AI Chat] Stack:', error?.stack)

        // Return user-friendly error with details for debugging
        const errorMessage = error?.message || 'Bilinmeyen hata'
        let userMessage = "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin."

        if (errorMessage.includes('API_KEY') || errorMessage.includes('401') || errorMessage.includes('403')) {
            userMessage = "AI servisi yapılandırma hatası. Yönetici ile iletişime geçin."
        } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            userMessage = "AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin."
        } else if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
            userMessage = "Güvenlik filtresi nedeniyle yanıt üretilemedi. Lütfen sorunuzu farklı şekilde sorun."
        }

        return NextResponse.json({
            text: userMessage,
            uiPayload: null,
            data: null,
            _debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        })
    }
}
