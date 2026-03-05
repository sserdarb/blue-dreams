import { NextResponse } from 'next/server'

// ─── AI Campaign Suggestion Endpoint ─────────────────────────────
// Analyzes current ad performance and generates campaign recommendations
// Uses OpenAI to produce actionable campaign suggestions

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { campaigns = [], totalSpend = 0, totalClicks = 0, totalConversions = 0 } = body

        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            // Fallback: generate suggestions without AI
            return NextResponse.json({
                success: true,
                suggestions: getDefaultSuggestions(campaigns, totalSpend),
                source: 'template'
            })
        }

        // Build performance context for AI
        const topCampaigns = campaigns.slice(0, 10).map((c: any) => ({
            name: c.name,
            platform: c.platform,
            status: c.status,
            spend: c.spend,
            clicks: c.clicks,
            conversions: c.conversions,
            ctr: c.ctr,
            cpc: c.cpc,
        }))

        const prompt = `Sen bir otel dijital pazarlama uzmanısın. Blue Dreams Resort (5 yıldızlı, Bodrum/Torba) için reklam kampanyası önerileri üret.

Mevcut kampanya performansı:
- Toplam Harcama: €${totalSpend.toFixed(2)}
- Tıklama: ${totalClicks}
- Dönüşüm: ${totalConversions}
- Aktif Kampanyalar: ${JSON.stringify(topCampaigns)}

Lütfen 3-5 yeni kampanya önerisi üret. Her biri:
1. Kampanya adı
2. Platform (Meta/Google)
3. Hedef kitle açıklaması
4. Tahmini günlük bütçe (€)
5. Amaç (awareness/traffic/conversions)
6. Metin önerisi (reklam copy)
7. Performans tahmini

JSON formatında yanıt ver: { "suggestions": [{ "name", "platform", "audience", "dailyBudget", "objective", "adCopy", "estimatedCtr", "reasoning" }] }`

        const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                response_format: { type: 'json_object' },
            })
        })

        if (!aiRes.ok) {
            const errText = await aiRes.text()
            console.error('[AI Campaign Suggest] OpenAI error:', errText.substring(0, 200))
            return NextResponse.json({
                success: true,
                suggestions: getDefaultSuggestions(campaigns, totalSpend),
                source: 'template'
            })
        }

        const aiData = await aiRes.json()
        const content = aiData.choices?.[0]?.message?.content
        const parsed = JSON.parse(content)

        return NextResponse.json({
            success: true,
            suggestions: parsed.suggestions || [],
            source: 'ai'
        })
    } catch (error: any) {
        console.error('[AI Campaign Suggest Error]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

function getDefaultSuggestions(campaigns: any[], totalSpend: number) {
    return [
        {
            name: 'Erken Rezervasyon 2026 - Meta',
            platform: 'Meta',
            audience: '25-55 yaş, Türkiye + Almanya + İngiltere, seyahat ilgi alanı',
            dailyBudget: 50,
            objective: 'conversions',
            adCopy: '🌴 2026 Yaz Tatili İçin Erken Fırsatlar! Blue Dreams Resort\'ta %25\'e varan indirim. Torba\'nın en güzel plajında huzurlu bir tatil sizi bekliyor.',
            estimatedCtr: '1.5-2.5%',
            reasoning: 'Erken rezervasyon dönemi yüksek dönüşüm oranı sağlar.'
        },
        {
            name: 'Retargeting - Web Ziyaretçileri',
            platform: 'Meta',
            audience: 'Son 30 gün web sitesi ziyaretçileri (pixel)',
            dailyBudget: 30,
            objective: 'conversions',
            adCopy: 'Hayalinizdeki tatil bir tık uzağınızda! Blue Dreams Resort\'ta özel fiyatlar devam ediyor. Hemen rezervasyon yapın!',
            estimatedCtr: '3-5%',
            reasoning: 'Retargeting kampanyaları genellikle 3-5x daha yüksek dönüşüm oranı sağlar.'
        },
        {
            name: 'Google Search - Bodrum Otel',
            platform: 'Google',
            audience: '"bodrum otel", "torba otel", "5 yıldızlı otel bodrum" arama yapanlar',
            dailyBudget: 40,
            objective: 'traffic',
            adCopy: 'Blue Dreams Resort Torba | 5 Yıldızlı Her Şey Dahil ★★★★★ Denize Sıfır, Özel Plaj. Online Rezervasyon.',
            estimatedCtr: '4-8%',
            reasoning: 'Yüksek niyetli arama trafiği en kaliteli potansiyel müşterileri getirir.'
        },
        {
            name: 'Instagram Story - Plaj & Havuz',
            platform: 'Meta',
            audience: '20-40 yaş, lüks seyahat ilgi alanı, İstanbul + Ankara + İzmir',
            dailyBudget: 25,
            objective: 'awareness',
            adCopy: '☀️ Torba\'nın en güzel plajı seni bekliyor! 360° deniz manzarası, infinity havuz ve çok daha fazlası.',
            estimatedCtr: '0.8-1.5%',
            reasoning: 'Story formatı yüksek görüntülenme oranı ve marka bilinirliği sağlar.'
        },
    ]
}
