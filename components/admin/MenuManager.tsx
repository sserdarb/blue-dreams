'use client'

import { useState } from 'react'
import { createMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems } from '@/app/actions/settings'
import { Plus, Trash2, GripVertical, ExternalLink, Save, Edit2, X, Check } from 'lucide-react'

interface MenuItem {
    id: string
    label: string
    url: string
    target: string
    order: number
    isActive: boolean
}

interface MenuManagerProps {
    locale: string
    initialItems: MenuItem[]
}

export function MenuManager({ locale, initialItems }: MenuManagerProps) {
    const [items, setItems] = useState<MenuItem[]>(initialItems)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState({ label: '', url: '', target: '_self' })
    const [newItem, setNewItem] = useState({ label: '', url: '', target: '_self' })
    const [showNewForm, setShowNewForm] = useState(false)

    const handleAdd = async () => {
        if (!newItem.label || !newItem.url) return

        const item = await createMenuItem({
            locale,
            label: newItem.label,
            url: newItem.url,
            target: newItem.target,
            order: items.length
        })

        setItems([...items, item])
        setNewItem({ label: '', url: '', target: '_self' })
        setShowNewForm(false)
    }

    const handleEdit = (item: MenuItem) => {
        setEditingId(item.id)
        setEditForm({ label: item.label, url: item.url, target: item.target })
    }

    const handleSaveEdit = async () => {
        if (!editingId) return

        await updateMenuItem(editingId, editForm)
        setItems(items.map(item =>
            item.id === editingId
                ? { ...item, ...editForm }
                : item
        ))
        setEditingId(null)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this menu item?')) return

        await deleteMenuItem(id)
        setItems(items.filter(item => item.id !== id))
    }

    const handleToggleActive = async (item: MenuItem) => {
        await updateMenuItem(item.id, { isActive: !item.isActive })
        setItems(items.map(i =>
            i.id === item.id
                ? { ...i, isActive: !i.isActive }
                : i
        ))
    }

    const moveItem = async (index: number, direction: 'up' | 'down') => {
        const newItems = [...items]
        const targetIndex = direction === 'up' ? index - 1 : index + 1

        if (targetIndex < 0 || targetIndex >= items.length) return

        [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]

        // Update order values
        const updatedItems = newItems.map((item, i) => ({ ...item, order: i }))
        setItems(updatedItems)

        // Save to database
        await reorderMenuItems(updatedItems.map(item => ({ id: item.id, order: item.order })))
    }

    return (
        <div className="space-y-4">
            {/* Menu Items List */}
            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {items.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p className="mb-2">No menu items yet</p>
                        <p className="text-sm">Click "Add Menu Item" to create your first menu link</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {items.sort((a, b) => a.order - b.order).map((item, index) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 p-4 ${!item.isActive ? 'bg-gray-50 opacity-60' : ''}`}
                            >
                                {/* Drag Handle & Reorder */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveItem(index, 'up')}
                                        disabled={index === 0}
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-0.5"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => moveItem(index, 'down')}
                                        disabled={index === items.length - 1}
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30 p-0.5"
                                    >
                                        ▼
                                    </button>
                                </div>

                                {/* Content */}
                                {editingId === item.id ? (
                                    <div className="flex-1 flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editForm.label}
                                            onChange={e => setEditForm({ ...editForm, label: e.target.value })}
                                            placeholder="Label"
                                            className="border rounded px-2 py-1 text-sm flex-1"
                                        />
                                        <input
                                            type="text"
                                            value={editForm.url}
                                            onChange={e => setEditForm({ ...editForm, url: e.target.value })}
                                            placeholder="/url"
                                            className="border rounded px-2 py-1 text-sm flex-1"
                                        />
                                        <select
                                            value={editForm.target}
                                            onChange={e => setEditForm({ ...editForm, target: e.target.value })}
                                            className="border rounded px-2 py-1 text-sm"
                                        >
                                            <option value="_self">Same Tab</option>
                                            <option value="_blank">New Tab</option>
                                        </select>
                                        <button
                                            onClick={handleSaveEdit}
                                            className="text-green-600 hover:text-green-700 p-1"
                                        >
                                            <Check size={16} />
                                        </button>
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="text-gray-500 hover:text-gray-700 p-1"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex-1">
                                            <span className="font-medium text-gray-800">{item.label}</span>
                                            <span className="text-gray-400 text-sm ml-2">{item.url}</span>
                                            {item.target === '_blank' && (
                                                <ExternalLink size={12} className="inline ml-1 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggleActive(item)}
                                                className={`px-2 py-1 rounded text-xs font-medium ${item.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-500'
                                                    }`}
                                            >
                                                {item.isActive ? 'Active' : 'Hidden'}
                                            </button>
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-gray-500 hover:text-blue-600 p-2"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-500 hover:text-red-600 p-2"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add New Item Form */}
            {showNewForm ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h3 className="font-medium text-gray-800 mb-3">New Menu Item</h3>
                    <div className="flex gap-2 items-end">
                        <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">Label</label>
                            <input
                                type="text"
                                value={newItem.label}
                                onChange={e => setNewItem({ ...newItem, label: e.target.value })}
                                placeholder="Home"
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="block text-xs text-gray-600 mb-1">URL</label>
                            <input
                                type="text"
                                value={newItem.url}
                                onChange={e => setNewItem({ ...newItem, url: e.target.value })}
                                placeholder="/"
                                className="w-full border rounded-lg px-3 py-2 text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Target</label>
                            <select
                                value={newItem.target}
                                onChange={e => setNewItem({ ...newItem, target: e.target.value })}
                                className="border rounded-lg px-3 py-2 text-sm"
                            >
                                <option value="_self">Same Tab</option>
                                <option value="_blank">New Tab</option>
                            </select>
                        </div>
                        <button
                            onClick={handleAdd}
                            disabled={!newItem.label || !newItem.url}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                            Add
                        </button>
                        <button
                            onClick={() => setShowNewForm(false)}
                            className="text-gray-500 hover:text-gray-700 px-3 py-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowNewForm(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl p-4 text-gray-500 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center gap-2 transition"
                >
                    <Plus size={18} /> Add Menu Item
                </button>
            )}
        </div>
    )
}
