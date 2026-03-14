'use client'

import React, { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp, Save, Loader2, Plus, Trash2, GripVertical, ImageIcon, Link2, Type, Palette, Hash } from 'lucide-react'

// ─── Elementor-style Collapsible Section ──────────────────────────────
export function EditorSection({
    title,
    icon,
    children,
    defaultOpen = true,
    badge,
}: {
    title: string
    icon?: ReactNode
    children: ReactNode
    defaultOpen?: boolean
    badge?: string | number
}) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
            >
                <div className="flex items-center gap-2.5">
                    {icon && <span className="text-blue-500 dark:text-blue-400">{icon}</span>}
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        {title}
                    </span>
                    {badge !== undefined && (
                        <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                {open ? (
                    <ChevronUp size={14} className="text-slate-400" />
                ) : (
                    <ChevronDown size={14} className="text-slate-400" />
                )}
            </button>
            {open && (
                <div className="p-4 space-y-4 border-t border-slate-100 dark:border-slate-800">
                    {children}
                </div>
            )}
        </div>
    )
}

// ─── Styled Field Wrapper ─────────────────────────────────────────────
export function EditorField({
    label,
    hint,
    children,
    charCount,
    charMax,
    inline = false,
}: {
    label: string
    hint?: string
    children: ReactNode
    charCount?: number
    charMax?: number
    inline?: boolean
}) {
    return (
        <div className={inline ? 'flex items-center gap-3' : ''}>
            <div className={`flex items-center justify-between ${inline ? 'w-28 shrink-0' : 'mb-1.5'}`}>
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {label}
                </label>
                {charCount !== undefined && charMax && (
                    <span className={`text-[10px] font-mono ${charCount > charMax ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                        {charCount}/{charMax}
                    </span>
                )}
            </div>
            {children}
            {hint && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 italic">{hint}</p>}
        </div>
    )
}

// ─── Modern Input ─────────────────────────────────────────────────────
export function EditorInput({
    value,
    onChange,
    placeholder,
    type = 'text',
    icon,
    className = '',
}: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    type?: string
    icon?: ReactNode
    className?: string
}) {
    return (
        <div className={`relative flex items-center ${className}`}>
            {icon && (
                <div className="absolute left-3 text-slate-400 dark:text-slate-500 pointer-events-none">
                    {icon}
                </div>
            )}
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg ${icon ? 'pl-9' : 'px-3'} pr-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all`}
            />
        </div>
    )
}

// ─── Modern Textarea ──────────────────────────────────────────────────
export function EditorTextarea({
    value,
    onChange,
    placeholder,
    rows = 3,
}: {
    value: string
    onChange: (v: string) => void
    placeholder?: string
    rows?: number
}) {
    return (
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 resize-none transition-all"
        />
    )
}

// ─── Modern Select ────────────────────────────────────────────────────
export function EditorSelect({
    value,
    onChange,
    options,
}: {
    value: string | number
    onChange: (v: string) => void
    options: { value: string | number; label: string }[]
}) {
    return (
        <select
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 transition-all appearance-none"
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    )
}

// ─── Image URL Field with Upload + File Manager + PDF Preview ──────────
export { default as EditorImageField } from '@/components/admin/ImageUrlField'

// ─── Repeater (Dynamic List) ──────────────────────────────────────────
export function EditorRepeater<T>({
    items,
    onUpdate,
    renderItem,
    addLabel = 'Ekle',
    emptyMessage = 'Henüz öğe eklenmedi',
    createNewItem,
}: {
    items: T[]
    onUpdate: (items: T[]) => void
    renderItem: (item: T, index: number, update: (item: T) => void, remove: () => void) => ReactNode
    addLabel?: string
    emptyMessage?: string
    createNewItem: () => T
}) {
    const add = () => onUpdate([...items, createNewItem()])
    const remove = (i: number) => onUpdate(items.filter((_, idx) => idx !== i))
    const update = (i: number, item: T) => {
        const newItems = [...items]
        newItems[i] = item
        onUpdate(newItems)
    }

    return (
        <div className="space-y-2">
            {items.length === 0 && (
                <div className="text-center py-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic">{emptyMessage}</p>
                </div>
            )}
            {items.map((item, i) => (
                <div key={i} className="p-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/50 dark:border-slate-700/50 space-y-2 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                    <div className="flex items-start gap-2">
                        <div className="pt-1.5 text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing hover:text-slate-500 dark:hover:text-slate-400 transition-colors">
                            <GripVertical size={14} />
                        </div>
                        <div className="flex-1 space-y-2">
                            {renderItem(item, i, (updated) => update(i, updated), () => remove(i))}
                        </div>
                        <button
                            type="button"
                            onClick={() => remove(i)}
                            className="mt-1 p-1.5 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Sil"
                        >
                            <Trash2 size={13} />
                        </button>
                    </div>
                </div>
            ))}
            <button
                type="button"
                onClick={add}
                className="w-full py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-blue-600 dark:text-blue-400 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all text-xs font-bold flex items-center justify-center gap-2 group"
            >
                <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                {addLabel}
            </button>
        </div>
    )
}

// ─── Sticky Save Bar ──────────────────────────────────────────────────
export function SaveBar({
    isDirty,
    saving,
    onSave,
}: {
    isDirty: boolean
    saving: boolean
    onSave: () => void
}) {
    if (!isDirty) return null
    return (
        <div className="sticky bottom-0 z-10 -mx-4 -mb-4 px-4 py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 mt-4">
            <button
                onClick={onSave}
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
        </div>
    )
}

// ─── Grid helpers ─────────────────────────────────────────────────────
export function EditorGrid2({ children }: { children: ReactNode }) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
}

export function EditorGrid3({ children }: { children: ReactNode }) {
    return <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{children}</div>
}
