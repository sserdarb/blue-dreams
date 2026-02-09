'use client'

interface CtaData {
    heading: string
    subtitle?: string
    buttons?: { text: string; url: string; variant?: 'primary' | 'outline' | 'white' | 'white-outline' }[]
    backgroundColor?: 'white' | 'dark' | 'brand' | 'gradient'
}

const bgMap: Record<string, string> = {
    white: 'bg-white',
    dark: 'bg-brand-dark text-white',
    brand: 'bg-brand text-white',
    gradient: 'bg-gradient-to-r from-brand to-brand-dark text-white',
}

const buttonStyles: Record<string, string> = {
    primary: 'bg-brand text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors',
    outline: 'border border-brand text-brand px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand hover:text-white transition-colors',
    white: 'bg-white text-brand-dark px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-light hover:text-white transition-colors',
    'white-outline': 'border border-white/30 text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-white/10 transition-colors',
}

export function CtaWidget({ data }: { data: CtaData }) {
    const bg = bgMap[data.backgroundColor || 'dark'] || bgMap.dark

    return (
        <section className={`py-20 ${bg} text-center`}>
            <div className="container mx-auto px-6">
                <h2 className="text-4xl font-serif mb-4">{data.heading}</h2>
                {data.subtitle && (
                    <p className={`${data.backgroundColor === 'white' ? 'text-gray-600' : 'text-white/70'} mb-8 max-w-xl mx-auto`}>
                        {data.subtitle}
                    </p>
                )}
                {data.buttons && data.buttons.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-4">
                        {data.buttons.map((btn, i) => (
                            <a
                                key={i}
                                href={btn.url}
                                target={btn.url?.startsWith('http') || btn.url?.startsWith('tel:') || btn.url?.startsWith('mailto:') ? '_blank' : '_self'}
                                rel="noreferrer"
                                className={`inline-flex items-center gap-2 ${buttonStyles[btn.variant || 'white'] || buttonStyles.white}`}
                            >
                                {btn.text}
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
