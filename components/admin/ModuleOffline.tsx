'use client'

import React from 'react'
import { AlertTriangle, RefreshCw, Settings, WifiOff, Database, Server } from 'lucide-react'
import Link from 'next/link'

interface ModuleOfflineProps {
    moduleName: string
    dataSource?: 'elektra' | 'purchasing_erp' | string
    offlineReason?: string
    error?: string
    locale?: string
}

const sourceLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    elektra: { label: 'Elektra PMS', icon: <Server size={16} />, color: 'text-blue-400' },
    purchasing_erp: { label: 'Elektra ERP (Satın Alma)', icon: <Database size={16} />, color: 'text-amber-400' },
}

export default function ModuleOffline({ moduleName, dataSource, offlineReason, error, locale = 'tr' }: ModuleOfflineProps) {
    const source = dataSource ? sourceLabels[dataSource] : null
    const [retrying, setRetrying] = React.useState(false)

    const handleRetry = () => {
        setRetrying(true)
        // Force page reload to re-attempt server-side fetch
        window.location.reload()
    }

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="max-w-lg w-full text-center space-y-6">
                {/* Icon */}
                <div className="mx-auto w-20 h-20 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center">
                    <WifiOff size={36} className="text-slate-400" />
                </div>

                {/* Title */}
                <div>
                    <h2 className="text-2xl font-bold text-white">{moduleName}</h2>
                    <p className="text-slate-400 mt-1">Bu modül şu anda kullanılamıyor</p>
                </div>

                {/* Data Source Badge */}
                {source && (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-full text-sm">
                        <span className={source.color}>{source.icon}</span>
                        <span className="text-slate-300">Veri Kaynağı: {source.label}</span>
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-red-400 text-xs">Çevrimdışı</span>
                    </div>
                )}

                {/* Reason Box */}
                {offlineReason && (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 text-left">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-amber-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-amber-200 font-medium text-sm">Sebep</p>
                                <p className="text-amber-300/80 text-sm mt-1">{offlineReason}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Details (dev mode) */}
                {error && (
                    <details className="text-left bg-slate-800/30 border border-slate-700/30 rounded-lg p-3">
                        <summary className="text-slate-500 text-xs cursor-pointer hover:text-slate-400 transition-colors">Teknik Detay</summary>
                        <pre className="text-red-400/70 text-xs mt-2 whitespace-pre-wrap break-all font-mono">{error}</pre>
                    </details>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={handleRetry}
                        disabled={retrying}
                        className="flex items-center gap-2 px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <RefreshCw size={16} className={retrying ? 'animate-spin' : ''} />
                        {retrying ? 'Yeniden Deneniyor...' : 'Tekrar Dene'}
                    </button>
                    <Link
                        href={`/${locale}/admin/settings`}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                        <Settings size={16} />
                        Modül Ayarları
                    </Link>
                </div>

                {/* Help text */}
                <p className="text-slate-500 text-xs">
                    Bu modül Elektra PMS sisteminden canlı veri çeker. Bağlantı sorunu devam ediyorsa lütfen sistem yöneticinize başvurun.
                </p>
            </div>
        </div>
    )
}
