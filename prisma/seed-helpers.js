const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Helper: upsert a page and its widgets
async function seedPage(slug, locale, title, widgets) {
    // Upsert the page
    const page = await prisma.page.upsert({
        where: { slug_locale: { slug, locale } },
        update: { title },
        create: { slug, locale, title },
    })

    // Delete old widgets for this page
    await prisma.widget.deleteMany({ where: { pageId: page.id } })

    // Create new widgets
    for (let i = 0; i < widgets.length; i++) {
        const w = widgets[i]
        await prisma.widget.create({
            data: {
                pageId: page.id,
                type: w.type,
                data: JSON.stringify(w.data),
                order: w.order ?? (i + 1),
            },
        })
    }

    console.log(`  ✅ ${slug}/${locale} — ${widgets.length} widgets`)
}

// Seed helper: homepage widgets per locale
// These match the EXACT production section order and design

function homeWidgets(locale) {
    const t = {
        tr: {
            // Hero
            badge: "Bodrum'un İncisi", h1a: "Ege'nin Mavi", h1b: "Rüyası",
            sub: "Doğanın kalbinde, lüksün ve huzurun buluştuğu nokta.",
            sub2: "Evinize, Blue Dreams'e hoş geldiniz.",
            btn1: "Odaları Keşfet", btn2: "Tanıtım Filmi", scroll: "Keşfet",
            // About statement
            aboutLabel: "Blue Dreams Deneyimi",
            aboutParts: [
                { text: "Ege'nin kıyısında " }, { text: "sizin yeriniz", accent: true },
                { text: ", mevsimlerin ritmiyle hazırlanan " }, { text: "eşsiz lezzetler", accent: true },
                { text: " ve bizim hikayemizin " }, { text: "sizin hikayenizle", accent: true },
                { text: " buluştuğu nokta." }
            ],
            // Category cards
            cards: [
                { title: "ODALAR", subtitle: "Bodrum'un kalbinde tasarım odalar", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg", href: "/odalar" },
                { title: "RESTORAN & BAR", subtitle: "Gerçek bir gastronomi deneyimi", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg", href: "/restoran" },
                { title: "AKTİVİTELER", subtitle: "Size özel anlar ve eğlence", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg", href: "/spa" }
            ],
            // Experience blocks
            blocks: [
                {
                    label: "Doğa & Konfor", h1: "Doğa ile", h2: "bütünleşin",
                    text: "Torba'nın çam ormanlarıyla kaplı tepelerinde, Ege'nin turkuaz sularına nazır bir konum. Müstakil girişli odalarımız ve doğal mimarimiz ile kalabalıktan uzak, kendinizle baş başa kalabileceğiniz özel bir yaşam alanı sunuyoruz.",
                    buttonText: "Odaları Keşfet", buttonUrl: "/odalar",
                    image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg",
                    bgColor: "sand", buttonColor: "gold", reverse: false
                },
                {
                    label: "Gastronomi", h1: "Taze. Yerel.", h2: "Sürdürülebilir.",
                    text: "Blue Dreams mutfağında her tabak bir hikaye anlatır. Yerel üreticilerden temin edilen taze Ege otları, günlük deniz ürünleri ve ödüllü şeflerimizin modern yorumlarıyla hazırlanan A la Carte restoranlarımızda gerçek bir lezzet yolculuğuna çıkın.",
                    buttonText: "Lezzetleri Tat", buttonUrl: "/restoran",
                    image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg",
                    detailImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg",
                    bgColor: "white", buttonColor: "orange", reverse: true
                },
                {
                    label: "İyi Hisset", h1: "Rahatla. Yenilen.", h2: "Keyfini Çıkar.",
                    text: "Sonsuzluk havuzumuzda gün batımını izlerken veya Spa merkezimizin dingin atmosferinde ruhunuzu dinlendirirken zamanın yavaşladığını hissedeceksiniz. Türk hamamı ritüelleri ve masaj terapileri ile kendinizi şımartın.",
                    buttonText: "Spa & Wellness", buttonUrl: "/spa",
                    image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg",
                    bgColor: "cream", buttonColor: "brand", reverse: false
                }
            ],
            // Local guide
            localGuide: {
                badge: "AI Concierge Selection",
                heading: "Keşfet &", headingAccent: "Deneyimle",
                description: "Yapay zeka asistanımız Blue Concierge tarafından, ilgi alanlarınıza ve mevsime özel olarak derlenen Bodrum rotaları ve otel içi etkinlik takvimi.",
                attractionsLabel: "Çevrede Yapılabilecekler", attractionsLinkText: "Tüm Rotaları Gör",
                attractions: [
                    { title: "Bodrum Kalesi & Sualtı Müzesi", distance: "10 km", description: "St. John Şövalyeleri tarafından inşa edilen tarihi kale ve dünyanın en önemli sualtı arkeoloji müzelerinden biri.", image: "https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png", tag: "Tarih & Kültür" },
                    { title: "Yalıkavak Marina", distance: "18 km", description: "Dünya markaları, gurme restoranlar ve lüks yatların buluşma noktası. Alışveriş ve gece hayatının kalbi.", image: "https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png", tag: "Lüks Yaşam" },
                    { title: "Antik Tiyatro", distance: "9 km", description: "M.Ö. 4. yüzyıldan kalma, Halikarnassos'un görkemli yapısı. Eşsiz Bodrum manzarasına hakim bir konumda.", image: "https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg", tag: "Manzara" }
                ],
                eventsLabel: "Yaklaşan Etkinlikler", eventsLinkText: "Takvimi İncele",
                events: [
                    { day: "15", month: "TEM", title: "Sunset Jazz Sessions", time: "19:30 - 22:00", location: "Pier Bar", description: "Ege gün batımına karşı saksafon ve kontrbasın büyüleyici uyumu.", icon: "music" },
                    { day: "16", month: "TEM", title: "Ege Otları & Gastronomi Atölyesi", time: "14:00 - 16:00", location: "La Gondola Garden", description: "Şefimiz ile yerel otları tanıyın ve sağlıklı Ege mezeleri hazırlamayı öğrenin.", icon: "utensils" },
                    { day: "Her", month: "GÜN", title: "Morning Flow Yoga", time: "08:00 - 09:00", location: "Sonsuzluk Havuzu Terası", description: "Güne zinde başlamak için profesyonel eğitmenler eşliğinde yoga seansı.", icon: "sun" }
                ]
            },
            // Reviews
            reviewsData: {
                label: "Misafir Yorumları",
                heading: "Sizden Gelen", headingAccent: "Güzel Sözler",
                description: "Gerçek deneyimler ve dürüst kelimeler. Misafirlerimizin Blue Dreams Resort'taki konaklamalarını nasıl deneyimlediklerini keşfedin.",
                bookingScore: "9.4", bookingLabel: "Booking.com Puanı",
                buttonText: "Tüm Yorumları Oku", buttonUrl: "https://www.google.com/maps",
                reviews: [
                    { author: "Ayşe Yılmaz", text: "Balayımız için tercih ettik ve her anından keyif aldık. Özellikle sonsuzluk havuzundaki gün batımı manzarası büyüleyiciydi. Personel çok ilgili ve güleryüzlü.", rating: 5 },
                    { author: "Caner Erkin", text: "Torba'daki en iyi konum. Özel plajı tertemiz ve deniz kristal berraklığında. Ana restorandaki yemek çeşitliliği etkileyiciydi, kesinlikle tavsiye ederim.", rating: 5 },
                    { author: "Selin Demir", text: "Ailemle harika bir hafta geçirdik. Çocuklar için aktiviteler yeterliydi, biz de spa merkezinde dinlenme fırsatı bulduk. Kesinlikle tekrar geleceğiz.", rating: 5 }
                ],
                sourceLabel: "Google Yorumu"
            },
            // Sustainability
            sustainability: {
                heading: "Sürdürülebilirlik", headingAccent: "Taahhüdümüz",
                text: "Yaşadığımız doğayı seviyoruz ve sorumluluk bilinciyle hareket ediyoruz. Blue Dreams Resort olarak, plastik kullanımını azaltıyor, enerji verimliliğini artırıyor ve yerel ekosistemi korumak için çalışıyoruz. Bu sadece bir trend değil, bir zihniyet.",
                buttonText: "Nasıl Yapıyoruz?",
                backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg"
            },
            // Location map
            locationMap: {
                lat: 37.091832, lng: 27.4824998, zoom: 17,
                label: "Konum", title: "Blue Dreams Resort",
                description: "Ege'nin en güzel koylarından biri olan Torba Zeytinli Kahve Mevkii'nde, denize sıfır konumda sizleri bekliyoruz.",
                address: "Torba Mahallesi, Herodot Bulvarı No:11\nBodrum / MUĞLA",
                directionsText: "Yol Tarifi Al"
            },
            // CTA
            ctaHeading: "%40'a varan özel tekliflerinize ulaşın",
            ctaText: "Sizin için sunduğumuz en iyi teklifi almak için müşteri temsilcilerimiz sizi bekliyor.",
            ctaBtn: "Bizi Arayın"
        },
        en: {
            badge: "Pearl of Bodrum", h1a: "Aegean Blue", h1b: "Dream",
            sub: "Where luxury and tranquility meet in the heart of nature.",
            sub2: "Welcome to your home, Blue Dreams.",
            btn1: "Explore Rooms", btn2: "Promo Video", scroll: "Discover",
            aboutLabel: "Blue Dreams Experience",
            aboutParts: [
                { text: "Your place " }, { text: "on the Aegean coast", accent: true },
                { text: ", unique flavors prepared with " }, { text: "the rhythm of seasons", accent: true },
                { text: " and where our story " }, { text: "meets yours", accent: true }, { text: "." }
            ],
            cards: [
                { title: "ROOMS", subtitle: "Designer rooms in the heart of Bodrum", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg", href: "/odalar" },
                { title: "RESTAURANT & BAR", subtitle: "A true gastronomic experience", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg", href: "/restoran" },
                { title: "ACTIVITIES", subtitle: "Special moments and entertainment", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg", href: "/spa" }
            ],
            blocks: [
                { label: "Nature & Comfort", h1: "Become one with", h2: "nature", text: "On the pine-covered hills of Torba, overlooking the turquoise waters of the Aegean. Our detached rooms and natural architecture offer a private living space away from the crowds.", buttonText: "Explore Rooms", buttonUrl: "/odalar", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", bgColor: "sand", buttonColor: "gold", reverse: false },
                { label: "Gastronomy", h1: "Fresh. Local.", h2: "Sustainable.", text: "Every dish in Blue Dreams kitchen tells a story. Embark on a true culinary journey at our A la Carte restaurants.", buttonText: "Taste the Flavors", buttonUrl: "/restoran", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", detailImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", bgColor: "white", buttonColor: "orange", reverse: true },
                { label: "Feel Good", h1: "Relax. Rejuvenate.", h2: "Enjoy.", text: "Feel time slow down while watching the sunset from our infinity pool or unwinding in the serene atmosphere of our Spa center.", buttonText: "Spa & Wellness", buttonUrl: "/spa", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", bgColor: "cream", buttonColor: "brand", reverse: false }
            ],
            localGuide: {
                badge: "AI Concierge Selection", heading: "Discover &", headingAccent: "Experience", description: "Bodrum routes and hotel event calendar curated by our AI assistant Blue Concierge, tailored to your interests and the season.", attractionsLabel: "Things to Do Nearby", attractionsLinkText: "See All Routes", attractions: [
                    { title: "Bodrum Castle & Underwater Museum", distance: "10 km", description: "Historic castle built by Knights of St. John and one of the world's most important underwater archaeology museums.", image: "https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png", tag: "History & Culture" },
                    { title: "Yalıkavak Marina", distance: "18 km", description: "Meeting point of world brands, gourmet restaurants and luxury yachts.", image: "https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png", tag: "Luxury" },
                    { title: "Ancient Theatre", distance: "9 km", description: "Dating back to the 4th century BC, the magnificent structure of Halicarnassus.", image: "https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg", tag: "Scenic" }
                ], eventsLabel: "Upcoming Events", eventsLinkText: "View Calendar", events: [
                    { day: "15", month: "JUL", title: "Sunset Jazz Sessions", time: "19:30 - 22:00", location: "Pier Bar", description: "Enchanting harmony of saxophone and double bass against the Aegean sunset.", icon: "music" },
                    { day: "16", month: "JUL", title: "Aegean Herbs & Gastronomy Workshop", time: "14:00 - 16:00", location: "La Gondola Garden", description: "Discover local herbs and learn to prepare healthy Aegean mezes.", icon: "utensils" },
                    { day: "Every", month: "DAY", title: "Morning Flow Yoga", time: "08:00 - 09:00", location: "Infinity Pool Terrace", description: "Yoga session with professional instructors to start the day refreshed.", icon: "sun" }
                ]
            },
            reviewsData: {
                label: "Guest Reviews", heading: "Kind Words", headingAccent: "From You", description: "Real experiences and honest words. Discover how our guests experienced their stay at Blue Dreams Resort.", bookingScore: "9.4", bookingLabel: "Booking.com Score", buttonText: "Read All Reviews", buttonUrl: "https://www.google.com/maps", reviews: [
                    { author: "Ayşe Yılmaz", text: "We chose it for our honeymoon and enjoyed every moment. The sunset view from the infinity pool was breathtaking.", rating: 5 },
                    { author: "Caner Erkin", text: "Best location in Torba. The private beach is spotless and the sea is crystal clear.", rating: 5 },
                    { author: "Selin Demir", text: "We had a wonderful week with our family. Activities for kids were sufficient.", rating: 5 }
                ], sourceLabel: "Google Review"
            },
            sustainability: { heading: "Sustainability", headingAccent: "Commitment", text: "We love the nature we live in and act with responsibility. As Blue Dreams Resort, we reduce plastic use, increase energy efficiency and work to protect the local ecosystem.", buttonText: "How We Do It", backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg" },
            locationMap: { lat: 37.091832, lng: 27.4824998, zoom: 17, label: "Location", title: "Blue Dreams Resort", description: "We await you at one of the most beautiful coves of the Aegean, in Torba, right on the seafront.", address: "Torba Mahallesi, Herodot Bulvarı No:11\nBodrum / MUĞLA", directionsText: "Get Directions" },
            ctaHeading: "Up to 40% off special offers", ctaText: "Our customer representatives are waiting to present the best offer for you.", ctaBtn: "Call Us"
        },
        de: {
            badge: "Perle von Bodrum", h1a: "Ägäischer Blauer", h1b: "Traum",
            sub: "Wo Luxus und Ruhe im Herzen der Natur aufeinandertreffen.",
            sub2: "Willkommen in Ihrem Zuhause, Blue Dreams.",
            btn1: "Zimmer Entdecken", btn2: "Promovideo", scroll: "Entdecken",
            aboutLabel: "Blue Dreams Erlebnis",
            aboutParts: [
                { text: "Ihr Platz " }, { text: "an der Ägäisküste", accent: true },
                { text: ", einzigartige Aromen " }, { text: "im Rhythmus der Jahreszeiten", accent: true },
                { text: " und wo unsere Geschichte " }, { text: "auf Ihre trifft", accent: true }, { text: "." }
            ],
            cards: [
                { title: "ZIMMER", subtitle: "Designerzimmer im Herzen von Bodrum", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg", href: "/odalar" },
                { title: "RESTAURANT & BAR", subtitle: "Ein wahres gastronomisches Erlebnis", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg", href: "/restoran" },
                { title: "AKTIVITÄTEN", subtitle: "Besondere Momente und Unterhaltung", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg", href: "/spa" }
            ],
            blocks: [
                { label: "Natur & Komfort", h1: "Eins werden mit", h2: "der Natur", text: "Auf den kiefernbedeckten Hügeln von Torba, mit Blick auf das türkisfarbene Wasser der Ägäis.", buttonText: "Zimmer Entdecken", buttonUrl: "/odalar", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", bgColor: "sand", buttonColor: "gold", reverse: false },
                { label: "Gastronomie", h1: "Frisch. Lokal.", h2: "Nachhaltig.", text: "Jedes Gericht in der Blue Dreams Küche erzählt eine Geschichte.", buttonText: "Geschmack Erleben", buttonUrl: "/restoran", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", detailImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", bgColor: "white", buttonColor: "orange", reverse: true },
                { label: "Wohlbefinden", h1: "Entspannen. Erneuern.", h2: "Genießen.", text: "Spüren Sie, wie die Zeit langsamer wird am Infinity-Pool.", buttonText: "Spa & Wellness", buttonUrl: "/spa", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", bgColor: "cream", buttonColor: "brand", reverse: false }
            ],
            localGuide: {
                badge: "AI Concierge Auswahl", heading: "Entdecken &", headingAccent: "Erleben", description: "Von unserem KI-Assistenten Blue Concierge kuratierte Bodrum-Routen und Hotelveranstaltungskalender.", attractionsLabel: "Aktivitäten in der Umgebung", attractionsLinkText: "Alle Routen", attractions: [
                    { title: "Burg von Bodrum", distance: "10 km", description: "Historische Burg der Johanniter und eines der wichtigsten Unterwasser-Archäologie-Museen.", image: "https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png", tag: "Geschichte" },
                    { title: "Yalıkavak Marina", distance: "18 km", description: "Treffpunkt von Weltmarken, Gourmetrestaurants und Luxusyachten.", image: "https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png", tag: "Luxus" },
                    { title: "Antikes Theater", distance: "9 km", description: "Aus dem 4. Jahrhundert v. Chr., die prächtige Struktur von Halikarnassos.", image: "https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg", tag: "Aussicht" }
                ], eventsLabel: "Kommende Veranstaltungen", eventsLinkText: "Kalender Ansehen", events: [
                    { day: "15", month: "JUL", title: "Sunset Jazz Sessions", time: "19:30 - 22:00", location: "Pier Bar", description: "Bezaubernde Harmonie von Saxophon und Kontrabass.", icon: "music" },
                    { day: "16", month: "JUL", title: "Ägäische Kräuter Workshop", time: "14:00 - 16:00", location: "La Gondola Garden", description: "Entdecken Sie lokale Kräuter und lernen Sie ägäische Mezes.", icon: "utensils" },
                    { day: "Jeden", month: "TAG", title: "Morning Flow Yoga", time: "08:00 - 09:00", location: "Infinity Pool Terrasse", description: "Yoga mit professionellen Trainern.", icon: "sun" }
                ]
            },
            reviewsData: {
                label: "Gästebewertungen", heading: "Nette Worte", headingAccent: "Von Ihnen", description: "Echte Erfahrungen und ehrliche Worte.", bookingScore: "9.4", bookingLabel: "Booking.com Bewertung", buttonText: "Alle Bewertungen Lesen", buttonUrl: "https://www.google.com/maps", reviews: [
                    { author: "Ayşe Yılmaz", text: "Wir haben es für unsere Flitterwochen gewählt und jeden Moment genossen.", rating: 5 },
                    { author: "Caner Erkin", text: "Beste Lage in Torba. Der Privatstrand ist makellos.", rating: 5 },
                    { author: "Selin Demir", text: "Wir hatten eine wunderbare Woche mit unserer Familie.", rating: 5 }
                ], sourceLabel: "Google Bewertung"
            },
            sustainability: { heading: "Nachhaltigkeit", headingAccent: "Engagement", text: "Wir lieben die Natur und handeln verantwortungsbewusst. Als Blue Dreams Resort reduzieren wir den Plastikverbrauch und schützen das lokale Ökosystem.", buttonText: "Wie Wir Es Machen", backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg" },
            locationMap: { lat: 37.091832, lng: 27.4824998, zoom: 17, label: "Standort", title: "Blue Dreams Resort", description: "Wir erwarten Sie in einer der schönsten Buchten der Ägäis, in Torba, direkt am Meer.", address: "Torba Mahallesi, Herodot Bulvarı No:11\nBodrum / MUĞLA", directionsText: "Wegbeschreibung" },
            ctaHeading: "Bis zu 40% Rabatt auf Sonderangebote", ctaText: "Unsere Kundenberater warten darauf, Ihnen das beste Angebot zu präsentieren.", ctaBtn: "Rufen Sie Uns An"
        },
        ru: {
            badge: "Жемчужина Бодрума", h1a: "Эгейская Голубая", h1b: "Мечта",
            sub: "Где роскошь и спокойствие встречаются в сердце природы.",
            sub2: "Добро пожаловать домой, в Blue Dreams.",
            btn1: "Номера", btn2: "Промо видео", scroll: "Откройте",
            aboutLabel: "Опыт Blue Dreams",
            aboutParts: [
                { text: "Ваше место " }, { text: "на побережье Эгейского моря", accent: true },
                { text: ", уникальные вкусы " }, { text: "в ритме сезонов", accent: true },
                { text: " и где наша история " }, { text: "встречается с вашей", accent: true }, { text: "." }
            ],
            cards: [
                { title: "НОМЕРА", subtitle: "Дизайнерские номера в сердце Бодрума", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg", href: "/odalar" },
                { title: "РЕСТОРАН И БАР", subtitle: "Настоящий гастрономический опыт", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg", href: "/restoran" },
                { title: "АКТИВНОСТИ", subtitle: "Особые моменты и развлечения", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg", href: "/spa" }
            ],
            blocks: [
                { label: "Природа и Комфорт", h1: "Станьте единым с", h2: "природой", text: "На покрытых соснами холмах Торбы, с видом на бирюзовые воды Эгейского моря.", buttonText: "Номера", buttonUrl: "/odalar", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", bgColor: "sand", buttonColor: "gold", reverse: false },
                { label: "Гастрономия", h1: "Свежее. Местное.", h2: "Устойчивое.", text: "Каждое блюдо на кухне Blue Dreams рассказывает свою историю.", buttonText: "Попробовать", buttonUrl: "/restoran", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", detailImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", bgColor: "white", buttonColor: "orange", reverse: true },
                { label: "Хорошее Самочувствие", h1: "Расслабьтесь. Обновитесь.", h2: "Наслаждайтесь.", text: "Почувствуйте, как время замедляется у бассейна инфинити.", buttonText: "Спа и Велнес", buttonUrl: "/spa", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", bgColor: "cream", buttonColor: "brand", reverse: false }
            ],
            localGuide: {
                badge: "Выбор AI Консьержа", heading: "Откройте &", headingAccent: "Испытайте", description: "Маршруты по Бодруму и календарь мероприятий отеля от нашего AI-ассистента Blue Concierge.", attractionsLabel: "Чем Заняться Поблизости", attractionsLinkText: "Все Маршруты", attractions: [
                    { title: "Крепость Бодрум", distance: "10 км", description: "Историческая крепость рыцарей Святого Иоанна.", image: "https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png", tag: "История" },
                    { title: "Ялыкавак Марина", distance: "18 км", description: "Мировые бренды, ресторан высокой кухни и роскошные яхты.", image: "https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png", tag: "Роскошь" },
                    { title: "Античный Театр", distance: "9 км", description: "IV век до н.э., величественное сооружение Галикарнаса.", image: "https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg", tag: "Вид" }
                ], eventsLabel: "Предстоящие События", eventsLinkText: "Календарь", events: [
                    { day: "15", month: "ИЮЛ", title: "Sunset Jazz Sessions", time: "19:30 - 22:00", location: "Pier Bar", description: "Волшебная гармония саксофона и контрабаса.", icon: "music" },
                    { day: "16", month: "ИЮЛ", title: "Кулинарный Мастер-класс", time: "14:00 - 16:00", location: "La Gondola Garden", description: "Откройте для себя местные травы.", icon: "utensils" },
                    { day: "Каждый", month: "ДЕНЬ", title: "Morning Flow Yoga", time: "08:00 - 09:00", location: "Терраса бассейна", description: "Йога с профессиональными инструкторами.", icon: "sun" }
                ]
            },
            reviewsData: {
                label: "Отзывы Гостей", heading: "Добрые Слова", headingAccent: "От Вас", description: "Реальные впечатления и честные слова.", bookingScore: "9.4", bookingLabel: "Оценка Booking.com", buttonText: "Все Отзывы", buttonUrl: "https://www.google.com/maps", reviews: [
                    { author: "Айше Йылмаз", text: "Мы выбрали его для медового месяца и наслаждались каждым моментом.", rating: 5 },
                    { author: "Джанер Эркин", text: "Лучшее расположение в Торбе. Частный пляж безупречен.", rating: 5 },
                    { author: "Селин Демир", text: "Прекрасная неделя с семьей. Достаточно развлечений для детей.", rating: 5 }
                ], sourceLabel: "Отзыв Google"
            },
            sustainability: { heading: "Устойчивое", headingAccent: "Развитие", text: "Мы любим природу и действуем ответственно. Blue Dreams Resort сокращает использование пластика и защищает экосистему.", buttonText: "Как Мы Это Делаем", backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg" },
            locationMap: { lat: 37.091832, lng: 27.4824998, zoom: 17, label: "Расположение", title: "Blue Dreams Resort", description: "Мы ждём вас в одной из самых красивых бухт Эгейского моря, в Торбе.", address: "Torba Mahallesi, Herodot Bulvarı No:11\nBodrum / MUĞLA", directionsText: "Проложить Маршрут" },
            ctaHeading: "Скидки до 40% на специальные предложения", ctaText: "Наши консультанты ждут, чтобы предложить лучшую цену.", ctaBtn: "Позвоните Нам"
        }
    }

    const d = t[locale] || t.tr

    return [
        { type: 'hero', order: 1, data: { badge: d.badge, titleLine1: d.h1a, titleLine2: d.h1b, subtitle: d.sub + ' ' + d.sub2, backgroundImage: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg', scrollText: d.scroll, buttons: [{ text: d.btn1, url: `/${locale}/odalar`, style: 'primary' }, { text: d.btn2, url: 'https://youtu.be/Et5yM-tW7_0', style: 'outline', external: true }] } },
        { type: 'about-statement', order: 2, data: { label: d.aboutLabel, headingParts: d.aboutParts } },
        { type: 'category-cards', order: 3, data: { cards: d.cards } },
        { type: 'experience-blocks', order: 4, data: { blocks: d.blocks } },
        { type: 'local-guide', order: 5, data: d.localGuide },
        { type: 'reviews-section', order: 6, data: d.reviewsData },
        { type: 'sustainability', order: 7, data: d.sustainability },
        { type: 'location-map', order: 8, data: d.locationMap },
        { type: 'cta', order: 9, data: { heading: d.ctaHeading, subtitle: d.ctaText, buttonText: d.ctaBtn, buttonUrl: 'tel:+902523371111', background: 'brand' } }
    ]
}

module.exports = { seedPage, homeWidgets }
