/**
 * Default Factsheet data — shared between the server page route and the client editor.
 * Kept separate from 'use client' components so it can be imported in server components.
 */
export const factsheetDataEN = {
  hero: {
    tagline: "Where Nature Meets Elegance",
    title: "Every Dream Starts With Blue",
    subtitle: "FACTSHEET — SEASON 2026\nBODRUM / TORBA — TÜRKİYE",
    description: "A 5-star luxury beach resort located on a 55,000m² area in the private Zeytinlikahve Cove. It features a unique architecture that blends with the natural landscape of Bodrum.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["700m private sandy beach", "Five-star service standards", "Season 2026 Ready"]
  },
  location: {
    subtitle: "DESTINATION",
    title: "The Pearl of the Aegean",
    description: "Bodrum, known in antiquity as Halicarnassus, is a stunning coastal city on Turkey's southwestern Aegean coast. Famous for turquoise waters, white-washed architecture, and vibrant culture, it offers the perfect backdrop for a luxury getaway.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Türkiye",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Bodrum Center", value: "10 km" },
      { label: "Milas-Bodrum Airport (BJV)", value: "25 km" },
      { label: "Nearest Town (Torba)", value: "2 km" }
    ],
    climate: "Mediterranean climate with 300+ days of sunshine."
  },
  rooms: [
    { title: "Club Room", size: "24m²", description: "Garden or partial sea views, hillside bungalow style.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Club Sea View Room", size: "24m²", description: "Panoramic Aegean views with private balconies.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Club Family Room", size: "35-40m²", description: "Two separate bedrooms, ideal for families.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Deluxe Sea View Room", size: "40m²", description: "Located in the main building, premium furnishings, expansive sea views.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Beach", description: "700m coastline with a mix of sand and private wooden piers. Features exclusive relaxing cabanas." },
    { title: "Infinity Pool", description: "Breathtaking views of the cove." },
    { title: "Activity Pool", description: "The heart of resort entertainment." }
  ],
  dining: [
    { title: "Main Restaurant", description: "International buffet with live cooking stations and theme nights.", image: "/images/dining/hero.jpg" },
    { title: "La Locanda", description: "Italian fine dining with wood-fired pizza and handmade pasta.", image: "/images/dining/lalocanda.jpg" },
    { title: "Halicarnassus", description: "Turkish & Seafood à la carte with fresh Aegean catches.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Sunset Bar", description: "Cocktails and live music with panoramic sunset views.", image: "/images/dining/sunsetbar.jpg" }
  ],
  features: {
    spa: ["Turkish Bath (Hamam)", "Sauna", "Steam Room", "Indoor Pool", "Professional massage treatments"],
    activities: ["Windsurfing & Canoeing", "Tennis & Basketball", "Kids Club", "Live Music & Evening Shows"],
    info: ["Check-in: 14:00", "Check-out: 12:00", "High-speed WiFi", "Languages: TR, EN, DE, RU"]
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
    activities: "Activities",
    generalInfo: "General Info"
  }
}

export const factsheetDataTR = {
  hero: {
    tagline: "Doğanın Zarafetle Buluştuğu Yer",
    title: "Her Rüya Maviyle Başlar",
    subtitle: "FACTSHEET — SEZON 2026\nBODRUM / TORBA — TÜRKİYE",
    description: "Özel Zeytinlikahve Koyu'nda 55.000m² alana kurulu 5 yıldızlı lüks plaj tatil köyü. Bodrum'un doğal manzarasıyla bütünleşen eşsiz bir mimariye sahiptir.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["700m özel kum plaj", "Beş yıldızlı hizmet standartları", "2026 Sezonuna Hazır"]
  },
  location: {
    subtitle: "LOKASYON",
    title: "Ege'nin İncisi",
    description: "Antik çağda Halikarnassos olarak bilinen Bodrum, Türkiye'nin güneybatı Ege kıyılarında çarpıcı bir sahil şehridir. Turkuaz suları, beyaz badanalı mimarisi ve canlı kültürü ile lüks bir kaçamak için mükemmel bir zemin sunar.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Türkiye",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Bodrum Merkez", value: "10 km" },
      { label: "Milas-Bodrum Havalimanı (BJV)", value: "25 km" },
      { label: "En Yakın Belde (Torba)", value: "2 km" }
    ],
    climate: "Yılda 300+ gün güneşli Akdeniz iklimi."
  },
  rooms: [
    { title: "Club Oda", size: "24m²", description: "Bahçe veya kısmi deniz manzaralı, yamaçta bungalov tarzı.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Club Deniz Manzaralı Oda", size: "24m²", description: "Özel balkonlu panoramik Ege manzarası.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Club Aile Odası", size: "35-40m²", description: "Aileler için ideal, iki ayrı yatak odası.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Deluxe Deniz Manzaralı Oda", size: "40m²", description: "Ana binada, premium mobilyalar, geniş deniz manzarası.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Plaj", description: "Kum ve özel ahşap iskelelerin karışımıyla 700m sahil şeridi. Özel dinlenme kabanaları bulunur." },
    { title: "Sonsuzluk Havuzu", description: "Koyun nefes kesici manzarası." },
    { title: "Aktivite Havuzu", description: "Tesis eğlencesinin kalbi." }
  ],
  dining: [
    { title: "Ana Restoran", description: "Canlı pişirme istasyonları ve tema geceleri ile uluslararası açık büfe.", image: "/images/dining/hero.jpg" },
    { title: "La Locanda", description: "Odun ateşinde pizza ve el yapımı makarna ile İtalyan fine dining.", image: "/images/dining/lalocanda.jpg" },
    { title: "Halikarnas", description: "Taze Ege lezzetleri ile Türk ve Deniz Ürünleri à la carte restoranı.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Sunset Bar", description: "Panoramik gün batımı manzarası eşliğinde kokteyller ve canlı müzik.", image: "/images/dining/sunsetbar.jpg" }
  ],
  features: {
    spa: ["Türk Hamamı", "Sauna", "Buhar Odası", "Kapalı Havuz", "Profesyonel masaj terapileri"],
    activities: ["Rüzgar Sörfü ve Kano", "Tenis ve Basketbol", "Çocuk Kulübü", "Canlı Müzik ve Akşam Şovları"],
    info: ["Giriş: 14:00", "Çıkış: 12:00", "Yüksek Hızlı WiFi", "Diller: TR, EN, DE, RU"]
  },
  labels: {
    address: "Adres",
    distances: "Mesafeler",
    accommodation: "Konaklama",
    roomsAndSuites: "Odalar ve Süitler",
    gastronomy: "Gastronomi",
    foodAndBeverage: "Yiyecek & İçecek",
    resortFacilities: "Tesis Olanakları",
    beachAndPools: "Plaj & Havuzlar",
    spaAndWellness: "Spa & Wellness",
    activities: "Aktiviteler",
    generalInfo: "Genel Bilgiler"
  }
}

export const factsheetDataDE = {
  hero: {
    tagline: "Wo Natur auf Eleganz trifft",
    title: "Jeder Traum beginnt mit Blau",
    subtitle: "FACTSHEET — SAISON 2026\nBODRUM / TORBA — TÜRKEI",
    description: "Ein 5-Sterne Luxus-Strandresort auf einem 55.000 m² großen Areal in der privaten Zeytinlikahve-Bucht. Es besticht durch eine einzigartige Architektur, die mit der natürlichen Landschaft von Bodrum verschmilzt.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["700m privater Sandstrand", "Fünf-Sterne-Servicestandards", "Bereit für Saison 2026"]
  },
  location: {
    subtitle: "ZIEL",
    title: "Die Perle der Ägäis",
    description: "Bodrum, in der Antike als Halikarnassos bekannt, ist eine atemberaubende Küstenstadt an der südwestlichen Ägäisküste der Türkei. Berühmt für türkisfarbenes Wasser, weiß getünchte Architektur und lebendige Kultur bietet es die perfekte Kulisse für einen luxuriösen Kurzurlaub.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Türkei",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Bodrum Zentrum", value: "10 km" },
      { label: "Flughafen Milas-Bodrum (BJV)", value: "25 km" },
      { label: "Nächster Ort (Torba)", value: "2 km" }
    ],
    climate: "Mediterranes Klima mit mehr als 300 Sonnentagen."
  },
  rooms: [
    { title: "Club Zimmer", size: "24m²", description: "Garten- oder seitlicher Meerblick, im Bungalow-Stil am Hang.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Club Zimmer mit Meerblick", size: "24m²", description: "Panoramablick auf die Ägäis mit privatem Balkon.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Club Familienzimmer", size: "35-40m²", description: "Zwei separate Schlafzimmer, ideal für Familien.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Deluxe Zimmer mit Meerblick", size: "40m²", description: "Im Hauptgebäude gelegen, Premium-Ausstattung, weitläufiger Meerblick.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Strand", description: "700m Küste mit einer Mischung aus Sand und privaten Holzpiers. Verfügt über exklusive Entspannungs-Cabanas." },
    { title: "Infinity-Pool", description: "Atemberaubende Ausblicke auf die Bucht." },
    { title: "Aktivitätspool", description: "Das Herzstück der Resort-Unterhaltung." }
  ],
  dining: [
    { title: "Hauptrestaurant", description: "Internationales Buffet mit Live-Cooking-Stationen und Themenabenden.", image: "/images/dining/hero.jpg" },
    { title: "La Locanda", description: "Italienisches Fine Dining mit Holzofenpizza und handgemachter Pasta.", image: "/images/dining/lalocanda.jpg" },
    { title: "Halikarnassos", description: "Türkisches & Meeresfrüchte à la carte mit frischem Fang aus der Ägäis.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Sunset Bar", description: "Cocktails und Live-Musik mit herrlichem Blick auf den Sonnenuntergang.", image: "/images/dining/sunsetbar.jpg" }
  ],
  features: {
    spa: ["Türkisches Bad (Hamam)", "Sauna", "Dampfbad", "Hallenbad", "Professionelle Massagebehandlungen"],
    activities: ["Windsurfen & Kanufahren", "Tennis & Basketball", "Kinderclub", "Live-Musik & Abendshows"],
    info: ["Check-in: 14:00", "Check-out: 12:00", "High-Speed WiFi", "Sprachen: TR, EN, DE, RU"]
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
    activities: "Aktivitäten",
    generalInfo: "Allgemeine Info"
  }
}

export const factsheetDataRU = {
  hero: {
    tagline: "Где природа встречается с элегантностью",
    title: "Каждая мечта начинается с синего",
    subtitle: "ИНФОРМАЦИОННЫЙ ЛИСТ — СЕЗОН 2026\nБОДРУМ / ТОРБА — ТУРЦИЯ",
    description: "5-звездочный роскошный пляжный курорт, расположенный на площади 55 000 м² в частной бухте Зейтинликахве. Отличается уникальной архитектурой, которая сливается с природным ландшафтом Бодрума.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["700 м частного песчаного пляжа", "Стандарты пятизвездочного обслуживания", "Сезон 2026 Готов"]
  },
  location: {
    subtitle: "НАПРАВЛЕНИЕ",
    title: "Жемчужина Эгейского моря",
    description: "Бодрум, известный в древности как Галикарнас, является потрясающим прибрежным городом на юго-западном побережье Эгейского моря в Турции. Известный бирюзовыми водами, белой архитектурой и яркой культурой, он предлагает идеальный фон для роскошного отдыха.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Турция",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Центр Бодрума", value: "10 км" },
      { label: "Аэропорт Миляс-Бодрум (BJV)", value: "25 км" },
      { label: "Ближайший город (Торба)", value: "2 км" }
    ],
    climate: "Средиземноморский климат с более чем 300 солнечными днями."
  },
  rooms: [
    { title: "Клубный Номер", size: "24м²", description: "Вид на сад или боковой вид на море, стиль бунгало на склоне холма.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Клубный Номер с Видом на Море", size: "24м²", description: "Панорамный вид на Эгейское море с частными балконами.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Клубный Семейный Номер", size: "35-40м²", description: "Две отдельные спальни, идеально подходит для семей.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Номер Делюкс с Видом на Море", size: "40м²", description: "Расположен в главном здании, мебель премиум-класса, обширный вид на море.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Пляж", description: "700 м береговой линии со смесью песка и частных деревянных пирсов. Имеются эксклюзивные кабинки для отдыха." },
    { title: "Инфинити Бассейн", description: "Захватывающий дух вид на бухту." },
    { title: "Бассейн для Активного Отдыха", description: "Сердце курортных развлечений." }
  ],
  dining: [
    { title: "Главный Ресторан", description: "Международный шведский стол с кулинарными станциями и тематическими вечерами.", image: "/images/dining/hero.jpg" },
    { title: "La Locanda", description: "Итальянский ресторан высокой кухни с пиццей из дровяной печи и домашней пастой.", image: "/images/dining/lalocanda.jpg" },
    { title: "Halikarnassus", description: "Турецкий ресторан и морепродукты à la carte со свежим эгейским уловом.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Sunset Bar", description: "Коктейли и живая музыка с панорамным видом на закат.", image: "/images/dining/sunsetbar.jpg" }
  ],
  features: {
    spa: ["Турецкая баня (Хамам)", "Сауна", "Паровая комната", "Крытый бассейн", "Профессиональные массажные процедуры"],
    activities: ["Виндсерфинг и каноэ", "Теннис и баскетбол", "Детский клуб", "Живая музыка и вечерние шоу"],
    info: ["Заезд: 14:00", "Выезд: 12:00", "Высокоскоростной Wi-Fi", "Языки: TR, EN, DE, RU"]
  },
  labels: {
    address: "Адрес",
    distances: "Расстояния",
    accommodation: "Размещение",
    roomsAndSuites: "Номера и Люксы",
    gastronomy: "Гастрономия",
    foodAndBeverage: "Еда и Напитки",
    resortFacilities: "Услуги Курорта",
    beachAndPools: "Пляж и Бассейны",
    spaAndWellness: "Спа и Велнес",
    activities: "Мероприятия",
    generalInfo: "Общая Инфо"
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
