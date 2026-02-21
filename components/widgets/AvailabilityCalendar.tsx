'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
    ChevronLeft, ChevronRight, Loader2, Info,
    CheckCircle2, XCircle, Tag, AlertTriangle, Users
} from 'lucide-react'
import { useGeoCurrency, formatGeoPrice, type GeoCurrency } from '@/lib/utils/geo-currency'

// ─── Types ────────────────────────────────────────────────────
interface DayData {
    date: string
    available: boolean
    roomTypes: Array<{
        roomType: string
        roomTypeId: number
        price: number
        priceEur: number
        isAvailable: boolean
    }>
    minPrice: number
    minPriceEur: number
    totalAvailable: number
    hasDiscount: boolean
}

interface CalendarResponse {
    month: string
    adults: number
    children: number
    days: DayData[]
    avgPrice: number
}

const MONTH_NAMES_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const DAY_NAMES_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

function fmtPrice(n: number): string {
    return n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ─── Component ─────────────────────────────────────────────────
export function AvailabilityCalendar() {
    const now = new Date()
    const [currentMonth, setCurrentMonth] = useState(() => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)
    const [calendarData, setCalendarData] = useState<CalendarResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
    const [adults, setAdults] = useState(2)
    const [children, setChildren] = useState(0)
    const geo = useGeoCurrency()

    const fetchCalendar = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/booking/calendar?month=${currentMonth}&adults=${adults}&children=${children}`)
            if (res.ok) {
                const data = await res.json()
                setCalendarData(data)
            }
        } catch (e) {
            console.error('Calendar fetch error:', e)
        } finally {
            setLoading(false)
        }
    }, [currentMonth, adults, children])

    useEffect(() => { fetchCalendar() }, [fetchCalendar])

    const navigateMonth = (direction: -1 | 1) => {
        const [y, m] = currentMonth.split('-').map(Number)
        const d = new Date(y, m - 1 + direction, 1)
        // Don't navigate before current month
        if (d < new Date(now.getFullYear(), now.getMonth(), 1)) return
        setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
        setSelectedDay(null)
    }

    // Build weekday-aligned grid
    const [year, month] = currentMonth.split('-').map(Number)
    const firstDayOfMonth = new Date(year, month - 1, 1)
    const daysInMonth = new Date(year, month, 0).getDate()
    // JS getDay: 0=Sun. We want Mon=0
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7

    // Build a lookup map
    const dayMap: Record<string, DayData> = {}
    if (calendarData?.days) {
        for (const d of calendarData.days) {
            dayMap[d.date] = d
        }
    }

    const today = new Date().toISOString().split('T')[0]

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-brand to-brand-dark p-5 text-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-serif">Müsaitlik Takvimi</h3>
                    <div className="flex items-center gap-2">
                        {/* Guest selector */}
                        <div className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1">
                            <Users size={14} />
                            <select value={adults} onChange={e => setAdults(Number(e.target.value))}
                                className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer">
                                {[1, 2, 3, 4, 5, 6].map(n => (
                                    <option key={n} value={n} className="text-gray-900">{n} Yetişkin</option>
                                ))}
                            </select>
                        </div>
                        {/* Currency toggle */}
                        <div className="flex items-center gap-0.5 bg-white/10 rounded-lg text-xs">
                            {(['TRY', 'EUR'] as GeoCurrency[]).map(c => (
                                <button key={c} onClick={() => geo.setCurrency(c === geo.detected.currency ? null : c)}
                                    className={`px-2 py-1 rounded-md font-bold transition-colors ${geo.currency === c ? 'bg-white text-brand' : 'text-white/60 hover:text-white'}`}>
                                    {c === 'TRY' ? '₺' : '€'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Month navigation */}
                <div className="flex items-center justify-between">
                    <button onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-30"
                        disabled={currentMonth <= `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`}>
                        <ChevronLeft size={20} />
                    </button>
                    <h4 className="text-lg font-bold">
                        {MONTH_NAMES_TR[month - 1]} {year}
                    </h4>
                    <button onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 py-3 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Müsait
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-red-50 border border-red-200" /> Dolu
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-100 border border-amber-300 flex items-center justify-center"><Tag size={6} className="text-amber-600" /></span> İndirimli
                </span>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-72">
                        <Loader2 className="animate-spin text-brand" size={32} />
                    </div>
                ) : (
                    <>
                        {/* Weekday headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {DAY_NAMES_TR.map(d => (
                                <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase py-1">{d}</div>
                            ))}
                        </div>

                        {/* Day cells */}
                        <div className="grid grid-cols-7 gap-1">
                            {/* Blank offset */}
                            {Array.from({ length: startOffset }, (_, i) => (
                                <div key={`off-${i}`} className="h-16" />
                            ))}

                            {/* Actual days */}
                            {Array.from({ length: daysInMonth }, (_, i) => {
                                const dayNum = i + 1
                                const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                                const day = dayMap[dateStr]
                                const isPast = dateStr < today
                                const isToday = dateStr === today
                                const isSelected = selectedDay?.date === dateStr

                                let bgClass = 'bg-gray-50 text-gray-300' // default: no data or past
                                let priceDisplay = ''

                                if (day && !isPast) {
                                    if (day.available) {
                                        if (day.hasDiscount) {
                                            bgClass = 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 text-gray-800 hover:shadow-md cursor-pointer'
                                        } else {
                                            bgClass = 'bg-emerald-50 border-emerald-200 text-gray-800 hover:shadow-md cursor-pointer'
                                        }
                                        priceDisplay = geo.currency === 'EUR'
                                            ? `€${fmtPrice(day.minPriceEur)}`
                                            : `₺${fmtPrice(day.minPrice)}`
                                    } else {
                                        bgClass = 'bg-red-50/50 border-red-100 text-gray-400'
                                    }
                                }

                                if (isToday) bgClass += ' ring-2 ring-brand ring-offset-1'
                                if (isSelected) bgClass += ' ring-2 ring-brand shadow-lg scale-105'

                                return (
                                    <div
                                        key={dateStr}
                                        onClick={() => {
                                            if (day && !isPast && day.available) setSelectedDay(isSelected ? null : day)
                                        }}
                                        className={`h-16 rounded-lg border transition-all duration-200 flex flex-col items-center justify-center relative ${bgClass}`}
                                    >
                                        <span className={`text-sm font-bold ${isToday ? 'text-brand' : ''}`}>{dayNum}</span>
                                        {priceDisplay && (
                                            <span className="text-[9px] font-bold mt-0.5 leading-none">{priceDisplay}</span>
                                        )}
                                        {day?.hasDiscount && !isPast && (
                                            <Tag size={8} className="absolute top-1 right-1 text-amber-500" />
                                        )}
                                        {day && !day.available && !isPast && (
                                            <XCircle size={10} className="text-red-300 mt-0.5" />
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}
            </div>

            {/* Selected Day Detail */}
            {selectedDay && (
                <div className="border-t border-gray-100 p-5 bg-gradient-to-b from-gray-50 to-white">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h4 className="font-bold text-gray-900">
                                {new Date(selectedDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}
                            </h4>
                            <span className="text-xs text-gray-500">{selectedDay.totalAvailable} oda tipi müsait</span>
                        </div>
                        {selectedDay.hasDiscount && (
                            <div className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-full animate-pulse">
                                <AlertTriangle size={12} /> İndirimli Tarih!
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        {selectedDay.roomTypes
                            .filter(r => r.isAvailable)
                            .sort((a, b) => a.price - b.price)
                            .map(room => (
                                <div key={room.roomTypeId}
                                    className="flex items-center justify-between bg-white rounded-xl border border-gray-100 p-3 hover:border-brand/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                        <div>
                                            <span className="font-bold text-gray-800 text-sm">{room.roomType}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-brand text-lg">
                                            {formatGeoPrice(room.price, room.priceEur, geo.currency)}
                                        </div>
                                        <div className="text-[10px] text-gray-400">/ gece</div>
                                    </div>
                                </div>
                            ))}

                        {selectedDay.roomTypes.filter(r => !r.isAvailable).length > 0 && (
                            <div className="pt-2 border-t border-gray-100 mt-2">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Müsait Değil</p>
                                <div className="flex flex-wrap gap-1">
                                    {selectedDay.roomTypes.filter(r => !r.isAvailable).map(room => (
                                        <span key={room.roomTypeId} className="text-[10px] bg-red-50 text-red-400 px-2 py-0.5 rounded font-medium">
                                            {room.roomType}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
