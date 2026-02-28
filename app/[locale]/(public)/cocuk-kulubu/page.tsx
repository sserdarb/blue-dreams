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
            img: 'https://images.unsplash.com/photo-1544453535-ecb6020588ce?q=80&w=1471&auto=format&fit=crop', // Kids in pool
        },
        {
            title: locale === 'tr' ? 'Mini Disko' : 'Mini Disco',
            desc: locale === 'tr' ? 'Akşamları çocuklara özel müzik ve dans gösterileri.' : 'Special music and dancing for children in the evening.',
            img: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=1440&auto=format&fit=crop', // Kids dancing/party
        }
    ]

    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-16 mt-12">
                    <div className="w-12 h-[2px] bg-brand mx-auto mb-6" />
                    <h1 className="text-4xl md:text-6xl font-serif mb-4 flex justify-center items-center gap-4">
                        {g('title', locale)}
                        <span className="text-sm px-3 py-1 bg-brand text-white rounded-full font-sans align-middle ml-2">{g('ages', locale)}</span>
                    </h1>
                    <p className="text-white/60 text-lg max-w-2xl mx-auto">
                        {g('subtitle', locale)}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    {activities.map((act, i) => (
                        <div key={i} className="bg-[#111] rounded-2xl overflow-hidden group">
                            <div className="relative h-64 overflow-hidden">
                                <Image src={act.img} alt={act.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" unoptimized />
                                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-serif text-brand mb-2">{act.title}</h3>
                                <p className="text-white/60 text-sm">{act.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-[#111] border border-white/10 rounded-2xl p-8 md:p-12 text-center max-w-4xl mx-auto">
                    <h2 className="text-3xl font-serif mb-4 text-brand">{g('scheduleTitle', locale)}</h2>
                    <p className="text-white/70 mb-6">
                        {locale === 'tr' ? 'Çocuk Kulübümüz her gün 10:00 - 12:30 ve 14:30 - 17:00 saatleri arasında, profesyonel ve eğitimli ekibimizle hizmet vermektedir. Akşam 20:30\'da ise Mini Disko etkinliğimize katılabilirsiniz.' : 'Our Kids Club is open every day from 10:00 to 12:30 and 14:30 to 17:00 with our professional and trained staff. You can also join our Mini Disco event at 20:30.'}
                    </p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                        <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full">10:00 - 12:30</span>
                        <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-full">14:30 - 17:00</span>
                        <span className="bg-brand/20 text-brand border border-brand/50 px-4 py-2 rounded-full">20:30 Mini Disko</span>
                    </div>
                </div>
            </div>
        </main>
    )
}
