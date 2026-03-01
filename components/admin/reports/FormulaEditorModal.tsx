'use client'

import React, { useState, useEffect } from 'react'
import { Settings2, Save, X, Info, Loader2, Globe, User } from 'lucide-react'

export interface FormulaData {
    id?: string
    reportId: string
    metricName: string
    expression: string
    isGlobal: boolean
}

interface Props {
    reportId: string
    availableVariables: string[]
    currentFormulas: Record<string, FormulaData>
    onSave: (formulas: Record<string, FormulaData>) => void
    isOpen: boolean
    onClose: () => void
}

export default function FormulaEditorModal({ reportId, availableVariables, currentFormulas, onSave, isOpen, onClose }: Props) {
    const [formulas, setFormulas] = useState<Record<string, FormulaData>>(currentFormulas)
    const [savingMetrics, setSavingMetrics] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (isOpen) {
            setFormulas(currentFormulas)
        }
    }, [isOpen, currentFormulas])

    if (!isOpen) return null

    const handleExpressionChange = (metric: string, val: string) => {
        setFormulas(prev => ({
            ...prev,
            [metric]: {
                ...prev[metric],
                expression: val,
                reportId,
                metricName: metric,
                isGlobal: prev[metric]?.isGlobal || false
            }
        }))
    }

    const handleScopeChange = (metric: string, isGlobal: boolean) => {
        setFormulas(prev => ({
            ...prev,
            [metric]: {
                ...prev[metric],
                isGlobal,
                reportId,
                metricName: metric,
                expression: prev[metric]?.expression || ''
            }
        }))
    }

    const saveMetric = async (metric: string) => {
        const formData = formulas[metric]
        if (!formData || !formData.expression.trim()) return

        setSavingMetrics(prev => new Set(prev).add(metric))
        try {
            const res = await fetch('/api/admin/formulas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reportId: formData.reportId || reportId,
                    metricName: formData.metricName || metric,
                    expression: formData.expression,
                    isGlobal: formData.isGlobal
                })
            })
            if (res.ok) {
                // Fetch latest to parent
                onSave({ ...formulas, [metric]: await res.json().then(r => r.formula) })
            } else {
                alert('Formül kaydedilemedi.')
            }
        } catch (error) {
            console.error('Failed to save formula', error)
            alert('Hata oluştu.')
        } finally {
            setSavingMetrics(prev => {
                const next = new Set(prev)
                next.delete(metric)
                return next
            })
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <Settings2 className="text-cyan-500" size={20} />
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Dinamik Rapor Formül Yönetimi</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <Info size={16} className="text-cyan-500 mt-0.5 shrink-0" />
                        Bu panel üzerinden grafik veya tablolarda hesaplanan metriklerin formüllerini değiştirebilirsiniz. Değişkenleri kullanarak dilediğiniz hesaplamayı tasarlayabilirsiniz.
                    </p>
                    <div className="mt-3">
                        <span className="text-xs font-bold text-slate-500 uppercase">Kullanılabilir Değişkenler:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                            {availableVariables.map(v => (
                                <span key={v} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded text-xs font-mono">{v}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 max-h-[60vh] overflow-y-auto space-y-6">
                    {Object.keys(currentFormulas).length === 0 ? (
                        <p className="text-sm text-slate-500 text-center py-4">Düzenlenebilir formül bulunamadı.</p>
                    ) : (
                        Object.keys(currentFormulas).map(metric => (
                            <div key={metric} className="space-y-3">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                                    {metric} Metriği
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">Hesaplama Formülü</label>
                                        <input
                                            type="text"
                                            value={formulas[metric]?.expression || ''}
                                            onChange={(e) => handleExpressionChange(metric, e.target.value)}
                                            placeholder="Örn: (revenue / rooms_sold) * 1.1"
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-slate-900 dark:text-emerald-400 outline-none focus:ring-2 focus:ring-cyan-500"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`scope-${metric}`}
                                                    checked={!formulas[metric]?.isGlobal}
                                                    onChange={() => handleScopeChange(metric, false)}
                                                    className="text-cyan-500 focus:ring-cyan-500"
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1"><User size={14} /> Sadece Benim İçin Kaydet</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio"
                                                    name={`scope-${metric}`}
                                                    checked={formulas[metric]?.isGlobal || false}
                                                    onChange={() => handleScopeChange(metric, true)}
                                                    className="text-cyan-500 focus:ring-cyan-500"
                                                />
                                                <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1"><Globe size={14} className="text-rose-500" /> Tüm Sistem İçin Kaydet</span>
                                            </label>
                                        </div>

                                        <button
                                            onClick={() => saveMetric(metric)}
                                            disabled={savingMetrics.has(metric)}
                                            className="flex items-center gap-1 bg-cyan-600 hover:bg-cyan-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                                        >
                                            {savingMetrics.has(metric) ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                            Kaydet
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}
