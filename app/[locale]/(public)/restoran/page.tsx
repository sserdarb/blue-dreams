import PageHeader from '@/components/shared/PageHeader'
import { RESTAURANTS } from '@/lib/content'
import { Clock, ChefHat } from 'lucide-react'
import { getRestaurantPageContent } from '@/lib/translations'

export default async function RestaurantPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = getRestaurantPageContent(locale as any)

    return (
        <div>
            <PageHeader
                title={t.title}
                subtitle={t.subtitle}
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg"
                breadcrumbs={[{ label: t.breadcrumb, href: `/${locale}/restoran` }]}
            />

            {/* Intro */}
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

            {/* Restaurants Grid */}
            <section className="py-16 bg-sand">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {RESTAURANTS.map((venue, index) => (
                            <div
                                key={venue.id}
                                className="group bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative h-[280px] overflow-hidden">
                                    <img
                                        src={venue.image}
                                        alt={venue.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute top-4 left-4 bg-brand text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                        {venue.subtitle}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="text-2xl font-serif text-gray-900 mb-3 group-hover:text-brand transition-colors">
                                        {venue.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                        {venue.description}
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                        {venue.hours && (
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} /> {venue.hours}
                                            </span>
                                        )}
                                        {venue.cuisine && (
                                            <span className="flex items-center gap-1">
                                                <ChefHat size={14} /> {venue.cuisine}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* All Inclusive Banner */}
            <section className="py-20 bg-brand-dark text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl font-serif mb-4">{t.allIncH2}</h2>
                    <p className="text-white/70 mb-8 max-w-2xl mx-auto">{t.allIncSub}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://wa.me/902523371111"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-white text-brand-dark px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-light hover:text-white transition-colors"
                        >
                            {t.allIncBtn1}
                        </a>
                        <a
                            href={`/${locale}/odalar`}
                            className="border border-white text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-brand-dark transition-colors"
                        >
                            {t.allIncBtn2}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
