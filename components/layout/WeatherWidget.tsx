'use client'

import { useState, useEffect, useRef } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Loader2, X, Thermometer } from 'lucide-react'

interface WeatherData {
    temp: number
    condition: string
    icon: string
}

interface ForecastDay {
    date: string
    dayName: string
    tempMin: number
    tempMax: number
    weatherCode: number
    icon: string
    condition: string
}

// Bodrum koordinatları
const BODRUM_LAT = 37.0344
const BODRUM_LON = 27.4305

function getWeatherInfo(weatherCode: number): { condition: string, icon: string } {
    if (weatherCode === 0) return { condition: 'Güneşli', icon: 'sun' }
    if (weatherCode >= 1 && weatherCode <= 3) return { condition: 'Parçalı Bulutlu', icon: 'cloud' }
    if (weatherCode >= 45 && weatherCode <= 48) return { condition: 'Sisli', icon: 'cloud' }
    if (weatherCode >= 51 && weatherCode <= 67) return { condition: 'Yağmurlu', icon: 'rain' }
    if (weatherCode >= 71 && weatherCode <= 77) return { condition: 'Karlı', icon: 'snow' }
    if (weatherCode >= 80 && weatherCode <= 82) return { condition: 'Sağanak', icon: 'rain' }
    if (weatherCode >= 95) return { condition: 'Fırtınalı', icon: 'wind' }
    return { condition: 'Güneşli', icon: 'sun' }
}

function getWeatherIcon(icon: string, size: number = 18) {
    switch (icon) {
        case 'sun': return <Sun size={size} className="text-yellow-400" />
        case 'cloud': return <Cloud size={size} className="text-gray-400" />
        case 'rain': return <CloudRain size={size} className="text-blue-400" />
        case 'snow': return <CloudSnow size={size} className="text-blue-200" />
        case 'wind': return <Wind size={size} className="text-gray-500" />
        default: return <Sun size={size} className="text-yellow-400" />
    }
}

const DAY_NAMES_TR = ['Pzr', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [forecast, setForecast] = useState<ForecastDay[]>([])
    const [loading, setLoading] = useState(true)
    const [showForecast, setShowForecast] = useState(false)
    const popupRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${BODRUM_LAT}&longitude=${BODRUM_LON}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7`
                )

                if (response.ok) {
                    const data = await response.json()
                    const { condition, icon } = getWeatherInfo(data.current.weather_code)

                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        condition,
                        icon
                    })

                    // Parse 7-day forecast
                    if (data.daily) {
                        const days: ForecastDay[] = data.daily.time.map((dateStr: string, i: number) => {
                            const date = new Date(dateStr)
                            const info = getWeatherInfo(data.daily.weather_code[i])
                            return {
                                date: dateStr,
                                dayName: DAY_NAMES_TR[date.getDay()],
                                tempMin: Math.round(data.daily.temperature_2m_min[i]),
                                tempMax: Math.round(data.daily.temperature_2m_max[i]),
                                weatherCode: data.daily.weather_code[i],
                                icon: info.icon,
                                condition: info.condition,
                            }
                        })
                        setForecast(days)
                    }
                }
            } catch (error) {
                console.error('Weather fetch error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchWeather()
        const interval = setInterval(fetchWeather, 30 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    // Close popup on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
                setShowForecast(false)
            }
        }
        if (showForecast) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [showForecast])

    if (loading) {
        return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-xs">
                <Loader2 size={14} className="animate-spin" />
            </div>
        )
    }

    if (!weather) return null

    return (
        <div className="relative" ref={popupRef}>
            <button
                onClick={() => setShowForecast(!showForecast)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors cursor-pointer"
                title={`${weather.condition} — Haftalık tahmin için tıklayın`}
            >
                {getWeatherIcon(weather.icon)}
                <span className="text-sm font-semibold">{weather.temp}°C</span>
                <span className="text-xs opacity-75 hidden lg:inline">Bodrum</span>
            </button>

            {/* 7-Day Forecast Popup */}
            {showForecast && forecast.length > 0 && (
                <div className="absolute top-full right-0 mt-2 bg-[#1a1a2e]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-4 w-[280px] z-[60] animate-fade-in-up">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Thermometer size={16} className="text-cyan-400" />
                            <span className="text-white text-sm font-bold">Bodrum Hava Durumu</span>
                        </div>
                        <button onClick={() => setShowForecast(false)} className="text-white/40 hover:text-white transition-colors">
                            <X size={14} />
                        </button>
                    </div>

                    {/* Current */}
                    <div className="flex items-center gap-3 bg-white/5 rounded-lg p-3 mb-3">
                        {getWeatherIcon(weather.icon, 28)}
                        <div>
                            <div className="text-white text-2xl font-bold">{weather.temp}°C</div>
                            <div className="text-white/60 text-xs">{weather.condition}</div>
                        </div>
                    </div>

                    {/* 7-day */}
                    <div className="space-y-1">
                        {forecast.map((day, i) => (
                            <div key={day.date} className={`flex items-center justify-between py-1.5 px-2 rounded ${i === 0 ? 'bg-cyan-500/10' : 'hover:bg-white/5'} transition-colors`}>
                                <span className="text-white/70 text-xs w-8 font-medium">{i === 0 ? 'Bugün' : day.dayName}</span>
                                <div className="flex items-center gap-1">
                                    {getWeatherIcon(day.icon, 14)}
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                    <span className="text-white font-semibold">{day.tempMax}°</span>
                                    <span className="text-white/40">/</span>
                                    <span className="text-white/50">{day.tempMin}°</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-3 text-center text-white/30 text-[10px]">
                        Open-Meteo · Güncellenme: 30dk
                    </div>
                </div>
            )}
        </div>
    )
}
