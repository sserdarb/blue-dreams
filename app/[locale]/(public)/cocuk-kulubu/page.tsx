import Image from 'next/image'
import { Metadata } from 'next'

const t: Record<string, Record<string, string>> = {
    title: { tr: 'Çocuk Kulübü', en: 'Kids Club', de: 'Kinderclub', ru: 'Детский клуб' },
    subtitle: {
        tr: 'Çocuklarınız için eğlence dolu, güvenli ve unutulmaz anlar.',
        en: 'A fun, safe, and unforgettable experience for your children.',
        de: 'Spaß, Sicherheit und unvergessliche Momente für Ihre Kinder.',
        ru: 'Полные веселья, безопасные и незабываемые моменты для ваших детей.',
    },
    activitiesTitle: { tr: 'Etkinliklerimiz', en: 'Our Activities', de: 'Unsere Aktivitäten', ru: 'Наши активности' },
    scheduleTitle: { tr: 'Günlük Program', en: 'Daily Schedule', de: 'Tagesprogramm', ru: 'Расписание дня' },
    ages: { tr: '4-12 Yaş', en: 'Ages 4-12', de: '4-12 Jahre', ru: '4-12 лет' },
}

const g = (key: string, locale: string) => t[key]?.[locale] || t[key]?.['en'] || key

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    return { title: `${g('title', locale)} | Blue Dreams Resort` }
}

export default async function KidsClubPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    const activities = [
        {
            title: locale === 'tr' ? 'Yüz Boyama ve El Sanatları' : 'Face Painting & Crafts',
            desc: locale === 'tr' ? 'Çocukların yaratıcılıklarını geliştiren sanatsal atölyeler.' : 'Art workshops that enhance children’s creativity.',
            img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1471&auto=format&fit=crop', // Kids painting
        },
        {
            title: locale === 'tr' ? 'Çocuk Havuz Oyunları' : 'Kids Pool Games',
            desc: locale === 'tr' ? 'Gözetmen eşliğinde güvenli ve eğlenceli su oyunları.' : 'Safe and fun water games under supervision.',
            img: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?q=80&w=1471&auto=format&fit=crop', // Kids coloring/fun (Replaced 404 image)
        },
        {
            title: locale === 'tr' ? 'Mini Disko' : 'Mini Disco',
            desc: locale === 'tr' ? 'Akşamları çocuklara özel müzik ve dans gösterileri.' : 'Special music and dancing for children in the evening.',
            img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1440&auto=format&fit=crop', // Kids dancing/party
        }
    ]

    return (
        <main className="min-h-screen bg-[#f0f9ff] dark:bg-[#0f172a] text-slate-800 dark:text-white pt-28 pb-16 relative overflow-hidden">
            {/* Playful Floating Background Elements */}
            <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/30 rounded-full blur-3xl animate-[bounce_6s_infinite]" />
            <div className="absolute top-40 right-20 w-48 h-48 bg-pink-400/30 rounded-full blur-3xl animate-[bounce_5s_infinite_reverse]" />
            <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-cyan-400/30 rounded-full blur-3xl animate-[pulse_4s_infinite]" />
            <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-purple-400/30 rounded-full blur-3xl animate-[ping_8s_infinite]" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/40 dark:bg-black/20 blur-[80px] rounded-full pointer-events-none" />
                    <div className="inline-block relative">
                        <div className="w-20 h-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500 mx-auto mb-6 rounded-full transform -rotate-2" />
                        <h1 className="text-5xl md:text-7xl font-black mb-4 flex flex-wrap justify-center items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-pink-500 to-purple-600 dark:from-yellow-300 dark:via-orange-400 dark:to-pink-500 tracking-tight drop-shadow-sm">
                            {g('title', locale)}
                            <span className="text-sm px-5 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-3xl font-bold align-middle ml-2 shadow-xl shadow-cyan-500/30 -rotate-6 inline-block hover:rotate-6 transition-transform duration-300">
                                {g('ages', locale)}
                            </span>
                        </h1>
                    </div>
                    <p className="text-slate-600 dark:text-white/80 text-xl max-w-2xl mx-auto font-medium bg-white/50 dark:bg-black/30 backdrop-blur-md py-4 px-8 rounded-full shadow-sm border border-white/40 dark:border-white/10 inline-block mt-4">
                        ✨ {g('subtitle', locale)} ✨
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {activities.map((act, i) => {
                        const colors = [
                            'from-yellow-400 to-orange-500 shadow-orange-500/20',
                            'from-cyan-400 to-blue-500 shadow-blue-500/20',
                            'from-pink-400 to-purple-500 shadow-purple-500/20'
                        ]
                        const rotation = i % 2 === 0 ? 'hover:rotate-2' : 'hover:-rotate-2'
                        return (
                            <div key={i} className={`bg-white dark:bg-[#1e293b] rounded-[3rem] p-4 shadow-2xl ${colors[i % 3]} hover:-translate-y-4 transition-all duration-300 group ${rotation} border-4 border-transparent hover:border-white/50 relative overflow-hidden`}>
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/20 dark:bg-white/5 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700" />
                                <div className={`h-64 rounded-[2.5rem] overflow-hidden mb-6 relative border-4 border-white dark:border-slate-800 shadow-inner`}>
                                    <Image src={act.img} alt={act.title} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" unoptimized />
                                    {/* Cute shape overlay */}
                                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/40 to-transparent rounded-tl-full" />
                                </div>
                                <div className="px-4 pb-6 text-center">
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-3 tracking-tight">{act.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">{act.desc}</p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="bg-gradient-to-br from-white to-orange-50 dark:from-[#1e293b] dark:to-[#0f172a] border-4 border-orange-200 dark:border-orange-900/40 rounded-[4rem] p-10 md:p-16 text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden transform hover:scale-[1.01] transition-transform duration-500">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-10 left-10 w-16 h-16 rounded-full bg-yellow-400/30 dark:bg-yellow-400/20 blur-md animate-pulse" />
                    <div className="absolute bottom-10 right-10 w-20 h-20 rounded-full bg-pink-400/30 dark:bg-pink-400/20 blur-md animate-pulse delay-700" />
                    <div className="absolute -top-10 right-20 w-32 h-32 bg-cyan-400/20 dark:bg-cyan-400/10 rounded-full blur-xl" />

                    <div className="inline-block bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-6 py-2 rounded-full font-black uppercase tracking-widest text-sm mb-6 border border-orange-200 dark:border-orange-800/50">
                        ⏱️ {g('scheduleTitle', locale)}
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 mb-12 text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto font-medium">
                        {locale === 'tr' ? 'Çocuk Kulübümüz her gün muhteşem etkinliklerle dolu!' : 'Our Kids Club is packed with amazing activities every day!'}
                        <br />
                        <span className="text-base md:text-lg text-slate-500 dark:text-slate-400 mt-4 block">
                            {locale === 'tr' ? '10:00 - 12:30 ve 14:30 - 17:00 saatleri arasında profesyonel ekibimizle hizmetinizdeyiz.' : 'Open 10:00 - 12:30 and 14:30 - 17:00 with our professional team.'}
                        </span>
                    </p>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-base font-bold">
                        <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-xl shadow-blue-500/20 px-8 py-4 rounded-3xl transform -rotate-2 hover:rotate-0 transition-all cursor-default">
                            🌅 10:00 - 12:30
                        </div>
                        <div className="bg-gradient-to-r from-orange-400 to-red-500 text-white shadow-xl shadow-red-500/20 px-8 py-4 rounded-3xl transform rotate-2 hover:rotate-0 transition-all cursor-default">
                            ☀️ 14:30 - 17:00
                        </div>
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl shadow-purple-500/30 px-8 py-4 rounded-3xl transform -rotate-1 hover:rotate-2 transition-all cursor-default border-2 border-white/20 animate-pulse">
                            🎉 20:30 Mini Disko
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}
