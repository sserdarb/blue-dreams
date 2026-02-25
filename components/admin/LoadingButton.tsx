'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
    variant?: 'primary' | 'danger' | 'secondary' | 'ghost'
    icon?: React.ReactNode
    children: React.ReactNode
}

const variantClasses: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
}

export default function LoadingButton({
    loading = false,
    variant = 'primary',
    icon,
    children,
    className = '',
    disabled,
    ...props
}: LoadingButtonProps) {
    return (
        <button
            {...props}
            disabled={loading || disabled}
            className={`
                inline-flex items-center justify-center gap-2 
                px-4 py-2.5 rounded-lg text-sm font-semibold
                transition-all duration-200 
                disabled:opacity-60 disabled:cursor-not-allowed
                ${variantClasses[variant] || variantClasses.primary}
                ${className}
            `}
        >
            {loading ? (
                <Loader2 size={16} className="animate-spin" />
            ) : icon ? (
                icon
            ) : null}
            {children}
        </button>
    )
}
