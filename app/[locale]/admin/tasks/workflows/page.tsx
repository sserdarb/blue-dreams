'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
    Plus, Trash2, Edit2, Save, X, GitBranch, Clock, User, Building2,
    GripVertical, ChevronDown, ChevronUp, Play, Sparkles
} from 'lucide-react'

interface WorkflowStep {
    id?: string; title: string; description: string; assigneeId: string
    departmentId: string; order: number; duration: number | null
}

interface Workflow {
    id: string; name: string; description: string | null; isActive: boolean
    createdAt: string; steps: WorkflowStep[]
}

export default function WorkflowsPage() {
    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [editing, setEditing] = useState<Workflow | null>(null)

    const fetchWorkflows = async () => {
        try {
            const res = await fetch('/api/admin/workflows')
            if (res.ok) setWorkflows(await res.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }

    useEffect(() => { fetchWorkflows() }, [])

    const deleteWorkflow = async (id: string) => {
        if (!confirm('Bu iş akışını silmek istediğinize emin misiniz?')) return
        await fetch('/api/admin/workflows', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
        setWorkflows(prev => prev.filter(w => w.id !== id))
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <GitBranch className="text-cyan-500" size={22} /> İş Akışları
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Tekrarlayan görev süreçlerini şablon olarak tanımlayın</p>
                </div>
                <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-cyan-600/20">
                    <Plus size={16} /> Yeni Akış
                </button>
            </div>

            {/* Create / Edit Form */}
            {(showCreate || editing) && (
                <WorkflowForm
                    workflow={editing}
                    onClose={() => { setShowCreate(false); setEditing(null) }}
                    onSaved={() => { setShowCreate(false); setEditing(null); fetchWorkflows() }}
                />
            )}

            {/* Workflow Cards */}
            {loading ? (
                <div className="space-y-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
                </div>
            ) : workflows.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <GitBranch className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
                    <p className="text-slate-500 font-medium">Henüz iş akışı oluşturulmamış</p>
                    <p className="text-slate-400 text-sm mt-1">Yukarıdaki &quot;Yeni Akış&quot; butonunu kullanın</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {workflows.map(w => (
                        <div key={w.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <GitBranch size={18} className="text-cyan-500" /> {w.name}
                                        {!w.isActive && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Pasif</span>}
                                    </h3>
                                    {w.description && <p className="text-sm text-slate-500 mt-0.5">{w.description}</p>}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditing(w)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => deleteWorkflow(w.id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            {/* Steps timeline */}
                            <div className="relative pl-6">
                                <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-cyan-500 to-violet-500 rounded-full" />
                                {w.steps.map((step, i) => (
                                    <div key={step.id || i} className="relative mb-3 last:mb-0">
                                        <div className="absolute -left-[14px] top-1.5 w-3 h-3 rounded-full bg-white dark:bg-slate-800 border-2 border-cyan-500" />
                                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 ml-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{i + 1}. {step.title}</span>
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    {step.duration && <span className="flex items-center gap-0.5"><Clock size={10} /> {step.duration} dk</span>}
                                                </div>
                                            </div>
                                            {step.description && <p className="text-xs text-slate-500 mt-1">{step.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Workflow Form ───
function WorkflowForm({ workflow, onClose, onSaved }: { workflow?: Workflow | null; onClose: () => void; onSaved: () => void }) {
    const [name, setName] = useState(workflow?.name || '')
    const [description, setDescription] = useState(workflow?.description || '')
    const [steps, setSteps] = useState<WorkflowStep[]>(workflow?.steps || [])
    const [saving, setSaving] = useState(false)

    const addStep = () => {
        setSteps(prev => [...prev, { title: '', description: '', assigneeId: '', departmentId: '', order: prev.length, duration: null }])
    }

    const removeStep = (i: number) => setSteps(prev => prev.filter((_, idx) => idx !== i))
    const updateStep = (i: number, data: Partial<WorkflowStep>) => setSteps(prev => prev.map((s, idx) => idx === i ? { ...s, ...data } : s))

    const save = async () => {
        if (!name.trim() || steps.length === 0) return
        setSaving(true)
        const method = workflow ? 'PUT' : 'POST'
        const body = workflow ? { id: workflow.id, name, description, steps } : { name, description, steps }
        await fetch('/api/admin/workflows', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
        setSaving(false)
        onSaved()
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-cyan-200 dark:border-cyan-800 p-5 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{workflow ? 'Akışı Düzenle' : 'Yeni İş Akışı'}</h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Akış adı..."
                    className="col-span-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500" />
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Açıklama (isteğe bağlı)..."
                    className="col-span-2 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-cyan-500 resize-none" />
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Adımlar</h4>
                    <button onClick={addStep} className="flex items-center gap-1 text-xs text-cyan-600 font-bold hover:underline"><Plus size={12} /> Adım Ekle</button>
                </div>
                <div className="space-y-2">
                    {steps.map((step, i) => (
                        <div key={i} className="flex gap-3 items-start bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                            <span className="text-xs font-bold text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30 w-6 h-6 rounded-full flex items-center justify-center mt-1 flex-shrink-0">{i + 1}</span>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                                <input type="text" value={step.title} onChange={e => updateStep(i, { title: e.target.value })} placeholder="Adım başlığı"
                                    className="col-span-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                                <input type="text" value={step.description} onChange={e => updateStep(i, { description: e.target.value })} placeholder="Açıklama"
                                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                                <input type="number" value={step.duration || ''} onChange={e => updateStep(i, { duration: Number(e.target.value) || null })} placeholder="Süre (dk)"
                                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm" />
                            </div>
                            <button onClick={() => removeStep(i)} className="p-1 text-red-400 hover:text-red-600 mt-1"><Trash2 size={14} /></button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 justify-end">
                <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm font-medium">İptal</button>
                <button onClick={save} disabled={saving}
                    className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
            </div>
        </div>
    )
}
