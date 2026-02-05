import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// System prompt for the AI
const getSystemPrompt = async (locale: string): Promise<string> => {
    // Try to get custom system prompt from database
    const settings = await prisma.aiSettings.findFirst({
        where: { isActive: true }
    })

    // Get training documents
    const documents = await prisma.aiTrainingDocument.findMany()
    const trainingContent = documents.map(d => d.content).join('\n\n')

    const basePrompt = settings?.systemPrompt || `Sen Blue Dreams Resort'un dijital konsiyerjisin.

KİMLİK VE TON:
- Sofistike, çok bilgili, misafirperver ve çözüm odaklısın.
- Cevapların detaylı, betimleyici ve hikayeleştirici olsun.

OTEL BİLGİLERİ:

GENEL:
- Konum: Torba Zeytinlikahve Mevkii, Bodrum.
- Arazi: 52.000 m², doğayla iç içe.
- Uzaklık: Milas-Bodrum Havalimanı 25 km (25 dk), Bodrum Merkez 10 km (10 dk).
- Toplam oda sayısı: 340+
- Sertifika: Güvenli Turizm Sertifikası, Sürdürülebilir Turizm.

ODALAR:
- Club Odalar: 20-22 m², modern tasarım, deniz veya bahçe manzarası.
- Deluxe Odalar: 25-28 m², geniş yaşam alanı, deniz manzarası, jakuzi.
- Aile Suitleri: 35 m², 2 yatak odası, 4 kişilik kapasite.

YEME İÇME:
- Begonvil Ana Restoran: 550 kişilik açık büfe.
- Halicarnassus Restoran: Deniz Ürünleri A'la Carte.
- Le Kebab: Türk Mutfağı A'la Carte.
- La Lokanta: İtalyan Mutfağı A'la Carte.
- 10+ farklı bar noktası.

SPA & WELLNESS (NAYA SPA):
- Türk Hamamı, Sauna, Buhar Odası.
- Masaj ve Bakım Terapileri.

TOPLANTI & ETKİNLİK:
- İstanbul Salonu: 770 m², 700 Kişi, 3.5-4m Yükseklik.
- Turunç, Salamis, Belek, Marmaris, Stockholm salonları.

AKTİVİTELER:
- Sonsuzluk Havuzu, Aqua Park, Su Sporları, Yoga, Canlı Müzik.`

    return `${basePrompt}

${trainingContent ? `EK EĞİTİM BİLGİLERİ:\n${trainingContent}` : ''}

DİL: ${locale === 'tr' ? 'Türkçe' : locale === 'en' ? 'English' : locale === 'de' ? 'Deutsch' : 'Русский'} dilinde yanıt ver.

GÖRSEL WIDGET KULLANIMI:
- Kullanıcı "odalar" derse -> type: 'rooms' döndür
- Belirli bir oda sorulursa -> type: 'room_detail', detailId: oda_ismi
- "konum", "nerede" -> type: 'location'
- "transfer" -> type: 'transfer_form'
- "yorumlar" -> type: 'reviews'
- "iletişim" -> type: 'contact'`
}

// Function declarations for Gemini
const functionDeclarations = [
    {
        name: 'render_ui',
        description: 'Renders a specific visual UI component.',
        parameters: {
            type: 'object',
            properties: {
                componentType: {
                    type: 'string',
                    enum: ['rooms', 'location', 'contact', 'reviews', 'dining', 'room_detail', 'transfer_form', 'meeting'],
                },
                detailId: {
                    type: 'string',
                    description: 'Optional: The name of the item to show details for.'
                },
                message: {
                    type: 'string',
                    description: 'A helpful response text to display above the widget.'
                }
            },
            required: ['componentType', 'message']
        }
    }
]

export async function POST(request: NextRequest) {
    try {
        const { messages, locale = 'tr' } = await request.json()

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            // Fallback response when no API key
            return NextResponse.json({
                text: getFallbackResponse(messages[messages.length - 1]?.text || '', locale)
            })
        }

        const systemPrompt = await getSystemPrompt(locale)

        // Call Gemini API
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: messages.map((m: any) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.text }]
                })),
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
                tools: [{
                    functionDeclarations
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1024
                }
            })
        })

        if (!response.ok) {
            const error = await response.text()
            console.error('Gemini API error:', error)
            return NextResponse.json({
                text: getFallbackResponse(messages[messages.length - 1]?.text || '', locale)
            })
        }

        const data = await response.json()
        const candidate = data.candidates?.[0]?.content?.parts?.[0]

        // Check for function call
        if (candidate?.functionCall) {
            const { name, args } = candidate.functionCall
            if (name === 'render_ui') {
                return NextResponse.json({
                    text: args.message || 'İşte istediğiniz bilgiler:',
                    uiPayload: {
                        type: args.componentType,
                        detailId: args.detailId,
                        message: args.message
                    }
                })
            }
        }

        // Text response
        const text = candidate?.text || getFallbackResponse(messages[messages.length - 1]?.text || '', locale)

        return NextResponse.json({ text })

    } catch (error) {
        console.error('AI Chat error:', error)
        return NextResponse.json({
            text: 'Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.'
        }, { status: 500 })
    }
}

// Fallback responses when AI is not available
function getFallbackResponse(query: string, locale: string): string {
    const q = query.toLowerCase()

    if (q.includes('oda') || q.includes('room')) {
        return locale === 'tr'
            ? 'Blue Dreams Resort\'ta Club, Deluxe ve Aile odaları bulunmaktadır. Club odalar 20-22 m², Deluxe odalar 25-28 m² ve Aile suitleri 35 m² büyüklüğündedir. Tüm odalarımız deniz veya bahçe manzaralıdır.'
            : 'Blue Dreams Resort offers Club, Deluxe and Family rooms. Club rooms are 20-22 m², Deluxe rooms are 25-28 m² and Family suites are 35 m². All rooms have sea or garden views.'
    }

    if (q.includes('restoran') || q.includes('yemek') || q.includes('dining')) {
        return locale === 'tr'
            ? 'Otelimizde 4 restoran bulunmaktadır: Begonvil Ana Restoran (açık büfe), Halicarnassus (deniz ürünleri), Le Kebab (Türk mutfağı) ve La Lokanta (İtalyan mutfağı).'
            : 'We have 4 restaurants: Begonvil Main Restaurant (buffet), Halicarnassus (seafood), Le Kebab (Turkish cuisine) and La Lokanta (Italian cuisine).'
    }

    if (q.includes('spa') || q.includes('masaj')) {
        return locale === 'tr'
            ? 'Naya Spa merkezimizde Türk hamamı, sauna, buhar odası ve çeşitli masaj terapileri sunulmaktadır.'
            : 'Our Naya Spa center offers Turkish bath, sauna, steam room and various massage therapies.'
    }

    if (q.includes('konum') || q.includes('nerede') || q.includes('location')) {
        return locale === 'tr'
            ? 'Blue Dreams Resort, Bodrum Torba\'da yer almaktadır. Milas-Bodrum Havalimanı\'na 25 km (25 dakika), Bodrum merkezine 10 km uzaklıktadır.'
            : 'Blue Dreams Resort is located in Torba, Bodrum. It is 25 km from Milas-Bodrum Airport (25 minutes) and 10 km from Bodrum center.'
    }

    if (q.includes('transfer')) {
        return locale === 'tr'
            ? 'VIP transfer hizmetimiz mevcuttur. Havalimanından otelimize konforlu bir ulaşım sağlıyoruz. Detaylar için formu doldurun veya +90 252 337 11 11 numarasını arayın.'
            : 'VIP transfer service is available. We provide comfortable transportation from the airport to our hotel. Fill out the form or call +90 252 337 11 11 for details.'
    }

    return locale === 'tr'
        ? 'Blue Dreams Resort hakkında size yardımcı olmaktan mutluluk duyarım. Odalar, restoranlar, spa, konum veya diğer hizmetlerimiz hakkında soru sorabilirsiniz.'
        : 'I\'m happy to help you with information about Blue Dreams Resort. You can ask about rooms, restaurants, spa, location or our other services.'
}
