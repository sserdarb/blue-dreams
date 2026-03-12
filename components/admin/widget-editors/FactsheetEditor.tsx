'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { FileText, Save, Check } from 'lucide-react'
import { defaultFactsheetData } from '@/lib/factsheet-defaults'

export { defaultFactsheetData }

export function FactsheetEditor({ id, initialData }: { id: string; initialData: string }) {
  const [json, setJson] = useState(() => {
    try {
      const parsed = JSON.parse(initialData)
      if (Object.keys(parsed).length === 0) return JSON.stringify(defaultFactsheetData, null, 2)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return JSON.stringify(defaultFactsheetData, null, 2)
    }
  })
  
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      const parsed = JSON.parse(json)
      await updateWidget(id, parsed)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message || 'Geçersiz JSON formatı. Lütfen kontrol edin.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
        <FileText size={18} className="text-blue-500" />
        <h3 className="font-bold">Factsheet JSON Düzenleyici</h3>
      </div>
      <p className="text-xs text-slate-500 mb-4">
        Factsheet verilerini aşağıdaki JSON formatında düzenleyebilirsiniz. Görseller <code>image</code> alanlarından değiştirilebilir.
        Mevcut görseller: <code>/images/rooms/...</code>, <code>/images/dining/...</code>
      </p>

      <textarea
        className="w-full h-[500px] font-mono text-xs border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-orange-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 resize-y"
        value={json}
        onChange={(e) => {
          setJson(e.target.value)
          setSaved(false)
          setError('')
        }}
        spellCheck={false}
      />
      
      {error && (
        <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm ${
            saved 
              ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
          }`}
        >
          {saved ? <><Check size={16} /> Kaydedildi!</> : <><Save size={16} /> {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}</>}
        </button>
      </div>
    </div>
  )
}
