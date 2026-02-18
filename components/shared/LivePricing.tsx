'use client'

import React, { useState, useEffect } from 'react'

interface RoomPrice {
    name: string
    minPrice: number | null
    avgPrice: number | null
    maxBasePrice: number | null
    hasDiscount: boolean
    available: boolean
    currency: string
}

interface PricingData {
    rooms: RoomPrice[]
    period: { from: string; to: string }
    currency: string
}

export default function LivePricing({ roomFilter }: { roomFilter?: string }) {
    const [pricing, setPricing] = useState<PricingData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [searching, setSearching] = useState(false)

    // Date / guest state for custom search
    const [checkIn, setCheckIn] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]
    })
    const [checkOut, setCheckOut] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 4); return d.toISOString().split('T')[0]
    })
    const [adults, setAdults] = useState(2)
    const [children, setChildren] = useState(0)
    const [kvkkAccepted, setKvkkAccepted] = useState(false)
    const [showForm, setShowForm] = useState(false)

    // Guest info for reservation request
    const [guestName, setGuestName] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [guestPhone, setGuestPhone] = useState('')
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        fetchPricing()
    }, [])

    async function fetchPricing(from?: string, to?: string) {
        setLoading(true)
        setError(false)
        try {
            const params = new URLSearchParams({ currency: 'EUR' })
            if (from) params.set('from', from)
            if (to) params.set('to', to)
            const res = await fetch(`/api/rooms/pricing?${params}`)
            if (!res.ok) throw new Error('API error')
            const data = await res.json()
            setPricing(data)
        } catch {
            setError(true)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        if (!checkIn || !checkOut) return
        setSearching(true)
        await fetchPricing(checkIn, checkOut)
        setSearching(false)
    }

    const handleReservationSubmit = () => {
        // Open in rezervasyonal with pre-filled params, or could POST to an API
        const url = `https://blue-dreams.rezervasyonal.com/?arrival=${checkIn}&departure=${checkOut}&adults=${adults}`
        window.open(url, '_blank')
        setSubmitted(true)
        setTimeout(() => setSubmitted(false), 3000)
    }

    // Filter by room name if specified
    const rooms = pricing && roomFilter
        ? pricing.rooms.filter(r => r.name.toLowerCase().includes(roomFilter.toLowerCase()))
        : pricing?.rooms || []

    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 border border-blue-200 dark:border-gray-700 rounded-2xl overflow-hidden my-8 shadow-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 p-4 flex items-center justify-between">
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                        Güncel Fiyatlar & Rezervasyon
                    </h3>
                    {pricing?.period && (
                        <p className="text-xs text-blue-200 mt-0.5">
                            {pricing.period.from} — {pricing.period.to} • Elektra PMS
                        </p>
                    )}
                </div>
                <span className="text-xs px-3 py-1 rounded-full bg-green-400/20 text-green-100 font-bold border border-green-400/30 animate-pulse">
                    ● Canlı
                </span>
            </div>

            {/* Date Picker & Guest Selector */}
            <div className="p-4 bg-white/50 dark:bg-gray-800/50 border-b border-blue-100 dark:border-gray-700">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Giriş</label>
                        <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                            min={today}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Çıkış</label>
                        <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                            min={checkIn}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-800 dark:text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Yetişkin</label>
                        <select value={adults} onChange={e => setAdults(Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-800 dark:text-gray-200 outline-none">
                            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Çocuk</label>
                        <select value={children} onChange={e => setChildren(Number(e.target.value))}
                            className="w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm text-gray-800 dark:text-gray-200 outline-none">
                            {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={handleSearch} disabled={searching || loading}
                    className="mt-3 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 text-sm">
                    {searching ? (
                        <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" /><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" /></svg> Fiyatlar Kontrol Ediliyor...</>
                    ) : (
                        <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg> Fiyat Sorgula</>
                    )}
                </button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="p-6">
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="h-4 bg-blue-100 dark:bg-gray-700 rounded w-32"></div>
                                <div className="h-6 bg-blue-100 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="p-6 text-center text-gray-400 text-sm">
                    Fiyat bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.
                </div>
            )}

            {/* Price Results */}
            {!loading && !error && rooms.length > 0 && (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {rooms.map((room, i) => (
                        <div key={i} className="flex items-center justify-between p-4 hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors">
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">{room.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {room.available ? (
                                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-0.5">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg>
                                            Müsait
                                        </span>
                                    ) : (
                                        <span className="text-xs text-red-500 dark:text-red-400">✗ Dolu</span>
                                    )}
                                    {room.hasDiscount && (
                                        <span className="text-xs text-orange-500 flex items-center gap-0.5">🏷️ İndirimli</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                {room.minPrice ? (
                                    <>
                                        {room.hasDiscount && room.maxBasePrice && (
                                            <span className="text-xs text-gray-400 line-through block">
                                                {room.maxBasePrice}€
                                            </span>
                                        )}
                                        <span className="text-2xl font-black text-blue-700 dark:text-blue-400">
                                            {room.minPrice}€
                                        </span>
                                        <span className="text-xs text-gray-400 block">/ gece</span>
                                    </>
                                ) : (
                                    <span className="text-sm text-gray-400">—</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reservation Section */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-3">
                {!showForm ? (
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setShowForm(true)}
                            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            Rezervasyon Yap
                        </button>
                        <a href={`https://blue-dreams.rezervasyonal.com/?arrival=${checkIn}&departure=${checkOut}`}
                            target="_blank" rel="noreferrer"
                            className="bg-white dark:bg-gray-700 border-2 border-blue-600 text-blue-700 dark:text-blue-300 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                            Fiyat Karşılaştır
                        </a>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-inner border border-blue-100 dark:border-gray-600 space-y-3">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                            Rezervasyon Bilgileri
                        </h4>
                        <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3 text-xs text-gray-600 dark:text-gray-300">
                            <div className="grid grid-cols-2 gap-2">
                                <div><strong>Giriş:</strong> {checkIn}</div>
                                <div><strong>Çıkış:</strong> {checkOut}</div>
                                <div><strong>Yetişkin:</strong> {adults}</div>
                                <div><strong>Çocuk:</strong> {children}</div>
                            </div>
                        </div>
                        <input type="text" placeholder="Ad Soyad" value={guestName} onChange={e => setGuestName(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500" />
                        <input type="email" placeholder="E-posta" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500" />
                        <input type="tel" placeholder="Telefon" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-2.5 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-blue-500" />

                        {/* KVKK Consent */}
                        <div className="bg-blue-50 dark:bg-gray-700 rounded-lg p-3 border border-blue-100 dark:border-gray-600">
                            <label className="flex items-start gap-2 cursor-pointer">
                                <input type="checkbox" checked={kvkkAccepted} onChange={e => setKvkkAccepted(e.target.checked)}
                                    className="mt-0.5 accent-blue-600" />
                                <span className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                                    6698 sayılı KVKK kapsamında kişisel verilerimin işlenmesine ilişkin{' '}
                                    <a href="/tr/kvkk" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-medium">
                                        aydınlatma metnini
                                    </a>{' '}
                                    okudum ve onaylıyorum.
                                </span>
                            </label>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => setShowForm(false)}
                                className="py-2.5 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                İptal
                            </button>
                            <button onClick={handleReservationSubmit}
                                disabled={!kvkkAccepted || !guestName.trim() || !guestEmail.trim()}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 dark:disabled:from-gray-600 dark:disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                                {submitted ? (
                                    <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6L9 17l-5-5" /></svg> Yönlendiriliyor...</>
                                ) : (
                                    'Rezervasyon Tamamla'
                                )}
                            </button>
                        </div>
                    </div>
                )}
                <p className="text-[10px] text-gray-400 dark:text-gray-500 text-center">
                    Elektra PMS ile entegre • Güvenli ödeme • Ücretsiz iptal
                </p>
            </div>
        </div>
    )
}
