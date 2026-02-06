'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { X, Send, Sparkles, Mic, MicOff, RefreshCw, ChevronRight, Phone, MapPin, ArrowLeft, ArrowRight, Download, Share2, BedDouble, Users, Scan, CheckCircle2, Plane, Car, Map, Check, Star, Volume2, StopCircle } from 'lucide-react'

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
            { id: 'reviews', title: 'Misafir Yorumları', subtitle: 'Gerçek deneyimler', prompt: 'Misafirler otel hakkında neler söylüyor?' }
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
            { id: 'reviews', title: 'Guest Reviews', subtitle: 'Real experiences', prompt: 'What do guests say about the hotel?' }
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
            { id: 'reviews', title: 'Gästebewertungen', subtitle: 'Echte Erfahrungen', prompt: 'Was sagen Gäste über das Hotel?' }
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
            { id: 'reviews', title: 'Отзывы гостей', subtitle: 'Реальный опыт', prompt: 'Что говорят гости об отеле?' }
        ]
    }
}

// Category images
const categoryImages: Record<string, string> = {
    rooms: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
    dining: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg',
    spa: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SPA-04.jpg',
    location: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg',
    meeting: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/meeting-room.jpg',
    reviews: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg'
}

// Room data
const ROOMS = [
    { id: 'club', title: 'Club Odalar', size: '20-22 m²', description: 'Modern tasarım ve deniz manzarası ile konforlu konaklama.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' },
    { id: 'deluxe', title: 'Deluxe Odalar', size: '25-28 m²', description: 'Geniş yaşam alanı ve premium konfor.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg' },
    { id: 'family', title: 'Aile Suitleri', size: '35 m²', description: 'Aileler için ideal, iki ayrı yatak odası.', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg' }
]

// Room details
const ROOM_DETAILS: Record<string, any> = {
    'Club Odalar': {
        title: 'Club Odalar',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
        size: '20-22 m²',
        view: 'Deniz veya Bahçe',
        capacity: '2+1',
        features: ['Klima', 'Mini Bar', 'LCD TV', 'Safe', 'Saç Kurutma', 'Balkon'],
        whyChoose: 'Şık ve modern çizgilerle tasarlanan bu odalar, hem Ege Denizi hem de sonsuzluk havuzu manzarasını aynı anda sunar.'
    },
    'Deluxe Odalar': {
        title: 'Deluxe Odalar',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
        size: '25-28 m²',
        view: 'Deniz Manzarası',
        capacity: '2+2',
        features: ['Klima', 'Mini Bar', 'LCD TV', 'Safe', 'Jakuzi', 'Geniş Balkon'],
        whyChoose: 'Premium konfor ve geniş yaşam alanı ile unutulmaz bir tatil deneyimi.'
    },
    'Aile Suitleri': {
        title: 'Club Aile Odaları',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
        size: '35 m²',
        view: 'Bahçe ve Kısmi Deniz',
        capacity: '4 Yetişkin',
        features: ['2 Yatak Odası', 'Oturma Alanı', 'Klima', 'Mini Bar', '2 LCD TV', 'Geniş Balkon'],
        whyChoose: 'Çocuklarıyla birlikte konforlu bir tatil planlayan misafirler için özel olarak tasarlanmıştır.'
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
                    <a href="https://bluedreamsresort.com/rezervasyon" target="_blank" rel="noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
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
                    uiPayload: { type: data.uiPayload.type, data: payloadData }
                }])
            } else {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    role: 'model',
                    text: data.text || 'Üzgünüm, yanıt oluşturulamadı.'
                }])
            }
        } catch (error) {
            console.error('AI Error:', error)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: 'Üzgünüm, şu anda bağlantı sorunu yaşıyorum. Lütfen daha sonra tekrar deneyin.'
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
                    src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg"
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
                                    <button
                                        key={cat.id}
                                        onClick={() => handleSend(cat.prompt)}
                                        className="group relative h-48 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-1"
                                    >
                                        <img src={categoryImages[cat.id]} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <VoiceButton text={`${cat.title}. ${cat.subtitle}`} lang={locale} />
                                        </div>
                                        <div className="absolute bottom-0 left-0 p-5 text-left w-full">
                                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">{cat.title}</h3>
                                            <p className="text-xs text-white/60 mb-2">{cat.subtitle}</p>
                                            <div className="flex items-center text-xs font-bold uppercase text-white/80 group-hover:text-white transition-all">
                                                {t.select} <ArrowRight size={12} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        </div>
                                    </button>
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

                                    {msg.uiPayload && (
                                        <div className="mt-4 w-full md:max-w-[85%]">
                                            {msg.uiPayload.type === 'rooms' && <RoomsWidget onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'room_detail' && <RoomDetailWidget data={msg.uiPayload.data} />}
                                            {msg.uiPayload.type === 'location' && <LocationWidget onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'contact' && <ContactWidget />}
                                            {msg.uiPayload.type === 'reviews' && <ReviewsWidget />}
                                            {msg.uiPayload.type === 'transfer_form' && <TransferFormWidget />}
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
