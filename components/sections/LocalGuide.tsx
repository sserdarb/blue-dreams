import { MapPin, Calendar, Clock, Sparkles, ArrowRight, ExternalLink, Star, Music, Utensils, Sun } from 'lucide-react'
import { ATTRACTIONS, EVENTS } from '@/lib/constants'
import fs from 'fs'
import path from 'path'

interface ApprovedAttraction {
    id: string
    title: string
    address?: string
    rating?: number
    reviews?: number
    type?: string
    thumbnail?: string
    description?: string
    link?: string
}

interface ApprovedEvent {
    id: string
    title: string
    date?: string
    time?: string
    venue?: string
    thumbnail?: string
    description?: string
    link?: string
    source?: string
}

// Read approved items and merge with live SerpAPI cache
async function getApprovedItems() {
    try {
        const approvedPath = path.join(process.cwd(), 'data', 'approved-local-guide.json')
        if (!fs.existsSync(approvedPath)) return { attractions: [], events: [] }

        const approved = JSON.parse(fs.readFileSync(approvedPath, 'utf-8'))

        // Try to get cached SerpAPI data from the runtime cache
        // Since this is server-rendered, we import the service directly
        const { fetchBodrumAttractions, fetchBodrumEvents } = await import('@/lib/services/serpapi')

        const allAttractions = await fetchBodrumAttractions()
        const allEvents = await fetchBodrumEvents()

        const approvedAttractions = allAttractions
            .filter(a => approved.attractions?.includes(a.id))
            .slice(0, 6)

        const approvedEvents = allEvents
            .filter(e => approved.events?.includes(e.id))
            .slice(0, 6)

        return { attractions: approvedAttractions, events: approvedEvents }
    } catch (error) {
        console.warn('[LocalGuide] Could not load approved items:', error)
        return { attractions: [], events: [] }
    }
}

export default async function LocalGuide() {
    const approved = await getApprovedItems()
    const hasApprovedAttractions = approved.attractions.length > 0
    const hasApprovedEvents = approved.events.length > 0

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

                {/* ── Çevrede Yapılabilecekler ── */}
                <div className="mb-20">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-serif text-gray-900">Çevrede Yapılabilecekler</h3>
                        <a href="#" className="text-brand hover:text-brand-dark text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors">
                            Tüm Rotaları Gör <ArrowRight size={14} />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* SerpAPI Approved Attractions */}
                        {hasApprovedAttractions ? (
                            approved.attractions.map((place: ApprovedAttraction) => (
                                <div key={place.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                                    <div className="relative h-64 overflow-hidden">
                                        <img
                                            src={place.thumbnail || '/placeholder-attraction.jpg'}
                                            alt={place.title}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-brand">
                                            {place.type || 'Turistik Yer'}
                                        </div>
                                        {place.rating ? (
                                            <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 text-amber-400 text-xs font-semibold">
                                                <Star size={12} fill="currentColor" /> {place.rating}
                                            </div>
                                        ) : null}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-xl font-serif font-bold text-gray-900 group-hover:text-brand transition-colors">{place.title}</h4>
                                            {place.address && (
                                                <div className="flex items-center text-gray-400 text-xs whitespace-nowrap bg-gray-50 px-2 py-1 rounded ml-2">
                                                    <MapPin size={12} className="mr-1" /> {place.address.split(',')[0]}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                                            {place.description}
                                        </p>
                                        {place.link ? (
                                            <a href={place.link} target="_blank" rel="noopener" className="text-brand text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                                                Yol Tarifi Al <ExternalLink size={12} />
                                            </a>
                                        ) : (
                                            <button className="text-brand text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:gap-2 transition-all">
                                                Yol Tarifi Al <ExternalLink size={12} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            /* Fallback: Static ATTRACTIONS */
                            ATTRACTIONS.map((place) => (
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
                            ))
                        )}
                    </div>
                </div>

                {/* ── Yaklaşan Etkinlikler ── */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-serif text-gray-900">Yaklaşan Etkinlikler</h3>
                        <a href="#" className="text-brand hover:text-brand-dark text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors">
                            Takvimi İncele <Calendar size={14} />
                        </a>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {hasApprovedEvents ? (
                            approved.events.map((evt: ApprovedEvent) => (
                                <div key={evt.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:border-brand/30 transition-colors shadow-sm hover:shadow-md group">
                                    {/* Thumbnail or date */}
                                    {evt.thumbnail ? (
                                        <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden">
                                            <img src={evt.thumbnail} alt={evt.title} className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                                            <Calendar size={24} className="text-brand group-hover:text-white" />
                                        </div>
                                    )}

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{evt.title}</h4>
                                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
                                            {evt.date && <span className="flex items-center gap-1"><Clock size={12} /> {evt.date}</span>}
                                            {evt.venue && <span className="flex items-center gap-1"><MapPin size={12} /> {evt.venue}</span>}
                                            {evt.source && (
                                                <span className="px-1.5 py-0.5 bg-brand/10 text-brand rounded text-[9px] font-semibold">
                                                    {evt.source === 'tripadvisor' ? 'TripAdvisor' : 'Google'}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-1 group-hover:text-brand transition-colors">
                                            {evt.description}
                                        </p>
                                    </div>

                                    {/* Link */}
                                    {evt.link && (
                                        <div className="hidden sm:flex w-12 h-20 flex-shrink-0 items-center justify-center">
                                            <a href={evt.link} target="_blank" rel="noopener" className="text-gray-300 hover:text-brand transition-colors">
                                                <ExternalLink size={18} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            /* Fallback: Static EVENTS */
                            EVENTS.map((evt) => (
                                <div key={evt.id} className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 hover:border-brand/30 transition-colors shadow-sm hover:shadow-md group">
                                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex flex-col items-center justify-center text-center group-hover:bg-brand group-hover:text-white transition-colors duration-300">
                                        <span className="text-2xl font-serif font-bold leading-none mb-1">{evt.day}</span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{evt.month}</span>
                                    </div>
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
                                    <div className="hidden sm:flex w-20 h-20 bg-brand/5 rounded-lg flex-shrink-0 items-center justify-center group-hover:bg-brand/10 transition-colors duration-300">
                                        {evt.id === 1 && <Music size={32} className="text-brand" />}
                                        {evt.id === 2 && <Utensils size={32} className="text-brand" />}
                                        {evt.id === 3 && <Sun size={32} className="text-brand" />}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </section>
    )
}
