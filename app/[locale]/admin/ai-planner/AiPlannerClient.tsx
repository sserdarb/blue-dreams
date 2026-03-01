'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Sparkles, Image as ImageIcon, Calendar, Languages, Hash, Send, Copy, Check, Loader2, MessageSquareText } from 'lucide-react'

const TONES = ['Lüks ve Profesyonel', 'Samimi ve Aile Dostu', 'Heyecanlı ve Enerjik', 'Romantik', 'Doğayla İç İçe']
const LANGUAGES = [
    { code: 'tr', name: 'Türkçe' },
    { code: 'en', name: 'İngilizce' },
    { code: 'ru', name: 'Rusça' },
    { code: 'de', name: 'Almanca' }
]

export default function AiPlannerClient() {
    const [topic, setTopic] = useState('Yaz Tatili Özel İndirimi')
    const [tone, setTone] = useState(TONES[0])
    const [language, setLanguage] = useState('tr')
    const [dateInfo, setDateInfo] = useState('Temmuz Ayı Boyunca')
    const [keywords, setKeywords] = useState('Bodrum, Lüks Tatil, Blue Dreams, Erken Rezervasyon')
    const [imageContext, setImageContext] = useState('Sonsuzluk havuzunda gün batımı')

    const [generating, setGenerating] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        setGenerating(true)
        setError(null)
        setResult(null)
        setCopied(false)

        try {
            const res = await fetch('/api/admin/ai-planner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, tone, language, dateInfo, keywords, imageContext })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Bilinmeyen bir hata oluştu.')

            setResult(data.text)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setGenerating(false)
        }
    }

    const copyToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2"><Sparkles className="text-amber-500" size={24} /> AI Sosyal Medya İçerik Planlayıcı</h1>
                <p className="text-sm text-muted-foreground mt-1">Sistemdeki doluluk, özel günler ve trendlere göre otomatik veya manuel içerik üretin.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Configuration Panel */}
                <Card className="lg:col-span-5 p-6 space-y-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 border-b pb-2 dark:border-slate-800"><MessageSquareText size={18} /> İçerik Parametreleri</h3>

                        <div className="space-y-4 text-sm">
                            <div>
                                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Konu / Hedef</label>
                                <input value={topic} onChange={e => setTopic(e.target.value)} type="text" className="w-full border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-800" placeholder="Örn: Hafta Sonu Fırsatı" />
                            </div>

                            <div>
                                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Languages size={14} /> Dil</label>
                                <div className="flex flex-wrap gap-2">
                                    {LANGUAGES.map(l => (
                                        <button key={l.code} onClick={() => setLanguage(l.code)}
                                            className={`px-3 py-1.5 rounded-md border text-xs font-medium transition-colors ${language === l.code ? 'bg-primary text-primary-foreground border-primary' : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                            {l.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">Marka Tonu (Tone of Voice)</label>
                                <select value={tone} onChange={e => setTone(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-800">
                                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Calendar size={14} /> Tarih / Etkinlik Bilgisi</label>
                                <input value={dateInfo} onChange={e => setDateInfo(e.target.value)} type="text" className="w-full border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-800" placeholder="Örn: 14 Şubat Sevgililer Günü" />
                            </div>

                            <div>
                                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><Hash size={14} /> Anahtar Kelimeler</label>
                                <input value={keywords} onChange={e => setKeywords(e.target.value)} type="text" className="w-full border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-800" placeholder="Örn: Spa, Masaj, Rahatlama" />
                            </div>

                            <div>
                                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1"><ImageIcon size={14} /> Görsel Bağlamı (İsteğe Bağlı)</label>
                                <textarea value={imageContext} onChange={e => setImageContext(e.target.value)} className="w-full border rounded-md px-3 py-2 bg-slate-50 dark:bg-slate-950 dark:border-slate-800 min-h-[80px]" placeholder="AI'a görseli tarif edin ki metni ona göre yazsın... (Örn: Mavi bayraklı plajımızda kokteyl yudumlayan bir çift)" />
                                <p className="text-[10px] text-muted-foreground mt-1">Not: Gelecekte Google Drive klasöründen otomatik görsel seçimi entegre edilecektir.</p>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={generating || !topic}
                            className="w-full mt-6 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                        >
                            {generating ? <><Loader2 className="animate-spin" size={18} /> Üretiliyor...</> : <><Sparkles size={18} /> Yapay Zeka ile İçerik Üret</>}
                        </button>
                    </div>
                </Card>

                {/* Output Panel */}
                <Card className="lg:col-span-7 p-0 overflow-hidden bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 flex flex-col">
                    <div className="bg-slate-100 dark:bg-slate-800/80 p-4 border-b flex justify-between items-center">
                        <h3 className="font-bold flex items-center gap-2 text-slate-700 dark:text-slate-300"><Send size={18} /> Üretilen Gönderi</h3>
                        <div className="flex gap-2">
                            <button onClick={copyToClipboard} disabled={!result} className="text-xs flex items-center gap-1 bg-white dark:bg-slate-700 border dark:border-slate-600 px-3 py-1.5 rounded shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50">
                                {copied ? <><Check size={14} className="text-emerald-500" /> Kopyalandı</> : <><Copy size={14} /> Kopyala</>}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 flex-1 min-h-[400px]">
                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 text-sm">
                                <strong>Hata:</strong> {error}
                            </div>
                        )}

                        {!result && !error && !generating && (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                                <Sparkles size={48} className="mb-4" />
                                <p>Sol paneldeki parametreleri belirleyip "İçerik Üret" butonuna basın.</p>
                            </div>
                        )}

                        {generating && (
                            <div className="h-full flex flex-col items-center justify-center text-cyan-600/80 dark:text-cyan-400/80 animate-pulse">
                                <Sparkles size={48} className="mb-4" />
                                <p className="font-medium">Blue Dreams marka dili analiz ediliyor ve içerik yazılıyor...</p>
                            </div>
                        )}

                        {result && (
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm leading-relaxed">
                                {result}
                            </div>
                        )}
                    </div>

                    {result && (
                        <div className="p-4 bg-white dark:bg-slate-900 border-t flex justify-between items-center text-xs text-muted-foreground">
                            <span>Bu içerik Gemini 2.5 Flash tarafından üretilmiştir. Lütfen yayınlamadan önce gözden geçirin.</span>
                            <div className="flex gap-2">
                                <button className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 px-3 py-2 rounded-md font-medium text-slate-700 dark:text-slate-300 transition-colors">Yeniden Üret</button>
                                <button className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-md font-medium transition-colors">Takvime Ekle (Yakında)</button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    )
}
