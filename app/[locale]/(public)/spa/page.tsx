import PageHeader from '@/components/shared/PageHeader'
import { SPA_SERVICES } from '@/lib/content'
import { Clock, Phone, Sparkles } from 'lucide-react'

export default function SpaPage() {
    return (
        <div>
            <PageHeader
                title="Spa & Wellness"
                subtitle="Naya Spa'da ruhunuzu dinlendirin, bedeninizi yenileyin."
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg"
                breadcrumbs={[{ label: 'Spa & Wellness', href: '/tr/spa' }]}
            />

            {/* Intro */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                Naya Spa
                            </span>
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                Rahatla. Yenilen. <span className="italic text-brand">Keyfini Çıkar.</span>
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Sonsuzluk havuzumuzda gün batımını izlerken veya Spa merkezimizin dingin
                                atmosferinde ruhunuzu dinlendirirken zamanın yavaşladığını hissedeceksiniz.
                                Türk hamamı ritüelleri ve masaj terapileri ile kendinizi şımartın.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Profesyonel terapistlerimiz tarafından uygulanan bakımlar, bedensel ve
                                zihinsel dengenizi yeniden kurmanıza yardımcı olur.
                            </p>

                            <div className="flex items-center gap-4">
                                <a
                                    href="https://wa.me/905495167823"
                                    className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors"
                                >
                                    <Phone size={16} /> Randevu Al
                                </a>
                            </div>
                        </div>

                        <div className="relative">
                            <img
                                src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg"
                                alt="Naya Spa"
                                className="w-full h-[400px] object-cover rounded-lg shadow-2xl"
                            />
                            <div className="absolute -bottom-6 -left-6 bg-brand text-white p-6 rounded-lg shadow-xl">
                                <Sparkles size={32} className="mb-2" />
                                <span className="block text-2xl font-serif">Naya</span>
                                <span className="text-xs uppercase tracking-widest">Spa & Wellness</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="py-16 bg-sand">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            Hizmetlerimiz
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900">
                            Spa Menüsü
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {SPA_SERVICES.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 group"
                            >
                                <div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-brand group-hover:text-white transition-colors">
                                    <Sparkles size={24} className="text-brand group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-serif text-gray-900 mb-2 group-hover:text-brand transition-colors">
                                    {service.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-4">
                                    {service.description}
                                </p>
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock size={14} className="mr-1" />
                                    {service.duration}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Facilities */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            Tesisler
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900">
                            Wellness Olanakları
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <img
                                src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg"
                                alt="Sonsuzluk Havuzu"
                                className="w-full h-[200px] object-cover rounded-lg mb-4"
                            />
                            <h3 className="text-xl font-serif text-gray-900 mb-2">Sonsuzluk Havuzu</h3>
                            <p className="text-gray-600 text-sm">Ege'ye nazır, muhteşem gün batımı manzarası</p>
                        </div>
                        <div className="text-center">
                            <img
                                src="https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg"
                                alt="Özel Plaj"
                                className="w-full h-[200px] object-cover rounded-lg mb-4"
                            />
                            <h3 className="text-xl font-serif text-gray-900 mb-2">Özel Plaj</h3>
                            <p className="text-gray-600 text-sm">700 metre kumsal ve cabana alanları</p>
                        </div>
                        <div className="text-center">
                            <img
                                src="https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg"
                                alt="Fitness Center"
                                className="w-full h-[200px] object-cover rounded-lg mb-4"
                            />
                            <h3 className="text-xl font-serif text-gray-900 mb-2">Fitness Center</h3>
                            <p className="text-gray-600 text-sm">Modern ekipmanlarla donatılmış spor salonu</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-brand-dark text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-serif mb-4">Kendinizi Şımartın</h2>
                    <p className="text-white/70 mb-8 max-w-xl mx-auto">
                        Spa randevunuzu önceden alarak bekleme süresi olmadan hizmet alabilirsiniz.
                    </p>
                    <a
                        href="https://wa.me/905495167823"
                        className="inline-block bg-white text-brand-dark px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-light hover:text-white transition-colors"
                    >
                        WhatsApp ile Randevu
                    </a>
                </div>
            </section>
        </div>
    )
}
