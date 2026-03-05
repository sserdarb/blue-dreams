import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { summary, platforms, datePreset, campaigns } = body

        if (!summary) {
            return NextResponse.json({ error: 'Summary data required' }, { status: 400 })
        }

        const openaiKey = process.env.OPENAI_API_KEY

        // Generate AI commentary on the performance data
        let aiCommentary = ''
        if (openaiKey) {
            try {
                const prompt = `Sen bir dijital pazarlama analisti uzmansın. Otel reklam performans raporunu analiz edip Türkçe yönetici özeti hazırla.

Dönem: ${datePreset === 'last_7d' ? 'Son 7 Gün' : datePreset === 'last_90d' ? 'Son 90 Gün' : 'Son 30 Gün'}

PERFORMANS VERİLERİ:
- Toplam Harcama: €${summary.totalSpend}
- Toplam Gösterim: ${summary.totalImpressions?.toLocaleString()}
- Toplam Tıklama: ${summary.totalClicks?.toLocaleString()}
- Ortalama CTR: %${summary.avgCtr}
- Ortalama CPC: €${summary.avgCpc}
- Toplam Dönüşüm: ${summary.totalConversions}
- Toplam Erişim: ${summary.totalReach?.toLocaleString()}

PLATFORM DETAYLARI:
${(platforms || []).map((p: any) => `${p.platform}: Harcama €${p.spend}, Gösterim ${p.impressions}, Tıklama ${p.clicks}, CTR %${p.ctr?.toFixed(2)}`).join('\n')}

${campaigns?.length ? `AKTİF KAMPANYALAR (${campaigns.length} adet):
${campaigns.slice(0, 10).map((c: any) => `- ${c.name} (${c.platform}): €${c.spend} harcama, ${c.clicks} tıklama`).join('\n')}` : ''}

Aşağıdaki yapıda Türkçe JSON döndür:
{
  "executiveSummary": "2-3 paragraf genel değerlendirme",
  "topInsights": ["en önemli 4-5 bulgu"],
  "recommendations": ["5-6 eylem önerisi"],
  "platformAnalysis": { "Meta": "platform değerlendirmesi", "Google": "platform değerlendirmesi" },
  "riskAlerts": ["dikkat edilmesi gereken 2-3 risk"],
  "nextPeriodForecast": "sonraki dönem tahmini"
}`

                const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${openaiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        messages: [{ role: 'user', content: prompt }],
                        temperature: 0.7,
                        max_tokens: 2000,
                        response_format: { type: 'json_object' }
                    })
                })

                const aiData = await aiRes.json()
                const raw = aiData?.choices?.[0]?.message?.content
                if (raw) {
                    aiCommentary = raw
                }
            } catch (aiErr: any) {
                console.error('[Report AI]', aiErr?.message)
            }
        }

        // Parse AI response
        let commentary: any = {}
        try {
            commentary = JSON.parse(aiCommentary)
        } catch {
            commentary = {
                executiveSummary: 'Reklam performansı raporunuz oluşturuldu. AI analizi mevcut değil.',
                topInsights: [`Toplam harcama: €${summary.totalSpend}`, `${summary.totalClicks} tıklama elde edildi`],
                recommendations: ['Kampanya optimizasyonu için A/B testleri yapın'],
                platformAnalysis: {},
                riskAlerts: [],
                nextPeriodForecast: 'Veriler toplandıkça tahmin iyileşecektir.'
            }
        }

        return NextResponse.json({
            success: true,
            report: {
                title: `Reklam Performans Raporu — ${datePreset === 'last_7d' ? 'Son 7 Gün' : datePreset === 'last_90d' ? 'Son 90 Gün' : 'Son 30 Gün'}`,
                generatedAt: new Date().toISOString(),
                summary,
                platforms,
                commentary
            }
        })
    } catch (e: any) {
        console.error('[Report Generate]', e?.message)
        return NextResponse.json({ error: e?.message || 'Report generation failed' }, { status: 500 })
    }
}
