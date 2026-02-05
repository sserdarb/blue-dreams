import PageHeader from '@/components/shared/PageHeader'
import { SPA_SERVICES } from '@/lib/content'
import { Clock, Phone, Sparkles, Leaf, Droplets, Heart } from 'lucide-react'

export default function SpaPage() {
    // Featured spa services (with images)
    const featuredServices = SPA_SERVICES.filter(s => s.image)
    const otherServices = SPA_SERVICES.filter(s => !s.image)

    return (
        <div>
            <PageHeader
                title="Spa & Wellness"
                subtitle="Ege'nin büyüleyici atmosferinde, doğanın huzur veren dokunuşuyla bütünleşen Naya Spa."
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg"
                breadcrumbs={[{ label: 'Spa & Wellness', href: '/tr/spa' }]}
            />

            {/* Naya Spa Intro */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-brand/10 px-4 py-2 rounded-full mb-6">
                                <Sparkles className="w-4 h-4 text-brand" />
                                <span className="text-brand text-xs font-bold tracking-widest uppercase">Naya Spa</span>
                            </div>
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                Kendinizi <span className="italic text-brand">Yenileyin</span>
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Ege&apos;nin büyüleyici atmosferinde, doğanın huzur veren dokunuşuyla bütünleşen
                                Naya Spa, sizi benzersiz bir yenilenme deneyimine davet ediyor.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Geleneksel spa ritüellerini modern dokunuşlarla harmanladığımız özel bakımlarımız;
                                ruhsal, bedensel ve zihinsel olarak arınarak rahatlamanızı sağlıyor.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Doğadan ilham alarak dizayn ettiğimiz özel masaj odalarımızda, uzman terapistlerimizin
                                sunduğu kişiye özel bakımlarla stresinizi geride bırakın. Dünya çapında organik
                                sertifikalarına sahip özel bakım ürünlerimizle kendinizi şımartın.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="https://wa.me/905495167801"
                                    className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors"
                                >
                                    <Phone size={16} /> Rezervasyon Yapın
                                </a>
                                <a
                                    href="tel:+902523371111"
                                    className="inline-flex items-center gap-2 border border-brand text-brand px-6 py-3 font-bold uppercase tracking-widest text-sm hover:bg-brand hover:text-white transition-colors"
                                >
                                    Bugüne Özel Fırsat
                                </a>
                            </div>
                        </div>

                        <div className="relative">
                            <img
                                src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg"
                                alt="Naya Spa"
                                className="w-full h-[500px] object-cover rounded-lg shadow-2xl"
                            />
                            <div className="absolute -bottom-8 -left-8 bg-brand text-white p-8 rounded-lg shadow-xl hidden lg:block">
                                <Sparkles size={32} className="mb-2" />
                                <span className="block text-3xl font-serif">Naya</span>
                                <span className="text-xs uppercase tracking-widest">Spa & Wellness</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Massage Types */}
            <section className="py-16 bg-sand">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            Öne Çıkan Bakımlar
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900">
                            Masaj Terapileri
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {featuredServices.map((service) => (
                            <div
                                key={service.id}
                                className="bg-white rounded-lg overflow-hidden shadow-lg group hover:shadow-xl transition-all duration-300"
                            >
                                <div className="relative h-64 overflow-hidden">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="text-2xl font-serif">{service.title}</h3>
                                        <div className="flex items-center text-sm text-white/70 mt-1">
                                            <Clock size={14} className="mr-1" />
                                            {service.duration}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-600 text-sm">{service.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Other Services Grid */}
            <section className="py-16 bg-white">
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
                        {otherServices.map((service) => (
                            <div
                                key={service.id}
                                className="bg-sand p-6 rounded-lg hover:shadow-xl transition-all duration-300 group"
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

            {/* Wellness Features */}
            <section className="py-16 bg-brand-dark text-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-serif">Neden Naya Spa?</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Leaf size={32} />
                            </div>
                            <h3 className="text-xl font-serif mb-2">Organik Ürünler</h3>
                            <p className="text-white/70 text-sm">
                                Dünya çapında organik sertifikalarına sahip özel bakım ürünleri
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Heart size={32} />
                            </div>
                            <h3 className="text-xl font-serif mb-2">Uzman Terapistler</h3>
                            <p className="text-white/70 text-sm">
                                Kişiye özel bakımlar sunan deneyimli profesyonel ekip
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Droplets size={32} />
                            </div>
                            <h3 className="text-xl font-serif mb-2">Eşsiz Atmosfer</h3>
                            <p className="text-white/70 text-sm">
                                Doğadan ilham alan özel tasarım masaj odaları
                            </p>
                        </div>
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
                        <div className="text-center group">
                            <div className="overflow-hidden rounded-lg mb-4">
                                <img
                                    src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg"
                                    alt="Sonsuzluk Havuzu"
                                    className="w-full h-[200px] object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-2">Sonsuzluk Havuzu</h3>
                            <p className="text-gray-600 text-sm">Ege&apos;ye nazır, muhteşem gün batımı manzarası</p>
                        </div>
                        <div className="text-center group">
                            <div className="overflow-hidden rounded-lg mb-4">
                                <img
                                    src="https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg"
                                    alt="Özel Plaj"
                                    className="w-full h-[200px] object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-2">Özel Plaj</h3>
                            <p className="text-gray-600 text-sm">700 metre kumsal ve cabana alanları</p>
                        </div>
                        <div className="text-center group">
                            <div className="overflow-hidden rounded-lg mb-4">
                                <img
                                    src="https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg"
                                    alt="Fitness Center"
                                    className="w-full h-[200px] object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-2">Fitness Center</h3>
                            <p className="text-gray-600 text-sm">Modern ekipmanlarla donatılmış spor salonu</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gradient-to-r from-brand to-brand-dark text-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-serif mb-4">Kendinizi Şımartın</h2>
                    <p className="text-white/80 mb-8 max-w-xl mx-auto">
                        Spa randevunuzu önceden alarak bekleme süresi olmadan hizmet alabilirsiniz.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="https://wa.me/905495167823"
                            className="inline-block bg-white text-brand-dark px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-light hover:text-white transition-colors"
                        >
                            WhatsApp ile Randevu
                        </a>
                        <a
                            href="tel:+902523371111"
                            className="inline-block border border-white/30 text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors"
                        >
                            +90 252 337 11 11
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
