import { MapPin, Calendar, Clock, Sparkles, ArrowRight, ExternalLink, Music, Utensils, Sun } from 'lucide-react'
import { ATTRACTIONS, EVENTS } from '@/lib/constants'

export default function LocalGuide() {
    return (
        <section className="py-24 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-6 md:px-12">

                {/* Section Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-brand/10 text-brand px-4 py-1.5 rounded-full mb-4 animate-fade-in-up">
                        <Sparkles size={14} />
                        <span className="text-[10px] font-bold tracking-widest uppercase">AI Concierge Selection</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-serif text-gray-900 mb-6">
                        Keşfet & <span className="italic text-brand font-light">Deneyimle</span>
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
                        Yapay zeka asistanımız Blue Concierge tarafından, ilgi alanlarınıza ve mevsime özel olarak derlenen
                        Bodrum rotaları ve otel içi etkinlik takvimi.
                    </p>
                </div>

                {/* Attractions Grid */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-serif text-gray-900">Çevrede Yapılabilecekler</h3>
                        <a href="#" className="text-brand hover:text-brand-dark text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors">
                            Tüm Rotaları Gör <ArrowRight size={14} />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {ATTRACTIONS.map((place) => (
                            <div key={place.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                <div className="relative h-64 overflow-hidden">
                                    <img src={place.image} alt={place.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-brand">
                                        {place.tag}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-xl font-serif font-bold text-gray-900 group-hover:text-brand transition-colors">{place.title}</h4>
                                        <div className="flex items-center text-gray-400 text-xs whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                                            <MapPin size={12} className="mr-1" /> {place.distance}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                        {place.description}
                                    </p>
                                    <button className="text-brand text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                                        Yol Tarifi Al <ExternalLink size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Events */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-serif text-gray-900">Yaklaşan Etkinlikler</h3>
                        <a href="#" className="text-brand hover:text-brand-dark text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors">
                            Takvimi İncele <Calendar size={14} />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {EVENTS.map((evt) => (
                            <div key={evt.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:border-brand/30 transition-colors shadow-sm hover:shadow-md group">
                                {/* Date Box */}
                                <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                                    <span className="text-2xl font-serif font-bold leading-none mb-1">{evt.day}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">{evt.month}</span>
                                </div>

                                {/* Info */}
                                <div className="flex-1 flex flex-col justify-center">
                                    <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{evt.title}</h4>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {evt.time}</span>
                                        <span className="flex items-center gap-1"><MapPin size={12} /> {evt.location}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-1 group-hover:text-brand transition-colors">
                                        {evt.description}
                                    </p>
                                </div>

                                {/* Icon Box */}
                                <div className="hidden sm:flex w-20 h-20 bg-brand/5 rounded-lg flex-shrink-0 items-center justify-center group-hover:bg-brand/10 transition-colors duration-300">
                                    {evt.id === 1 && <Music size={32} className="text-brand" />}
                                    {evt.id === 2 && <Utensils size={32} className="text-brand" />}
                                    {evt.id === 3 && <Sun size={32} className="text-brand" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    )
}
