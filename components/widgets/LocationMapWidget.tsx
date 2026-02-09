'use client'

import { MapPin, Navigation } from 'lucide-react'

interface LocationMapData {
    lat?: number
    lng?: number
    zoom?: number
    title?: string
    label?: string
    description?: string
    address?: string
    directionsUrl?: string
    directionsText?: string
}

export function LocationMapWidget({ data }: { data: LocationMapData }) {
    const lat = data.lat || 37.091832
    const lng = data.lng || 27.4824998
    const zoom = data.zoom || 17
    const directionsUrl = data.directionsUrl || `https://www.google.com/maps/dir//${lat},${lng}/@${lat},${lng},16z`

    return (
        <section className="w-full h-[400px] md:h-[550px] relative bg-gray-200 group">
            <iframe
                src={`https://maps.google.com/maps?q=${lat},${lng}&hl=tr&z=${zoom}&output=embed`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={data.title || 'Blue Dreams Resort Location'}
                className="w-full h-full block grayscale-[20%] group-hover:grayscale-0 transition-all duration-1000"
            ></iframe>

            {/* Overlay Content */}
            <div className="absolute top-1/2 left-4 md:left-12 -translate-y-1/2 bg-white/95 backdrop-blur-md p-8 shadow-2xl max-w-sm hidden md:block border-l-4 border-brand animate-fade-in-up">
                {data.label && (
                    <span className="text-xs font-bold tracking-[0.2em] text-brand uppercase mb-2 block">{data.label}</span>
                )}
                <h3 className="font-serif text-2xl text-gray-900 mb-4">{data.title || 'Blue Dreams Resort'}</h3>
                {data.description && (
                    <p className="text-gray-600 leading-relaxed mb-6 font-light text-sm">{data.description}</p>
                )}

                {data.address && (
                    <div className="flex items-start space-x-3 text-sm text-gray-800 mb-6">
                        <MapPin className="w-5 h-5 text-brand shrink-0" />
                        <span dangerouslySetInnerHTML={{ __html: data.address.replace(/\n/g, '<br />') }} />
                    </div>
                )}

                <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-brand text-white px-6 py-3 hover:bg-brand-dark transition-colors w-fit"
                >
                    <Navigation size={14} />
                    {data.directionsText || 'Yol Tarifi Al'}
                </a>
            </div>
        </section>
    )
}
