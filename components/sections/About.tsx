export default function About() {
    return (
        <section id="about" className="py-24 md:py-32 bg-brand-dark text-white relative overflow-hidden">
            {/* Background Texture/Pattern */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

            <div className="container mx-auto px-6 md:px-12 text-center md:text-left">
                <div className="max-w-5xl mx-auto text-center">
                    <span className="block text-brand-light text-xs font-bold tracking-[0.3em] uppercase mb-8">
                        Blue Dreams Deneyimi
                    </span>

                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif leading-tight md:leading-snug font-light">
                        Ege&apos;nin kıyısında <span className="italic font-normal text-brand-light">sizin yeriniz</span>,
                        mevsimlerin ritmiyle hazırlanan <span className="italic font-normal text-brand-light">eşsiz lezzetler</span>
                        ve bizim hikayemizin <span className="italic font-normal text-brand-light">sizin hikayenizle</span> buluştuğu nokta.
                    </h2>

                    <div className="mt-12 h-16 w-px bg-white/20 mx-auto"></div>
                </div>
            </div>
        </section>
    )
}
