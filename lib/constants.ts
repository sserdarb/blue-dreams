import { Wifi, Utensils, Droplets, Sun, Activity, Waves, Wine, Bike, Dog, ShoppingBag, Speaker } from 'lucide-react'

export interface NavItem {
    label: string
    href: string
}

export interface Room {
    id: number
    title: string
    description: string
    image: string
    size: string
    view: string
}

export interface Review {
    id: number
    author: string
    text: string
    rating: number
}

export const NAV_ITEMS: NavItem[] = [
    { label: 'Hakkımızda', href: '/tr/hakkimizda' },
    { label: 'Odalar', href: '/tr/odalar' },
    { label: 'Restoran & Barlar', href: '/tr/restoran' },
    { label: 'Spa & Wellness', href: '/tr/spa' },
    { label: 'Galeri', href: '/tr/galeri' },
    { label: 'İletişim', href: '/tr/iletisim' },
]

export const ROOMS: Room[] = [
    {
        id: 1,
        title: 'Club Odalar',
        description: 'Doğayla iç içe yapısı, özgün mimarisi ve denize nazır konumda konforlu bir konaklama deneyimi.',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
        size: '24 m²',
        view: 'Deniz veya Bahçe Manzaralı',
    },
    {
        id: 2,
        title: 'Deluxe Odalar',
        description: 'Modern tasarımın eşsiz Bodrum manzarasıyla buluştuğu, geniş ve ferah yaşam alanları.',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
        size: '35 m²',
        view: 'Panoramik Deniz Manzarası',
    },
    {
        id: 3,
        title: 'Aile Suitleri',
        description: 'Geniş aileler için tasarlanmış, iki yatak odalı ve konforlu ortak yaşam alanına sahip suitler.',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
        size: '55 m²',
        view: 'Bahçe ve Kısmi Deniz',
    }
]

export const CATEGORIES = [
    {
        id: 1,
        title: "ODALAR",
        subtitle: "Bodrum'un kalbinde tasarım odalar",
        image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg",
    },
    {
        id: 2,
        title: "RESTORAN & BAR",
        subtitle: "Gerçek bir gastronomi deneyimi",
        image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg",
    },
    {
        id: 3,
        title: "AKTIVITELER",
        subtitle: "Size özel anlar ve eğlence",
        image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/WATER-SPORTS-.jpg",
    }
]

export const REVIEWS: Review[] = [
    {
        id: 1,
        author: "Ayşe Yılmaz",
        text: "Balayımız için tercih ettik ve her anından keyif aldık. Özellikle sonsuzluk havuzundaki gün batımı manzarası büyüleyiciydi. Personel çok ilgili ve güleryüzlü.",
        rating: 5,
    },
    {
        id: 2,
        author: "Caner Erkin",
        text: "Torba'daki en iyi konum. Özel plajı tertemiz ve deniz kristal berraklığında. Ana restorandaki yemek çeşitliliği etkileyiciydi, kesinlikle tavsiye ederim.",
        rating: 5,
    },
    {
        id: 3,
        author: "Selin Demir",
        text: "Ailemle harika bir hafta geçirdik. Çocuklar için aktiviteler yeterliydi, biz de spa merkezinde dinlenme fırsatı bulduk. Kesinlikle tekrar geleceğiz.",
        rating: 5,
    },
]

export const GALLERY_IMAGES = [
    {
        src: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg",
        category: "Genel",
        title: "Kuş Bakışı Blue Dreams",
    },
    {
        src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg",
        category: "Plaj & Havuz",
        title: "Sonsuzluk Havuzu",
    },
    {
        src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg",
        category: "Odalar",
        title: "Deluxe Oda Detayları",
    },
    {
        src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg",
        category: "Plaj & Havuz",
        title: "Özel Plaj",
    },
    {
        src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg",
        category: "Gastronomi",
        title: "İtalyan A la Carte",
    },
    {
        src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg",
        category: "Odalar",
        title: "Club Oda Manzarası",
    },
    {
        src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg",
        category: "Gastronomi",
        title: "Açık Büfe Sunumu",
    },
    {
        src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg",
        category: "Plaj & Havuz",
        title: "Gün Batımı ve Havuz",
    },
    {
        src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg",
        category: "Odalar",
        title: "Aile Suiti Konforu",
    }
]

export const ATTRACTIONS = [
    {
        id: 1,
        title: "Bodrum Kalesi & Sualtı Müzesi",
        distance: "10 km",
        description: "St. John Şövalyeleri tarafından inşa edilen tarihi kale ve dünyanın en önemli sualtı arkeoloji müzelerinden biri.",
        image: "https://static.baranselgrup.com/nwm-179903-w1920-bodrum-kalesi-tarihi-ve-ozellikleri.png",
        tag: "Tarih & Kültür"
    },
    {
        id: 2,
        title: "Yalıkavak Marina",
        distance: "18 km",
        description: "Dünya markaları, gurme restoranlar ve lüks yatların buluşma noktası. Alışveriş ve gece hayatının kalbi.",
        image: "https://yalikavakmarinahotels.com/wp-content/uploads/2023/08/Rectangle-5.png",
        tag: "Lüks Yaşam"
    },
    {
        id: 3,
        title: "Antik Tiyatro",
        distance: "9 km",
        description: "M.Ö. 4. yüzyıldan kalma, Halikarnassos'un görkemli yapısı. Eşsiz Bodrum manzarasına hakim bir konumda.",
        image: "https://dekainsaat.com.tr/wp-content/uploads/2021/04/Bodrum-Antik-Tiyatro-Gezi-Etkinlik-Konser-Bodrum-Firsat.jpg",
        tag: "Manzara"
    }
]

export const EVENTS = [
    {
        id: 1,
        day: "15",
        month: "TEM",
        title: "Sunset Jazz Sessions",
        time: "19:30 - 22:00",
        location: "Pier Bar",
        description: "Ege gün batımına karşı saksafon ve kontrbasın büyüleyici uyumu."
    },
    {
        id: 2,
        day: "16",
        month: "TEM",
        title: "Ege Otları & Gastronomi Atölyesi",
        time: "14:00 - 16:00",
        location: "La Gondola Garden",
        description: "Şefimiz ile yerel otları tanıyın ve sağlıklı Ege mezeleri hazırlamayı öğrenin."
    },
    {
        id: 3,
        day: "Her",
        month: "GÜN",
        title: "Morning Flow Yoga",
        time: "08:00 - 09:00",
        location: "Sonsuzluk Havuzu Terası",
        description: "Güne zinde başlamak için profesyonel eğitmenler eşliğinde yoga seansı."
    }
]

export const SOCIAL_LINKS = [
    { name: 'Facebook', href: 'https://www.facebook.com/BlueDreamsResortBodrum' },
    { name: 'Instagram', href: 'https://www.instagram.com/bluedreamsresort/' },
    { name: 'Youtube', href: 'https://www.youtube.com/@BlueDreamsResort' },
]
