'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
    Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Scissors,
    Type, ImageIcon, Music, Film, Trash2, Copy, Plus, Download,
    Upload, ChevronLeft, ChevronRight, Maximize2, Minimize2, Settings2,
    RotateCw, ZoomIn, ZoomOut, Move, Layers, Clock, Sparkles,
    SlidersHorizontal, Palette, Eye, EyeOff, Lock, Unlock, X,
    FileVideo, FileAudio, Save, Undo2, Redo2, MoreHorizontal,
    ArrowLeftRight, Loader2, Wand2, FastForward, Rewind
} from 'lucide-react'

// ─── Types ───
interface TimelineClip {
    id: string
    type: 'video' | 'image' | 'audio' | 'text' | 'overlay'
    name: string
    startTime: number   // seconds on timeline
    duration: number    // seconds
    trimStart: number   // trim from beginning
    trimEnd: number     // trim from end
    track: number
    color: string
    data: any
    visible: boolean
    locked: boolean
}

interface TextOverlay {
    text: string
    fontFamily: string
    fontSize: number
    color: string
    backgroundColor: string
    x: number
    y: number
    animation: 'none' | 'fadeIn' | 'slideUp' | 'typewriter' | 'bounce' | 'zoom'
}

interface VideoFilter {
    id: string
    name: string
    css: string
    preview: string
}

type TransitionType = 'none' | 'fade' | 'dissolve' | 'slideLeft' | 'slideRight' | 'slideUp' | 'zoom' | 'blur' | 'wipe'

// ─── Constants ───
const FILTERS: VideoFilter[] = [
    { id: 'none', name: 'Orijinal', css: 'none', preview: 'bg-slate-300' },
    { id: 'grayscale', name: 'Siyah-Beyaz', css: 'grayscale(100%)', preview: 'bg-gray-500' },
    { id: 'sepia', name: 'Sepia', css: 'sepia(80%)', preview: 'bg-amber-700' },
    { id: 'warm', name: 'Sıcak', css: 'saturate(1.3) hue-rotate(-10deg)', preview: 'bg-orange-400' },
    { id: 'cool', name: 'Soğuk', css: 'saturate(1.1) hue-rotate(20deg)', preview: 'bg-blue-400' },
    { id: 'vivid', name: 'Canlı', css: 'saturate(1.8) contrast(1.1)', preview: 'bg-pink-500' },
    { id: 'vintage', name: 'Vintage', css: 'sepia(40%) contrast(0.9) brightness(1.1)', preview: 'bg-amber-600' },
    { id: 'cinematic', name: 'Sinematik', css: 'contrast(1.2) brightness(0.95) saturate(0.85)', preview: 'bg-slate-700' },
    { id: 'dramatic', name: 'Dramatik', css: 'contrast(1.5) brightness(0.8)', preview: 'bg-slate-900' },
    { id: 'fade', name: 'Soluk', css: 'contrast(0.85) brightness(1.15) saturate(0.8)', preview: 'bg-slate-200' },
    { id: 'noir', name: 'Film Noir', css: 'grayscale(100%) contrast(1.4) brightness(0.9)', preview: 'bg-black' },
    { id: 'sunset', name: 'Gün Batımı', css: 'saturate(1.5) hue-rotate(-20deg) brightness(1.05)', preview: 'bg-orange-500' },
]

const TRANSITIONS: { id: TransitionType; label: string; icon: string }[] = [
    { id: 'none', label: 'Yok', icon: '—' },
    { id: 'fade', label: 'Fade', icon: '◐' },
    { id: 'dissolve', label: 'Dissolve', icon: '◑' },
    { id: 'slideLeft', label: 'Sola Kaydır', icon: '◀' },
    { id: 'slideRight', label: 'Sağa Kaydır', icon: '▶' },
    { id: 'slideUp', label: 'Yukarı Kaydır', icon: '▲' },
    { id: 'zoom', label: 'Zoom', icon: '⊕' },
    { id: 'blur', label: 'Bulanıklık', icon: '◎' },
    { id: 'wipe', label: 'Sil', icon: '▌' },
]

const TEXT_ANIMATIONS = [
    { id: 'none', label: 'Yok' },
    { id: 'fadeIn', label: 'Fade In' },
    { id: 'slideUp', label: 'Aşağıdan Yukarı' },
    { id: 'typewriter', label: 'Daktilo' },
    { id: 'bounce', label: 'Zıplama' },
    { id: 'zoom', label: 'Zoom' },
]

const TRACK_COLORS = ['#06b6d4', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#ec4899']
const PRESET_RESOLUTIONS = [
    { label: '1080p (16:9)', w: 1920, h: 1080 },
    { label: '720p (16:9)', w: 1280, h: 720 },
    { label: '4K (16:9)', w: 3840, h: 2160 },
    { label: 'Instagram Post', w: 1080, h: 1080 },
    { label: 'Instagram Story', w: 1080, h: 1920 },
    { label: 'TikTok / Reels', w: 1080, h: 1920 },
    { label: 'YouTube Shorts', w: 1080, h: 1920 },
    { label: 'Twitter Post', w: 1200, h: 675 },
]

let clipCounter = 0
function genClipId() { return `clip_${++clipCounter}_${Date.now()}` }

// Demo clips
const DEMO_CLIPS: TimelineClip[] = [
    { id: genClipId(), type: 'video', name: 'Otel Tanıtım.mp4', startTime: 0, duration: 8, trimStart: 0, trimEnd: 0, track: 0, color: TRACK_COLORS[0], data: { filter: 'none', transition: 'none' as TransitionType }, visible: true, locked: false },
    { id: genClipId(), type: 'video', name: 'Havuz Sahne.mp4', startTime: 8, duration: 6, trimStart: 0, trimEnd: 0, track: 0, color: TRACK_COLORS[0], data: { filter: 'none', transition: 'fade' as TransitionType }, visible: true, locked: false },
    { id: genClipId(), type: 'video', name: 'Restaurant.mp4', startTime: 14, duration: 5, trimStart: 0, trimEnd: 0, track: 0, color: TRACK_COLORS[0], data: { filter: 'warm', transition: 'dissolve' as TransitionType }, visible: true, locked: false },
    { id: genClipId(), type: 'text', name: 'Başlık Metni', startTime: 0.5, duration: 4, trimStart: 0, trimEnd: 0, track: 1, color: TRACK_COLORS[1], data: { text: 'Blue Dreams Resort', fontSize: 48, fontFamily: 'Inter', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', animation: 'fadeIn', x: 50, y: 50 }, visible: true, locked: false },
    { id: genClipId(), type: 'text', name: 'Alt Yazı', startTime: 5, duration: 3, trimStart: 0, trimEnd: 0, track: 1, color: TRACK_COLORS[1], data: { text: 'Lüks Tatil Deneyimi', fontSize: 32, fontFamily: 'Inter', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.3)', animation: 'slideUp', x: 50, y: 80 }, visible: true, locked: false },
    { id: genClipId(), type: 'audio', name: 'Arka Plan Müziği.mp3', startTime: 0, duration: 19, trimStart: 0, trimEnd: 0, track: 2, color: TRACK_COLORS[2], data: { volume: 0.7 }, visible: true, locked: false },
]

export default function VideoEditor() {
    // ─── State ───
    const [clips, setClips] = useState<TimelineClip[]>(DEMO_CLIPS)
    const [selectedClipId, setSelectedClipId] = useState<string | null>(null)
    const [currentTime, setCurrentTime] = useState(0)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(80)
    const [zoom, setZoom] = useState(1)
    const [duration, setDuration] = useState(19)
    const [resolution, setResolution] = useState(PRESET_RESOLUTIONS[0])
    const [activeFilter, setActiveFilter] = useState('none')
    const [showFilters, setShowFilters] = useState(false)
    const [showTransitions, setShowTransitions] = useState(false)
    const [showTextEditor, setShowTextEditor] = useState(false)
    const [showExportDialog, setShowExportDialog] = useState(false)
    const [exporting, setExporting] = useState(false)
    const [exportProgress, setExportProgress] = useState(0)
    const [rightPanel, setRightPanel] = useState<'properties' | 'filters' | 'transitions' | 'text'>('properties')

    const timelineRef = useRef<HTMLDivElement>(null)
    const playbackInterval = useRef<NodeJS.Timeout | null>(null)

    const selectedClip = clips.find(c => c.id === selectedClipId)

    // Calculate total duration
    useEffect(() => {
        const maxEnd = Math.max(...clips.map(c => c.startTime + c.duration), 1)
        setDuration(maxEnd)
    }, [clips])

    // Playback simulation
    useEffect(() => {
        if (isPlaying) {
            playbackInterval.current = setInterval(() => {
                setCurrentTime(prev => {
                    if (prev >= duration) {
                        setIsPlaying(false)
                        return 0
                    }
                    return prev + 0.1
                })
            }, 100)
        } else {
            if (playbackInterval.current) clearInterval(playbackInterval.current)
        }
        return () => { if (playbackInterval.current) clearInterval(playbackInterval.current) }
    }, [isPlaying, duration])

    // ─── Helpers ───
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        const ms = Math.floor((seconds % 1) * 10)
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms}`
    }

    const getClipAtTime = (time: number, track: number) => {
        return clips.find(c => c.track === track && time >= c.startTime && time < c.startTime + c.duration)
    }

    const pixelsPerSecond = 60 * zoom

    // ─── Actions ───
    const addTextClip = () => {
        const newClip: TimelineClip = {
            id: genClipId(), type: 'text', name: 'Yeni Metin',
            startTime: currentTime, duration: 3, trimStart: 0, trimEnd: 0,
            track: 1, color: TRACK_COLORS[1],
            data: { text: 'Metin girin...', fontSize: 32, fontFamily: 'Inter', color: '#ffffff', backgroundColor: 'rgba(0,0,0,0.5)', animation: 'fadeIn', x: 50, y: 50 },
            visible: true, locked: false,
        }
        setClips(prev => [...prev, newClip])
        setSelectedClipId(newClip.id)
        setRightPanel('text')
    }

    const deleteClip = (id: string) => {
        setClips(prev => prev.filter(c => c.id !== id))
        if (selectedClipId === id) setSelectedClipId(null)
    }

    const duplicateClip = (id: string) => {
        const src = clips.find(c => c.id === id)
        if (!src) return
        const clone: TimelineClip = { ...src, id: genClipId(), name: `${src.name} (kopya)`, startTime: src.startTime + src.duration }
        setClips(prev => [...prev, clone])
    }

    const splitClip = (id: string) => {
        const clip = clips.find(c => c.id === id)
        if (!clip || currentTime <= clip.startTime || currentTime >= clip.startTime + clip.duration) return
        const splitPoint = currentTime - clip.startTime
        const part1: TimelineClip = { ...clip, duration: splitPoint }
        const part2: TimelineClip = { ...clip, id: genClipId(), name: `${clip.name} (2)`, startTime: currentTime, duration: clip.duration - splitPoint }
        setClips(prev => prev.map(c => c.id === id ? part1 : c).concat(part2))
    }

    const updateClipData = (id: string, data: any) => {
        setClips(prev => prev.map(c => c.id === id ? { ...c, data: { ...c.data, ...data } } : c))
    }

    const handleExport = async () => {
        setExporting(true)
        setExportProgress(0)
        // Simulate export
        for (let i = 0; i <= 100; i += 5) {
            await new Promise(r => setTimeout(r, 200))
            setExportProgress(i)
        }
        setExporting(false)
        setShowExportDialog(false)
    }

    const handleTimelineClick = (e: React.MouseEvent) => {
        if (!timelineRef.current) return
        const rect = timelineRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left + timelineRef.current.scrollLeft
        const time = x / pixelsPerSecond
        setCurrentTime(Math.max(0, Math.min(time, duration)))
    }

    // ─── Render ───
    return (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                        <Film size={18} className="text-purple-400" /> Video Düzenleyici
                    </span>
                    <span className="text-xs text-slate-500">{resolution.label} • {formatTime(duration)}</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Resolution */}
                    <select value={`${resolution.w}x${resolution.h}`} onChange={e => {
                        const r = PRESET_RESOLUTIONS.find(p => `${p.w}x${p.h}` === e.target.value)
                        if (r) setResolution(r)
                    }} className="text-xs bg-slate-700 text-slate-300 rounded-lg px-2 py-1.5 border-0 outline-none">
                        {PRESET_RESOLUTIONS.map(r => (
                            <option key={`${r.w}x${r.h}`} value={`${r.w}x${r.h}`}>{r.label}</option>
                        ))}
                    </select>
                    <button onClick={() => setShowExportDialog(true)} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-500 transition-colors">
                        <Download size={14} /> Dışa Aktar
                    </button>
                </div>
            </div>

            {/* Main Area: Preview + Right Panel */}
            <div className="flex flex-1 overflow-hidden">

                {/* Preview Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Video Preview */}
                    <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden">
                        <div className="relative bg-slate-800 border border-slate-600 rounded overflow-hidden" style={{ aspectRatio: `${resolution.w}/${resolution.h}`, maxHeight: '100%', maxWidth: '100%', width: resolution.w > resolution.h ? '80%' : 'auto', height: resolution.h >= resolution.w ? '80%' : 'auto' }}>
                            {/* Simulated video frames */}
                            {(() => {
                                const videoClip = getClipAtTime(currentTime, 0)
                                const filter = videoClip?.data?.filter || 'none'
                                const filterCss = FILTERS.find(f => f.id === filter)?.css || 'none'
                                return (
                                    <div className="w-full h-full flex items-center justify-center" style={{ filter: filterCss }}>
                                        {videoClip ? (
                                            <div className="w-full h-full relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 via-slate-800 to-purple-900/20 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <Film size={48} className="mx-auto mb-2 text-slate-600" />
                                                        <p className="text-slate-500 text-sm font-medium">{videoClip.name}</p>
                                                        <p className="text-slate-600 text-xs">{formatTime(currentTime - videoClip.startTime)} / {formatTime(videoClip.duration)}</p>
                                                    </div>
                                                </div>
                                                {/* Text overlays for current time */}
                                                {clips.filter(c => c.type === 'text' && c.visible && currentTime >= c.startTime && currentTime < c.startTime + c.duration).map(tc => (
                                                    <div key={tc.id} className="absolute text-white" style={{
                                                        left: `${tc.data.x}%`, top: `${tc.data.y}%`, transform: 'translate(-50%, -50%)',
                                                        fontSize: `${tc.data.fontSize * 0.5}px`, fontFamily: tc.data.fontFamily,
                                                        color: tc.data.color, backgroundColor: tc.data.backgroundColor,
                                                        padding: '4px 12px', borderRadius: '4px',
                                                    }}>
                                                        {tc.data.text}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-slate-600 text-center">
                                                <FileVideo size={48} className="mx-auto mb-2 opacity-50" />
                                                <p className="text-xs">Boş Kare</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}
                            {/* Transition indicator */}
                            {(() => {
                                const videoClip = getClipAtTime(currentTime, 0)
                                if (videoClip?.data?.transition && videoClip.data.transition !== 'none' && currentTime < videoClip.startTime + 1) {
                                    return (
                                        <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600/80 text-white text-[10px] rounded font-bold flex items-center gap-1">
                                            <ArrowLeftRight size={10} /> {TRANSITIONS.find(t => t.id === videoClip.data.transition)?.label}
                                        </div>
                                    )
                                }
                                return null
                            })()}
                        </div>
                    </div>

                    {/* Playback Controls */}
                    <div className="flex items-center justify-center gap-3 px-4 py-3 bg-slate-800 border-t border-slate-700">
                        <span className="text-xs text-slate-400 font-mono w-16 text-right">{formatTime(currentTime)}</span>
                        <button onClick={() => setCurrentTime(0)} className="text-slate-400 hover:text-white transition-colors"><SkipBack size={16} /></button>
                        <button onClick={() => setCurrentTime(Math.max(0, currentTime - 5))} className="text-slate-400 hover:text-white transition-colors"><Rewind size={16} /></button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-colors">
                            {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                        </button>
                        <button onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))} className="text-slate-400 hover:text-white transition-colors"><FastForward size={16} /></button>
                        <button onClick={() => setCurrentTime(duration)} className="text-slate-400 hover:text-white transition-colors"><SkipForward size={16} /></button>
                        <span className="text-xs text-slate-400 font-mono w-16">{formatTime(duration)}</span>
                        <div className="border-l border-slate-700 h-6 mx-2" />
                        <button onClick={() => setIsMuted(!isMuted)} className="text-slate-400 hover:text-white transition-colors">{isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}</button>
                        <input type="range" min={0} max={100} value={isMuted ? 0 : volume} onChange={e => { setVolume(Number(e.target.value)); setIsMuted(false) }} className="w-16 accent-purple-500" />
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-72 bg-slate-800 border-l border-slate-700 flex flex-col overflow-hidden">
                    {/* Panel Tabs */}
                    <div className="flex bg-slate-900 border-b border-slate-700">
                        {([
                            { id: 'properties', label: 'Özellikler', icon: Settings2 },
                            { id: 'filters', label: 'Filtreler', icon: Palette },
                            { id: 'transitions', label: 'Geçişler', icon: ArrowLeftRight },
                            { id: 'text', label: 'Metin', icon: Type },
                        ] as const).map(tab => {
                            const Icon = tab.icon
                            return (
                                <button key={tab.id} onClick={() => setRightPanel(tab.id)} className={`flex-1 py-2 text-[10px] font-bold transition-colors flex flex-col items-center gap-0.5 ${rightPanel === tab.id ? 'text-purple-400 border-b-2 border-purple-400' : 'text-slate-500 hover:text-slate-300'}`}>
                                    <Icon size={14} />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                        {/* Properties Panel */}
                        {rightPanel === 'properties' && (
                            <>
                                {selectedClip ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-3 h-3 rounded" style={{ backgroundColor: selectedClip.color }} />
                                            <span className="text-sm font-bold text-white truncate">{selectedClip.name}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1">Başlangıç</label>
                                                <input type="number" step={0.1} value={selectedClip.startTime.toFixed(1)} onChange={e => setClips(prev => prev.map(c => c.id === selectedClipId ? { ...c, startTime: Number(e.target.value) } : c))} className="w-full text-xs bg-slate-700 rounded px-2 py-1.5 text-white outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1">Süre (sn)</label>
                                                <input type="number" step={0.1} value={selectedClip.duration.toFixed(1)} onChange={e => setClips(prev => prev.map(c => c.id === selectedClipId ? { ...c, duration: Number(e.target.value) } : c))} className="w-full text-xs bg-slate-700 rounded px-2 py-1.5 text-white outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 block mb-1">Track</label>
                                            <select value={selectedClip.track} onChange={e => setClips(prev => prev.map(c => c.id === selectedClipId ? { ...c, track: Number(e.target.value) } : c))} className="w-full text-xs bg-slate-700 rounded px-2 py-1.5 text-white outline-none">
                                                {[0, 1, 2, 3].map(t => <option key={t} value={t}>Track {t + 1}</option>)}
                                            </select>
                                        </div>
                                        {selectedClip.type === 'audio' && (
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1">Ses ({Math.round((selectedClip.data.volume || 1) * 100)}%)</label>
                                                <input type="range" min={0} max={1} step={0.05} value={selectedClip.data.volume || 1} onChange={e => updateClipData(selectedClipId!, { volume: Number(e.target.value) })} className="w-full accent-purple-500" />
                                            </div>
                                        )}
                                        <div className="flex gap-1 pt-2 border-t border-slate-700">
                                            <button onClick={() => splitClip(selectedClipId!)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-700 rounded text-[10px] text-slate-300 hover:bg-slate-600 transition-colors" title="Böl"><Scissors size={12} /> Böl</button>
                                            <button onClick={() => duplicateClip(selectedClipId!)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-700 rounded text-[10px] text-slate-300 hover:bg-slate-600 transition-colors" title="Kopyala"><Copy size={12} /> Kopya</button>
                                            <button onClick={() => deleteClip(selectedClipId!)} className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-red-900/50 rounded text-[10px] text-red-400 hover:bg-red-900 transition-colors" title="Sil"><Trash2 size={12} /> Sil</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <Settings2 size={24} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">Bir klip seçin</p>
                                    </div>
                                )}
                            </>
                        )}

                        {/* Filters Panel */}
                        {rightPanel === 'filters' && (
                            <div className="space-y-2">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Video Filtreleri</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {FILTERS.map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => {
                                                setActiveFilter(f.id)
                                                if (selectedClip?.type === 'video') updateClipData(selectedClipId!, { filter: f.id })
                                            }}
                                            className={`rounded-lg overflow-hidden border-2 transition-all ${(selectedClip?.data?.filter || activeFilter) === f.id ? 'border-purple-500 ring-1 ring-purple-500/50' : 'border-slate-700 hover:border-slate-500'}`}
                                        >
                                            <div className={`h-12 ${f.preview}`} style={{ filter: f.css }} />
                                            <div className="py-1 text-[9px] text-slate-400 text-center bg-slate-800">{f.name}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Transitions Panel */}
                        {rightPanel === 'transitions' && (
                            <div className="space-y-2">
                                <p className="text-[10px] text-slate-500 font-bold uppercase">Geçiş Efektleri</p>
                                <p className="text-[10px] text-slate-600 mb-2">Klipler arası geçiş eklemek için bir video klip seçin</p>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {TRANSITIONS.map(t => (
                                        <button
                                            key={t.id}
                                            onClick={() => { if (selectedClip?.type === 'video') updateClipData(selectedClipId!, { transition: t.id }) }}
                                            disabled={!selectedClip || selectedClip.type !== 'video'}
                                            className={`p-2 rounded-lg border-2 transition-all text-center disabled:opacity-30 ${selectedClip?.data?.transition === t.id ? 'border-purple-500 bg-purple-900/30' : 'border-slate-700 hover:border-slate-500'}`}
                                        >
                                            <div className="text-lg mb-0.5">{t.icon}</div>
                                            <div className="text-[9px] text-slate-400">{t.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Text Editor Panel */}
                        {rightPanel === 'text' && (
                            <div className="space-y-3">
                                <button onClick={addTextClip} className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-500 transition-colors">
                                    <Plus size={14} /> Metin Ekle
                                </button>
                                {selectedClip?.type === 'text' && (
                                    <div className="space-y-2 pt-2 border-t border-slate-700">
                                        <div>
                                            <label className="text-[9px] text-slate-500 block mb-1">Metin</label>
                                            <textarea value={selectedClip.data.text || ''} onChange={e => updateClipData(selectedClipId!, { text: e.target.value })} className="w-full text-xs bg-slate-700 rounded px-2 py-1.5 text-white outline-none resize-none h-16" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1">Font</label>
                                                <select value={selectedClip.data.fontFamily} onChange={e => updateClipData(selectedClipId!, { fontFamily: e.target.value })} className="w-full text-[10px] bg-slate-700 rounded px-2 py-1.5 text-white outline-none">
                                                    {['Inter', 'Arial', 'Georgia', 'Courier New', 'Verdana'].map(f => <option key={f}>{f}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1">Boyut</label>
                                                <input type="number" value={selectedClip.data.fontSize} onChange={e => updateClipData(selectedClipId!, { fontSize: Number(e.target.value) })} className="w-full text-xs bg-slate-700 rounded px-2 py-1.5 text-white outline-none" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1">Renk</label>
                                                <input type="color" value={selectedClip.data.color} onChange={e => updateClipData(selectedClipId!, { color: e.target.value })} className="w-full h-7 rounded cursor-pointer" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1">Arka Plan</label>
                                                <input type="color" value={selectedClip.data.backgroundColor?.replace(/rgba?\([^)]+\)/, '#000000') || '#000000'} onChange={e => updateClipData(selectedClipId!, { backgroundColor: e.target.value + '80' })} className="w-full h-7 rounded cursor-pointer" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1">X (%)</label>
                                                <input type="number" min={0} max={100} value={selectedClip.data.x} onChange={e => updateClipData(selectedClipId!, { x: Number(e.target.value) })} className="w-full text-xs bg-slate-700 rounded px-2 py-1.5 text-white outline-none" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] text-slate-500 block mb-1">Y (%)</label>
                                                <input type="number" min={0} max={100} value={selectedClip.data.y} onChange={e => updateClipData(selectedClipId!, { y: Number(e.target.value) })} className="w-full text-xs bg-slate-700 rounded px-2 py-1.5 text-white outline-none" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[9px] text-slate-500 block mb-1">Animasyon</label>
                                            <select value={selectedClip.data.animation} onChange={e => updateClipData(selectedClipId!, { animation: e.target.value })} className="w-full text-xs bg-slate-700 rounded px-2 py-1.5 text-white outline-none">
                                                {TEXT_ANIMATIONS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline Area */}
            <div className="border-t border-slate-700 bg-slate-800">
                {/* Timeline Header */}
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-700">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Timeline</span>
                        <button onClick={addTextClip} className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-[10px] text-slate-400 hover:text-white transition-colors"><Type size={10} /> Metin</button>
                        <label className="flex items-center gap-1 px-2 py-1 bg-slate-700 rounded text-[10px] text-slate-400 hover:text-white transition-colors cursor-pointer"><ImageIcon size={10} /> Medya<input type="file" accept="video/*,image/*,audio/*" className="hidden" /></label>
                    </div>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1 text-slate-500 hover:text-white"><ZoomOut size={12} /></button>
                        <span className="text-[10px] text-slate-500 w-8 text-center font-mono">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-1 text-slate-500 hover:text-white"><ZoomIn size={12} /></button>
                    </div>
                </div>

                {/* Timeline Tracks */}
                <div className="flex overflow-hidden" style={{ height: 180 }}>
                    {/* Track Labels */}
                    <div className="w-28 shrink-0 border-r border-slate-700 bg-slate-850">
                        {[0, 1, 2, 3].map(track => (
                            <div key={track} className="h-10 flex items-center px-2 border-b border-slate-700/50 text-[10px] text-slate-500 gap-1">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TRACK_COLORS[track] || '#666' }} />
                                {track === 0 ? 'Video' : track === 1 ? 'Metin' : track === 2 ? 'Ses' : `Track ${track + 1}`}
                            </div>
                        ))}
                    </div>

                    {/* Timeline Content */}
                    <div ref={timelineRef} className="flex-1 overflow-x-auto overflow-y-hidden relative" onClick={handleTimelineClick}>
                        {/* Time Ruler */}
                        <div className="h-5 border-b border-slate-700 relative bg-slate-900/50 sticky top-0">
                            {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                                <div key={i} className="absolute top-0 h-full flex items-end" style={{ left: i * pixelsPerSecond }}>
                                    <div className="w-px h-2 bg-slate-600" />
                                    <span className="text-[8px] text-slate-600 ml-1 mb-0.5">{formatTime(i)}</span>
                                </div>
                            ))}
                        </div>

                        {/* Tracks */}
                        <div className="relative" style={{ width: (duration + 2) * pixelsPerSecond }}>
                            {[0, 1, 2, 3].map(track => (
                                <div key={track} className="h-10 relative border-b border-slate-700/30">
                                    {clips.filter(c => c.track === track).map(clip => (
                                        <div
                                            key={clip.id}
                                            onClick={e => { e.stopPropagation(); setSelectedClipId(clip.id) }}
                                            className={`absolute top-1 h-8 rounded-md cursor-pointer flex items-center px-2 overflow-hidden text-[10px] font-medium transition-all group ${selectedClipId === clip.id ? 'ring-2 ring-white shadow-lg shadow-purple-500/30' : 'hover:brightness-110'}`}
                                            style={{
                                                left: clip.startTime * pixelsPerSecond,
                                                width: clip.duration * pixelsPerSecond,
                                                backgroundColor: clip.color + (clip.type === 'audio' ? '60' : 'cc'),
                                                borderLeft: clip.data?.transition && clip.data.transition !== 'none' ? '3px solid #a855f7' : undefined,
                                            }}
                                        >
                                            <span className="truncate text-white drop-shadow-sm">{clip.name}</span>
                                            {clip.data?.transition && clip.data.transition !== 'none' && (
                                                <span className="absolute left-0.5 top-0.5 text-[8px] text-purple-200">◐</span>
                                            )}
                                            {/* Resize handles */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/30 opacity-0 group-hover:opacity-100 cursor-w-resize" />
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 opacity-0 group-hover:opacity-100 cursor-e-resize" />
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {/* Playhead */}
                            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-10" style={{ left: currentTime * pixelsPerSecond }}>
                                <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-red-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Export Dialog */}
            {showExportDialog && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-700">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <h3 className="font-bold text-lg text-white">Dışa Aktar</h3>
                            <button onClick={() => setShowExportDialog(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase">Çözünürlük</label>
                                <select className="w-full text-sm bg-slate-700 text-white rounded-lg px-3 py-2 outline-none">
                                    <option>{resolution.label} ({resolution.w}×{resolution.h})</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase">Format</label>
                                <div className="flex gap-2">
                                    {['MP4', 'WebM', 'GIF'].map(f => (
                                        <button key={f} className="flex-1 px-3 py-2 bg-slate-700 text-white rounded-lg text-xs font-bold hover:bg-slate-600 transition-colors">{f}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-500 block mb-1 font-bold uppercase">Kalite</label>
                                <select className="w-full text-sm bg-slate-700 text-white rounded-lg px-3 py-2 outline-none">
                                    <option>Yüksek (H.264)</option>
                                    <option>Orta</option>
                                    <option>Düşük (hızlı)</option>
                                </select>
                            </div>
                            {exporting && (
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Dışa aktarılıyor...</span>
                                        <span>{exportProgress}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple-600 to-cyan-500 rounded-full transition-all" style={{ width: `${exportProgress}%` }} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-900 border-t border-slate-700 flex justify-end gap-2">
                            <button onClick={() => setShowExportDialog(false)} className="px-4 py-2 text-sm font-bold text-slate-400 hover:bg-slate-700 rounded-lg">İptal</button>
                            <button onClick={handleExport} disabled={exporting} className="px-4 py-2 text-sm font-bold bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 flex items-center gap-1">
                                <Download size={14} /> {exporting ? 'İşleniyor...' : 'Dışa Aktar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
