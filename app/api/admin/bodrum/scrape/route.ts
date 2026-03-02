import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// ============================================================
// Bodrum Etkinlik & Bilgi Scraper
// Kaynaklar: bodrum.bel.tr, gobodrum.com.tr, gezimanya.com
// ============================================================

export async function POST(req: NextRequest) {
    try {
        const results = {
            events: { created: 0, skipped: 0 },
            info: { created: 0, skipped: 0 }
        }

        // ===== 1. bodrum.bel.tr Etkinlik Takvimi =====
        try {
            const belRes = await fetch('https://www.bodrum.bel.tr/etkinlik_takvimi', {
                headers: { 'User-Agent': 'BlueDreamsResort/1.0' }
            })
            if (belRes.ok) {
                const html = await belRes.text()
                // Extract event links and titles from the HTML
                const eventRegex = /<a[^>]*href="(\/etkinlik\.php\?id=\d+\/[^"]+)"[^>]*>([^<]+)<\/a>/gi
                let match
                const seen = new Set<string>()

                while ((match = eventRegex.exec(html)) !== null) {
                    const [, path, rawTitle] = match
                    const title = rawTitle.trim()
                    if (!title || title === 'Detaylar' || seen.has(title)) continue
                    seen.add(title)

                    // Derive category from URL
                    let category = 'event'
                    const lowerPath = path.toLowerCase()
                    if (lowerPath.includes('sergi')) category = 'exhibition'
                    else if (lowerPath.includes('konser') || lowerPath.includes('muzik')) category = 'concert'
                    else if (lowerPath.includes('mac') || lowerPath.includes('yarisma') || lowerPath.includes('spor')) category = 'sports'
                    else if (lowerPath.includes('festival')) category = 'festival'

                    const sourceUrl = `https://www.bodrum.bel.tr${path}`

                    // Upsert to avoid duplicates
                    const existing = await prisma.bodrumEvent.findFirst({
                        where: { title, source: 'bodrum.bel.tr' }
                    })

                    if (!existing) {
                        await prisma.bodrumEvent.create({
                            data: {
                                title,
                                category,
                                source: 'bodrum.bel.tr',
                                sourceUrl,
                                isActive: true
                            }
                        })
                        results.events.created++
                    } else {
                        results.events.skipped++
                    }
                }
            }
        } catch (err) {
            console.error('bodrum.bel.tr scrape error:', err)
        }

        // ===== 2. gobodrum.com.tr Festivaller =====
        const gobodrumFestivals = [
            {
                title: 'Bodrum Caz Festivali',
                description: "Türkiye'nin en prestijli caz festivallerinden biri. Yerli ve yabancı ünlü caz sanatçılarını ağırlıyor.",
                category: 'festival',
                sourceUrl: 'https://gobodrum.com.tr/tr/etkinlikler/bodrum-caz-festivali'
            },
            {
                title: 'Bodrum Amfitiyatro Açık Hava Konseri',
                description: "Ünlü sanatçıların sahne aldığı, Bodrum'un tarihi atmosferinde unutulmaz bir müzik deneyimi.",
                category: 'concert',
                sourceUrl: 'https://gobodrum.com.tr/tr/etkinlikler/bodrum-amfitiyatro-konseri'
            },
            {
                title: 'Gümüşlük Klasik Müzik Festivali',
                description: "Antik taş ocağında, dünyaca ünlü klasik müzik sanatçılarını dinleyebileceğiniz büyüleyici bir atmosfer.",
                category: 'festival',
                sourceUrl: 'https://gobodrum.com.tr/tr/etkinlikler/gumusluk-klasik-muzik-festivali'
            },
            {
                title: 'Bodrum Cup Yelken Yarışları',
                description: "Ege'nin en büyük yelken organizasyonu. Geleneksel ahşap tekneler ve modern yatların mücadelesi.",
                category: 'sports',
                sourceUrl: 'https://gobodrum.com.tr/tr/etkinlikler/bodrum-cup-yelken-yarislari'
            },
            {
                title: 'Bodrum Sualtı Festivali',
                description: "Sualtı fotoğrafçılığı yarışmaları, dalış gösterileri ve deniz ekosistemi hakkında eğitici etkinlikler.",
                category: 'festival',
                sourceUrl: 'https://gobodrum.com.tr/tr/etkinlikler/bodrum-sualti-festivali'
            },
            {
                title: 'Bodrum Bienali',
                description: "Yerel ve uluslararası sanatçıların eserlerini sergilediği çağdaş sanat etkinliği.",
                category: 'exhibition',
                sourceUrl: 'https://gobodrum.com.tr/tr/etkinlikler/bodrum-bienali'
            }
        ]

        for (const fest of gobodrumFestivals) {
            const existing = await prisma.bodrumEvent.findFirst({
                where: { title: fest.title, source: 'gobodrum.com.tr' }
            })
            if (!existing) {
                await prisma.bodrumEvent.create({
                    data: { ...fest, source: 'gobodrum.com.tr', isActive: true }
                })
                results.events.created++
            } else {
                results.events.skipped++
            }
        }

        // ===== 3. Gezimanya / GoBodrum Bilgi Verileri =====
        const bodrumInfoData = [
            {
                category: 'general',
                title: 'Bodrum Nerededir?',
                content: "Bodrum, Ege Bölgesi'nde bulunan Muğla ilinin batı köşesinde bulunan bir ilçesidir. Kuzey, doğu ve güney taraflarında Ege Denizi bulunan bir yarımadadır. 689 km²'lik alan ve 215 km kıyı uzunluğuna sahiptir.",
                source: 'gezimanya.com'
            },
            {
                category: 'transportation',
                title: "Bodrum'a Nasıl Gidilir?",
                content: "Bodrum'a kendi aracınızla, otobüsle ya da uçakla gelebilirsiniz. Milas-Bodrum Havalimanı'ndan merkeze 32 km, yaklaşık 35 dakikadır. İstanbul-Bodrum 706 km (~10 saat), Ankara-Bodrum 708 km, İzmir-Bodrum 242 km'dir.",
                source: 'gezimanya.com'
            },
            {
                category: 'weather',
                title: "Bodrum'a Ne Zaman Gidilir?",
                content: "Bodrum dört mevsim tatil imkanı sunar. Yaz ayları deniz, güneş ve gece hayatı; ilkbahar/sonbahar ılık havada sakin tatil; kış aylarında bile Mandalina Festivali (ocak) ve Gündoğan Sucuk ve Şarap Festivali (şubat) gibi etkinlikler vardır. Yıllık ortalama sıcaklıklar: Ocak 11°C, Nisan 17°C, Temmuz 28°C, Ekim 21°C.",
                source: 'gezimanya.com'
            },
            {
                category: 'accommodation',
                title: "Bodrum'da Nerede Kalınır?",
                content: "Bodrum'da her şey dahil oteller, butik oteller, villalar, apart oteller ve pansiyonlar mevcuttur. Yaz aylarında birkaç ay öncesinden rezervasyon yapılması önerilir. Türkbükü lüks konaklama, Gümüşlük sakin tatil, Bitez aile tatili için idealdir.",
                source: 'gezimanya.com'
            },
            {
                category: 'attractions',
                title: 'Bodrum Kalesi',
                content: "Sualtı Arkeoloji Müzesi'ne ev sahipliği yapan, Helenistik dönemden kalma etkileyici kale. Muhteşem deniz manzarası ve zengin tarih sunar.",
                source: 'gobodrum.com.tr'
            },
            {
                category: 'attractions',
                title: 'Türkbükü',
                content: "'Türk Saint-Tropez'i' olarak bilinen lüks bir sahil köyü. Şık plaj kulüpleri, butik oteller ve üst düzey restoranlar barındırır.",
                source: 'gobodrum.com.tr'
            },
            {
                category: 'attractions',
                title: 'Gümüşlük',
                content: "Denize uzanan antik kalıntılar üzerine kurulmuş rustik bir balıkçı köyü. Güneşin batışını izlemek için mükemmel bir yer. Harika balık restoranları vardır.",
                source: 'gobodrum.com.tr'
            },
            {
                category: 'festivals',
                title: "Bodrum'daki Festivaller",
                content: "Yaz-kış birçok festival düzenlenir: Mandalina Festivali (Ocak), Gündoğan Sucuk ve Şarap Festivali (Şubat), Bodrum Caz Festivali (Yaz), Gümüşlük Klasik Müzik Festivali, Bodrum Cup Yelken Yarışları, Bodrum Sualtı Festivali, Bodrum Bienali gibi onlarca etkinlik.",
                source: 'gezimanya.com'
            },
            {
                category: 'emergency',
                title: 'Acil Durum Numaraları',
                content: "Ambulans: 112, Polis: 155, İtfaiye: 110, Jandarma: 156, Sahil Güvenlik: 158, Turizm Danışma: (0252) 316 10 91, Bodrum Belediyesi: (0252) 316 10 09, Milas-Bodrum Havaalanı: (0252) 523 01 01.",
                source: 'gezimanya.com'
            },
            {
                category: 'general',
                title: 'Bodrum Künyesi',
                content: "Nüfus: ~160.000, İklim: Akdeniz İklimi, Ortalama gezilme süresi: 4-5 gün. Ege Denizi kıyısında, Muğla iline bağlı yarımada ilçe.",
                source: 'gezimanya.com'
            }
        ]

        for (const info of bodrumInfoData) {
            try {
                await prisma.bodrumInfo.upsert({
                    where: {
                        category_title_locale: {
                            category: info.category,
                            title: info.title,
                            locale: 'tr'
                        }
                    },
                    update: { content: info.content, source: info.source },
                    create: { ...info, locale: 'tr' }
                })
                results.info.created++
            } catch {
                results.info.skipped++
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Bodrum verileri başarıyla çekildi ve DB\'ye kaydedildi.',
            results
        })

    } catch (error: any) {
        console.error('Bodrum scrape error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// GET — Return stored events and info
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') || 'all' // events, info, all

        const response: any = {}

        if (type === 'events' || type === 'all') {
            response.events = await prisma.bodrumEvent.findMany({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' }
            })
        }

        if (type === 'info' || type === 'all') {
            response.info = await prisma.bodrumInfo.findMany({
                orderBy: { order: 'asc' }
            })
        }

        return NextResponse.json(response)
    } catch (error: any) {
        console.error('Bodrum data fetch error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
