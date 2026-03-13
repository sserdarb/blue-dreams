'use client'

import React, { useState } from 'react'
import { Sparkles, RefreshCcw, AlertCircle, Zap, Info, CheckCircle2 } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface DashboardAIAnalysisWidgetProps {
    startDate: string
    endDate: string
    stats: any
    pickupData: any
    currency: string
    locale: string
}

// Section definitions
const SECTIONS = [
    { key: 'overview', emoji: '📊', label: { tr: 'Genel Durum Özeti', en: 'Overview Summary', de: 'Übersicht', ru: 'Обзор' } },
    { key: 'trends', emoji: '📈', label: { tr: 'Öne Çıkan Eğilimler', en: 'Key Trends', de: 'Trends', ru: 'Тренды' } },
    { key: 'advice', emoji: '🎯', label: { tr: 'Stratejik Tavsiye', en: 'Strategic Advice', de: 'Empfehlungen', ru: 'Рекомендации' } },
]

export default function DashboardAIAnalysisWidget({
    startDate,
    endDate,
    stats,
    pickupData,
    currency,
    locale
}: DashboardAIAnalysisWidgetProps) {
    const [sectionResults, setSectionResults] = useState<Record<string, string>>({})
    const [sectionErrors, setSectionErrors] = useState<Record<string, string>>({})
    const [isLoading, setIsLoading] = useState(false)
    const [currentSection, setCurrentSection] = useState<string | null>(null)
    const [completedSections, setCompletedSections] = useState<string[]>([])

    const hasValidData = stats && stats.totalReservations > 0
    const hasAnalysis = Object.keys(sectionResults).length > 0

    const fetchSectionalAnalysis = async () => {
        setIsLoading(true)
        setSectionResults({})
        setSectionErrors({})
        setCompletedSections([])

        const payload = { startDate, endDate, stats, pickupData, currency, locale }

        for (const section of SECTIONS) {
            setCurrentSection(section.key)
            try {
                const response = await fetch('/api/admin/dashboard/ai', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...payload, section: section.key }),
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || `${section.key} analizi başarısız.`)
                }

                setSectionResults(prev => ({ ...prev, [section.key]: data.summary }))
                setCompletedSections(prev => [...prev, section.key])
            } catch (err: any) {
                console.error(`AI Section Error (${section.key}):`, err)
                setSectionErrors(prev => ({ ...prev, [section.key]: err.message }))
                setCompletedSections(prev => [...prev, section.key])
            }

            // Small delay between sections to respect API rate limits
            await new Promise(r => setTimeout(r, 500))
        }

        setCurrentSection(null)
        setIsLoading(false)
    }

    const buttonLabel = locale === 'tr' ? 'Analiz Et' : locale === 'en' ? 'Analyze' : locale === 'de' ? 'Analysieren' : 'Анализ'
    const refreshLabel = locale === 'tr' ? 'Yenile' : locale === 'en' ? 'Refresh' : locale === 'de' ? 'Aktualisieren' : 'Обновить'
    const noDataLabel = locale === 'tr' 
        ? 'Analiz için yeterli veri yok. Lütfen dönem filtrelerini kontrol edin.' 
        : 'Not enough data for analysis. Please check period filters.'
    const idleLabel = locale === 'tr' 
        ? 'Dashboard verilerinizi AI ile analiz etmek için butona tıklayın.' 
        : 'Click the button to analyze your dashboard data with AI.'

    return (
        <div className="bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-indigo-600/10 border border-violet-200 dark:border-violet-500/30 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-violet-500 to-fuchsia-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Yapay Zeka Asistanı Analizi
                            <span className="bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-700">Beta</span>
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gemini 2.0 Flash — Bölüm bölüm analiz</p>
                    </div>
                </div>

                {/* Action Button */}
                {hasAnalysis ? (
                    <button
                        onClick={fetchSectionalAnalysis}
                        disabled={isLoading || !hasValidData}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
                        {isLoading ? (locale === 'tr' ? 'Analiz ediliyor...' : 'Analyzing...') : refreshLabel}
                    </button>
                ) : (
                    <button
                        onClick={fetchSectionalAnalysis}
                        disabled={isLoading || !hasValidData}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 rounded-lg shadow-lg shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <Zap size={16} />
                        {isLoading ? (locale === 'tr' ? 'Analiz ediliyor...' : 'Analyzing...') : buttonLabel}
                    </button>
                )}
            </div>

            <div className="relative z-10 space-y-3">
                {/* Show sections */}
                {(isLoading || hasAnalysis) ? (
                    SECTIONS.map(section => {
                        const isCompleted = completedSections.includes(section.key)
                        const isCurrent = currentSection === section.key
                        const result = sectionResults[section.key]
                        const error = sectionErrors[section.key]
                        const sectionLabel = section.label[locale as keyof typeof section.label] || section.label.tr

                        return (
                            <div key={section.key} className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/50 dark:border-white/5 p-4 transition-all duration-300">
                                {/* Section header */}
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">{section.emoji}</span>
                                    <h3 className="text-sm font-bold text-slate-800 dark:text-white">{sectionLabel}</h3>
                                    <div className="ml-auto">
                                        {isCurrent ? (
                                            <RefreshCcw size={14} className="animate-spin text-violet-500" />
                                        ) : isCompleted && result ? (
                                            <CheckCircle2 size={14} className="text-emerald-500" />
                                        ) : isCompleted && error ? (
                                            <AlertCircle size={14} className="text-red-500" />
                                        ) : !isCompleted && isLoading ? (
                                            <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600" />
                                        ) : null}
                                    </div>
                                </div>

                                {/* Section content */}
                                {isCurrent && (
                                    <div className="flex items-center gap-2 text-sm text-violet-500 animate-pulse py-2">
                                        <span className="relative flex h-4 w-4">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-4 w-4 bg-violet-500"></span>
                                        </span>
                                        {locale === 'tr' ? 'Bu bölüm analiz ediliyor...' : 'Analyzing this section...'}
                                    </div>
                                )}
                                {result && (
                                    <div className="prose prose-sm dark:prose-invert prose-violet max-w-none 
                                        prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-2
                                        prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-2
                                        prose-strong:text-slate-900 dark:prose-strong:text-white
                                        prose-ul:my-1 prose-li:my-0.5
                                    ">
                                        <ReactMarkdown>{result}</ReactMarkdown>
                                    </div>
                                )}
                                {error && (
                                    <div className="flex items-start gap-2 text-red-500 text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/50 dark:border-white/5 p-5 min-h-[100px]">
                        <div className="flex flex-col items-center justify-center py-6 text-slate-400">
                            {hasValidData ? (
                                <>
                                    <Sparkles size={24} className="mb-2 opacity-40" />
                                    <p className="text-sm text-center">{idleLabel}</p>
                                </>
                            ) : (
                                <>
                                    <Info size={24} className="mb-2 opacity-40" />
                                    <p className="text-sm text-center">{noDataLabel}</p>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
