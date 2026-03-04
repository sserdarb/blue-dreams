'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TestTubeDiagonal, Loader2, Info } from 'lucide-react'

// Demo mode interface
interface DemoModule {
    key: string
    label: string
    description: string
    enabled: boolean
}

export function DemoSettingsForm() {
    const [modules, setModules] = useState<DemoModule[]>([])
    const [loading, setLoading] = useState(true)
    const [toggling, setToggling] = useState<string | null>(null)

    useEffect(() => {
        fetchDemoConfig()
    }, [])

    const fetchDemoConfig = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/settings/demo-mode')
            if (res.ok) {
                const data = await res.json()
                if (data.success && data.modules) {
                    setModules(data.modules)
                }
            }
        } catch (error) {
            console.error('Demo config load error:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleModule = async (key: string, currentValue: boolean) => {
        setToggling(key)
        try {
            const res = await fetch('/api/admin/settings/demo-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, enabled: !currentValue })
            })

            const data = await res.json()

            if (data.success) {
                setModules(prev =>
                    prev.map(m => m.key === key ? { ...m, enabled: data.enabled } : m)
                )
            } else if (data.fallbackHint) {
                alert(`DB Kaydı yapılamadı. Çözüm: ${data.fallbackHint}`)
            } else {
                alert('Değişiklik kaydedilemedi.')
            }
        } catch (error) {
            console.error('Toggle error:', error)
            alert('Ağ hatası oluştu.')
        } finally {
            setToggling(null)
        }
    }

    if (loading) {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-muted-foreground" /></div>
    }

    return (
        <Card className="p-6 border-amber-200 dark:border-amber-900 bg-amber-50/10 dark:bg-amber-900/10">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl">
                    <TestTubeDiagonal size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">Geliştirici & Test Modları (Demo)</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Bu ayarlar gerçek API bağlantıları yerine mock (sahte) verilerin kullanılmasını sağlar.
                        Canlı ortamda (Production) tüm test modlarının <span className="font-bold text-red-500">kapalı</span> olması önerilir.
                    </p>

                    <div className="space-y-4">
                        {modules.map(mod => (
                            <div key={mod.key} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-lg border shadow-sm">
                                <div>
                                    <div className="font-medium flex items-center gap-2">
                                        {mod.label}
                                        {mod.enabled ? <Badge variant="default" className="text-[10px] h-5 bg-amber-500">DEMO AKTİF</Badge> : <Badge variant="secondary" className="text-[10px] h-5">Canlı Veri</Badge>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                        <Info size={12} /> {mod.description}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleModule(mod.key, mod.enabled)}
                                        disabled={toggling === mod.key}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${mod.enabled ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                                            } disabled:opacity-50`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mod.enabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}
