'use client'

interface TextBlockData {
    label?: string
    heading?: string
    headingAccent?: string
    content?: string
    backgroundColor?: 'white' | 'sand' | 'dark' | 'brand-dark'
    size?: 'small' | 'medium' | 'large'
}

export function TextBlockWidget({ data }: { data: TextBlockData }) {
    const isDark = data.backgroundColor === 'dark' || data.backgroundColor === 'brand-dark'
    const bgMap: Record<string, string> = {
        white: 'bg-white',
        sand: 'bg-sand',
        dark: 'bg-brand-dark text-white',
        'brand-dark': 'bg-brand-dark text-white',
    }
    const bg = bgMap[data.backgroundColor || 'white'] || 'bg-white'
    const textSize = data.size === 'large' ? 'text-3xl md:text-5xl lg:text-6xl' : data.size === 'small' ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'

    return (
        <section className={`py-24 md:py-32 ${bg} relative overflow-hidden`}>
            {isDark && <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />}
            <div className="container mx-auto px-6 md:px-12 text-center">
                <div className="max-w-5xl mx-auto">
                    {data.label && (
                        <span className={`block ${isDark ? 'text-brand-light' : 'text-brand'} text-xs font-bold tracking-[0.3em] uppercase mb-8`}>
                            {data.label}
                        </span>
                    )}
                    {data.heading && (
                        <h2 className={`${textSize} font-serif leading-tight md:leading-snug font-light`}>
                            {data.heading}{' '}
                            {data.headingAccent && (
                                <span className={`italic font-normal ${isDark ? 'text-brand-light' : 'text-brand'}`}>{data.headingAccent}</span>
                            )}
                        </h2>
                    )}
                    {data.content && (
                        <p className={`mt-6 ${isDark ? 'text-white/80' : 'text-gray-600'} leading-relaxed max-w-3xl mx-auto`}>
                            {data.content}
                        </p>
                    )}
                    {isDark && <div className="mt-12 h-16 w-px bg-white/20 mx-auto" />}
                </div>
            </div>
        </section>
    )
}
