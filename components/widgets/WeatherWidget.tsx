'use client'

import { Sun, Cloud, CloudRain, Snowflake, CloudSun } from 'lucide-react'

interface MonthData {
    name: string
    avgHigh: number
    avgLow: number
    icon?: string
    rainDays?: number
}

interface WeatherData {
    title?: string
    subtitle?: string
    months: MonthData[]
}

const iconMap: Record<string, React.ComponentType<any>> = {
    sun: Sun,
    cloud: Cloud,
    rain: CloudRain,
    snow: Snowflake,
    'cloud-sun': CloudSun,
    cloudsun: CloudSun,
}

export function WeatherWidget({ data }: { data: WeatherData }) {
    return (
        <section className="py-16 bg-gradient-to-br from-sky-50 to-blue-50">
            <div className="container mx-auto px-6">
                {(data.title || data.subtitle) && (
                    <div className="text-center mb-12">
                        {data.title && <h2 className="text-4xl font-serif text-gray-900 mb-2">{data.title}</h2>}
                        {data.subtitle && <p className="text-gray-600">{data.subtitle}</p>}
                    </div>
                )}

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-3">
                    {data.months?.map((month, i) => {
                        const IconComp = iconMap[(month.icon || 'sun').toLowerCase()] || Sun
                        return (
                            <div key={i}
                                className="bg-white rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow group">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{month.name}</span>
                                <div className="my-3 flex justify-center text-sky-500 group-hover:text-brand transition-colors">
                                    <IconComp size={24} />
                                </div>
                                <div className="text-lg font-bold text-gray-900">{month.avgHigh}°</div>
                                <div className="text-xs text-gray-400">{month.avgLow}°</div>
                                {month.rainDays !== undefined && (
                                    <div className="text-xs text-sky-400 mt-1">💧 {month.rainDays}d</div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
