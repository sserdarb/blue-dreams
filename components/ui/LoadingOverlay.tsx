'use client'

interface LoadingOverlayProps {
    /** Show the overlay */
    visible: boolean
    /** Loading message — defaults to "Yükleniyor..." */
    message?: string
    /** If true, renders inline (no fixed positioning) */
    inline?: boolean
    /** Optional dark mode variant */
    dark?: boolean
}

export default function LoadingOverlay({
    visible,
    message = 'Yükleniyor...',
    inline = false,
    dark = false
}: LoadingOverlayProps) {
    if (!visible) return null

    const bgClass = inline
        ? dark
            ? 'bg-slate-800/80 rounded-xl'
            : 'bg-white/80 rounded-xl'
        : dark
            ? 'fixed inset-0 z-[100] bg-slate-900/70'
            : 'fixed inset-0 z-[100] bg-white/70'

    const textClass = dark ? 'text-slate-200' : 'text-slate-600'
    const spinnerBorder = dark ? 'border-cyan-400' : 'border-cyan-600'

    return (
        <div className={`${bgClass} flex items-center justify-center`} style={{ minHeight: inline ? '120px' : undefined }}>
            <div className="flex flex-col items-center gap-3">
                {/* Spinner — pure CSS, no backdrop-filter (Safari-safe) */}
                <div
                    className={`w-10 h-10 rounded-full border-[3px] border-slate-200 ${spinnerBorder} animate-spin`}
                    style={{
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent',
                        animationDuration: '0.8s'
                    }}
                />
                <span className={`text-sm font-medium ${textClass}`}>
                    {message}
                </span>
            </div>
        </div>
    )
}
