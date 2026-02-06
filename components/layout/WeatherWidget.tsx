'use client'

import { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow, Wind, Loader2 } from 'lucide-react'

interface WeatherData {
    temp: number
    condition: string
    icon: string
}

// Bodrum koordinatları
const BODRUM_LAT = 37.0344
const BODRUM_LON = 27.4305

export function WeatherWidget() {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Open-Meteo API kullanıyoruz (ücretsiz, API key gerektirmez)
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${BODRUM_LAT}&longitude=${BODRUM_LON}&current=temperature_2m,weather_code&timezone=auto`
                )

                if (response.ok) {
                    const data = await response.json()
                    const weatherCode = data.current.weather_code

                    // WMO weather codes to condition mapping
                    let condition = 'Güneşli'
                    let icon = 'sun'

                    if (weatherCode === 0) {
                        condition = 'Güneşli'
                        icon = 'sun'
                    } else if (weatherCode >= 1 && weatherCode <= 3) {
                        condition = 'Parçalı Bulutlu'
                        icon = 'cloud'
                    } else if (weatherCode >= 45 && weatherCode <= 48) {
                        condition = 'Sisli'
                        icon = 'cloud'
                    } else if (weatherCode >= 51 && weatherCode <= 67) {
                        condition = 'Yağmurlu'
                        icon = 'rain'
                    } else if (weatherCode >= 71 && weatherCode <= 77) {
                        condition = 'Karlı'
                        icon = 'snow'
                    } else if (weatherCode >= 80 && weatherCode <= 82) {
                        condition = 'Sağanak'
                        icon = 'rain'
                    } else if (weatherCode >= 95) {
                        condition = 'Fırtınalı'
                        icon = 'wind'
                    }

                    setWeather({
                        temp: Math.round(data.current.temperature_2m),
                        condition,
                        icon
                    })
                }
            } catch (error) {
                console.error('Weather fetch error:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchWeather()
        // Her 30 dakikada bir güncelle
        const interval = setInterval(fetchWeather, 30 * 60 * 1000)
        return () => clearInterval(interval)
    }, [])

    const getWeatherIcon = (icon: string) => {
        switch (icon) {
            case 'sun':
                return <Sun size={18} className="text-yellow-400" />
            case 'cloud':
                return <Cloud size={18} className="text-gray-400" />
            case 'rain':
                return <CloudRain size={18} className="text-blue-400" />
            case 'snow':
                return <CloudSnow size={18} className="text-blue-200" />
            case 'wind':
                return <Wind size={18} className="text-gray-500" />
            default:
                return <Sun size={18} className="text-yellow-400" />
        }
    }

    if (loading) {
        return (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-xs">
                <Loader2 size={14} className="animate-spin" />
            </div>
        )
    }

    if (!weather) return null

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white" title={weather.condition}>
            {getWeatherIcon(weather.icon)}
            <span className="text-sm font-semibold">{weather.temp}°C</span>
            <span className="text-xs opacity-75 hidden lg:inline">Bodrum</span>
        </div>
    )
}
