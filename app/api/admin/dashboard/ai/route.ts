import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize the Google Generative AI with the API key
const apiKey = process.env.GEMINI_API_KEY || ''
const genAI = new GoogleGenerativeAI(apiKey)

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API anahtarı bulunamadı. Lütfen sistem yöneticisiyle iletişime geçin.' },
        { status: 500 }
      )
    }

    // Attempt to parse the incoming dashboard data
    const body = await req.json()
    const { 
      startDate, 
      endDate, 
      stats, 
      pickupData, 
      currency,
      locale
    } = body

    if (!stats || !pickupData) {
      return NextResponse.json(
        { error: 'Analiz için yeterli veri sağlanamadı.' },
        { status: 400 }
      )
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const promptText = `
Sen "Blue Dreams Resort & Spa" oteli için çalışan uzman bir Gelir Yöneticisi ve Veri Analisti AI asistanısın.
Görev: Aşağıdaki otel rezervasyon ve performans verilerini analiz ederek, otel yönetimine yönelik **kısa, net ve proaktif (aksiyon alınabilir)** bir özet rapor sunmak.

### Seçili Dönem
- Başlangıç: ${startDate}
- Bitiş: ${endDate}
- Para Birimi: ${currency}
- Dil: ${locale === 'tr' ? 'Türkçe' : 'İngilizce'} (Lütfen cevabını bu dilde ver, eğer tr ise kesinlikle Türkçe ver.)

### Dönem İstatistikleri
- Toplam Onaylı Rezervasyon: ${stats.totalReservations}
- Toplam Geceleme (Oda x Gece): ${Math.round(stats.totalRoomNights || 0)}
- Toplam Gelir: ${Math.round(stats.totalRevenue).toLocaleString('tr-TR')} ${currency}
- İptal Edilen Rezervasyon Sayısı: ${stats.cancelledReservations}
- İptal Edilen Rezervasyon Kaybı: ${Math.round(stats.cancelledRevenue || 0).toLocaleString('tr-TR')} ${currency}
- Ortalama Günlük Ücret (ADR): ${Math.round(stats.primaryAdr || stats.totalRevenue / Math.max(1, stats.totalRoomNights)).toLocaleString('tr-TR')} ${currency}
- Ortalama Konaklama Süresi: ${stats.averageStay?.toFixed(1) || 0} gün

### Pickup (Bu dönemde gelen/iptal olan) Verisi (Pace & Akış)
- Yeni Alınan Rezervasyon (Adet): ${pickupData.newReservations}
- İptal Edilen Rezervasyon (Adet): ${pickupData.cancelledReservations}
- Net Pickup (Yeni - İptal): ${pickupData.netPickup}
- Pickup Geliri: ${Math.round(pickupData.revenue).toLocaleString('tr-TR')} ${currency}

**Beklenen Çıktı Formatı (Markdown olarak):**
1. **📊 Genel Durum Özeti** (1-2 cümlelik vurucu bir özet, iyi/kötü/durağan)
2. **📈 Öne Çıkan Eğilimler** (Örn: İptal oranları yüksek mi, ADR sağlıklı mı, pickup pozitif mi?)
3. **🎯 Stratejik Tavsiye** (Pazarlama veya fiyatlama için kesin 1-2 aksiyon önerisi)

Kurallar:
- Çok uzun paragraflardan kaçın. Okuması kolay, bullet-point (madde imi) ağırlıklı olsun.
- Yalnızca sana verilen verileri kullan, varsayımsal sayılar uydurma.
- Çıktı sadece ve sadece istenilen dil ("${locale === 'tr' ? 'Türkçe' : 'İngilizce'}") olmalıdır.
`

    const result = await model.generateContent(promptText)
    const responseText = result.response.text()

    return NextResponse.json({ summary: responseText })
  } catch (error) {
    console.error('AI Analysis Error:', error)
    return NextResponse.json(
      { error: 'AI analizi sırasında bir hata oluştu veya API kotası aşıldı.' },
      { status: 500 }
    )
  }
}
