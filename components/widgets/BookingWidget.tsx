'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, ChevronDown, ArrowRight, Phone, Facebook, Instagram, Youtube, X, Loader2, TrendingDown, Star, Sparkles } from 'lucide-react'
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

export default function BookingWidget() {
    const [isVisible, setIsVisible] = useState(false)
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

    const handleCheckInChange = (newCheckIn: string) => {
        setCheckIn(newCheckIn)
        if (checkOut <= newCheckIn) setCheckOut(getNextDay(newCheckIn))
    }

    const handleCheckOutChange = (newCheckOut: string) => {
        if (newCheckOut > checkIn) setCheckOut(newCheckOut)
        else setCheckOut(getNextDay(checkIn))
    }

    useEffect(() => {
        const handleScroll = () => setIsVisible(window.scrollY > 100)
        handleScroll()
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setShowResults(true)

        try {
            const params = new URLSearchParams({ checkIn, checkOut, adults: guests })
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

    const handleBookDirect = (roomType: string) => {
        // Open WhatsApp with pre-filled message for direct booking
        const message = encodeURIComponent(
            `Merhaba, ${roomType} için ${checkIn} - ${checkOut} tarihleri arasında ${guests} kişilik rezervasyon yapmak istiyorum.`
        )
        window.open(`https://wa.me/902523371111?text=${message}`, '_blank')
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
        tr: { checkin: 'Giriş', checkout: 'Çıkış', guest: 'Misafir', search: 'Müsaitlik Ara', book: 'Rezervasyon Yap', adults: 'Yetişkin', perNight: '/gece', total: 'Toplam', noRooms: 'Seçilen tarihlerde müsait oda bulunamadı.', altTitle: 'Alternatif Tarihler', save: 'tasarruf', bestPrice: 'En İyi Fiyat' },
        en: { checkin: 'Check-in', checkout: 'Check-out', guest: 'Guests', search: 'Check Availability', book: 'Book Now', adults: 'Adults', perNight: '/night', total: 'Total', noRooms: 'No rooms available for selected dates.', altTitle: 'Alternative Dates', save: 'save', bestPrice: 'Best Price' },
        de: { checkin: 'Anreise', checkout: 'Abreise', guest: 'Gäste', search: 'Verfügbarkeit', book: 'Jetzt Buchen', adults: 'Erwachsene', perNight: '/Nacht', total: 'Gesamt', noRooms: 'Keine Zimmer verfügbar.', altTitle: 'Alternative Termine', save: 'sparen', bestPrice: 'Bester Preis' },
        ru: { checkin: 'Заезд', checkout: 'Выезд', guest: 'Гости', search: 'Проверить', book: 'Забронировать', adults: 'Взрослых', perNight: '/ночь', total: 'Итого', noRooms: 'Нет свободных номеров.', altTitle: 'Альтернативные даты', save: 'экономия', bestPrice: 'Лучшая цена' },
    }
    const texts = t[locale as keyof typeof t] || t.tr

    const socialIconClass = "text-gray-400 hover:text-brand transition-colors p-1.5 border border-transparent hover:border-gray-200 rounded-sm"
    const contactIconClass = "text-gray-500 hover:text-brand transition-colors p-1.5 bg-gray-50 hover:bg-white border border-gray-200 rounded-sm"

    return (
        <>
            {/* Results Panel */}
            {showResults && (
                <div className={`fixed bottom-[62px] md:bottom-[56px] left-0 right-0 z-[39] bg-white/98 backdrop-blur-lg border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-all duration-500 max-h-[60vh] overflow-y-auto ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <Calendar size={16} className="text-brand" />
                                {formatDate(checkIn)} — {formatDate(checkOut)} · {guests} {texts.adults}
                            </h3>
                            <button onClick={() => setShowResults(false)} className="p-1 text-gray-400 hover:text-gray-600"><X size={18} /></button>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-8 gap-3 text-gray-500">
                                <Loader2 size={20} className="animate-spin" />
                                <span className="text-sm">{texts.search}...</span>
                            </div>
                        ) : error ? (
                            <p className="text-sm text-red-500 py-4 text-center">{error}</p>
                        ) : (
                            <>
                                {/* Room Results */}
                                {results.filter(r => r.isAvailable).length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4 text-center">{texts.noRooms}</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                                        {results.filter(r => r.isAvailable).map((room, i) => (
                                            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-brand/30 hover:shadow-md transition-all group">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800 text-sm">{room.roomType}</h4>
                                                        <p className="text-xs text-gray-500 mt-0.5">{room.nights} {locale === 'tr' ? 'gece' : 'nights'}</p>
                                                    </div>
                                                    {i === 0 && (
                                                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                            <Star size={10} /> {texts.bestPrice}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-3 flex items-end justify-between">
                                                    <div>
                                                        <p className="text-lg font-bold text-gray-900">{formatPrice(room.avgPricePerNight)} <span className="text-xs font-normal text-gray-500">{texts.perNight}</span></p>
                                                        <p className="text-xs text-gray-400">{formatPriceEur(room.avgPricePerNightEur)}{texts.perNight} · {texts.total}: {formatPrice(room.totalPrice)}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleBookDirect(room.roomType)}
                                                        className="px-4 py-2 bg-brand hover:bg-brand-dark text-white text-xs font-bold rounded-lg transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg uppercase tracking-wide"
                                                    >
                                                        {texts.book}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
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
            <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-5px_25px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="container mx-auto px-4 py-2 md:py-3">
                    <form id="booking-form" className="flex items-center justify-between md:justify-center gap-3 md:gap-4" onSubmit={handleSearch}>

                        {/* Mobile Layout */}
                        <div className="md:hidden flex flex-col w-full gap-2 py-1">
                            <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 rounded-lg p-2 flex flex-col justify-center border border-gray-200">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">{texts.checkin}</span>
                                    <input type="date" value={checkIn} min={getToday()} onChange={(e) => handleCheckInChange(e.target.value)} className="bg-transparent text-xs font-bold text-gray-900 w-full outline-none p-0" />
                                </div>
                                <div className="flex-1 bg-gray-50 rounded-lg p-2 flex flex-col justify-center border border-gray-200">
                                    <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">{texts.checkout}</span>
                                    <input type="date" value={checkOut} min={getNextDay(checkIn)} onChange={(e) => handleCheckOutChange(e.target.value)} className="bg-transparent text-xs font-bold text-gray-900 w-full outline-none p-0" />
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="bg-brand text-white h-[40px] w-full text-xs font-bold tracking-widest uppercase rounded-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70">
                                {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                                {loading ? '...' : texts.search}
                                {!loading && <ArrowRight size={14} />}
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

                            <div className="w-32 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group">
                                <div className="flex items-center justify-between relative">
                                    <div className="flex items-center w-full">
                                        <Users className="text-gray-400 group-hover:text-brand w-4 h-4 mr-3 transition-colors absolute left-2 pointer-events-none" />
                                        <div className="flex flex-col text-left pl-8 w-full">
                                            <label htmlFor="guests" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">{texts.guest}</label>
                                            <select id="guests" value={guests} onChange={(e) => setGuests(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer appearance-none">
                                                <option value="1">1 {texts.adults}</option>
                                                <option value="2">2 {texts.adults}</option>
                                                <option value="3">3 {texts.adults}</option>
                                                <option value="4">4 {texts.adults}</option>
                                            </select>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 pointer-events-none" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading} className="bg-brand hover:bg-brand-dark text-white h-[42px] px-6 rounded-sm flex items-center justify-center text-xs font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 min-w-[160px] disabled:opacity-70">
                                {loading ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                                {texts.search}
                                {!loading && <ArrowRight className="ml-2 w-3 h-3" />}
                            </button>

                            <div className="h-8 w-px bg-gray-200 mx-2" />
                            <div className="flex items-center gap-2">
                                <a href="https://wa.me/902523371111" target="_blank" rel="noreferrer" className={`${contactIconClass} hover:text-[#25D366]`} title="WhatsApp"><WhatsAppIcon size={16} /></a>
                                <a href="tel:+902523371111" className={contactIconClass} title="Telefon"><Phone size={16} /></a>
                                <div className="w-px h-6 bg-gray-200 mx-1" />
                                <a href="https://www.facebook.com/BlueDreamsResortBodrum" target="_blank" rel="noreferrer" className={socialIconClass}><Facebook size={16} /></a>
                                <a href="https://www.instagram.com/bluedreamsresort/" target="_blank" rel="noreferrer" className={socialIconClass}><Instagram size={16} /></a>
                                <a href="https://www.youtube.com/@BlueDreamsResort" target="_blank" rel="noreferrer" className={socialIconClass}><Youtube size={16} /></a>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
