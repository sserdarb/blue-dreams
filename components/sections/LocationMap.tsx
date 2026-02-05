import { MapPin, Navigation } from 'lucide-react'

export default function LocationMap() {
    return (
        <section className="w-full h-[400px] md:h-[550px] relative bg-gray-200 group">
            <iframe
                src="https://maps.google.com/maps?q=37.091832,27.4824998&hl=tr&z=17&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Blue Dreams Resort Location"
                className="w-full h-full block grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
            ></iframe>

            {/* Overlay Content */}
            <div className="absolute top-1/2 left-4 md:left-12 -translate-y-1/2 bg-white/95 backdrop-blur-md p-8 shadow-2xl max-w-sm hidden md:block border-l-4 border-brand animate-fade-in-up">
                <span className="text-xs font-bold tracking-[0.2em] text-brand uppercase mb-2 block">Konum</span>
                <h3 className="font-serif text-2xl text-gray-900 mb-4">Blue Dreams Resort</h3>
                <p className="text-gray-600 leading-relaxed mb-6 font-light text-sm">
                    Ege&apos;nin en güzel koylarından biri olan Torba Zeytinli Kahve Mevkii&apos;nde, denize sıfır konumda sizleri bekliyoruz.
                </p>

                <div className="flex items-start space-x-3 text-sm text-gray-800 mb-6">
                    <MapPin className="w-5 h-5 text-brand shrink-0" />
                    <span>Torba Mahallesi, Herodot Bulvarı No:11<br />Bodrum / MUĞLA</span>
                </div>

                <a
                    href="https://www.google.com/maps/dir//37.091832,27.4824998/@37.091832,27.4824998,16z"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-brand text-white px-6 py-3 hover:bg-brand-dark transition-colors w-fit"
                >
                    <Navigation size={14} />
                    Yol Tarifi Al
                </a>
            </div>
        </section>
    )
}
