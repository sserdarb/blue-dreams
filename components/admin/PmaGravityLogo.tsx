'use client'

import React from 'react'

interface PmaGravityLogoProps {
    size?: number
    className?: string
    showText?: boolean
    textSize?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function PmaGravityLogo({ size = 40, className = '', showText = true, textSize = 'md' }: PmaGravityLogoProps) {
    const textSizes = {
        sm: { name: 'text-sm', sub: 'text-[8px]' },
        md: { name: 'text-lg', sub: 'text-[10px]' },
        lg: { name: 'text-2xl', sub: 'text-xs' },
        xl: { name: 'text-4xl', sub: 'text-sm' },
    }

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <div className="flex flex-col">
                <span className={`${textSizes[textSize].name} font-bold tracking-wider text-slate-900 dark:text-white`}>
                    Pma Gravity
                </span>
                <span className={`${textSizes[textSize].sub} text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]`}>
                    Hospitality Technology
                </span>
            </div>
        </div>
    )
}
