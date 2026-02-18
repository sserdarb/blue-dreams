import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai"
import { prisma } from '@/lib/prisma'
import { fetchSheetData, extractSheetId } from '@/lib/services/google-sheets'
import { GEMINI_API_KEY } from '@/lib/ai-config'
import { ElektraService } from '@/lib/services/elektra'

// Tool Definitions
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
                enum: ["rooms", "location", "contact", "reviews", "amenities", "dining", "spa", "room_detail", "transfer_form", "meeting", "booking_form"],
                description: "The type of UI widget to render. ALWAYS use this tool to show visual content."
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

        // 3-tier API key fallback: env var → DB settings → hardcoded
        const envKey = process.env.GEMINI_API_KEY
        const dbKey = context.settings?.apiKey
        const apiKey = GEMINI_API_KEY || envKey || dbKey

        if (envKey) {
            console.log('[AI Chat] Using API key from env var')
        } else if (dbKey) {
            console.log('[AI Chat] Using API key from DB aiSettings')
        } else if (GEMINI_API_KEY) {
            console.log('[AI Chat] Using hardcoded fallback API key from ai-config.ts')
        }

        if (!apiKey) {
            console.error('[AI Chat] No API key configured in any source')
            return NextResponse.json({
                text: "Üzgünüm, AI servisi şu anda yapılandırılmamış. Lütfen yöneticinize başvurun.",
                uiPayload: null,
                data: null
            })
        }

        // 2. Construct System Prompt
        let systemPrompt = context.settings?.systemPrompt || `Sen Blue Dreams Resort'un dijital misafir asistanı "Blue Concierge"sin.

    KURUMSAL KİMLİK & GÖREV:
    - SADECE otel misafirlerine hizmet verirsin (Potansiyel veya konaklayan).
    - Görevin: Otel hakkında bilgi vermek, oda fiyatı sunmak, rezervasyona yönlendirmek ve tesis içi hizmetleri (Spa, Restoran vb.) tanıtmaktır.
    - Asla otelin finansal verileri, doluluk raporları veya yönetimsel stratejileri hakkında bilgi verme. Bu tür sorular gelirse "Bu bilgiye erişimim yok, ancak size en iyi oda fiyatlarımızla yardımcı olabilirim" de.

    ETKİLEŞİM KURALLARI:
    1. **Widget Kullanımı Zorunludur**: Görsel bir yanıt verebileceğin her durumda 'render_ui' fonksiyonunu kullan.
       - Oda sorulursa -> 'rooms'
       - Fiyat sorulursa -> 'check_room_availability' (Fonksiyon çağır)
       - Konum/Ulaşım -> 'location'
       - Restoran -> 'dining'
    2. **Satış Odaklılık**: Oda fiyatı verirken her zaman "Web sitemize özel en iyi fiyat garantisi" vurgusu yap.
    3. **Ton**: Lüks, nazik, yardımsever ve çözüm odaklı.

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

        // Append Google Sheets knowledge if available
        if (context.sheetContext) {
            systemPrompt += `\n\nEKSPERT BİLGİSİ (Factsheet & SSS):\n${context.sheetContext}\n`
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
                text: "Merhaba! Blue Dreams Resort'a hoş geldiniz. Size tatil planınızda nasıl yardımcı olabilirim?",
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
                // Fetch REAL prices from Elektra PMS
                const checkIn = args.checkInDate || new Date().toISOString().split('T')[0]
                let checkOut = args.checkOutDate
                if (!checkOut) {
                    const co = new Date(checkIn)
                    co.setDate(co.getDate() + 3)
                    checkOut = co.toISOString().split('T')[0]
                }

                try {
                    const availability = await ElektraService.getAvailability(new Date(checkIn), new Date(checkOut), 'EUR')

                    // Group by room type
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
                        minPrice: data.prices.length > 0 ? Math.round(Math.min(...data.prices)) : null,
                        avgPrice: data.prices.length > 0 ? Math.round(data.prices.reduce((s, p) => s + p, 0) / data.prices.length) : null,
                        maxBasePrice: data.basePrices.length > 0 ? Math.round(Math.max(...data.basePrices)) : null,
                        hasDiscount: data.prices.some((p, i) => p < data.basePrices[i]),
                        available: data.available > 0 && !data.stopsell,
                        currency: 'EUR'
                    }))

                    finalResponse.text = args.message || "İşte seçtiğiniz tarihler için güncel oda fiyatları:"
                    finalResponse.uiPayload = { type: 'price_result' }
                    finalResponse.data = {
                        checkIn,
                        checkOut,
                        rooms,
                        source: 'elektra',
                        bookingUrl: 'https://blue-dreams.rezervasyonal.com'
                    }
                } catch (err) {
                    console.error('[AI Chat] Elektra pricing error:', err)
                    finalResponse.text = "Fiyat bilgisi şu anda alınamıyor. Lütfen rezervasyon sayfamızı ziyaret edin."
                    finalResponse.uiPayload = { type: 'booking_form' }
                    finalResponse.data = null
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

        if (errorMessage.includes('API_KEY') || errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('400')) {
            userMessage = "AI Anahtarı Hatası (Süresi Dolmuş veya Geçersiz). Detaylar konsolda."
        } else if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
            userMessage = "AI servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin."
        } else if (errorMessage.includes('SAFETY') || errorMessage.includes('blocked')) {
            userMessage = "Güvenlik filtresi nedeniyle yanıt üretilemedi. Lütfen sorunuzu farklı şekilde sorun."
        }

        return NextResponse.json({
            text: userMessage,
            uiPayload: null,
            data: null,
            _debug: errorMessage // Always expose error for debugging as requested
        })
    }
}
