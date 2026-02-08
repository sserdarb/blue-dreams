'use client'

import { ChevronDown } from 'lucide-react'
import { usePathname } from 'next/navigation'

export default function Hero() {
    const pathname = usePathname()
    const locale = pathname?.split('/')[1] || 'tr'

    const t = {
        tr: { badge: "Bodrum'un İncisi", h1a: "Ege'nin Mavi", h1b: "Rüyası", sub: "Doğanın kalbinde, lüksün ve huzurun buluştuğu nokta.", sub2: "Evinize, Blue Dreams'e hoş geldiniz.", btn1: "Odaları Keşfet", btn2: "Tanıtım Filmi", scroll: "Keşfet" },
        en: { badge: "Pearl of Bodrum", h1a: "Aegean Blue", h1b: "Dream", sub: "Where luxury and tranquility meet in the heart of nature.", sub2: "Welcome to your home, Blue Dreams.", btn1: "Explore Rooms", btn2: "Promo Video", scroll: "Discover" },
        de: { badge: "Perle von Bodrum", h1a: "Ägäischer Blauer", h1b: "Traum", sub: "Wo Luxus und Ruhe im Herzen der Natur aufeinandertreffen.", sub2: "Willkommen in Ihrem Zuhause, Blue Dreams.", btn1: "Zimmer Entdecken", btn2: "Promovideo", scroll: "Entdecken" },
        ru: { badge: "Жемчужина Бодрума", h1a: "Эгейская Голубая", h1b: "Мечта", sub: "Где роскошь и спокойствие встречаются в сердце природы.", sub2: "Добро пожаловать домой, в Blue Dreams.", btn1: "Номера", btn2: "Промо видео", scroll: "Откройте" },
    }
    const texts = t[locale as keyof typeof t] || t.tr

    return (
        <div className="relative h-screen min-h-[700px] w-full bg-dark overflow-hidden">
            {/* Main Image - Aerial View */}
            <div className="absolute inset-0">
                <img
                    src="https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg"
                    alt="Blue Dreams Resort Aerial View"
                    className="w-full h-full object-cover scale-105 animate-kenburns"
                />
                {/* Dark Overlay for Readability */}
                <div className="absolute inset-0 bg-black/50"></div>
                {/* Gradient Overlay for Depth */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
            </div>

            {/* Center Text Content */}
            <div className="relative z-20 h-full flex flex-col justify-center items-center text-center container mx-auto px-4">

                <div className="animate-fade-in-up space-y-6 max-w-4xl mx-auto">

                    {/* Top Badge */}
                    <div className="inline-block border border-white/30 backdrop-blur-sm bg-white/10 px-6 py-2 rounded-full mb-4">
                        <span className="text-white text-xs md:text-sm font-bold tracking-[0.3em] uppercase">
                            {texts.badge}
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h1 className="flex flex-col items-center">
                        <span className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] drop-shadow-2xl">
                            {texts.h1a}
                        </span>
                        <span className="text-6xl md:text-8xl lg:text-9xl font-serif italic text-brand-light leading-[1] -mt-2 md:-mt-4 drop-shadow-2xl">
                            {texts.h1b}
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-white/90 text-sm md:text-lg font-light tracking-wider max-w-xl mx-auto mt-6 leading-relaxed drop-shadow-md">
                        {texts.sub} <br className="hidden md:block" />
                        {texts.sub2}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
                        <a
                            href={`/${locale}/odalar`}
                            className="bg-brand hover:bg-white hover:text-brand text-white px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-sm shadow-xl hover:shadow-2xl"
                        >
                            {texts.btn1}
                        </a>
                        <a
                            href="https://youtu.be/Et5yM-tW7_0?si=Fv3tqPE_ejRnwSar"
                            target="_blank"
                            rel="noreferrer"
                            className="border border-white text-white hover:bg-white hover:text-dark px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-sm shadow-md"
                        >
                            {texts.btn2}
                        </a>
                    </div>

                </div>

            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 animate-bounce text-white/70">
                <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest opacity-80">{texts.scroll}</span>
                    <ChevronDown size={24} strokeWidth={1} />
                </div>
            </div>
        </div>
    )
}
