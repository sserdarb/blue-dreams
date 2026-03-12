'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, ChevronDown, ArrowRight, Search, Phone, Facebook, Instagram, Youtube } from 'lucide-react'
import { usePathname } from 'next/navigation'

const WhatsAppIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
)

export default function BookingWidget({ inline = false }: { inline?: boolean }) {
    const [isVisible, setIsVisible] = useState(inline ? true : false)
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        // Navigate to the internal booking page with query params
        const params = new URLSearchParams({
            arrival: checkIn,
            departure: checkOut,
            adults: guests,
        });

        window.location.href = `/${locale}/booking?${params.toString()}`;
    }

    const t = {
        tr: { checkin: 'Giriş', checkout: 'Çıkış', guest: 'Misafir', search: 'Müsaitlik Ara', adults: 'Yetişkin', children: 'Çocuk' },
        en: { checkin: 'Check-in', checkout: 'Check-out', guest: 'Guests', search: 'Check Availability', adults: 'Adults', children: 'Children' },
        de: { checkin: 'Anreise', checkout: 'Abreise', guest: 'Gäste', search: 'Verfügbarkeit', adults: 'Erwachsene', children: 'Kinder' },
        ru: { checkin: 'Заезд', checkout: 'Выезд', guest: 'Гости', search: 'Проверить', adults: 'Взрослых', children: 'дети' },
    }
    const texts = t[locale as keyof typeof t] || t.tr

    const socialIconClass = "transition-all p-1.5 border border-transparent hover:border-gray-200 hover:bg-gray-50 rounded-lg hover:-translate-y-0.5 relative z-10"
    const contactIconClass = "transition-all p-1.5 bg-gray-50 hover:bg-white border border-gray-200 rounded-lg hover:-translate-y-0.5 hover:shadow-sm relative z-10"

    return (
        <>
            <div className={`${inline ? 'w-full' : `fixed bottom-0 left-0 right-0 z-[60] bg-white/95 backdrop-blur-md shadow-[0_-5px_25px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-in-out border-t border-gray-100 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}`}>
                <div className="container mx-auto px-4 py-2 md:py-3">
                    <form id="booking-form" className="flex items-center justify-between md:justify-center gap-3 md:gap-4 relative z-10" onSubmit={handleSearch}>

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

                            <button type="submit" className="w-[42px] h-[36px] bg-brand text-white rounded-lg shadow-md flex items-center justify-center shrink-0 active:scale-95 transition-transform">
                                <Search size={16} />
                            </button>
                        </div>

                        {/* Desktop Inputs */}
                        <div className="hidden md:flex items-center gap-3 w-full max-w-6xl justify-center pointer-events-auto">
                            <div className="w-40 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group relative">
                                <div className="flex items-center relative">
                                    <Calendar className="text-gray-400 group-hover:text-brand w-4 h-4 mr-3 transition-colors absolute left-2 pointer-events-none" />
                                    <div className="flex flex-col text-left pl-8 w-full">
                                        <label htmlFor="checkin" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">{texts.checkin}</label>
                                        <input type="date" id="checkin" value={checkIn} min={getToday()} onChange={(e) => handleCheckInChange(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-40 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group relative">
                                <div className="flex items-center relative">
                                    <Calendar className="text-gray-400 group-hover:text-brand w-4 h-4 mr-3 transition-colors absolute left-2 pointer-events-none" />
                                    <div className="flex flex-col text-left pl-8 w-full">
                                        <label htmlFor="checkout" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">{texts.checkout}</label>
                                        <input type="date" id="checkout" value={checkOut} min={getNextDay(checkIn)} onChange={(e) => handleCheckOutChange(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-24 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group relative">
                                <div className="flex items-center justify-between relative">
                                    <div className="flex items-center w-full">
                                        <Users className="text-gray-400 group-hover:text-brand w-4 h-4 mr-2 transition-colors absolute left-2 pointer-events-none" />
                                        <div className="flex flex-col text-left pl-7 w-full">
                                            <label htmlFor="adults" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">{texts.adults}</label>
                                            <select id="adults" value={guests} onChange={(e) => setGuests(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer appearance-none relative z-10 w-full">
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                                <option value="6">6</option>
                                                <option value="7">7</option>
                                            </select>
                                        </div>
                                    </div>
                                    <ChevronDown className="w-3 h-3 text-gray-400 absolute right-1 pointer-events-none" />
                                </div>
                            </div>

                            <div className="w-24 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group relative">
                                <div className="flex items-center justify-between relative">
                                    <div className="flex items-center w-full">
                                        <div className="flex flex-col text-left pl-2 w-full">
                                            <label htmlFor="childrenCount" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">{texts.children}</label>
                                            <select id="childrenCount" value={kids} onChange={(e) => setKids(e.target.value)} className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer appearance-none relative z-10 w-full">
                                                <option value="0">0</option>
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

                            <button type="submit" className="relative z-10 bg-brand hover:bg-brand-dark text-white h-[42px] px-6 rounded-sm flex items-center justify-center text-xs font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 min-w-[160px]">
                                {texts.search}
                                <ArrowRight className="ml-2 w-3 h-3" />
                            </button>

                            <div className="h-8 w-px bg-gray-200 mx-2" />
                            <div className="flex items-center gap-3 relative z-10">
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
