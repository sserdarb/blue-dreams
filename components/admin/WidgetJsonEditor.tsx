'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'

export function WidgetJsonEditor({ id, initialData }: { id: string, initialData: string }) {
  const [data, setData] = useState(initialData)
  const [isDirty, setIsDirty] = useState(false)

  const formattedData = (() => {
    try {
        const parsed = typeof data === 'string' ? JSON.parse(data) : data
        return JSON.stringify(parsed, null, 2)
    } catch {
        return data
    }
  })()

  const [editValue, setEditValue] = useState(formattedData)

  const handleSave = async () => {
    try {
        const parsed = JSON.parse(editValue)
        await updateWidget(id, parsed)
        setIsDirty(false)
        setData(JSON.stringify(parsed))
    } catch (e) {
        alert('Invalid JSON')
    }
  }

  return (
    <div>
        <textarea
            className="w-full h-32 font-mono text-sm border p-2 rounded bg-gray-50"
            value={editValue}
            onChange={(e) => {
                setEditValue(e.target.value)
                setIsDirty(true)
            }}
        />
        {isDirty && (
            <button
                onClick={handleSave}
                className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm"
            >
                Save Changes
            </button>
        )}
    </div>
  )
}
