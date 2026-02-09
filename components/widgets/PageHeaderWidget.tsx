'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface PageHeaderData {
    title: string
    subtitle?: string
    backgroundImage: string
    breadcrumbs?: { label: string; href: string }[]
}

export function PageHeaderWidget({ data }: { data: PageHeaderData }) {
    return (
        <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
                <img src={data.backgroundImage} alt={data.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
            <div className="relative z-10 text-center text-white px-6">
                <h1 className="text-4xl md:text-6xl font-serif mb-4">{data.title}</h1>
                {data.subtitle && <p className="text-white/80 text-lg max-w-2xl mx-auto">{data.subtitle}</p>}
                {data.breadcrumbs && data.breadcrumbs.length > 0 && (
                    <nav className="mt-6 flex items-center justify-center gap-2 text-sm text-white/70">
                        <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
                        {data.breadcrumbs.map((crumb, i) => (
                            <span key={i} className="flex items-center gap-2">
                                <ChevronRight size={14} />
                                <span className="text-white">{crumb.label}</span>
                            </span>
                        ))}
                    </nav>
                )}
            </div>
        </div>
    )
}
