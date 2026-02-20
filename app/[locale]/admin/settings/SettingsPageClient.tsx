'use client'

import React, { useState } from 'react'
import { Settings, Globe, Puzzle, Shield, Receipt } from 'lucide-react'
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm'
import SettingsModuleManager from '@/components/admin/SettingsModuleManager'
import TaxSettingsForm from '@/components/admin/TaxSettingsForm'

type MainTab = 'site' | 'modules' | 'tax'

interface SettingsPageClientProps {
    locale: string
    initialSettings: {
        siteName?: string
        logo?: string
        favicon?: string
        phone?: string
        email?: string
        address?: string
        socialLinks?: string
        footerText?: string
        footerCopyright?: string
        headerStyle?: string
        googleMapsApiKey?: string
    }
    taxRates: {
        vatAccommodation: number
        taxAccommodation: number
        vatFnb: number
    }
}

export default function SettingsPageClient({ locale, initialSettings, taxRates }: SettingsPageClientProps) {
    const [mainTab, setMainTab] = useState<MainTab>('modules')

    return (
        <div className="space-y-6">
            {/* Top-level tab switcher */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10 max-w-2xl">
                <button
                    onClick={() => setMainTab('site')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mainTab === 'site'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-emerald-600 dark:to-cyan-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Globe size={16} /> Site Ayarları
                </button>
                <button
                    onClick={() => setMainTab('modules')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mainTab === 'modules'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Puzzle size={16} /> Modüller & Yetkiler
                </button>
                <button
                    onClick={() => setMainTab('tax')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${mainTab === 'tax'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Receipt size={16} /> Vergi Ayarları
                </button>
            </div>

            {/* Tab Content */}
            {mainTab === 'site' ? (
                <div className="max-w-3xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Globe size={28} className="text-emerald-500" /> Site Ayarları
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            <span className="font-medium">{locale.toUpperCase()}</span> için genel site ayarları
                        </p>
                    </div>
                    <SiteSettingsForm locale={locale} initialSettings={initialSettings} />
                </div>
            ) : mainTab === 'tax' ? (
                <TaxSettingsForm initialRates={taxRates} />
            ) : (
                <SettingsModuleManager />
            )}
        </div>
    )
}

