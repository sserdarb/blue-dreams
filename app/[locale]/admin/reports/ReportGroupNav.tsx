'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { BarChart3, DollarSign, ShoppingCart, Users } from 'lucide-react'

const GROUPS = [
    { key: 'management', label: 'Yönetim', icon: BarChart3, color: 'cyan', gradient: 'from-cyan-500 to-blue-500' },
    { key: 'finance', label: 'Finans', icon: DollarSign, color: 'emerald', gradient: 'from-emerald-500 to-teal-500' },
    { key: 'purchasing', label: 'Satın Alma', icon: ShoppingCart, color: 'orange', gradient: 'from-orange-500 to-amber-500' },
    { key: 'hr', label: 'İnsan Kaynakları', icon: Users, color: 'violet', gradient: 'from-violet-500 to-purple-500' },
]

export default function ReportGroupNav({ activeGroup }: { activeGroup: string }) {
    const router = useRouter()
    const pathname = usePathname()

    return (
        <div className="flex gap-3 p-1.5 bg-slate-100 dark:bg-slate-800/50 rounded-2xl">
            {GROUPS.map(g => {
                const isActive = activeGroup === g.key
                return (
                    <button
                        key={g.key}
                        onClick={() => router.push(`${pathname}?group=${g.key}`)}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all ${isActive
                                ? `bg-gradient-to-r ${g.gradient} text-white shadow-lg`
                                : 'text-slate-500 hover:text-slate-700 hover:bg-white dark:hover:bg-slate-700/50 dark:hover:text-slate-300'
                            }`}
                    >
                        <g.icon size={18} />
                        {g.label}
                    </button>
                )
            })}
        </div>
    )
}
