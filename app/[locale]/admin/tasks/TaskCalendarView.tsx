'use client'

import React, { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'

interface Task {
    id: string; title: string; status: string; priority: string
    dueDate?: string | null; assignee?: { name: string } | null
}

const STATUS_DOT: Record<string, string> = {
    todo: 'bg-slate-400', in_progress: 'bg-blue-500', review: 'bg-amber-500', done: 'bg-emerald-500', cancelled: 'bg-red-500'
}

interface TaskCalendarViewProps {
    tasks: Task[]
    onTaskClick?: (task: Task) => void
    onDayClick?: (date: Date) => void
}

export default function TaskCalendarView({ tasks, onTaskClick, onDayClick }: TaskCalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())

    const { days, firstDayOfWeek } = useMemo(() => {
        const year = currentMonth.getFullYear()
        const month = currentMonth.getMonth()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const firstDay = new Date(year, month, 1).getDay()

        const d = []
        for (let i = 1; i <= daysInMonth; i++) d.push(new Date(year, month, i))
        return { days: d, firstDayOfWeek: firstDay === 0 ? 6 : firstDay - 1 } // Monday-start
    }, [currentMonth])

    // Group tasks by date
    const tasksByDate = useMemo(() => {
        const map: Record<string, Task[]> = {}
        tasks.forEach(t => {
            if (!t.dueDate) return
            const key = new Date(t.dueDate).toISOString().split('T')[0]
            if (!map[key]) map[key] = []
            map[key].push(t)
        })
        return map
    }, [tasks])

    const navigate = (dir: number) => {
        const next = new Date(currentMonth)
        next.setMonth(next.getMonth() + dir)
        setCurrentMonth(next)
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <ChevronLeft size={18} className="text-slate-500" />
                </button>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Calendar size={18} className="text-cyan-500" />
                    {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </h3>
                <button onClick={() => navigate(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                    <ChevronRight size={18} className="text-slate-500" />
                </button>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
                {dayNames.map(d => (
                    <div key={d} className="text-center py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7">
                {/* Empty cells for offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                    <div key={`empty-${i}`} className="min-h-[100px] border-r border-b border-slate-100 dark:border-slate-700/30 bg-slate-50/50 dark:bg-slate-900/20" />
                ))}

                {days.map(day => {
                    const key = day.toISOString().split('T')[0]
                    const dayTasks = tasksByDate[key] || []
                    const isToday = day.getTime() === today.getTime()
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6

                    return (
                        <div
                            key={key}
                            className={`min-h-[100px] border-r border-b border-slate-100 dark:border-slate-700/30 p-1.5 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/20 ${isWeekend ? 'bg-slate-50/80 dark:bg-slate-800/30' : ''} ${isToday ? 'bg-cyan-50 dark:bg-cyan-950/20' : ''}`}
                            onClick={() => onDayClick?.(day)}
                        >
                            <span className={`text-xs font-bold inline-flex items-center justify-center w-6 h-6 rounded-full ${isToday ? 'bg-cyan-600 text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {day.getDate()}
                            </span>

                            <div className="mt-1 space-y-0.5">
                                {dayTasks.slice(0, 3).map(task => (
                                    <div
                                        key={task.id}
                                        className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-colors"
                                        onClick={(e) => { e.stopPropagation(); onTaskClick?.(task) }}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[task.status]}`} />
                                        <span className="truncate text-slate-600 dark:text-slate-300 font-medium">{task.title}</span>
                                    </div>
                                ))}
                                {dayTasks.length > 3 && (
                                    <span className="text-[9px] text-slate-400 px-1">+{dayTasks.length - 3} daha</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
