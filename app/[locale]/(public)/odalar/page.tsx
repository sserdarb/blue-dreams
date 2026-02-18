import { ROOM_TYPES } from '@/lib/content'
import Link from 'next/link'
import { Maximize, Users, Mountain } from 'lucide-react'
import BookingWidget from '@/components/booking/BookingWidget'

export default async function RoomsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    // Always render static room cards + BookingWidget
    // CMS widgets (if any) are used for supplementary hero content only

    // Static content using ROOM_TYPES data
    return (
        <div>
            {/* Hero Section */}
            <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${ROOM_TYPES[1]?.heroImage || ROOM_TYPES[0]?.heroImage})` }}
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center text-white px-6">
                    <p className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-4 animate-fadeIn">
                        Blue Dreams Resort & Spa
                    </p>
                    <h1 className="text-5xl md:text-6xl font-serif mb-4">
                        Odalar & Suitler
                    </h1>
                    <p className="text-lg text-white/80 max-w-2xl mx-auto">
                        Bodrum&apos;un eşsiz manzarası eşliğinde, konfor ve lüksün buluştuğu oda seçeneklerimizi keşfedin.
                    </p>
                </div>
            </section>

            {/* Room Cards */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-4 block">
                            Konaklama Seçenekleri
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900 mb-4">
                            Oda Tiplerimiz
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Her bütçeye ve ihtiyaca uygun oda seçeneklerimiz ile unutulmaz bir tatil deneyimi yaşayın.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {ROOM_TYPES.map(room => (
                            <Link
                                key={room.id}
                                href={`/${locale}/odalar/${room.slug}`}
                                className="group block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100"
                            >
                                {/* Room Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={room.heroImage}
                                        alt={room.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <span className="text-brand text-[10px] font-bold tracking-[0.2em] uppercase">
                                            {room.subtitle}
                                        </span>
                                        <h3 className="text-2xl font-serif text-white mt-1">
                                            {room.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Room Info */}
                                <div className="p-6">
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {room.description}
                                    </p>

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-3 gap-3 mb-6">
                                        <div className="text-center p-3 bg-sand rounded-lg">
                                            <Maximize className="mx-auto text-brand mb-1" size={18} />
                                            <span className="block text-xs text-gray-500">Büyüklük</span>
                                            <span className="block text-sm font-bold text-gray-900">{room.size}</span>
                                        </div>
                                        <div className="text-center p-3 bg-sand rounded-lg">
                                            <Users className="mx-auto text-brand mb-1" size={18} />
                                            <span className="block text-xs text-gray-500">Kapasite</span>
                                            <span className="block text-sm font-bold text-gray-900">{room.capacity}</span>
                                        </div>
                                        <div className="text-center p-3 bg-sand rounded-lg">
                                            <Mountain className="mx-auto text-brand mb-1" size={18} />
                                            <span className="block text-xs text-gray-500">Manzara</span>
                                            <span className="block text-[10px] font-bold text-gray-900">{room.view}</span>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-brand font-bold text-sm uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">
                                            Detayları Gör
                                        </span>
                                        <span className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-full group-hover:bg-brand-dark transition-colors text-lg">
                                            →
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Online Booking Section */}
            <section id="rezervasyon" className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-4 block">
                            Online Rezervasyon
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900 mb-4">
                            Hemen Rezervasyon Yapın
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            En uygun fiyatlar ve özel teklifler için doğrudan rezervasyon yapın. Canlı müsaitlik ve anlık fiyat bilgisi.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <BookingWidget />
                    </div>
                </div>
            </section>
        </div>
    )
}
