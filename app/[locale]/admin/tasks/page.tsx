'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import {
    Plus, Search, Filter, CheckSquare, Clock, AlertTriangle, ArrowUpRight,
    MoreHorizontal, MessageSquare, Paperclip, Calendar, User, Building2,
    ChevronDown, X, Save, Sparkles, GripVertical, LayoutList, Columns3,
    Flag, Tag, GitBranch, Mail, Bell, RefreshCw, Trash2, Edit2
} from 'lucide-react'
import { getAdminTranslations, AdminTranslations, AdminLocale } from '@/lib/admin-translations'

// ─── Types ───
interface Task {
    id: string; title: string; description?: string | null
    status: string; priority: string
    dueDate?: string | null; departmentId?: string | null
    assigneeId?: string | null; creatorId: string
    parentId?: string | null; tags?: string | null
    sourceType?: string | null; order: number
    estimatedMin?: number | null; completedAt?: string | null
    createdAt: string; updatedAt: string
    department?: { id: string; name: string; color: string } | null
    assignee?: { id: string; name: string; email: string } | null
    creator?: { id: string; name: string } | null
    _count?: { comments: number; attachments: number }
}

interface Department { id: string; name: string; color: string; icon: string; _count?: { tasks: number } }

const STATUSES = [
    { key: 'todo', label: 'Yapılacak', color: 'bg-slate-500', lightBg: 'bg-slate-100 dark:bg-slate-800', icon: CheckSquare },
    { key: 'in_progress', label: 'Devam Ediyor', color: 'bg-blue-500', lightBg: 'bg-blue-50 dark:bg-blue-900/20', icon: Clock },
    { key: 'review', label: 'İnceleme', color: 'bg-amber-500', lightBg: 'bg-amber-50 dark:bg-amber-900/20', icon: ArrowUpRight },
    { key: 'done', label: 'Tamamlandı', color: 'bg-emerald-500', lightBg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: CheckSquare },
]

const PRIORITIES: Record<string, { label: string; color: string; icon: string }> = {
    low: { label: 'Düşük', color: 'text-slate-400', icon: '○' },
    medium: { label: 'Orta', color: 'text-blue-500', icon: '◐' },
    high: { label: 'Yüksek', color: 'text-orange-500', icon: '●' },
    urgent: { label: 'Acil', color: 'text-red-500', icon: '🔴' },
}

export default function TasksPage() {
    const params = useParams()
    const locale = (params?.locale as AdminLocale) || 'tr'
    const t = getAdminTranslations(locale) as AdminTranslations

    const [tasks, setTasks] = useState<Task[]>([])
    const [departments, setDepartments] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [filterDept, setFilterDept] = useState('')
    const [filterPriority, setFilterPriority] = useState('')
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [draggedTask, setDraggedTask] = useState<string | null>(null)

    // Fetch data
    const fetchData = useCallback(async () => {
        try {
            const [tasksRes, deptsRes] = await Promise.all([
                fetch('/api/admin/tasks'),
                fetch('/api/admin/departments'),
            ])
            if (tasksRes.ok) setTasks(await tasksRes.json())
            if (deptsRes.ok) setDepartments(await deptsRes.json())
        } catch (e) { console.error('Fetch error:', e) }
        setLoading(false)
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    // Filter tasks
    const filtered = tasks.filter(t => {
        if (filterDept && t.departmentId !== filterDept) return false
        if (filterPriority && t.priority !== filterPriority) return false
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            if (!t.title.toLowerCase().includes(term) && !(t.description || '').toLowerCase().includes(term)) return false
        }
        return !t.parentId // Only top-level tasks in kanban
    })

    // Move task status via drag & drop
    const moveTask = async (taskId: string, newStatus: string) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
        await fetch(`/api/admin/tasks/${taskId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus }),
        })
    }

    // Create task
    const createTask = async (data: any) => {
        const res = await fetch('/api/admin/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...data, creatorId: 'system' }),
        })
        if (res.ok) {
            const task = await res.json()
            setTasks(prev => [task, ...prev])
            setShowCreateModal(false)
        }
    }

    // Delete task
    const deleteTask = async (id: string) => {
        if (!confirm('Bu görevi silmek istediğinize emin misiniz?')) return
        await fetch(`/api/admin/tasks/${id}`, { method: 'DELETE' })
        setTasks(prev => prev.filter(t => t.id !== id))
    }

    // Quick status counts
    const statusCounts = STATUSES.reduce((acc, s) => {
        acc[s.key] = filtered.filter(t => t.status === s.key).length
        return acc
    }, {} as Record<string, number>)

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="grid grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CheckSquare className="text-cyan-500" size={22} />
                            {(t as any).tasks || 'Görevler'}
                        </h1>
                        <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden">
                            <button onClick={() => setViewMode('kanban')}
                                className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition-all ${viewMode === 'kanban' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>
                                <Columns3 size={14} /> Kanban
                            </button>
                            <button onClick={() => setViewMode('list')}
                                className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1 transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>
                                <LayoutList size={14} /> Liste
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Search */}
                        <div className="relative">
                            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Görev ara..." className="pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-48 outline-none focus:ring-2 focus:ring-cyan-500" />
                        </div>

                        {/* Department Filter */}
                        <select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none">
                            <option value="">Tüm Departmanlar</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>

                        {/* Priority Filter */}
                        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
                            className="px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none">
                            <option value="">Tüm Öncelikler</option>
                            {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                        </select>

                        <button onClick={() => fetchData()}
                            className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-500 hover:text-cyan-600 transition-colors border border-slate-200 dark:border-slate-700">
                            <RefreshCw size={16} />
                        </button>

                        <button onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-cyan-600/20">
                            <Plus size={16} /> Yeni Görev
                        </button>
                    </div>
                </div>

                {/* Status summary */}
                <div className="flex gap-4 mt-4">
                    {STATUSES.map(s => (
                        <div key={s.key} className="flex items-center gap-2">
                            <div className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                            <span className="text-xs text-slate-500 font-medium">{s.label}</span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{statusCounts[s.key] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Kanban Board */}
            {viewMode === 'kanban' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {STATUSES.map(status => {
                        const columnTasks = filtered.filter(t => t.status === status.key)
                        return (
                            <div key={status.key}
                                className={`rounded-2xl border border-slate-200 dark:border-slate-700 ${status.lightBg} min-h-[400px]`}
                                onDragOver={e => e.preventDefault()}
                                onDrop={() => { if (draggedTask) { moveTask(draggedTask, status.key); setDraggedTask(null) } }}
                            >
                                {/* Column Header */}
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${status.color}`} />
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{status.label}</h3>
                                            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-full font-bold">{columnTasks.length}</span>
                                        </div>
                                        <button onClick={() => { setShowCreateModal(true) }}
                                            className="p-1 text-slate-400 hover:text-cyan-600 rounded transition-colors">
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Task Cards */}
                                <div className="p-3 space-y-3">
                                    {columnTasks.map(task => (
                                        <TaskCard key={task.id} task={task}
                                            onDragStart={() => setDraggedTask(task.id)}
                                            onEdit={() => setEditingTask(task)}
                                            onDelete={() => deleteTask(task.id)}
                                        />
                                    ))}
                                    {columnTasks.length === 0 && (
                                        <div className="text-center py-8 text-slate-400 text-xs">
                                            Görev yok
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Görev</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Durum</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Öncelik</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Departman</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Atanan</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Bitiş</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {filtered.map(task => {
                                const p = PRIORITIES[task.priority]
                                const s = STATUSES.find(s => s.key === task.status)
                                return (
                                    <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">{task.title}</span>
                                            {task.description && <p className="text-xs text-slate-500 truncate max-w-xs mt-0.5">{task.description}</p>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold text-white ${s?.color || 'bg-slate-500'}`}>
                                                {s?.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-xs font-bold ${p?.color}`}>{p?.icon} {p?.label}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {task.department ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: task.department.color }}>
                                                    <Building2 size={12} /> {task.department.name}
                                                </span>
                                            ) : <span className="text-xs text-slate-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {task.assignee ? (
                                                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{task.assignee.name}</span>
                                            ) : <span className="text-xs text-slate-400">Atanmamış</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            {task.dueDate ? (
                                                <span className="text-xs text-slate-500">{new Date(task.dueDate).toLocaleDateString('tr-TR')}</span>
                                            ) : <span className="text-xs text-slate-400">—</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex gap-1">
                                                <button onClick={() => setEditingTask(task)} className="p-1 text-slate-400 hover:text-blue-600"><Edit2 size={14} /></button>
                                                <button onClick={() => deleteTask(task.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={14} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {filtered.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <CheckSquare className="mx-auto mb-2 text-slate-300" size={40} />
                            <p className="font-medium">Henüz görev yok</p>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(showCreateModal || editingTask) && (
                <TaskModal
                    task={editingTask}
                    departments={departments}
                    onClose={() => { setShowCreateModal(false); setEditingTask(null) }}
                    onSave={async (data) => {
                        if (editingTask) {
                            const res = await fetch(`/api/admin/tasks/${editingTask.id}`, {
                                method: 'PUT',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify(data),
                            })
                            if (res.ok) {
                                const updated = await res.json()
                                setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t))
                                setEditingTask(null)
                            }
                        } else {
                            await createTask(data)
                        }
                    }}
                />
            )}
        </div>
    )
}

// ─── Task Card Component ───
function TaskCard({ task, onDragStart, onEdit, onDelete }: {
    task: Task; onDragStart: () => void; onEdit: () => void; onDelete: () => void
}) {
    const p = PRIORITIES[task.priority]
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done'

    return (
        <div draggable onDragStart={onDragStart}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing group">
            {/* Priority + Source */}
            <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold ${p?.color}`}>{p?.icon} {p?.label}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.sourceType === 'email' && <Mail size={12} className="text-violet-400" />}
                    <button onClick={onEdit} className="p-0.5 text-slate-400 hover:text-blue-600"><Edit2 size={12} /></button>
                    <button onClick={onDelete} className="p-0.5 text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
                </div>
            </div>

            {/* Title */}
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">{task.title}</h4>
            {task.description && <p className="text-xs text-slate-500 line-clamp-2 mb-2">{task.description}</p>}

            {/* Tags */}
            {task.tags && (
                <div className="flex gap-1 flex-wrap mb-2">
                    {JSON.parse(task.tags).slice(0, 3).map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-full">{tag}</span>
                    ))}
                </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                    {task.department && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: task.department.color + '20', color: task.department.color }}>
                            {task.department.name}
                        </span>
                    )}
                    {task.assignee && (
                        <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                            <User size={10} /> {task.assignee.name.split(' ')[0]}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {task._count?.comments ? (
                        <span className="text-[10px] text-slate-400 flex items-center gap-0.5"><MessageSquare size={10} />{task._count.comments}</span>
                    ) : null}
                    {task.dueDate && (
                        <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                            <Calendar size={10} /> {new Date(task.dueDate).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

// ─── Task Detail/Edit Modal with Comments ───
function TaskModal({ task, departments, onClose, onSave }: {
    task?: Task | null
    departments: Department[]
    onClose: () => void
    onSave: (data: any) => Promise<void>
}) {
    const [form, setForm] = useState({
        title: task?.title || '',
        description: task?.description || '',
        priority: task?.priority || 'medium',
        status: task?.status || 'todo',
        departmentId: task?.departmentId || '',
        assigneeId: task?.assigneeId || '',
        dueDate: task?.dueDate ? task.dueDate.slice(0, 10) : '',
        estimatedMin: task?.estimatedMin || '',
        tags: task?.tags ? JSON.parse(task.tags).join(', ') : '',
    })
    const [saving, setSaving] = useState(false)
    const [comments, setComments] = useState<{ id: string; content: string; author: { name: string }; createdAt: string }[]>([])
    const [newComment, setNewComment] = useState('')
    const [loadingComments, setLoadingComments] = useState(false)
    const [submittingComment, setSubmittingComment] = useState(false)

    // Fetch comments when editing existing task
    useEffect(() => {
        if (!task?.id) return
        setLoadingComments(true)
        fetch(`/api/admin/tasks/${task.id}/comments`)
            .then(r => r.ok ? r.json() : [])
            .then(data => setComments(Array.isArray(data) ? data : []))
            .catch(() => { })
            .finally(() => setLoadingComments(false))
    }, [task?.id])

    const addComment = async () => {
        if (!newComment.trim() || !task?.id) return
        setSubmittingComment(true)
        try {
            const res = await fetch(`/api/admin/tasks/${task.id}/comments`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newComment, authorId: 'system' }),
            })
            if (res.ok) {
                const comment = await res.json()
                setComments(prev => [comment, ...prev])
                setNewComment('')
            }
        } catch { /* silent */ }
        setSubmittingComment(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.title.trim()) return
        setSaving(true)
        await onSave({
            ...form,
            estimatedMin: form.estimatedMin ? Number(form.estimatedMin) : null,
            tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : null,
            dueDate: form.dueDate || null,
            departmentId: form.departmentId || null,
            assigneeId: form.assigneeId || null,
        })
        setSaving(false)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{task ? 'Görev Detayı' : 'Yeni Görev'}</h3>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                        placeholder="Görev başlığı..." className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-cyan-500" autoFocus />

                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="Açıklama (isteğe bağlı)..." rows={3} className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />

                    {/* Quick status buttons */}
                    {task && (
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1.5 block">Hızlı Durum</label>
                            <div className="flex gap-1.5 flex-wrap">
                                {STATUSES.map(s => (
                                    <button key={s.key} type="button" onClick={() => setForm(f => ({ ...f, status: s.key }))}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${form.status === s.key ? `${s.color} text-white` : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                        <div className={`w-2 h-2 rounded-full ${form.status === s.key ? 'bg-white/50' : s.color}`} />
                                        {s.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Öncelik</label>
                            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                {Object.entries(PRIORITIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                            </select>
                        </div>
                        {!task && (
                            <div>
                                <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Durum</label>
                                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                    {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Departman</label>
                            <select value={form.departmentId} onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                                <option value="">Seçiniz</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Bitiş Tarihi</label>
                            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Tahmini Süre (dk)</label>
                            <input type="number" value={form.estimatedMin} onChange={e => setForm(f => ({ ...f, estimatedMin: e.target.value }))}
                                placeholder="30" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1 block">Etiketler</label>
                            <input type="text" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                                placeholder="tag1, tag2..." className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                        </div>
                    </div>

                    {/* Comments Section */}
                    {task && (
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
                            <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5 mb-3">
                                <MessageSquare size={12} /> Yorumlar {comments.length > 0 && `(${comments.length})`}
                            </h4>
                            <div className="flex gap-2 mb-3">
                                <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addComment() } }}
                                    placeholder="Yorum yazın..."
                                    className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                                <button type="button" onClick={addComment} disabled={submittingComment || !newComment.trim()}
                                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 transition-colors">
                                    Gönder
                                </button>
                            </div>
                            {loadingComments ? (
                                <p className="text-xs text-slate-400 text-center py-2">Yükleniyor...</p>
                            ) : comments.length > 0 ? (
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {comments.map(c => (
                                        <div key={c.id} className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{c.author?.name || 'Sistem'}</span>
                                                <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleString('tr-TR')}</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{c.content}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-2">Henüz yorum yok</p>
                            )}
                        </div>
                    )}

                    {/* Task metadata */}
                    {task && (
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">
                            <span>Oluşturulma: {new Date(task.createdAt).toLocaleString('tr-TR')}</span>
                            <span>Güncelleme: {new Date(task.updatedAt).toLocaleString('tr-TR')}</span>
                            {task.completedAt && <span className="text-emerald-500">Tamamlanma: {new Date(task.completedAt).toLocaleString('tr-TR')}</span>}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-medium">İptal</button>
                        <button type="submit" disabled={saving}
                            className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-lg shadow-cyan-600/20">
                            <Save size={16} /> {saving ? 'Kaydediliyor...' : task ? 'Güncelle' : 'Oluştur'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
