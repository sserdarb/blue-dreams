'use client'

import React, { Component } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
    children: React.ReactNode
}

interface State {
    hasError: boolean
    isChunkError: boolean
}

/**
 * Error boundary that catches ChunkLoadError (stale cached chunks after deploy)
 * and auto-reloads the page to fetch fresh assets.
 */
export default class ChunkErrorHandler extends Component<Props, State> {
    state: State = { hasError: false, isChunkError: false }

    static getDerivedStateFromError(error: Error): State {
        const isChunkError = error.name === 'ChunkLoadError' ||
            error.message?.includes('Loading chunk') ||
            error.message?.includes('Failed to fetch dynamically imported module')

        return { hasError: true, isChunkError }
    }

    componentDidCatch(error: Error) {
        const isChunkError = error.name === 'ChunkLoadError' ||
            error.message?.includes('Loading chunk') ||
            error.message?.includes('Failed to fetch dynamically imported module')

        if (isChunkError) {
            // Check if we already tried reloading to avoid infinite loop
            const reloadKey = 'chunk_error_reload'
            const lastReload = sessionStorage.getItem(reloadKey)
            const now = Date.now()

            if (!lastReload || now - parseInt(lastReload) > 10000) {
                // Auto-reload once (with 10s cooldown)
                sessionStorage.setItem(reloadKey, String(now))
                window.location.reload()
                return
            }
        }

        console.error('[ChunkErrorHandler]', error)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-center max-w-md mx-auto p-8">
                        <div className="w-16 h-16 bg-cyan-100 dark:bg-cyan-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <RefreshCw size={28} className="text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                            {this.state.isChunkError ? 'Güncelleme Algılandı' : 'Bir Hata Oluştu'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                            {this.state.isChunkError
                                ? 'Yeni bir güncelleme yüklendi. Sayfayı yenileyerek devam edebilirsiniz.'
                                : 'Beklenmeyen bir hata oluştu. Sayfayı yenilemeyi deneyin.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
                        >
                            <RefreshCw size={16} />
                            Sayfayı Yenile
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
