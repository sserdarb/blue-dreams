'use client'

import React, { useState, useEffect } from 'react'
import { Sparkles, RefreshCcw, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface DashboardAIAnalysisWidgetProps {
    startDate: string
    endDate: string
    stats: any
    pickupData: any
    currency: string
    locale: string
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

    const fetchAnalysis = async (forceRefetch = false) => {
        // Prevent unnecessary refetches unless explicitly requested
        if (analysis && !forceRefetch) return

        setIsLoading(true)
        setError(null)

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

            setAnalysis(data.summary)
        } catch (err: any) {
            console.error('AI Analysis Error:', err)
            setError(err.message || 'Bilinmeyen bir hata oluştu.')
        } finally {
            setIsLoading(false)
        }
    }

    // Automatically fetch analysis on component mount or when dependency data changes meaningfully
    useEffect(() => {
        fetchAnalysis()
    }, [startDate, endDate, currency, stats.totalReservations, pickupData.netPickup])

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

                <button
                    onClick={() => fetchAnalysis(true)}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-800/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCcw size={14} className={isLoading ? 'animate-spin' : ''} />
                    {isLoading ? 'Analiz Ediliyor...' : 'Yenile'}
                </button>
            </div>

            <div className="relative z-10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm rounded-xl border border-white/50 dark:border-white/5 p-5 min-h-[100px]">
                {isLoading && !analysis ? (
                    <div className="flex flex-col items-center justify-center py-6 text-violet-600 dark:text-violet-400">
                        <span className="relative flex h-8 w-8 mb-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-8 w-8 bg-violet-500"></span>
                        </span>
                        <p className="text-sm font-medium animate-pulse">Otel performans verileriniz analiz ediliyor...</p>
                    </div>
                ) : error ? (
                    <div className="flex items-start gap-3 text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-semibold text-sm">Analiz Hatası</h4>
                            <p className="text-sm mt-1">{error}</p>
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
                    <div className="flex items-center gap-2 text-slate-500 py-6 justify-center">
                        <Info size={18} />
                        <span className="text-sm">Analiz sonucu bekleniyor...</span>
                    </div>
                )}
            </div>
        </div>
    )
}
