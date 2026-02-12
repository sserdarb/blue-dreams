'use client'

import { useState, useRef, useCallback } from 'react'
import { WidgetEditor } from '@/components/admin/widget-editors'
import { getWidgetIcon } from '@/components/admin/widget-editors/widget-types'
import { reorderWidgets, deleteWidget as deleteWidgetAction } from '@/app/actions/admin'
import { Trash2, GripVertical } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Widget {
    id: string
    type: string
    data: string
    order: number
}

export function DraggableWidgetList({
    widgets: initialWidgets,
    pageId,
}: {
    widgets: Widget[]
    pageId: string
}) {
    const [widgets, setWidgets] = useState(initialWidgets)
    const [dragIndex, setDragIndex] = useState<number | null>(null)
    const [overIndex, setOverIndex] = useState<number | null>(null)
    const [deleting, setDeleting] = useState<string | null>(null)
    const router = useRouter()

    const handleDragStart = (index: number) => {
        setDragIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (dragIndex === null || dragIndex === index) return
        setOverIndex(index)
    }

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (dragIndex === null || dragIndex === dropIndex) {
            setDragIndex(null)
            setOverIndex(null)
            return
        }

        // Reorder locally first for instant feedback
        const newWidgets = [...widgets]
        const [moved] = newWidgets.splice(dragIndex, 1)
        newWidgets.splice(dropIndex, 0, moved)
        setWidgets(newWidgets)
        setDragIndex(null)
        setOverIndex(null)

        // Persist to DB
        try {
            await reorderWidgets(newWidgets.map(w => w.id))
            console.log('Widget order saved')
        } catch (err) {
            console.error('Failed to save widget order:', err)
            // Revert on error
            setWidgets(initialWidgets)
        }
    }

    const handleDragEnd = () => {
        setDragIndex(null)
        setOverIndex(null)
    }

    const handleDelete = async (widget: Widget) => {
        if (!confirm(`"${widget.type}" widget'ını silmek istediğinize emin misiniz?`)) return
        setDeleting(widget.id)
        try {
            await deleteWidgetAction(widget.id)
            setWidgets(prev => prev.filter(w => w.id !== widget.id))
            router.refresh()
        } catch (err) {
            console.error('Failed to delete widget:', err)
        }
        setDeleting(null)
    }

    if (widgets.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-900 rounded-xl border-2 border-dashed border-slate-700">
                <p className="text-slate-400 mb-2">Bu sayfada henüz widget yok</p>
                <p className="text-sm text-slate-500">Sayfanızı oluşturmak için aşağıdan widget ekleyin</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {widgets.map((widget, index) => (
                <div
                    key={widget.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-slate-800 rounded-xl shadow-sm border overflow-hidden transition-all duration-200 ${dragIndex === index
                            ? 'opacity-50 border-cyan-500 scale-[0.98]'
                            : overIndex === index
                                ? 'border-cyan-400 ring-2 ring-cyan-400/30'
                                : 'border-slate-700'
                        }`}
                >
                    {/* Widget Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
                        <div className="flex items-center gap-3">
                            <button className="text-slate-400 hover:text-slate-200 cursor-grab active:cursor-grabbing">
                                <GripVertical size={18} />
                            </button>
                            <span className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-xs font-semibold uppercase">
                                {getWidgetIcon(widget.type)}
                                {widget.type}
                            </span>
                            <span className="text-xs text-slate-500">#{index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleDelete(widget)}
                                disabled={deleting === widget.id}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition disabled:opacity-50"
                                title="Widget'ı sil"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Widget Editor */}
                    <div className="p-4">
                        <WidgetEditor
                            id={widget.id}
                            type={widget.type}
                            initialData={widget.data}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}
