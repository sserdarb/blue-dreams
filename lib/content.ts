// Room type definitions and data

export interface RoomType {
    id: string
    slug: string
    title: string
    subtitle: string
    description: string
    longDescription: string
    heroImage: string
    gallery: string[]
    size: string
    capacity: string
    view: string
    amenities: { icon: string; label: string }[]
    features: string[]
}

export const ROOM_TYPES: RoomType[] = [
    {
        id: 'club',
        slug: 'club',
        title: 'Club Odalar',
        subtitle: 'Konforlu Konaklama',
        description: 'Doğayla iç içe yapısı, özgün mimarisi ve denize nazır konumda konforlu bir konaklama deneyimi.',
        longDescription: `Oda büyüklüğü 20 ile 22 metrekare arasında değişen, sade bir dekorasyona sahip Club odalarımız size huzurlu bir konaklama sunar. Tek veya çift kişilik konforlu yataklar, ahşap görünümlü seramik zemin, elektronik kapı kilit sistemi, yangın alarm sistemi, ücretli kablosuz kesintisiz internet, Uluslararası çoklu yayınlı LCD televizyon, ücretsiz elektronik emanet kasası, mini bar, Split Klima, oda telefonu, valizlik ve gardırop, makyaj masası, duşakabinli banyo, makyaj ve traş aynası, tuvalet, saç kurutma makinesi, özel tasarlanmış mefruşat ve havlular bulunmaktadır.`,
        heroImage: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
        gallery: [
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-1.jpg',
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-2.jpg',
        ],
        size: '20-22 m²',
        capacity: '2 Kişi',
        view: 'Kara veya Deniz Manzaralı',
        amenities: [
            { icon: 'tv', label: 'Uydu TV' },
            { icon: 'ac', label: 'Split Klima' },
            { icon: 'safe', label: 'Oda Kasası' },
            { icon: 'minibar', label: 'Minibar' },
            { icon: 'bath', label: 'Duşlu Banyo' },
            { icon: 'phone', label: '24s Operatör' },
            { icon: 'wifi', label: 'Wifi (Ücretli)' },
            { icon: 'wardrobe', label: 'Gardırop' },
        ],
        features: [
            'Elektronik kapı kilit sistemi',
            'Yangın alarm sistemi',
            'LCD televizyon',
            'Saç kurutma makinesi',
            'Özel tasarım havlular',
        ],
    },
    {
        id: 'deluxe',
        slug: 'deluxe',
        title: 'Deluxe Odalar',
        subtitle: 'Lüks Konaklama',
        description: 'Modern tasarımın eşsiz Bodrum manzarasıyla buluştuğu, geniş ve ferah yaşam alanları.',
        longDescription: `Şık ve modern tasarlanmış yatak odası ve oturma grubundan oluşan Deluxe Odalar, birbirini tamamlayan iki muhteşem manzara olan Ege Denizi ve Sonsuzluk Havuzunu aynı anda seyrederken, konumlandığı yerin eşsiz doğa manzarasını seyretmeye doyamayacaksınız. Oda büyüklüğü 40 metrekare, havuz ve deniz manzaralı olup, modern, konforlu, lüks bir dekorasyona sahip ve tamamı balkonludur. Standart üzeri ölçülerde tek veya çift kişilik konforlu yataklar, oturma grubu, ahşap parke zemin, giysi odası, Nespresso kahve makinesi, merkezi sistem soğutma bulunmaktadır.`,
        heroImage: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
        gallery: [
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg',
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-2.jpg',
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-3.jpg',
        ],
        size: '40-45 m²',
        capacity: '2-3 Kişi',
        view: 'Panoramik Deniz & Havuz Manzarası',
        amenities: [
            { icon: 'balcony', label: 'Özel Balkon' },
            { icon: 'tv', label: 'Uydu TV' },
            { icon: 'ac', label: 'Merkezi Klima' },
            { icon: 'safe', label: 'Oda Kasası' },
            { icon: 'minibar', label: 'Minibar' },
            { icon: 'coffee', label: 'Nespresso' },
            { icon: 'bath', label: 'Lüks Banyo' },
            { icon: 'phone', label: '24s Operatör' },
            { icon: 'wifi', label: 'Ücretsiz Wifi' },
            { icon: 'wardrobe', label: 'Giysi Odası' },
        ],
        features: [
            'Oturma grubu',
            'Ahşap parke zemin',
            'Bornoz ve terlik',
            'Kaliteli buklet çeşitleri',
            'Makyaj masası',
        ],
    },
    {
        id: 'aile',
        slug: 'aile',
        title: 'Aile Suitleri',
        subtitle: 'Geniş Aile Odaları',
        description: 'Geniş aileler için tasarlanmış, iki yatak odalı ve konforlu ortak yaşam alanına sahip suitler.',
        longDescription: `Aile Suitlerimiz, birlikte tatil yapmak isteyen geniş aileler için özel olarak tasarlanmıştır. İki ayrı yatak odası ve geniş oturma alanı ile hem mahremiyet hem de birliktelik imkanı sunan bu suitler, deniz manzaralı balkonları ile Bodrum'un büyüleyici atmosferini odanıza taşır. Çocuklu aileler için ekstra konfor ve güvenlik özellikleri düşünülmüştür.`,
        heroImage: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
        gallery: [
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-1.jpg',
            'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-2.jpg',
        ],
        size: '55-60 m²',
        capacity: '4-5 Kişi',
        view: 'Bahçe ve Kısmi Deniz Manzarası',
        amenities: [
            { icon: 'balcony', label: 'Geniş Balkon' },
            { icon: 'tv', label: '2 Adet TV' },
            { icon: 'ac', label: 'Merkezi Klima' },
            { icon: 'safe', label: 'Oda Kasası' },
            { icon: 'minibar', label: 'Minibar' },
            { icon: 'coffee', label: 'Çay/Kahve Seti' },
            { icon: 'bath', label: '2 Banyo' },
            { icon: 'phone', label: '24s Operatör' },
            { icon: 'wifi', label: 'Ücretsiz Wifi' },
            { icon: 'capacity', label: 'Bebek Karyolası' },
        ],
        features: [
            '2 ayrı yatak odası',
            'Geniş oturma alanı',
            'Çocuk güvenlik önlemleri',
            'Aile için ideal',
        ],
    },
]

// Restaurant & Bar Data
export interface VenueType {
    id: string
    title: string
    subtitle: string
    description: string
    image: string
    hours?: string
    cuisine?: string
}

export const RESTAURANTS: VenueType[] = [
    {
        id: 'la-gondola',
        title: 'La Gondola',
        subtitle: 'İtalyan A la Carte',
        description: 'Otantik İtalyan lezzetleri ve taze makarnalar ile unutulmaz bir gastronomi deneyimi. Ege manzarası eşliğinde İtalya\'nın ruhunu hissedin.',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg',
        hours: '19:00 - 23:00',
        cuisine: 'İtalyan Mutfağı',
    },
    {
        id: 'ana-restoran',
        title: 'Ana Restoran',
        subtitle: 'Açık Büfe',
        description: 'Zengin açık büfe seçenekleri ile kahvaltı, öğle ve akşam yemekleri. Taze Ege otları ve yerel lezzetler.',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg',
        hours: '07:00 - 10:30 / 12:30 - 14:30 / 19:00 - 21:30',
        cuisine: 'Uluslararası Mutfak',
    },
    {
        id: 'pier-bar',
        title: 'Pier Bar',
        subtitle: 'Sahil Barı',
        description: 'Denize sıfır konumda, gün batımı eşliğinde kokteyl keyfi. Canlı müzik ve özel etkinlikler.',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg',
        hours: '10:00 - 01:00',
    },
    {
        id: 'pool-bar',
        title: 'Havuz Bar',
        subtitle: 'Pool Bar',
        description: 'Sonsuzluk havuzu kenarında serinletici içecekler ve hafif atıştırmalıklar.',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg',
        hours: '10:00 - 18:00',
    },
]

// Spa Services
export interface SpaService {
    id: string
    title: string
    description: string
    duration: string
    image?: string
}

export const SPA_SERVICES: SpaService[] = [
    {
        id: 'hot-stone',
        title: 'Taş Masajı',
        description: 'Sıcak volkanik taşlarla derin kas gevşetme ve enerji dengeleme terapisi.',
        duration: '60 dk',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg',
    },
    {
        id: 'back-massage',
        title: 'Sırt Masajı',
        description: 'Sırt ve omuz bölgesine odaklanan rahatlatıcı masaj uygulaması.',
        duration: '30 dk',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg',
    },
    {
        id: 'seaweed-massage',
        title: 'Yosun Masajı',
        description: 'Deniz yosunu özleriyle detoks ve cilt yenileme terapisi.',
        duration: '45 dk',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg',
    },
    {
        id: 'turkish-bath',
        title: 'Türk Hamamı',
        description: 'Geleneksel köpük ve kese ritüeli ile derin temizlik ve cilt yenilenmesi.',
        duration: '45 dk',
    },
    {
        id: 'aromatherapy',
        title: 'Aromaterapi Masajı',
        description: 'Uçucu yağlarla gevşetici masaj, stres giderici ve enerji verici.',
        duration: '60 dk',
    },
    {
        id: 'couple-spa',
        title: 'Çift Spa Paketi',
        description: 'Sevdiklerinizle birlikte özel spa deneyimi. Masaj, hamam ve bakım bir arada.',
        duration: '120 dk',
    },
    {
        id: 'facial',
        title: 'Yüz Bakımı',
        description: 'Profesyonel cilt analizi ve kişiye özel yüz bakım uygulamaları.',
        duration: '45 dk',
    },
]
