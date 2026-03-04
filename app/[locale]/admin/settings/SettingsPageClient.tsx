'use client'

import React, { useState } from 'react'
import { Settings, Globe, Puzzle, Shield, Receipt, Database, Share2 } from 'lucide-react'
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm'
import SettingsModuleManager from '@/components/admin/SettingsModuleManager'
import TaxSettingsForm from '@/components/admin/TaxSettingsForm'
import ElektraSettingsForm from '@/components/admin/ElektraSettingsForm'
import { MarketingSettingsForm } from '@/components/admin/MarketingSettingsForm'
import { DemoSettingsForm } from '@/components/admin/DemoSettingsForm'

type MainTab = 'site' | 'modules' | 'tax' | 'elektra' | 'marketing'

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
        marketingEnabled?: boolean
        googleAnalyticsId?: string
        metaPixelId?: string
        metaAccessToken?: string
        googleAdsTag?: string
        googleAdsToken?: string
        tiktokPixelId?: string
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
            <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10 max-w-4xl">
                <button
                    onClick={() => setMainTab('site')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${mainTab === 'site'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-emerald-600 dark:to-cyan-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Globe size={16} className="hidden sm:block" /> Site Ayarları
                </button>
                <button
                    onClick={() => setMainTab('marketing')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${mainTab === 'marketing'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-pink-600 dark:to-rose-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Share2 size={16} className="hidden sm:block" /> Dijital Pazarlama
                </button>
                <button
                    onClick={() => setMainTab('modules')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${mainTab === 'modules'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Puzzle size={16} className="hidden sm:block" /> Modüller & Yetkiler
                </button>
                <button
                    onClick={() => setMainTab('tax')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${mainTab === 'tax'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-amber-500 dark:to-orange-500 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Receipt size={16} className="hidden sm:block" /> Vergi Ayarları
                </button>
                <button
                    onClick={() => setMainTab('elektra')}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-2 rounded-lg text-sm font-medium transition-all ${mainTab === 'elektra'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-indigo-600 dark:to-purple-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Database size={16} className="hidden sm:block" /> Elektra & Önbellek
                </button>
            </div>

            {/* Tab Content */}
            {mainTab === 'site' ? (
                <div className="max-w-3xl space-y-8">
                    <div>
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                                <Globe size={28} className="text-emerald-500" /> Site Ayarları
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">
                                <span className="font-medium">{locale.toUpperCase()}</span> için genel site ayarları
                            </p>
                        </div>
                        <SiteSettingsForm locale={locale} initialSettings={initialSettings} />
                    </div>

                    <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
                        <DemoSettingsForm />
                    </div>
                </div>
            ) : mainTab === 'marketing' ? (
                <div className="max-w-3xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                            <Share2 size={28} className="text-pink-500" /> Dijital Pazarlama Ayarları
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Google Analytics, Meta Pixel ve reklam izleme kodlarının yönetimi
                        </p>
                    </div>
                    <MarketingSettingsForm locale={locale} initialSettings={initialSettings} />
                </div>
            ) : mainTab === 'tax' ? (
                <TaxSettingsForm initialRates={taxRates} />
            ) : mainTab === 'elektra' ? (
                <ElektraSettingsForm />
            ) : (
                <SettingsModuleManager />
            )}
        </div>
    )
}

