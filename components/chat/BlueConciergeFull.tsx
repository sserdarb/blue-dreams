'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Sparkles, Mic, MicOff, RefreshCw, ChevronRight, Phone, MapPin, ArrowLeft, ArrowRight, Download, Share2, BedDouble, Users, Scan, CheckCircle2, Plane, Car, Map, Check, Star, Volume2, StopCircle, CalendarDays, TrendingUp, ExternalLink, UtensilsCrossed, Waves, Shield, Loader2, Search } from 'lucide-react'

// TTS Helper
const speakText = (text: string, lang: string = 'tr-TR') => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return null
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    const voice = voices.find(v => v.lang.includes(lang.split('-')[0])) || voices[0]
    if (voice) utterance.voice = voice
    utterance.lang = lang
    utterance.rate = 0.9
    window.speechSynthesis.speak(utterance)
    return utterance
}

// Voice Button Component
const VoiceButton = ({ text, lang = 'tr', className = '' }: { text: string; lang?: string; className?: string }) => {
    const [isSpeaking, setIsSpeaking] = useState(false)
    const toggleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (isSpeaking) {
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
        } else {
            setIsSpeaking(true)
            const langMap: Record<string, string> = { tr: 'tr-TR', en: 'en-US', de: 'de-DE', ru: 'ru-RU' }
            const utterance = speakText(text, langMap[lang] || 'tr-TR')
            if (utterance) utterance.onend = () => setIsSpeaking(false)
        }
    }
    return (
        <button onClick={toggleSpeak} className={`p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all ${className} ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-white'}`} title="Sesli Dinle">
            {isSpeaking ? <StopCircle size={18} /> : <Volume2 size={18} />}
        </button>
    )
}

// Types
interface Message {
    id: string
    role: 'user' | 'model'
    text: string
    isFunctionCall?: boolean
    uiPayload?: {
        type: string
        data?: any
    }
    data?: any
}

interface BlueConciergFullProps {
    isOpen: boolean
    onClose: () => void
    locale?: 'tr' | 'en' | 'de' | 'ru'
}

// Translations
const translations = {
    tr: {
        title: 'Blue Concierge',
        subtitle: 'Yapay Zeka Asistanı',
        welcome: 'Size nasıl yardımcı olabilirim?',
        welcomeSubtitle: 'Aşağıdaki konulardan birini seçin, yazın veya sesli olarak sorun.',
        placeholder: 'Mesajınızı yazın...',
        newChat: 'Yeni Sohbet',
        download: 'PDF Olarak İndir',
        share: 'Paylaş',
        you: 'Siz',
        loading: 'Düşünüyor...',
        voiceNotSupported: 'Tarayıcınız sesli komutu desteklemiyor.',
        copied: 'Sohbet geçmişi panoya kopyalandı.',
        select: 'Seç',
        backToMenu: 'Menüye Dön',
        categories: [
            { id: 'rooms', title: 'Konaklama', subtitle: 'Club, Deluxe ve Aile Odaları', prompt: 'Odalarınız hakkında bilgi verir misiniz?' },
            { id: 'dining', title: 'Yeme & İçme', subtitle: '4 Restoran, 10+ Bar', prompt: 'Restoranlarınız hakkında bilgi verir misiniz?' },
            { id: 'spa', title: 'Spa & Wellness', subtitle: 'Naya Spa', prompt: 'Spa hizmetleriniz hakkında bilgi verir misiniz?' },
            { id: 'location', title: 'Konum & Ulaşım', subtitle: "Torba Koyu'nun kalbinde", prompt: 'Otelin konumu nerede, havalimanına ne kadar uzaklıkta?' },
            { id: 'meeting', title: 'Toplantı & Etkinlik', subtitle: '6 Farklı Salon', prompt: 'Toplantı salonlarınız hakkında bilgi verir misiniz?' },
            { id: 'reviews', title: 'Misafir Yorumları', subtitle: 'Gerçek deneyimler', prompt: 'Misafirler otel hakkında neler söylüyor?' },
            { id: 'booking', title: 'Rezervasyon', subtitle: 'Online Rezervasyon', prompt: 'Rezervasyon yapmak istiyorum' }
        ]
    },
    en: {
        title: 'Blue Concierge',
        subtitle: 'AI Assistant',
        welcome: 'How can I help you?',
        welcomeSubtitle: 'Choose a topic below, type, or ask by voice.',
        placeholder: 'Type your message...',
        newChat: 'New Chat',
        download: 'Download as PDF',
        share: 'Share',
        you: 'You',
        loading: 'Thinking...',
        voiceNotSupported: 'Your browser does not support voice commands.',
        copied: 'Chat history copied to clipboard.',
        select: 'Select',
        backToMenu: 'Back to Menu',
        categories: [
            { id: 'rooms', title: 'Accommodation', subtitle: 'Club, Deluxe & Family Rooms', prompt: 'Can you tell me about your rooms?' },
            { id: 'dining', title: 'Dining', subtitle: '4 Restaurants, 10+ Bars', prompt: 'Can you tell me about your restaurants?' },
            { id: 'spa', title: 'Spa & Wellness', subtitle: 'Naya Spa', prompt: 'Can you tell me about your spa services?' },
            { id: 'location', title: 'Location & Transport', subtitle: 'In the heart of Torba Bay', prompt: 'Where is the hotel located? How far is it from the airport?' },
            { id: 'meeting', title: 'Meetings & Events', subtitle: '6 Different Halls', prompt: 'Can you tell me about your meeting rooms?' },
            { id: 'reviews', title: 'Guest Reviews', subtitle: 'Real experiences', prompt: 'What do guests say about the hotel?' },
            { id: 'booking', title: 'Reservation', subtitle: 'Online Booking', prompt: 'I would like to make a reservation' }
        ]
    },
    de: {
        title: 'Blue Concierge',
        subtitle: 'KI-Assistent',
        welcome: 'Wie kann ich Ihnen helfen?',
        welcomeSubtitle: 'Wählen Sie ein Thema, tippen Sie oder fragen Sie per Sprache.',
        placeholder: 'Nachricht eingeben...',
        newChat: 'Neuer Chat',
        download: 'Als PDF herunterladen',
        share: 'Teilen',
        you: 'Sie',
        loading: 'Denkt nach...',
        voiceNotSupported: 'Ihr Browser unterstützt keine Sprachbefehle.',
        copied: 'Chatverlauf in die Zwischenablage kopiert.',
        select: 'Auswählen',
        backToMenu: 'Zurück zum Menü',
        categories: [
            { id: 'rooms', title: 'Unterkunft', subtitle: 'Club, Deluxe & Familienzimmer', prompt: 'Können Sie mir über Ihre Zimmer erzählen?' },
            { id: 'dining', title: 'Gastronomie', subtitle: '4 Restaurants, 10+ Bars', prompt: 'Können Sie mir über Ihre Restaurants erzählen?' },
            { id: 'spa', title: 'Spa & Wellness', subtitle: 'Naya Spa', prompt: 'Können Sie mir über Ihre Spa-Dienste erzählen?' },
            { id: 'location', title: 'Lage & Transport', subtitle: 'Im Herzen der Torba-Bucht', prompt: 'Wo liegt das Hotel? Wie weit ist es vom Flughafen entfernt?' },
            { id: 'meeting', title: 'Tagungen & Events', subtitle: '6 verschiedene Säle', prompt: 'Können Sie mir über Ihre Tagungsräume erzählen?' },
            { id: 'reviews', title: 'Gästebewertungen', subtitle: 'Echte Erfahrungen', prompt: 'Was sagen Gäste über das Hotel?' },
            { id: 'booking', title: 'Reservierung', subtitle: 'Online Buchung', prompt: 'Ich möchte eine Reservierung machen' }
        ]
    },
    ru: {
        title: 'Blue Concierge',
        subtitle: 'ИИ Ассистент',
        welcome: 'Чем могу помочь?',
        welcomeSubtitle: 'Выберите тему, напишите или спросите голосом.',
        placeholder: 'Введите сообщение...',
        newChat: 'Новый чат',
        download: 'Скачать PDF',
        share: 'Поделиться',
        you: 'Вы',
        loading: 'Думает...',
        voiceNotSupported: 'Ваш браузер не поддерживает голосовые команды.',
        copied: 'История чата скопирована в буфер обмена.',
        select: 'Выбрать',
        backToMenu: 'Вернуться в меню',
        categories: [
            { id: 'rooms', title: 'Размещение', subtitle: 'Club, Deluxe и семейные номера', prompt: 'Расскажите о ваших номерах?' },
            { id: 'dining', title: 'Рестораны', subtitle: '4 ресторана, 10+ баров', prompt: 'Расскажите о ваших ресторанах?' },
            { id: 'spa', title: 'Спа и велнес', subtitle: 'Naya Spa', prompt: 'Расскажите о спа-услугах?' },
            { id: 'location', title: 'Расположение', subtitle: 'В сердце залива Торба', prompt: 'Где находится отель? Как далеко от аэропорта?' },
            { id: 'meeting', title: 'Конференции', subtitle: '6 залов', prompt: 'Расскажите о конференц-залах?' },
            { id: 'reviews', title: 'Отзывы гостей', subtitle: 'Реальный опыт', prompt: 'Что говорят гости об отеле?' },
            { id: 'booking', title: 'Бронирование', subtitle: 'Онлайн бронирование', prompt: 'Я хочу забронировать номер' }
        ]
    }
}

// Category images
const categoryImages: Record<string, string> = {
    rooms: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-2.jpg',
    dining: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MUR2661.jpg',
    spa: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00210.jpg',
    location: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg',
    meeting: 'https://bluedreamsresort.com/wp-content/uploads/2025/09/MER03962.jpg',
    reviews: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0233.jpg',
    booking: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00210.jpg'
}

// Room data
const ROOMS = [
    { id: 'club', title: 'Club Odalar', size: '20-22 m²', description: 'Modern tasarım ve deniz manzarası ile konforlu konaklama.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-2.jpg' },
    { id: 'deluxe', title: 'Deluxe Odalar', size: '25-28 m²', description: 'Geniş yaşam alanı ve premium konfor.', image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00132.jpg' },
    { id: 'family', title: 'Club Aile Odaları', size: '35 m²', description: 'Aileler için ideal, geniş yaşam alanı ve ayrı yatak bölümü.', image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00299.jpg' }
]

// Room details
const ROOM_DETAILS: Record<string, any> = {
    'Club Odalar': {
        title: 'Club Odalar',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-2.jpg',
        size: '20-22 m²',
        view: 'Deniz veya Bahçe',
        capacity: '2+1',
        features: ['Split Klima', 'Mini Bar', 'LCD TV', 'Elektronik Kasa', 'Saç Kurutma', 'Çay & Kahve Makinesi'],
        whyChoose: 'Sade ve modern dekorasyonu ile Ege\'nin mavisini odanıza taşıyan Club odalar, her detayında konforu hissettirir.'
    },
    'Deluxe Odalar': {
        title: 'Deluxe Odalar',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00132.jpg',
        size: '25-28 m²',
        view: 'Deniz Manzarası',
        capacity: '2+2',
        features: ['Merkezi Klima', 'Mini Bar', 'LCD TV', 'Elektronik Kasa', 'Jakuzi', 'Geniş Balkon'],
        whyChoose: 'Premium konfor ve geniş yaşam alanı ile Torba Koyu\'nun eşsiz manzarasında unutulmaz bir tatil.'
    },
    'Club Aile Odaları': {
        title: 'Club Aile Odaları',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00299.jpg',
        size: '35 m²',
        view: 'Bahçe ve Kısmi Deniz',
        capacity: '4 Yetişkin',
        features: ['2 Yatak Odası', 'Oturma Alanı', 'Merkezi Klima', 'Mini Bar', '2 LCD TV', 'Geniş Balkon'],
        whyChoose: 'Çocuklarıyla birlikte konforlu bir tatil planlayan aileler için özel olarak tasarlanmıştır.'
    }
}

// UI Widgets
const RoomsWidget = ({ onInteract, locale = 'tr' }: { onInteract: (text: string) => void; locale?: string }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {ROOMS.map(room => (
            <div key={room.id} className="bg-white rounded-xl overflow-hidden shadow-lg group relative">
                <div className="h-40 overflow-hidden relative">
                    <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-2 right-2">
                        <VoiceButton text={`${room.title}. ${room.description}`} lang={locale} />
                    </div>
                    <div className="absolute bottom-3 left-3 text-white">
                        <h4 className="font-bold text-lg">{room.title}</h4>
                        <span className="text-xs bg-white/20 backdrop-blur px-2 py-0.5 rounded">{room.size}</span>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{room.description}</p>
                    <button
                        onClick={() => onInteract(`${room.title} detaylarını göster`)}
                        className="mt-3 w-full text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-600 px-3 py-2 rounded-full transition-all flex items-center justify-center gap-1"
                    >
                        İncele <ChevronRight size={12} />
                    </button>
                </div>
            </div>
        ))}
    </div>
)

const RoomDetailWidget = ({ data, locale = 'tr' }: { data: any; locale?: string }) => {
    const speakContent = `${data.title}. ${data.whyChoose || ''}. ${data.view} manzaralı. ${data.size} büyüklüğünde.`
    return (
        <div className="bg-white rounded-2xl overflow-hidden mt-4 shadow-xl">
            <div className="h-56 relative">
                <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                <div className="absolute top-3 right-3">
                    <VoiceButton text={speakContent} lang={locale} className="bg-black/30 hover:bg-black/50" />
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{data.title}</h3>
                    <p className="text-sm opacity-90">{data.view}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b bg-gray-50">
                <div className="p-3 text-center">
                    <Scan size={16} className="mx-auto text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-gray-600">{data.size}</span>
                </div>
                <div className="p-3 text-center">
                    <Users size={16} className="mx-auto text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-gray-600">{data.capacity}</span>
                </div>
                <div className="p-3 text-center">
                    <BedDouble size={16} className="mx-auto text-blue-600 mb-1" />
                    <span className="text-xs font-bold text-gray-600">Konfor</span>
                </div>
            </div>
            <div className="p-5 space-y-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-600 mb-2 flex items-center gap-2">
                        <Sparkles size={14} /> Neden Bu Odayı Seçmelisiniz?
                    </h4>
                    <p className="text-xs text-gray-700">{data.whyChoose}</p>
                </div>
                <div>
                    <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Oda Özellikleri</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {data.features?.map((feat: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                <CheckCircle2 size={12} className="text-green-500" />
                                {feat}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <a href="tel:+902523371111" className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                        <Phone size={14} /> Call Center
                    </a>
                    <a href="https://blue-dreams.rezervasyonal.com" target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                        Rezervasyon
                    </a>
                </div>
            </div>
        </div>
    )
}

const LocationWidget = ({ onInteract, locale = 'tr' }: { onInteract: (text: string) => void; locale?: string }) => (
    <div className="bg-white p-2 rounded-2xl shadow-lg mt-4">
        <div className="h-48 w-full rounded-xl overflow-hidden">
            <iframe
                src="https://maps.google.com/maps?q=37.091832,27.4824998&hl=tr&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
            />
        </div>
        <div className="p-4">
            <div className="flex items-start gap-3 mb-4 border-b pb-4">
                <MapPin size={24} className="text-blue-600 shrink-0" />
                <div className="flex-1">
                    <h5 className="font-bold text-gray-900">Blue Dreams Resort</h5>
                    <p className="text-xs text-gray-600 mt-1">Torba Mah. Herodot Bulvarı No:11<br />Bodrum/Muğla</p>
                </div>
                <VoiceButton text="Blue Dreams Resort, Torba Mahallesinde, Bodrum merkeze 10 kilometre, havalimanına 25 kilometre uzaklıktadır." lang={locale} className="bg-gray-100 text-gray-600" />
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">
                    <Plane size={16} className="text-blue-600" />
                    <span>Havalimanı: <b>25 km</b></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">
                    <Car size={16} className="text-blue-600" />
                    <span>Merkez: <b>10 km</b></span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <a href="https://www.google.com/maps/dir//37.091832,27.4824998" target="_blank" rel="noreferrer" className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                    <Map size={14} /> Yol Tarifi
                </a>
                <button onClick={() => onInteract("Havalimanı transferi için form doldurmak istiyorum")} className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                    <Car size={14} /> Transfer
                </button>
            </div>
        </div>
    </div>
)

const ContactWidget = () => (
    <div className="grid grid-cols-2 gap-4 mt-4">
        <a href="tel:+902523371111" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3 group-hover:scale-110 transition-transform">
                <Phone size={24} />
            </div>
            <span className="text-sm font-bold text-gray-800">Hemen Ara</span>
        </a>
        <a href="https://wa.me/902523371111" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3 group-hover:scale-110 transition-transform">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-800">WhatsApp</span>
        </a>
    </div>
)

// ─── Dining Widget ─────────────────────────────────────────
const DINING_DATA = [
    { id: 'main', title: 'Ana Restoran', type: 'Açık Büfe', desc: 'Uluslararası mutfak, kahvaltı-öğle-akşam açık büfe', image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MUR2661.jpg', hours: '07:00-22:00' },
    { id: 'ala', title: 'A La Carte', type: 'Rezervasyonlu', desc: 'Özel menü seçenekleri ile à la carte deneyim', image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00210.jpg', hours: '19:00-22:00' },
    { id: 'beach', title: 'Beach Bar & Restoran', type: 'Snack & İçecek', desc: 'Havuz ve deniz başında hafif atıştırmalıklar', image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0233.jpg', hours: '10:00-18:00' },
    { id: 'lobby', title: 'Lobby Bar', type: 'Bar', desc: 'Kokteyl ve canlı müzik eşliğinde keyif', image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00132.jpg', hours: '16:00-01:00' },
]

const DiningWidget = ({ onInteract, locale = 'tr' }: { onInteract: (text: string) => void; locale?: string }) => (
    <div className="space-y-3 mt-4">
        {DINING_DATA.map(d => (
            <div key={d.id} className="bg-white rounded-xl overflow-hidden shadow-lg flex group">
                <div className="w-28 h-28 flex-shrink-0 overflow-hidden relative">
                    <img src={d.image} alt={d.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-gray-900">{d.title}</h4>
                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-bold">{d.type}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{d.desc}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-gray-400">🕐 {d.hours}</span>
                        <button onClick={() => onInteract(`${d.title} hakkında detaylı bilgi ver`)} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                            Detay <ChevronRight size={10} />
                        </button>
                    </div>
                </div>
            </div>
        ))}
    </div>
)

// ─── Spa Widget ────────────────────────────────────────────
const SPA_SERVICES = [
    { title: 'Türk Hamamı', desc: 'Geleneksel köpük masajı', icon: '🧖' },
    { title: 'Masaj Terapisi', desc: 'Aromaterapi & Bali masajı', icon: '💆' },
    { title: 'Sauna & Buhar', desc: 'Fin saunası, buhar odası', icon: '♨️' },
    { title: 'Güzellik', desc: 'Cilt bakımı & peeling', icon: '✨' },
]

const SpaWidget = ({ onInteract, locale = 'tr' }: { onInteract: (text: string) => void; locale?: string }) => (
    <div className="bg-white rounded-2xl overflow-hidden mt-4 shadow-xl">
        <div className="h-40 relative">
            <img src="https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00210.jpg" alt="Naya Spa" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
                <h3 className="text-xl font-bold">Naya Spa & Wellness</h3>
                <p className="text-xs opacity-80">Huzur ve yenilenme deneyimi</p>
            </div>
            <div className="absolute top-2 right-2">
                <VoiceButton text="Naya Spa, Türk hamamı, masaj terapisi, sauna ve güzellik hizmetleri sunar." lang={locale} />
            </div>
        </div>
        <div className="grid grid-cols-2 gap-3 p-4">
            {SPA_SERVICES.map((s, i) => (
                <button key={i} onClick={() => onInteract(`${s.title} hakkında bilgi ver`)} className="bg-gray-50 hover:bg-blue-50 p-3 rounded-xl text-left transition-colors group">
                    <span className="text-xl">{s.icon}</span>
                    <h5 className="font-bold text-xs text-gray-900 mt-1">{s.title}</h5>
                    <p className="text-[10px] text-gray-500">{s.desc}</p>
                </button>
            ))}
        </div>
        <div className="px-4 pb-4">
            <button onClick={() => onInteract('Spa fiyatlarını göster')} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2">
                <Waves size={14} /> Randevu & Fiyat Bilgisi
            </button>
        </div>
    </div>
)

// ─── Meeting Widget ────────────────────────────────────────
const MeetingWidget = ({ onInteract, locale = 'tr' }: { onInteract: (text: string) => void; locale?: string }) => (
    <div className="bg-white rounded-2xl overflow-hidden mt-4 shadow-xl">
        <div className="h-36 relative">
            <img src="https://bluedreamsresort.com/wp-content/uploads/2026/01/Bluedreamstanitimkiti_page-0019-1024x725.jpg" alt="Meeting" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
                <h3 className="text-lg font-bold">Toplantı & Etkinlik</h3>
                <p className="text-xs opacity-80">6 Farklı Salon • 700+ Kişi Kapasitesi</p>
            </div>
        </div>
        <div className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-2">
                {['Konferans', 'Düğün', 'Gala'].map(name => (
                    <button key={name} onClick={() => onInteract(`${name} organizasyonu hakkında bilgi`)} className="bg-gray-50 hover:bg-blue-50 p-2.5 rounded-lg text-center transition-colors">
                        <span className="text-xs font-bold text-gray-700">{name}</span>
                    </button>
                ))}
            </div>
            <button onClick={() => onInteract('Toplantı salonu fiyatları ve kapasiteleri')} className="w-full bg-gray-900 text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2">
                <Users size={14} /> Detaylı Bilgi Al
            </button>
        </div>
    </div>
)

// ─── KVKK Consent Widget ───────────────────────────────────
const KVKKConsentWidget = ({ onAccept }: { onAccept: () => void }) => {
    const [accepted, setAccepted] = useState(false)
    return (
        <div className="bg-white rounded-2xl overflow-hidden mt-4 shadow-xl border border-blue-100">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-3 flex items-center gap-2 text-white">
                <Shield size={18} />
                <h4 className="font-bold text-xs uppercase">Kişisel Verilerin Korunması</h4>
            </div>
            <div className="p-4 space-y-3">
                <p className="text-xs text-gray-600 leading-relaxed">
                    6698 sayılı KVKK kapsamında, kişisel verileriniz Blue Dreams Resort & Spa tarafından
                    rezervasyon, transfer ve iletişim hizmetleri amacıyla işlenecektir.
                    Verileriniz üçüncü kişilerle paylaşılmaz ve talep halinde silinir.
                </p>
                <a href="/tr/kvkk" target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-medium">
                    Aydınlatma Metninin Tamamı →
                </a>
                <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} className="mt-0.5 accent-blue-600" />
                    <span className="text-xs text-gray-700">
                        Kişisel verilerimin işlenmesine ilişkin aydınlatma metnini okudum ve onaylıyorum.
                    </span>
                </label>
                <button
                    disabled={!accepted}
                    onClick={onAccept}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-2"
                >
                    <CheckCircle2 size={14} /> Onaylıyorum, Devam Et
                </button>
            </div>
        </div>
    )
}

// ─── Quick Actions Widget ──────────────────────────────────
const TOPIC_ACTIONS: Record<string, { label: string; prompt: string; icon: string }[]> = {
    rooms: [
        { label: 'Fiyat Sorgula', prompt: 'Oda fiyatlarını görmek istiyorum', icon: '💰' },
        { label: 'Rezervasyon Yap', prompt: 'Rezervasyon yapmak istiyorum', icon: '📅' },
        { label: 'Diğer Odalar', prompt: 'Tüm oda tiplerini göster', icon: '🏨' },
    ],
    dining: [
        { label: 'A La Carte Menü', prompt: 'A La Carte restoran menüsü nedir?', icon: '🍽️' },
        { label: 'Çalışma Saatleri', prompt: 'Restoranların çalışma saatleri nedir?', icon: '🕐' },
        { label: 'Oda Servisi', prompt: 'Oda servisi var mı?', icon: '🛎️' },
    ],
    spa: [
        { label: 'Fiyat Listesi', prompt: 'Spa fiyatları nedir?', icon: '💆' },
        { label: 'Randevu Al', prompt: 'Spa randevusu nasıl alınır?', icon: '📋' },
        { label: 'Tesis Detayları', prompt: 'Spa tesisi hakkında detaylı bilgi', icon: '🏊' },
    ],
    location: [
        { label: 'Transfer', prompt: 'Havalimanı transferi hakkında bilgi', icon: '🚗' },
        { label: 'Çevre Gezileri', prompt: 'Bodrum çevresinde gezilecek yerler', icon: '🗺️' },
        { label: 'Ulaşım', prompt: 'Otele nasıl ulaşılır?', icon: '✈️' },
    ],
    booking: [
        { label: 'Fiyat Kontrol', prompt: 'Bugünden itibaren 3 gecelik fiyat nedir?', icon: '💰' },
        { label: 'Erken Rezervasyon', prompt: 'Erken rezervasyon indirimi var mı?', icon: '🏷️' },
        { label: 'İptal Şartları', prompt: 'İptal ve değişiklik koşulları nelerdir?', icon: '📄' },
    ],
    default: [
        { label: 'Odalar', prompt: 'Oda tiplerini göster', icon: '🛏️' },
        { label: 'Restoranlar', prompt: 'Restoranları göster', icon: '🍴' },
        { label: 'Fiyat Sorgula', prompt: 'Oda fiyatlarını görmek istiyorum', icon: '💰' },
        { label: 'Rezervasyon', prompt: 'Rezervasyon yapmak istiyorum', icon: '📅' },
    ]
}

const QuickActionsWidget = ({ topic, onInteract }: { topic: string; onInteract: (text: string) => void }) => {
    const actions = TOPIC_ACTIONS[topic] || TOPIC_ACTIONS.default
    return (
        <div className="flex flex-wrap gap-2 mt-3">
            {actions.map((a, i) => (
                <button
                    key={i}
                    onClick={() => onInteract(a.prompt)}
                    className="bg-white/90 hover:bg-white text-gray-700 hover:text-blue-700 px-3 py-2 rounded-full text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 border border-white/50 hover:border-blue-200"
                >
                    <span>{a.icon}</span> {a.label}
                </button>
            ))}
        </div>
    )
}

// ─── Topic Image Banner ────────────────────────────────────
const topicImages: Record<string, { image: string; label: string }> = {
    rooms: { image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-2.jpg', label: 'Konaklama' },
    dining: { image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MUR2661.jpg', label: 'Yeme & İçme' },
    spa: { image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00210.jpg', label: 'Spa & Wellness' },
    location: { image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg', label: 'Konum' },
    meeting: { image: 'https://bluedreamsresort.com/wp-content/uploads/2026/01/Bluedreamstanitimkiti_page-0019-1024x725.jpg', label: 'Toplantı' },
    reviews: { image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0233.jpg', label: 'Yorumlar' },
    booking: { image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/MER00210.jpg', label: 'Rezervasyon' },
    price: { image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-2.jpg', label: 'Fiyatlar' },
}

function detectTopic(text: string): string {
    const lower = text.toLowerCase()
    if (/oda|room|club|deluxe|aile|family|konaklama|yatak/i.test(lower)) return 'rooms'
    if (/restoran|yemek|dining|bar|menü|kahvaltı|akşam/i.test(lower)) return 'dining'
    if (/spa|masaj|hamam|sauna|wellness|güzellik/i.test(lower)) return 'spa'
    if (/konum|ulaşım|havalimanı|transfer|yol|adres|location/i.test(lower)) return 'location'
    if (/toplantı|meeting|konferans|düğün|etkinlik|salon/i.test(lower)) return 'meeting'
    if (/yorum|review|puan|deneyim|misafir/i.test(lower)) return 'reviews'
    if (/rezervasyon|booking|fiyat|price|ücret|tarife|müsait/i.test(lower)) return 'booking'
    return 'default'
}

const TopicBanner = ({ topic }: { topic: string }) => {
    const info = topicImages[topic]
    if (!info) return null
    return (
        <div className="h-24 rounded-xl overflow-hidden relative mb-2">
            <img src={info.image} alt={info.label} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
            <div className="absolute bottom-2 left-3 text-white">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-white/20 backdrop-blur px-2 py-0.5 rounded-full">{info.label}</span>
            </div>
        </div>
    )
}

const ReviewsWidget = () => {
    const reviews = [
        { author: 'Ahmet Y.', text: 'Mükemmel bir tatil geçirdik. Personel çok ilgili, yemekler harika.' },
        { author: 'Sarah M.', text: 'Beautiful resort with amazing sea view. Highly recommend!' }
    ]
    return (
        <div className="flex flex-col gap-4 mt-4">
            {reviews.map((review, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border-l-4 border-blue-600 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-gray-800">{review.author}</span>
                        <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 italic">"{review.text}"</p>
                </div>
            ))}
        </div>
    )
}

const BookingWidget = () => {
    const [arrival, setArrival] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]
    })
    const [departure, setDeparture] = useState(() => {
        const d = new Date(); d.setDate(d.getDate() + 4); return d.toISOString().split('T')[0]
    })
    const [guests, setGuests] = useState('2')
    const [checking, setChecking] = useState(false)
    const [prices, setPrices] = useState<any>(null)

    const handleCheckPrice = async () => {
        if (!arrival || !departure) return
        setChecking(true)
        setPrices(null)
        try {
            const res = await fetch(`/api/rooms/pricing?currency=EUR&from=${arrival}&to=${departure}`)
            if (res.ok) {
                const data = await res.json()
                setPrices(data)
            }
        } catch { /* ignore */ }
        setChecking(false)
    }

    return (
        <div className="bg-white rounded-2xl overflow-hidden mt-4 shadow-xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center gap-3 text-white">
                <CalendarDays size={20} />
                <h4 className="font-bold text-sm uppercase">Online Rezervasyon</h4>
            </div>
            <div className="p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Giriş Tarihi</label>
                        <input type="date" value={arrival} onChange={(e) => setArrival(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Çıkış Tarihi</label>
                        <input type="date" value={departure} onChange={(e) => setDeparture(e.target.value)}
                            min={arrival}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kişi Sayısı</label>
                    <select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none">
                        <option>1</option><option>2</option><option>3</option><option>4+</option>
                    </select>
                </div>
                <button onClick={handleCheckPrice} disabled={checking}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50">
                    {checking ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    {checking ? 'Fiyatlar Kontrol Ediliyor...' : 'Fiyat Sorgula'}
                </button>
                {prices?.rooms?.length > 0 && (
                    <div className="divide-y divide-gray-100 bg-gray-50 rounded-xl overflow-hidden">
                        {prices.rooms.map((room: any, i: number) => (
                            <div key={i} className="p-3 flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-xs text-gray-900">{room.name}</p>
                                    {room.available ? (
                                        <span className="text-[10px] text-green-600">✓ Müsait</span>
                                    ) : (
                                        <span className="text-[10px] text-red-500">✗ Dolu</span>
                                    )}
                                </div>
                                <div className="text-right">
                                    {room.minPrice ? (
                                        <><span className="text-lg font-black text-emerald-600">{room.minPrice}€</span><span className="text-[10px] text-gray-400 block">/ gece</span></>
                                    ) : <span className="text-xs text-gray-400">—</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <a href={`https://blue-dreams.rezervasyonal.com/?arrival=${arrival}&departure=${departure}`} target="_blank" rel="noreferrer"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all">
                    <CalendarDays size={16} /> Rezervasyon Tamamla
                </a>
                <p className="text-xs text-gray-400 text-center">Elektra PMS ile entegre • Güvenli ödeme</p>
            </div>
        </div>
    )
}

const PricingWidget = ({ data }: { data: any }) => {
    if (!data?.rooms?.length) return null

    return (
        <div className="bg-white rounded-2xl overflow-hidden mt-4 shadow-xl">
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex items-center gap-3 text-white">
                <TrendingUp size={20} />
                <div>
                    <h4 className="font-bold text-sm uppercase">Güncel Oda Fiyatları</h4>
                    <p className="text-xs opacity-80">{data.checkIn} → {data.checkOut} • Elektra PMS</p>
                </div>
            </div>
            <div className="divide-y divide-gray-100">
                {data.rooms.map((room: any, i: number) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                        <div className="flex-1">
                            <p className="font-bold text-sm text-gray-900">{room.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                {room.available ? (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Müsait</span>
                                ) : (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600">Dolu</span>
                                )}
                                {room.hasDiscount && (
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">İndirimli</span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            {room.minPrice ? (
                                <>
                                    {room.hasDiscount && room.maxBasePrice && (
                                        <span className="text-xs text-gray-400 line-through block">{room.maxBasePrice}€</span>
                                    )}
                                    <span className="text-xl font-black text-emerald-600">{room.minPrice}€</span>
                                    <span className="text-xs text-gray-400 block">/ gece</span>
                                </>
                            ) : (
                                <span className="text-sm text-gray-400">—</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            {data.bookingUrl && (
                <div className="p-4 bg-gray-50">
                    <a
                        href={data.bookingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg transition-all"
                    >
                        <ExternalLink size={16} /> Hemen Rezervasyon Yap
                    </a>
                </div>
            )}
        </div>
    )
}

const TransferFormWidget = () => {
    const [sent, setSent] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setTimeout(() => setSent(true), 1000)
    }

    if (sent) {
        return (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl mt-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                    <Check size={24} />
                </div>
                <h4 className="font-bold text-green-800 text-lg mb-2">Talebiniz Alındı</h4>
                <p className="text-sm text-green-700">Transfer talebiniz iletilmiştir. En kısa sürede iletişime geçeceğiz.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl overflow-hidden mt-4 shadow-xl">
            <div className="bg-gray-900 p-4 flex items-center gap-3 text-white">
                <Car size={20} className="text-blue-400" />
                <h4 className="font-bold text-sm uppercase">VIP Transfer Formu</h4>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ad Soyad</label>
                    <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Telefon</label>
                    <input type="tel" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tarih</label>
                        <input type="date" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kişi Sayısı</label>
                        <select className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none">
                            <option>1</option>
                            <option>2</option>
                            <option>3</option>
                            <option>4+</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                    Gönder <Send size={16} />
                </button>
            </form>
        </div>
    )
}

// Main Component
export function BlueConciergeFull({ isOpen, onClose, locale = 'tr' }: BlueConciergFullProps) {
    const [input, setInput] = useState('')
    const [messages, setMessages] = useState<Message[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const t = translations[locale] || translations.tr

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    // Voice Recognition
    const startListening = useCallback(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
            const recognition = new SpeechRecognition()
            recognition.lang = locale === 'tr' ? 'tr-TR' : locale === 'de' ? 'de-DE' : locale === 'ru' ? 'ru-RU' : 'en-US'
            recognition.continuous = false
            recognition.interimResults = false

            recognition.onstart = () => setIsListening(true)
            recognition.onend = () => setIsListening(false)
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript
                setInput(transcript)
                handleSend(transcript)
            }

            recognition.start()
        } else {
            alert(t.voiceNotSupported)
        }
    }, [locale, t.voiceNotSupported])

    // Share
    const handleShare = async () => {
        const text = messages
            .filter(m => !m.isFunctionCall)
            .map(m => `${m.role === 'user' ? t.you : t.title}: ${m.text}`)
            .join('\n\n')

        if (!text) return

        if (navigator.share) {
            try {
                await navigator.share({ title: 'Blue Dreams Resort Chat', text })
            } catch (err) {
                console.log('Sharing failed', err)
            }
        } else {
            navigator.clipboard.writeText(text)
            alert(t.copied)
        }
    }

    // Process message with AI
    const processMessage = async (newMessages: Message[]) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, text: m.text })),
                    locale
                })
            })

            if (!response.ok) throw new Error('AI request failed')

            const data = await response.json()

            // Detect topic from user's last message for actions & banner
            const lastUserMsg = newMessages.filter(m => m.role === 'user').pop()?.text || ''
            const topic = detectTopic(lastUserMsg)

            if (data.uiPayload) {
                // Handle UI widget response
                let payloadData = null
                if (data.uiPayload.type === 'room_detail' && data.uiPayload.detailId) {
                    const roomKey = Object.keys(ROOM_DETAILS).find(k =>
                        data.uiPayload.detailId.includes(k) || k.includes(data.uiPayload.detailId)
                    ) || 'Club Odalar'
                    payloadData = ROOM_DETAILS[roomKey]
                }

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: data.text || data.uiPayload.message || 'İşte istediğiniz bilgiler:',
                    uiPayload: { type: data.uiPayload.type, data: payloadData },
                    data: { ...(data.data || {}), _topic: topic }
                }])
            } else {
                // Even plain text responses get topic + quick actions
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: data.text || 'Üzgünüm, yanıt oluşturulamadı.',
                    data: { _topic: topic }
                }])
            }
        } catch (error) {
            console.error('AI Error:', error)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: 'Üzgünüm, şu anda bağlantı sorunu yaşıyorum. Lütfen daha sonra tekrar deneyin.',
                data: { _topic: 'default' }
            }])
        } finally {
            setIsLoading(false)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }

    const handleSend = (text: string) => {
        if (!text.trim() || isLoading) return
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text }
        const newHistory = [...messages, userMsg]
        setMessages(newHistory)
        setInput('')
        processMessage(newHistory)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 text-gray-800 animate-fade-in font-sans">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-40 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90 backdrop-blur-xl" />
            </div>

            {/* Main Container */}
            <div className="relative z-10 flex flex-col h-full max-w-5xl mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="flex items-center justify-between py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-blue-600 to-blue-400 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
                            <Sparkles size={24} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{t.title}</h2>
                            <p className="text-xs text-blue-300 font-medium uppercase tracking-widest">{t.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {messages.length > 0 && (
                            <>
                                <button onClick={handleShare} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors" title={t.share}>
                                    <Share2 size={20} />
                                </button>
                                <button onClick={() => setMessages([])} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors" title={t.newChat}>
                                    <RefreshCw size={20} />
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-6">

                    {/* Welcome Screen */}
                    {messages.length === 0 ? (
                        <div className="min-h-full flex flex-col justify-start md:justify-center pt-16 md:pt-0 animate-fade-in pb-10">
                            <div className="text-center mb-10">
                                <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.welcome}</h1>
                                <p className="text-base text-white/70 max-w-2xl mx-auto">{t.welcomeSubtitle}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {t.categories.map((cat) => (
                                    <div
                                        key={cat.id}
                                        onClick={() => handleSend(cat.prompt)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSend(cat.prompt) }}
                                        role="button"
                                        tabIndex={0}
                                        className="group relative h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-1 cursor-pointer"
                                    >
                                        <img src={categoryImages[cat.id]} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            <VoiceButton text={`${cat.title}. ${cat.subtitle}`} lang={locale} />
                                        </div>
                                        <div className="absolute bottom-0 left-0 p-5 text-left w-full">
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{cat.title}</h3>
                                            <p className="text-xs text-white/60 mb-2">{cat.subtitle}</p>
                                            <div className="flex items-center text-xs font-bold uppercase text-white/80 group-hover:text-white transition-all">
                                                {t.select} <ArrowRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        /* Chat Conversation */
                        <div className="max-w-3xl mx-auto space-y-6 pb-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        {msg.role === 'model' ? (
                                            <>
                                                <Sparkles size={14} className="text-blue-400" />
                                                <span className="text-xs font-bold text-blue-400 uppercase">{t.title}</span>
                                            </>
                                        ) : (
                                            <span className="text-xs font-bold text-white/50 uppercase">{t.you}</span>
                                        )}
                                    </div>

                                    <div className={`relative max-w-[90%] md:max-w-[80%] p-4 md:p-5 text-sm md:text-base leading-relaxed shadow-xl backdrop-blur-md ${msg.role === 'user'
                                        ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                        : msg.isFunctionCall
                                            ? 'bg-white/10 text-white/80 border border-white/20 italic rounded-2xl'
                                            : 'bg-white/95 text-gray-800 rounded-2xl rounded-tl-sm'
                                        }`}>
                                        {msg.text}
                                        {msg.role === 'model' && !msg.isFunctionCall && (
                                            <div className="absolute -bottom-8 left-0">
                                                <VoiceButton text={msg.text} lang={locale} className="bg-white/5 hover:bg-white/20 scale-90" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Topic Image Banner — always show for model responses */}
                                    {msg.role === 'model' && !msg.isFunctionCall && msg.data?._topic && msg.data._topic !== 'default' && !msg.uiPayload && (
                                        <div className="mt-3 w-full md:max-w-[85%]">
                                            <TopicBanner topic={msg.data._topic} />
                                        </div>
                                    )}

                                    {msg.uiPayload && (
                                        <div className="mt-4 w-full md:max-w-[85%]">
                                            {msg.uiPayload.type === 'rooms' && <RoomsWidget onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'room_detail' && <RoomDetailWidget data={msg.uiPayload.data} />}
                                            {msg.uiPayload.type === 'location' && <LocationWidget onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'contact' && <ContactWidget />}
                                            {msg.uiPayload.type === 'reviews' && <ReviewsWidget />}
                                            {msg.uiPayload.type === 'transfer_form' && <KVKKConsentWidget onAccept={() => { }} />}
                                            {msg.uiPayload.type === 'kvkk_transfer' && <KVKKConsentWidget onAccept={() => {
                                                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'KVKK onayı alındı. Transfer formu:', uiPayload: { type: 'transfer_inner' }, data: null }])
                                            }} />}
                                            {msg.uiPayload.type === 'transfer_inner' && <TransferFormWidget />}
                                            {msg.uiPayload.type === 'booking_form' && <BookingWidget />}
                                            {msg.uiPayload.type === 'price_result' && <PricingWidget data={msg.data} />}
                                            {msg.uiPayload.type === 'dining' && <DiningWidget onInteract={handleSend} locale={locale} />}
                                            {msg.uiPayload.type === 'spa' && <SpaWidget onInteract={handleSend} locale={locale} />}
                                            {msg.uiPayload.type === 'meeting' && <MeetingWidget onInteract={handleSend} locale={locale} />}
                                        </div>
                                    )}

                                    {/* Quick Actions — always show after model response */}
                                    {msg.role === 'model' && !msg.isFunctionCall && (
                                        <div className="w-full md:max-w-[85%]">
                                            <QuickActionsWidget topic={msg.data?._topic || 'default'} onInteract={handleSend} />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex items-start gap-2 animate-pulse">
                                    <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm flex gap-1">
                                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Footer / Input Area */}
                <div className="py-6">
                    <div className="max-w-3xl mx-auto bg-white rounded-full p-2 shadow-2xl flex items-center gap-2 border border-white/20">

                        {messages.length > 0 && (
                            <button
                                onClick={() => setMessages([])}
                                className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-colors hidden md:block"
                                title={t.backToMenu}
                            >
                                <ArrowLeft size={20} />
                            </button>
                        )}

                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                            placeholder={t.placeholder}
                            className="flex-1 px-4 py-3 text-gray-800 placeholder-gray-400 outline-none text-base bg-transparent"
                            disabled={isLoading}
                        />

                        <button
                            onClick={startListening}
                            className={`p-3 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600 animate-pulse' : 'hover:bg-gray-100 text-gray-400'}`}
                            title="Voice Input"
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <button
                            onClick={() => handleSend(input)}
                            disabled={isLoading || !input.trim()}
                            className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
        </div>
    )
}
