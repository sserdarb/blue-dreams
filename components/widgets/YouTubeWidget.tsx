'use client'

interface YouTubeData {
    heading?: string
    videos: { url: string; title?: string }[]
    columns?: number
}

export function YouTubeWidget({ data }: { data: YouTubeData }) {
    const cols = data.columns || 2

    return (
        <section className="py-16 bg-slate-50">
            <div className="container mx-auto px-6">
                {data.heading && (
                    <h2 className="text-3xl font-serif text-center text-slate-800 mb-12">{data.heading}</h2>
                )}
                <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-8`}>
                    {data.videos?.map((video, i) => (
                        <div key={i} className="aspect-video w-full rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300">
                            <iframe
                                className="w-full h-full"
                                src={video.url}
                                title={video.title || `Video ${i + 1}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
