'use client'

interface TextImageData {
    label?: string
    heading?: string
    headingAccent?: string
    paragraphs?: string[]
    image?: string
    imageAlt?: string
    imagePosition?: 'left' | 'right'
    badge?: { value: string; label: string }
    buttons?: { text: string; url: string; variant?: 'primary' | 'outline' }[]
    backgroundColor?: 'white' | 'sand' | 'dark'
    listItems?: string[]
}

const bgClasses: Record<string, string> = {
    white: 'bg-white',
    sand: 'bg-sand',
    dark: 'bg-brand-dark text-white',
}

export function TextImageWidget({ data }: { data: TextImageData }) {
    const bg = bgClasses[data.backgroundColor || 'white'] || 'bg-white'
    const isLeft = data.imagePosition === 'left'

    return (
        <section className={`py-20 ${bg}`}>
            <div className="container mx-auto px-6">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
                    {/* Text Side */}
                    <div className={isLeft ? 'order-2' : 'order-1'}>
                        {data.label && (
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                {data.label}
                            </span>
                        )}
                        {data.heading && (
                            <h2 className={`text-4xl font-serif ${data.backgroundColor === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>
                                {data.heading}{' '}
                                {data.headingAccent && <span className="italic text-brand">{data.headingAccent}</span>}
                            </h2>
                        )}
                        {data.paragraphs?.map((p, i) => (
                            <p key={i} className={`${data.backgroundColor === 'dark' ? 'text-white/80' : 'text-gray-600'} leading-relaxed mb-6`}>
                                {p}
                            </p>
                        ))}
                        {data.listItems && data.listItems.length > 0 && (
                            <ul className="space-y-3 pt-4 mb-6">
                                {data.listItems.map((item, i) => (
                                    <li key={i} className="flex items-center gap-3">
                                        <span className="w-2 h-2 bg-brand rounded-full" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {data.buttons && data.buttons.length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-8">
                                {data.buttons.map((btn, i) => (
                                    <a
                                        key={i}
                                        href={btn.url}
                                        target={btn.url?.startsWith('http') ? '_blank' : '_self'}
                                        rel="noreferrer"
                                        className={
                                            btn.variant === 'outline'
                                                ? 'border border-brand text-brand px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand hover:text-white transition-colors'
                                                : 'bg-brand text-white px-8 py-4 font-bold uppercase tracking-widest text-sm hover:bg-brand-dark transition-colors'
                                        }
                                    >
                                        {btn.text}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Image Side */}
                    <div className={`relative ${isLeft ? 'order-1' : 'order-2'}`}>
                        {data.image && (
                            <img
                                src={data.image}
                                alt={data.imageAlt || ''}
                                className="w-full h-[500px] object-cover rounded-lg shadow-2xl"
                            />
                        )}
                        {data.badge && (
                            <div className="absolute -bottom-8 -right-8 bg-brand text-white p-8 rounded-lg shadow-xl hidden lg:block">
                                <span className="text-5xl font-serif font-bold">{data.badge.value}</span>
                                <span className="block text-sm uppercase tracking-widest mt-1">{data.badge.label}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    )
}
