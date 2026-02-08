'use client'

import { usePathname } from 'next/navigation'
import { Sun, Cloud, CloudRain, Thermometer } from 'lucide-react'
import { BODRUM_MONTHLY_WEATHER } from '@/lib/translations'

function getIcon(icon: string, size: number = 16) {
    switch (icon) {
        case 'sun': return <Sun size={size} className="text-yellow-400" />
        case 'cloud': return <Cloud size={size} className="text-gray-400" />
        case 'rain': return <CloudRain size={size} className="text-blue-400" />
        default: return <Sun size={size} className="text-yellow-400" />
    }
}

export default function MonthlyWeather() {
    const pathname = usePathname()
    const locale = (pathname?.split('/')[1] || 'tr') as 'tr' | 'en' | 'de' | 'ru'
    const currentMonth = new Date().getMonth()

    const t = {
        tr: { title: 'Bodrum Hava Durumu', subtitle: 'Aylık Ortalama Sıcaklıklar', unit: '°C' },
        en: { title: 'Bodrum Weather', subtitle: 'Monthly Average Temperatures', unit: '°C' },
        de: { title: 'Bodrum Wetter', subtitle: 'Monatliche Durchschnittstemperaturen', unit: '°C' },
        ru: { title: 'Погода в Бодруме', subtitle: 'Среднемесячные температуры', unit: '°C' },
    }
    const texts = t[locale] || t.tr

    return (
        <section className="py-16 bg-gradient-to-br from-[#0a1628] to-[#162a50] text-white overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full mb-4">
                        <Thermometer size={16} className="text-cyan-400" />
                        <span className="text-xs font-bold tracking-widest uppercase text-cyan-400">{texts.title}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif">{texts.subtitle}</h2>
                </div>

                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2 md:gap-3">
                    {BODRUM_MONTHLY_WEATHER.map((month, index) => {
                        const monthName = month[`month_${locale}` as keyof typeof month] as string || month.month_tr
                        const isCurrentMonth = index === currentMonth
                        const maxTemp = 34
                        const barHeight = Math.round((month.avgHigh / maxTemp) * 100)

                        return (
                            <div
                                key={index}
                                className={`flex flex-col items-center rounded-xl p-2 md:p-3 transition-all duration-300 ${isCurrentMonth
                                    ? 'bg-cyan-500/20 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 scale-105'
                                    : 'bg-white/5 hover:bg-white/10 border border-transparent'
                                    }`}
                            >
                                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wide mb-2 ${isCurrentMonth ? 'text-cyan-400' : 'text-white/50'}`}>
                                    {monthName}
                                </span>

                                {getIcon(month.icon, 18)}

                                {/* Temperature Bar */}
                                <div className="w-full h-16 md:h-20 flex items-end justify-center mt-2 mb-1">
                                    <div
                                        className={`w-5 md:w-6 rounded-t-md transition-all duration-500 ${isCurrentMonth
                                            ? 'bg-gradient-to-t from-cyan-600 to-cyan-400'
                                            : 'bg-gradient-to-t from-blue-800 to-blue-500'
                                            }`}
                                        style={{ height: `${barHeight}%` }}
                                    ></div>
                                </div>

                                <span className={`text-sm md:text-base font-bold ${isCurrentMonth ? 'text-cyan-400' : 'text-white'}`}>
                                    {month.avgHigh}°
                                </span>
                                <span className="text-[10px] text-white/40">
                                    {month.avgLow}°
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
