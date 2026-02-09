'use client'

interface ExperienceBlock {
    label?: string
    h1?: string
    h2?: string
    text?: string
    buttonText?: string
    buttonUrl?: string
    image?: string
    imageAlt?: string
    detailImage?: string
    bgColor?: string
    buttonColor?: string
    reverse?: boolean
    minHeight?: string
}

interface ExperienceBlocksData {
    blocks?: ExperienceBlock[]
}

export function ExperienceBlocksWidget({ data }: { data: ExperienceBlocksData }) {
    const blocks = data.blocks || []

    const bgClasses: Record<string, string> = {
        sand: 'bg-sand',
        white: 'bg-white',
        cream: 'bg-[#f0eee9]',
        light: 'bg-gray-50',
    }

    const btnClasses: Record<string, string> = {
        gold: 'bg-[#b08d55] hover:bg-[#9a7b4f]',
        orange: 'bg-[#d97706] hover:bg-[#b45309]',
        brand: 'bg-brand hover:bg-brand-dark',
    }

    return (
        <section className="bg-sand">
            {blocks.map((block, index) => {
                const isReverse = block.reverse ?? (index % 2 === 1)
                const bg = bgClasses[block.bgColor || (index === 1 ? 'white' : index === 2 ? 'cream' : 'sand')] || bgClasses.sand

                return (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2">
                        {/* Image Side */}
                        <div
                            className={`relative w-full ${isReverse ? 'order-1 md:order-2' : ''}`}
                            style={{ minHeight: block.minHeight || '400px' }}
                        >
                            <img
                                src={block.image}
                                alt={block.imageAlt || block.h1 || ''}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {block.detailImage && (
                                <div className="absolute bottom-10 left-10 w-40 h-40 border-4 border-white shadow-xl hidden lg:block overflow-hidden z-10">
                                    <img
                                        src={block.detailImage}
                                        alt="Detail"
                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Text Side */}
                        <div className={`flex flex-col justify-center p-12 md:p-20 ${bg} ${isReverse ? 'order-2 md:order-1' : ''}`}>
                            {block.label && (
                                <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">
                                    {block.label}
                                </span>
                            )}
                            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
                                {block.h1} <br />
                                <span className="italic font-light">{block.h2}</span>
                            </h2>
                            <p className="text-gray-600 mb-8 leading-relaxed font-light">
                                {block.text}
                            </p>
                            {block.buttonText && (
                                <a
                                    href={block.buttonUrl || '#'}
                                    className={`${btnClasses[block.buttonColor || 'brand'] || btnClasses.brand} text-white px-8 py-3 w-fit text-xs font-bold tracking-widest uppercase rounded-sm transition-colors`}
                                >
                                    {block.buttonText}
                                </a>
                            )}
                        </div>
                    </div>
                )
            })}
        </section>
    )
}
