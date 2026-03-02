'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Loader2, Sparkles } from 'lucide-react'

interface CalendarDay {
    date: string
    available: boolean
    minPrice: number
    cheapestRoom: string
    hasDiscount: boolean
}

export default function AdvancedBookingCalendar({
    currency,
    onClose,
    onSelectDate
}: {
    currency: string
    onClose: () => void
    onSelectDate: (checkIn: string, checkOut: string) => void
}) {
    const today = new Date()
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
    const [loading, setLoading] = useState(false)
    const [days, setDays] = useState<CalendarDay[]>([])

    // Selection state
    const [selecting, setSelecting] = useState<'checkIn' | 'checkOut'>('checkIn')
    const [checkInDate, setCheckInDate] = useState<string | null>(null)
    const [checkOutDate, setCheckOutDate] = useState<string | null>(null)

    const fetchMonthData = async (date: Date) => {
        setLoading(true)
        try {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const res = await fetch(`/api/booking/calendar?month=${year}-${month}&currency=${currency}`)
            if (res.ok) {
                const data = await res.json()
                setDays(data.days || [])
            }
        } catch (error) {
            console.error('Failed to fetch calendar:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchMonthData(currentMonth)
    }, [currentMonth, currency])

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }

    const handlePrevMonth = () => {
        const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        if (prev >= new Date(today.getFullYear(), today.getMonth(), 1)) {
            setCurrentMonth(prev)
        }
    }

    // Helper to generate missing prefix days
    const startDay = currentMonth.getDay() || 7 // Monday = 1, Sunday = 7
    const prefixDays = Array(startDay - 1).fill(null)

    const handleDayClick = (dayStr: string) => {
        const d = new Date(dayStr)
        if (d < new Date(today.toISOString().split('T')[0])) return // Past dates not allowed

        if (selecting === 'checkIn') {
            setCheckInDate(dayStr)
            setCheckOutDate(null)
            setSelecting('checkOut')
        } else {
            if (new Date(dayStr) <= new Date(checkInDate!)) {
                // If clicked before or same as check-in, set as new check-in
                setCheckInDate(dayStr)
                return
            }
            setCheckOutDate(dayStr)

            // Auto complete selection after a brief pause
            setTimeout(() => {
                onSelectDate(checkInDate!, dayStr)
            }, 600)
        }
    }

    const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '₺'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Gelişmiş Fiyat Takvimi</h2>
                        <p className="text-sm text-slate-500">Günlük en düşük fiyatları ve indirimli tarihleri görün.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                {/* Calendar Navigation */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                    <button
                        onClick={handlePrevMonth}
                        disabled={currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear()}
                        className="p-2 bg-white dark:bg-slate-800 shadow-sm rounded-lg hover:bg-slate-50 border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                    >
                        <ChevronLeft size={20} />
                    </button>

                    <h3 className="text-lg font-semibold text-slate-700 dark:text-white flex items-center gap-4">
                        {currentMonth.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                        {loading && <Loader2 size={16} className="animate-spin text-blue-500" />}
                    </h3>

                    <button onClick={handleNextMonth} className="p-2 bg-white dark:bg-slate-800 shadow-sm rounded-lg hover:bg-slate-50 border border-slate-200 dark:border-slate-700">
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Calendar Grid */}
                <div className="p-6">
                    {/* AI Suggestions Banner */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50/50 via-indigo-50/50 to-purple-50/50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 rounded-xl border border-blue-100/50 dark:border-blue-800/50 shadow-sm flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shrink-0 mt-0.5 shadow-md">
                            <Sparkles size={18} className="text-white" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-800 dark:text-blue-100 text-sm mb-1">
                                Blue Concierge AI Önerisi ✨
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                                {days.filter(d => d.hasDiscount && d.available && new Date(d.date) >= new Date(today.toISOString().split('T')[0])).length > 0 ? (
                                    <>
                                        Bu ay <strong>{days.filter(d => d.hasDiscount && d.available && new Date(d.date) >= new Date(today.toISOString().split('T')[0])).length} farklı günde</strong> düşük doluluk nedeniyle özel fiyat fırsatları tespit ettim.
                                        Takvimde <span className="inline-block px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded text-[10px] font-bold mx-1">İNDİRİM</span> etiketiyle işaretlediğim tarihleri seçerek daha avantajlı bir tatil planlayabilirsiniz!
                                    </>
                                ) : (
                                    <>
                                        Bu ay için özel fiyatlı gün görünmüyor ancak misafirlerimizin tatil için <strong>en çok tercih ettiği yoğun sezonlardan</strong> birini görüntülüyorsunuz.
                                        İstediğiniz oda tipini kaçırmamak için erken rezervasyon yapmanızı tavsiye ederim!
                                    </>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <div>Pzt</div><div>Sal</div><div>Çar</div><div>Per</div><div>Cum</div><div>Cmt</div><div>Paz</div>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {prefixDays.map((_, i) => (
                            <div key={`prefix-${i}`} className="h-24 bg-transparent"></div>
                        ))}

                        {days.map((day) => {
                            const dateObj = new Date(day.date)
                            const isPast = dateObj < new Date(today.toISOString().split('T')[0])
                            const isCheckIn = day.date === checkInDate
                            const isCheckOut = day.date === checkOutDate
                            const isBetween = checkInDate && checkOutDate && day.date > checkInDate && day.date < checkOutDate

                            let bgClass = "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 hover:shadow-md cursor-pointer"
                            if (isPast) bgClass = "bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed"
                            else if (isCheckIn || isCheckOut) bgClass = "bg-blue-500 border-blue-600 text-white shadow-lg scale-105 z-10 relative"
                            else if (isBetween) bgClass = "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                            else if (day.hasDiscount) bgClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-500"

                            return (
                                <div
                                    key={day.date}
                                    onClick={() => !isPast && handleDayClick(day.date)}
                                    className={`h-24 p-2 rounded-xl border transition-all flex flex-col justify-between ${bgClass}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <span className={`text-sm font-semibold ${isCheckIn || isCheckOut ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {dateObj.getDate()}
                                        </span>
                                        {day.hasDiscount && !isCheckIn && !isCheckOut && (
                                            <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <Sparkles size={10} /> İndirim
                                            </span>
                                        )}
                                    </div>

                                    {!isPast && day.available && day.minPrice > 0 ? (
                                        <div className="text-right">
                                            <div className={`text-[10px] truncate mb-0.5 ${isCheckIn || isCheckOut ? 'text-blue-100' : 'text-slate-400'}`}>
                                                {day.cheapestRoom.split(' -')[0]}
                                            </div>
                                            <div className={`font-bold ${isCheckIn || isCheckOut ? 'text-white' : day.hasDiscount ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-white'}`}>
                                                {currencySymbol}{Math.round(day.minPrice)}
                                            </div>
                                        </div>
                                    ) : (
                                        !isPast && <div className="text-[10px] text-red-500 font-medium text-right mt-auto">Dolu</div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer status */}
                <div className="bg-slate-50 dark:bg-slate-800/80 p-6 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div className="text-sm text-slate-500">
                        {selecting === 'checkIn' ? 'Lütfen giriş tarihi seçin' : 'Lütfen çıkış tarihi seçin'}
                    </div>
                    {checkInDate && checkOutDate && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {new Date(checkInDate).toLocaleDateString('tr-TR')} - {new Date(checkOutDate).toLocaleDateString('tr-TR')}
                            </span>
                            <button
                                onClick={() => onSelectDate(checkInDate, checkOutDate)}
                                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-md transition-colors"
                            >
                                Tarihleri Onayla
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
