interface Feature {
    icon?: string
    title?: string
    description?: string
}

interface FeaturesData {
    title?: string
    subtitle?: string
    features?: Feature[]
    columns?: number
    style?: 'cards' | 'icons' | 'minimal'
}

const ICON_MAP: { [key: string]: string } = {
    star: '⭐',
    heart: '❤️',
    check: '✓',
    sparkles: '✨',
    sun: '☀️',
    moon: '🌙',
    coffee: '☕',
    utensils: '🍴',
    bed: '🛏️',
    spa: '💆',
    pool: '🏊',
    wifi: '📶',
    parking: '🅿️',
    gym: '💪',
}

export function FeaturesWidget({ data }: { data: FeaturesData }) {
    const features = data.features || []
    const columns = data.columns || 3
    const style = data.style || 'cards'

    if (features.length === 0) return null

    const colClasses = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4'
    }

    return (
        <section className="py-16 md:py-24 px-4 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                {(data.title || data.subtitle) && (
                    <div className="text-center mb-12">
                        {data.title && (
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {data.title}
                            </h2>
                        )}
                        {data.subtitle && (
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                {data.subtitle}
                            </p>
                        )}
                    </div>
                )}

                {/* Features Grid */}
                <div className={`grid grid-cols-1 ${colClasses[columns as keyof typeof colClasses] || colClasses[3]} gap-6 md:gap-8`}>
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`
                ${style === 'cards'
                                    ? 'bg-white rounded-xl shadow-md hover:shadow-lg p-6 md:p-8 transition-shadow'
                                    : style === 'icons'
                                        ? 'text-center p-4'
                                        : 'p-4 border-l-4 border-blue-500'
                                }
              `}
                        >
                            {/* Icon */}
                            {feature.icon && (
                                <div className={`text-4xl mb-4 ${style === 'icons' ? 'text-5xl' : ''}`}>
                                    {ICON_MAP[feature.icon] || feature.icon}
                                </div>
                            )}

                            {/* Title */}
                            {feature.title && (
                                <h3 className={`font-semibold text-gray-900 mb-2 ${style === 'cards' ? 'text-xl' : 'text-lg'
                                    }`}>
                                    {feature.title}
                                </h3>
                            )}

                            {/* Description */}
                            {feature.description && (
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
