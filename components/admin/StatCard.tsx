import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ReactNode } from 'react'

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    icon: ReactNode
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    color?: 'cyan' | 'green' | 'orange' | 'purple' | 'red'
}

const colorClasses = {
    cyan: {
        bg: 'bg-cyan-500/10',
        icon: 'text-cyan-400',
        trend: 'text-cyan-400',
    },
    green: {
        bg: 'bg-green-500/10',
        icon: 'text-green-400',
        trend: 'text-green-400',
    },
    orange: {
        bg: 'bg-orange-500/10',
        icon: 'text-orange-400',
        trend: 'text-orange-400',
    },
    purple: {
        bg: 'bg-purple-500/10',
        icon: 'text-purple-400',
        trend: 'text-purple-400',
    },
    red: {
        bg: 'bg-red-500/10',
        icon: 'text-red-400',
        trend: 'text-red-400',
    },
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendValue,
    color = 'cyan'
}: StatCardProps) {
    const colors = colorClasses[color]

    return (
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
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

            <p className="text-slate-400 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            {subtitle && (
                <p className="text-slate-500 text-xs mt-1">{subtitle}</p>
            )}
        </div>
    )
}
