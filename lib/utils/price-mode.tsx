'use client'

import React from 'react'

// ─── Types ─────────────────────────────────────────────────────
export type PriceMode = 'gross' | 'net'

// ─── VAT Constants (Turkey) ────────────────────────────────────
/** Accommodation total tax: 10% KDV + 2% konaklama vergisi */
export const DEFAULT_ACCOMMODATION_VAT = 12
/** Food & Beverage KDV rate */
export const DEFAULT_FNB_VAT = 20

// ─── Helpers ───────────────────────────────────────────────────

/** Convert a gross amount → net (strip VAT) */
export function toNet(gross: number, vatPercent: number = DEFAULT_ACCOMMODATION_VAT): number {
    return gross / (1 + vatPercent / 100)
}

/**
 * Return the display price based on mode.
 * For reservation revenue, the default VAT is 10% (accommodation).
 */
export function displayPrice(
    grossAmount: number,
    mode: PriceMode,
    vatPercent: number = DEFAULT_ACCOMMODATION_VAT,
): number {
    if (mode === 'net') return toNet(grossAmount, vatPercent)
    return grossAmount
}

// ─── Toggle Component ──────────────────────────────────────────

interface PriceModeToggleProps {
    mode: PriceMode
    onChange: (mode: PriceMode) => void
    className?: string
}

export function PriceModeToggle({ mode, onChange, className = '' }: PriceModeToggleProps) {
    return (
        <div className={`inline-flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-0.5 text-xs font-medium ${className}`}>
            <button
                onClick={() => onChange('gross')}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 ${mode === 'gross'
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
            >
                Brüt
            </button>
            <button
                onClick={() => onChange('net')}
                className={`px-3 py-1.5 rounded-md transition-all duration-200 ${mode === 'net'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
            >
                Net
            </button>
        </div>
    )
}
