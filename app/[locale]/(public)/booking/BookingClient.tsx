'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, Users, Search, Loader2, ChevronRight, Star, Check, Phone, Mail, User, Globe, MessageSquare, ArrowLeft, BedDouble, Maximize, Baby, CreditCard, Shield, Clock, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import AdvancedBookingCalendar from './AdvancedBookingCalendar'

type RoomResult = {
    roomType: string
    roomTypeId: number
    displayName: string
    displayNameEn: string
    image: string
    size: string
    capacity: number
    features: string[]
    available: number
    totalPrice: number
    avgNightlyRate: number
    currency: string
    nights: number
}

type AvailabilityResponse = {
    checkIn: string
    checkOut: string
    nights: number
    adults: number
    currency: string
    rooms: RoomResult[]
    source: string
}

const ROOM_IMAGES: Record<string, string> = {
    'Club Room': 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-2.jpg',
    'Club Room Sea View': 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-2.jpg',
    'Club Family Room': 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Club-Room-1.jpg',
    'Deluxe Room': 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg',
    'Deluxe Family Room': 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Club-Room-1.jpg',
}

const t: Record<string, Record<string, string>> = {
    title: { tr: 'Rezervasyon', en: 'Book Your Stay', de: 'Reservierung', ru: 'Бронирование' },
    subtitle: { tr: 'En iyi fiyatlarla doğrudan rezervasyon yapın', en: 'Book directly for the best rates', de: 'Buchen Sie direkt zum besten Preis', ru: 'Бронируйте напрямую по лучшим ценам' },
    checkIn: { tr: 'Giriş Tarihi', en: 'Check-in', de: 'Anreise', ru: 'Заезд' },
    checkOut: { tr: 'Çıkış Tarihi', en: 'Check-out', de: 'Abreise', ru: 'Выезд' },
    guests: { tr: 'Misafir', en: 'Guests', de: 'Gäste', ru: 'Гости' },
    adults: { tr: 'Yetişkin', en: 'Adults', de: 'Erwachsene', ru: 'Взрослые' },
    children: { tr: 'Çocuk', en: 'Children', de: 'Kinder', ru: 'Дети' },
    search: { tr: 'Müsaitlik Ara', en: 'Search Availability', de: 'Verfügbarkeit suchen', ru: 'Проверить наличие' },
    searching: { tr: 'Aranıyor...', en: 'Searching...', de: 'Suche...', ru: 'Поиск...' },
    perNight: { tr: 'gece başına', en: 'per night', de: 'pro Nacht', ru: 'за ночь' },
    total: { tr: 'Toplam', en: 'Total', de: 'Gesamt', ru: 'Итого' },
    nights: { tr: 'gece', en: 'nights', de: 'Nächte', ru: 'ночей' },
    available: { tr: 'müsait', en: 'available', de: 'verfügbar', ru: 'доступно' },
    selectRoom: { tr: 'Seç', en: 'Select', de: 'Wählen', ru: 'Выбрать' },
    noRooms: { tr: 'Seçilen tarihlerde müsait oda bulunamadı.', en: 'No rooms available for selected dates.', de: 'Keine Zimmer verfügbar.', ru: 'Нет свободных номеров.' },
    tryDifferent: { tr: 'Lütfen farklı tarihler deneyin.', en: 'Please try different dates.', de: 'Bitte andere Daten.', ru: 'Попробуйте другие даты.' },
    bookNow: { tr: 'Rezervasyon Yap', en: 'Book Now', de: 'Jetzt buchen', ru: 'Забронировать' },
    guestInfo: { tr: 'Misafir Bilgileri', en: 'Guest Information', de: 'Gästedaten', ru: 'Данные гостя' },
    name: { tr: 'Ad', en: 'First Name', de: 'Vorname', ru: 'Имя' },
    surname: { tr: 'Soyad', en: 'Last Name', de: 'Nachname', ru: 'Фамилия' },
    email: { tr: 'E-posta', en: 'Email', de: 'E-Mail', ru: 'Электронная почта' },
    phone: { tr: 'Telefon', en: 'Phone', de: 'Telefon', ru: 'Телефон' },
    country: { tr: 'Uyruk', en: 'Country', de: 'Nationalität', ru: 'Гражданство' },
    specialReqs: { tr: 'Özel İstekler', en: 'Special Requests', de: 'Sonderwünsche', ru: 'Особые пожелания' },
    submit: { tr: 'Rezervasyonu Gönder', en: 'Submit Reservation', de: 'Reservierung absenden', ru: 'Отправить бронирование' },
    submitting: { tr: 'Gönderiliyor...', en: 'Submitting...', de: 'Wird gesendet...', ru: 'Отправка...' },
    success: { tr: 'Rezervasyon talebiniz alındı!', en: 'Reservation request received!', de: 'Reservierungsanfrage erhalten!', ru: 'Запрос на бронирование получен!' },
    successMsg: { tr: 'Ekibimiz en kısa sürede sizinle iletişime geçecektir.', en: 'Our team will contact you shortly.', de: 'Unser Team wird Sie kontaktieren.', ru: 'Наша команда свяжется с вами.' },
    back: { tr: 'Geri', en: 'Back', de: 'Zurück', ru: 'Назад' },
    allInclusive: { tr: 'Her Şey Dahil', en: 'All Inclusive', de: 'All Inclusive', ru: 'Всё включено' },
    bestPrice: { tr: 'En İyi Fiyat Garantisi', en: 'Best Price Guarantee', de: 'Bestpreisgarantie', ru: 'Гарантия лучшей цены' },
    freeCancellation: { tr: 'Ücretsiz İptal', en: 'Free Cancellation', de: 'Kostenlose Stornierung', ru: 'Бесплатная отмена' },
    instantConfirmation: { tr: 'Anında Onay', en: 'Instant Confirmation', de: 'Sofortige Bestätigung', ru: 'Мгновенное подтверждение' },
    kvkkConsent: { tr: 'Kişisel verilerimin işlenmesini kabul ediyorum.', en: 'I consent to the processing of my personal data.', de: 'Ich stimme der Verarbeitung meiner Daten zu.', ru: 'Я согласен на обработку данных.' },
    room: { tr: 'oda', en: 'room', de: 'Zimmer', ru: 'номер' },
}

const g = (key: string, locale: string) => t[key]?.[locale] || t[key]?.['en'] || key

export default function BookingClient({ locale }: { locale: string }) {
    const getDefaultDates = () => {
        const today = new Date()
        const checkIn = new Date(today)
        checkIn.setDate(today.getDate() + 1)
        const checkOut = new Date(checkIn)
        checkOut.setDate(checkIn.getDate() + 3)
        return {
            checkIn: checkIn.toISOString().split('T')[0],
            checkOut: checkOut.toISOString().split('T')[0]
        }
    }

    const defaults = getDefaultDates()
    const [checkIn, setCheckIn] = useState(defaults.checkIn)
    const [checkOut, setCheckOut] = useState(defaults.checkOut)
    const [adults, setAdults] = useState(2)
    const [children, setChildren] = useState(0)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<AvailabilityResponse | null>(null)
    const [selectedRoom, setSelectedRoom] = useState<RoomResult | null>(null)
    const [step, setStep] = useState<'search' | 'results' | 'form' | 'payment' | 'success'>('search')

    // Form state
    const [guestName, setGuestName] = useState('')
    const [guestSurname, setGuestSurname] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [guestPhone, setGuestPhone] = useState('')
    const [guestNationality, setGuestNationality] = useState('TR')
    const [specialRequests, setSpecialRequests] = useState('')
    const [kvkkConsent, setKvkkConsent] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [countries, setCountries] = useState<{ id: number; name: string }[]>([])

    // Payment state
    const [cardNumber, setCardNumber] = useState('')
    const [cardName, setCardName] = useState('')
    const [expMonth, setExpMonth] = useState('01')
    const [expYear, setExpYear] = useState('25')
    const [cvv, setCvv] = useState('')
    const [showCalendar, setShowCalendar] = useState(false)
    const [installment, setInstallment] = useState(1)
    const [cardProgram, setCardProgram] = useState('none') // 'none' | 'maximum' | 'bonus' | 'world'

    // Form action target for 3D Secure
    const [formHtml, setFormHtml] = useState('')

    // Read URL params on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('arrival')) setCheckIn(params.get('arrival')!)
        if (params.get('departure')) setCheckOut(params.get('departure')!)
        if (params.get('adults')) setAdults(parseInt(params.get('adults')!) || 2)
        if (params.get('checkIn')) setCheckIn(params.get('checkIn')!)
        if (params.get('checkOut')) setCheckOut(params.get('checkOut')!)

        // Auto-search if dates provided via URL
        if (params.get('arrival') || params.get('checkIn')) {
            setTimeout(() => searchAvailability(), 500)
        }

        // Fetch countries from Elektra
        fetch('/api/booking/countries')
            .then(r => r.json())
            .then(d => { if (d.countries?.length) setCountries(d.countries) })
            .catch(() => { })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const searchAvailability = useCallback(async () => {
        setLoading(true)
        setResults(null)
        try {
            const res = await fetch(`/api/booking?checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}&currency=EUR`)
            if (res.ok) {
                const data = await res.json()
                setResults(data)
                setStep('results')
            }
        } catch (err) {
            console.error('Search error:', err)
        } finally {
            setLoading(false)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkIn, checkOut, adults])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRoom || !kvkkConsent) return
        setStep('payment')
    }

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRoom) return
        setSubmitting(true)
        try {
            const res = await fetch('/api/booking/checkout/direct', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    checkIn, checkOut,
                    roomType: selectedRoom.roomType,
                    roomTypeId: selectedRoom.roomTypeId,
                    adults, children,
                    currency: selectedRoom.currency,
                    totalPrice: selectedRoom.totalPrice,
                    guestName, guestSurname, guestEmail, guestPhone, guestNationality, specialRequests,
                    cardInfo: { cardNumber: cardNumber.replace(/\s/g, ''), cardName, expMonth, expYear, cvv, installment, cardProgram }
                })
            })
            if (res.ok) {
                const data = await res.json()
                if (data.success && data.htmlContent) {
                    setFormHtml(data.htmlContent) // Trigger 3D Secure form render which auto-submits
                } else if (data.success && data.reservationId) {
                    setStep('success') // Non-3D success fallback
                } else {
                    alert(data.error || 'Payment initialization failed')
                }
            } else {
                const data = await res.json()
                alert(data.error || 'Payment initialization failed')
            }
        } catch (err) {
            console.error('Submit error:', err)
        } finally {
            setSubmitting(false)
        }
    }

    // Effect to run the 3D secure form script when HTML is received
    useEffect(() => {
        if (formHtml) {
            const scriptMatch = formHtml.match(/<script>([\s\S]*?)<\/script>/)
            if (scriptMatch && scriptMatch[1]) {
                setTimeout(() => {
                    eval(scriptMatch[1])
                }, 100)
            }
        }
    }, [formHtml])

    const currencySymbol = (c: string) => c === 'EUR' ? '€' : c === 'USD' ? '$' : '₺'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950">
            {/* Hero Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-2.jpg')] bg-cover bg-center opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950" />
                <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-12 text-center">
                    <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-8 transition-colors">
                        <ArrowLeft size={16} /> Blue Dreams Resort
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">{g('title', locale)}</h1>
                    <p className="text-blue-200/70 text-lg">{g('subtitle', locale)}</p>

                    {/* Trust badges */}
                    <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-blue-200/50">
                        <span className="flex items-center gap-2"><Star size={14} className="text-amber-400" /> {g('bestPrice', locale)}</span>
                        <span className="flex items-center gap-2"><Shield size={14} className="text-green-400" /> {g('freeCancellation', locale)}</span>
                        <span className="flex items-center gap-2"><Clock size={14} className="text-blue-400" /> {g('instantConfirmation', locale)}</span>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="max-w-5xl mx-auto px-4 -mt-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">{g('checkIn', locale)}</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">{g('checkOut', locale)}</label>
                            <div className="relative">
                                <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                                    className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
                            </div>
                        </div>
                        <div className="md:col-span-3 lg:col-span-5 pt-2 flex justify-start">
                            <button
                                onClick={() => setShowCalendar(true)}
                                className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors text-sm font-medium px-4 py-2 border border-blue-400/30 rounded-full hover:bg-blue-500/20"
                            >
                                <CalendarDays size={16} /> Gelişmiş Takvimi Görüntüle (İndirimler)
                            </button>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">{g('adults', locale)}</label>
                            <div className="relative">
                                <Users size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                                <select value={adults} onChange={e => setAdults(parseInt(e.target.value))}
                                    className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                                    {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n} className="bg-slate-800">{n}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">{g('children', locale)}</label>
                            <div className="relative">
                                <Baby size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
                                <select value={children} onChange={e => setChildren(parseInt(e.target.value))}
                                    className="w-full pl-10 pr-3 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                                    {[0, 1, 2, 3, 4].map(n => <option key={n} value={n} className="bg-slate-800">{n}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex items-end">
                            <button onClick={searchAvailability} disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50">
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                                {loading ? g('searching', locale) : g('search', locale)}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-5xl mx-auto px-4 py-12">
                {step === 'results' && results && (
                    <div className="space-y-6">
                        {results.rooms.length > 0 ? (
                            <>
                                <div className="text-center mb-8">
                                    <p className="text-blue-200/60 text-sm">
                                        {results.rooms.length} {g('room', locale)} • {results.nights} {g('nights', locale)} • {g('allInclusive', locale)}
                                    </p>
                                </div>
                                {results.rooms.map((room, i) => (
                                    <div key={room.roomType}
                                        className="group bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 hover:border-blue-400/30 transition-all duration-300">
                                        <div className="flex flex-col md:flex-row">
                                            {/* Room Image */}
                                            <div className="md:w-72 h-48 md:h-auto relative overflow-hidden">
                                                <img src={ROOM_IMAGES[room.roomType] || ROOM_IMAGES['Club Room']}
                                                    alt={room.displayName}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">
                                                    {g('allInclusive', locale)}
                                                </div>
                                            </div>

                                            {/* Room Details */}
                                            <div className="flex-1 p-6 flex flex-col justify-between">
                                                <div>
                                                    <h3 className="text-xl font-bold text-white mb-2">{locale === 'tr' ? room.displayName : room.displayNameEn}</h3>
                                                    <div className="flex flex-wrap gap-3 text-xs text-blue-200/60 mb-4">
                                                        <span className="flex items-center gap-1"><Maximize size={12} /> {room.size}</span>
                                                        <span className="flex items-center gap-1"><Users size={12} /> {room.capacity} {g('guests', locale)}</span>
                                                        <span className="flex items-center gap-1"><BedDouble size={12} /> {room.available} {g('available', locale)}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {room.features.map(f => (
                                                            <span key={f} className="text-xs bg-blue-500/10 text-blue-300 px-2 py-1 rounded-md flex items-center gap-1">
                                                                <Check size={10} /> {f}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex items-end justify-between mt-6 pt-4 border-t border-white/10">
                                                    <div>
                                                        <div className="text-blue-200/50 text-xs">{currencySymbol(room.currency)}{room.avgNightlyRate.toFixed(0)} / {g('perNight', locale)}</div>
                                                        <div className="text-2xl font-bold text-white">
                                                            {currencySymbol(room.currency)}{room.totalPrice.toFixed(0)}
                                                            <span className="text-sm font-normal text-blue-200/50 ml-2">{g('total', locale)} · {room.nights} {g('nights', locale)}</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => { setSelectedRoom(room); setStep('form'); }}
                                                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25">
                                                        {g('selectRoom', locale)} <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : (
                            <div className="text-center py-16">
                                <div className="text-6xl mb-4">🔍</div>
                                <p className="text-white text-xl font-bold mb-2">{g('noRooms', locale)}</p>
                                <p className="text-blue-200/50">{g('tryDifferent', locale)}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Guest Form */}
                {step === 'form' && selectedRoom && (
                    <div className="max-w-2xl mx-auto">
                        <button onClick={() => setStep('results')} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-6 transition-colors">
                            <ArrowLeft size={16} /> {g('back', locale)}
                        </button>

                        {/* Selected Room Summary */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-white font-bold">{locale === 'tr' ? selectedRoom.displayName : selectedRoom.displayNameEn}</h3>
                                    <p className="text-blue-200/50 text-sm">{checkIn} → {checkOut} · {selectedRoom.nights} {g('nights', locale)} · {g('allInclusive', locale)}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-white">{currencySymbol(selectedRoom.currency)}{selectedRoom.totalPrice.toFixed(0)}</div>
                                    <div className="text-xs text-blue-200/50">{g('total', locale)}</div>
                                </div>
                            </div>
                        </div>

                        {/* Guest Info Form */}
                        <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><User size={20} /> {g('guestInfo', locale)}</h2>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1">{g('name', locale)} *</label>
                                    <input type="text" required value={guestName} onChange={e => setGuestName(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 placeholder-white/30"
                                        placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1">{g('surname', locale)} *</label>
                                    <input type="text" required value={guestSurname} onChange={e => setGuestSurname(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 placeholder-white/30"
                                        placeholder="Doe" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1 flex items-center gap-1"><Mail size={12} /> {g('email', locale)} *</label>
                                <input type="email" required value={guestEmail} onChange={e => setGuestEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 placeholder-white/30"
                                    placeholder="john@example.com" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1 flex items-center gap-1"><Phone size={12} /> {g('phone', locale)} *</label>
                                    <input type="tel" required value={guestPhone} onChange={e => setGuestPhone(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 placeholder-white/30"
                                        placeholder="+90 5XX XXX XX XX" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1 flex items-center gap-1"><Globe size={12} /> {g('country', locale)}</label>
                                    <select value={guestNationality} onChange={e => setGuestNationality(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                                        {countries.length > 0 ? (
                                            countries.map(c => (
                                                <option key={c.id} value={c.name} className="bg-slate-800">{c.name}</option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="TR" className="bg-slate-800">Türkiye</option>
                                                <option value="DE" className="bg-slate-800">Deutschland</option>
                                                <option value="RU" className="bg-slate-800">Россия</option>
                                                <option value="GB" className="bg-slate-800">United Kingdom</option>
                                                <option value="NL" className="bg-slate-800">Nederland</option>
                                                <option value="FR" className="bg-slate-800">France</option>
                                                <option value="OTHER" className="bg-slate-800">Other</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1 flex items-center gap-1"><MessageSquare size={12} /> {g('specialReqs', locale)}</label>
                                <textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} rows={3}
                                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 placeholder-white/30 resize-none"
                                    placeholder="..." />
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input type="checkbox" checked={kvkkConsent} onChange={e => setKvkkConsent(e.target.checked)}
                                    className="mt-1 w-4 h-4 rounded border-white/30 bg-white/10 text-blue-500 focus:ring-blue-400/50" />
                                <span className="text-xs text-blue-200/50 group-hover:text-blue-200/70 transition-colors">{g('kvkkConsent', locale)}</span>
                            </label>

                            <button type="submit" disabled={!kvkkConsent}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50 text-lg">
                                <ChevronRight size={20} />
                                {g('submit', locale)} (Adım 1/2)
                            </button>
                        </form>
                    </div>
                )}

                {/* Payment Form */}
                {step === 'payment' && selectedRoom && (
                    <div className="max-w-2xl mx-auto">
                        <button onClick={() => setStep('form')} className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm mb-6 transition-colors">
                            <ArrowLeft size={16} /> Geri Dön
                        </button>

                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 mb-6">
                            <div className="flex justify-between items-center text-white">
                                <div><h3 className="font-bold">Ödeme Toplamı</h3></div>
                                <div className="text-2xl font-bold">{currencySymbol(selectedRoom.currency)}{selectedRoom.totalPrice.toFixed(0)}</div>
                            </div>
                        </div>

                        <form onSubmit={handlePaymentSubmit} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 space-y-5">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><CreditCard size={20} /> Kart Bilgileri</h2>

                            <div>
                                <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1">Kart Üzerindeki İsim</label>
                                <input type="text" required value={cardName} onChange={e => setCardName(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1">Kart Numarası</label>
                                <input type="text" required value={cardNumber} onChange={e => setCardNumber(e.target.value)} maxLength={19} placeholder="XXXX XXXX XXXX XXXX"
                                    className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1">Ay</label>
                                    <select value={expMonth} onChange={e => setExpMonth(e.target.value)} className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                                        {[...Array(12)].map((_, i) => { const v = (i + 1).toString().padStart(2, '0'); return <option key={v} value={v} className="bg-slate-800">{v}</option> })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1">Yıl</label>
                                    <select value={expYear} onChange={e => setExpYear(e.target.value)} className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50">
                                        {[...Array(15)].map((_, i) => { const v = (new Date().getFullYear() % 100 + i).toString(); return <option key={v} value={v} className="bg-slate-800">20{v}</option> })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-1">CVV</label>
                                    <input type="text" required value={cvv} onChange={e => setCvv(e.target.value)} maxLength={4}
                                        className="w-full px-4 py-3 bg-slate-900/50 border border-white/20 rounded-lg text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-400/50" />
                                </div>
                            </div>

                            <hr className="border-white/10 my-4" />

                            <div>
                                <label className="block text-xs font-bold text-blue-200/70 uppercase tracking-wider mb-2">Taksit ve Kart Programı</label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                        <input type="radio" name="installment" checked={installment === 1} onChange={() => { setInstallment(1); setCardProgram('none') }} className="text-blue-500 w-4 h-4 focus:ring-blue-500" />
                                        <span className="text-white flex-1">Tek Çekim (Yurtiçi / Yurtdışı)</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                        <input type="radio" name="installment" checked={installment === 3 && cardProgram === 'maximum'} onChange={() => { setInstallment(3); setCardProgram('maximum') }} className="text-blue-500 w-4 h-4 focus:ring-blue-500" />
                                        <span className="text-white flex-1">3 Taksit (Maximum / İş Bankası)</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                        <input type="radio" name="installment" checked={installment === 6 && cardProgram === 'maximum'} onChange={() => { setInstallment(6); setCardProgram('maximum') }} className="text-blue-500 w-4 h-4 focus:ring-blue-500" />
                                        <span className="text-white flex-1">6 Taksit (Maximum / İş Bankası)</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                        <input type="radio" name="installment" checked={installment === 3 && cardProgram === 'bonus'} onChange={() => { setInstallment(3); setCardProgram('bonus') }} className="text-blue-500 w-4 h-4 focus:ring-blue-500" />
                                        <span className="text-white flex-1">3 Taksit (Bonus / Denizbank)</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                        <input type="radio" name="installment" checked={installment === 6 && cardProgram === 'bonus'} onChange={() => { setInstallment(6); setCardProgram('bonus') }} className="text-blue-500 w-4 h-4 focus:ring-blue-500" />
                                        <span className="text-white flex-1">6 Taksit (Bonus / Denizbank)</span>
                                    </label>
                                    <label className="flex items-center gap-3 p-3 rounded-lg border border-white/20 bg-white/5 cursor-pointer hover:bg-white/10 transition-colors">
                                        <input type="radio" name="installment" checked={installment === 3 && cardProgram === 'world'} onChange={() => { setInstallment(3); setCardProgram('world') }} className="text-blue-500 w-4 h-4 focus:ring-blue-500" />
                                        <span className="text-white flex-1">3 Taksit (World / Yapı Kredi)</span>
                                    </label>
                                </div>
                            </div>

                            <button type="submit" disabled={submitting}
                                className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 text-lg">
                                {submitting ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
                                {submitting ? 'Ödeme Başlatılıyor...' : 'Güvenli Ödeme Yap (3D Secure)'}
                            </button>
                        </form>
                    </div>
                )}

                {/* 3D Secure Hidden Form Container */}
                <div id="3d-secure-container" dangerouslySetInnerHTML={{ __html: formHtml }} className="hidden"></div>

                {/* Success */}
                {step === 'success' && (
                    <div className="max-w-lg mx-auto text-center py-16">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check size={40} className="text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">{g('success', locale)}</h2>
                        <p className="text-blue-200/60 text-lg mb-8">{g('successMsg', locale)}</p>
                        <Link href={`/${locale}`}
                            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg transition-colors">
                            <ArrowLeft size={16} /> Blue Dreams Resort
                        </Link>
                    </div>
                )}
            </div>
            {/* Advanced Calendar Modal */}
            {showCalendar && (
                <AdvancedBookingCalendar
                    currency="EUR" // Fallback or dynamic based on active state
                    onClose={() => setShowCalendar(false)}
                    onSelectDate={(newCheckIn, newCheckOut) => {
                        setCheckIn(newCheckIn)
                        setCheckOut(newCheckOut)
                        setShowCalendar(false)
                        // Trigger search automatically
                        setTimeout(() => searchAvailability(), 100)
                    }}
                />
            )}
        </div>
    )
}
