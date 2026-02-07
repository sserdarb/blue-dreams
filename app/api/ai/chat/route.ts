import { NextResponse } from 'next/server'
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai"
import { prisma } from '@/lib/prisma'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

// Tool Definitions
const priceCheckTool: FunctionDeclaration = {
    name: "check_room_availability",
    description: "Checks room prices and availability for specific dates.",
    parameters: {
        type: Type.OBJECT,
        properties: {
            checkInDate: { type: Type.STRING },
            adults: { type: Type.NUMBER }
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
    const [rooms, dining, meeting, amenities, settings] = await Promise.all([
        prisma.room.findMany({ where: { locale }, orderBy: { order: 'asc' } }),
        prisma.dining.findMany({ where: { locale }, orderBy: { order: 'asc' } }),
        prisma.meetingRoom.findMany({ where: { locale }, orderBy: { order: 'asc' } }),
        prisma.amenity.findMany({ where: { locale }, orderBy: { order: 'asc' } }),
        prisma.aiSettings.findFirst({ where: { language: locale } })
    ])

    return { rooms, dining, meeting, amenities, settings }
}

export async function POST(request: Request) {
    try {
        const { messages, locale = 'tr' } = await request.json()

        if (!GEMINI_API_KEY) {
            return NextResponse.json({ error: 'API Key missing' }, { status: 500 })
        }

        // 1. Fetch Dynamic Content from DB
        const context = await getContextData(locale)

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
    ${context.rooms.map(r => `- ${r.title}: ${r.description} (${r.size}, ${r.view})`).join('\n')}
    
    RESTORANLAR:
    ${context.dining.map(d => `- ${d.title} (${d.type}): ${d.description}`).join('\n')}
    
    TOPLANTI SALONLARI:
    ${context.meeting.map(m => `- ${m.title}: ${m.capacity}, ${m.area}`).join('\n')}
    
    HİZMETLER:
    ${context.amenities.map(a => `- ${a.title}`).join('\n')}
    
    Genel Bilgiler:
    - Konum: Torba, Bodrum (Havalimanı 25km, Merkez 10km).
    - İletişim: +90 252 337 11 11
    `

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

        // Transform messages for Gemini
        const chatHistory = messages.map((m: any) => ({
            role: m.role,
            parts: [{ text: m.text }]
        }))

        // 3. Generate Content
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash-exp', // Or verified available model
            contents: chatHistory,
            config: {
                systemInstruction: systemPrompt,
                tools: [{ functionDeclarations: [priceCheckTool, renderUiTool] }],
            }
        })

        // 4. Handle Response & Tools
        const calls = response.functionCalls
        let finalResponse = {
            text: (response as any).text?.() || response.text || "",
            uiPayload: null as any,
            data: null as any // extra data for the widget
        }

        if (calls && calls.length > 0) {
            const call = calls[0]
            const args = (call.args || {}) as Record<string, any>

            if (call.name === 'check_room_availability') {
                // Mock logic for prices - in real app connect to reservation system
                finalResponse.text = "Müsaitlik durumunu kontrol ettim. İşte fiyatlar:"
                finalResponse.uiPayload = { type: 'price_result' }
                // Pass mock data so frontend can display it
                finalResponse.data = {
                    checkIn: args.checkInDate,
                    rooms: context.rooms.map(r => ({
                        name: r.title,
                        price: parseInt(r.priceStart?.replace(/\D/g, '') || "250"),
                        specialOffer: false
                    }))
                }
            }
            else if (call.name === 'render_ui') {
                const { componentType, detailId, message } = args
                finalResponse.text = message || "İşte detaylar:"

                // Build payload with DB data
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
                    // Find matching room
                    payloadData = context.rooms.find(r => r.title.toLowerCase().includes(detailId.toLowerCase()))
                        || context.rooms[0]
                }

                finalResponse.uiPayload = { type: componentType }
                finalResponse.data = payloadData
            }
        }

        return NextResponse.json(finalResponse)

    } catch (error) {
        console.error('AI API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
