/**
 * Pure data module: exports widget arrays for all pages and locales.
 * No PrismaClient dependency — safe for Next.js standalone builds.
 * Content mirrors prisma/seed-helpers.js + prisma/seed-pages.js
 */

type WidgetDef = { type: string; order?: number; data: Record<string, any> }

// ─── HOMEPAGE ────────────────────────────────────────────────
export function homeWidgets(locale: string): WidgetDef[] {
  const tr = {
    badge: "Bodrum'un İncisi", h1a: "Her Güzel Rüya", h1b: "Blue Dreams'te Başlar",
    sub: "Eşsiz doğası, özel sahili, sonsuzluk havuzu ile birlikte 5 havuzu, Ege'nin en güzel gün batımına açılan restoran ve barları ile sizi bekliyor.",
    sub2: "Bodrum'un en güzel koylarından biri olan Torba Zeytinlikahve'de 55.000 m² alan üzerinde doğa ile iç içe.",
    btn1: "Odaları Keşfet", btn2: "Tanıtım Filmi", scroll: "Keşfet",
    aboutLabel: "Otelimizi İnceleyin",
    aboutParts: [{ text: "Doğayla " }, { text: "iç içe yapısı", accent: true }, { text: ", benzersiz manzarası ve gün batımı ile " }, { text: "harika deneyimler", accent: true }, { text: " yaşamaya davetlisiniz." }],
    cards: [
      { title: "CLUB ODALAR", subtitle: "Deniz manzaralı ve doğa ile iç içe", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", href: "/odalar/club" },
      { title: "DELUXE ODALAR", subtitle: "Lüks ve konforun buluşma noktası", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg", href: "/odalar/deluxe" },
      { title: "AİLE SUİTLERİ", subtitle: "Geniş aileler için ideal konaklama", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg", href: "/odalar/aile" },
    ],
    blocks: [
      { label: "Eşsiz Konum", h1: "Bodrum'un", h2: "En Güzel Koyu", text: "Zeytinlikahve mevkiinde, denize sıfır konumda, 700 metre uzunluğunda özel sahil şeridi. İskeleleri ve özel Cabana alanları ile deniz keyfini ayrıcalıklı yaşayın.", buttonText: "Konumu İncele", buttonUrl: "/iletisim", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", bgColor: "sand", buttonColor: "gold", reverse: false },
      { label: "Gastronomi", h1: "Lezzet", h2: "Şöleni", text: "Ana restoranımız ve A'la Carte seçeneklerimiz ile dünya mutfaklarından seçkin lezzetler. Ege'nin taze ürünleri usta şeflerimizin elinde sanata dönüşüyor.", buttonText: "Restoranlar", buttonUrl: "/restoran", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", detailImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", bgColor: "white", buttonColor: "orange", reverse: true },
      { label: "Aktivite & Eğlence", h1: "Sınırsız", h2: "Eğlence", text: "Sonsuzluk havuzu dahil 5 farklı havuz, su parkı ve gün boyu süren aktiviteler.", buttonText: "Aktiviteler", buttonUrl: "/spa", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", bgColor: "cream", buttonColor: "brand", reverse: false },
    ],
    localGuide: {
      badge: "AI Concierge Selection", heading: "Keşfet &", headingAccent: "Deneyimle",
      description: "Yapay zeka asistanımız Blue Concierge tarafından, ilgi alanlarınıza ve mevsime özel olarak derlenen Bodrum rotaları ve otel içi etkinlik takvimi.",
      attractionsLabel: "Çevrede Yapılabilecekler", attractionsLinkText: "Tüm Rotaları Gör",
      attractions: [
        { title: "Bodrum Kalesi & Sualtı Müzesi", distance: "10 km", description: "St. John Şövalyeleri tarafından inşa edilen tarihi kale.", image: "https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png", tag: "Tarih & Kültür" },
        { title: "Yalıkavak Marina", distance: "18 km", description: "Dünya markaları, gurme restoranlar ve lüks yatların buluşma noktası.", image: "https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png", tag: "Lüks Yaşam" },
        { title: "Antik Tiyatro", distance: "9 km", description: "M.Ö. 4. yüzyıldan kalma, Halikarnassos'un görkemli yapısı.", image: "https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg", tag: "Manzara" },
      ],
      eventsLabel: "Yaklaşan Etkinlikler", eventsLinkText: "Takvimi İncele",
      events: [
        { day: "15", month: "TEM", title: "Sunset Jazz Sessions", time: "19:30 - 22:00", location: "Pier Bar", description: "Ege gün batımına karşı saksafon ve kontrbasın büyüleyici uyumu.", icon: "music" },
        { day: "16", month: "TEM", title: "Ege Otları & Gastronomi Atölyesi", time: "14:00 - 16:00", location: "La Gondola Garden", description: "Şefimiz ile yerel otları tanıyın.", icon: "utensils" },
        { day: "Her", month: "GÜN", title: "Morning Flow Yoga", time: "08:00 - 09:00", location: "Sonsuzluk Havuzu Terası", description: "Güne zinde başlamak için yoga.", icon: "sun" },
      ],
    },
    reviewsData: {
      label: "Değerlendirmeler", heading: "Misafirlerimiz", headingAccent: "Neler Dedi?",
      description: "Size en iyi hizmeti verebilmek için sürekli kendimizi geliştiriyoruz.",
      bookingScore: "9.5", bookingLabel: "Misafir Puanı", buttonText: "Tüm Yorumları Oku",
      buttonUrl: "https://www.google.com/maps/place/Blue+Dreams+Resort",
      reviews: [
        { author: "Mehmet Y.", text: "Doğayla iç içe, harika bir tatil deneyimiydi.", rating: 5 },
        { author: "Elena S.", text: "Manzara tek kelimeyle büyüleyici.", rating: 5 },
        { author: "Ahmet K.", text: "Ailece çok rahat ettik.", rating: 5 },
      ],
      sourceLabel: "Google & Tripadvisor",
    },
    sustainability: {
      heading: "Sürdürülebilirlik", headingAccent: "Taahhüdümüz",
      text: "Yaşadığımız doğayı seviyoruz ve sorumluluk bilinciyle hareket ediyoruz.",
      buttonText: "Nasıl Yapıyoruz?",
      backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg",
    },
    locationMap: { lat: 37.091832, lng: 27.4824998, zoom: 17, label: "Konum", title: "Blue Dreams Resort", description: "Torba Mahallesi, Herodot Bulvarı No:11 Bodrum / MUĞLA", address: "Bodrum merkezine 10km, Havalimanına 25km mesafede.", directionsText: "Yol Tarifi Al" },
    ctaHeading: "%40'a varan özel tekliflerinize ulaşın", ctaText: "Sizin için sunduğumuz en iyi teklifi almak için müşteri temsilcilerimiz sizi bekliyor.", ctaBtn: "Bizi Arayın",
  }
  const en = {
    badge: "Pearl of Bodrum", h1a: "Aegean Blue", h1b: "Dream",
    sub: "Where luxury and tranquility meet in the heart of nature.", sub2: "Welcome to your home, Blue Dreams.",
    btn1: "Explore Rooms", btn2: "Promo Video", scroll: "Discover",
    aboutLabel: "Blue Dreams Experience",
    aboutParts: [{ text: "Your place " }, { text: "on the Aegean coast", accent: true }, { text: ", unique flavors prepared with " }, { text: "the rhythm of seasons", accent: true }, { text: " and where our story " }, { text: "meets yours", accent: true }, { text: "." }],
    cards: [
      { title: "ROOMS", subtitle: "Designer rooms in the heart of Bodrum", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg", href: "/odalar" },
      { title: "RESTAURANT & BAR", subtitle: "A true gastronomic experience", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg", href: "/restoran" },
      { title: "ACTIVITIES", subtitle: "Special moments and entertainment", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg", href: "/spa" },
    ],
    blocks: [
      { label: "Nature & Comfort", h1: "Become one with", h2: "nature", text: "On the pine-covered hills of Torba, overlooking turquoise waters.", buttonText: "Explore Rooms", buttonUrl: "/odalar", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", bgColor: "sand", buttonColor: "gold", reverse: false },
      { label: "Gastronomy", h1: "Fresh. Local.", h2: "Sustainable.", text: "Every dish tells a story. A la Carte restaurants await.", buttonText: "Taste the Flavors", buttonUrl: "/restoran", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", detailImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", bgColor: "white", buttonColor: "orange", reverse: true },
      { label: "Feel Good", h1: "Relax. Rejuvenate.", h2: "Enjoy.", text: "Feel time slow down at the infinity pool.", buttonText: "Spa & Wellness", buttonUrl: "/spa", image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", bgColor: "cream", buttonColor: "brand", reverse: false },
    ],
    localGuide: {
      badge: "AI Concierge Selection", heading: "Discover &", headingAccent: "Experience",
      description: "Routes and events curated by our AI assistant Blue Concierge.",
      attractionsLabel: "Things to Do Nearby", attractionsLinkText: "See All Routes",
      attractions: [
        { title: "Bodrum Castle & Underwater Museum", distance: "10 km", description: "Historic castle built by Knights of St. John.", image: "https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png", tag: "History & Culture" },
        { title: "Yalıkavak Marina", distance: "18 km", description: "World brands, gourmet restaurants and luxury yachts.", image: "https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png", tag: "Luxury" },
        { title: "Ancient Theatre", distance: "9 km", description: "Dating back to 4th century BC.", image: "https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg", tag: "Scenic" },
      ],
      eventsLabel: "Upcoming Events", eventsLinkText: "View Calendar",
      events: [
        { day: "15", month: "JUL", title: "Sunset Jazz Sessions", time: "19:30 - 22:00", location: "Pier Bar", description: "Enchanting harmony of saxophone.", icon: "music" },
        { day: "16", month: "JUL", title: "Aegean Herbs Workshop", time: "14:00 - 16:00", location: "La Gondola Garden", description: "Discover local herbs.", icon: "utensils" },
        { day: "Every", month: "DAY", title: "Morning Flow Yoga", time: "08:00 - 09:00", location: "Infinity Pool Terrace", description: "Yoga session to start the day refreshed.", icon: "sun" },
      ],
    },
    reviewsData: {
      label: "Guest Reviews", heading: "Kind Words", headingAccent: "From You",
      description: "Real experiences and honest words.",
      bookingScore: "9.4", bookingLabel: "Booking.com Score", buttonText: "Read All Reviews",
      buttonUrl: "https://www.google.com/maps",
      reviews: [
        { author: "Ayşe Yılmaz", text: "We chose it for our honeymoon and enjoyed every moment.", rating: 5 },
        { author: "Caner Erkin", text: "Best location in Torba.", rating: 5 },
        { author: "Selin Demir", text: "Wonderful week with our family.", rating: 5 },
      ],
      sourceLabel: "Google Review",
    },
    sustainability: { heading: "Sustainability", headingAccent: "Commitment", text: "We love the nature we live in and act with responsibility.", buttonText: "How We Do It", backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg" },
    locationMap: { lat: 37.091832, lng: 27.4824998, zoom: 17, label: "Location", title: "Blue Dreams Resort", description: "We await you in Torba, right on the seafront.", address: "Torba Mahallesi, Herodot Bulvarı No:11\nBodrum / MUĞLA", directionsText: "Get Directions" },
    ctaHeading: "Up to 40% off special offers", ctaText: "Our customer representatives are waiting for you.", ctaBtn: "Call Us",
  }

  const t: Record<string, typeof tr> = { tr, en }
  const d = t[locale] || tr

  return [
    { type: 'hero', order: 1, data: { badge: d.badge, titleLine1: d.h1a, titleLine2: d.h1b, subtitle: d.sub + ' ' + d.sub2, backgroundImage: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg', scrollText: d.scroll, buttons: [{ text: d.btn1, url: `/${locale}/odalar`, style: 'primary' }, { text: d.btn2, url: 'https://youtu.be/Et5yM-tW7_0', style: 'outline', external: true }] } },
    { type: 'about-statement', order: 2, data: { label: d.aboutLabel, headingParts: d.aboutParts } },
    { type: 'category-cards', order: 3, data: { cards: d.cards } },
    { type: 'experience-blocks', order: 4, data: { blocks: d.blocks } },
    { type: 'local-guide', order: 5, data: d.localGuide },
    { type: 'reviews-section', order: 6, data: d.reviewsData },
    { type: 'sustainability', order: 7, data: d.sustainability },
    { type: 'location-map', order: 8, data: d.locationMap },
    { type: 'cta', order: 9, data: { heading: d.ctaHeading, subtitle: d.ctaText, buttonText: d.ctaBtn, buttonUrl: 'tel:+902523371111', background: 'brand' } },
  ]
}

// ─── ABOUT PAGE ──────────────────────────────────────────────
export function aboutWidgets(locale: string): WidgetDef[] {
  const tr = { title: 'Hakkımızda', sub: 'Blue Dreams Resort hikayesi', bc: 'Hakkımızda', storyLabel: 'Hikayemiz', storyH: '25 Yıllık', storyHA: 'Tutku', p1: "Blue Dreams Resort, 1998 yılından bu yana Bodrum'un Torba koyunda misafirlerini ağırlamaktadır.", p2: "55.000 m²'lik alanda konumlanan tesisimiz, 340'ı aşkın odasıyla her yıl binlerce misafire ev sahipliği yapmaktadır.", p3: "Doğa ile iç içe, modern konforu tarihsel dokuyla harmanlayan anlayışımızla, unutulmaz tatil deneyimleri sunuyoruz.", yrs: 'Yıllık Tecrübe', valLabel: 'Değerlerimiz', valH: 'Temel İlkelerimiz', v1t: 'Doğallık', v1d: 'Ege doğasıyla uyum içinde yaşam', v2t: 'Mükemmellik', v2d: 'Her detayda kusursuz hizmet anlayışı', v3t: 'Sürdürülebilirlik', v3d: 'Gelecek nesiller için doğayı koruma', ctaH: 'Sizi Bekliyoruz', ctaS: 'Hayalinizdeki tatili birlikte planlayalım.', ctaB1: 'İletişim', ctaB2: 'Online Rezervasyon', star: 'Otel Sınıfı', rooms: 'Oda Sayısı', year: 'Kuruluş Yılı', area: 'Alan (m²)' }
  const en = { title: 'About Us', sub: 'The Blue Dreams Resort story', bc: 'About Us', storyLabel: 'Our Story', storyH: '25 Years of', storyHA: 'Passion', p1: "Blue Dreams Resort has been welcoming guests in Torba Bay since 1998.", p2: "Spread across 55,000 m², with over 340 rooms.", p3: "We offer unforgettable holiday experiences blending modern comfort with nature.", yrs: 'Years of Experience', valLabel: 'Our Values', valH: 'Core Principles', v1t: 'Naturalness', v1d: 'Living in harmony with Aegean nature', v2t: 'Excellence', v2d: 'Flawless service in every detail', v3t: 'Sustainability', v3d: 'Protecting nature for future generations', ctaH: 'We Await You', ctaS: 'Let us plan your dream vacation together.', ctaB1: 'Contact Us', ctaB2: 'Online Booking', star: 'Hotel Class', rooms: 'Total Rooms', year: 'Founded', area: 'Area (m²)' }
  const t: Record<string, typeof tr> = { tr, en }
  const c = t[locale] || tr
  return [
    { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/hakkimizda` }] } },
    { type: 'text-image', data: { label: c.storyLabel, heading: c.storyH, headingAccent: c.storyHA, paragraphs: [c.p1, c.p2, c.p3], image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", imageAlt: "Blue Dreams Resort", badge: { value: "25+", label: c.yrs } } },
    { type: 'stats', data: { items: [{ icon: 'award', value: '5★', label: c.star }, { icon: 'users', value: '340+', label: c.rooms }, { icon: 'calendar', value: '1998', label: c.year }, { icon: 'mappin', value: '55K', label: c.area }] } },
    { type: 'icon-grid', data: { label: c.valLabel, heading: c.valH, items: [{ icon: '🌊', title: c.v1t, description: c.v1d }, { icon: '✨', title: c.v2t, description: c.v2d }, { icon: '🌿', title: c.v3t, description: c.v3d }] } },
    { type: 'cta', data: { heading: c.ctaH, subtitle: c.ctaS, backgroundColor: 'white', buttons: [{ text: c.ctaB1, url: `/${locale}/iletisim`, variant: 'primary' }, { text: c.ctaB2, url: "https://new.bluedreamsresort.com/tr/booking", variant: 'outline' }] } },
  ]
}

// ─── ROOMS PAGE ──────────────────────────────────────────────
export function roomsWidgets(locale: string): WidgetDef[] {
  const tr = { title: 'Odalar & Süitler', sub: 'Her bütçeye uygun konfor', bc: 'Odalar', badge: 'Konaklama', h: 'Konfor ve', ha: 'Zerafet', intro: "340'ı aşkın odamız ile size en uygun konaklama seçeneğini sunuyoruz.", ctaT: 'Hayalinizdeki Odayı Bulun', ctaS: 'Online rezervasyon ile en iyi fiyat garantisi', ctaB: 'Hemen Rezervasyon Yap' }
  const en = { title: 'Rooms & Suites', sub: 'Comfort for every budget', bc: 'Rooms', badge: 'Accommodation', h: 'Comfort and', ha: 'Elegance', intro: 'With over 340 rooms, we offer the most suitable accommodation.', ctaT: 'Find Your Dream Room', ctaS: 'Best price guarantee with online booking', ctaB: 'Book Now' }
  const t: Record<string, typeof tr> = { tr, en }
  const c = t[locale] || tr
  return [
    { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/odalar` }] } },
    { type: 'text-block', data: { label: c.badge, heading: c.h, headingAccent: c.ha, content: c.intro, backgroundColor: 'white' } },
    { type: 'room-list', data: {} },
    { type: 'cta', data: { heading: c.ctaT, subtitle: c.ctaS, backgroundColor: 'dark', buttons: [{ text: c.ctaB, url: "https://new.bluedreamsresort.com/tr/booking", variant: 'white' }] } },
  ]
}

// ─── RESTAURANT PAGE ─────────────────────────────────────────
export function restaurantWidgets(locale: string): WidgetDef[] {
  const tr = { title: 'Restoran & Bar', sub: 'Eşsiz lezzetler', bc: 'Restoran', badge: 'Gastronomi', h: 'Tatlar ve', ha: 'Lezzetler', intro: 'Her damak zevkine hitap eden restoranlarımız ve barlarımız.', allH: 'Her Şey Dahil', allS: "Zengin açık büfe ve a'la carte seçenekleriyle gastronomi deneyimi.", allB1: 'WhatsApp', allB2: 'Odaları Gör' }
  const en = { title: 'Restaurant & Bar', sub: 'Unique flavors', bc: 'Restaurant', badge: 'Gastronomy', h: 'Tastes and', ha: 'Flavors', intro: 'Our restaurants and bars cater to every palate.', allH: 'All Inclusive', allS: 'Gastronomy experience with rich buffet and a la carte options.', allB1: 'WhatsApp', allB2: 'View Rooms' }
  const t: Record<string, typeof tr> = { tr, en }
  const c = t[locale] || tr
  return [
    { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/restoran` }] } },
    { type: 'text-block', data: { label: c.badge, heading: c.h, headingAccent: c.ha, content: c.intro, backgroundColor: 'white' } },
    { type: 'image-grid', data: { items: [
      { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", title: "Blue Restaurant", badge: "Ana Restoran", description: "Zengin açık büfe kahvaltı, öğle ve akşam yemekleri", meta: "07:00 - 22:00", meta2: "Dünya Mutfağı" },
      { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", title: "Italian A'la Carte", badge: "A'la Carte", description: "Otantik İtalyan lezzetleri", meta: "19:00 - 22:00", meta2: "İtalyan" },
      { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", title: "Beach Bar", badge: "Bar", description: "Tropikal kokteyller ve hafif atıştırmalıklar", meta: "10:00 - 24:00" },
      { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", title: "Sunset Bar", badge: "Bar", description: "Gün batımı eşliğinde özel kokteyller", meta: "17:00 - 01:00" },
    ], variant: 'overlay', columns: 2 } },
    { type: 'cta', data: { heading: c.allH, subtitle: c.allS, backgroundColor: 'dark', buttons: [{ text: c.allB1, url: "https://wa.me/902523371111", variant: 'white' }, { text: c.allB2, url: `/${locale}/odalar`, variant: 'white-outline' }] } },
  ]
}

// ─── SPA PAGE ────────────────────────────────────────────────
export function spaWidgets(locale: string): WidgetDef[] {
  const isEn = locale === 'en'
  return [
    { type: 'page-header', data: { title: 'Spa & Wellness', subtitle: isEn ? 'Naya Spa — your haven of peace' : 'Naya Spa ile huzurun adresi', backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", breadcrumbs: [{ label: 'Spa', href: `/${locale}/spa` }] } },
    { type: 'text-image', data: { label: 'Naya Spa', heading: isEn ? 'Body and' : 'Beden ve', headingAccent: isEn ? 'Soul Balance' : 'Ruh Dengesi', paragraphs: [isEn ? "Naya Spa offers unique massage programs inspired by ancient Anatolian healing rituals." : "Naya Spa, antik Anadolu şifa ritüellerinden ilham alan benzersiz masaj programları sunar."], image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg", imageAlt: "Naya Spa", buttons: [{ text: isEn ? 'Book Appointment' : 'Randevu Al', url: "https://wa.me/905495167801", variant: 'primary' }] } },
    { type: 'image-grid', data: { label: isEn ? 'Massage Options' : 'Masaj Seçenekleri', heading: isEn ? 'Featured Treatments' : 'Öne Çıkan Bakımlar', items: [
      { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", title: "Bali Masajı", description: "Endonezya kökenli derin doku masajı", meta: "60 dk" },
      { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", title: "Aromaterapi", description: "Uçucu yağlarla rahatlatıcı masaj", meta: "45 dk" },
      { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", title: "Hot Stone", description: "Sıcak taş terapi ile derin gevşeme", meta: "60 dk" },
    ], variant: 'card', columns: 3 } },
    { type: 'icon-grid', data: { heading: isEn ? 'Why Naya Spa?' : 'Neden Naya Spa?', backgroundColor: 'dark', items: [{ icon: '🌿', title: isEn ? 'Organic Products' : 'Organik Ürünler', description: isEn ? 'Natural organic care products' : 'Doğal ve organik bakım ürünleri' }, { icon: '💆', title: isEn ? 'Expert Therapists' : 'Uzman Terapistler', description: isEn ? 'Certified professional team' : 'Sertifikalı profesyonel ekip' }, { icon: '🕊️', title: isEn ? 'Peaceful Atmosphere' : 'Huzurlu Atmosfer', description: isEn ? 'Spa in harmony with nature' : 'Doğa ile iç içe spa ortamı' }] } },
    { type: 'cta', data: { heading: isEn ? 'Treat Yourself' : 'Kendinize Bir İyilik Yapın', subtitle: isEn ? 'Book your massage at Naya Spa.' : "Naya Spa'da masaj için randevunuzu alın.", backgroundColor: 'gradient', buttons: [{ text: isEn ? 'Book Now' : 'Randevu Al', url: "https://wa.me/905495167823", variant: 'white' }, { text: "+90 252 337 11 11", url: "tel:+902523371111", variant: 'white-outline' }] } },
  ]
}

// ─── CONTACT PAGE ────────────────────────────────────────────
export function contactWidgets(locale: string): WidgetDef[] {
  const isEn = locale === 'en'
  return [
    { type: 'page-header', data: { title: isEn ? 'Contact' : 'İletişim', subtitle: isEn ? 'Get in touch with us' : 'Sorularınız için bize ulaşın', backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", breadcrumbs: [{ label: isEn ? 'Contact' : 'İletişim', href: `/${locale}/iletisim` }] } },
    { type: 'contact', data: { infoLabel: isEn ? 'Contact Info' : 'İletişim Bilgileri', infoHeading: isEn ? 'Get in' : 'Bize', infoHeadingAccent: isEn ? 'Touch' : 'Ulaşın', address: "Torba Mahallesi Herodot Bulvarı No:11\nBodrum / MUĞLA / TÜRKİYE", phone: "+90 252 337 11 11", whatsapp: "+90 549 516 78 03", email: "sales@bluedreamsresort.com", hours: isEn ? "Reception: 24/7\nReservations: 09:00 - 22:00" : "Resepsiyon: 7/24\nRezervasyon: 09:00 - 22:00", socialLinks: { facebook: "https://www.facebook.com/bluedreamshotel", instagram: "https://www.instagram.com/clubbluedreamsresort/", youtube: "https://www.youtube.com/@bluedreamsresort8738/videos", linkedin: "https://www.linkedin.com/company/bluedreamsresortbodrum" }, subjects: [{ value: "reservation", label: isEn ? "Reservation" : "Rezervasyon" }, { value: "info", label: isEn ? "Information" : "Bilgi Talebi" }, { value: "complaint", label: isEn ? "Complaint" : "Şikayet" }, { value: "other", label: isEn ? "Other" : "Diğer" }] } },
    { type: 'map', data: { lat: 37.091832, lng: 27.4824998, zoom: 15 } },
  ]
}

// ─── WEDDING PAGE ────────────────────────────────────────────
export function weddingWidgets(locale: string): WidgetDef[] {
  const isEn = locale === 'en'
  return [
    { type: 'hero', data: { backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3-1024x682.jpg", titleLine1: isEn ? "Wedding & Events" : "Düğün & Davet", subtitle: isEn ? "A unique atmosphere for your special moments" : "En özel anlarınız için eşsiz bir atmosfer" } },
    { type: 'text-image', data: { heading: isEn ? "Where Dreams Come True" : "Rüyaların Gerçeğe Dönüştüğü Yer", headingAccent: "Blue Dreams Resort", paragraphs: [isEn ? "The most beautiful view of Bodrum at your feet." : "Bodrum'un en güzel manzarası ayaklarınızın altında."], image: "https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg", imagePosition: 'left', listItems: [isEn ? "Unique Sunset View" : "Eşsiz Gün Batımı Manzarası", isEn ? "Special Cocktail & Dinner Menus" : "Özel Kokteyl ve Yemek Menüleri", isEn ? "Professional Organization Support" : "Profesyonel Organizasyon Desteği"] } },
    { type: 'youtube', data: { videos: [{ url: "https://www.youtube.com/embed/JJc20SjIENQ?controls=1&rel=0", title: "Wedding Video 1" }, { url: "https://www.youtube.com/embed/KDfh1NV2eUc?controls=1&rel=0", title: "Wedding Video 2" }], columns: 2 } },
    { type: 'cta', data: { heading: isEn ? "Professional Organization Team" : "Profesyonel Organizasyon Ekibi", subtitle: isEn ? "We plan the night of your dreams." : "Hayalinizdeki geceyi planlıyoruz.", backgroundColor: 'brand' } },
    { type: 'icon-grid', data: { heading: isEn ? "Our Event Venues" : "Etkinlik Alanlarımız", items: [{ icon: '📍', title: isEn ? 'Venue' : 'Mekan', description: 'Sunset Pool' }, { icon: '🍷', title: isEn ? 'Cocktail' : 'Kokteyl', description: isEn ? 'Terrace' : 'Teras' }, { icon: '👥', title: isEn ? 'Capacity' : 'Kişi Sayısı', description: '300 - 500' }], columns: 3 } },
    { type: 'gallery', data: { images: [
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00128.jpg", title: "Wedding 1" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.40.42.jpeg", title: "Wedding 2" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.39.56.jpeg", title: "Wedding 3" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00170.jpg", title: "Wedding 4" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg", title: "Wedding 5" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/0713_MR_2020__U5A2186_3.jpg", title: "Wedding 6" },
    ] } },
  ]
}

// ─── GALLERY PAGE ────────────────────────────────────────────
export function galleryWidgets(locale: string): WidgetDef[] {
  const isEn = locale === 'en'
  return [
    { type: 'page-header', data: { title: isEn ? 'Gallery' : 'Galeri', subtitle: isEn ? "Discover the atmosphere through photos." : "Blue Dreams Resort'un atmosferini fotoğraflarla keşfedin.", backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", breadcrumbs: [{ label: isEn ? 'Gallery' : 'Galeri', href: `/${locale}/galeri` }] } },
    { type: 'gallery', data: { images: [
      { src: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", title: "Aerial View", category: isEn ? "General" : "Genel" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg", title: "Deluxe Room", category: isEn ? "Rooms" : "Odalar" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", title: "Infinity Pool", category: isEn ? "Beach & Pool" : "Plaj & Havuz" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg", title: "Pool View", category: isEn ? "Beach & Pool" : "Plaj & Havuz" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", title: "Sandy Beach", category: isEn ? "Beach & Pool" : "Plaj & Havuz" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", title: "Italian Restaurant", category: isEn ? "Gastronomy" : "Gastronomi" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", title: "Open Buffet", category: isEn ? "Gastronomy" : "Gastronomi" },
      { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", title: "Club Room", category: isEn ? "Rooms" : "Odalar" },
    ] } },
  ]
}

// ─── MEETING ROOM PAGE ───────────────────────────────────────
export function meetingWidgets(locale: string): WidgetDef[] {
  const isEn = locale === 'en'
  const cols = isEn ? ['Hall Name', 'Theater Layout', 'Meeting Layout', 'Size', 'Height'] : ['Salon Adı', 'Tiyatro Düzeni', 'Toplantı Düzeni', 'Boyut', 'Yükseklik']
  return [
    { type: 'page-header', data: { title: isEn ? 'Meeting & Event Venues' : 'Toplantı & Etkinlik Alanları', subtitle: isEn ? 'Professional solutions for corporate events' : 'Kurumsal etkinlikleriniz için profesyonel çözümler', backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", breadcrumbs: [{ label: isEn ? 'Meeting & Events' : 'Toplantı & Etkinlik', href: `/${locale}/toplanti-salonu` }] } },
    { type: 'text-image', data: { label: isEn ? 'Main Hall' : 'Ana Salon', heading: 'İstanbul Salonu', paragraphs: [isEn ? 'Our largest hall Istanbul, with 770 m², is ideal for large congresses.' : 'En büyük salonumuz olan İstanbul, 770 m² genişliği ile idealdir.'], image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", badge: { value: '770 m²', label: isEn ? 'Main Hall' : 'Ana Salon' }, buttons: [{ text: '+90 252 337 11 11', url: "tel:+902523371111", variant: 'primary' }] } },
    { type: 'table', data: { label: isEn ? 'Meeting Rooms' : 'Toplantı Odaları', heading: isEn ? 'Different Venues for Different Needs' : 'Farklı İhtiyaçlar İçin Farklı Mekanlar', backgroundColor: 'sand', columns: [{ key: 'name', label: cols[0] }, { key: 'theater', label: cols[1], align: 'center' }, { key: 'meeting', label: cols[2], align: 'center' }, { key: 'size', label: cols[3], align: 'center' }, { key: 'height', label: cols[4], align: 'center' }], rows: [
      { name: 'Turunç', theater: '35', meeting: '10', size: '4.50 x 6.50 mt', height: '3.20 mt' },
      { name: 'Salamis', theater: '45', meeting: '14', size: '8.30 x 4.35 mt', height: '2.70 mt' },
      { name: 'Belek', theater: '20', meeting: '10', size: '4.40 x 4.40 mt', height: '2.70 mt' },
      { name: 'Marmaris', theater: '30', meeting: '10', size: '4.30 x 5.30 mt', height: '2.70 mt' },
      { name: 'Stockholm', theater: '20', meeting: '10', size: '4.30 x 4.40 mt', height: '2.70 mt' },
    ] } },
    { type: 'cta', data: { heading: isEn ? "Let Us Plan Your Event" : 'Etkinliğinizi Planlayalım', subtitle: isEn ? 'Contact our team for your corporate meetings.' : 'Kurumsal toplantılarınız için ekibimizle iletişime geçin.', backgroundColor: 'dark', buttons: [{ text: '+90 252 337 11 11', url: "tel:+902523371111", variant: 'white' }, { text: isEn ? 'Send Email' : 'E-posta Gönderin', url: "mailto:sales@bluedreamsresort.com", variant: 'white-outline' }] } },
  ]
}

// ─── BODRUM GUIDE PAGE ───────────────────────────────────────
export function bodrumWidgets(locale: string): WidgetDef[] {
  const isEn = locale === 'en'
  const places = isEn ? [
    { name: 'Bodrum Castle', desc: 'Historic Castle and Underwater Archaeology Museum.', img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
    { name: 'Ancient Theater', desc: 'Roman theater for summer concerts.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
    { name: 'Bodrum Marina', desc: 'Luxury yachts and waterfront restaurants.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
    { name: 'Gümüşlük Bay', desc: 'Ancient Myndos ruins and Rabbit Island.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' },
  ] : [
    { name: 'Bodrum Kalesi', desc: "Sualtı Arkeoloji Müzesi'ne ev sahipliği yapar.", img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
    { name: 'Antik Tiyatro', desc: '13.000 kişilik yaz konserleri tiyatrosu.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
    { name: 'Bodrum Marina', desc: 'Lüks yatlar ve deniz kıyısı restoranları.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
    { name: 'Gümüşlük Koyu', desc: 'Antik Myndos ve Tavşan Adası.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' },
  ]
  return [
    { type: 'page-header', data: { title: isEn ? 'Bodrum Guide' : 'Bodrum Rehberi', subtitle: isEn ? 'Everything about Bodrum' : 'Bodrum hakkında bilmeniz gereken her şey', backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", breadcrumbs: [{ label: 'Bodrum', href: `/${locale}/bodrum` }] } },
    { type: 'image-grid', data: { label: 'Bodrum', heading: isEn ? 'Places to Discover' : 'Keşfedilecek Yerler', items: places.map(p => ({ image: p.img, title: p.name, description: p.desc })), variant: 'card', columns: 4 } },
    { type: 'weather', data: { title: isEn ? 'Bodrum Weather' : 'Bodrum Hava Durumu', subtitle: isEn ? 'Monthly averages' : 'Aylık ortalama sıcaklıklar', months: [
      { name: 'Oca', avgHigh: 15, avgLow: 7, icon: 'cloud', rainDays: 12 }, { name: 'Şub', avgHigh: 15, avgLow: 7, icon: 'cloud', rainDays: 10 },
      { name: 'Mar', avgHigh: 18, avgLow: 9, icon: 'cloudsun', rainDays: 8 }, { name: 'Nis', avgHigh: 21, avgLow: 12, icon: 'sun', rainDays: 5 },
      { name: 'May', avgHigh: 26, avgLow: 16, icon: 'sun', rainDays: 3 }, { name: 'Haz', avgHigh: 31, avgLow: 20, icon: 'sun', rainDays: 1 },
      { name: 'Tem', avgHigh: 34, avgLow: 23, icon: 'sun', rainDays: 0 }, { name: 'Ağu', avgHigh: 34, avgLow: 23, icon: 'sun', rainDays: 0 },
      { name: 'Eyl', avgHigh: 30, avgLow: 19, icon: 'sun', rainDays: 1 }, { name: 'Eki', avgHigh: 25, avgLow: 15, icon: 'cloudsun', rainDays: 4 },
      { name: 'Kas', avgHigh: 20, avgLow: 11, icon: 'cloud', rainDays: 8 }, { name: 'Ara', avgHigh: 16, avgLow: 8, icon: 'cloud', rainDays: 11 },
    ] } },
  ]
}

// ─── ALL PAGE DEFINITIONS ────────────────────────────────────
export const ALL_PAGES = [
  { titleMap: { tr: 'Ana Sayfa', en: 'Home' }, slugMap: { tr: 'home', en: 'home' }, widgetFn: homeWidgets },
  { titleMap: { tr: 'Hakkımızda', en: 'About Us' }, slugMap: { tr: 'hakkimizda', en: 'about' }, widgetFn: aboutWidgets },
  { titleMap: { tr: 'Odalar & Süitler', en: 'Rooms & Suites' }, slugMap: { tr: 'odalar', en: 'rooms' }, widgetFn: roomsWidgets },
  { titleMap: { tr: 'Restoran & Bar', en: 'Restaurant & Bar' }, slugMap: { tr: 'restoran', en: 'restaurant' }, widgetFn: restaurantWidgets },
  { titleMap: { tr: 'Spa & Wellness', en: 'Spa & Wellness' }, slugMap: { tr: 'spa', en: 'spa' }, widgetFn: spaWidgets },
  { titleMap: { tr: 'İletişim', en: 'Contact' }, slugMap: { tr: 'iletisim', en: 'contact' }, widgetFn: contactWidgets },
  { titleMap: { tr: 'Düğün & Davet', en: 'Wedding & Events' }, slugMap: { tr: 'dugun-davet', en: 'wedding' }, widgetFn: weddingWidgets },
  { titleMap: { tr: 'Galeri', en: 'Gallery' }, slugMap: { tr: 'galeri', en: 'gallery' }, widgetFn: galleryWidgets },
  { titleMap: { tr: 'Toplantı & Etkinlik', en: 'Meeting & Events' }, slugMap: { tr: 'toplanti-salonu', en: 'meeting-room' }, widgetFn: meetingWidgets },
  { titleMap: { tr: 'Bodrum Rehberi', en: 'Bodrum Guide' }, slugMap: { tr: 'bodrum', en: 'bodrum' }, widgetFn: bodrumWidgets },
]
