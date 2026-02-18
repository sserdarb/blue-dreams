import PageHeader from '@/components/shared/PageHeader'
import AmenityGrid from '@/components/shared/AmenityGrid'
import { ROOM_TYPES } from '@/lib/content'
import { Maximize, Users, Mountain } from 'lucide-react'
import LivePricing from '@/components/shared/LivePricing'

export default function ClubRoomsPage() {
    const room = ROOM_TYPES.find(r => r.id === 'club')!

    return (
        <div>
            <PageHeader
                title={room.title}
                subtitle={room.description}
                backgroundImage={room.heroImage}
                breadcrumbs={[
                    { label: 'Odalar', href: '/tr/odalar' },
                    { label: 'Club Odalar', href: '/tr/odalar/club' },
                ]}
            />

            {/* Room Details */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Content */}
                        <div>
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                {room.subtitle}
                            </span>
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                {room.title}
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                {room.longDescription}
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
                            <LivePricing roomFilter="club" />

                            {/* CTA */}
                            <a
                                href="https://blue-dreams.rezervasyonal.com/"
                                className="inline-block bg-brand text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors"
                            >
                                Rezervasyon Yap
                            </a>
                        </div>

                        {/* Gallery */}
                        <div className="space-y-4">
                            <img
                                src={room.gallery[0]}
                                alt={room.title}
                                className="w-full h-[300px] object-cover rounded-lg shadow-lg"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                {room.gallery.slice(1, 3).map((img, index) => (
                                    <img
                                        key={index}
                                        src={img}
                                        alt={`${room.title} ${index + 2}`}
                                        className="w-full h-[150px] object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Amenities */}
            <section className="py-16 bg-sand">
                <div className="container mx-auto px-6">
                    <h3 className="text-3xl font-serif text-gray-900 mb-8 text-center">
                        Oda Özellikleri
                    </h3>
                    <div className="max-w-4xl mx-auto">
                        <AmenityGrid amenities={room.amenities} columns={4} />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <h3 className="text-3xl font-serif text-gray-900 mb-8 text-center">
                        Ekstra Özellikler
                    </h3>
                    <div className="max-w-2xl mx-auto">
                        <ul className="space-y-3">
                            {room.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-3 text-gray-700">
                                    <span className="w-2 h-2 bg-brand rounded-full"></span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Other Rooms */}
            <section className="py-16 bg-brand-dark text-white">
                <div className="container mx-auto px-6 text-center">
                    <h3 className="text-3xl font-serif mb-8">Diğer Oda Tipleri</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {ROOM_TYPES.filter(r => r.id !== 'club').map(r => (
                            <a
                                key={r.id}
                                href={`/tr/odalar/${r.slug}`}
                                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-sm text-sm font-bold uppercase tracking-widest transition-colors"
                            >
                                {r.title}
                            </a>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
