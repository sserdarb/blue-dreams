'use client'

import { usePathname } from 'next/navigation'

export default function Experience() {
    const pathname = usePathname()
    const locale = pathname?.split('/')[1] || 'tr'

    const t = {
        tr: {
            nature: 'Doğa & Konfor', natureH1: 'Doğa ile', natureH2: 'bütünleşin',
            natureP: "Torba'nın çam ormanlarıyla kaplı tepelerinde, Ege'nin turkuaz sularına nazır bir konum. Müstakil girişli odalarımız ve doğal mimarimiz ile kalabalıktan uzak, kendinizle baş başa kalabileceğiniz özel bir yaşam alanı sunuyoruz.",
            natureBtn: 'Odaları Keşfet',
            gastro: 'Gastronomi', gastroH1: 'Taze. Yerel.', gastroH2: 'Sürdürülebilir.',
            gastroP: "Blue Dreams mutfağında her tabak bir hikaye anlatır. Yerel üreticilerden temin edilen taze Ege otları, günlük deniz ürünleri ve ödüllü şeflerimizin modern yorumlarıyla hazırlanan A la Carte restoranlarımızda gerçek bir lezzet yolculuğuna çıkın.",
            gastroBtn: 'Lezzetleri Tat',
            wellness: 'İyi Hisset', wellnessH1: 'Rahatla. Yenilen.', wellnessH2: 'Keyfini Çıkar.',
            wellnessP: 'Sonsuzluk havuzumuzda gün batımını izlerken veya Spa merkezimizin dingin atmosferinde ruhunuzu dinlendirirken zamanın yavaşladığını hissedeceksiniz. Türk hamamı ritüelleri ve masaj terapileri ile kendinizi şımartın.',
            wellnessBtn: 'Spa & Wellness',
        },
        en: {
            nature: 'Nature & Comfort', natureH1: 'Become one with', natureH2: 'nature',
            natureP: "On the pine-covered hills of Torba, overlooking the turquoise waters of the Aegean. Our detached rooms and natural architecture offer a private living space away from the crowds.",
            natureBtn: 'Explore Rooms',
            gastro: 'Gastronomy', gastroH1: 'Fresh. Local.', gastroH2: 'Sustainable.',
            gastroP: "Every dish in Blue Dreams kitchen tells a story. Embark on a true culinary journey at our A la Carte restaurants prepared with fresh Aegean herbs from local producers, daily seafood, and modern interpretations by our award-winning chefs.",
            gastroBtn: 'Taste the Flavors',
            wellness: 'Feel Good', wellnessH1: 'Relax. Rejuvenate.', wellnessH2: 'Enjoy.',
            wellnessP: 'Feel time slow down while watching the sunset from our infinity pool or unwinding in the serene atmosphere of our Spa center. Pamper yourself with Turkish bath rituals and massage therapies.',
            wellnessBtn: 'Spa & Wellness',
        },
        de: {
            nature: 'Natur & Komfort', natureH1: 'Eins werden mit', natureH2: 'der Natur',
            natureP: "Auf den kiefernbedeckten Hügeln von Torba, mit Blick auf das türkisfarbene Wasser der Ägäis. Unsere freistehenden Zimmer und die natürliche Architektur bieten einen privaten Wohnraum abseits der Massen.",
            natureBtn: 'Zimmer Entdecken',
            gastro: 'Gastronomie', gastroH1: 'Frisch. Lokal.', gastroH2: 'Nachhaltig.',
            gastroP: "Jedes Gericht in der Blue Dreams Küche erzählt eine Geschichte. Begeben Sie sich auf eine kulinarische Reise in unseren A-la-Carte-Restaurants.",
            gastroBtn: 'Geschmack Erleben',
            wellness: 'Wohlbefinden', wellnessH1: 'Entspannen. Erneuern.', wellnessH2: 'Genießen.',
            wellnessP: 'Spüren Sie, wie die Zeit langsamer wird, während Sie den Sonnenuntergang am Infinity-Pool beobachten oder in der ruhigen Atmosphäre unseres Spa-Centers entspannen.',
            wellnessBtn: 'Spa & Wellness',
        },
        ru: {
            nature: 'Природа и Комфорт', natureH1: 'Станьте единым с', natureH2: 'природой',
            natureP: "На покрытых соснами холмах Торбы, с видом на бирюзовые воды Эгейского моря. Наши отдельные номера и натуральная архитектура предлагают приватное жилое пространство вдали от толпы.",
            natureBtn: 'Номера',
            gastro: 'Гастрономия', gastroH1: 'Свежее. Местное.', gastroH2: 'Устойчивое.',
            gastroP: "Каждое блюдо на кухне Blue Dreams рассказывает свою историю. Отправляйтесь в настоящее кулинарное путешествие в наших ресторанах A la Carte.",
            gastroBtn: 'Попробовать',
            wellness: 'Хорошее Самочувствие', wellnessH1: 'Расслабьтесь. Обновитесь.', wellnessH2: 'Наслаждайтесь.',
            wellnessP: 'Почувствуйте, как время замедляется, когда вы наблюдаете за закатом у бассейна инфинити или расслабляетесь в спокойной атмосфере нашего Спа-центра.',
            wellnessBtn: 'Спа и Велнес',
        },
    }
    const texts = t[locale as keyof typeof t] || t.tr

    return (
        <section id="experience" className="bg-sand">

            {/* Block 1: Nature / Location */}
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-[500px] md:h-auto">
                    <img
                        src="https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg"
                        alt="Doğa ve Odalar"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col justify-center p-12 md:p-20 bg-sand">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">{texts.nature}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                        {texts.natureH1} <br />
                        <span className="italic font-light">{texts.natureH2}</span>
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed font-light">
                        {texts.natureP}
                    </p>
                    <a href={`/${locale}/odalar`} className="bg-[#b08d55] hover:bg-[#9a7b4f] text-white px-8 py-3 w-fit text-xs font-bold tracking-widest uppercase rounded-sm transition-colors">
                        {texts.natureBtn}
                    </a>
                </div>
            </div>

            {/* Block 2: Gastronomy (Reversed) */}
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="flex flex-col justify-center p-12 md:p-20 bg-white order-2 md:order-1">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">{texts.gastro}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                        {texts.gastroH1} <br />
                        <span className="italic font-light">{texts.gastroH2}</span>
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed font-light">
                        {texts.gastroP}
                    </p>
                    <a href={`/${locale}/restoran`} className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 py-3 w-fit text-xs font-bold tracking-widest uppercase rounded-sm transition-colors">
                        {texts.gastroBtn}
                    </a>
                </div>
                <div className="relative h-[500px] md:h-auto order-1 md:order-2">
                    <img
                        src="https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg"
                        alt="Gastronomi"
                        className="w-full h-full object-cover"
                    />
                    {/* Inset small image style */}
                    <div className="absolute bottom-10 left-10 w-40 h-40 border-4 border-white shadow-xl hidden lg:block overflow-hidden">
                        <img
                            src="https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg"
                            alt="Detay"
                            className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                        />
                    </div>
                </div>
            </div>

            {/* Block 3: Wellness / Relax */}
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="relative h-[500px] md:h-auto">
                    <img
                        src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg"
                        alt="Wellness ve Havuz"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-col justify-center p-12 md:p-20 bg-[#f0eee9]">
                    <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">{texts.wellness}</span>
                    <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                        {texts.wellnessH1} <br />
                        <span className="italic font-light">{texts.wellnessH2}</span>
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed font-light">
                        {texts.wellnessP}
                    </p>
                    <a href={`/${locale}/spa`} className="bg-brand hover:bg-brand-dark text-white px-8 py-3 w-fit text-xs font-bold tracking-widest uppercase rounded-sm transition-colors">
                        {texts.wellnessBtn}
                    </a>
                </div>
            </div>

        </section>
    )
}
