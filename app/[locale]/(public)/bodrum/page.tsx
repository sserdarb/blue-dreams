'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Calendar, MapPin, Clock, Ticket, Music, Theater, Star, Palette, Trophy, PartyPopper } from 'lucide-react'
import MonthlyWeather from '@/components/sections/MonthlyWeather'

interface EventItem {
    event_name: string
    event_date: string
    event_time: string
    location: string
    ticket_url: string
    description: string
    category: string
    image_url: string
}

const categoryIcons: Record<string, any> = {
    konser: Music,
    festival: PartyPopper,
    tiyatro: Theater,
    bale: Star,
    sergi: Palette,
    spor: Trophy,
    fuar: Ticket,
    workshop: Star,
}

const BODRUM_INFO = {
    tr: {
        pageTitle: 'Bodrum Rehberi',
        pageSub: 'Bodrum hakkında bilmeniz gereken her şey — etkinlikler, hava durumu ve gezilecek yerler.',
        eventsTitle: 'Yaklaşan Etkinlikler',
        eventsSub: 'Bodrum ve çevresindeki konserler, festivaller ve kültürel etkinlikler',
        placesTitle: 'Keşfedilecek Yerler',
        weatherTitle: 'Hava Durumu',
        noEvents: 'Yaklaşan etkinlik bulunamadı.',
        loading: 'Etkinlikler yükleniyor...',
        details: 'Detaylar',
        breadcrumb: 'Bodrum Rehberi',
        places: [
            { name: 'Bodrum Kalesi', desc: "Saint Peter Kalesi olarak da bilinen tarihi kale ve Sualtı Arkeoloji Müzesi'ne ev sahipliği yapar.", img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
            { name: 'Antik Tiyatro', desc: '13.000 kişilik kapasitesiyle yaz konserlerine ev sahipliği yapan antik Roma tiyatrosu.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
            { name: 'Bodrum Marina', desc: 'Lüks yatlar, butik mağazalar ve deniz kıyısı restoranları ile gece hayatının kalbindeki marina.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
            { name: 'Gümüşlük Koyu', desc: "Antik Myndos şehrinin kalıntılarına yürüyerek gidebileceğiniz sakin balıkçı köyü ve Tavşan Adası.", img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' },
        ],
    },
    en: {
        pageTitle: 'Bodrum Guide',
        pageSub: 'Everything you need to know about Bodrum — events, weather, and places to explore.',
        eventsTitle: 'Upcoming Events',
        eventsSub: 'Concerts, festivals, and cultural events in and around Bodrum',
        placesTitle: 'Places to Discover',
        weatherTitle: 'Weather',
        noEvents: 'No upcoming events found.',
        loading: 'Loading events...',
        details: 'Details',
        breadcrumb: 'Bodrum Guide',
        places: [
            { name: 'Bodrum Castle', desc: 'Historic castle also known as Castle of St. Peter, home to the Underwater Archaeology Museum.', img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
            { name: 'Ancient Theater', desc: 'Roman-era theater with 13,000 capacity hosting summer concerts.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
            { name: 'Bodrum Marina', desc: 'Luxury yachts, boutique shops, and waterfront restaurants in the heart of nightlife.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
            { name: 'Gümüşlük Bay', desc: 'Quiet fishing village where you can walk to the ruins of ancient Myndos and Rabbit Island.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' },
        ],
    },
    de: {
        pageTitle: 'Bodrum Reiseführer',
        pageSub: 'Alles, was Sie über Bodrum wissen müssen — Veranstaltungen, Wetter und Sehenswürdigkeiten.',
        eventsTitle: 'Kommende Veranstaltungen',
        eventsSub: 'Konzerte, Festivals und kulturelle Events in und um Bodrum',
        placesTitle: 'Orte zum Entdecken',
        weatherTitle: 'Wetter',
        noEvents: 'Keine kommenden Veranstaltungen gefunden.',
        loading: 'Veranstaltungen werden geladen...',
        details: 'Details',
        breadcrumb: 'Bodrum Reiseführer',
        places: [
            { name: 'Burg von Bodrum', desc: 'Historische Burg, auch St. Peter Burg genannt, beherbergt das Unterwasser-Archäologiemuseum.', img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
            { name: 'Antikes Theater', desc: 'Römisches Theater mit 13.000 Plätzen für Sommerkonzerte.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
            { name: 'Bodrum Marina', desc: 'Luxusyachten, Boutiquen und Restaurants am Wasser.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
            { name: 'Bucht von Gümüşlük', desc: 'Ruhiges Fischerdorf mit Zugang zu antiken Ruinen von Myndos.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' },
        ],
    },
    ru: {
        pageTitle: 'Путеводитель по Бодруму',
        pageSub: 'Всё, что нужно знать о Бодруме — события, погода и достопримечательности.',
        eventsTitle: 'Предстоящие события',
        eventsSub: 'Концерты, фестивали и культурные мероприятия в Бодруме и окрестностях',
        placesTitle: 'Места для посещения',
        weatherTitle: 'Погода',
        noEvents: 'Предстоящих событий не найдено.',
        loading: 'Загрузка событий...',
        details: 'Подробнее',
        breadcrumb: 'Путеводитель',
        places: [
            { name: 'Замок Бодрума', desc: 'Исторический замок Святого Петра, в котором расположен Музей подводной археологии.', img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
            { name: 'Античный театр', desc: 'Римский театр на 13 000 мест, где проходят летние концерты.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
            { name: 'Марина Бодрума', desc: 'Роскошные яхты, бутики и рестораны на набережной.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
            { name: 'Бухта Гюмюшлюк', desc: 'Тихая рыбацкая деревня с руинами древнего Миндоса.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' },
        ],
    },
}

export default function BodrumGuidePage() {
    const pathname = usePathname()
    const locale = (pathname?.split('/')[1] || 'tr') as keyof typeof BODRUM_INFO
    const t = BODRUM_INFO[locale] || BODRUM_INFO.tr

    const [events, setEvents] = useState<EventItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/events')
            .then(res => res.json())
            .then(data => {
                setEvents(data.events || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'ru' ? 'ru-RU' : 'en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            })
        } catch {
            return dateStr
        }
    }

    return (
        <div>
            {/* Hero */}
            <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg')" }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
                <div className="relative z-10 text-center text-white px-6">
                    <h1 className="text-5xl md:text-6xl font-serif mb-4">{t.pageTitle}</h1>
                    <p className="text-white/80 text-lg max-w-2xl mx-auto">{t.pageSub}</p>
                </div>
            </section>

            {/* Places to Discover */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">Bodrum</span>
                        <h2 className="text-4xl font-serif text-gray-900">{t.placesTitle}</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {t.places.map((place, i) => (
                            <div key={i} className="group bg-sand rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="relative h-48 overflow-hidden">
                                    <img src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                    <h3 className="absolute bottom-3 left-4 text-white text-lg font-serif">{place.name}</h3>
                                </div>
                                <div className="p-4">
                                    <p className="text-gray-600 text-sm">{place.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Monthly Weather */}
            <MonthlyWeather />

            {/* Events */}
            <section className="py-16 bg-sand">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">🎭</span>
                        <h2 className="text-4xl font-serif text-gray-900 mb-2">{t.eventsTitle}</h2>
                        <p className="text-gray-500 text-sm">{t.eventsSub}</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin w-8 h-8 border-4 border-brand border-t-transparent rounded-full mx-auto mb-4" />
                            <p className="text-gray-500">{t.loading}</p>
                        </div>
                    ) : events.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {events.map((event, i) => {
                                const IconComp = categoryIcons[event.category] || Calendar
                                return (
                                    <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group border border-gray-100">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-brand group-hover:text-white transition-colors">
                                                <IconComp size={24} className="text-brand group-hover:text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-serif text-gray-900 font-bold mb-1 group-hover:text-brand transition-colors">
                                                    {event.event_name}
                                                </h3>
                                                <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(event.event_date)}</span>
                                                    {event.event_time && <span className="flex items-center gap-1"><Clock size={12} /> {event.event_time}</span>}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                                                    <MapPin size={12} /> {event.location}
                                                </div>
                                                {event.description && (
                                                    <p className="text-gray-600 text-sm">{event.description}</p>
                                                )}
                                                {event.ticket_url && (
                                                    <a href={event.ticket_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand text-sm font-bold mt-3 hover:underline">
                                                        <Ticket size={14} /> {t.details}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">{t.noEvents}</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
