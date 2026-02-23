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
            {/* SVG Icon — PMA letters with orbital motif */}
            <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                <svg
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full"
                >
                    {/* Outer orbital ring */}
                    <circle
                        cx="32"
                        cy="32"
                        r="29"
                        stroke="url(#pma-grad-ring)"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        opacity="0.4"
                    />
                    {/* Inner circle background */}
                    <circle
                        cx="32"
                        cy="32"
                        r="24"
                        fill="url(#pma-grad-bg)"
                        stroke="url(#pma-grad-border)"
                        strokeWidth="1.5"
                    />

                    {/* PMA Letters — Bold, geometric, tech style */}
                    {/* P */}
                    <path
                        d="M14 42V22H20C23.3 22 25 24 25 26.5C25 29 23.3 31 20 31H14"
                        stroke="url(#pma-grad-text)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    {/* M */}
                    <path
                        d="M28 42V22L33 32L38 22V42"
                        stroke="url(#pma-grad-text)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />
                    {/* A */}
                    <path
                        d="M42 42L47 22L52 42M43.5 36H50.5"
                        stroke="url(#pma-grad-text)"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />

                    {/* Orbital accent dots */}
                    <circle cx="52" cy="12" r="2.5" fill="#06b6d4" opacity="0.8">
                        <animate
                            attributeName="opacity"
                            values="0.4;1;0.4"
                            dur="3s"
                            repeatCount="indefinite"
                        />
                    </circle>
                    <circle cx="12" cy="52" r="2" fill="#8b5cf6" opacity="0.6">
                        <animate
                            attributeName="opacity"
                            values="0.3;0.8;0.3"
                            dur="4s"
                            repeatCount="indefinite"
                        />
                    </circle>

                    {/* Small upward spark — gravity motif */}
                    <path
                        d="M55 20L55 14M55 14L53 16.5M55 14L57 16.5"
                        stroke="#22d3ee"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.7"
                    />

                    {/* Gradients */}
                    <defs>
                        <linearGradient id="pma-grad-ring" x1="0" y1="0" x2="64" y2="64">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <radialGradient id="pma-grad-bg" cx="32" cy="32" r="24" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#0f172a" />
                            <stop offset="100%" stopColor="#1e293b" />
                        </radialGradient>
                        <linearGradient id="pma-grad-border" x1="8" y1="8" x2="56" y2="56">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.5" />
                            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.5" />
                        </linearGradient>
                        <linearGradient id="pma-grad-text" x1="14" y1="22" x2="52" y2="42">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="50%" stopColor="#e2e8f0" />
                            <stop offset="100%" stopColor="#94a3b8" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Text next to icon */}
            {showText && (
                <div className="flex flex-col">
                    <span className={`${textSizes[textSize].name} font-bold tracking-wider bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent`}>
                        PMA GRAVITY
                    </span>
                    <span className={`${textSizes[textSize].sub} text-cyan-400/70 uppercase tracking-[0.2em]`}>
                        Property Management
                    </span>
                </div>
            )}
        </div>
    )
}
