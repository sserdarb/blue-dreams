export const dynamic = 'force-dynamic'

import PageHeader from '@/components/shared/PageHeader'
import AmenityGrid from '@/components/shared/AmenityGrid'
import { Maximize, Users, Mountain } from 'lucide-react'
import LivePricing from '@/components/shared/LivePricing'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'

export default async function DynamicRoomPage({ params }: { params: Promise<{ locale: string, slug: string }> }) {
    const { locale, slug } = await params

    // Fetch room from DB by slug
    const room = await prisma.room.findFirst({
        where: { locale, slug }
    })

    if (!room) {
        notFound()
    }

    // Parse JSON fields
    let gallery: string[] = []
    try {
        if (room.gallery) gallery = JSON.parse(room.gallery)
    } catch (e) { /* ignore */ }

    let amenities: { icon: string; label: string }[] = []
    try {
        if (room.amenities) amenities = JSON.parse(room.amenities)
    } catch (e) { /* ignore */ }

    let features: string[] = []
    try {
        if (room.features) features = JSON.parse(room.features)
    } catch (e) { /* ignore */ }

    // Fetch other rooms for "Other Room Types" section
    const otherRooms = await prisma.room.findMany({
        where: { locale, NOT: { id: room.id } },
        orderBy: { order: 'asc' },
        select: { id: true, slug: true, title: true }
    })

    const roomFilter = room.title.toLowerCase().includes('aile') ? 'aile' : room.title.toLowerCase().includes('club') ? 'club' : 'deluxe'

    return (
        <div>
            <PageHeader
                title={room.title}
                subtitle={room.description}
                backgroundImage={room.image}
                breadcrumbs={[
                    { label: 'Odalar', href: `/${locale}/odalar` },
                    { label: room.title, href: `/${locale}/odalar/${room.slug}` },
                ]}
            />

            {/* Room Details */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Content */}
                        <div>
                            {room.subtitle && (
                                <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                    {room.subtitle}
                                </span>
                            )}
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                {room.title}
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-8 whitespace-pre-line">
                                {room.longDescription || room.description}
                            </p>

                            {/* Quick Info */}
                            <div className="grid grid-cols-3 gap-4 mb-8">
                                <div className="bg-sand p-4 rounded-lg text-center">
                                    <Maximize className="mx-auto text-brand mb-2" size={24} />
                                    <span className="block text-sm text-gray-500">Büyüklük</span>
                                    <span className="block font-bold text-gray-900">{room.size}</span>
                                </div>
                                <div className="bg-sand p-4 rounded-lg text-center">
                                    <Users className="mx-auto text-brand mb-2" size={24} />
                                    <span className="block text-sm text-gray-500">Kapasite</span>
                                    <span className="block font-bold text-gray-900">{room.capacity}</span>
                                </div>
                                <div className="bg-sand p-4 rounded-lg text-center">
                                    <Mountain className="mx-auto text-brand mb-2" size={24} />
                                    <span className="block text-sm text-gray-500">Manzara</span>
                                    <span className="block font-bold text-gray-900 text-xs">{room.view}</span>
                                </div>
                            </div>

                            {/* Live Pricing */}
                            <LivePricing roomFilter={roomFilter} />

                            {/* CTA */}
                            <Link
                                href={`/${locale}/booking`}
                                className="inline-block bg-brand text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors"
                            >
                                Rezervasyon Yap
                            </Link>
                        </div>

                        {/* Gallery */}
                        <div className="space-y-4">
                            <img
                                src={gallery[0] || room.image}
                                alt={room.title}
                                className="w-full h-[300px] object-cover rounded-lg shadow-lg"
                            />
                            {gallery.length > 2 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {gallery.slice(1, 3).map((img, index) => (
                                        <img
                                            key={index}
                                            src={img}
                                            alt={`${room.title} ${index + 2}`}
                                            className="w-full h-[150px] object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Amenities */}
            {amenities.length > 0 && (
                <section className="py-16 bg-sand">
                    <div className="container mx-auto px-6">
                        <h3 className="text-3xl font-serif text-gray-900 mb-8 text-center">
                            Oda Özellikleri
                        </h3>
                        <div className="max-w-4xl mx-auto">
                            <AmenityGrid amenities={amenities} columns={4} />
                        </div>
                    </div>
                </section>
            )}

            {/* Features */}
            {features.length > 0 && (
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-6">
                        <h3 className="text-3xl font-serif text-gray-900 mb-8 text-center">
                            Ekstra Özellikler
                        </h3>
                        <div className="max-w-2xl mx-auto">
                            <ul className="space-y-3">
                                {features.map((feature, index) => (
                                    <li key={index} className="flex items-center gap-3 text-gray-700">
                                        <span className="w-2 h-2 bg-brand rounded-full"></span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>
            )}

            {/* Other Rooms */}
            {otherRooms.length > 0 && (
                <section className="py-16 bg-brand-dark text-white">
                    <div className="container mx-auto px-6 text-center">
                        <h3 className="text-3xl font-serif mb-8">Diğer Oda Tipleri</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {otherRooms.map(r => (
                                <Link
                                    key={r.id}
                                    href={`/${locale}/odalar/${r.slug || r.id}`}
                                    className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors"
                                >
                                    {r.title}
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    )
}
