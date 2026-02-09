const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper to create a page with widgets
async function seedPage(slug, locale, title, widgets) {
    const existing = await prisma.page.findUnique({
        where: { slug_locale: { slug, locale } }
    })
    if (existing) {
        console.log(`  ⏭️  ${slug}/${locale} already exists, skipping`)
        return
    }
    const page = await prisma.page.create({
        data: { slug, locale, title }
    })
    for (let i = 0; i < widgets.length; i++) {
        await prisma.widget.create({
            data: {
                pageId: page.id,
                type: widgets[i].type,
                data: JSON.stringify(widgets[i].data),
                order: i,
            }
        })
    }
    console.log(`  ✅ ${slug}/${locale} — ${widgets.length} widgets`)
}

// ============================================================
// HOMEPAGE WIDGETS
// ============================================================
function homeWidgets(locale) {
    const t = {
        tr: {
            badge: "Bodrum'un İncisi", h1a: "Ege'nin Mavi", h1b: "Rüyası", sub: "Doğanın kalbinde, lüksün ve huzurun buluştuğu nokta.", sub2: "Evinize, Blue Dreams'e hoş geldiniz.", btn1: "Odaları Keşfet", btn2: "Tanıtım Filmi", scroll: "Keşfet",
            aboutLabel: "Blue Dreams Deneyimi", aboutH: "Ege'nin kıyısında sizin yeriniz, mevsimlerin ritmiyle hazırlanan eşsiz lezzetler ve bizim hikayemizin sizin hikayenizle buluştuğu nokta.",
            expLabel: "Deneyimler", expH: "Unutulmaz", expHA: "Anılar",
            reviewLabel: "Misafir Yorumları", reviewH: "Ne Diyorlar?",
            susLabel: "Sürdürülebilirlik", susH: "Doğaya Saygı"
        },
        en: {
            badge: "Pearl of Bodrum", h1a: "Aegean Blue", h1b: "Dream", sub: "Where luxury and tranquility meet in the heart of nature.", sub2: "Welcome to your home, Blue Dreams.", btn1: "Explore Rooms", btn2: "Promo Video", scroll: "Discover",
            aboutLabel: "Blue Dreams Experience", aboutH: "Your place on the Aegean coast, unique flavors prepared with the rhythm of the seasons, and where our story meets yours.",
            expLabel: "Experiences", expH: "Unforgettable", expHA: "Memories",
            reviewLabel: "Guest Reviews", reviewH: "What They Say?",
            susLabel: "Sustainability", susH: "Respect for Nature"
        },
        de: {
            badge: "Perle von Bodrum", h1a: "Ägäischer Blauer", h1b: "Traum", sub: "Wo Luxus und Ruhe im Herzen der Natur aufeinandertreffen.", sub2: "Willkommen in Ihrem Zuhause, Blue Dreams.", btn1: "Zimmer Entdecken", btn2: "Promovideo", scroll: "Entdecken",
            aboutLabel: "Blue Dreams Erlebnis", aboutH: "Ihr Platz an der Ägäisküste, einzigartige Aromen im Rhythmus der Jahreszeiten und wo unsere Geschichte auf Ihre trifft.",
            expLabel: "Erlebnisse", expH: "Unvergessliche", expHA: "Erinnerungen",
            reviewLabel: "Gästebewertungen", reviewH: "Was sagen sie?",
            susLabel: "Nachhaltigkeit", susH: "Respekt für die Natur"
        },
        ru: {
            badge: "Жемчужина Бодрума", h1a: "Эгейская Голубая", h1b: "Мечта", sub: "Где роскошь и спокойствие встречаются в сердце природы.", sub2: "Добро пожаловать домой, в Blue Dreams.", btn1: "Номера", btn2: "Промо видео", scroll: "Откройте",
            aboutLabel: "Опыт Blue Dreams", aboutH: "Ваше место на побережье Эгейского моря, уникальные вкусы, приготовленные в ритме сезонов.",
            expLabel: "Впечатления", expH: "Незабываемые", expHA: "Воспоминания",
            reviewLabel: "Отзывы гостей", reviewH: "Что говорят?",
            susLabel: "Устойчивость", susH: "Уважение к природе"
        },
    }
    const c = t[locale] || t.tr
    const rooms = locale === 'tr' ? 'odalar' : locale === 'en' ? 'rooms' : locale === 'de' ? 'zimmer' : 'номера'

    return [
        { type: 'hero', data: { backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", badge: c.badge, titleLine1: c.h1a, titleLine2: c.h1b, subtitle: c.sub, subtitle2: c.sub2, button1Text: c.btn1, button1Url: `/${locale}/odalar`, button2Text: c.btn2, button2Url: "https://youtu.be/Et5yM-tW7_0", scrollText: c.scroll } },
        { type: 'text-block', data: { label: c.aboutLabel, heading: c.aboutH, backgroundColor: 'brand-dark', size: 'large' } },
        {
            type: 'image-grid', data: {
                items: [
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg", title: "Odalar & Süitler", subtitle: "Rooms & Suites", link: `/${locale}/odalar` },
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", title: "Gastronomi", subtitle: "Gastronomy", link: `/${locale}/restoran` },
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", title: "Spa & Wellness", subtitle: "Naya Spa", link: `/${locale}/spa` }
                ], variant: 'tall', columns: 3
            }
        },
        {
            type: 'experience', data: {
                label: c.expLabel, heading: c.expH, headingAccent: c.expHA, items: [
                    { title: "Infinity Pool", description: "Ege'nin mavisine bakan sonsuzluk havuzu", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg", icon: "🏊" },
                    { title: "Naya Spa", description: "Profesyonel masaj ve wellness hizmetleri", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", icon: "💆" },
                    { title: "Plaj", description: "Özel kumsal ve su sporları", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", icon: "🏖️" },
                    { title: "Gastronomi", description: "A'la carte restoranlar ve açık büfe", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", icon: "🍽️" }
                ]
            }
        },
        {
            type: 'weather', data: {
                title: locale === 'tr' ? 'Bodrum Hava Durumu' : locale === 'en' ? 'Bodrum Weather' : 'Bodrum Wetter', subtitle: locale === 'tr' ? 'Aylık ortalama sıcaklıklar' : 'Monthly averages', months: [
                    { name: 'Oca', avgHigh: 15, avgLow: 7, icon: 'cloud', rainDays: 12 }, { name: 'Şub', avgHigh: 15, avgLow: 7, icon: 'cloud', rainDays: 10 },
                    { name: 'Mar', avgHigh: 18, avgLow: 9, icon: 'cloudsun', rainDays: 8 }, { name: 'Nis', avgHigh: 21, avgLow: 12, icon: 'sun', rainDays: 5 },
                    { name: 'May', avgHigh: 26, avgLow: 16, icon: 'sun', rainDays: 3 }, { name: 'Haz', avgHigh: 31, avgLow: 20, icon: 'sun', rainDays: 1 },
                    { name: 'Tem', avgHigh: 34, avgLow: 23, icon: 'sun', rainDays: 0 }, { name: 'Ağu', avgHigh: 34, avgLow: 23, icon: 'sun', rainDays: 0 },
                    { name: 'Eyl', avgHigh: 30, avgLow: 19, icon: 'sun', rainDays: 1 }, { name: 'Eki', avgHigh: 25, avgLow: 15, icon: 'cloudsun', rainDays: 4 },
                    { name: 'Kas', avgHigh: 20, avgLow: 11, icon: 'cloud', rainDays: 8 }, { name: 'Ara', avgHigh: 16, avgLow: 8, icon: 'cloud', rainDays: 11 }
                ]
            }
        },
        {
            type: 'reviews', data: {
                label: c.reviewLabel, heading: c.reviewH, source: 'Booking.com', overallRating: 8.7, reviewCount: 1200, items: [
                    { name: "Ahmet Y.", country: "🇹🇷", rating: 9.2, text: "Muhteşem bir tatil deneyimi. Personel çok ilgili.", date: "Ağustos 2025" },
                    { name: "Maria S.", country: "🇩🇪", rating: 9.0, text: "Beautiful resort with amazing sea views.", date: "July 2025" },
                    { name: "John D.", country: "🇬🇧", rating: 8.5, text: "Great all-inclusive package. Kids loved the pool.", date: "June 2025" }
                ]
            }
        },
        { type: 'map', data: { lat: 37.091832, lng: 27.4824998, zoom: 15 } },
    ]
}

module.exports = { seedPage, homeWidgets }
