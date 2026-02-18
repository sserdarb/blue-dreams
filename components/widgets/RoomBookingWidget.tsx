'use client'

import React, { useState, useCallback, useEffect } from 'react'
import {
    Calendar, Users, Baby, Search, Loader2, Check, ChevronRight, ChevronDown,
    Star, Maximize, Eye, Phone, Mail, User, MessageSquare, EyeOff
} from 'lucide-react'
import Image from 'next/image'

// ─── Types ───────────────────────────────────────────────────────────────────

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

// ─── Room Display Data (matches Elektra PMS room type names) ─────────────────

const ROOM_DISPLAY: Record<string, {
    title: string; titleEn: string; subtitle: string; subtitleEn: string;
    image: string; size: string; capacity: string; view: string;
    features: string[]; featuresEn: string[];
    slug: string
}> = {
    'CLUB': {
        title: 'Club Oda', titleEn: 'Club Room',
        subtitle: 'Konforlu Konaklama', subtitleEn: 'Comfortable Stay',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
        size: '20-22 m²', capacity: '2 Kişi', view: 'Kara / Deniz Manzaralı',
        features: ['Split Klima', 'LCD TV', 'Minibar', 'Duşlu Banyo'],
        featuresEn: ['Split AC', 'LCD TV', 'Minibar', 'Shower'],
        slug: 'club'
    },
    'CLUB DENİZ': {
        title: 'Club Oda (Deniz)', titleEn: 'Club Room (Sea View)',
        subtitle: 'Deniz Manzaralı', subtitleEn: 'Sea View',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-1.jpg',
        size: '20-22 m²', capacity: '2 Kişi', view: 'Deniz Manzaralı',
        features: ['Deniz Manzarası', 'Split Klima', 'LCD TV', 'Minibar'],
        featuresEn: ['Sea View', 'Split AC', 'LCD TV', 'Minibar'],
        slug: 'club'
    },
    'DELUXE': {
        title: 'Deluxe Oda', titleEn: 'Deluxe Room',
        subtitle: 'Lüks ve Konfor', subtitleEn: 'Luxury & Comfort',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
        size: '40-45 m²', capacity: '2-3 Kişi', view: 'Panoramik Deniz & Havuz',
        features: ['Özel Balkon', 'Nespresso', 'Merkezi Klima', 'Giysi Odası'],
        featuresEn: ['Private Balcony', 'Nespresso', 'Central AC', 'Dressing Room'],
        slug: 'deluxe'
    },
    'AİLE': {
        title: 'Aile Suiti', titleEn: 'Family Suite',
        subtitle: 'Geniş Aile Odaları', subtitleEn: 'Spacious Family Rooms',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
        size: '55-60 m²', capacity: '4-5 Kişi', view: 'Bahçe & Deniz',
        features: ['2 Yatak Odası', '2 Banyo', 'Geniş Balkon', 'Bebek Karyolası'],
        featuresEn: ['2 Bedrooms', '2 Bathrooms', 'Large Balcony', 'Baby Crib'],
        slug: 'aile'
    },
    'FAMILY': {
        title: 'Aile Suiti', titleEn: 'Family Suite',
        subtitle: 'Geniş Aile Odaları', subtitleEn: 'Spacious Family Rooms',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
        size: '55-60 m²', capacity: '4-5 Kişi', view: 'Bahçe & Deniz',
        features: ['2 Yatak Odası', '2 Banyo', 'Geniş Balkon', 'Bebek Karyolası'],
        featuresEn: ['2 Bedrooms', '2 Bathrooms', 'Large Balcony', 'Baby Crib'],
        slug: 'aile'
    },
}

function getDisplayInfo(roomType: string) {
    const upper = roomType.toUpperCase()
    if (ROOM_DISPLAY[upper]) return ROOM_DISPLAY[upper]
    for (const [key, val] of Object.entries(ROOM_DISPLAY)) {
        if (upper.includes(key) || key.includes(upper)) return val
    }
    return {
        title: roomType, titleEn: roomType,
        subtitle: 'Oda', subtitleEn: 'Room',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
        size: '—', capacity: '2 Kişi', view: '—',
        features: ['Klima', 'TV', 'Minibar'],
        featuresEn: ['AC', 'TV', 'Minibar'],
        slug: 'club'
    }
}

function fmtPrice(n: number): string {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── Component ───────────────────────────────────────────────────────────────

export function RoomBookingWidget({ data }: { data: any }) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const defaultCheckOut = new Date()
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 4)

    const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0])
    const [checkOut, setCheckOut] = useState(defaultCheckOut.toISOString().split('T')[0])
    const [adults, setAdults] = useState(2)
    const [children, setChildren] = useState(0)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<AvailabilityResponse | null>(null)
    const [error, setError] = useState('')
    const [showUnavailable, setShowUnavailable] = useState(false)

    // Booking form
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
            const params = new URLSearchParams({
                checkIn, checkOut,
                adults: String(adults),
                children: String(children),
                currency: 'TRY'
            })
            const res = await fetch(`/api/booking/availability?${params}`)
            if (!res.ok) {
                const d = await res.json().catch(() => ({}))
                throw new Error(d.error || 'Müsaitlik sorgulanırken hata oluştu')
            }
            const d = await res.json()
            setResults(d)
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }, [checkIn, checkOut, adults, children])

    // Auto-search on mount
    useEffect(() => {
        searchAvailability()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

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
                    checkIn, checkOut, adults, children,
                    guestName, guestEmail, guestPhone, notes,
                    totalPrice: selectedRoom.totalPrice,
                    currency: 'TRY'
                })
            })
            const d = await res.json()
            setBookingResult(d)
        } catch {
            setBookingResult({ success: false, message: 'Rezervasyon talebi gönderilemedi. Lütfen tekrar deneyiniz.' })
        } finally {
            setBookingSubmitting(false)
        }
    }, [selectedRoom, guestName, guestEmail, guestPhone, notes, checkIn, checkOut, adults, children])

    // Filtered rooms
    const availableRooms = results?.roomTypes.filter(r => r.isAvailable) || []
    const unavailableRooms = results?.roomTypes.filter(r => !r.isAvailable) || []

    return (
        <section className="py-16 bg-gradient-to-b from-white via-gray-50/50 to-white">
            <div className="container mx-auto px-4 md:px-6">

                {/* ─── Section Header ─── */}
                <div className="text-center mb-10">
                    <span className="text-brand text-xs font-bold tracking-[0.3em] uppercase block mb-3">
                        {data?.eyebrow || 'ONLİNE REZERVASYON'}
                    </span>
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-3">
                        {data?.title || 'Odalarımız & Fiyatlar'}
                    </h2>
                    <p className="text-gray-500 max-w-xl mx-auto text-sm">
                        {data?.subtitle || 'Tarih seçerek müsaitlik ve güncel fiyatları görüntüleyin. En iyi fiyat garantisi ile doğrudan rezervasyon yapın.'}
                    </p>
                </div>

                {/* ─── Search Bar ─── */}
                <div className="max-w-5xl mx-auto mb-12">
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 md:p-6">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
                            {/* Check-in */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Giriş</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand" />
                                    <input
                                        type="date"
                                        value={checkIn}
                                        onChange={e => {
                                            setCheckIn(e.target.value)
                                            if (e.target.value >= checkOut) {
                                                const d = new Date(e.target.value)
                                                d.setDate(d.getDate() + 1)
                                                setCheckOut(d.toISOString().split('T')[0])
                                            }
                                        }}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full pl-9 pr-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Check-out */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Çıkış</label>
                                <div className="relative">
                                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand" />
                                    <input
                                        type="date"
                                        value={checkOut}
                                        onChange={e => setCheckOut(e.target.value)}
                                        min={checkIn}
                                        className="w-full pl-9 pr-2 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 font-medium focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {/* Adults */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Yetişkin</label>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-[42px]">
                                    <button onClick={() => setAdults(Math.max(1, adults - 1))} className="px-3 text-gray-400 hover:bg-gray-50 transition-colors font-bold h-full">−</button>
                                    <span className="flex-1 text-center font-bold text-gray-800 text-sm flex items-center justify-center gap-1">
                                        <Users size={13} className="text-brand" />{adults}
                                    </span>
                                    <button onClick={() => setAdults(Math.min(6, adults + 1))} className="px-3 text-gray-400 hover:bg-gray-50 transition-colors font-bold h-full">+</button>
                                </div>
                            </div>

                            {/* Children */}
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Çocuk</label>
                                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden h-[42px]">
                                    <button onClick={() => setChildren(Math.max(0, children - 1))} className="px-3 text-gray-400 hover:bg-gray-50 transition-colors font-bold h-full">−</button>
                                    <span className="flex-1 text-center font-bold text-gray-800 text-sm flex items-center justify-center gap-1">
                                        <Baby size={13} className="text-brand" />{children}
                                    </span>
                                    <button onClick={() => setChildren(Math.min(4, children + 1))} className="px-3 text-gray-400 hover:bg-gray-50 transition-colors font-bold h-full">+</button>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="col-span-2 md:col-span-1 flex items-end">
                                <button
                                    onClick={searchAvailability}
                                    disabled={loading}
                                    className="w-full px-4 py-2.5 bg-brand text-white font-bold uppercase tracking-widest text-xs rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 disabled:opacity-50 flex items-center justify-center gap-2 h-[42px]"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                                    {loading ? 'Aranıyor...' : 'MÜSAİTLİK ARA'}
                                </button>
                            </div>
                        </div>

                        {/* Nights info */}
                        {results && (
                            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                                <span>
                                    📅 {formatDate(results.checkIn)} → {formatDate(results.checkOut)} • <strong>{results.nights} gece</strong>
                                </span>
                                <span className="font-bold text-brand bg-brand/5 px-3 py-1 rounded-full">
                                    {availableRooms.length} oda tipi müsait
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* ─── Error ─── */}
                {error && (
                    <div className="max-w-5xl mx-auto mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                {/* ─── Loading Skeleton ─── */}
                {loading && (
                    <div className="max-w-5xl mx-auto grid gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-pulse">
                                <div className="flex flex-col md:flex-row">
                                    <div className="md:w-1/3 h-56 md:h-auto bg-gray-200" />
                                    <div className="p-6 flex-1 space-y-4">
                                        <div className="h-6 bg-gray-200 rounded w-1/3" />
                                        <div className="h-4 bg-gray-100 rounded w-2/3" />
                                        <div className="flex gap-2">
                                            <div className="h-8 bg-gray-100 rounded w-20" />
                                            <div className="h-8 bg-gray-100 rounded w-20" />
                                            <div className="h-8 bg-gray-100 rounded w-20" />
                                        </div>
                                        <div className="flex justify-between pt-4 border-t border-gray-100">
                                            <div className="h-10 bg-gray-200 rounded w-32" />
                                            <div className="h-10 bg-gray-100 rounded w-24" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ─── Available Rooms ─── */}
                {!loading && results && (
                    <div className="max-w-5xl mx-auto">
                        {availableRooms.length === 0 ? (
                            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 text-center">
                                <Calendar size={44} className="mx-auto text-amber-400 mb-4" />
                                <h4 className="text-xl font-bold text-amber-800 mb-2">Müsait Oda Bulunamadı</h4>
                                <p className="text-amber-600 text-sm max-w-md mx-auto">
                                    Seçtiğiniz tarihler için müsait oda bulunamamıştır. Lütfen farklı tarihler deneyiniz.
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {availableRooms.map(room => {
                                    const display = getDisplayInfo(room.roomType)
                                    const isSelected = selectedRoom?.roomTypeId === room.roomTypeId

                                    return (
                                        <div
                                            key={room.roomTypeId}
                                            className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 border-2 ${isSelected
                                                ? 'border-brand shadow-brand/20 ring-2 ring-brand/10'
                                                : 'border-gray-100 hover:border-brand/20 hover:shadow-xl'
                                                }`}
                                        >
                                            <div className="flex flex-col md:flex-row">
                                                {/* Room Image */}
                                                <div className="md:w-[38%] relative h-60 md:h-auto overflow-hidden group">
                                                    <img
                                                        src={display.image}
                                                        alt={display.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                                    <div className="absolute bottom-4 left-4 right-4">
                                                        <span className="text-brand text-[10px] font-bold tracking-[0.2em] uppercase">{display.subtitle}</span>
                                                        <h3 className="text-2xl font-serif text-white mt-0.5">{display.title}</h3>
                                                    </div>
                                                    {/* Price badge on image */}
                                                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-2 shadow-lg">
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase">gecelik</div>
                                                        <div className="text-lg font-bold text-brand">₺{fmtPrice(room.avgPricePerNight)}</div>
                                                    </div>
                                                </div>

                                                {/* Room Details */}
                                                <div className="p-5 md:p-6 flex-1 flex flex-col justify-between">
                                                    {/* Info badges */}
                                                    <div>
                                                        <div className="flex flex-wrap gap-2 mb-3">
                                                            <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                                                                <Maximize size={12} className="text-brand" /> {display.size}
                                                            </span>
                                                            <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                                                                <Users size={12} className="text-brand" /> {display.capacity}
                                                            </span>
                                                            <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5">
                                                                <Eye size={12} className="text-brand" /> {display.view}
                                                            </span>
                                                        </div>

                                                        {/* Features */}
                                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                                            {display.features.map(f => (
                                                                <span key={f} className="text-[11px] text-gray-500 bg-sand/60 px-2 py-1 rounded-md flex items-center gap-1">
                                                                    <Check size={10} className="text-brand" /> {f}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Price & CTA */}
                                                    <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                                                        <div>
                                                            <div className="text-xs text-gray-400 mb-0.5">
                                                                {results.nights} gece toplam
                                                            </div>
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-3xl font-bold text-gray-900">₺{fmtPrice(room.totalPrice)}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                ≈ €{fmtPrice(room.totalPriceEur)} • Gecelik ₺{fmtPrice(room.avgPricePerNight)}
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() => setSelectedRoom(isSelected ? null : room)}
                                                            className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all whitespace-nowrap ${isSelected
                                                                ? 'bg-brand text-white shadow-lg shadow-brand/25'
                                                                : 'bg-brand/10 text-brand hover:bg-brand hover:text-white'
                                                                }`}
                                                        >
                                                            {isSelected ? '✓ Seçildi' : 'Rezerve Et'}
                                                            <ChevronRight size={16} className="inline ml-1 -mt-0.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* ─── Unavailable Rooms Toggle ─── */}
                        {unavailableRooms.length > 0 && (
                            <div className="mt-8">
                                <button
                                    onClick={() => setShowUnavailable(!showUnavailable)}
                                    className="flex items-center gap-2 mx-auto px-5 py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-50"
                                >
                                    {showUnavailable ? <EyeOff size={16} /> : <Eye size={16} />}
                                    {showUnavailable
                                        ? 'Müsait olmayan odaları gizle'
                                        : `Müsait olmayan odaları göster (${unavailableRooms.length})`
                                    }
                                    <ChevronDown size={14} className={`transition-transform ${showUnavailable ? 'rotate-180' : ''}`} />
                                </button>

                                {showUnavailable && (
                                    <div className="grid gap-4 mt-4">
                                        {unavailableRooms.map(room => {
                                            const display = getDisplayInfo(room.roomType)
                                            return (
                                                <div key={room.roomTypeId} className="bg-white/60 rounded-2xl border border-gray-200 overflow-hidden opacity-50 grayscale-[30%]">
                                                    <div className="flex flex-col md:flex-row">
                                                        <div className="md:w-[38%] relative h-48 md:h-auto overflow-hidden">
                                                            <img src={display.image} alt={display.title} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                                            <div className="absolute bottom-4 left-4">
                                                                <h3 className="text-xl font-serif text-white">{display.title}</h3>
                                                            </div>
                                                        </div>
                                                        <div className="p-5 flex-1 flex items-center justify-between">
                                                            <div className="flex flex-wrap gap-2">
                                                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{display.size}</span>
                                                                <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">{display.capacity}</span>
                                                            </div>
                                                            <span className="px-4 py-2 bg-red-50 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl">
                                                                Müsait Değil
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── Booking Form ─── */}
                {selectedRoom && !bookingResult && (
                    <div className="max-w-5xl mx-auto mt-10">
                        <div className="bg-white rounded-2xl shadow-2xl border-2 border-brand/20 p-6 md:p-8">
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
                                            type="text" value={guestName} onChange={e => setGuestName(e.target.value)}
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
                                            type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
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
                                            type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
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
                                            value={notes} onChange={e => setNotes(e.target.value)}
                                            placeholder="Özel istekleriniz..."
                                            rows={1}
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl text-gray-800 font-medium focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

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
                    </div>
                )}

                {/* ─── Booking Result ─── */}
                {bookingResult && (
                    <div className="max-w-5xl mx-auto mt-10">
                        <div className={`rounded-2xl p-10 text-center ${bookingResult.success ? 'bg-emerald-50 border-2 border-emerald-200' : 'bg-red-50 border-2 border-red-200'}`}>
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
                                    onClick={() => { setBookingResult(null); setSelectedRoom(null); setResults(null); searchAvailability() }}
                                    className="px-6 py-2.5 bg-white border-2 border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:border-brand hover:text-brand transition-all"
                                >
                                    Yeni Arama Yap
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
