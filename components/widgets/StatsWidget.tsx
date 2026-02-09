'use client'

import { Award, Users, Calendar, MapPin, Star, Bed, Maximize } from 'lucide-react'

interface StatsItem {
    icon?: string
    value: string
    label: string
}

interface StatsData {
    items: StatsItem[]
    backgroundColor?: 'dark' | 'brand' | 'brand-dark'
}

const iconMap: Record<string, React.ComponentType<any>> = {
    award: Award,
    users: Users,
    calendar: Calendar,
    mappin: MapPin,
    star: Star,
    bed: Bed,
    maximize: Maximize,
}

export function StatsWidget({ data }: { data: StatsData }) {
    const bg = data.backgroundColor === 'brand' ? 'bg-brand' : 'bg-brand-dark'

    return (
        <section className={`py-16 ${bg} text-white`}>
            <div className="container mx-auto px-6">
                <div className={`grid grid-cols-2 md:grid-cols-${Math.min(data.items?.length || 4, 4)} gap-8`}>
                    {data.items?.map((item, i) => {
                        const IconComp = iconMap[(item.icon || '').toLowerCase()]
                        return (
                            <div key={i} className="text-center">
                                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    {IconComp ? <IconComp size={32} /> : <span className="text-2xl">{item.icon}</span>}
                                </div>
                                <span className="text-4xl font-serif font-bold block">{item.value}</span>
                                <span className="text-white/70 text-sm">{item.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
