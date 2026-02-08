import PageHeader from '@/components/shared/PageHeader'
import { Award, Users, Calendar, MapPin } from 'lucide-react'
import { getAboutPageContent } from '@/lib/translations'

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const t = getAboutPageContent(locale as any)

    return (
        <div>
            <PageHeader
                title={t.title}
                subtitle={t.subtitle}
                backgroundImage="https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg"
                breadcrumbs={[{ label: t.breadcrumb, href: `/${locale}/hakkimizda` }]}
            />

            {/* Story Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                {t.storyLabel}
                            </span>
                            <h2 className="text-4xl font-serif text-gray-900 mb-6">
                                {t.storyH2} <span className="italic text-brand">{t.storyH2accent}</span>
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">{t.storyP1}</p>
                            <p className="text-gray-600 leading-relaxed mb-6">{t.storyP2}</p>
                            <p className="text-gray-600 leading-relaxed">{t.storyP3}</p>
                        </div>

                        <div className="relative">
                            <img
                                src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg"
                                alt="Blue Dreams Resort"
                                className="w-full h-[500px] object-cover rounded-lg shadow-2xl"
                            />
                            <div className="absolute -bottom-8 -right-8 bg-brand text-white p-8 rounded-lg shadow-xl hidden lg:block">
                                <span className="text-5xl font-serif font-bold">25+</span>
                                <span className="block text-sm uppercase tracking-widest mt-1">{t.yearsBadge}</span>
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
                            <span className="text-white/70 text-sm">{t.stats.star}</span>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users size={32} />
                            </div>
                            <span className="text-4xl font-serif font-bold block">340+</span>
                            <span className="text-white/70 text-sm">{t.stats.rooms}</span>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar size={32} />
                            </div>
                            <span className="text-4xl font-serif font-bold block">1998</span>
                            <span className="text-white/70 text-sm">{t.stats.year}</span>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MapPin size={32} />
                            </div>
                            <span className="text-4xl font-serif font-bold block">55K</span>
                            <span className="text-white/70 text-sm">{t.stats.area}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-sand">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                            {t.valuesLabel}
                        </span>
                        <h2 className="text-4xl font-serif text-gray-900">
                            {t.valuesH2}
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🌊</span>
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-3">{t.value1title}</h3>
                            <p className="text-gray-600 text-sm">{t.value1desc}</p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">✨</span>
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-3">{t.value2title}</h3>
                            <p className="text-gray-600 text-sm">{t.value2desc}</p>
                        </div>

                        <div className="bg-white p-8 rounded-lg shadow-md text-center">
                            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">🌿</span>
                            </div>
                            <h3 className="text-xl font-serif text-gray-900 mb-3">{t.value3title}</h3>
                            <p className="text-gray-600 text-sm">{t.value3desc}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-white text-center">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-serif text-gray-900 mb-4">{t.ctaH2}</h2>
                    <p className="text-gray-600 mb-8 max-w-xl mx-auto">{t.ctaSub}</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href={`/${locale}/iletisim`}
                            className="bg-brand text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors"
                        >
                            {t.ctaBtn1}
                        </a>
                        <a
                            href="https://blue-dreams.rezervasyonal.com/"
                            target="_blank"
                            rel="noreferrer"
                            className="border border-brand text-brand px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand hover:text-white transition-colors"
                        >
                            {t.ctaBtn2}
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
