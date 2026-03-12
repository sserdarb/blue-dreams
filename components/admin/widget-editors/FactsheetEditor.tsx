'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { FileText, Save, Check, ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { defaultFactsheetData } from '@/lib/factsheet-defaults'

export { defaultFactsheetData }

/* ─── tiny helpers ─── */
function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-bold text-slate-700 dark:text-slate-200">
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="p-5 space-y-4">{children}</div>}
    </div>
  )
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  const cls = "w-full border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{label}</label>
      {multiline
        ? <textarea className={cls + " h-24 resize-y"} value={value} onChange={e => onChange(e.target.value)} />
        : <input className={cls} value={value} onChange={e => onChange(e.target.value)} />
      }
    </div>
  )
}

/* ─── main editor ─── */
export function FactsheetEditor({ id, initialData }: { id: string; initialData: string }) {
  const [data, setData] = useState(() => {
    try {
      const parsed = JSON.parse(initialData)
      if (!parsed || Object.keys(parsed).length === 0) return { ...defaultFactsheetData }
      return parsed
    } catch {
      return { ...defaultFactsheetData }
    }
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  const update = (path: string, value: any) => {
    setData((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev))
      const keys = path.split('.')
      let obj = copy
      for (let i = 0; i < keys.length - 1; i++) {
        const key = isNaN(Number(keys[i])) ? keys[i] : Number(keys[i])
        obj = obj[key]
      }
      const lastKey = isNaN(Number(keys[keys.length - 1])) ? keys[keys.length - 1] : Number(keys[keys.length - 1])
      obj[lastKey] = value
      return copy
    })
    setSaved(false)
    setError('')
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      await updateWidget(id, data)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e: any) {
      setError(e.message || 'Kaydetme sırasında hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  const addRoom = () => {
    const rooms = [...(data.rooms || [])]
    rooms.push({ title: '', size: '', description: '', image: '' })
    update('rooms', rooms)
  }

  const removeRoom = (i: number) => {
    const rooms = [...(data.rooms || [])]
    rooms.splice(i, 1)
    setData((prev: any) => ({ ...prev, rooms }))
  }

  const addDining = () => {
    const dining = [...(data.dining || [])]
    dining.push({ title: '', description: '', image: '' })
    update('dining', dining)
  }

  const removeDining = (i: number) => {
    const dining = [...(data.dining || [])]
    dining.splice(i, 1)
    setData((prev: any) => ({ ...prev, dining }))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2 text-slate-700 dark:text-slate-300">
        <FileText size={18} className="text-blue-500" />
        <h3 className="font-bold">Factsheet Düzenleyici</h3>
      </div>

      {/* ── HERO ── */}
      <Section title="🎯 Hero Bölümü" defaultOpen={true}>
        <Field label="Tagline" value={data.hero?.tagline || ''} onChange={v => update('hero.tagline', v)} />
        <Field label="Başlık" value={data.hero?.title || ''} onChange={v => update('hero.title', v)} />
        <Field label="Alt Başlık" value={data.hero?.subtitle || ''} onChange={v => update('hero.subtitle', v)} multiline />
        <Field label="Açıklama" value={data.hero?.description || ''} onChange={v => update('hero.description', v)} multiline />
        <Field label="Görsel Yolu" value={data.hero?.image || ''} onChange={v => update('hero.image', v)} />
      </Section>

      {/* ── OVERVIEW ── */}
      <Section title="⭐ Öne Çıkan Özellikler">
        {(data.overview?.features || []).map((f: string, i: number) => (
          <Field key={i} label={`Özellik ${i+1}`} value={f} onChange={v => {
            const features = [...(data.overview?.features || [])]
            features[i] = v
            update('overview.features', features)
          }} />
        ))}
      </Section>

      {/* ── LOCATION ── */}
      <Section title="📍 Lokasyon">
        <Field label="Üst Başlık" value={data.location?.subtitle || ''} onChange={v => update('location.subtitle', v)} />
        <Field label="Başlık" value={data.location?.title || ''} onChange={v => update('location.title', v)} />
        <Field label="Açıklama" value={data.location?.description || ''} onChange={v => update('location.description', v)} multiline />
        <Field label="Adres" value={data.location?.address || ''} onChange={v => update('location.address', v)} />
        <Field label="Görsel Yolu" value={data.location?.image || ''} onChange={v => update('location.image', v)} />
        <Field label="İklim" value={data.location?.climate || ''} onChange={v => update('location.climate', v)} />
        <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs font-bold text-slate-500 mb-2">Mesafeler</p>
          {(data.location?.distances || []).map((d: any, i: number) => (
            <div key={i} className="flex gap-2 mb-2">
              <input className="flex-1 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm bg-white dark:bg-slate-900" value={d.label} onChange={e => {
                const dists = [...(data.location?.distances || [])]
                dists[i] = { ...dists[i], label: e.target.value }
                update('location.distances', dists)
              }} placeholder="Etiket" />
              <input className="w-24 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-sm bg-white dark:bg-slate-900" value={d.value} onChange={e => {
                const dists = [...(data.location?.distances || [])]
                dists[i] = { ...dists[i], value: e.target.value }
                update('location.distances', dists)
              }} placeholder="Değer" />
            </div>
          ))}
        </div>
      </Section>

      {/* ── ROOMS ── */}
      <Section title="🛏️ Odalar">
        {(data.rooms || []).map((room: any, i: number) => (
          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3 relative">
            <button type="button" onClick={() => removeRoom(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            <Field label="Oda Adı" value={room.title} onChange={v => update(`rooms.${i}.title`, v)} />
            <div className="flex gap-3">
              <div className="flex-1"><Field label="Boyut" value={room.size} onChange={v => update(`rooms.${i}.size`, v)} /></div>
              <div className="flex-[2]"><Field label="Açıklama" value={room.description} onChange={v => update(`rooms.${i}.description`, v)} /></div>
            </div>
            <Field label="Görsel Yolu" value={room.image || ''} onChange={v => update(`rooms.${i}.image`, v)} />
          </div>
        ))}
        <button type="button" onClick={addRoom} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800"><Plus size={14} /> Oda Ekle</button>
      </Section>

      {/* ── DINING ── */}
      <Section title="🍽️ Yeme-İçme">
        {(data.dining || []).map((item: any, i: number) => (
          <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-3 relative">
            <button type="button" onClick={() => removeDining(i)} className="absolute top-3 right-3 text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
            <Field label="Restoran Adı" value={item.title} onChange={v => update(`dining.${i}.title`, v)} />
            <Field label="Açıklama" value={item.description} onChange={v => update(`dining.${i}.description`, v)} />
            <Field label="Görsel Yolu" value={item.image || ''} onChange={v => update(`dining.${i}.image`, v)} />
          </div>
        ))}
        <button type="button" onClick={addDining} className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-800"><Plus size={14} /> Restoran Ekle</button>
      </Section>

      {/* ── BEACH & POOLS ── */}
      <Section title="🏖️ Plaj & Havuzlar">
        {(data.beachAndPools || []).map((item: any, i: number) => (
          <div key={i} className="space-y-2">
            <Field label={`Başlık ${i+1}`} value={item.title} onChange={v => update(`beachAndPools.${i}.title`, v)} />
            <Field label={`Açıklama ${i+1}`} value={item.description} onChange={v => update(`beachAndPools.${i}.description`, v)} />
          </div>
        ))}
      </Section>

      {/* ── FEATURES ── */}
      <Section title="✨ Özellikler (Spa, Aktiviteler, Genel Bilgi)">
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">Spa & Wellness</p>
          {(data.features?.spa || []).map((item: string, i: number) => (
            <Field key={i} label={`Spa ${i+1}`} value={item} onChange={v => {
              const spa = [...(data.features?.spa || [])]
              spa[i] = v
              update('features.spa', spa)
            }} />
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">Aktiviteler</p>
          {(data.features?.activities || []).map((item: string, i: number) => (
            <Field key={i} label={`Aktivite ${i+1}`} value={item} onChange={v => {
              const activities = [...(data.features?.activities || [])]
              activities[i] = v
              update('features.activities', activities)
            }} />
          ))}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 mb-2">Genel Bilgiler</p>
          {(data.features?.info || []).map((item: string, i: number) => (
            <Field key={i} label={`Bilgi ${i+1}`} value={item} onChange={v => {
              const info = [...(data.features?.info || [])]
              info[i] = v
              update('features.info', info)
            }} />
          ))}
        </div>
      </Section>

      {/* ── LABELS ── */}
      <Section title="🏷️ Bölüm Etiketleri (Çeviri)">
        <Field label="Adres" value={data.labels?.address || ''} onChange={v => update('labels.address', v)} />
        <Field label="Mesafeler" value={data.labels?.distances || ''} onChange={v => update('labels.distances', v)} />
        <Field label="Konaklama" value={data.labels?.accommodation || ''} onChange={v => update('labels.accommodation', v)} />
        <Field label="Odalar ve Süitler" value={data.labels?.roomsAndSuites || ''} onChange={v => update('labels.roomsAndSuites', v)} />
        <Field label="Gastronomi" value={data.labels?.gastronomy || ''} onChange={v => update('labels.gastronomy', v)} />
        <Field label="Yiyecek & İçecek" value={data.labels?.foodAndBeverage || ''} onChange={v => update('labels.foodAndBeverage', v)} />
        <Field label="Tesis Olanakları" value={data.labels?.resortFacilities || ''} onChange={v => update('labels.resortFacilities', v)} />
        <Field label="Plaj & Havuzlar" value={data.labels?.beachAndPools || ''} onChange={v => update('labels.beachAndPools', v)} />
        <Field label="Spa & Wellness" value={data.labels?.spaAndWellness || ''} onChange={v => update('labels.spaAndWellness', v)} />
        <Field label="Aktiviteler" value={data.labels?.activities || ''} onChange={v => update('labels.activities', v)} />
        <Field label="Genel Bilgi" value={data.labels?.generalInfo || ''} onChange={v => update('labels.generalInfo', v)} />
      </Section>

      {/* ── ERROR & SAVE ── */}
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
