'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, ChevronDown, ArrowRight, Phone, Search, Facebook, Instagram, Youtube } from 'lucide-react'

// WhatsApp Icon Component
const WhatsAppIcon = ({ size = 16, className = "" }: { size?: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
)

export default function BookingWidget() {
    const [isVisible, setIsVisible] = useState(false)

    const getToday = () => new Date().toISOString().split('T')[0]
    const getTomorrow = () => {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return tomorrow.toISOString().split('T')[0]
    }

    const [checkIn, setCheckIn] = useState(getToday())
    const [checkOut, setCheckOut] = useState(getTomorrow())
    const [guests, setGuests] = useState('2')

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        handleScroll()
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const baseUrl = 'https://blue-dreams.rezervasyonal.com/'
        const params = new URLSearchParams({
            arrival: checkIn,
            departure: checkOut,
            adults: guests
        })
        window.location.href = `${baseUrl}?${params.toString()}`
    }

    const socialIconClass = "text-gray-400 hover:text-brand transition-colors p-1.5 border border-transparent hover:border-gray-200 rounded-sm"
    const contactIconClass = "text-gray-500 hover:text-brand transition-colors p-1.5 bg-gray-50 hover:bg-white border border-gray-200 rounded-sm"

    const renderIcons = () => (
        <>
            <button className={contactIconClass} title="Ara">
                <Search size={16} />
            </button>
            <a href="https://wa.me/902523371111" target="_blank" rel="noreferrer" className={`${contactIconClass} hover:text-[#25D366]`} title="WhatsApp">
                <WhatsAppIcon size={16} />
            </a>
            <a href="tel:+902523371111" className={contactIconClass} title="Telefon">
                <Phone size={16} />
            </a>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <a href="https://www.facebook.com/BlueDreamsResortBodrum" target="_blank" rel="noreferrer" className={socialIconClass}>
                <Facebook size={16} />
            </a>
            <a href="https://www.instagram.com/bluedreamsresort/" target="_blank" rel="noreferrer" className={socialIconClass}>
                <Instagram size={16} />
            </a>
            <a href="https://www.youtube.com/@BlueDreamsResort" target="_blank" rel="noreferrer" className={socialIconClass}>
                <Youtube size={16} />
            </a>
        </>
    )

    return (
        <div
            className={`fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-100 shadow-[0_-5px_25px_rgba(0,0,0,0.1)] transition-transform duration-500 ease-in-out ${isVisible ? 'translate-y-0' : 'translate-y-full'
                }`}
        >
            <div className="container mx-auto px-4 py-2 md:py-3">
                <form className="flex items-center justify-between md:justify-center gap-3 md:gap-4" onSubmit={handleSearch}>

                    {/* Mobile Layout */}
                    <div className="md:hidden flex flex-col w-full gap-2 py-1">
                        <div className="flex gap-2">
                            {/* Mobile Check-in */}
                            <div className="flex-1 bg-gray-50 rounded-lg p-2 flex flex-col justify-center border border-gray-200">
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Giriş</span>
                                <input
                                    type="date"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-gray-900 w-full outline-none p-0"
                                />
                            </div>
                            {/* Mobile Check-out */}
                            <div className="flex-1 bg-gray-50 rounded-lg p-2 flex flex-col justify-center border border-gray-200">
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Çıkış</span>
                                <input
                                    type="date"
                                    value={checkOut}
                                    onChange={(e) => setCheckOut(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-gray-900 w-full outline-none p-0"
                                />
                            </div>
                        </div>

                        {/* Mobile Button */}
                        <button
                            type="submit"
                            className="bg-brand text-white h-[40px] w-full text-xs font-bold tracking-widest uppercase rounded-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                            Rezervasyon Yap
                            <ArrowRight size={14} />
                        </button>
                    </div>

                    {/* Desktop Inputs */}
                    <div className="hidden md:flex items-center gap-3 w-full max-w-6xl justify-center">

                        {/* Check-in */}
                        <div className="w-40 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group relative">
                            <div className="flex items-center relative">
                                <Calendar className="text-gray-400 group-hover:text-brand w-4 h-4 mr-3 transition-colors absolute left-2 pointer-events-none" />
                                <div className="flex flex-col text-left pl-8 w-full">
                                    <label htmlFor="checkin" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">Giriş</label>
                                    <input
                                        type="date"
                                        id="checkin"
                                        value={checkIn}
                                        onChange={(e) => setCheckIn(e.target.value)}
                                        className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Check-out */}
                        <div className="w-40 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group">
                            <div className="flex items-center relative">
                                <Calendar className="text-gray-400 group-hover:text-brand w-4 h-4 mr-3 transition-colors absolute left-2 pointer-events-none" />
                                <div className="flex flex-col text-left pl-8 w-full">
                                    <label htmlFor="checkout" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">Çıkış</label>
                                    <input
                                        type="date"
                                        id="checkout"
                                        value={checkOut}
                                        onChange={(e) => setCheckOut(e.target.value)}
                                        className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Guests */}
                        <div className="w-32 bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-sm p-2 cursor-pointer transition-all group">
                            <div className="flex items-center justify-between relative">
                                <div className="flex items-center w-full">
                                    <Users className="text-gray-400 group-hover:text-brand w-4 h-4 mr-3 transition-colors absolute left-2 pointer-events-none" />
                                    <div className="flex flex-col text-left pl-8 w-full">
                                        <label htmlFor="guests" className="text-[9px] text-gray-400 font-bold uppercase tracking-wider cursor-pointer">Misafir</label>
                                        <select
                                            id="guests"
                                            value={guests}
                                            onChange={(e) => setGuests(e.target.value)}
                                            className="bg-transparent border-none outline-none text-xs font-semibold text-gray-800 w-full p-0 cursor-pointer appearance-none"
                                        >
                                            <option value="1">1 Yetişkin</option>
                                            <option value="2">2 Yetişkin</option>
                                            <option value="3">3 Yetişkin</option>
                                            <option value="4">4 Yetişkin</option>
                                        </select>
                                    </div>
                                </div>
                                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2 pointer-events-none" />
                            </div>
                        </div>

                        {/* Main Button */}
                        <button
                            type="submit"
                            className="bg-brand hover:bg-brand-dark text-white h-[42px] px-6 rounded-sm flex items-center justify-center text-xs font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 min-w-[160px]"
                        >
                            Müsaitlik Ara
                            <ArrowRight className="ml-2 w-3 h-3" />
                        </button>

                        {/* Divider */}
                        <div className="h-8 w-px bg-gray-200 mx-2"></div>

                        {/* Icons Area */}
                        <div className="flex items-center gap-2">
                            {renderIcons()}
                        </div>

                    </div>
                </form>
            </div>
        </div>
    )
}
