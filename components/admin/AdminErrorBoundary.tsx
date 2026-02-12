'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
}

export class AdminErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[Admin Error Boundary]', error.message)
        console.error('[Admin Error Stack]', error.stack)
        console.error('[Admin Component Stack]', errorInfo.componentStack)
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-6 m-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                    <h3 className="text-red-400 font-bold text-lg mb-2">⚠️ Bir hata oluştu</h3>
                    <p className="text-red-300 text-sm mb-4">{this.state.error?.message}</p>
                    <details className="text-xs text-red-400/70">
                        <summary className="cursor-pointer hover:text-red-300">Hata detayları (konsol loguna bakın)</summary>
                        <pre className="mt-2 p-2 bg-black/30 rounded overflow-x-auto text-xs">
                            {this.state.error?.stack}
                        </pre>
                    </details>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                    >
                        Tekrar Dene
                    </button>
                </div>
            )
        }

        return this.props.children
    }
}
