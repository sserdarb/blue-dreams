'use client'

import React, { useMemo, useRef, useState } from 'react'
import { Clock, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────
interface Task {
    id: string; title: string; status: string; priority: string
    startDate?: string | null; dueDate?: string | null
    assignee?: { name: string } | null; estimatedMin?: number | null
    dependencies?: any[]
}

const STATUS_COLORS: Record<string, string> = {
    todo: '#64748b', in_progress: '#3b82f6', review: '#f59e0b', done: '#10b981', cancelled: '#ef4444'
}
const PRIORITY_BORDERS: Record<string, string> = {
    low: 'border-l-slate-400', medium: 'border-l-blue-500', high: 'border-l-orange-500', urgent: 'border-l-red-500'
}

interface TaskGanttViewProps {
    tasks: Task[]
    onTaskClick?: (task: Task) => void
}

export default function TaskGanttView({ tasks, onTaskClick }: TaskGanttViewProps) {
    const [zoom, setZoom] = useState(1) // 1 = day, 0.5 = half-day, 2 = 2days per unit
    const scrollRef = useRef<HTMLDivElement>(null)

    // Calculate date range (from earliest startDate to latest dueDate + buffer)
    const { rangeStart, rangeEnd, totalDays, dayWidth } = useMemo(() => {
        const now = new Date()
        let earliest = new Date(now)
        earliest.setDate(earliest.getDate() - 7)
        let latest = new Date(now)
        latest.setDate(latest.getDate() + 30)

        tasks.forEach(t => {
            if (t.startDate) {
                const s = new Date(t.startDate)
                if (s < earliest) earliest = s
            }
            if (t.dueDate) {
                const d = new Date(t.dueDate)
                if (d > latest) latest = d
            }
        })
        latest.setDate(latest.getDate() + 7) // buffer

        const total = Math.ceil((latest.getTime() - earliest.getTime()) / (1000 * 60 * 60 * 24))
        return { rangeStart: earliest, rangeEnd: latest, totalDays: total, dayWidth: 48 / zoom }
    }, [tasks, zoom])

    // Generate day headers
    const dayHeaders = useMemo(() => {
        const days = []
        for (let i = 0; i < totalDays; i++) {
            const d = new Date(rangeStart)
            d.setDate(d.getDate() + i)
            days.push(d)
        }
        return days
    }, [rangeStart, totalDays])

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOffset = Math.floor((today.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth

    // Compute bar positions
    const taskBars = useMemo(() => {
        return tasks
            .filter(t => t.startDate || t.dueDate)
            .map(task => {
                const start = task.startDate ? new Date(task.startDate) : (task.dueDate ? new Date(new Date(task.dueDate).getTime() - 3 * 86400000) : new Date())
                const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + 3 * 86400000)

                const startOffset = Math.max(0, (start.getTime() - rangeStart.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth
                const duration = Math.max(1, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) * dayWidth

                return { task, left: startOffset, width: duration }
            })
    }, [tasks, rangeStart, dayWidth])

    const ROW_HEIGHT = 44

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock size={16} className="text-cyan-500" /> Gantt Zaman Çizelgesi
                </h3>
                <div className="flex items-center gap-2">
                    <button onClick={() => setZoom(z => Math.min(z + 0.5, 4))} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><ZoomOut size={16} className="text-slate-500" /></button>
                    <span className="text-xs text-slate-400">%{Math.round(100 / zoom)}</span>
                    <button onClick={() => setZoom(z => Math.max(z - 0.5, 0.5))} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"><ZoomIn size={16} className="text-slate-500" /></button>
                    <button onClick={() => { if (scrollRef.current) scrollRef.current.scrollLeft = todayOffset - 200 }} className="px-2 py-1 text-xs bg-cyan-600 text-white rounded font-medium">Bugün</button>
                </div>
            </div>

            <div className="flex">
                {/* Task labels (left column) */}
                <div className="w-[220px] min-w-[220px] border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <div className="h-[52px] border-b border-slate-200 dark:border-slate-700 flex items-center px-3">
                        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Görev</span>
                    </div>
                    {taskBars.map(({ task }, i) => (
                        <div
                            key={task.id}
                            className="flex items-center px-3 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30"
                            style={{ height: ROW_HEIGHT }}
                            onClick={() => onTaskClick?.(task)}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{task.title}</p>
                                {task.assignee && <p className="text-[10px] text-slate-400 truncate">{task.assignee.name}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Timeline area */}
                <div ref={scrollRef} className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div style={{ width: totalDays * dayWidth, minWidth: '100%' }}>
                        {/* Day headers */}
                        <div className="flex h-[52px] border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            {dayHeaders.map((d, i) => {
                                const isWeekend = d.getDay() === 0 || d.getDay() === 6
                                const isToday = d.toDateString() === today.toDateString()
                                return (
                                    <div key={i} style={{ width: dayWidth, minWidth: dayWidth }}
                                        className={`flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-700/30 ${isWeekend ? 'bg-slate-50 dark:bg-slate-800/80' : ''} ${isToday ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''}`}
                                    >
                                        <span className={`text-[9px] uppercase tracking-wider ${isToday ? 'text-cyan-600 font-bold' : 'text-slate-400'}`}>
                                            {d.toLocaleDateString('tr-TR', { weekday: 'short' })}
                                        </span>
                                        <span className={`text-xs font-bold ${isToday ? 'text-cyan-600' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {d.getDate()}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Task bars */}
                        <div className="relative">
                            {/* Today line */}
                            <div className="absolute top-0 bottom-0 w-[2px] bg-cyan-500 z-20 opacity-60" style={{ left: todayOffset }} />

                            {taskBars.map(({ task, left, width }, i) => (
                                <div key={task.id} className="relative border-b border-slate-100 dark:border-slate-700/30" style={{ height: ROW_HEIGHT }}>
                                    <div
                                        className={`absolute top-2 rounded-md shadow-sm cursor-pointer transition-all hover:shadow-md hover:brightness-110 border-l-4 ${PRIORITY_BORDERS[task.priority] || 'border-l-slate-400'}`}
                                        style={{
                                            left,
                                            width: Math.max(width, 20),
                                            height: ROW_HEIGHT - 16,
                                            backgroundColor: STATUS_COLORS[task.status] + '30',
                                        }}
                                        onClick={() => onTaskClick?.(task)}
                                    >
                                        <div className="h-full rounded-r-md overflow-hidden relative flex items-center px-2">
                                            {/* Progress fill */}
                                            <div className="absolute inset-0 rounded-r-md opacity-40"
                                                style={{
                                                    backgroundColor: STATUS_COLORS[task.status],
                                                    width: task.status === 'done' ? '100%' : task.status === 'in_progress' ? '50%' : task.status === 'review' ? '75%' : '0%'
                                                }}
                                            />
                                            <span className="relative z-10 text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">
                                                {width > 60 ? task.title : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {taskBars.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                    <Clock size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Gösterilecek görev yok. Başlangıç/bitiş tarihi olan görevler burada görünür.</p>
                </div>
            )}
        </div>
    )
}
