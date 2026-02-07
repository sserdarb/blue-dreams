'use client'

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Mic, MicOff, RefreshCw, ChevronRight, Phone, MapPin, Download, ExternalLink, BedDouble, Users, Scan, CheckCircle2, Plane, Car, Map, Check, Maximize, Volume2, StopCircle, ArrowRight, ArrowLeft } from 'lucide-react';
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

// Helper for TTS
const speakText = (text: string, lang: string = 'tr-TR') => {
    if (!window.speechSynthesis) return;

    // Stop any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Try to find a matching voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.includes(lang.split('-')[0])) || voices[0];

    utterance.voice = voice;
    utterance.lang = lang;
    utterance.rate = 0.9; // Slightly slower for clarity

    window.speechSynthesis.speak(utterance);
    return utterance; // Return to allow event attaching if needed
};

// --- WIDGET COMPONENTS (Updated with Voice) ---

const VoiceButton = ({ text, lang = 'tr', className = "" }: { text: string, lang?: string, className?: string }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const toggleSpeak = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            const utterance = speakText(text, lang === 'tr' ? 'tr-TR' : lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : 'ru-RU');
            if (utterance) {
                utterance.onend = () => setIsSpeaking(false);
            }
        }
    };

    return (
        <button
            onClick={toggleSpeak}
            className={`p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md transition-all ${className} ${isSpeaking ? 'text-cyan-400 animate-pulse' : 'text-white'}`}
            title="Sesli Dinle"
        >
            {isSpeaking ? <StopCircle size={18} /> : <Volume2 size={18} />}
        </button>
    );
}

const RoomsWidget = ({ data, onInteract }: { data: any[], onInteract: (text: string) => void }) => (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {data?.map((room) => (
            <div
                key={room.id}
                className="min-w-[300px] w-[300px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex-shrink-0 group relative snap-center"
            >
                <div className="h-56 overflow-hidden relative">
                    <img src={room.image} alt={room.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <div className="absolute top-3 right-3 flex gap-2">
                        <VoiceButton text={`${room.title}. ${room.description}`} />
                    </div>

                    <div className="absolute bottom-4 left-4 text-white">
                        <h4 className="font-serif text-xl font-bold tracking-wide">{room.title}</h4>
                        <span className="text-xs bg-white/20 backdrop-blur px-2 py-1 rounded text-white/90 mt-1 inline-block">
                            {room.size} | {room.view}
                        </span>
                    </div>
                </div>

                <div className="p-5">
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4">{room.description}</p>

                    <button
                        onClick={() => onInteract(`${room.title} detaylarını göster`)}
                        className="w-full py-3 rounded-xl bg-gray-50 hover:bg-cyan-50 text-gray-900 font-bold text-sm tracking-wide border border-gray-200 hover:border-cyan-200 transition-colors flex items-center justify-center gap-2 group/btn"
                    >
                        Odayı İncele
                        <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform text-cyan-600" />
                    </button>
                </div>
            </div>
        ))}
    </div>
);

const RoomDetailWidget = ({ data }: { data: any }) => {
    let features = [];
    try { features = JSON.parse(data.features); } catch (e) { features = typeof data.features === 'string' ? data.features.split(',') : []; }

    const speakContent = `${data.title}. ${data.whyChoose || data.description}. ${data.view} manzaralı. ${data.size} büyüklüğünde.`;

    return (
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden mt-4 shadow-2xl animate-fade-in-up">
            <div className="h-72 relative group">
                <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30"></div>

                <div className="absolute top-4 right-4 z-10">
                    <VoiceButton text={speakContent} className="bg-black/30 hover:bg-black/50" />
                </div>

                <div className="absolute bottom-6 left-6 text-white max-w-[80%]">
                    <h3 className="text-3xl font-serif font-bold mb-2">{data.title}</h3>
                    <p className="text-sm opacity-90 font-light flex items-center gap-2">
                        <Scan size={14} /> {data.size}
                        <span className="w-1 h-1 bg-white rounded-full mx-1"></span>
                        {data.view}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100 bg-gray-50/50">
                <div className="p-4 text-center">
                    <Users size={20} className="mx-auto text-cyan-600 mb-1.5" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{data.capacity}</span>
                </div>
                <div className="p-4 text-center">
                    <BedDouble size={20} className="mx-auto text-cyan-600 mb-1.5" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Konfor</span>
                </div>
                <div className="p-4 text-center">
                    <Scan size={20} className="mx-auto text-cyan-600 mb-1.5" />
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{data.size}</span>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {data.whyChoose && (
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-5 rounded-2xl border border-cyan-100/50">
                        <h4 className="text-sm font-bold text-cyan-700 mb-3 flex items-center gap-2">
                            <Sparkles size={16} className="text-cyan-500" />
                            Neden Bu Oda?
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed font-light italic">
                            "{data.whyChoose}"
                        </p>
                    </div>
                )}

                <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Özellikler</h4>
                    <div className="grid grid-cols-2 gap-3">
                        {features.map((feat: string, i: number) => (
                            <div key={i} className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                {feat}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <a href="tel:+902523371111" className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-4 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors">
                        <Phone size={16} /> İletişim
                    </a>
                    <a href="https://bluedreamsresort.com/rezervasyon" target="_blank" className="flex-[2] bg-gray-900 hover:bg-black text-white py-4 rounded-xl text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors shadow-lg shadow-gray-900/20">
                        Rezervasyon Yap <ExternalLink size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
}

const DiningWidget = ({ data, onInteract }: { data: any[], onInteract: (text: string) => void }) => (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {data?.map((rest) => (
            <button
                key={rest.id}
                onClick={() => onInteract(`${rest.title} restoranı hakkında bilgi ver`)}
                className="min-w-[260px] w-[260px] bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex-shrink-0 group block text-left hover:scale-105 transition-transform duration-500 relative"
            >
                <div className="h-44 overflow-hidden relative">
                    <img src={rest.image} alt={rest.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    <div className="absolute top-3 right-3 z-10">
                        <VoiceButton text={`${rest.title} restoranı. ${rest.description}`} />
                    </div>

                    <div className="absolute bottom-3 left-4 text-white">
                        <span className="text-[10px] font-bold bg-cyan-600 px-2 py-0.5 rounded text-white uppercase tracking-wider mb-1 inline-block">{rest.type}</span>
                        <h4 className="font-serif text-lg font-bold">{rest.title}</h4>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">{rest.description}</p>
                </div>
            </button>
        ))}
    </div>
);

// Other widgets can remain simple or be enhanced similarly...
const LocationWidget = ({ onInteract }: { onInteract: (text: string) => void }) => (
    <div className="bg-white p-2 rounded-2xl shadow-lg mt-2">
        <div className="h-48 w-full relative rounded-xl overflow-hidden shadow-inner">
            <iframe src="https://maps.google.com/maps?q=37.091832,27.4824998&hl=tr&z=15&output=embed" width="100%" height="100%" style={{ border: 0 }} loading="lazy"></iframe>
        </div>
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h5 className="font-bold text-gray-900 text-lg">Blue Dreams Resort</h5>
                    <p className="text-xs text-gray-500 mt-1">Torba, Bodrum</p>
                </div>
                <VoiceButton text="Blue Dreams Resort, Torba Mahallesinde, Bodrum merkeze 10 kilometre, havalimanına 25 kilometre uzaklıktadır." className="bg-gray-100 text-gray-600" />
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onInteract("Transfer")} className="bg-cyan-600 text-white py-2 rounded-lg text-xs font-bold uppercase shadow-lg shadow-cyan-600/20">Transfer</button>
                <a href="https://maps.google.com" target="_blank" className="bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-bold uppercase text-center flex items-center justify-center">Yol Tarifi</a>
            </div>
        </div>
    </div>
);

// --- MAIN AI ASSISTANT ---

const VISUAL_CATEGORIES: VisualCategory[] = [
    { id: 'rooms', title: 'Konaklama', subtitle: 'Lüks Odalar ve Suitler', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg', prompt: 'Bana oteldeki oda seçeneklerini göster.' },
    { id: 'dining', title: 'Gastronomi', subtitle: 'Gurme Lezzetler', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg', prompt: 'Otelde hangi restoranlar var?' },
    { id: 'spa', title: 'Naya Spa', subtitle: 'Arınma ve Yenilenme', image: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg', prompt: 'Spa merkezinde neler var?' },
    { id: 'location', title: 'Keşfet', subtitle: 'Bodrum ve Çevresi', image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg', prompt: 'Otelin konumu nerede?' },
];

const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose }) => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        // Speak latest AI message if it's text-only and short, or functionality can be added here
    }, [messages]);

    // Voice Interaction
    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = 'tr-TR';

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                handleSend(transcript);
            };
            recognition.start();
        } else {
            alert("Tarayıcınız sesli komutu desteklemiyor.");
        }
    };

    const processMessage = async (newMessages: Message[]) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: newMessages.map(m => ({ role: m.role, text: m.text })),
                    locale: 'tr'
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

            // Auto-speak short responses if enabled preference (mock)
            // speakText(data.text);

        } catch (error) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', text: 'Bağlantı hatası oluştu.' }]);
        } finally {
            setIsLoading(false);
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

            {/* Immersive Background */}
            <div className="absolute inset-0 z-0">
                <img src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg" className="w-full h-full object-cover opacity-30 scale-105 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-gray-900/90 via-gray-900/80 to-gray-900/95"></div>
            </div>

            <div className="relative z-10 flex flex-col h-full max-w-5xl mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="flex items-center justify-between py-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-tr from-cyan-500 to-cyan-300 p-2.5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                            <Sparkles size={24} className="text-white animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-serif font-bold text-white tracking-wide">Blue Concierge</h2>
                            <p className="text-xs text-cyan-300 font-bold tracking-[0.2em] uppercase opacity-80">Visual AI Assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setMessages([])} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors" title="Temizle">
                            <RefreshCw size={20} />
                        </button>
                        <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white transition-all">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto no-scrollbar py-8">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col justify-center animate-fade-in-up pb-20">
                            <div className="text-center mb-12">
                                <h1 className="text-4xl md:text-6xl font-serif text-white mb-6 drop-shadow-2xl">
                                    Hoş Geldiniz
                                </h1>
                                <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
                                    Size otelimiz hakkında görsel ve sesli olarak rehberlik edebilirim. Ne keşfetmek istersiniz?
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-4">
                                {VISUAL_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleSend(cat.prompt)}
                                        className="group relative h-72 rounded-3xl overflow-hidden border border-white/10 shadow-2xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                    >
                                        <img src={cat.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>

                                        <div className="absolute top-4 right-4 bg-white/10 backdrop-blur rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ArrowRight className="text-white" size={20} />
                                        </div>

                                        <div className="absolute bottom-0 left-0 p-6 text-left w-full">
                                            <h3 className="text-2xl font-serif text-white mb-1 group-hover:text-cyan-300 transition-colors">{cat.title}</h3>
                                            <p className="text-xs text-white/70 font-bold uppercase tracking-widest">{cat.subtitle}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-10 pb-10">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>

                                    <div className="flex items-center gap-2 mb-2 px-1 opacity-60">
                                        <span className="text-[10px] font-bold text-white uppercase tracking-widest">
                                            {msg.role === 'model' ? 'Blue Concierge' : 'Siz'}
                                        </span>
                                    </div>

                                    {msg.text && !msg.isFunctionCall && (
                                        <div className={`relative max-w-[90%] md:max-w-[70%] p-6 text-lg leading-relaxed shadow-2xl backdrop-blur-xl ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white rounded-3xl rounded-tr-sm'
                                            : 'bg-white/10 border border-white/10 text-white rounded-3xl rounded-tl-sm'
                                            }`}>
                                            {msg.text}
                                            {msg.role === 'model' && (
                                                <div className="absolute -bottom-10 left-0">
                                                    <VoiceButton text={msg.text} className="bg-white/5 hover:bg-white/20" />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {msg.uiPayload && (
                                        <div className="mt-2 w-full animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                            {msg.uiPayload.type === 'rooms' && <RoomsWidget data={msg.uiPayload.data} onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'room_detail' && <RoomDetailWidget data={msg.uiPayload.data} />}
                                            {msg.uiPayload.type === 'location' && <LocationWidget onInteract={handleSend} />}
                                            {msg.uiPayload.type === 'dining' && <DiningWidget data={msg.uiPayload.data} onInteract={handleSend} />}
                                            {/* Add other widgets similarly */}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-center py-4">
                                    <div className="flex gap-2 p-4 bg-white/5 rounded-full backdrop-blur-md">
                                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="py-6">
                    <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-full p-2 shadow-2xl flex items-center gap-2 relative">

                        {messages.length > 0 && (
                            <button onClick={() => setMessages([])} className="p-3 hover:bg-white/10 rounded-full text-white/60 transition-colors hidden md:block">
                                <ArrowLeft size={20} />
                            </button>
                        )}

                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                            placeholder={isListening ? "Dinleniyor..." : "Merak ettiklerinizi sorun..."}
                            className="flex-1 bg-transparent border-none outline-none text-white px-4 text-lg placeholder:text-white/40 font-light"
                            disabled={isLoading || isListening}
                        />

                        <button
                            onClick={startListening}
                            className={`p-3 rounded-full transition-all duration-300 ${isListening
                                ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                                : 'hover:bg-white/10 text-white/80 hover:text-cyan-400'
                                }`}
                        >
                            {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                        </button>

                        <button
                            onClick={() => handleSend(input)}
                            disabled={!input.trim() || isLoading}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white p-3.5 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                        >
                            <Send size={22} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AiAssistant;
