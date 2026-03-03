'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Users, Loader2, AlertTriangle, Clock, CheckSquare } from 'lucide-react'

interface TeamMember {
    user: { id: string; name: string; email: string }
    activeTasks: number; urgentTasks: number
    estimatedHours: number; loggedHoursThisWeek: number
    capacityHours: number; utilization: number
    capacityStatus: 'available' | 'busy' | 'overloaded'
    upcomingDeadlines: { id: string; title: string; dueDate: string }[]
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    available: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Müsait' },
    busy: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'Yoğun' },
    overloaded: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Aşırı Yüklü' },
}

export default function ResourceCapacityWidget() {
    const [data, setData] = useState<{ team: TeamMember[]; summary: any } | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/tasks/capacity')
            .then(r => r.json())
            .then(d => setData(d))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <Card className="p-4 bg-white dark:bg-slate-800/50 border-none shadow-lg">
                <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 size={16} className="animate-spin" /> Yükleniyor…
                </div>
            </Card>
        )
    }

    if (!data) return null

    return (
        <Card className="p-4 bg-white dark:bg-slate-800/50 border-none shadow-lg">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Users size={16} className="text-cyan-500" /> Ekip Kapasitesi
            </h3>

            {/* Summary */}
            <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-slate-800 dark:text-white">{data.summary.totalActiveTask}</p>
                    <p className="text-[10px] text-slate-400">Aktif Görev</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-2 text-center">
                    <p className="text-lg font-black text-amber-600">{data.summary.unassignedTasks}</p>
                    <p className="text-[10px] text-slate-400">Atanmamış</p>
                </div>
            </div>

            {/* Team Members */}
            <div className="space-y-3">
                {data.team.map(member => {
                    const style = STATUS_STYLES[member.capacityStatus]
                    return (
                        <div key={member.user.id} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-full bg-cyan-600 text-white flex items-center justify-center text-xs font-bold">
                                        {member.user.name?.charAt(0) || '?'}
                                    </span>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{member.user.name}</p>
                                        <p className="text-[10px] text-slate-400">{member.activeTasks} görev · {member.loggedHoursThisWeek}s kayıtlı</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${style.bg} ${style.text}`}>
                                    {style.label}
                                </span>
                            </div>

                            {/* Capacity bar */}
                            <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${member.utilization > 90 ? 'bg-red-500' :
                                            member.utilization > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}
                                    style={{ width: `${Math.min(member.utilization, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-right text-slate-400">
                                {member.estimatedHours}s / {member.capacityHours}s (%{member.utilization})
                            </p>
                        </div>
                    )
                })}
            </div>
        </Card>
    )
}
