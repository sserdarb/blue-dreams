'use client'
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Save, GripVertical } from 'lucide-react'
import { useParams } from 'next/navigation'

interface MenuItem {
    id: string
    locale: string
    label: string
    url: string
    target: string
    order: number
    isActive: boolean
    parentId: string | null
    children?: MenuItem[]
}

export default function MenuAdminPage() {
    const params = useParams()
    const locale = params.locale as string

    const [menuItems, setMenuItems] = useState<MenuItem[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null)

    const [formData, setFormData] = useState({
        label: '',
        url: '',
        target: '_self',
        order: 0,
        isActive: true,
        parentId: ''
    })

    const fetchMenuItems = async () => {
        try {
            setLoading(true)
            const res = await fetch(`/api/admin/menu-items?locale=${locale}`)
            if (res.ok) {
                const data = await res.json()
                setMenuItems(data)
            }
        } catch (error) {
            console.error('Failed to fetch menu items:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMenuItems()
    }, [locale])

    const handleEdit = (item: MenuItem) => {
        setEditingItem(item)
        setFormData({
            label: item.label,
            url: item.url,
            target: item.target,
            order: item.order,
            isActive: item.isActive,
            parentId: item.parentId || ''
        })
        setIsModalOpen(true)
    }

    const handleCreate = () => {
        setEditingItem(null)
        setFormData({
            label: '', url: '', target: '_self', order: 0, isActive: true, parentId: ''
        })
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const body = { ...formData, parentId: formData.parentId || null, locale }
            if (editingItem) {
                await fetch(`/api/admin/menu-items/${editingItem.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            } else {
                await fetch('/api/admin/menu-items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                })
            }
            setIsModalOpen(false)
            fetchMenuItems()
        } catch (error) {
            console.error('Error saving:', error)
            alert('Kaydedilirken hata oluştu.')
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return
        try {
            await fetch(`/api/admin/menu-items/${id}`, { method: 'DELETE' })
            fetchMenuItems()
        } catch (error) {
            console.error('Error deleting:', error)
        }
    }

    // Flatten items for the parent dropdown
    const flattenItems = (items: MenuItem[], level: number = 0): { item: MenuItem, level: number }[] => {
        let result: { item: MenuItem, level: number }[] = []
        items.forEach(item => {
            result.push({ item, level })
            if (item.children && item.children.length > 0) {
                result = result.concat(flattenItems(item.children, level + 1))
            }
        })
        return result
    }

    const flatParents = flattenItems(menuItems).filter(i => i.level === 0) // Only allow 1 level of nesting for now to keep it simple

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white dark:bg-[#1e293b] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Menü Yönetimi</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Web sitesi üst menüsünü (Navbar) ve alt menüleri yönetin.</p>
                </div>
                <button onClick={handleCreate} className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors">
                    <Plus size={18} /> Yeni Menü Ekle
                </button>
            </div>

            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
                <div className="p-0">
                    <div className="bg-slate-50 dark:bg-[#0f172a] grid grid-cols-12 gap-4 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-white/10">
                        <div className="col-span-4">Menü Adı</div>
                        <div className="col-span-4">URL</div>
                        <div className="col-span-2 text-center">Durum</div>
                        <div className="col-span-2 text-right">İşlemler</div>
                    </div>
                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Yükleniyor...</div>
                    ) : menuItems.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">Menü bulunamadı.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-white/5">
                            {menuItems.map(item => (
                                <React.Fragment key={item.id}>
                                    {/* Parent Item */}
                                    <div className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                                        <div className="col-span-4 flex items-center gap-3">
                                            <GripVertical size={16} className="text-slate-400 cursor-move" />
                                            <span className="font-semibold text-slate-900 dark:text-white">{item.label}</span>
                                        </div>
                                        <div className="col-span-4 text-sm text-slate-500 truncate">{item.url}</div>
                                        <div className="col-span-2 text-center">
                                            <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-md ${item.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                                {item.isActive ? 'Aktif' : 'Pasif'}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-end gap-2">
                                            <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-cyan-600 transition-colors"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    {/* Children */}
                                    {item.children && item.children.map(child => (
                                        <div key={child.id} className="grid grid-cols-12 gap-4 p-3 pl-12 items-center bg-slate-50/50 dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-t border-slate-100 dark:border-white/5">
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="w-4 h-px bg-slate-300 dark:bg-slate-600"></div>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{child.label}</span>
                                            </div>
                                            <div className="col-span-4 text-xs text-slate-500 truncate">{child.url}</div>
                                            <div className="col-span-2 text-center">
                                                <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase rounded-md ${child.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                                    {child.isActive ? 'Aktif' : 'Pasif'}
                                                </span>
                                            </div>
                                            <div className="col-span-2 flex justify-end gap-2">
                                                <button onClick={() => handleEdit(child)} className="p-1.5 text-slate-400 hover:text-cyan-600 transition-colors"><Edit2 size={14} /></button>
                                                <button onClick={() => handleDelete(child.id)} className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl w-full max-w-xl shadow-xl">
                        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingItem ? 'Menü Düzenle' : 'Yeni Menü Ekle'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Menü Adı</label>
                                <input required type="text" value={formData.label} onChange={e => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">URL</label>
                                <input required type="text" value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500 text-left" dir="ltr"
                                    placeholder="/odalar veya https://example.com"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Üst Menü</label>
                                    <select value={formData.parentId} onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
                                    >
                                        <option value="">Yok (Ana Menü)</option>
                                        {flatParents.filter(p => p.item.id !== editingItem?.id).map(p => (
                                            <option key={p.item.id} value={p.item.id}>{p.item.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Sıra</label>
                                    <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) })}
                                        className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5">
                                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                            className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500" />
                                        <span className="text-sm font-medium">Sitede Göster</span>
                                    </label>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="flex items-center gap-2 cursor-pointer p-3 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5">
                                        <input type="checkbox" checked={formData.target === '_blank'} onChange={e => setFormData({ ...formData, target: e.target.checked ? '_blank' : '_self' })}
                                            className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500" />
                                        <span className="text-sm font-medium">Yeni Sekmede Aç</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 dark:border-white/10">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition-colors">
                                    İptal
                                </button>
                                <button type="submit" className="px-5 py-2 rounded-xl font-medium bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2 transition-colors">
                                    <Save size={16} /> {editingItem ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
