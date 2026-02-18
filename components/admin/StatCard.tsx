import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
    title: string
    value: string | number
    secondaryValue?: string // EUR equivalent or alternate currency
    subtitle?: string
    icon: ReactNode
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: 'cyan' | 'green' | 'orange' | 'purple' | 'red'
}

const colorClasses = {
    cyan: {
        bg: 'bg-cyan-100 dark:bg-cyan-500/10',
        icon: 'text-cyan-600 dark:text-cyan-400',
        trend: 'text-cyan-600 dark:text-cyan-400',
    },
    green: {
        bg: 'bg-green-100 dark:bg-green-500/10',
        icon: 'text-green-600 dark:text-green-400',
        trend: 'text-green-600 dark:text-green-400',
    },
    orange: {
        bg: 'bg-orange-100 dark:bg-orange-500/10',
        icon: 'text-orange-600 dark:text-orange-400',
        trend: 'text-orange-600 dark:text-orange-400',
    },
    purple: {
        bg: 'bg-purple-100 dark:bg-purple-500/10',
        icon: 'text-purple-600 dark:text-purple-400',
        trend: 'text-purple-600 dark:text-purple-400',
    },
    red: {
        bg: 'bg-red-100 dark:bg-red-500/10',
        icon: 'text-red-600 dark:text-red-400',
        trend: 'text-red-600 dark:text-red-400',
    },
}

// Auto-size font based on value length to prevent overflow
function getValueFontClass(value: string | number): string {
    const len = String(value).length
    if (len > 12) return 'text-lg'
    if (len > 10) return 'text-xl'
    if (len > 7) return 'text-2xl'
    return 'text-3xl'
}

export default function StatCard({
    title,
    value,
    secondaryValue,
    subtitle,
    icon,
    trend,
    trendValue,
    color = 'cyan'
}: StatCardProps) {
    const colors = colorClasses[color]
    const fontClass = getValueFontClass(value)

    return (
        <div className="bg-slate-50 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl p-6 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center ${colors.icon} group-hover:scale-110 transition-transform`}>
                    {icon}
                </div>
                {trend && trendValue && (
                    <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-400' :
                        trend === 'down' ? 'text-red-400' :
                            'text-slate-400'
                        }`}>
                        {trend === 'up' && <TrendingUp size={16} />}
                        {trend === 'down' && <TrendingDown size={16} />}
                        {trend === 'neutral' && <Minus size={16} />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>

            <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">{title}</p>
            <p className={`${fontClass} font-bold text-slate-900 dark:text-white leading-tight`}>{value}</p>
            {secondaryValue && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">{secondaryValue}</p>
            )}
            {subtitle && (
                <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
            )}
        </div>
    )
}
