interface PageHeaderProps {
    title: string
    subtitle?: string
    backgroundImage: string
    breadcrumbs?: { label: string; href: string }[]
}

export default function PageHeader({ title, subtitle, backgroundImage, breadcrumbs }: PageHeaderProps) {
    return (
        <div className="relative h-[60vh] min-h-[500px] w-full bg-dark overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={backgroundImage}
                    alt={title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-end pb-16 container mx-auto px-6">
                {/* Breadcrumbs */}
                {breadcrumbs && breadcrumbs.length > 0 && (
                    <nav className="mb-6">
                        <ol className="flex items-center space-x-2 text-sm text-white/60">
                            <li>
                                <a href="/" className="hover:text-white transition-colors">Ana Sayfa</a>
                            </li>
                            {breadcrumbs.map((crumb, index) => (
                                <li key={index} className="flex items-center space-x-2">
                                    <span>/</span>
                                    <a href={crumb.href} className="hover:text-white transition-colors">
                                        {crumb.label}
                                    </a>
                                </li>
                            ))}
                        </ol>
                    </nav>
                )}

                {/* Title */}
                <h1 className="text-5xl md:text-7xl font-serif text-white drop-shadow-lg">
                    {title}
                </h1>

                {subtitle && (
                    <p className="mt-4 text-xl text-white/80 max-w-2xl font-light">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    )
}
