'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { FileText, Save, Check } from 'lucide-react'

export const defaultFactsheetData = {
  hero: {
    tagline: "Where Nature Meets Elegance",
    title: "Every Dream Starts With Blue",
    subtitle: "FACTSHEET — SEASON 2026\nBODRUM / TORBA — TÜRKİYE",
    description: "A 5-star luxury beach resort located on a 55,000m² area in the private Zeytinlikahve Cove. It features a unique architecture that blends with the natural landscape of Bodrum.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["700m private sandy beach", "Five-star service standards", "Season 2026 Ready"]
  },
  location: {
    subtitle: "DESTINATION",
    title: "The Pearl of the Aegean",
    description: "Bodrum, known in antiquity as Halicarnassus, is a stunning coastal city on Turkey's southwestern Aegean coast. Famous for turquoise waters, white-washed architecture, and vibrant culture, it offers the perfect backdrop for a luxury getaway.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Türkiye",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Bodrum Center", value: "10 km" },
      { label: "Milas-Bodrum Airport (BJV)", value: "25 km" },
      { label: "Nearest Town (Torba)", value: "2 km" }
    ],
    climate: "Mediterranean climate with 300+ days of sunshine."
  },
  rooms: [
    { title: "Club Room", size: "24m²", description: "Garden or partial sea views, hillside bungalow style.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Club Sea View Room", size: "24m²", description: "Panoramic Aegean views with private balconies.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Club Family Room", size: "35-40m²", description: "Two separate bedrooms, ideal for families.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Deluxe Sea View Room", size: "40m²", description: "Located in the main building, premium furnishings, expansive sea views.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Beach", description: "700m coastline with a mix of sand and private wooden piers. Features exclusive relaxing cabanas." },
    { title: "Infinity Pool", description: "Breathtaking views of the cove." },
    { title: "Activity Pool", description: "The heart of resort entertainment." }
  ],
  dining: [
    { title: "Main Restaurant", description: "International buffet with live cooking stations and theme nights.", image: "/images/dining/hero.jpg" },
    { title: "La Locanda", description: "Italian fine dining with wood-fired pizza and handmade pasta.", image: "/images/dining/lalocanda.jpg" },
    { title: "Halicarnassus", description: "Turkish & Seafood à la carte with fresh Aegean catches.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Sunset Bar", description: "Cocktails and live music with panoramic sunset views.", image: "/images/dining/sunsetbar.jpg" }
  ],
  features: {
    spa: ["Turkish Bath (Hamam)", "Sauna", "Steam Room", "Indoor Pool", "Professional massage treatments"],
    activities: ["Windsurfing & Canoeing", "Tennis & Basketball", "Kids Club", "Live Music & Evening Shows"],
    info: ["Check-in: 14:00", "Check-out: 12:00", "High-speed WiFi", "Languages: TR, EN, DE, RU"]
  }
}

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
