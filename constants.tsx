import { NavItem, Room, Review } from './types';
import { Wifi, Utensils, Droplets, Sun, Activity, Waves, Wine, Bike, Dog, ShoppingBag, Speaker } from 'lucide-react';
import React from 'react';

export const NAV_ITEMS: NavItem[] = [
  { label: 'Otelimiz', href: '#about' },
  { label: 'Odalar', href: '#rooms' },
  { label: 'Restoranlar', href: '#experience' },
  { label: 'Etkinlikler', href: '#experience' },
  { label: 'Galeri', href: '#gallery' },
];

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
];

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
];

export const BENEFITS = [
  {
    icon: <Wine className="w-6 h-6" />,
    title: "Özel Kokteyl Saati",
  },
  {
    icon: <Waves className="w-6 h-6" />,
    title: "Özel Plaj Erişimi",
  },
  {
    icon: <Dog className="w-6 h-6" />,
    title: "Evcil Hayvan Dostu",
  },
  {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: "Butik Mağazalar",
  },
  {
    icon: <Speaker className="w-6 h-6" />,
    title: "Canlı DJ Performansları",
  }
];

export const AMENITIES = [
  {
    id: 1,
    icon: <Waves className="w-6 h-6" />,
    title: 'Özel Plaj & İskele',
    description: 'Ege\'nin kristal sularında özel sahil şeridi ve güneşlenme iskelesi.',
  },
  {
    id: 2,
    icon: <Utensils className="w-6 h-6" />,
    title: 'Gurme Restoranlar',
    description: 'Halicarnassus, Le Kebab ve La Lokanta ile eşsiz lezzetler.',
  },
  {
    id: 3,
    icon: <Droplets className="w-6 h-6" />,
    title: 'Sonsuzluk Havuzu',
    description: 'Bodrum gün batımını izleyebileceğiniz ikonik sonsuzluk havuzu.',
  },
  {
    id: 4,
    icon: <Activity className="w-6 h-6" />,
    title: 'Naya Spa',
    description: 'Türk hamamı, sauna ve masaj terapileri ile yenilenme.',
  }
];

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
];