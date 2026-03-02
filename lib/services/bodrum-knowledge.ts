// ─── Bodrum Knowledge Base ─────────────────────────────────────
// Static knowledge about Bodrum for Blue Concierge AI context
// Sources: gobodrum.com.tr, gezimanya.com, bodrum.bel.tr

export const BODRUM_KNOWLEDGE = {
    history: `Bodrum, Muğla iline bağlı olan 13 ilçeden biridir. M.Ö. 650'li yıllarda "Halikarnassos" olarak adlandırılmaya başlanmıştır. Şehrin Aziz Petrus'a adanmasıyla birlikte Petrium denmeye başlandı. Bu kelime zamanla "Petrum", "Potrum" ve "Bodrum" haline gelmiştir. Cumhuriyet'in ilanıyla adı resmi olarak Bodrum olarak değiştirilmiştir.`,

    culture: `Bodrum denildiğinde akla ilk gelen beyaz kireç kaplı taş evleri ve çivit mavisi kapı-pencereleri, koyları ve sıcak insanlarıdır. Yılın neredeyse altı ayı boyunca yazı yaşatır. Türkiye'nin en popüler tatil yerlerinin başında gelir. Bodrum dört mevsim huzur veren bir kaçış yeri gibi görülmektedir. Neyzen Tevfik, Zeki Müren, İlhan Berk, Halikarnas Balıkçısı gibi tanınmış kişiler Bodrum'da yaşamış ve Bodrum'la ilgili şiirler yazmıştır.`,

    landmarks: [
        {
            name: 'Halikarnas Mozolesi (Mausoleion)',
            description: 'Dünyanın yedi harikasından biri. M.Ö. 4. yüzyılda yaptırılmış bir anıt mezar. 242 metreye kadar yükselen gizemli bir mimariye sahipti. Bugün yerinde kalıntıları ve bir müze bulunmaktadır.',
        },
        {
            name: 'Bodrum Kalesi',
            description: 'Günümüzde en sağlam kalan kalelerden biri. İçinde dünyanın en büyük ikinci Sualtı Arkeoloji Müzesi bulunmaktadır.',
        },
        {
            name: 'Myndos Kapısı',
            description: 'Antik Halikarnassos\'un batı girişi olan tarihi kapı. Gümüşlük bölgesinde bulunur.',
        },
        {
            name: 'Tavşan Adası',
            description: 'Gümüşlük\'te bulunan tarihi ada. Myndos Antik Kent kalıntılarına ev sahipliği yapar.',
        },
    ],

    regions: [
        { name: 'Bitez', highlight: 'En rağbet gören koylardan biri' },
        { name: 'Yalıkavak', highlight: 'Yel değirmeni, süngerci mahallesi ve manzarası' },
        { name: 'Türkbükü', highlight: 'Lüks tatil ve gece hayatı' },
        { name: 'Gümüşlük', highlight: 'Myndos Antik Kent ve Tavşan Adası' },
        { name: 'Gümbet', highlight: 'Eğlence ve gece hayatı merkezi' },
        { name: 'Turgutreis', highlight: 'Gün batımı ve halk pazarı' },
        { name: 'Gündoğan', highlight: 'Sakin koy ve doğa' },
        { name: 'Torba', highlight: 'Huzurlu plaj ve konak' },
        { name: 'Ortakent', highlight: 'Uzun kumsal şeridi' },
        { name: 'Akyarlar', highlight: 'Rüzgar sörfü ve doğal plajlar' },
    ],

    climate: `Bodrum Akdeniz iklimine sahiptir. Yaz aylarında sıcaklık 40 dereceyi bulabilirken kış aylarında 10-15 dereceye düşer. Yazlar kurak geçer, yağışı çoğunlukla kışın ve yağmur olarak alır.`,

    nightlife: `Bodrum, gece hayatı açısından Türkiye'nin en ünlü yerlerinin başında gelir. Yılın her dönemi yapılan müzik ve eğlence festivalleriyle ülke içinden ve yurtdışından birçok turisti çeker.`,

    gastronomy: `El işçiliğiyle yapılmış ahşap, cam, deniz kabuklu hediyelik eşyalar çok yaygındır. Yöresel lezzetler tadabileceğiniz çok sayıda köy restoranı bulunur. Bodrum mutfağı Ege mutfağının zengin lezzetlerini sunar: zeytinyağlılar, deniz ürünleri, otlar ve taze Ege sebzeleri.`,

    population: `2016 verilerine göre 160 bin nüfusuyla Muğla'nın en kalabalık ilçesidir. Yaz aylarında gelen tatilcilerle nüfus 1,5 milyona yaklaşır.`,
}

// ─── Bodrum Municipality Events (bodrum.bel.tr) ────────────────
export const BODRUM_MUNICIPALITY_EVENTS = [
    {
        title: 'Tutku Cam ve Resim Sergisi',
        type: 'Sergi',
        source: 'bodrum.bel.tr',
        link: 'https://www.bodrum.bel.tr/etkinlik.php?id=2326',
    },
    {
        title: '"Bir Hayat Nefesi Sergisi"',
        type: 'Sergi',
        source: 'bodrum.bel.tr',
        link: 'https://www.bodrum.bel.tr/etkinlik.php?id=2486',
    },
    {
        title: 'Ustalar Sergisi',
        type: 'Sergi',
        source: 'bodrum.bel.tr',
        link: 'https://www.bodrum.bel.tr/etkinlik.php?id=2406',
    },
    {
        title: 'Kitap Klübü: Toni Morrison - En Mavi Göz',
        type: 'Kültür',
        source: 'bodrum.bel.tr',
        link: 'https://www.bodrum.bel.tr/etkinlik.php?id=2487',
    },
    {
        title: 'Trendyol 1. Lig Futbol Maçı: Bodrumspor - Erokspor',
        type: 'Spor',
        source: 'bodrum.bel.tr',
        link: 'https://www.bodrum.bel.tr/etkinlik.php?id=2482',
    },
    {
        title: 'Türkiye Kupası B Grubu: Bodrumspor - Iğdır FK',
        type: 'Spor',
        source: 'bodrum.bel.tr',
        link: 'https://www.bodrum.bel.tr/etkinlik.php?id=2480',
    },
    {
        title: 'Kadınlar Voleybol 1. Ligi: Bodrum Bld. - Endo Karşıyaka',
        type: 'Spor',
        source: 'bodrum.bel.tr',
        link: 'https://www.bodrum.bel.tr/etkinlik.php?id=2483',
    },
    {
        title: '"Muhasebe Haftası" Çelenk Sunum Töreni',
        type: 'Resmi',
        source: 'bodrum.bel.tr',
        link: 'https://www.bodrum.bel.tr/etkinlik.php?id=2488',
    },
]

// ─── Build Concierge Context ───────────────────────────────────

export function buildBodrumContext(): string {
    const k = BODRUM_KNOWLEDGE
    let ctx = `\n=== BODRUM REHBERİ ===\n`
    ctx += `TARİH: ${k.history}\n`
    ctx += `KÜLTÜR: ${k.culture}\n`
    ctx += `İKLİM: ${k.climate}\n`
    ctx += `GECE HAYATI: ${k.nightlife}\n`
    ctx += `GASTRONOMİ: ${k.gastronomy}\n`
    ctx += `NÜFUS: ${k.population}\n`

    ctx += `\nÖNEMLİ YERLER:\n`
    for (const lm of k.landmarks) {
        ctx += `- ${lm.name}: ${lm.description}\n`
    }

    ctx += `\nBÖLGELER:\n`
    for (const r of k.regions) {
        ctx += `- ${r.name}: ${r.highlight}\n`
    }

    ctx += `\nGÜNCEL BODRUM BELEDİYESİ ETKİNLİKLERİ:\n`
    for (const evt of BODRUM_MUNICIPALITY_EVENTS) {
        ctx += `- ${evt.title} (${evt.type}) — ${evt.link}\n`
    }

    return ctx
}
