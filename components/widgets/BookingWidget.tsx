'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, ChevronDown, Check, CreditCard, Shield, Clock, ArrowRight, Star, X, MapPin, Loader2, Sparkles, CheckCircle, TrendingDown, Search, Phone, Facebook, Instagram, Youtube } from 'lucide-react'
import { usePathname } from 'next/navigation'

const WhatsAppIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
)

interface RoomResult {
    roomType: string
    roomTypeId: number
    isAvailable: boolean
    totalPrice: number
    totalPriceEur: number
    avgPricePerNight: number
    avgPricePerNightEur: number
    nights: number
    minPrice: number
    maxPrice: number
}

interface AlternativeDate {
    checkIn: string
    checkOut: string
    nights: number
    shift: number
    cheapestRoom: string
    totalPrice: number
    totalPriceEur: number
    avgPerNight: number
    avgPerNightEur: number
    savings: number
    savingsAmount: number
}

const ROOM_INFO: Record<string, { image: string, size: string, capacity: number, features: string[] }> = {
    'Deluxe Room': {
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg',
        size: '25-28m²',
        capacity: 2,
        features: ['Deniz veya Bahçe Manzarası', 'Balkon', 'Minibar', 'Duşakabin', 'LED TV']
    },
    'Club Family Room': {
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Family-Room-1.jpg',
        size: '35m²',
        capacity: 4,
        features: ['2 Yatak Odası', 'Deniz veya Bahçe Manzarası', 'Balkon', 'Minibar', 'Çocuklara Özel Alan']
    },
    'Deluxe Family Room': {
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Family-Room-1.jpg',
        size: '40m²',
        capacity: 4,
        features: ['Geniş Çift Yatak Odası', 'Deniz Manzarası', 'Geniş Balkon', 'Premium Set', 'Çift Minibar']
    },
    'Club Room': {
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-1.jpg',
        size: '20-22m²',
        capacity: 2,
        features: ['Bahçe Manzarası', 'Balkon', 'Minibar', 'Duşakabin', 'Rahat Tasarım']
    },
    'Superior Room': {
        image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg',
        size: '30m²',
        capacity: 3,
        features: ['Panoramik Deniz Manzarası', 'Geniş Teras', 'Özel İkramlar', 'Premium Banyo', 'Jakuzi Seçeneği']
    },
}

export default function BookingWidget({ inline = false }: { inline?: boolean }) {
    const [isVisible, setIsVisible] = useState(inline ? true : false)
    const [showResults, setShowResults] = useState(false)
    const [loading, setLoading] = useState(false)
    const [results, setResults] = useState<RoomResult[]>([])
    const [alternatives, setAlternatives] = useState<AlternativeDate[]>([])
    const [error, setError] = useState<string | null>(null)
    const pathname = usePathname()
    const locale = pathname?.split('/')[1] || 'tr'

    const getToday = () => new Date().toISOString().split('T')[0]
    const getNextDay = (dateStr: string) => {
        const date = new Date(dateStr)
        date.setDate(date.getDate() + 1)
        return date.toISOString().split('T')[0]
    }

    const [checkIn, setCheckIn] = useState(getToday())
    const [checkOut, setCheckOut] = useState(getNextDay(getToday()))
    const [guests, setGuests] = useState('2')
    const [kids, setKids] = useState('0')

    const handleCheckInChange = (newCheckIn: string) => {
        setCheckIn(newCheckIn)
        if (checkOut <= newCheckIn) setCheckOut(getNextDay(newCheckIn))
    }

    const handleCheckOutChange = (newCheckOut: string) => {
        if (newCheckOut > checkIn) setCheckOut(newCheckOut)
        else setCheckOut(getNextDay(checkIn))
    }

    useEffect(() => {
        if (inline) return
        const handleScroll = () => setIsVisible(window.scrollY > 100)
        handleScroll()
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [inline])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setShowResults(true)

        try {
            const params = new URLSearchParams({ checkIn, checkOut, adults: guests, children: kids })
            const res = await fetch(`/api/public/availability?${params}`)
            const data = await res.json()

            if (data.error) {
                setError(data.error)
                setResults([])
                setAlternatives([])
            } else {
                setResults(data.availability || [])
                setAlternatives(data.alternatives || [])
            }
        } catch {
            setError('Bağlantı hatası. Lütfen tekrar deneyin.')
        }
        setLoading(false)
    }

    const [selectedRoom, setSelectedRoom] = useState<RoomResult | null>(null)
    const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', notes: '' })
    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookingResult, setBookingResult] = useState<{ success: boolean; message: string; referenceId?: string } | null>(null)

    const handleBookDirect = (room: RoomResult) => {
        setSelectedRoom(room)
        setBookingResult(null)
    }

    const handleBookingSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRoom) return
        setBookingLoading(true)
        try {
            const res = await fetch('/api/public/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomTypeId: selectedRoom.roomTypeId,
                    roomType: selectedRoom.roomType,
                    checkIn,
                    checkOut,
                    adults: parseInt(guests),
                    children: parseInt(kids),
                    guestName: bookingForm.name,
                    guestEmail: bookingForm.email,
                    guestPhone: bookingForm.phone,
                    notes: bookingForm.notes,
                    totalPrice: selectedRoom.totalPrice,
                    currency: 'TRY'
                })
            })
            const data = await res.json()
            setBookingResult(data)
        } catch {
            setBookingResult({ success: false, message: 'Bağlantı hatası. Lütfen tekrar deneyin.' })
        }
        setBookingLoading(false)
    }

    const handleAlternativeSearch = (alt: AlternativeDate) => {
        setCheckIn(alt.checkIn)
        setCheckOut(alt.checkOut)
        // Trigger new search
        setTimeout(() => {
            const form = document.getElementById('booking-form') as HTMLFormElement
            form?.requestSubmit()
        }, 100)
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'short' })
    }

    const formatPrice = (price: number) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(price)
    const formatPriceEur = (price: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(price)

    const t = {
        tr: { checkin: 'Giriş', checkout: 'Çıkış', guest: 'Misafir', search: 'Müsaitlik Ara', book: 'Rezervasyon Yap', adults: 'Yetişkin', children: 'Çocuk', perNight: '/gece', total: 'Toplam', noRooms: 'Seçilen tarihlerde müsait oda bulunamadı.', altTitle: 'Alternatif Tarihler', save: 'tasarruf', bestPrice: 'En İyi Fiyat', roomFeatures: 'Oda Özellikleri' },
        en: { checkin: 'Check-in', checkout: 'Check-out', guest: 'Guests', search: 'Check Availability', book: 'Book Now', adults: 'Adults', children: 'Children', perNight: '/night', total: 'Total', noRooms: 'No rooms available for selected dates.', altTitle: 'Alternative Dates', save: 'save', bestPrice: 'Best Price', roomFeatures: 'Room Features' },
        de: { checkin: 'Anreise', checkout: 'Abreise', guest: 'Gäste', search: 'Verfügbarkeit', book: 'Jetzt Buchen', adults: 'Erwachsene', children: 'Kinder', perNight: '/Nacht', total: 'Gesamt', noRooms: 'Keine Zimmer verfügbar.', altTitle: 'Alternative Termine', save: 'sparen', bestPrice: 'Bester Preis', roomFeatures: 'Zimmerausstattung' },
        ru: { checkin: 'Заезд', checkout: 'Выезд', guest: 'Гости', search: 'Проверить', book: 'Забронировать', adults: 'Взрослых', children: 'дети', perNight: '/ночь', total: 'Итого', noRooms: 'Нет свободных номеров.', altTitle: 'Альтернативные даты', save: 'экономия', bestPrice: 'Лучшая цена', roomFeatures: 'Особенности номера' },
    }
    const texts = t[locale as keyof typeof t] || t.tr

    const socialIconClass = "transition-all p-1.5 border border-transparent hover:border-gray-200 hover:bg-gray-50 rounded-lg hover:-translate-y-0.5"
    const contactIconClass = "transition-all p-1.5 bg-gray-50 hover:bg-white border border-gray-200 rounded-lg hover:-translate-y-0.5 hover:shadow-sm"

    return (
        <>
            {/* Results Panel */}
            {showResults && (
                <div className={`${inline ? 'mt-4 border rounded-xl' : 'fixed bottom-[62px] md:bottom-[56px] left-0 right-0 z-[39] shadow-[0_-10px_40px_rgba(0,0,0,0.15)]'} bg-white/98 backdrop-blur-lg border-t border-gray-100 transition-all duration-500 max-h-[85vh] overflow-y-auto ${isVisible ? (inline ? 'opacity-100' : 'translate-y-0 opacity-100') : (inline ? 'hidden' : 'translate-y-full opacity-0')}`}>
                    <div className="container mx-auto px-4 py-6 max-w-6xl">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <Calendar size={20} className="text-brand" />
                                {formatDate(checkIn)} — {formatDate(checkOut)}
                                <span className="text-gray-400 font-normal">·</span>
                                <span className="font-normal text-gray-600">{guests} {texts.adults}{kids !== '0' ? `, ${kids} ${texts.children}` : ''}</span>
                            </h3>
                            <button onClick={() => setShowResults(false)} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"><X size={18} /></button>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-4 text-brand">
                                <Loader2 size={32} className="animate-spin" />
                                <span className="text-lg font-medium">{texts.search}...</span>
                            </div>
                        ) : error ? (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium my-8">
                                {error}
                            </div>
                        ) : (
                            <>
                                {/* Blue Concierge AI Summary */}
                                {results.filter(r => r.isAvailable).length > 0 && (
                                    <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-8 bg-white/20 blur-2xl rounded-full"></div>
                                        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-md z-10">
                                            <Sparkles size={24} />
                                        </div>
                                        <div className="z-10">
                                            <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
                                                Blue Concierge Analizi
                                                <span className="text-[10px] uppercase font-bold tracking-wider bg-white/50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">AI</span>
                                            </h4>
                                            <p className="text-sm text-indigo-800 leading-relaxed">
                                                {locale === 'tr' ? (
                                                    alternatives.length > 0 && alternatives[0].savings > 0
                                                        ? `Girdiğiniz tarihler ({${formatDate(checkIn)} - ${formatDate(checkOut)}}) için en uygun odamız **${results.find(r => r.isAvailable)?.roomType}** (${formatPrice(results.find(r => r.isAvailable)?.totalPrice || 0)}). Ancak, seyahatinizi **${formatDate(alternatives[0].checkIn)} - ${formatDate(alternatives[0].checkOut)}** aralığına kaydırırsanız, **%${alternatives[0].savings} tasarruf** (${formatPrice(alternatives[0].savingsAmount)}) edebilirsiniz!`
                                                        : `Girdiğiniz tarihler için **en iyi fiyat avantajı** şu an aktif. Seçimlerinize göre **${results.find(r => r.isAvailable)?.roomType}** en ideal konaklama deneyimini sunuyor. Lüks ve rahatlığın tadını çıkarın!`
                                                ) : (
                                                    alternatives.length > 0 && alternatives[0].savings > 0
                                                        ? `For your selected dates, the best option is **${results.find(r => r.isAvailable)?.roomType}**. However, you can save **${alternatives[0].savings}%** by shifting your stay to **${formatDate(alternatives[0].checkIn)} - ${formatDate(alternatives[0].checkOut)}**!`
                                                        : `You have found the **best available rate** for these dates. The **${results.find(r => r.isAvailable)?.roomType}** offers an ideal balance of luxury and comfort for your stay.`
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Room Results Grid with Images */}
                                {results.filter(r => r.isAvailable).length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-100 my-8">
                                        <p className="text-gray-500 mb-4">{texts.noRooms}</p>
                                        <button onClick={() => {
                                            if (alternatives.length > 0) handleAlternativeSearch(alternatives[0])
                                        }} className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors font-medium">
                                            {locale === 'tr' ? 'Alternatif Tarihleri Gör' : 'View Alternative Dates'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {results.filter(r => r.isAvailable).map((room, i) => {
                                            const info = ROOM_INFO[room.roomType] || {
                                                image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-1.jpg',
                                                size: '25m²',
                                                capacity: 2,
                                                features: ['Klima', 'Wi-Fi', 'Minibar']
                                            }

                                            return (
                                                <div key={i} className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group flex flex-col h-full relative">
                                                    {i === 0 && (
                                                        <div className="absolute top-4 left-4 z-10 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                                                            <Star size={12} fill="currentColor" /> {texts.bestPrice}
                                                        </div>
                                                    )}

                                                    {/* Room Image */}
                                                    <div className="relative h-56 overflow-hidden">
                                                        <div className="absolute inset-0 bg-gray-900/10 group-hover:bg-transparent transition-colors z-0"></div>
                                                        <img
                                                            src={info.image}
                                                            alt={room.roomType}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                        />
                                                    </div>

                                                    <div className="p-5 flex-1 flex flex-col">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-gray-900 text-lg leading-tight">{room.roomType}</h4>
                                                        </div>

                                                        {/* Room Meta */}
                                                        <div className="flex items-center gap-3 text-sm text-gray-600 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                                                            <span className="flex items-center gap-1.5"><Users size={16} className="text-brand" /> Max: {info.capacity}</span>
                                                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                            <span>{info.size}</span>
                                                        </div>

                                                        {/* Features List */}
                                                        <div className="mb-6 flex-1">
                                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{texts.roomFeatures}</p>
                                                            <ul className="grid grid-cols-2 gap-y-2 gap-x-1">
                                                                {info.features.slice(0, 4).map((feature, idx) => (
                                                                    <li key={idx} className="text-[11px] text-gray-600 flex items-start gap-1.5">
                                                                        <CheckCircle size={12} className="text-emerald-500 mt-0.5 shrink-0" />
                                                                        <span className="leading-tight">{feature}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>

                                                        {/* Pricing and CTA */}
                                                        <div className="pt-4 border-t border-gray-100 flex flex-col mt-auto pb-1">
                                                            <div className="flex justify-between items-end mb-4">
                                                                <div>
                                                                    <p className="text-xs text-gray-500">{room.nights} {locale === 'tr' ? 'gece' : 'nights'} toplamı</p>
                                                                    <p className="text-2xl font-bold text-gray-900">{formatPrice(room.totalPrice)}</p>
                                                                    <p className="text-sm font-medium text-gray-400">{formatPrice(room.avgPricePerNight)}<span className="text-xs font-normal">{texts.perNight}</span></p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="text-sm font-medium text-gray-400">{formatPriceEur(room.totalPriceEur)}</p>
                                                                    <p className="text-xs text-gray-400">{formatPriceEur(room.avgPricePerNightEur)}{texts.perNight}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleBookDirect(room)}
                                                                className="w-full py-3 bg-brand hover:bg-brand-dark text-white font-bold rounded-xl transition-all hover:-translate-y-1 shadow-[0_10px_20px_rgba(0,51,102,0.2)] active:scale-95 uppercase tracking-wide flex items-center justify-center gap-2"
                                                            >
                                                                {texts.book} <ArrowRight size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}

                                {/* Inline Booking Form */}
                                {selectedRoom && !bookingResult && (
                                    <div className="border-t border-gray-100 pt-4 mt-4">
                                        <div className="bg-brand/5 border border-brand/20 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-800 text-sm">{selectedRoom.roomType} — {locale === 'tr' ? 'Rezervasyon Bilgileri' : 'Reservation Details'}</h4>
                                                <button type="button" onClick={() => setSelectedRoom(null)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
                                            </div>
                                            <form onSubmit={handleBookingSubmit} className="space-y-3">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    <input
                                                        type="text" required placeholder={locale === 'tr' ? 'Ad Soyad *' : 'Full Name *'}
                                                        value={bookingForm.name} onChange={e => setBookingForm({ ...bookingForm, name: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
                                                    />
                                                    <input
                                                        type="tel" required placeholder={locale === 'tr' ? 'Telefon *' : 'Phone *'}
                                                        value={bookingForm.phone} onChange={e => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
                                                    />
                                                </div>
                                                <input
                                                    type="email" placeholder={locale === 'tr' ? 'E-posta' : 'Email'}
                                                    value={bookingForm.email} onChange={e => setBookingForm({ ...bookingForm, email: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
                                                />
                                                <textarea
                                                    placeholder={locale === 'tr' ? 'Not / Özel İstek' : 'Notes / Special Request'} rows={2}
                                                    value={bookingForm.notes} onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand resize-none"
                                                />
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-gray-500">{texts.total}: <strong className="text-gray-800">{formatPrice(selectedRoom.totalPrice)}</strong></p>
                                                    <button
                                                        type="submit" disabled={bookingLoading}
                                                        className="px-6 py-2.5 bg-brand hover:bg-brand-dark disabled:bg-gray-400 text-white text-xs font-bold rounded-lg transition-all shadow-md uppercase tracking-wide flex items-center gap-2"
                                                    >
                                                        {bookingLoading && <Loader2 size={14} className="animate-spin" />}
                                                        {locale === 'tr' ? 'Rezervasyonu Tamamla' : 'Complete Reservation'}
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}

                                {/* Booking Result */}
                                {bookingResult && (
                                    <div className={`border-t border-gray-100 pt-4 mt-4 text-center py-6 ${bookingResult.success ? 'text-emerald-600' : 'text-red-600'}`}>
                                        <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${bookingResult.success ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                            {bookingResult.success ? '✓' : '✗'}
                                        </div>
                                        <p className="font-bold text-sm mb-1">{bookingResult.success ? (locale === 'tr' ? 'Talebiniz Alındı!' : 'Request Received!') : (locale === 'tr' ? 'Hata' : 'Error')}</p>
                                        <p className="text-xs text-gray-500">{bookingResult.message}</p>
                                        {bookingResult.success && (
                                            <button type="button" onClick={() => { setBookingResult(null); setSelectedRoom(null); setShowResults(false) }} className="mt-3 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-lg transition-colors">
                                                {locale === 'tr' ? 'Tamam' : 'OK'}
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Alternative Dates */}
                                {alternatives.length > 0 && (
                                    <div className="border-t border-gray-100 pt-4">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <Sparkles size={14} className="text-indigo-500" />
                                            {texts.altTitle}
                                        </h4>
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {alternatives.slice(0, 5).map((alt, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    onClick={() => handleAlternativeSearch(alt)}
                                                    className={`flex-shrink-0 px-4 py-3 rounded-xl border text-left transition-all hover:shadow-md hover:-translate-y-0.5 ${alt.savings > 0
                                                        ? 'bg-emerald-50 border-emerald-200 hover:border-emerald-400'
                                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                                        }`}
                                                >
                                                    <p className="text-xs font-semibold text-gray-800">
                                                        {formatDate(alt.checkIn)} — {formatDate(alt.checkOut)}
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{formatPrice(alt.avgPerNight)}{texts.perNight}</p>
                                                    {alt.savings > 0 && (
                                                        <p className="text-[10px] font-bold text-emerald-600 mt-1 flex items-center gap-1">
                                                            <TrendingDown size={10} />
                                                            %{alt.savings} {texts.save} ({formatPrice(alt.savingsAmount)})
                                                        </p>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Booking Bar */}
            <div className={`${inline ? 'w-full' : `fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-[0_-5px_25px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-in-out border-t border-gray-100 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}`}>
                <div className="container mx-auto px-4 py-2 md:py-3">
                    <form id="booking-form" className="flex items-center justify-between md:justify-center gap-3 md:gap-4" onSubmit={handleSearch}>

                        {/* Mobile Layout */}
                        <div className="md:hidden flex flex-row items-center w-full gap-1.5 py-0.5">
                            <div className="flex flex-row flex-[2] bg-gray-50 rounded-lg p-1 border border-gray-200">
                                <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
                                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">{texts.checkin}</span>
                                    <input type="date" value={checkIn} min={getToday()} onChange={(e) => handleCheckInChange(e.target.value)} className="bg-transparent text-[10px] sm:text-[11px] font-bold text-gray-900 w-full outline-none p-0 text-center" />
                                </div>
                                <div className="w-px bg-gray-200 my-1 mx-0.5" />
                                <div className="flex-1 flex flex-col justify-center items-center overflow-hidden">
                                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">{texts.checkout}</span>
                                    <input type="date" value={checkOut} min={getNextDay(checkIn)} onChange={(e) => handleCheckOutChange(e.target.value)} className="bg-transparent text-[10px] sm:text-[11px] font-bold text-gray-900 w-full outline-none p-0 text-center" />
                                </div>
                            </div>

                            <div className="flex flex-col flex-[0.7] justify-center items-center bg-gray-50 rounded-lg p-1 border border-gray-200 relative">
                                <span className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter">{texts.guest}</span>
                                <div className="flex items-center gap-1">
                                    <Users size={10} className="text-brand shrink-0" />
                                    <select value={guests} onChange={(e) => setGuests(e.target.value)} className="bg-transparent text-[11px] font-bold text-gray-900 outline-none p-0 appearance-none text-center">
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="w-[42px] h-[36px] bg-brand text-white rounded-lg shadow-md flex items-center justify-center shrink-0 active:scale-95 transition-transform disabled:opacity-70">
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                            </button>
                        </div>

                        {/* Desktop Inputs */}
                        <div className="hidden md:flex items-center gap-3 w-full max-w-6xl justify-center">
                            <div className="w-40 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group relative">
                                <div className="flex items-center relative">
                                    <Calendar className="text-gray-400 group-hover:text-brand w-4 h-4 mr-3 transition-colors absolute left-2 pointer-events-none" />
                                    <div className="flex flex-col text-left pl-8 w-full">
                                        <label htmlFor="checkin" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">{texts.checkin}</label>
                                        <input type="date" id="checkin" value={checkIn} min={getToday()} onChange={(e) => handleCheckInChange(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-40 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group">
                                <div className="flex items-center relative">
                                    <Calendar className="text-gray-400 group-hover:text-brand w-4 h-4 mr-3 transition-colors absolute left-2 pointer-events-none" />
                                    <div className="flex flex-col text-left pl-8 w-full">
                                        <label htmlFor="checkout" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">{texts.checkout}</label>
                                        <input type="date" id="checkout" value={checkOut} min={getNextDay(checkIn)} onChange={(e) => handleCheckOutChange(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-24 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group">
                                <div className="flex items-center justify-between relative">
                                    <div className="flex items-center w-full">
                                        <Users className="text-gray-400 group-hover:text-brand w-4 h-4 mr-2 transition-colors absolute left-2 pointer-events-none" />
                                        <div className="flex flex-col text-left pl-7 w-full">
                                            <label htmlFor="adults" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">{texts.adults}</label>
                                            <select id="adults" value={guests} onChange={(e) => setGuests(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer appearance-none">
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                            </select>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1 pointer-events-none" />
                                </div>
                            </div>

                            <div className="w-24 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group">
                                <div className="flex items-center justify-between relative">
                                    <div className="flex items-center w-full">
                                        <div className="flex flex-col text-left pl-2 w-full">
                                            <label htmlFor="childrenCount" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">{texts.children}</label>
                                            <select id="childrenCount" value={kids} onChange={(e) => setKids(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer appearance-none">
                                                <option value="0">0</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                            </select>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1 pointer-events-none" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="bg-brand hover:bg-brand-dark text-white h-[42px] px-6 rounded-sm flex items-center justify-center text-xs font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 min-w-[160px] disabled:opacity-70">
                                {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                                {texts.search}
                                {!loading && <ArrowRight className="ml-2 w-3 h-3" />}
                            </button>

                            <div className="h-8 w-px bg-gray-200 mx-2" />
                            <div className="flex items-center gap-3">
                                <a href="https://wa.me/905495167803" target="_blank" rel="noreferrer" className={`${contactIconClass} text-[#25D366]`} title="WhatsApp"><WhatsAppIcon size={24} /></a>
                                <a href="tel:+902523371111" className={`${contactIconClass} text-gray-600`} title="Telefon"><Phone size={24} /></a>
                                <div className="w-px h-6 bg-gray-200 mx-1" />
                                <a href="https://www.facebook.com/BlueDreamsResortBodrum" target="_blank" rel="noreferrer" className={`${socialIconClass} text-[#1877F2]`}><Facebook size={24} /></a>
                                <a href="https://www.instagram.com/bluedreamsresort/" target="_blank" rel="noreferrer" className={`${socialIconClass} text-[#E1306C]`}><Instagram size={24} /></a>
                                <a href="https://www.youtube.com/@BlueDreamsResort" target="_blank" rel="noreferrer" className={`${socialIconClass} text-[#FF0000]`}><Youtube size={24} /></a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
