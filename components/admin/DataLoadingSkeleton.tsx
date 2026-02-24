'use client'

import React from 'react'

interface DataLoadingSkeletonProps {
    title?: string
    rows?: number
    cards?: number
    charts?: number
}

export default function DataLoadingSkeleton({
    title = 'Veriler Hazırlanıyor',
    rows = 5,
    cards = 4,
    charts = 2,
}: DataLoadingSkeletonProps) {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex items-center gap-3 mb-2">
                <div className="relative flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-400 to-blue-500 animate-pulse" />
                    <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {title}
                    </span>
                    <div className="flex gap-1 ml-2">
                        {[0, 1, 2].map(i => (
                            <span
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-cyan-400 dark:bg-cyan-500"
                                style={{
                                    animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* KPI Cards Skeleton */}
            <div className={`grid grid-cols-2 md:grid-cols-${Math.min(cards, 4)} gap-4`}>
                {Array.from({ length: cards }).map((_, i) => (
                    <div
                        key={`card-${i}`}
                        className="relative bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-5 overflow-hidden"
                    >
                        {/* Shimmer overlay */}
                        <div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 dark:via-white/5 to-transparent"
                            style={{
                                animation: `shimmer 2s ease-in-out ${i * 0.3}s infinite`,
                            }}
                        />
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-white/10 animate-pulse" />
                            <div className="flex-1 space-y-2">
                                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-16 animate-pulse" />
                                <div className="h-5 bg-slate-200 dark:bg-white/10 rounded w-24 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                            </div>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-white/5 rounded-full w-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                                style={{
                                    animation: `progressBar 2.5s ease-in-out ${i * 0.4}s infinite`,
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className={`grid grid-cols-1 ${charts >= 2 ? 'md:grid-cols-2' : ''} gap-6`}>
                {Array.from({ length: charts }).map((_, i) => (
                    <div
                        key={`chart-${i}`}
                        className="relative bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-5 overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="h-4 bg-slate-200 dark:bg-white/10 rounded w-32 animate-pulse" />
                            <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-16 animate-pulse" />
                        </div>
                        {/* Bar chart skeleton */}
                        <div className="flex items-end gap-2 h-40">
                            {Array.from({ length: 8 }).map((_, j) => (
                                <div key={j} className="flex-1 flex flex-col justify-end">
                                    <div
                                        className="bg-gradient-to-t from-cyan-400/40 to-blue-500/20 dark:from-cyan-500/30 dark:to-blue-600/10 rounded-t-sm"
                                        style={{
                                            animation: `barGrow 2s ease-out ${(j * 0.15) + (i * 0.5)}s infinite`,
                                            height: '100%',
                                            maxHeight: `${30 + Math.random() * 70}%`,
                                        }}
                                    />
                                    <div className="h-2 bg-slate-200 dark:bg-white/10 rounded mt-1 animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Skeleton */}
            <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                {/* Table header */}
                <div className="flex gap-4 p-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
                    {[80, 120, 100, 60, 80].map((w, i) => (
                        <div key={i} className="h-3 bg-slate-300 dark:bg-white/15 rounded animate-pulse" style={{ width: `${w}px` }} />
                    ))}
                </div>
                {/* Table rows */}
                {Array.from({ length: rows }).map((_, i) => (
                    <div
                        key={`row-${i}`}
                        className="flex gap-4 p-4 border-b border-slate-100 dark:border-white/5"
                        style={{ opacity: 1 - (i * 0.12) }}
                    >
                        {[80, 120, 100, 60, 80].map((w, j) => (
                            <div
                                key={j}
                                className="h-3 bg-slate-200 dark:bg-white/10 rounded animate-pulse"
                                style={{
                                    width: `${w}px`,
                                    animationDelay: `${(i * 100) + (j * 50)}ms`,
                                }}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Inline keyframes */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes progressBar {
                    0% { width: 0%; }
                    50% { width: 80%; }
                    100% { width: 0%; }
                }
                @keyframes barGrow {
                    0% { transform: scaleY(0.2); opacity: 0.3; }
                    50% { transform: scaleY(1); opacity: 1; }
                    100% { transform: scaleY(0.2); opacity: 0.3; }
                }
            `}</style>
        </div>
    )
}
