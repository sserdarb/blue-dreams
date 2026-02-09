'use client'

interface IconGridItem {
    icon: string
    title: string
    description?: string
}

interface IconGridData {
    label?: string
    heading?: string
    items: IconGridItem[]
    columns?: number
    backgroundColor?: 'white' | 'sand' | 'dark'
}

const bgClasses: Record<string, { bg: string; text: string; card: string }> = {
    white: { bg: 'bg-white', text: 'text-gray-900', card: 'bg-sand' },
    sand: { bg: 'bg-sand', text: 'text-gray-900', card: 'bg-white' },
    dark: { bg: 'bg-brand-dark text-white', text: 'text-white', card: 'bg-white/5' },
}

export function IconGridWidget({ data }: { data: IconGridData }) {
    const theme = bgClasses[data.backgroundColor || 'sand'] || bgClasses.sand
    const cols = data.columns || 3

    return (
        <section className={`py-20 ${theme.bg}`}>
            <div className="container mx-auto px-6">
                {(data.label || data.heading) && (
                    <div className="text-center mb-12">
                        {data.label && (
                            <span className="text-brand text-xs font-bold tracking-widest uppercase mb-4 block">
                                {data.label}
                            </span>
                        )}
                        {data.heading && (
                            <h2 className={`text-4xl font-serif ${theme.text}`}>{data.heading}</h2>
                        )}
                    </div>
                )}
                <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-8`}>
                    {data.items?.map((item, i) => (
                        <div key={i} className={`${theme.card} p-8 rounded-lg shadow-md text-center`}>
                            <div className="w-16 h-16 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-3xl">{item.icon}</span>
                            </div>
                            <h3 className={`text-xl font-serif ${data.backgroundColor === 'dark' ? 'text-white' : 'text-gray-900'} mb-3`}>
                                {item.title}
                            </h3>
                            {item.description && (
                                <p className={`${data.backgroundColor === 'dark' ? 'text-white/70' : 'text-gray-600'} text-sm`}>
                                    {item.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
