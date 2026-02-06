'use client'

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Mic, MicOff, RefreshCw, ChevronRight, Phone, MapPin, Star, ArrowLeft, ArrowRight, Download, Share2, ExternalLink, BedDouble, Users, Scan, CheckCircle2, Plane, Car, Map, Check, Presentation, Ruler, Maximize } from 'lucide-react';
import { jsPDF } from "jspdf";

// --- TYPES ---
interface UiPayload {
    type: 'rooms' | 'contact' | 'location' | 'reviews' | 'amenities' | 'price_result' | 'dining' | 'room_detail' | 'transfer_form' | 'meeting';
    data?: any;
}

interface Message {
    id: string;
    role: 'user' | 'model';
    text: string;
    isFunctionCall?: boolean;
    uiPayload?: UiPayload;
}

interface AiAssistantProps {
    isOpen: boolean;
    onClose: () => void;
}

interface VisualCategory {
    id: string;
    title: string;
    subtitle: string;
    image: string;
    prompt: string;
}

const VISUAL_CATEGORIES: VisualCategory[] = [
    {
        id: 'rooms',
        title: 'Konaklama',
        subtitle: 'Club, Deluxe ve Aile Odaları',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
        prompt: 'Bana oteldeki oda seçeneklerini ve özelliklerini gösterir misin?'
    },
    {
        id: 'dining',
        title: 'Gastronomi',
        subtitle: 'Begonvil ve A\'la Carte',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg',
        prompt: 'Otelde hangi restoranlar var?'
    },
    {
        id: 'spa',
        title: 'Naya Spa',
        subtitle: 'Ruhunuzu dinlendirin',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
        prompt: 'Naya SPA merkezinde hangi hizmetler var?'
    },
    {
        id: 'meeting',
        title: 'Toplantı & Etkinlik',
        subtitle: 'İstanbul Salonu ve diğerleri',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-2.jpg',
        prompt: 'Toplantı salonlarınızın kapasiteleri nelerdir?'
    },
    {
        id: 'location',
        title: 'Konum & Ulaşım',
        subtitle: 'Torba Koyu\'nun kalbinde',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg',
        prompt: 'Otelin konumu nerede, havalimanına ne kadar uzaklıkta?'
    },
    {
        id: 'reviews',
        title: 'Misafir Yorumları',
        subtitle: 'Gerçek deneyimler',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
        prompt: 'Misafirler otel hakkında neler söylüyor?'
    }
];

// --- UI WIDGET COMPONENTS ---

const MeetingWidget = ({ data }: { data: any[] }) => (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {data?.map((room) => (
            <div
                key={room.id}
                className="min-w-[280px] w-[280px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex-shrink-0 group"
            >
                <div className="h-32 overflow-hidden relative">
                    <img src={room.image || 'https://via.placeholder.com/300'} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute top-3 left-3 bg-cyan-600/90 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                        {room.type}
                    </div>
                </div>
                <div className="p-4">
                    <h4 className="font-serif text-lg font-bold text-gray-900 mb-3">{room.title}</h4>

                    <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-1.5 rounded">
                            <Users size={14} className="text-cyan-600 shrink-0" />
                            <span>{room.capacity}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-1.5 rounded">
                            <Scan size={14} className="text-cyan-600 shrink-0" />
                            <span>{room.area}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-1.5 rounded">
                            <Maximize size={14} className="text-cyan-600 shrink-0" />
                            <span>{room.height}</span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const RoomsWidget = ({ data, onInteract }: { data: any[], onInteract: (text: string) => void }) => (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {data?.map((room) => (
            <div
                key={room.id}
                className="min-w-[260px] w-[260px] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20 flex-shrink-0 group block"
            >
                <div className="h-40 overflow-hidden relative">
                    <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                    <h4 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                        {room.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">{room.description}</p>
                    <div className="mt-4 flex items-center justify-between">
                        <span className="text-[10px] bg-cyan-600/10 text-cyan-600 px-2 py-1 rounded-full font-bold">{room.size}</span>
                        <button
                            onClick={() => onInteract(`${room.title} detaylarını göster`)}
                            className="text-xs font-bold text-cyan-600 hover:bg-cyan-600 hover:text-white border border-cyan-600 px-4 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                        >
                            İncele <ChevronRight size={12} />
                        </button>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

const RoomDetailWidget = ({ data }: { data: any }) => {
    // Parse features safely
    let features = [];
    try {
        features = JSON.parse(data.features);
    } catch (e) {
        features = typeof data.features === 'string' ? data.features.split(',') : [];
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mt-4 shadow-xl animate-fade-in-up">
            <div className="h-56 relative group">
                <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-serif font-bold">{data.title}</h3>
                    <p className="text-sm opacity-90">{data.view}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50">
                <div className="p-3 text-center">
                    <Scan size={16} className="mx-auto text-cyan-600 mb-1" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase">{data.size}</span>
                </div>
                <div className="p-3 text-center">
                    <Users size={16} className="mx-auto text-cyan-600 mb-1" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase">{data.capacity}</span>
                </div>
                <div className="p-3 text-center">
                    <BedDouble size={16} className="mx-auto text-cyan-600 mb-1" />
                    <span className="text-[10px] font-bold text-gray-600 uppercase">Konfor</span>
                </div>
            </div>

            <div className="p-5 space-y-5">
                {data.whyChoose && (
                    <div className="bg-cyan-600/5 p-4 rounded-xl border border-cyan-600/10">
                        <h4 className="text-sm font-bold text-cyan-600 mb-2 flex items-center gap-2">
                            <Sparkles size={14} /> Neden Bu Odayı Seçmelisiniz?
                        </h4>
                        <p className="text-xs text-gray-700 leading-relaxed font-light">
                            {data.whyChoose}
                        </p>
                    </div>
                )}

                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Oda Özellikleri</h4>
                    <div className="grid grid-cols-2 gap-2">
                        {features.map((feat: string, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                                <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                                {feat}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href="tel:+902523371111"
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors border border-gray-200"
                        >
                            <Phone size={14} />
                            Call Center
                        </a>
                        <a
                            href="https://bluedreamsresort.com/rezervasyon"
                            target="_blank"
                            rel="noreferrer"
                            className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-600/20"
                        >
                            Online Rezervasyon
                            <ExternalLink size={14} />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

const ContactWidget = () => (
    <div className="grid grid-cols-2 gap-4 mt-2">
        <a href="tel:+902523371111" className="flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur rounded-2xl border border-white/20 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                <Phone size={20} />
            </div>
            <span className="text-sm font-bold text-gray-800">Hemen Ara</span>
        </a>
        <a href="https://wa.me/902523371111" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center p-6 bg-white/80 backdrop-blur rounded-2xl border border-white/20 shadow-sm hover:shadow-md transition-all group">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-500 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            </div>
            <span className="text-sm font-bold text-gray-800">WhatsApp</span>
        </a>
    </div>
);

const LocationWidget = ({ onInteract }: { onInteract: (text: string) => void }) => (
    <div className="bg-white p-2 rounded-2xl shadow-lg mt-2">
        <div className="h-48 w-full relative rounded-xl overflow-hidden shadow-inner">
            <iframe
                src="https://maps.google.com/maps?q=37.091832,27.4824998&hl=tr&z=15&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
            ></iframe>
        </div>

        <div className="p-4">
            <div className="flex items-start gap-3 mb-4 border-b border-gray-100 pb-4">
                <MapPin size={24} className="text-cyan-600 shrink-0 mt-0.5" />
                <div>
                    <h5 className="font-bold text-gray-900 text-lg">Blue Dreams Resort</h5>
                    <p className="text-xs text-gray-600 mt-1">Torba Mah. Herodot Bulvarı No:11<br />Bodrum/Muğla</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">
                    <Plane size={16} className="text-cyan-600" />
                    <span>Havalimanı: <b>25 km</b></span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 p-2 rounded-lg">
                    <Car size={16} className="text-cyan-600" />
                    <span>Bodrum Merkez: <b>10 km</b></span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <a
                    href="https://www.google.com/maps/dir//37.091832,27.4824998"
                    target="_blank"
                    rel="noreferrer"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors border border-gray-200"
                >
                    <Map size={14} />
                    Yol Tarifi
                </a>
                <button
                    onClick={() => onInteract("Transfer Talep Et")}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-2 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-600/20"
                >
                    <Car size={14} />
                    Transfer
                </button>
            </div>
        </div>
    </div>
);

const TransferFormWidget = () => {
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTimeout(() => {
            setSent(true);
        }, 1000);
    };

    if (sent) {
        return (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl mt-4 flex flex-col items-center text-center animate-fade-in-up">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-3">
                    <Check size={24} />
                </div>
                <h4 className="font-bold text-green-800 text-lg mb-2">Talebiniz Alındı</h4>
                <p className="text-sm text-green-700">
                    Ekibimiz en kısa sürede sizinle iletişime geçecektir.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mt-4 shadow-xl animate-fade-in-up">
            <div className="bg-gray-900 p-4 flex items-center gap-3 text-white">
                <Car size={20} className="text-cyan-600" />
                <h4 className="font-bold text-sm uppercase tracking-wide">VIP Transfer Formu</h4>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Ad Soyad</label>
                    <input type="text" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none" placeholder="İsim Giriniz" />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Telefon</label>
                    <input type="tel" required className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-sm outline-none" placeholder="+90..." />
                </div>
                <button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all">
                    Gönder <Send size={16} />
                </button>
            </form>
        </div>
    );
};

const DiningWidget = ({ data, onInteract }: { data: any[], onInteract: (text: string) => void }) => (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {data?.map((rest) => (
            <button
                key={rest.id}
                onClick={() => onInteract(`${rest.title} restoranı hakkında bilgi ver`)}
                className="min-w-[220px] w-[220px] bg-white/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20 flex-shrink-0 group block text-left hover:scale-105 transition-transform"
            >
                <div className="h-32 overflow-hidden relative">
                    <img src={rest.image} alt={rest.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                </div>
                <div className="p-3">
                    <span className="text-[10px] font-bold text-cyan-600 uppercase tracking-wider">{rest.type}</span>
                    <h4 className="font-serif text-lg font-bold text-gray-900 mt-1">{rest.title}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{rest.description}</p>
                </div>
            </button>
        ))}
    </div>
);

const AmenitiesWidget = ({ data, onInteract }: { data: any[], onInteract: (text: string) => void }) => (
    <div className="grid grid-cols-2 gap-3 mt-2">
        {data?.map((am) => (
            <button
                key={am.id}
                onClick={() => onInteract(`${am.title} hakkında detaylı bilgi verir misin?`)}
                className="bg-white/80 backdrop-blur p-3 rounded-xl border border-white/50 flex items-center gap-3 hover:bg-white hover:shadow-md transition-all text-left"
            >
                <div className="text-cyan-600 p-2 bg-cyan-600/10 rounded-lg"><Sparkles size={16} /></div>
                <span className="text-xs font-bold text-gray-700">{am.title}</span>
            </button>
        ))}
    </div>
);

const PriceResultWidget = ({ data }: { data: any }) => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mt-4 shadow-xl">
        <div className="bg-cyan-600 p-4 flex justify-between items-center text-white">
            <span className="font-bold uppercase tracking-wider text-sm">En İyi Fiyatlar</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">{data.checkIn}</span>
        </div>
        <div className="divide-y divide-gray-100">
            {data.rooms.map((room: any, idx: number) => (
                <div key={idx} className="p-4 flex justify-between items-center group hover:bg-gray-50 transition-colors">
                    <div>
                        <div className="font-bold text-gray-900">{room.name}</div>
                        {room.specialOffer && <span className="inline-block mt-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Fırsat</span>}
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-serif font-bold text-cyan-600">{room.price}€</div>
                    </div>
                </div>
            ))}
        </div>
        <a href="https://blue-dreams.rezervasyonal.com/" className="block w-full bg-gray-900 hover:bg-black text-white text-center py-4 text-sm font-bold uppercase transition-colors">
            Rezervasyona Git
        </a>
    </div>
);

// --- MAIN COMPONENT ---

const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'tr-TR';
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript);
            };

            recognition.start();
        } else {
            alert("Tarayıcınız sesli komuta izin vermiyor.");
        }
    };

    const handleDownloadPdf = () => {
        const doc = new jsPDF();
        doc.text("Blue Concierge Sohbet Kaydı", 10, 10);
        // basic pdf export implementation...
        doc.save("chat-history.pdf");
    };

    const processMessage = async (newMessages: Message[]) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, text: m.text })),
                    locale: 'tr' // Dynamic locale can be passed prop
                })
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: data.text,
                isFunctionCall: !!data.uiPayload,
                uiPayload: data.uiPayload ? { type: data.uiPayload.type, data: data.data } : undefined
            }]);

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Üzgünüm, bir bağlantı sorunu oluştu.' }]);
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleSend = (text: string) => {
        if (!text.trim() || isLoading) return;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        setInput('');
        processMessage(newHistory);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-gray-900 text-gray-800 animate-fade-in font-sans">

            <div className="absolute inset-0 z-0">
                <img
                    src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-40 scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/60 to-gray-900/90 backdrop-blur-xl"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full max-w-5xl mx-auto px-4 md:px-6">

                <div className="flex items-center justify-between py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-cyan-500 to-cyan-300 p-2.5 rounded-xl shadow-lg shadow-cyan-500/20">
                            <Sparkles size={24} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Blue Concierge</h2>
                            <p className="text-xs text-cyan-300 font-medium tracking-[0.2em] uppercase">Yapay Zeka Asistanı</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {messages.length > 0 && (
                            <>
                                <button onClick={handleDownloadPdf} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                                    <Download size={20} />
                                </button>
                                <button onClick={() => setMessages([])} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                                    <RefreshCw size={20} />
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar py-6">

                    {messages.length === 0 ? (
                        <div className="min-h-full flex flex-col justify-start md:justify-center pt-24 md:pt-0 animate-fade-in-up pb-10">
                            <div className="text-center mb-12">
                                <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 drop-shadow-lg">
                                    Size nasıl yardımcı olabilirim?
                                </h1>
                                <p className="text-lg text-white/70 max-w-2xl mx-auto font-light">
                                    Aşağıdaki konulardan birini seçin, yazın veya sesli olarak sorun.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {VISUAL_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleSend(cat.prompt)}
                                        className="group relative h-64 rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform hover:-translate-y-2"
                                    >
                                        <img src={cat.image} alt={cat.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                        <div className="absolute bottom-0 left-0 p-6 text-left w-full">
                                            <h3 className="text-xl font-serif text-white mb-1 group-hover:text-cyan-300 transition-colors">{cat.title}</h3>
                                            <p className="text-xs text-white/60 font-light mb-3">{cat.subtitle}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-8 pb-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>

                                    <div className="flex items-center gap-2 mb-2 px-1">
                                        {msg.role === 'model' ? (
                                            <>
                                                <Sparkles size={14} className="text-cyan-400" />
                                                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Blue Concierge</span>
                                            </>
                                        ) : (
                                            <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Siz</span>
                                        )}
                                    </div>

                                    <div className={`relative max-w-[90%] md:max-w-[80%] p-5 md:p-6 text-base leading-relaxed shadow-xl backdrop-blur-md ${msg.role === 'user'
                                            ? 'bg-cyan-600 text-white rounded-2xl rounded-tr-sm'
                                            : msg.isFunctionCall
                                                ? 'bg-white/10 text-white/80 border border-white/20 italic rounded-2xl'
                                                : 'bg-white/95 text-gray-800 rounded-2xl rounded-tl-sm'
                                        }`}>
                                        {msg.text}
                                    </div>

                                    {msg.uiPayload && (
                                        <div className="mt-4 w-full md:max-w-[85%] animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                                            {msg.uiPayload.type === 'rooms' && <RoomsWidget data={msg.uiPayload.data} onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'room_detail' && <RoomDetailWidget data={msg.uiPayload.data} />}
                                            {msg.uiPayload.type === 'location' && <LocationWidget onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'contact' && <ContactWidget />}
                                            {msg.uiPayload.type === 'amenities' && <AmenitiesWidget data={msg.uiPayload.data} onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'dining' && <DiningWidget data={msg.uiPayload.data} onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'transfer_form' && <TransferFormWidget />}
                                            {msg.uiPayload.type === 'price_result' && <PriceResultWidget data={msg.uiPayload.data} />}
                                            {msg.uiPayload.type === 'meeting' && <MeetingWidget data={msg.uiPayload.data} />}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && !messages[messages.length - 1]?.isFunctionCall && (
                                <div className="flex items-start gap-2 animate-pulse">
                                    <div className="bg-white/10 p-4 rounded-2xl rounded-tl-sm flex gap-1">
                                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                <div className="py-6">
                    <div className="max-w-3xl mx-auto bg-white rounded-full p-2 shadow-2xl flex items-center gap-2 border border-white/20 relative">

                        {messages.length > 0 && (
                            <button
                                onClick={() => setMessages([])}
                                className="p-3 hover:bg-gray-100 rounded-full text-gray-400 transition-colors hidden md:block"
                                title="Menüye Dön"
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
                            placeholder={isListening ? "Dinliyorum..." : "Yazın veya konuşun..."}
                            className="flex-1 bg-transparent border-none outline-none text-gray-800 px-4 text-base placeholder:text-gray-400"
                            disabled={isLoading || isListening}
                        />

                        <button
                            onClick={startListening}
                            className={`p-3 rounded-full transition-all duration-300 ${isListening
                                    ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                                    : 'hover:bg-gray-100 text-gray-500 hover:text-cyan-600'
                                }`}
                        >
                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                        </button>

                        <button
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || isLoading}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white p-3.5 rounded-full shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        >
                            <Send size={20} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AiAssistant;
