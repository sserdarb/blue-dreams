'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect, useCallback } from 'react'
import {
    Plus, Trash2, Edit2, Save, X, GitBranch, Clock, User, Building2,
    GripVertical, ChevronRight, Play, Sparkles, ArrowRight, Loader2,
    CheckCircle2, Circle, Zap, Brain, Wand2, MoreVertical, Copy,
    AlertTriangle, Settings2, ArrowDown
} from 'lucide-react'
import { getAdminTranslations, AdminTranslations, AdminLocale } from '@/lib/admin-translations'
import { useParams } from 'next/navigation'

// ─── Types ───
interface WorkflowStep {
    id?: string; title: string; description: string; assigneeId: string
    departmentId: string; order: number; duration: number | null
}
interface Workflow {
    id: string; name: string; description: string | null; isActive: boolean
    createdAt: string; steps: WorkflowStep[]
}

const AI_TEMPLATES = [
    {
        name: 'Misafir Şikayeti', icon: '😤', desc: 'Şikayet alma → analiz → çözüm → takip', steps: [
            { title: 'Şikayet Kaydı', description: 'Misafir şikayetini sisteme kaydet', duration: 5 },
            { title: 'Departman Yönlendirme', description: 'İlgili departmana otomatik ata', duration: 2 },
            { title: 'Çözüm Uygulama', description: 'Sorunu çöz ve misafiri bilgilendir', duration: 30 },
            { title: 'Memnuniyet Kontrolü', description: 'Misafir memnuniyetini doğrula', duration: 15 },
        ]
    },
    {
        name: 'Oda Hazırlık', icon: '🛏️', desc: 'Check-out → temizlik → kontrol → check-in', steps: [
            { title: 'Check-out Bildirimi', description: 'Ön bürodan check-out sinyali al', duration: 2 },
            { title: 'Housekeeping Temizlik', description: 'Oda temizliği ve düzeni', duration: 45 },
            { title: 'Minibar Kontrol', description: 'Minibar stok ve fiyat kontrolü', duration: 10 },
            { title: 'Kalite Kontrol', description: 'Supervisor son kontrol', duration: 10 },
            { title: 'Oda Hazır Bildir', description: 'Ön büroya "oda hazır" sinyali', duration: 1 },
        ]
    },
    {
        name: 'Sistem Geliştirme', icon: '💻', desc: 'Analiz → geliştirme → test → canlı', steps: [
            { title: 'Gereksinim Analizi', description: 'Yeni özellik için teknik ve iş gereksinimlerini topla', duration: 120 },
            { title: 'Geliştirme & Kodlama', description: 'Yazılım ekibi tarafından modülün kodlanması', duration: 480 },
            { title: 'Test ve QA', description: 'Birim testleri ve kalite güvence kontrolleri', duration: 120 },
            { title: 'Canlıya Alım', description: 'Güncellemenin production ortamına taşınması', duration: 60 },
            { title: 'Dokümantasyon', description: 'Sistem kullanma kılavuzunu güncelle', duration: 60 },
        ]
    },
    {
        name: 'Pazarlama Kampanyası', icon: '🚀', desc: 'Planlama → içerik → yayın → raporlama', steps: [
            { title: 'Pazar & Rakip Araştırması', description: 'Kampanya dönemi için rakip analizi yap', duration: 60 },
            { title: 'Kreatif Tasarım & İçerik', description: 'Görsel hazırlığı ve reklam metni (copywriting)', duration: 180 },
            { title: 'Bütçe & Hedef Kitle', description: 'Platformlarda (Meta, Google) hedeflemeleri ayarla', duration: 60 },
            { title: 'Yayına Alma', description: 'Reklamları başlat ve A/B testlerini yapılandır', duration: 30 },
            { title: 'Performans Optimizasyonu', description: 'Kampanya sonuçlarını analiz et ve raporla', duration: 60 },
        ]
    },
    {
        name: 'B2B Kurumsal Satış', icon: '🤝', desc: 'Lead → teklif → müzakere → sözleşme', steps: [
            { title: 'Potansiyel Müşteri Analizi', description: 'Kurumsal firmanın konaklama ve etkinlik ihtiyacını belirle', duration: 60 },
            { title: 'Özel Teklif Hazırlama', description: 'İhtiyaca uygun fiyatlandırma modeli ve teklif dokümanı', duration: 120 },
            { title: 'Sunum ve Müzakere', description: 'Müşteri ile toplantı ve şartların görüşülmesi', duration: 90 },
            { title: 'Sözleşme Onayı', description: 'Hukuki kontroller ve ıslak imza süreçleri', duration: 120 },
            { title: 'Otel Onboarding', description: 'Grubun/Firmanın operasyon ekibine devredilmesi', duration: 60 },
        ]
    },
    {
        name: 'Arıza Giderme', icon: '🔧', desc: 'Bildirim → teşhis → onarım → test', steps: [
            { title: 'Arıza Bildirimi', description: 'Arıza detayını ve lokasyonunu kaydet', duration: 5 },
            { title: 'Teşhis', description: 'Teknik ekip sorunu analiz etsin', duration: 15 },
            { title: 'Yedek Parça / Malzeme', description: 'Gerekli malzeme temin et', duration: 30 },
            { title: 'Onarım', description: 'Arızayı gider', duration: 60 },
            { title: 'Test & Onay', description: 'Çalışıyor mu kontrol et, misafiri bilgilendir', duration: 10 },
        ]
    },
]

export default function WorkflowsPage() {
    const params = useParams()
    const locale = (params?.locale as AdminLocale) || 'tr'
    const t = getAdminTranslations(locale) as AdminTranslations

    const [workflows, setWorkflows] = useState<Workflow[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedWf, setSelectedWf] = useState<Workflow | null>(null)
    const [editingSteps, setEditingSteps] = useState<WorkflowStep[]>([])
    const [editName, setEditName] = useState('')
    const [editDesc, setEditDesc] = useState('')
    const [isCreating, setIsCreating] = useState(false)
    const [saving, setSaving] = useState(false)
    const [aiGenerating, setAiGenerating] = useState(false)
    const [aiPrompt, setAiPrompt] = useState('')
    const [assignableUsers, setAssignableUsers] = useState<{ id: string; name: string; email: string; role: string }[]>([])

    const fetchWorkflows = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/workflows')
            if (res.ok) setWorkflows(await res.json())
        } catch (e) { console.error(e) }
        setLoading(false)
    }, [])

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/users/assignable')
            if (res.ok) setAssignableUsers(await res.json())
        } catch { /* silent */ }
    }, [])

    useEffect(() => { fetchWorkflows(); fetchUsers() }, [fetchWorkflows, fetchUsers])

    // Select workflow
    const selectWorkflow = (w: Workflow) => {
        setSelectedWf(w)
        setEditName(w.name)
        setEditDesc(w.description || '')
        setEditingSteps(w.steps.map(s => ({ ...s })))
        setIsCreating(false)
    }

    // Start new workflow
    const startNew = () => {
        setSelectedWf(null)
        setEditName('')
        setEditDesc('')
        setEditingSteps([])
        setIsCreating(true)
    }

    // Apply AI template
    const applyTemplate = (t: typeof AI_TEMPLATES[0]) => {
        setEditName(t.name)
        setEditDesc(t.desc)
        setEditingSteps(t.steps.map((s, i) => ({
            title: s.title, description: s.description, assigneeId: '', departmentId: '',
            order: i, duration: s.duration,
        })))
        setIsCreating(true)
        setSelectedWf(null)
    }

    // AI Generate steps from prompt
    const aiGenerateSteps = async () => {
        if (!aiPrompt.trim()) return
        setAiGenerating(true)
        try {
            const res = await fetch('/api/admin/mail-integration/convert', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: aiPrompt,
                    body: `Otel yönetimi bağlamında "${aiPrompt}" sürecini iş akışı adımlarına böl. Her adım için title, description ve tahmini dakika (duration) belirle. JSON formatında "steps" dizisini döndür: [{"title":"...", "description":"...", "duration":30}]`,
                    from: 'ai-workflow-generator',
                }),
            })
            if (res.ok) {
                const data = await res.json()
                // Try to parse AI response as workflow steps
                if (data.title) {
                    setEditName(data.title)
                    setEditDesc(data.description || aiPrompt)
                    if (data.tags?.length) {
                        // Generate simple steps from tags
                        setEditingSteps(data.tags.map((tag: string, i: number) => ({
                            title: tag, description: '', assigneeId: '', departmentId: '',
                            order: i, duration: data.estimatedMin ? Math.round(data.estimatedMin / data.tags.length) : 15,
                        })))
                    }
                }
            }
        } catch { /* silent */ }
        setAiGenerating(false)
        setAiPrompt('')
    }

    // Add step
    const addStep = () => {
        setEditingSteps(prev => [...prev, {
            title: '', description: '', assigneeId: '', departmentId: '',
            order: prev.length, duration: null,
        }])
    }

    // Update step
    const updateStep = (i: number, data: Partial<WorkflowStep>) => {
        setEditingSteps(prev => prev.map((s, idx) => idx === i ? { ...s, ...data } : s))
    }

    // Remove step
    const removeStep = (i: number) => setEditingSteps(prev => prev.filter((_, idx) => idx !== i))

    // Move step
    const moveStep = (from: number, to: number) => {
        if (to < 0 || to >= editingSteps.length) return
        const newSteps = [...editingSteps]
        const [moved] = newSteps.splice(from, 1)
        newSteps.splice(to, 0, moved)
        setEditingSteps(newSteps.map((s, i) => ({ ...s, order: i })))
    }

    // Save
    const saveWorkflow = async () => {
        if (!editName.trim() || editingSteps.length === 0) return
        setSaving(true)
        const method = selectedWf ? 'PUT' : 'POST'
        const body = selectedWf
            ? { id: selectedWf.id, name: editName, description: editDesc, steps: editingSteps }
            : { name: editName, description: editDesc, steps: editingSteps }
        const res = await fetch('/api/admin/workflows', {
            method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        })
        if (res.ok) {
            await fetchWorkflows()
            const saved = await res.json()
            selectWorkflow(saved)
        }
        setSaving(false)
        setIsCreating(false)
    }

    // Delete
    const deleteWorkflow = async (id: string) => {
        if (!confirm('Bu iş akışını silmek istediğinize emin misiniz?')) return
        await fetch('/api/admin/workflows', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }),
        })
        setWorkflows(prev => prev.filter(w => w.id !== id))
        if (selectedWf?.id === id) { setSelectedWf(null); setIsCreating(false) }
    }

    // Duplicate
    const duplicateWorkflow = (w: Workflow) => {
        setEditName(w.name + ' (Kopya)')
        setEditDesc(w.description || '')
        setEditingSteps(w.steps.map((s, i) => ({ ...s, id: undefined, order: i })))
        setSelectedWf(null)
        setIsCreating(true)
    }

    const totalDuration = editingSteps.reduce((sum, s) => sum + (s.duration || 0), 0)

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between flex-shrink-0 gap-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <GitBranch className="text-cyan-500" size={22} /> {(t as any).workflows || 'İş Akışları'}
                    </h1>
                    <p className="text-sm text-slate-500 mt-0.5">AI destekli iş akışı şablonları oluşturun ve yönetin</p>
                </div>
                <button onClick={startNew}
                    className="flex items-center justify-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-cyan-600/20 w-full sm:w-auto">
                    <Plus size={16} /> Yeni Akış
                </button>
            </div>

            {/* Layout */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-y-auto lg:overflow-hidden">

                {/* ═══ COLUMN 1: Workflow List + AI Templates ═══ */}
                <div className="col-span-1 lg:col-span-3 flex flex-col gap-3 lg:overflow-y-auto pr-1">
                    {/* AI Templates */}
                    <div className="bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-900/20 dark:to-cyan-900/20 rounded-2xl border border-violet-200 dark:border-violet-800/50 p-4">
                        <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1.5 mb-3">
                            <Sparkles size={14} /> AI Hazır Şablonlar
                        </h3>
                        <div className="space-y-2">
                            {AI_TEMPLATES.map((t, i) => (
                                <button key={i} onClick={() => applyTemplate(t)}
                                    className="w-full text-left p-2.5 bg-white/70 dark:bg-slate-800/70 rounded-xl border border-violet-100 dark:border-violet-800/30 hover:border-violet-400 dark:hover:border-violet-500 transition-all group">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">{t.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{t.steps.length} adım</p>
                                        </div>
                                        <ArrowRight size={12} className="text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* AI Generate from Prompt */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                            <Brain size={14} className="text-cyan-500" /> AI ile Oluştur
                        </h3>
                        <div className="flex gap-2">
                            <input type="text" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && aiGenerateSteps()}
                                placeholder="Süreç tanımla…" className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-cyan-500" />
                            <button onClick={aiGenerateSteps} disabled={aiGenerating || !aiPrompt.trim()}
                                className="px-3 py-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex-shrink-0">
                                {aiGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                            </button>
                        </div>
                    </div>

                    {/* Saved Workflows */}
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-slate-500 uppercase px-1 mb-2">Kaydedilmiş ({workflows.length})</h3>
                        {loading ? (
                            <div className="space-y-2 animate-pulse">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />)}
                            </div>
                        ) : workflows.length === 0 ? (
                            <div className="text-center py-6 text-slate-400 text-xs">
                                Henüz akış yok
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {workflows.map(w => (
                                    <button key={w.id} onClick={() => selectWorkflow(w)}
                                        className={`w-full text-left p-3 rounded-xl border transition-all group ${selectedWf?.id === w.id
                                            ? 'bg-cyan-50 dark:bg-cyan-900/20 border-cyan-400 dark:border-cyan-600'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-cyan-300'
                                            }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                                                    <GitBranch size={12} className="text-cyan-500 flex-shrink-0" /> {w.name}
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-0.5">{w.steps.length} adım • {w.steps.reduce((s, st) => s + (st.duration || 0), 0)} dk</p>
                                            </div>
                                            <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={e => { e.stopPropagation(); duplicateWorkflow(w) }}
                                                    className="p-1 text-slate-400 hover:text-blue-500"><Copy size={12} /></button>
                                                <button onClick={e => { e.stopPropagation(); deleteWorkflow(w.id) }}
                                                    className="p-1 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ COLUMN 2: Workflow Steps / Stages ═══ */}
                <div className="col-span-1 lg:col-span-5 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px] lg:min-h-0">
                    {(selectedWf || isCreating) ? (
                        <>
                            {/* Name/Desc Header */}
                            <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <input type="text" value={editName} onChange={e => setEditName(e.target.value)}
                                    placeholder="Akış adı..." className="w-full text-lg font-bold bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400" />
                                <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)}
                                    placeholder="Kısa açıklama..." className="w-full text-sm bg-transparent text-slate-500 outline-none mt-1 placeholder:text-slate-400" />
                                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                                    <span className="flex items-center gap-1"><GitBranch size={10} /> {editingSteps.length} adım</span>
                                    <span className="flex items-center gap-1"><Clock size={10} /> {totalDuration} dk toplam</span>
                                </div>
                            </div>

                            {/* Steps Timeline */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="relative">
                                    {/* Vertical line */}
                                    {editingSteps.length > 1 && (
                                        <div className="absolute left-5 top-6 bottom-6 w-0.5 bg-gradient-to-b from-cyan-500 via-violet-500 to-emerald-500 rounded-full" />
                                    )}

                                    <div className="space-y-3">
                                        {editingSteps.map((step, i) => (
                                            <div key={i} className="relative flex gap-3 group">
                                                {/* Step Number Circle */}
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold z-10 shadow-lg shadow-cyan-500/20">
                                                    {i + 1}
                                                </div>

                                                {/* Step Card */}
                                                <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-700 hover:border-cyan-300 dark:hover:border-cyan-700 transition-colors">
                                                    <div className="flex items-start gap-2">
                                                        <div className="flex-1">
                                                            <input type="text" value={step.title} onChange={e => updateStep(i, { title: e.target.value })}
                                                                placeholder="Adım başlığı..." className="w-full text-sm font-bold bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400" />
                                                            <input type="text" value={step.description} onChange={e => updateStep(i, { description: e.target.value })}
                                                                placeholder="Açıklama..." className="w-full text-xs bg-transparent text-slate-500 outline-none mt-1 placeholder:text-slate-400" />
                                                            {/* User Assignment */}
                                                            <div className="mt-1.5 flex items-center gap-1.5">
                                                                <User size={10} className="text-slate-400 flex-shrink-0" />
                                                                <select value={step.assigneeId || ''} onChange={e => updateStep(i, { assigneeId: e.target.value })}
                                                                    className="text-[10px] bg-transparent text-slate-500 dark:text-slate-400 outline-none border-none cursor-pointer">
                                                                    <option value="">Atanmamış</option>
                                                                    {assignableUsers.map(u => (
                                                                        <option key={u.id} value={u.id}>{u.name}</option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 flex-shrink-0">
                                                            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700">
                                                                <Clock size={10} className="text-slate-400" />
                                                                <input type="number" value={step.duration || ''} onChange={e => updateStep(i, { duration: Number(e.target.value) || null })}
                                                                    placeholder="dk" className="w-8 text-[10px] bg-transparent text-slate-600 dark:text-slate-400 outline-none text-center" />
                                                            </div>
                                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                                                                {i > 0 && <button onClick={() => moveStep(i, i - 1)} className="p-0.5 text-slate-400 hover:text-cyan-600 rotate-180"><ArrowDown size={12} /></button>}
                                                                {i < editingSteps.length - 1 && <button onClick={() => moveStep(i, i + 1)} className="p-0.5 text-slate-400 hover:text-cyan-600"><ArrowDown size={12} /></button>}
                                                                <button onClick={() => removeStep(i)} className="p-0.5 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Step Button */}
                                    <button onClick={addStep}
                                        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-cyan-600 hover:border-cyan-400 transition-colors">
                                        <Plus size={14} /> Adım Ekle
                                    </button>
                                </div>
                            </div>

                            {/* Save Bar */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0 bg-slate-50 dark:bg-slate-900/30">
                                <button onClick={() => { setSelectedWf(null); setIsCreating(false) }}
                                    className="px-4 py-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm font-medium">{t.cancel}</button>
                                <button onClick={saveWorkflow} disabled={saving || !editName.trim() || editingSteps.length === 0}
                                    className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 sm:px-6 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 shadow-lg shadow-cyan-600/20 w-auto">
                                    <Save size={16} /> {saving ? t.saving : (selectedWf ? t.edit : t.add)}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center px-8">
                                <GitBranch className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
                                <p className="text-slate-500 font-medium">İş akışı seçin veya yeni oluşturun</p>
                                <p className="text-slate-400 text-xs mt-1">Sol taraftan mevcut bir akışı seçin veya AI şablonlarını kullanın</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ COLUMN 3: AI Assistant + Preview ═══ */}
                <div className="col-span-1 lg:col-span-4 flex flex-col gap-3 lg:overflow-y-auto pb-4 lg:pb-0">
                    {/* Flow Preview */}
                    {(selectedWf || isCreating) && editingSteps.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
                            <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-3">
                                <Play size={12} className="text-emerald-500" /> Akış Önizleme
                            </h3>
                            <div className="space-y-1">
                                {editingSteps.map((step, i) => {
                                    const pct = totalDuration > 0 ? ((step.duration || 0) / totalDuration * 100) : (100 / editingSteps.length)
                                    const colors = ['bg-cyan-500', 'bg-blue-500', 'bg-violet-500', 'bg-fuchsia-500', 'bg-orange-500', 'bg-emerald-500', 'bg-rose-500']
                                    return (
                                        <div key={i} className="flex items-center gap-2 group">
                                            <div className="w-16 text-right">
                                                <span className="text-[10px] text-slate-400 font-mono">{step.duration || 0}dk</span>
                                            </div>
                                            <div className="flex-1 relative">
                                                <div className={`h-7 ${colors[i % colors.length]} rounded-md flex items-center px-2 transition-all`}
                                                    style={{ width: `${Math.max(pct, 15)}%` }}>
                                                    <span className="text-[10px] text-white font-bold truncate">{step.title || `Adım ${i + 1}`}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-[10px] text-slate-400">Toplam Süre</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{totalDuration > 60 ? `${Math.floor(totalDuration / 60)}sa ${totalDuration % 60}dk` : `${totalDuration} dk`}</span>
                            </div>
                        </div>
                    )}

                    {/* AI Suggestions Panel */}
                    <div className="bg-gradient-to-br from-violet-50 to-cyan-50 dark:from-violet-900/15 dark:to-cyan-900/15 rounded-2xl border border-violet-200 dark:border-violet-800/50 p-4 flex-1">
                        <h3 className="text-xs font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1.5 mb-3">
                            <Brain size={14} /> AI Asistan
                        </h3>

                        {(selectedWf || isCreating) ? (
                            <div className="space-y-3">
                                {/* Contextual Tips */}
                                {editingSteps.length === 0 && (
                                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-violet-100 dark:border-violet-800/30">
                                        <p className="text-xs text-violet-700 dark:text-violet-300 flex items-center gap-1.5">
                                            <Sparkles size={12} /> Henüz adım eklenmemiş
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">Sol taraftaki AI şablonlarını kullanabilir veya "Adım Ekle" butonuna basabilirsiniz.</p>
                                    </div>
                                )}

                                {editingSteps.length > 0 && editingSteps.some(s => !s.title) && (
                                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/30">
                                        <p className="text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                                            <AlertTriangle size={12} /> Başlıksız adımlar var
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">Her adıma açıklayıcı bir başlık verin.</p>
                                    </div>
                                )}

                                {editingSteps.length > 0 && !editingSteps.some(s => !s.title) && (
                                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3 border border-emerald-200 dark:border-emerald-800/30">
                                        <p className="text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                                            <CheckCircle2 size={12} /> Akış hazır görünüyor
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">{editingSteps.length} adım, toplam {totalDuration} dakika. Kaydetmeye hazır.</p>
                                    </div>
                                )}

                                {/* Quick AI Actions */}
                                <div className="space-y-1.5">
                                    <p className="text-[10px] text-slate-500 uppercase font-bold">Hızlı İşlemler</p>
                                    <button onClick={() => { if (editingSteps.length > 0) { setEditingSteps(prev => [...prev, { title: 'Kalite Kontrol', description: 'Son kontrol ve onay', assigneeId: '', departmentId: '', order: prev.length, duration: 10 }]) } }}
                                        className="w-full text-left p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-violet-100 dark:border-violet-800/30 hover:border-violet-400 transition-colors text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Zap size={12} className="text-violet-500" /> Kalite kontrol adımı ekle
                                    </button>
                                    <button onClick={() => { if (editingSteps.length > 0) { setEditingSteps(prev => [...prev, { title: 'Bildirim Gönder', description: 'İlgili kişilere sonuç bildir', assigneeId: '', departmentId: '', order: prev.length, duration: 5 }]) } }}
                                        className="w-full text-left p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-violet-100 dark:border-violet-800/30 hover:border-violet-400 transition-colors text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Zap size={12} className="text-violet-500" /> Bildirim adımı ekle
                                    </button>
                                    <button onClick={() => { if (editingSteps.length > 0) { setEditingSteps(prev => [...prev, { title: 'Değerlendirme & Rapor', description: 'Süreç sonrası feedback ve rapor', assigneeId: '', departmentId: '', order: prev.length, duration: 15 }]) } }}
                                        className="w-full text-left p-2 bg-white/60 dark:bg-slate-800/60 rounded-lg border border-violet-100 dark:border-violet-800/30 hover:border-violet-400 transition-colors text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Zap size={12} className="text-violet-500" /> Değerlendirme adımı ekle
                                    </button>
                                </div>

                                {/* Stats */}
                                {editingSteps.length > 0 && (
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{editingSteps.length}</p>
                                            <p className="text-[10px] text-slate-500">Adım</p>
                                        </div>
                                        <div className="bg-white/60 dark:bg-slate-800/60 rounded-lg p-2.5 text-center">
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{totalDuration > 60 ? `${Math.floor(totalDuration / 60)}sa` : `${totalDuration}dk`}</p>
                                            <p className="text-[10px] text-slate-500">Toplam Süre</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-violet-100 dark:border-violet-800/30">
                                    <p className="text-xs text-violet-700 dark:text-violet-300">💡 İpucu</p>
                                    <p className="text-[10px] text-slate-500 mt-1">Sol taraftaki AI şablonlarını kullanarak hızlıca başlayabilirsiniz. Veya "AI ile Oluştur" kutusuna sürecinizi yazın.</p>
                                </div>
                                <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 border border-violet-100 dark:border-violet-800/30">
                                    <p className="text-xs text-violet-700 dark:text-violet-300">🔄 Otomatik Akışlar</p>
                                    <p className="text-[10px] text-slate-500 mt-1">İş akışları tetiklendiğinde otomatik görev oluşturur ve ilgili kişilere atar.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
