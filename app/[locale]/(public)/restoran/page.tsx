import PageHeader from '@/components/shared/PageHeader'
import { RESTAURANTS } from '@/lib/content'
import { Clock, ChefHat } from 'lucide-react'

export default function RestaurantPage() {
    return (
        <div>
            <PageHeader
                title="Restoran & Barlar"
                subtitle="Ege'nin taze lezzetleri ve dünya mutfağından özel tatlar ile gastronomi deneyimi."
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg"
                breadcrumbs={[{ label: 'Restoran & Barlar', href: '/tr/restoran' }]}
            />

            {/* Intro */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            Gastronomi
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900 mb-6">
                            Taze. Yerel. <span className="italic text-brand">Sürdürülebilir.</span>
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Blue Dreams mutfağında her tabak bir hikaye anlatır. Yerel üreticilerden temin edilen
                            taze Ege otları, günlük deniz ürünleri ve ödüllü şeflerimizin modern yorumlarıyla
                            hazırlanan restoranlarımızda gerçek bir lezzet yolculuğuna çıkın.
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
                                {/* Image */}
                                <div className="relative h-[280px] overflow-hidden">
                                    <img
                                        src={venue.image}
                                        alt={venue.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                                    {/* Badge */}
                                    <div className="absolute top-4 left-4 bg-brand text-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
                                        {venue.subtitle}
                                    </div>
                                </div>

                                {/* Content */}
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
                    <h2 className="text-4xl font-serif mb-4">
                        Ultra Her Şey Dahil
                    </h2>
                    <p className="text-white/70 mb-8 max-w-2xl mx-auto">
                        Tüm restoranlarımız ve barlarımız Ultra Her Şey Dahil konseptimize dahildir.
                        A la Carte restoranlarımız için rezervasyon önerilir.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://wa.me/902523371111"
                            className="bg-white text-brand-dark px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-light hover:text-white transition-colors"
                        >
                            Rezervasyon Yap
                        </a>
                        <a
                            href="/tr/odalar"
                            className="border border-white text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white hover:text-brand-dark transition-colors"
                        >
                            Odaları İncele
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
