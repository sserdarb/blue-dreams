import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Google Generative AI with the API key
const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

// Sectional analysis — each section gets its own short prompt to avoid API limits
const SECTION_PROMPTS: Record<string, (data: any) => string> = {
  overview: (d) => `
Sen Blue Dreams Resort & Spa oteli için çalışan bir Gelir Yöneticisi AI asistanısın.
Dönem: ${d.startDate} – ${d.endDate} | Para Birimi: ${d.currency}
Dil: ${d.locale === 'tr' ? 'Türkçe' : 'İngilizce'}

VERİLER:
- Toplam Rez: ${d.stats.totalReservations}, Gelir: ${Math.round(d.stats.totalRevenue).toLocaleString('tr-TR')} ${d.currency}
- İptal: ${d.stats.cancelledReservations} adet (${Math.round(d.stats.cancelledRevenue || 0).toLocaleString('tr-TR')} ${d.currency} kayıp)
- Ort. Konaklama: ${d.stats.averageStay?.toFixed(1) || 0} gün

Görev: **📊 Genel Durum Özeti** — 2-3 cümlelik vurucu bir değerlendirme yaz (iyi/kötü/durağan). Sadece markdown ile yaz, kısa tut.`,

  trends: (d) => `
Blue Dreams Resort & Spa | ${d.startDate} – ${d.endDate} | ${d.currency}
Dil: ${d.locale === 'tr' ? 'Türkçe' : 'İngilizce'}

VERİLER:
- ADR: ${Math.round(d.stats.primaryAdr || d.stats.totalRevenue / Math.max(1, d.stats.totalRoomNights || 1)).toLocaleString('tr-TR')} ${d.currency}
- İptal Oranı: ${d.stats.totalReservations > 0 ? Math.round((d.stats.cancelledReservations / (d.stats.totalReservations + d.stats.cancelledReservations)) * 100) : 0}%
- Net Pickup: ${d.pickupData.netPickup} (Yeni: ${d.pickupData.newReservations}, İptal: ${d.pickupData.cancelledReservations})
- Pickup Geliri: ${Math.round(d.pickupData.revenue).toLocaleString('tr-TR')} ${d.currency}

Görev: **📈 Öne Çıkan Eğilimler** — İptal oranları, ADR sağlığı ve pickup trendi hakkında 3-4 maddelik kısa bir liste yaz. Markdown bullet-point kullan.`,

  advice: (d) => `
Blue Dreams Resort & Spa | ${d.startDate} – ${d.endDate} | ${d.currency}
Dil: ${d.locale === 'tr' ? 'Türkçe' : 'İngilizce'}

VERİLER:
- Rez: ${d.stats.totalReservations}, Gelir: ${Math.round(d.stats.totalRevenue).toLocaleString('tr-TR')} ${d.currency}
- ADR: ${Math.round(d.stats.primaryAdr || d.stats.totalRevenue / Math.max(1, d.stats.totalRoomNights || 1)).toLocaleString('tr-TR')} ${d.currency}
- İptal: ${d.stats.cancelledReservations}, Net Pickup: ${d.pickupData.netPickup}

Görev: **🎯 Stratejik Tavsiye** — Pazarlama veya fiyatlama için kesin 2-3 aksiyon önerisi ver. Kısa ve somut ol. Markdown bullet-point kullan.`
}

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API anahtarı bulunamadı. Lütfen sistem yöneticisiyle iletişime geçin.' },
        { status: 500 }
      )
    }

    const body = await req.json()
    const { startDate, endDate, stats, pickupData, currency, locale, section } = body

    if (!stats || !pickupData) {
      return NextResponse.json(
        { error: 'Analiz için yeterli veri sağlanamadı.' },
        { status: 400 }
      )
    }

    // Use stable model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const data = { startDate, endDate, stats, pickupData, currency, locale }

    // If a specific section is requested, generate only that section
    if (section && SECTION_PROMPTS[section]) {
      const promptText = SECTION_PROMPTS[section](data)
      const result = await model.generateContent(promptText)
      const responseText = result.response.text()
      return NextResponse.json({ summary: responseText, section })
    }

    // Default: generate all sections sequentially (backward compat)
    const sections: string[] = []
    for (const [key, promptFn] of Object.entries(SECTION_PROMPTS)) {
      try {
        const result = await model.generateContent(promptFn(data))
        sections.push(result.response.text())
      } catch (sectionErr) {
        console.error(`AI Section Error (${key}):`, sectionErr)
        sections.push(`> ⚠️ ${key} bölümü oluşturulamadı.`)
      }
    }

    return NextResponse.json({ summary: sections.join('\n\n---\n\n') })
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json(
      { error: 'AI analizi sırasında bir hata oluştu veya API kotası aşıldı.' },
      { status: 500 }
    )
  }
}
