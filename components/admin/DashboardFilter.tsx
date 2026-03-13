'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Info, Calendar, Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

const DATE_PRESETS = [
    { key: 'today', days: 0, type: 'today' as const },
    { key: 'last_7_days', days: 7, type: 'days' as const },
    { key: 'this_month', days: 0, type: 'thisMonth' as const },
    { key: 'last_month', days: 0, type: 'lastMonth' as const },
    { key: 'this_year', days: 0, type: 'thisYear' as const },
    { key: 'all_season', days: 0, type: 'allSeason' as const },
] as const

// Get current date in Turkey timezone (UTC+3)
function getTurkeyNow(): Date {
    const now = new Date()
    // Create a date string in Turkey timezone and parse it back
    const turkeyStr = now.toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })
    return new Date(turkeyStr)
}

function toDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getPresetDates(preset: typeof DATE_PRESETS[number]) {
    const now = getTurkeyNow()
    let from: Date, to: Date

    if ('type' in preset && preset.type === 'today') {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        to = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    } else if ('type' in preset && preset.type === 'thisMonth') {
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        to = now
    } else if ('type' in preset && preset.type === 'lastMonth') {
        from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        to = new Date(now.getFullYear(), now.getMonth(), 0)
    } else if ('type' in preset && preset.type === 'thisYear') {
        from = new Date(now.getFullYear(), 0, 1)
        to = now
    } else if ('type' in preset && preset.type === 'allSeason') {
        from = new Date(now.getFullYear(), 3, 1) // April 1
        to = new Date(now.getFullYear(), 9, 31) // October 31
        if (now < to) to = now
    } else {
        from = new Date(now)
        from.setDate(now.getDate() - (preset.days || 7))
        to = now
    }

    return {
        from: toDateStr(from),
        to: toDateStr(to)
    }
}

export default function DashboardFilter() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const t = useTranslations('admin.dashboard.filter')
    const [loading, setLoading] = useState(false)

    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [currency, setCurrency] = useState('EUR')
    const [showInfo, setShowInfo] = useState(false)
    const [activePreset, setActivePreset] = useState<string>('today')

    useEffect(() => {
        const urlFrom = searchParams.get('from')
        const urlTo = searchParams.get('to')
        const urlCurrency = searchParams.get('currency')

        if (urlCurrency) setCurrency(urlCurrency)

        if (urlFrom) setFrom(urlFrom)
        else {
            // Default: Bugün (today) in Turkey timezone
            const turkeyNow = getTurkeyNow()
            setFrom(toDateStr(turkeyNow))
        }

        if (urlTo) setTo(urlTo)
        else {
            const turkeyNow = getTurkeyNow()
            setTo(toDateStr(turkeyNow))
        }
    }, [searchParams])

    const applyFilter = (fromVal?: string, toVal?: string, currVal?: string) => {
        setLoading(true)
        const params = new URLSearchParams(searchParams.toString())
        params.set('from', fromVal || from)
        params.set('to', toVal || to)
        params.set('currency', currVal || currency)
        router.push(`${pathname}?${params.toString()}`)
        // Loading will clear on re-render via searchParams change
        setTimeout(() => setLoading(false), 3000)
    }

    const applyPreset = (preset: typeof DATE_PRESETS[number]) => {
        const dates = getPresetDates(preset)
        setFrom(dates.from)
        setTo(dates.to)
        setActivePreset(preset.key)
        applyFilter(dates.from, dates.to, currency)
    }

    return (
        <div className="flex flex-col gap-3">
            {/* Quick Date Presets */}
            <div className="flex flex-wrap items-center gap-2">
                {DATE_PRESETS.map(preset => (
                    <button
                        key={preset.key}
                        onClick={() => applyPreset(preset)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activePreset === preset.key
                            ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/30'
                            : 'bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 hover:text-cyan-600 dark:hover:text-cyan-400'
                            }`}
                    >
                        {t(`presets.${preset.key}`)}
                    </button>
                ))}
            </div>

            {/* Date Range Inputs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white dark:bg-white/5 p-3 rounded-xl shadow-sm border border-slate-200 dark:border-white/10">
                <div className="flex flex-1 items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                        <Calendar size={14} className="text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <input
                        type="date"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="text-sm px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-cyan-500 w-[130px]"
                    />
                    <span className="text-slate-400 text-xs">→</span>
                    <input
                        type="date"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="text-sm px-2 py-1 border border-slate-200 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white outline-none focus:border-cyan-500 w-[130px]"
                    />
                    <button
                        onClick={() => applyFilter()}
                        disabled={loading}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                    >
                        {loading && <Loader2 size={12} className="animate-spin" />}
                        {t('buttons.filter')}
                    </button>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowInfo(!showInfo)}
                        className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-cyan-600 flex items-center justify-center transition-colors"
                        title={t('tooltip')}
                    >
                        <Info size={14} />
                    </button>

                    {showInfo && (
                        <div className="absolute right-0 top-9 w-72 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{t('info.title')}</h4>
                                <button onClick={() => setShowInfo(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-4">
                                <li>{t('info.reservation_data')}</li>
                                <li>{t('info.channel_breakdown')}</li>
                                <li>{t('info.pickup_analysis')}</li>
                                <li>{t('info.currency_conversion')}</li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto ml-auto pl-2 border-l border-slate-200 dark:border-white/10">
                <span className="text-xs font-medium text-slate-500">{t('currency')}:</span>
                <select
                    value={currency}
                    onChange={(e) => applyFilter(from, to, e.target.value)}
                    className="text-xs font-bold px-2 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-cyan-500 text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                    <option value="TRY">₺ TRY</option>
                    <option value="EUR">€ EUR</option>
                    <option value="USD">$ USD</option>
                </select>
            </div>
        </div>
    )
}
