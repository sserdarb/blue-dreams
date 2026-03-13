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

// Progressive loading stages
const STAGES = {
    tr: ['Veriler okunuyor...', 'AI modeline gönderiliyor...', 'Analiz oluşturuluyor...', 'Rapor yazılıyor...'],
    en: ['Reading data...', 'Sending to AI model...', 'Generating analysis...', 'Writing report...'],
    de: ['Daten werden gelesen...', 'An AI-Modell senden...', 'Analyse wird erstellt...', 'Bericht wird geschrieben...'],
    ru: ['Чтение данных...', 'Отправка в ИИ...', 'Генерация анализа...', 'Написание отчёта...'],
}

export default function DashboardAIAnalysisWidget({
    startDate,
    endDate,
    stats,
    pickupData,
    currency,
    locale
}: DashboardAIAnalysisWidgetProps) {
    const [analysis, setAnalysis] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [stage, setStage] = useState(0)

    const stages = STAGES[locale as keyof typeof STAGES] || STAGES.tr

    const hasValidData = stats && stats.totalReservations > 0

    const fetchAnalysis = async () => {
        setIsLoading(true)
        setError(null)
        setAnalysis(null)
        setStage(0)

        // Progressive stage animation
        const stageInterval = setInterval(() => {
            setStage(prev => Math.min(prev + 1, stages.length - 1))
        }, 2000)

        try {
            const response = await fetch('/api/admin/dashboard/ai', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startDate,
                    endDate,
                    stats,
                    pickupData,
                    currency,
                    locale
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Yapay zeka analizi alınamadı.')
            }

            clearInterval(stageInterval)
            setStage(stages.length - 1)
            setAnalysis(data.summary)
        } catch (err: any) {
            console.error('AI Analysis Error:', err)
            clearInterval(stageInterval)
            setError(err.message || 'Bilinmeyen bir hata oluştu.')
        } finally {
            setIsLoading(false)
        }
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
                        <p className="text-sm text-slate-500 dark:text-slate-400">Gemini 2.0 Flash verilerinizi yorumluyor</p>
                    </div>
                </div>

                {/* Action Button */}
                {analysis ? (
                    <button
                        onClick={fetchAnalysis}
                        disabled={isLoading || !hasValidData}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
                        {isLoading ? stages[stage] : refreshLabel}
                    </button>
                ) : (
                    <button
                        onClick={fetchAnalysis}
                        disabled={isLoading || !hasValidData}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 rounded-lg shadow-lg shadow-violet-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <Zap size={16} />
                        {isLoading ? stages[stage] : buttonLabel}
                    </button>
                )}
            </div>

            <div className="relative z-10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/50 dark:border-white/5 p-5 min-h-[100px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-6 text-violet-600 dark:text-violet-400">
                        <span className="relative flex h-8 w-8 mb-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-8 w-8 bg-violet-500"></span>
                        </span>
                        {/* Progressive stages */}
                        <div className="space-y-2 text-center">
                            {stages.map((s, i) => (
                                <div key={i} className={`flex items-center gap-2 text-sm transition-all duration-500 ${
                                    i <= stage ? 'opacity-100' : 'opacity-20'
                                }`}>
                                    {i < stage ? (
                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                    ) : i === stage ? (
                                        <RefreshCcw size={14} className="animate-spin text-violet-500" />
                                    ) : (
                                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600" />
                                    )}
                                    <span className={i === stage ? 'font-medium animate-pulse' : ''}>{s}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : error ? (
                    <div className="flex items-start gap-3 text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-sm">Analiz Hatası</h4>
                            <p className="text-sm mt-1">{error}</p>
                            <button 
                                onClick={fetchAnalysis}
                                className="mt-2 text-xs text-red-700 dark:text-red-300 underline hover:no-underline"
                            >
                                Tekrar dene
                            </button>
                        </div>
                    </div>
                ) : analysis ? (
                    <div className="prose prose-sm dark:prose-invert prose-violet max-w-none 
                        prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-bold prose-headings:mb-2 prose-headings:mt-4 first:prose-headings:mt-0
                        prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-relaxed prose-p:mb-3
                        prose-strong:text-slate-900 dark:prose-strong:text-white
                        prose-ul:my-2 prose-li:my-0.5
                    ">
                        <ReactMarkdown>{analysis}</ReactMarkdown>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    )
}
