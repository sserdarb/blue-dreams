'use client'

import React, { useState, useCallback } from 'react'
import { Calendar, Users, Baby, Search, Loader2, Check, ChevronRight, Star, Maximize, Eye, Phone, Mail, User, MessageSquare } from 'lucide-react'

interface RoomTypeAvailability {
    roomType: string
    roomTypeId: number
    minPrice: number
    maxPrice: number
    minPriceEur: number
    maxPriceEur: number
    totalPrice: number
    totalPriceEur: number
    avgPricePerNight: number
    avgPricePerNightEur: number
    isAvailable: boolean
    nights: number
}

interface AvailabilityResponse {
    checkIn: string
    checkOut: string
    nights: number
    adults: number
    children: number
    currency: string
    roomTypes: RoomTypeAvailability[]
}

// Room type display data
const ROOM_DISPLAY: Record<string, { title: string; subtitle: string; image: string; size: string; capacity: string; features: string[] }> = {
    'CLUB': {
        title: 'Club Oda', subtitle: 'Konforlu Konaklama',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
        size: '20-22 m²', capacity: '2 Kişi',
        features: ['Split Klima', 'LCD TV', 'Minibar', 'Duşlu Banyo']
    },
    'CLUB DENİZ': {
        title: 'Club Oda (Deniz Manzaralı)', subtitle: 'Deniz Manzaralı',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-1.jpg',
        size: '20-22 m²', capacity: '2 Kişi',
        features: ['Deniz Manzarası', 'Split Klima', 'LCD TV', 'Minibar']
    },
    'DELUXE': {
        title: 'Deluxe Oda', subtitle: 'Lüks Konaklama',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
        size: '40-45 m²', capacity: '2-3 Kişi',
        features: ['Özel Balkon', 'Nespresso', 'Merkezi Klima', 'Giysi Odası']
    },
    'AİLE': {
        title: 'Aile Suiti', subtitle: 'Geniş Aile Odaları',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
        size: '55-60 m²', capacity: '4-5 Kişi',
        features: ['2 Yatak Odası', '2 Banyo', 'Geniş Balkon', 'Bebek Karyolası']
    },
    'FAMILY': {
        title: 'Aile Suiti', subtitle: 'Geniş Aile Odaları',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
        size: '55-60 m²', capacity: '4-5 Kişi',
        features: ['2 Yatak Odası', '2 Banyo', 'Geniş Balkon', 'Bebek Karyolası']
    },
}

function getDisplayInfo(roomType: string) {
    const upper = roomType.toUpperCase()
    // Try exact match first
    if (ROOM_DISPLAY[upper]) return ROOM_DISPLAY[upper]
    // Try partial match
    for (const [key, val] of Object.entries(ROOM_DISPLAY)) {
        if (upper.includes(key) || key.includes(upper)) return val
    }
    // Fallback
    return {
        title: roomType, subtitle: 'Oda',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
        size: '—', capacity: '2 Kişi',
        features: ['Klima', 'TV', 'Minibar']
    }
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function fmtPrice(n: number): string {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export default function BookingWidget() {
    // Get tomorrow and day after as defaults
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfter = new Date()
    dayAfter.setDate(dayAfter.getDate() + 4)

    const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0])
    const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split('T')[0])
    const [adults, setAdults] = useState(2)
    const [children, setChildren] = useState(0)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<AvailabilityResponse | null>(null)
    const [error, setError] = useState('')

    // Booking form state
    const [selectedRoom, setSelectedRoom] = useState<RoomTypeAvailability | null>(null)
    const [guestName, setGuestName] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [guestPhone, setGuestPhone] = useState('')
    const [notes, setNotes] = useState('')
    const [bookingSubmitting, setBookingSubmitting] = useState(false)
    const [bookingResult, setBookingResult] = useState<{ success: boolean; message: string; referenceId?: string } | null>(null)

    const searchAvailability = useCallback(async () => {
        setLoading(true)
        setError('')
        setResults(null)
        setSelectedRoom(null)
        setBookingResult(null)

        try {
            const params = new URLSearchParams({ checkIn, checkOut, adults: String(adults), children: String(children), currency: 'TRY' })
            const res = await fetch(`/api/booking/availability?${params}`)
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data.error || 'Müsaitlik sorgulanırken hata oluştu')
            }
            const data = await res.json()
            setResults(data)
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }, [checkIn, checkOut, adults, children])

    const submitBooking = useCallback(async () => {
        if (!selectedRoom || !guestName || !guestEmail || !guestPhone) return

        setBookingSubmitting(true)
        try {
            const res = await fetch('/api/booking/availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomTypeId: selectedRoom.roomTypeId,
                    roomType: selectedRoom.roomType,
                    checkIn,
                    checkOut,
                    adults,
                    children,
                    guestName,
                    guestEmail,
                    guestPhone,
                    notes,
                    totalPrice: selectedRoom.totalPrice,
                    currency: 'TRY'
                })
            })
            const data = await res.json()
            setBookingResult(data)
        } catch (err: any) {
            setBookingResult({ success: false, message: 'Rezervasyon talebi gönderilemedi. Lütfen tekrar deneyiniz.' })
        } finally {
            setBookingSubmitting(false)
        }
    }, [selectedRoom, guestName, guestEmail, guestPhone, notes, checkIn, checkOut, adults, children])

    return (
        <div className="w-full">
            {/* Search Form */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-brand/10 p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
                        <Calendar size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-serif text-gray-900">Müsaitlik Sorgula</h3>
                        <p className="text-xs text-gray-500">En iyi fiyat garantisi ile doğrudan rezervasyon</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Check-in */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Giriş Tarihi</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={checkIn}
                                onChange={e => setCheckIn(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                            />
                        </div>
                    </div>

                    {/* Check-out */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Çıkış Tarihi</label>
                        <input
                            type="date"
                            value={checkOut}
                            onChange={e => setCheckOut(e.target.value)}
                            min={checkIn}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                        />
                    </div>

                    {/* Adults */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Yetişkin</label>
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                            <button onClick={() => setAdults(Math.max(1, adults - 1))} className="px-4 py-3 text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg">−</button>
                            <span className="flex-1 text-center font-bold text-gray-800 flex items-center justify-center gap-1.5">
                                <Users size={16} className="text-brand" />{adults}
                            </span>
                            <button onClick={() => setAdults(Math.min(6, adults + 1))} className="px-4 py-3 text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg">+</button>
                        </div>
                    </div>

                    {/* Children */}
                    <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Çocuk</label>
                        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                            <button onClick={() => setChildren(Math.max(0, children - 1))} className="px-4 py-3 text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg">−</button>
                            <span className="flex-1 text-center font-bold text-gray-800 flex items-center justify-center gap-1.5">
                                <Baby size={16} className="text-brand" />{children}
                            </span>
                            <button onClick={() => setChildren(Math.min(4, children + 1))} className="px-4 py-3 text-gray-500 hover:bg-gray-100 transition-colors font-bold text-lg">+</button>
                        </div>
                    </div>

                    {/* Search Button */}
                    <div className="flex items-end">
                        <button
                            onClick={searchAvailability}
                            disabled={loading}
                            className="w-full px-6 py-3 bg-brand text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/25 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                            {loading ? 'Sorgulanıyor...' : 'Ara'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                        {error}
                    </div>
                )}
            </div>

            {/* Results */}
            {results && (
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-serif text-gray-900">Müsait Odalar</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {formatDate(results.checkIn)} — {formatDate(results.checkOut)} • {results.nights} gece •{' '}
                                {results.adults} yetişkin{results.children > 0 ? `, ${results.children} çocuk` : ''}
                            </p>
                        </div>
                        <span className="text-xs font-bold text-brand bg-brand/10 px-3 py-1 rounded-full">
                            {results.roomTypes.filter(r => r.isAvailable).length} oda tipi müsait
                        </span>
                    </div>

                    {results.roomTypes.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
                            <Calendar size={40} className="mx-auto text-amber-400 mb-4" />
                            <h4 className="text-lg font-bold text-amber-800 mb-2">Müsait Oda Bulunamadı</h4>
                            <p className="text-amber-600 text-sm">Seçtiğiniz tarihler için müsait oda bulunamamıştır. Lütfen farklı tarihler deneyiniz.</p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {results.roomTypes.map(room => {
                                const display = getDisplayInfo(room.roomType)
                                const isSelected = selectedRoom?.roomTypeId === room.roomTypeId

                                return (
                                    <div
                                        key={room.roomTypeId}
                                        className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all duration-300 ${isSelected ? 'border-brand shadow-brand/20' :
                                                room.isAvailable ? 'border-gray-100 hover:border-brand/30 hover:shadow-xl' : 'border-gray-100 opacity-60'
                                            }`}
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            {/* Room Image */}
                                            <div className="md:w-1/3 relative h-64 md:h-auto overflow-hidden">
                                                <img
                                                    src={display.image}
                                                    alt={display.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent md:bg-gradient-to-t" />
                                                <div className="absolute bottom-4 left-4">
                                                    <span className="text-brand text-[10px] font-bold tracking-[0.2em] uppercase">{display.subtitle}</span>
                                                    <h4 className="text-xl font-serif text-white">{display.title}</h4>
                                                </div>
                                            </div>

                                            {/* Room Details */}
                                            <div className="p-6 flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex items-center gap-4 mb-3">
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                            <Maximize size={12} /> {display.size}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                            <Users size={12} /> {display.capacity}
                                                        </span>
                                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">
                                                            {room.roomType}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {display.features.map(f => (
                                                            <span key={f} className="text-xs text-gray-600 bg-sand px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                                <Check size={10} className="text-brand" /> {f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Price & CTA */}
                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <div>
                                                        {room.isAvailable ? (
                                                            <>
                                                                <div className="flex items-baseline gap-2">
                                                                    <span className="text-3xl font-bold text-gray-900">₺{fmtPrice(room.totalPrice)}</span>
                                                                    <span className="text-sm text-gray-500">/ {room.nights} gece</span>
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-0.5">
                                                                    Gecelik ₺{fmtPrice(room.avgPricePerNight)} • €{fmtPrice(room.avgPricePerNightEur)}
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <span className="text-lg font-bold text-red-500">Müsait Değil</span>
                                                        )}
                                                    </div>

                                                    {room.isAvailable && (
                                                        <button
                                                            onClick={() => setSelectedRoom(isSelected ? null : room)}
                                                            className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all ${isSelected
                                                                    ? 'bg-brand text-white shadow-lg shadow-brand/25'
                                                                    : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
                                                                }`}
                                                        >
                                                            {isSelected ? '✓ Seçildi' : 'Seç'}
                                                            <ChevronRight size={16} className="inline ml-1 -mt-0.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Booking Form */}
            {selectedRoom && !bookingResult && (
                <div className="mt-8 bg-white rounded-2xl shadow-2xl border-2 border-brand/20 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
                            <Star size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-serif text-gray-900">Rezervasyon Bilgileri</h3>
                            <p className="text-xs text-gray-500">
                                {getDisplayInfo(selectedRoom.roomType).title} • {formatDate(checkIn)} — {formatDate(checkOut)} •{' '}
                                <span className="font-bold text-brand">₺{fmtPrice(selectedRoom.totalPrice)}</span>
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Ad Soyad *</label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={e => setGuestName(e.target.value)}
                                    placeholder="Adınız Soyadınız"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">E-posta *</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={guestEmail}
                                    onChange={e => setGuestEmail(e.target.value)}
                                    placeholder="email@ornek.com"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Telefon *</label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    value={guestPhone}
                                    onChange={e => setGuestPhone(e.target.value)}
                                    placeholder="+90 5XX XXX XX XX"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Notlar (Opsiyonel)</label>
                            <div className="relative">
                                <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400" />
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Özel istekleriniz..."
                                    rows={1}
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary & Submit */}
                    <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        <div className="text-center md:text-left">
                            <div className="text-sm text-gray-500">Toplam Tutar</div>
                            <div className="text-3xl font-bold text-gray-900">₺{fmtPrice(selectedRoom.totalPrice)}</div>
                            <div className="text-xs text-gray-400">≈ €{fmtPrice(selectedRoom.totalPriceEur)}</div>
                        </div>

                        <button
                            onClick={submitBooking}
                            disabled={bookingSubmitting || !guestName || !guestEmail || !guestPhone}
                            className="px-10 py-4 bg-brand text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/25 disabled:opacity-50 flex items-center gap-2"
                        >
                            {bookingSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                            {bookingSubmitting ? 'Gönderiliyor...' : 'Rezervasyon Talebi Gönder'}
                        </button>
                    </div>
                </div>
            )}

            {/* Booking Result */}
            {bookingResult && (
                <div className={`mt-8 rounded-2xl p-8 text-center ${bookingResult.success ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-red-50 border-2 border-red-200'}`}>
                    <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${bookingResult.success ? 'bg-emerald-500' : 'bg-red-500'}`}>
                        {bookingResult.success ? <Check size={32} className="text-white" /> : <span className="text-white text-2xl">✕</span>}
                    </div>
                    <h4 className={`text-xl font-bold mb-2 ${bookingResult.success ? 'text-emerald-800' : 'text-red-800'}`}>
                        {bookingResult.success ? 'Talebiniz Alındı!' : 'Hata Oluştu'}
                    </h4>
                    <p className={`text-sm ${bookingResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                        {bookingResult.message}
                    </p>
                    {bookingResult.referenceId && (
                        <p className="mt-3 text-xs font-mono font-bold text-emerald-700 bg-emerald-100 inline-block px-4 py-1.5 rounded-full">
                            Referans: {bookingResult.referenceId}
                        </p>
                    )}
                    <div className="mt-6">
                        <button
                            onClick={() => { setBookingResult(null); setSelectedRoom(null); setResults(null) }}
                            className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:border-brand hover:text-brand transition-all"
                        >
                            Yeni Arama Yap
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
