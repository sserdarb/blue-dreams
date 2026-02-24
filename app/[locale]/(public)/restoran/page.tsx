export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Users, UtensilsCrossed, Star } from 'lucide-react'

export default async function RestaurantPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    // Fetch restaurants from the Custom Admin DB
    const restaurants = await prisma.dining.findMany({
        where: { locale, isActive: true },
        include: { events: { where: { isActive: true }, orderBy: { createdAt: 'desc' } } },
        orderBy: { order: 'asc' }
    })

    return (
        <main className="min-h-screen bg-[#FDFBF7]">
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center">
                <div className="absolute inset-0">
                    <Image
                        src="https://bluedreamsresort.com/wp-content/uploads/2023/03/ana-restaurant.jpg"
                        alt="Yeme & İçme"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
                <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
                    <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 tracking-wide drop-shadow-lg">
                        {locale === 'tr' ? 'Yeme & İçme' : locale === 'en' ? 'Dining' : locale === 'de' ? 'Gastronomie' : 'Рестораны'}
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto">
                        {locale === 'tr' ? 'Ege’nin taze lezzetleri ve dünya mutfağından seçkin tatlar ile benzersiz bir gastronomi yolculuğu.' : 'A unique culinary journey with fresh Aegean flavors and exclusive tastes from world cuisine.'}
                    </p>
                </div>
            </section>

            {/* Restaurants List */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto space-y-32">
                    {restaurants.length === 0 ? (
                        <div className="text-center py-20">
                            <UtensilsCrossed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h2 className="text-2xl font-serif text-gray-900 mb-2">Çok Yakında</h2>
                            <p className="text-gray-500">Restoran bilgilerimiz güncellenmektedir.</p>
                        </div>
                    ) : (
                        restaurants.map((venue, index) => {
                            const isEven = index % 2 === 0
                            return (
                                <div key={venue.id} className={`flex flex-col lg:flex-row gap-12 lg:gap-20 items-center ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                                    {/* Image Side */}
                                    <div className="w-full lg:w-1/2 relative">
                                        <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-2xl group">
                                            <Image
                                                src={venue.image}
                                                alt={venue.title}
                                                fill
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            {venue.type && (
                                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase text-gray-900 shadow-sm">
                                                    {venue.type}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="w-full lg:w-1/2 space-y-8">
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-4">{venue.title}</h2>
                                            <p className="text-gray-600 leading-relaxed text-lg">
                                                {venue.description}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-y border-gray-200 py-6">
                                            {venue.cuisine && (
                                                <div className="flex gap-3 items-start">
                                                    <UtensilsCrossed className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Mutfak</div>
                                                        <div className="text-gray-900 font-medium">{venue.cuisine}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {venue.hours && (
                                                <div className="flex gap-3 items-start">
                                                    <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Saatler</div>
                                                        <div className="text-gray-900 font-medium">{venue.hours}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {venue.capacity && (
                                                <div className="flex gap-3 items-start">
                                                    <Users className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Kapasite</div>
                                                        <div className="text-gray-900 font-medium">{venue.capacity} Kişi</div>
                                                    </div>
                                                </div>
                                            )}
                                            {venue.location && (
                                                <div className="flex gap-3 items-start">
                                                    <MapPin className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Konum</div>
                                                        <div className="text-gray-900 font-medium">{venue.location}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {venue.features && (
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Öne Çıkanlar</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {venue.features.split(',').map((f, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium">
                                                            {f.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Special Events */}
                                        {venue.events && venue.events.length > 0 && (
                                            <div className="pt-6 border-t border-gray-100 mt-6">
                                                <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                    <Star className="text-emerald-500" size={16} />
                                                    {locale === 'tr' ? 'Özel Geceler & Temalar' : 'Special Events'}
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {venue.events.map(event => (
                                                        <div key={event.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4 items-center hover:shadow-md transition-shadow">
                                                            {event.image ? (
                                                                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 relative bg-gray-100">
                                                                    <Image src={event.image} alt={event.title} fill className="object-cover" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-14 h-14 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                                                    <Star size={20} />
                                                                </div>
                                                            )}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-bold text-gray-900 text-sm truncate" title={event.title}>{event.title}</div>
                                                                {(event.date || event.time) && (
                                                                    <div className="text-[11px] text-emerald-600 mt-1 font-medium bg-emerald-50 py-0.5 px-2 rounded inline-block">
                                                                        {event.date && <span>{new Date(event.date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}</span>}
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
                                        <div className="pt-4">
                                            <a href={`/${locale}/menu/${venue.id}`} className="inline-flex items-center justify-center px-8 py-3.5 bg-[#2C3E35] text-white hover:bg-[#1E2B25] transition-colors duration-300 rounded-full text-sm font-bold tracking-widest uppercase shadow-lg shadow-[#2C3E35]/20">
                                                {locale === 'tr' ? 'Menüyü İncele' : 'View Menu'}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </section>
        </main>
    )
}
