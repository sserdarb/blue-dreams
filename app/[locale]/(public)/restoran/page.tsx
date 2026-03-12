export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import { Clock, MapPin, Users, UtensilsCrossed, Star, Wine, GlassWater } from 'lucide-react'
import type { Metadata } from 'next'

/* ─── i18n translations ─── */
const t: Record<string, Record<string, string>> = {
    title: { tr: 'Yeme & İçme', en: 'Dining', de: 'Gastronomie', ru: 'Рестораны и Бары' },
    subtitle: {
        tr: 'Ege\'nin taze lezzetleri ve dünya mutfağından seçkin tatlar ile benzersiz bir gastronomi deneyimi.',
        en: 'An extraordinary culinary experience with fresh Aegean flavors and world-class cuisine.',
        de: 'Ein einzigartiges gastronomisches Erlebnis mit frischen ägäischen Aromen und erstklassiger Küche.',
        ru: 'Уникальный гастрономический опыт со свежими эгейскими вкусами и кухней мирового класса.',
    },
    cuisine: { tr: 'Mutfak', en: 'Cuisine', de: 'Küche', ru: 'Кухня' },
    hours: { tr: 'Saatler', en: 'Hours', de: 'Öffnungszeiten', ru: 'Часы работы' },
    capacity: { tr: 'Kapasite', en: 'Capacity', de: 'Kapazität', ru: 'Вместимость' },
    location: { tr: 'Konum', en: 'Location', de: 'Lage', ru: 'Расположение' },
    highlights: { tr: 'Öne Çıkanlar', en: 'Highlights', de: 'Highlights', ru: 'Особенности' },
    specialEvents: { tr: 'Özel Geceler & Temalar', en: 'Special Nights & Themes', de: 'Besondere Abende', ru: 'Специальные вечера' },
    viewMenu: { tr: 'Menüyü İncele', en: 'View Menu', de: 'Menü ansehen', ru: 'Смотреть меню' },
    barsTitle: { tr: 'Barlar & Lounges', en: 'Bars & Lounges', de: 'Bars & Lounges', ru: 'Бары и Лаунджи' },
    barsSubtitle: {
        tr: 'Günbatımı kokteylleri, canlı müzik ve Ege\'nin büyüleyici atmosferi.',
        en: 'Sunset cocktails, live music and the enchanting Aegean atmosphere.',
        de: 'Sonnenuntergangs-Cocktails, Live-Musik und die bezaubernde Atmosphäre der Ägäis.',
        ru: 'Коктейли на закате, живая музыка и очаровательная атмосфера Эгейского моря.',
    },
    restaurantsTitle: { tr: 'Restoranlarımız', en: 'Our Restaurants', de: 'Unsere Restaurants', ru: 'Наши рестораны' },
    comingSoon: { tr: 'Çok Yakında', en: 'Coming Soon', de: 'Demnächst', ru: 'Скоро' },
    comingSoonDesc: { tr: 'Restoran bilgilerimiz güncellenmektedir.', en: 'Restaurant info is being updated.', de: 'Restaurantinformationen werden aktualisiert.', ru: 'Информация о ресторанах обновляется.' },
    capacityUnit: { tr: 'Kişi', en: 'Guests', de: 'Gäste', ru: 'Гостей' },
    ctaTitle: { tr: 'Unutulmaz Bir Gece İçin', en: 'For An Unforgettable Evening', de: 'Für einen unvergesslichen Abend', ru: 'Для незабываемого вечера' },
    ctaDesc: {
        tr: "A'la carte restoranlarımız için misafir ilişkileri ofisimizden rezervasyon yapabilirsiniz.",
        en: 'You can make a reservation through our guest relations office for our a la carte restaurants.',
        de: 'Unsere A la carte Restaurants erfordern eine Reservierung, die Sie gerne bei unserem Guest Relations Team vornehmen.',
        ru: 'Вы можете забронировать столик в наших ресторанах a la carte через службу гостеприимства.',
    },
    ctaPhone: { tr: 'Rezervasyon', en: 'Reservation', de: 'Reservierung', ru: 'Бронирование' },
    seoDesc: {
        tr: 'Blue Dreams Resort Bodrum restoranları, barları ve loungelar. Begonvılle ana restoran, Halicarnassus deniz mahsulleri, La Locanda İtalyan mutfağı.',
        en: 'Blue Dreams Resort Bodrum restaurants, bars and lounges. Begonvılle main restaurant, Halicarnassus seafood, La Locanda Italian cuisine.',
        de: 'Blue Dreams Resort Bodrum Restaurants, Bars und Lounges. Begonvılle Hauptrestaurant, Halicarnassus Meeresfrüchte, La Locanda italienische Küche.',
        ru: 'Рестораны, бары и лаунджи Blue Dreams Resort Bodrum. Главный ресторан Begonvılle, морепродукты Halicarnassus, итальянская кухня La Locanda.',
    },
}

const g = (key: string, locale: string) => t[key]?.[locale] || t[key]?.['en'] || key

/* ─── SEO Metadata ─── */
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const title = `${g('title', locale)} | Blue Dreams Resort`
    const description = g('seoDesc', locale)
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            url: `https://new.bluedreamsresort.com/${locale}/restoran`,
            images: [{ url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80', width: 1200, height: 630 }],
        },
        alternates: {
            canonical: `https://new.bluedreamsresort.com/${locale}/restoran`,
            languages: { tr: '/tr/restoran', en: '/en/restoran', de: '/de/restoran', ru: '/ru/restoran' },
        },
    }
}

/* ─── Page Component ─── */
export default async function RestaurantPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    const allVenues = await prisma.dining.findMany({
        where: { locale, isActive: true },
        include: { events: { where: { isActive: true }, orderBy: { createdAt: 'desc' } } },
        orderBy: { order: 'asc' }
    })

    // Split into restaurants vs bars by type
    const restaurants = allVenues.filter(v => v.type?.toLowerCase() !== 'bar')
    const bars = allVenues.filter(v => v.type?.toLowerCase() === 'bar')

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white">

            {/* ═══ HERO ═══ */}
            <section className="relative h-screen min-h-[700px] flex items-end">
                <div className="absolute inset-0">
                    <Image
                        src="/images/dining/hero.jpg"
                        alt={g('title', locale)}
                        fill
                        className="object-cover"
                        priority
                        unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                </div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24 w-full">
                    <div className="max-w-2xl">
                        <div className="w-12 h-[2px] bg-[#c9a96e] mb-6" />
                        <h1 className="text-5xl md:text-7xl font-serif tracking-tight mb-6">
                            {g('title', locale)}
                        </h1>
                        <p className="text-lg md:text-xl text-white/70 leading-relaxed font-light">
                            {g('subtitle', locale)}
                        </p>
                    </div>
                </div>
            </section>

            {/* ═══ RESTAURANTS ═══ */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <div className="w-12 h-[2px] bg-[#c9a96e] mx-auto mb-6" />
                        <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-4">
                            {g('restaurantsTitle', locale)}
                        </h2>
                    </div>

                    {restaurants.length === 0 ? (
                        <div className="text-center py-20">
                            <UtensilsCrossed className="w-16 h-16 text-white/20 mx-auto mb-4" />
                            <h3 className="text-2xl font-serif mb-2">{g('comingSoon', locale)}</h3>
                            <p className="text-white/50">{g('comingSoonDesc', locale)}</p>
                        </div>
                    ) : (
                        <div className="space-y-32">
                            {restaurants.map((venue, index) => {
                                const isEven = index % 2 === 0
                                return (
                                    <div key={venue.id} className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                                        {/* Image */}
                                        <div className="w-full lg:w-[55%] relative">
                                            <div className="aspect-[4/3] relative rounded-xl overflow-hidden group">
                                                <Image
                                                    src={venue.image}
                                                    alt={venue.title}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                                {venue.type && (
                                                    <div className="absolute top-6 left-6 bg-[#c9a96e]/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-[#0a0a0a]">
                                                        {venue.type}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="w-full lg:w-[45%] space-y-8">
                                            <div>
                                                <div className="w-8 h-[2px] bg-[#c9a96e] mb-4" />
                                                <h3 className="text-3xl md:text-4xl font-serif mb-4">{venue.title}</h3>
                                                <p className="text-white/60 leading-relaxed text-lg">
                                                    {venue.description}
                                                </p>
                                            </div>

                                            {/* Details Grid */}
                                            <div className="grid grid-cols-2 gap-y-6 gap-x-6 border-y border-white/10 py-6">
                                                {venue.cuisine && (
                                                    <div className="flex gap-3 items-start">
                                                        <UtensilsCrossed className="w-5 h-5 text-[#c9a96e] shrink-0 mt-0.5" />
                                                        <div>
                                                            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">{g('cuisine', locale)}</div>
                                                            <div className="text-white font-medium">{venue.cuisine}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {venue.hours && (
                                                    <div className="flex gap-3 items-start">
                                                        <Clock className="w-5 h-5 text-[#c9a96e] shrink-0 mt-0.5" />
                                                        <div>
                                                            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">{g('hours', locale)}</div>
                                                            <div className="text-white font-medium">{venue.hours}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {venue.capacity && (
                                                    <div className="flex gap-3 items-start">
                                                        <Users className="w-5 h-5 text-[#c9a96e] shrink-0 mt-0.5" />
                                                        <div>
                                                            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">{g('capacity', locale)}</div>
                                                            <div className="text-white font-medium">{venue.capacity} {g('capacityUnit', locale)}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {venue.location && (
                                                    <div className="flex gap-3 items-start">
                                                        <MapPin className="w-5 h-5 text-[#c9a96e] shrink-0 mt-0.5" />
                                                        <div>
                                                            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">{g('location', locale)}</div>
                                                            <div className="text-white font-medium">{venue.location}</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Features */}
                                            {venue.features && (
                                                <div>
                                                    <div className="text-sm font-bold text-white/80 mb-3 uppercase tracking-wider">{g('highlights', locale)}</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {venue.features.split(',').map((f, i) => (
                                                            <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/70 rounded-lg text-sm">
                                                                {f.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Special Events */}
                                            {venue.events && venue.events.length > 0 && (
                                                <div className="pt-6 border-t border-white/10 mt-6">
                                                    <h4 className="text-sm font-bold text-white/80 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                        <Star className="text-[#c9a96e]" size={16} />
                                                        {g('specialEvents', locale)}
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {venue.events.map(event => (
                                                            <div key={event.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex gap-4 items-center hover:bg-white/10 transition-colors">
                                                                {event.image ? (
                                                                    <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative">
                                                                        <Image src={event.image} alt={event.title} fill className="object-cover" />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-14 h-14 rounded-lg bg-[#c9a96e]/10 text-[#c9a96e] flex items-center justify-center shrink-0">
                                                                        <Star size={20} />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-bold text-white text-sm truncate">{event.title}</div>
                                                                    {(event.date || event.time) && (
                                                                        <div className="text-[11px] text-[#c9a96e] mt-1 font-medium">
                                                                            {event.date && <span>{new Date(event.date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'ru' ? 'ru-RU' : 'en-US')}</span>}
                                                                            {event.date && event.time && <span className="mx-1">•</span>}
                                                                            {event.time && <span>{event.time}</span>}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Menu Link */}
                                            {(venue as any).menuUrl && (
                                                <div className="pt-4">
                                                    <a
                                                        href={(venue as any).menuUrl}
                                                        className="inline-flex items-center justify-center px-8 py-3.5 bg-[#c9a96e] text-[#0a0a0a] hover:bg-[#b8954f] transition-colors duration-300 rounded-full text-sm font-bold tracking-widest uppercase"
                                                    >
                                                        {g('viewMenu', locale)}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ═══ BARS & LOUNGES ═══ */}
            {bars.length > 0 && (
                <section className="py-24 px-6 bg-[#111]">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="w-12 h-[2px] bg-[#c9a96e] mx-auto mb-6" />
                            <h2 className="text-3xl md:text-5xl font-serif tracking-tight mb-4 flex items-center justify-center gap-4">
                                <Wine className="w-8 h-8 text-[#c9a96e]" />
                                {g('barsTitle', locale)}
                            </h2>
                            <p className="text-white/50 text-lg max-w-2xl mx-auto">
                                {g('barsSubtitle', locale)}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bars.map((bar) => (
                                <div key={bar.id} className="group relative overflow-hidden rounded-xl aspect-[3/4] cursor-pointer">
                                    <Image
                                        src={bar.image}
                                        alt={bar.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                                    {/* Default state — title visible */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <GlassWater className="w-4 h-4 text-[#c9a96e]" />
                                            <span className="text-[#c9a96e] text-xs font-bold uppercase tracking-widest">{bar.type}</span>
                                        </div>
                                        <h3 className="text-2xl font-serif mb-2">{bar.title}</h3>
                                        <p className="text-white/50 text-sm line-clamp-2 group-hover:line-clamp-none transition-all duration-300">
                                            {bar.description}
                                        </p>
                                        {bar.hours && (
                                            <div className="flex items-center gap-2 mt-3 text-white/40 text-sm">
                                                <Clock className="w-4 h-4" />
                                                {bar.hours}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ═══ CTA / RESERVATION ═══ */}
            <section className="py-24 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="w-12 h-[2px] bg-[#c9a96e] mx-auto mb-8" />
                    <h2 className="text-3xl md:text-4xl font-serif mb-6">{g('ctaTitle', locale)}</h2>
                    <p className="text-white/50 text-lg mb-10 leading-relaxed">
                        {g('ctaDesc', locale)}
                    </p>
                    <a
                        href="tel:+902523371111"
                        className="inline-flex items-center gap-3 px-10 py-4 border-2 border-[#c9a96e] text-[#c9a96e] hover:bg-[#c9a96e] hover:text-[#0a0a0a] transition-all duration-300 rounded-full text-sm font-bold tracking-widest uppercase"
                    >
                        {g('ctaPhone', locale)} — +90 252 337 11 11
                    </a>
                </div>
            </section>
        </main>
    )
}
