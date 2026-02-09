'use client'

interface MapData {
    lat?: number
    lng?: number
    zoom?: number
    height?: string
    embedUrl?: string
}

export function MapWidget({ data }: { data: MapData }) {
    const height = data.height || '400px'
    const src = data.embedUrl || `https://maps.google.com/maps?q=${data.lat || 37.091832},${data.lng || 27.4824998}&hl=tr&z=${data.zoom || 15}&output=embed`

    return (
        <section style={{ height }} className="relative">
            <iframe
                src={src}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                title="Location Map"
                className="w-full h-full"
            />
        </section>
    )
}
