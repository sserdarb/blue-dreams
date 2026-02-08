import PageHeader from '@/components/shared/PageHeader'
import RoomCard from '@/components/shared/RoomCard'
import { ROOM_TYPES } from '@/lib/content'
import { getRoomsPageContent } from '@/lib/translations'

export default async function RoomsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = getRoomsPageContent(locale as any)

    return (
        <div>
            <PageHeader
                title={t.title}
                subtitle={t.subtitle}
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg"
                breadcrumbs={[{ label: t.breadcrumb, href: `/${locale}/odalar` }]}
            />

            {/* Intro Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            {t.badge}
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900 mb-6">
                            {t.heading} <span className="italic text-brand">{t.headingAccent}</span>
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            {t.intro}
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
                            href={`/${locale}/odalar/${room.slug}`}
                        />
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-brand-dark text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-serif mb-4">{t.ctaTitle}</h2>
                    <p className="text-white/70 mb-8 max-w-xl mx-auto">
                        {t.ctaSub}
                    </p>
                    <a
                        href="https://blue-dreams.rezervasyonal.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block bg-white text-brand-dark px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-light hover:text-white transition-colors"
                    >
                        {t.ctaBtn}
                    </a>
                </div>
            </section>
        </div>
    )
}
