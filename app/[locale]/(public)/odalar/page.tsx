import PageHeader from '@/components/shared/PageHeader'
import RoomCard from '@/components/shared/RoomCard'
import { ROOM_TYPES } from '@/lib/content'

export default function RoomsPage() {
    return (
        <div>
            <PageHeader
                title="Odalar & Suitler"
                subtitle="Bodrum'un kalbinde, denize nazır konforlu odalarımızda unutulmaz bir konaklama deneyimi yaşayın."
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg"
                breadcrumbs={[{ label: 'Odalar', href: '/tr/odalar' }]}
            />

            {/* Intro Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            Konaklama Seçenekleri
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900 mb-6">
                            Odalarımızı <span className="italic text-brand">İnceleyin</span>
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Otelimiz odaları yamaca yerleşik bungalovlar ve denizle iç içe ana binaya yerleşik şekildedir.
                            Her biri özenle tasarlanmış odalarımız, Bodrum'un büyüleyici atmosferini odanıza taşır.
                        </p>
                    </div>
                </div>
            </section>

            {/* Room Cards */}
            <section className="py-16 bg-sand">
                <div className="container mx-auto px-6 space-y-12">
                    {ROOM_TYPES.map((room, index) => (
                        <RoomCard
                            key={room.id}
                            room={{
                                id: room.id,
                                title: room.title,
                                subtitle: room.subtitle,
                                description: room.description,
                                image: room.heroImage,
                                size: room.size,
                                capacity: room.capacity,
                                view: room.view,
                                amenities: room.amenities.map(a => a.label),
                            }}
                            variant="horizontal"
                            href={`/tr/odalar/${room.slug}`}
                        />
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-brand-dark text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-serif mb-4">Size Uygun Odayı Bulun</h2>
                    <p className="text-white/70 mb-8 max-w-xl mx-auto">
                        Müsaitlik kontrolü yapın ve en uygun fiyatlarla rezervasyon oluşturun.
                    </p>
                    <a
                        href="https://blue-dreams.rezervasyonal.com/"
                        className="inline-block bg-white text-brand-dark px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-light hover:text-white transition-colors"
                    >
                        Online Rezervasyon
                    </a>
                </div>
            </section>
        </div>
    )
}
