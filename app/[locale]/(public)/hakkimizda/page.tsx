import PageHeader from '@/components/shared/PageHeader'
import { Award, Users, Calendar, MapPin } from 'lucide-react'

export default function AboutPage() {
    return (
        <div>
            <PageHeader
                title="Hakkımızda"
                subtitle="1998'den bu yana Bodrum'da misafirperverlik geleneğini sürdürüyoruz."
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg"
                breadcrumbs={[{ label: 'Hakkımızda', href: '/tr/hakkimizda' }]}
            />

            {/* Story Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                Hikayemiz
                            </span>
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                Her Güzel Rüya <span className="italic text-brand">Blue Dreams'te Başlar</span>
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Bodrum'un en güzel koylarından biri olan Torba Zeytinlikahve'de 55.000 m² alan
                                üzerinde doğa ile iç içe ve Bodrum mimarisine özgü denize sıfır tesisimizde
                                tatiliniz için hayal ettiğiniz her şeyi bulacaksınız.
                            </p>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                Serinlemek ve dinlenmek için 700 m uzunluğunda kumsal, iskeleleri ve özel
                                Cabana alanları bulunan tesisimiz farklı gündüz ve akşam aktiviteleri ile
                                eğlenceyi de sağlıyor.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Tesisimizde başlayan eğlenceyi gecenin ilerleyen saatlerine taşımak isterseniz
                                10 km uzaklıkta olan Bodrum şehir merkezine araç ile 10 dakikada ulaşabiliyorsunuz.
                                Eşsiz konumu ile ulaşımı kolay olan otelimiz Milas-Bodrum Havaalanına ise sadece
                                25 km uzaklıkta.
                            </p>
                        </div>

                        <div className="relative">
                            <img
                                src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg"
                                alt="Blue Dreams Resort"
                                className="w-full h-[500px] object-cover rounded-lg shadow-2xl"
                            />
                            <div className="absolute -bottom-8 -right-8 bg-brand text-white p-8 rounded-lg shadow-xl hidden lg:block">
                                <span className="text-5xl font-serif font-bold">25+</span>
                                <span className="block text-sm uppercase tracking-widest mt-1">Yıllık Deneyim</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 bg-brand-dark text-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Award size={32} />
                            </div>
                            <span className="text-4xl font-serif font-bold block">5★</span>
                            <span className="text-white/70 text-sm">Yıldızlı Otel</span>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users size={32} />
                            </div>
                            <span className="text-4xl font-serif font-bold block">500+</span>
                            <span className="text-white/70 text-sm">Oda Kapasitesi</span>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar size={32} />
                            </div>
                            <span className="text-4xl font-serif font-bold block">1998</span>
                            <span className="text-white/70 text-sm">Kuruluş Yılı</span>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin size={32} />
                            </div>
                            <span className="text-4xl font-serif font-bold block">55K</span>
                            <span className="text-white/70 text-sm">m² Alan</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-sand">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            Değerlerimiz
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900">
                            Neden Blue Dreams?
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🌊</span>
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-3">Eşsiz Konum</h3>
                            <p className="text-gray-600 text-sm">
                                Torba'nın sakin koyunda, doğayla iç içe, şehrin gürültüsünden uzak bir cennet.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✨</span>
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-3">Ultra Her Şey Dahil</h3>
                            <p className="text-gray-600 text-sm">
                                Tüm yeme-içme, aktiviteler ve spa hizmetleri dahil, ekstra masraf yok.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🌿</span>
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-3">Sürdürülebilirlik</h3>
                            <p className="text-gray-600 text-sm">
                                Doğaya saygılı, yerel ürünlere öncelik veren, çevre dostu uygulamalar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-serif text-gray-900 mb-4">
                        Sizinle Tanışmak İstiyoruz
                    </h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">
                        Sorularınız için bize ulaşın veya hemen rezervasyon yapın.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="/tr/iletisim"
                            className="bg-brand text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors"
                        >
                            İletişim
                        </a>
                        <a
                            href="https://blue-dreams.rezervasyonal.com/"
                            className="border border-brand text-brand px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand hover:text-white transition-colors"
                        >
                            Rezervasyon
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
