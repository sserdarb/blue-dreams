/**
 * Default Factsheet data — shared between the server page route and the client editor.
 * Kept separate from 'use client' components so it can be imported in server components.
 * Content based on https://bluedreamsfactsheet.lovable.app/
 */
export const factsheetDataEN = {
  hero: {
    tagline: "Where Nature Meets Elegance",
    title: "Every Dream Starts With Blue",
    subtitle: "FACTSHEET — SEASON 2026\nBODRUM / TORBA — TÜRKİYE",
    description: "Located in the beautiful bay of Torba Zeytinlikahve in Bodrum, Blue Dreams Resort offers a 55,000 m² area featuring unique Bodrum architecture, a 700-meter long sandy beach, piers, and private relaxing cabanas.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["55,000 m² Total Area", "700 m Sandy Beach", "5+1 Swimming Pools", "25 km to Airport"],
    highlights: "Five swimming pools plus one waterslide pool, tennis courts, water sports, and world-class Spa services."
  },
  location: {
    subtitle: "DESTINATION",
    title: "The Pearl of the Aegean",
    description: "Bodrum, known in antiquity as Halicarnassus, home to the Mausoleum — one of the Seven Wonders of the Ancient World. Torba Bay, just 10 km from Bodrum city centre, is a tranquil retreat on the Aegean coast.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Türkiye",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Bodrum Center", value: "10 km" },
      { label: "Milas-Bodrum Airport (BJV)", value: "25 km" },
      { label: "Nearest Town (Torba)", value: "2 km" }
    ],
    climate: "Mediterranean climate with 300+ days of sunshine, average summer temperature 28°C, sea temperature 24°C."
  },
  rooms: [
    { title: "Club Room", size: "24m²", description: "Comfortable rooms with garden or partial sea views, built into hillside bungalows.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Club Sea View Room", size: "24m²", description: "Elevated club rooms offering panoramic views of the turquoise Aegean with private balconies.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Club Family Room", size: "35-40m²", description: "Spacious family-friendly rooms with connecting options and two separate bedrooms.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Deluxe Sea View Room", size: "40m²", description: "Premium rooms in the main building with unobstructed sea views and elegant furnishings.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Beach", description: "700m sandy beach with private piers, relaxing cabanas, and complimentary sun loungers & parasols." },
    { title: "Infinity Pool", description: "Breathtaking views of the cove with panoramic sea perspective." },
    { title: "Activity Pool", description: "The heart of resort entertainment with water games and animation." },
    { title: "Children's Pool", description: "Safe shallow pool area designed especially for young guests." },
    { title: "Waterslide Pool", description: "Fun waterslides for guests of all ages." },
    { title: "Indoor Pool", description: "Heated indoor pool available year-round in the Spa & Wellness centre." }
  ],
  dining: [
    { title: "Main Restaurant", cuisine: "International Buffet", description: "All day dining with live cooking stations, international buffet, and themed dinner nights.", image: "/images/dining/hero.jpg" },
    { title: "À la Carte Restaurant", cuisine: "Mediterranean & Turkish", description: "Fine dining experience with Mediterranean and Turkish specialties, fresh Aegean seafood.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Beach Restaurant", cuisine: "Seafood", description: "Fresh seafood and Mediterranean dishes with feet-in-the-sand dining experience.", image: "/images/dining/lalocanda.jpg" },
    { title: "Snack Bar", cuisine: "Casual / Poolside", description: "Light bites, burgers, grilled items, and refreshments by the pool.", image: "/images/dining/sunsetbar.jpg" },
    { title: "Patisserie", cuisine: "Desserts & Pastry", description: "Freshly baked pastries, cakes, and artisan desserts throughout the day.", image: "/images/dining/hero.jpg" }
  ],
  bars: [
    { title: "Lobby Bar", description: "Welcome drinks and premium spirits in an elegant setting." },
    { title: "Pool Bar", description: "Refreshing cocktails and soft drinks without leaving the poolside." },
    { title: "Beach Bar", description: "Tropical cocktails and cold beverages with sea breeze." },
    { title: "Vitamin Bar", description: "Fresh juices, smoothies, and healthy drinks." },
    { title: "Night Club Bar", description: "Late night entertainment with DJ sets and themed parties." }
  ],
  features: {
    spa: ["Turkish Bath (Hammam)", "Sauna", "Steam Room", "Indoor Pool", "Massage Therapies (Deep Tissue, Aromatherapy)", "Beauty Treatments", "Relaxation Areas with Sea Views", "Fully Equipped Fitness Centre"],
    activities: ["Jetski & Parasailing", "Diving Centre", "Paddleboarding", "Tennis Courts (Floodlit)", "Mini Golf", "Beach Volleyball", "Archery", "Bluey Kids Club with Supervised Activities", "Live Music & Themed Beach Parties", "Professional Stage Shows"],
    info: ["Check-in: 14:00", "Check-out: 12:00", "Pets not allowed", "High-speed WiFi", "Languages: Turkish, English, German, Russian, French", "Phone: +90 252 337 11 11", "Email: sales@bluedreamsresort.com"]
  },
  labels: {
    address: "Address",
    distances: "Distances",
    accommodation: "Accommodation",
    roomsAndSuites: "Rooms & Suites",
    gastronomy: "Gastronomy",
    foodAndBeverage: "Food & Beverage",
    resortFacilities: "Resort Facilities",
    beachAndPools: "Beach & Pools",
    spaAndWellness: "Spa & Wellness",
    activities: "Activities & Sports",
    generalInfo: "General Info & Contact",
    bars: "Bars"
  }
}

export const factsheetDataTR = {
  hero: {
    tagline: "Doğanın Zarafetle Buluştuğu Yer",
    title: "Her Rüya Maviyle Başlar",
    subtitle: "FACTSHEET — SEZON 2026\nBODRUM / TORBA — TÜRKİYE",
    description: "Bodrum Torba Zeytinlikahve Koyu'nda 55.000 m² alana kurulu Blue Dreams Resort, eşsiz Bodrum mimarisi, 700 metre uzunluğunda kumsal plajı, iskeleleri ve özel dinlenme kabanalarıyla hizmet vermektedir.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["55.000 m² Toplam Alan", "700 m Kumsal Plaj", "5+1 Yüzme Havuzu", "Havalimanına 25 km"],
    highlights: "Beş yüzme havuzu ve bir kaydıraklı havuz, tenis kortları, su sporları ve dünya standartlarında Spa hizmetleri."
  },
  location: {
    subtitle: "LOKASYON",
    title: "Ege'nin İncisi",
    description: "Antik çağda Halikarnassos olarak bilinen Bodrum, Dünyanın Yedi Harikası'ndan biri olan Mausoleum'a ev sahipliği yapmıştır. Bodrum merkezine sadece 10 km uzaklıktaki Torba Koyu, Ege kıyısında huzurlu bir sığınak sunar.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Türkiye",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Bodrum Merkez", value: "10 km" },
      { label: "Milas-Bodrum Havalimanı (BJV)", value: "25 km" },
      { label: "En Yakın Belde (Torba)", value: "2 km" }
    ],
    climate: "Yılda 300+ gün güneşli Akdeniz iklimi, ortalama yaz sıcaklığı 28°C, deniz suyu sıcaklığı 24°C."
  },
  rooms: [
    { title: "Club Oda", size: "24m²", description: "Bahçe veya kısmi deniz manzaralı, yamaç bungalov tarzı konforlu odalar.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Club Deniz Manzaralı Oda", size: "24m²", description: "Özel balkonlu, turkuaz Ege'nin panoramik manzarasını sunan yüksek konumlu odalar.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Club Aile Odası", size: "35-40m²", description: "İki ayrı yatak odalı, bağlantılı seçenekli, aileler için geniş ve konforlu odalar.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Deluxe Deniz Manzaralı Oda", size: "40m²", description: "Ana binada konumlanan, engelsiz deniz manzaralı ve şık mobilyalı premium odalar.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Plaj", description: "700m kumsal plaj, özel iskeleler, dinlenme kabanaları, ücretsiz şezlong ve şemsiye hizmeti." },
    { title: "Sonsuzluk Havuzu", description: "Panoramik deniz manzarasıyla nefes kesici koy manzarası." },
    { title: "Aktivite Havuzu", description: "Su oyunları ve animasyon ile tesisin eğlence merkezi." },
    { title: "Çocuk Havuzu", description: "Küçük misafirler için özel tasarlanmış güvenli sığ havuz alanı." },
    { title: "Kaydıraklı Havuz", description: "Her yaştan misafir için eğlenceli su kaydırakları." },
    { title: "Kapalı Havuz", description: "Spa & Wellness merkezinde yıl boyu kullanılabilen ısıtmalı kapalı havuz." }
  ],
  dining: [
    { title: "Ana Restoran", cuisine: "Uluslararası Açık Büfe", description: "Canlı pişirme istasyonları, uluslararası açık büfe ve temalı akşam yemekleri ile tüm gün yemek servisi.", image: "/images/dining/hero.jpg" },
    { title: "À la Carte Restoran", cuisine: "Akdeniz & Türk Mutfağı", description: "Akdeniz ve Türk spesiyaliteleri, taze Ege deniz ürünleri ile fine dining deneyimi.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Plaj Restoranı", cuisine: "Deniz Ürünleri", description: "Kumda ayak basarak yenen taze deniz ürünleri ve Akdeniz lezzetleri.", image: "/images/dining/lalocanda.jpg" },
    { title: "Snack Bar", cuisine: "Hafif Yemekler / Havuz Başı", description: "Havuz başında hafif atıştırmalıklar, burgerler, ızgara çeşitleri ve serinletici içecekler.", image: "/images/dining/sunsetbar.jpg" },
    { title: "Patisserie", cuisine: "Tatlı & Pasta", description: "Gün boyu taze pişmiş hamur işleri, pastalar ve zanaatkâr tatlılar.", image: "/images/dining/hero.jpg" }
  ],
  bars: [
    { title: "Lobi Bar", description: "Zarif ortamda karşılama kokteylleri ve premium içecekler." },
    { title: "Havuz Bar", description: "Havuz kenarından ayrılmadan serinletici kokteyller ve meşrubatlar." },
    { title: "Plaj Bar", description: "Deniz meltemiyle tropikal kokteyller ve soğuk içecekler." },
    { title: "Vitamin Bar", description: "Taze sıkılmış meyve suları, smoothie'ler ve sağlıklı içecekler." },
    { title: "Gece Kulübü Bar", description: "DJ performansları ve temalı partilerle gece eğlencesi." }
  ],
  features: {
    spa: ["Türk Hamamı", "Sauna", "Buhar Odası", "Kapalı Havuz", "Masaj Terapileri (Derin Doku, Aromaterapi)", "Güzellik Bakımları", "Deniz Manzaralı Dinlenme Alanları", "Tam Donanımlı Fitness Merkezi"],
    activities: ["Jet Ski & Parasailing", "Dalış Merkezi", "Kürek Sörfü (SUP)", "Tenis Kortları (Aydınlatmalı)", "Mini Golf", "Plaj Voleybolu", "Okçuluk", "Bluey Çocuk Kulübü (Gözetimli Aktiviteler)", "Canlı Müzik & Temalı Plaj Partileri", "Profesyonel Sahne Gösterileri"],
    info: ["Giriş: 14:00", "Çıkış: 12:00", "Evcil hayvan kabul edilmez", "Yüksek Hızlı WiFi", "Diller: Türkçe, İngilizce, Almanca, Rusça, Fransızca", "Telefon: +90 252 337 11 11", "E-posta: sales@bluedreamsresort.com"]
  },
  labels: {
    address: "Adres",
    distances: "Mesafeler",
    accommodation: "Konaklama",
    roomsAndSuites: "Odalar & Süitler",
    gastronomy: "Gastronomi",
    foodAndBeverage: "Yiyecek & İçecek",
    resortFacilities: "Tesis Olanakları",
    beachAndPools: "Plaj & Havuzlar",
    spaAndWellness: "Spa & Wellness",
    activities: "Aktiviteler & Sporlar",
    generalInfo: "Genel Bilgiler & İletişim",
    bars: "Barlar"
  }
}

export const factsheetDataDE = {
  hero: {
    tagline: "Wo Natur auf Eleganz trifft",
    title: "Jeder Traum beginnt mit Blau",
    subtitle: "FACTSHEET — SAISON 2026\nBODRUM / TORBA — TÜRKEI",
    description: "In der wunderschönen Bucht von Torba Zeytinlikahve in Bodrum gelegen, bietet das Blue Dreams Resort ein 55.000 m² großes Areal mit einzigartiger Bodrum-Architektur, einem 700 Meter langen Sandstrand, Stegen und privaten Entspannungs-Cabanas.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["55.000 m² Gesamtfläche", "700 m Sandstrand", "5+1 Schwimmbecken", "25 km zum Flughafen"],
    highlights: "Fünf Swimmingpools plus ein Wasserrutschenbecken, Tennisplätze, Wassersport und erstklassige Spa-Angebote."
  },
  location: {
    subtitle: "REISEZIEL",
    title: "Die Perle der Ägäis",
    description: "Bodrum, in der Antike als Halikarnassos bekannt, war Heimat des Mausoleums — eines der Sieben Weltwunder. Die Bucht von Torba, nur 10 km vom Stadtzentrum Bodrums entfernt, ist ein ruhiger Zufluchtsort an der Ägäisküste.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Türkei",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Bodrum Zentrum", value: "10 km" },
      { label: "Flughafen Milas-Bodrum (BJV)", value: "25 km" },
      { label: "Nächster Ort (Torba)", value: "2 km" }
    ],
    climate: "Mediterranes Klima mit mehr als 300 Sonnentagen, durchschnittliche Sommertemperatur 28°C, Wassertemperatur 24°C."
  },
  rooms: [
    { title: "Club Zimmer", size: "24m²", description: "Komfortable Zimmer mit Garten- oder seitlichem Meerblick, im Bungalow-Stil am Hang gebaut.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Club Zimmer mit Meerblick", size: "24m²", description: "Erhöhte Club-Zimmer mit Panoramablick auf die türkisfarbene Ägäis und privatem Balkon.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Club Familienzimmer", size: "35-40m²", description: "Geräumige familienfreundliche Zimmer mit Verbindungstüren und zwei separaten Schlafzimmern.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Deluxe Zimmer mit Meerblick", size: "40m²", description: "Premium-Zimmer im Hauptgebäude mit unverbautem Meerblick und eleganter Einrichtung.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Strand", description: "700m Sandstrand mit privaten Stegen, Entspannungs-Cabanas und kostenlosen Sonnenliegen & Sonnenschirmen." },
    { title: "Infinity-Pool", description: "Atemberaubende Buchtpanorama mit Meerblick." },
    { title: "Aktivitätspool", description: "Das Herzstück der Resort-Unterhaltung mit Wasserspielen und Animation." },
    { title: "Kinderpool", description: "Sicherer Flachwasserbereich speziell für kleine Gäste." },
    { title: "Wasserrutschen-Pool", description: "Spaßige Wasserrutschen für Gäste jeden Alters." },
    { title: "Hallenbad", description: "Beheiztes Hallenbad ganzjährig im Spa & Wellness-Zentrum verfügbar." }
  ],
  dining: [
    { title: "Hauptrestaurant", cuisine: "Internationales Buffet", description: "Ganztägige Gastronomie mit Live-Cooking-Stationen, internationalem Buffet und Themenabenden.", image: "/images/dining/hero.jpg" },
    { title: "À-la-carte-Restaurant", cuisine: "Mediterran & Türkisch", description: "Fine-Dining-Erlebnis mit mediterranen und türkischen Spezialitäten und frischen Meeresfrüchten aus der Ägäis.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Strandrestaurant", cuisine: "Meeresfrüchte", description: "Frische Meeresfrüchte und mediterrane Gerichte mit Füßen im Sand.", image: "/images/dining/lalocanda.jpg" },
    { title: "Snack Bar", cuisine: "Snacks / Am Pool", description: "Leichte Snacks, Burger, Grillgerichte und Erfrischungen am Pool.", image: "/images/dining/sunsetbar.jpg" },
    { title: "Patisserie", cuisine: "Desserts & Gebäck", description: "Frisch gebackene Köstlichkeiten, Kuchen und handgemachte Desserts den ganzen Tag.", image: "/images/dining/hero.jpg" }
  ],
  bars: [
    { title: "Lobby Bar", description: "Willkommensgetränke und Premium-Spirituosen in elegantem Ambiente." },
    { title: "Pool Bar", description: "Erfrischende Cocktails und Softdrinks direkt am Pool." },
    { title: "Beach Bar", description: "Tropische Cocktails und kalte Getränke mit Meeresbrise." },
    { title: "Vitamin Bar", description: "Frisch gepresste Säfte, Smoothies und gesunde Getränke." },
    { title: "Nachtclub Bar", description: "Nachtunterhaltung mit DJ-Sets und Mottopartys." }
  ],
  features: {
    spa: ["Türkisches Bad (Hamam)", "Sauna", "Dampfbad", "Hallenbad", "Massagetherapien (Tiefengewebe, Aromatherapie)", "Schönheitsbehandlungen", "Entspannungsbereiche mit Meerblick", "Voll ausgestattetes Fitnesscenter"],
    activities: ["Jetski & Parasailing", "Tauchzentrum", "Stand-Up-Paddling", "Tennisplätze (Flutlicht)", "Minigolf", "Beachvolleyball", "Bogenschießen", "Bluey Kinderclub mit betreuten Aktivitäten", "Live-Musik & Strandpartys", "Professionelle Bühnenshows"],
    info: ["Check-in: 14:00", "Check-out: 12:00", "Haustiere nicht erlaubt", "High-Speed-WLAN", "Sprachen: Türkisch, Englisch, Deutsch, Russisch, Französisch", "Telefon: +90 252 337 11 11", "E-Mail: sales@bluedreamsresort.com"]
  },
  labels: {
    address: "Adresse",
    distances: "Entfernungen",
    accommodation: "Unterkunft",
    roomsAndSuites: "Zimmer & Suiten",
    gastronomy: "Gastronomie",
    foodAndBeverage: "Speisen & Getränke",
    resortFacilities: "Resort-Einrichtungen",
    beachAndPools: "Strand & Pools",
    spaAndWellness: "Spa & Wellness",
    activities: "Aktivitäten & Sport",
    generalInfo: "Allgemeine Infos & Kontakt",
    bars: "Bars"
  }
}

export const factsheetDataRU = {
  hero: {
    tagline: "Где природа встречается с элегантностью",
    title: "Каждая мечта начинается с синего",
    subtitle: "ИНФОРМАЦИОННЫЙ ЛИСТ — СЕЗОН 2026\nБОДРУМ / ТОРБА — ТУРЦИЯ",
    description: "Расположенный в живописной бухте Торба Зейтинликахве в Бодруме, Blue Dreams Resort предлагает территорию площадью 55 000 м² с уникальной архитектурой Бодрума, песчаным пляжем длиной 700 метров, причалами и частными кабанами для отдыха.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["55 000 м² территория", "700 м песчаный пляж", "5+1 бассейнов", "25 км до аэропорта"],
    highlights: "Пять бассейнов и один бассейн с водными горками, теннисные корты, водные виды спорта и спа-услуги мирового класса."
  },
  location: {
    subtitle: "НАПРАВЛЕНИЕ",
    title: "Жемчужина Эгейского моря",
    description: "Бодрум, известный в древности как Галикарнас, был домом для Мавзолея — одного из Семи чудес древнего мира. Бухта Торба, всего в 10 км от центра Бодрума, является тихим уголком на побережье Эгейского моря.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Турция",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Центр Бодрума", value: "10 км" },
      { label: "Аэропорт Миляс-Бодрум (BJV)", value: "25 км" },
      { label: "Ближайший город (Торба)", value: "2 км" }
    ],
    climate: "Средиземноморский климат с более чем 300 солнечными днями, средняя летняя температура 28°C, температура воды 24°C."
  },
  rooms: [
    { title: "Клубный Номер", size: "24м²", description: "Комфортабельные номера с видом на сад или частичным видом на море, в стиле бунгало на склоне холма.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Клубный Номер с Видом на Море", size: "24м²", description: "Возвышенные клубные номера с панорамным видом на бирюзовое Эгейское море и частными балконами.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Клубный Семейный Номер", size: "35-40м²", description: "Просторные семейные номера с возможностью соединения и двумя отдельными спальнями.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Номер Делюкс с Видом на Море", size: "40м²", description: "Премиум-номера в главном здании с беспрепятственным видом на море и элегантной мебелью.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Пляж", description: "700м песчаный пляж с частными причалами, кабанами для отдыха и бесплатными шезлонгами и зонтиками." },
    { title: "Инфинити Бассейн", description: "Захватывающая панорама бухты с видом на море." },
    { title: "Бассейн для Активного Отдыха", description: "Сердце курортных развлечений с водными играми и анимацией." },
    { title: "Детский Бассейн", description: "Безопасная зона с мелким бассейном, специально для маленьких гостей." },
    { title: "Бассейн с Водными Горками", description: "Весёлые водные горки для гостей всех возрастов." },
    { title: "Крытый Бассейн", description: "Отапливаемый крытый бассейн в Спа & Велнес-центре, доступный круглый год." }
  ],
  dining: [
    { title: "Главный Ресторан", cuisine: "Международный Шведский Стол", description: "Питание весь день с кулинарными станциями, международным буфетом и тематическими ужинами.", image: "/images/dining/hero.jpg" },
    { title: "Ресторан À la Carte", cuisine: "Средиземноморская & Турецкая", description: "Изысканная кухня со средиземноморскими и турецкими деликатесами, свежие морепродукты Эгейского моря.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Пляжный Ресторан", cuisine: "Морепродукты", description: "Свежие морепродукты и средиземноморские блюда с ужином прямо на песке.", image: "/images/dining/lalocanda.jpg" },
    { title: "Снэк-Бар", cuisine: "Лёгкие Закуски / У Бассейна", description: "Лёгкие закуски, бургеры, блюда на гриле и прохладительные напитки у бассейна.", image: "/images/dining/sunsetbar.jpg" },
    { title: "Кондитерская", cuisine: "Десерты и Выпечка", description: "Свежая выпечка, торты и авторские десерты в течение всего дня.", image: "/images/dining/hero.jpg" }
  ],
  bars: [
    { title: "Лобби Бар", description: "Приветственные коктейли и премиальные напитки в элегантной обстановке." },
    { title: "Бар у Бассейна", description: "Освежающие коктейли и безалкогольные напитки прямо у бассейна." },
    { title: "Пляжный Бар", description: "Тропические коктейли и холодные напитки с морским бризом." },
    { title: "Витамин Бар", description: "Свежевыжатые соки, смузи и полезные напитки." },
    { title: "Бар Ночного Клуба", description: "Ночные развлечения с DJ-сетами и тематическими вечеринками." }
  ],
  features: {
    spa: ["Турецкая баня (Хамам)", "Сауна", "Паровая комната", "Крытый бассейн", "Массажные процедуры (глубокая ткань, ароматерапия)", "Косметические процедуры", "Зоны отдыха с видом на море", "Полностью оборудованный фитнес-центр"],
    activities: ["Джетски и Парасейлинг", "Дайвинг-центр", "SUP-бординг", "Теннисные корты (освещённые)", "Мини-гольф", "Пляжный волейбол", "Стрельба из лука", "Детский клуб Bluey с программой под присмотром", "Живая музыка и тематические пляжные вечеринки", "Профессиональные сценические шоу"],
    info: ["Заезд: 14:00", "Выезд: 12:00", "Размещение с домашними животными не допускается", "Высокоскоростной Wi-Fi", "Языки: турецкий, английский, немецкий, русский, французский", "Телефон: +90 252 337 11 11", "E-mail: sales@bluedreamsresort.com"]
  },
  labels: {
    address: "Адрес",
    distances: "Расстояния",
    accommodation: "Размещение",
    roomsAndSuites: "Номера & Люксы",
    gastronomy: "Гастрономия",
    foodAndBeverage: "Еда & Напитки",
    resortFacilities: "Услуги Курорта",
    beachAndPools: "Пляж & Бассейны",
    spaAndWellness: "Спа & Велнес",
    activities: "Активности & Спорт",
    generalInfo: "Общая Информация & Контакты",
    bars: "Бары"
  }
}

export const defaultFactsheetData = factsheetDataEN 

export const getFactsheetDataForLocale = (locale: string) => {
  switch (locale) {
    case 'tr': return factsheetDataTR
    case 'de': return factsheetDataDE
    case 'ru': return factsheetDataRU
    case 'en':
    default: return factsheetDataEN
  }
}
