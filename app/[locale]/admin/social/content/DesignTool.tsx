'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
    MousePointer2, Pencil, Type, Square, Circle, Eraser, Paintbrush,
    ImageIcon, Download, Upload, Undo2, Redo2, ZoomIn, ZoomOut,
    Eye, EyeOff, Trash2, Copy, Lock, Unlock, ChevronUp, ChevronDown,
    Plus, Minus, Sparkles, Wand2, Scissors, Layers, RotateCw,
    Palette, Pipette, Move, X, Save, FileDown, FileUp, Maximize2,
    Grid3x3, Settings2, SlidersHorizontal, Loader2, LayoutTemplate, ShieldCheck,
    ImagePlus, Search, Calendar // Added Calendar
} from 'lucide-react'

// ─── Import Templates ───
import TEMPLATES from './templates.json'

// ─── Types ───
interface Layer {
    id: string
    name: string
    type: 'image' | 'shape' | 'text' | 'draw' | 'ai'
    visible: boolean
    locked: boolean
    opacity: number
    x: number
    y: number
    width: number
    height: number
    data: any
    canvas?: HTMLCanvasElement
}

type Tool = 'select' | 'move' | 'brush' | 'eraser' | 'text' | 'rectangle' | 'circle' | 'line' | 'fill' | 'eyedropper' | 'crop'

interface HistoryStep {
    layers: Layer[]
    activeLayerId: string | null
}

// ─── Constants ───
const TOOLS: { id: Tool; icon: any; label: string; shortcut: string }[] = [
    { id: 'select', icon: MousePointer2, label: 'Seçim', shortcut: 'V' },
    { id: 'move', icon: Move, label: 'Taşı', shortcut: 'M' },
    { id: 'brush', icon: Pencil, label: 'Fırça', shortcut: 'B' },
    { id: 'eraser', icon: Eraser, label: 'Silgi', shortcut: 'E' },
    { id: 'text', icon: Type, label: 'Metin', shortcut: 'T' },
    { id: 'rectangle', icon: Square, label: 'Dikdörtgen', shortcut: 'R' },
    { id: 'circle', icon: Circle, label: 'Daire', shortcut: 'C' },
    { id: 'fill', icon: Paintbrush, label: 'Boya', shortcut: 'G' },
    { id: 'eyedropper', icon: Pipette, label: 'Renk Seçici', shortcut: 'I' },
    { id: 'crop', icon: Scissors, label: 'Kırp', shortcut: 'K' },
]

const AI_TOOLS = [
    { id: 'remove-bg', icon: Wand2, label: 'Arka Plan Kaldır', desc: 'AI ile arka planı otomatik kaldırır' },
    { id: 'inpaint', icon: Paintbrush, label: 'AI Tamamlama', desc: 'Seçili alanı AI ile doldurur' },
    { id: 'enhance', icon: Sparkles, label: 'AI Geliştir', desc: 'Görsel kalitesini artırır' },
    { id: 'remove-obj', icon: Eraser, label: 'Nesne Sil', desc: 'Seçili nesneyi AI ile kaldırır' },
    { id: 'generate', icon: ImageIcon, label: 'AI Görsel Oluştur', desc: 'Metin açıklamasından görsel üretir' },
    { id: 'upscale', icon: Maximize2, label: 'Çözünürlük Artır', desc: '2x-4x büyütme' },
]

const CANVAS_BG_COLORS = ['#ffffff', '#f8fafc', '#1e293b', '#0f172a', 'transparent']

// Corporate Brand Colors (Blue Dreams Resort)
const BRAND_COLORS = [
    '#005f73', '#0a9396', '#94d2bd', '#e9d8a6', '#ee9b00', '#ca6702', '#bb3e03', '#ae2012', '#9b2226'
]

let layerCounter = 0
function genId() { return `layer_${++layerCounter}_${Date.now()}` }

export default function DesignTool() {
    // ─── State ───
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const [canvasWidth, setCanvasWidth] = useState(1080)
    const [canvasHeight, setCanvasHeight] = useState(1080) // Instagram Square default
    const [zoom, setZoom] = useState(0.8)
    const [activeTool, setActiveTool] = useState<Tool>('select')
    const [brushSize, setBrushSize] = useState(4)
    const [brushColor, setBrushColor] = useState('#000000')
    const [fillColor, setFillColor] = useState('#3b82f6')
    const [strokeColor, setStrokeColor] = useState('#000000')
    const [fontSize, setFontSize] = useState(48)
    const [fontFamily, setFontFamily] = useState('Inter')
    const [opacity, setOpacity] = useState(100)
    const [layers, setLayers] = useState<Layer[]>([
        { id: genId(), name: 'Arka Plan', type: 'shape', visible: true, locked: true, opacity: 100, x: 0, y: 0, width: 1080, height: 1080, data: { fill: '#ffffff' } }
    ])
    const [activeLayerId, setActiveLayerId] = useState<string | null>(layers[0]?.id || null)

    // UI Panels
    const [activePanel, setActivePanel] = useState<'layers' | 'ai' | 'templates' | 'images'>('layers')
    const [isCorporateMode, setIsCorporateMode] = useState(false) // Enforce brand colors/fonts

    // Pexels State
    const [pexelsQuery, setPexelsQuery] = useState('')
    const [pexelsImages, setPexelsImages] = useState<any[]>([])
    const [pexelsLoading, setPexelsLoading] = useState(false)

    const [history, setHistory] = useState<HistoryStep[]>([])
    const [historyIndex, setHistoryIndex] = useState(-1)
    const [isDrawing, setIsDrawing] = useState(false)
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null)
    const [showGrid, setShowGrid] = useState(false)
    const [aiProcessing, setAiProcessing] = useState<string | null>(null)
    const [canvasBg, setCanvasBg] = useState('#f8fafc')
    const [textInput, setTextInput] = useState('')
    const [showTextInput, setShowTextInput] = useState(false)
    const [textPos, setTextPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
    const [recentColors, setRecentColors] = useState<string[]>(['#000000', '#ffffff', '#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#06b6d4'])
    const drawPoints = useRef<{ x: number; y: number }[]>([])

    // Schedule State
    const [showScheduleModal, setShowScheduleModal] = useState(false)
    const [scheduleDate, setScheduleDate] = useState('')
    const [scheduleCaption, setScheduleCaption] = useState('')
    const [isScheduling, setIsScheduling] = useState(false)

    const activeLayer = layers.find(l => l.id === activeLayerId)

    // ─── Pexels Handler ───
    const searchPexels = async () => {
        if (!pexelsQuery.trim()) return
        setPexelsLoading(true)
        try {
            const res = await fetch(`/api/admin/stock-images?query=${encodeURIComponent(pexelsQuery)}`)
            const data = await res.json()
            if (data.photos) {
                setPexelsImages(data.photos)
            }
        } catch (error) {
            console.error('Pexels search failed', error)
        }
        setPexelsLoading(false)
    }

    const addPexelsImage = (src: string) => {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
            const aspectRatio = img.width / img.height
            const maxW = canvasWidth * 0.8
            const maxH = canvasHeight * 0.8
            let w = img.width, h = img.height
            if (w > maxW) { w = maxW; h = w / aspectRatio }
            if (h > maxH) { h = maxH; w = h * aspectRatio }
            const newLayer: Layer = {
                id: genId(), name: `Stok Görsel`,
                type: 'image', visible: true, locked: false, opacity: 100,
                x: (canvasWidth - w) / 2, y: (canvasHeight - h) / 2,
                width: w, height: h,
                data: { img, src }
            }
            setLayers(prev => [...prev, newLayer])
            setActiveLayerId(newLayer.id)
        }
        img.src = src
    }

    // ─── Template Loader ───
    const loadTemplate = (templateId: string) => {
        const tpl = TEMPLATES.find(t => t.id === templateId)
        if (!tpl) return

        // Reset canvas size if needed (e.g. story vs post)
        // Here we assume most are square/portrait, let's auto-fit
        // setCanvasWidth(1080); setCanvasHeight(1080);

        const newLayers = tpl.layers.map(l => ({
            ...l,
            id: genId(),
            visible: true,
            // If corporate mode is on, lock "fixed" layers (conceptually)
            locked: isCorporateMode && (l.data?.text?.includes('Blue Dreams') || l.type === 'shape' && l.data?.fill === '#005f73'),
            // Re-hydrate any missing props
            opacity: l.opacity || 100,
            x: l.x || 0,
            y: l.y || 0,
            width: l.width || 100,
            height: l.height || 100,
        })) as Layer[]

        setLayers(newLayers)
        setActiveLayerId(newLayers[newLayers.length - 1]?.id)
    }

    // ─── Canvas Rendering ───
    const redrawCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = canvasWidth
        canvas.height = canvasHeight

        // Background (Canvas specific, separate from Background Layer)
        if (canvasBg === 'transparent') {
            const size = 20
            for (let y = 0; y < canvasHeight; y += size) {
                for (let x = 0; x < canvasWidth; x += size) {
                    ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? '#e2e8f0' : '#ffffff'
                    ctx.fillRect(x, y, size, size)
                }
            }
        } else {
            ctx.fillStyle = canvasBg
            ctx.fillRect(0, 0, canvasWidth, canvasHeight)
        }

        // Draw layers bottom to top
        layers.filter(l => l.visible).forEach(layer => {
            ctx.save()
            ctx.globalAlpha = layer.opacity / 100

            if (layer.type === 'shape' && layer.data?.fill) {
                ctx.fillStyle = layer.data.fill
                if (layer.data.shape === 'circle') {
                    ctx.beginPath()
                    ctx.ellipse(layer.x + layer.width / 2, layer.y + layer.height / 2, layer.width / 2, layer.height / 2, 0, 0, Math.PI * 2)
                    ctx.fill()
                } else {
                    ctx.fillRect(layer.x, layer.y, layer.width, layer.height)
                }
                if (layer.data.stroke) {
                    ctx.strokeStyle = layer.data.stroke
                    ctx.lineWidth = 2
                    ctx.strokeRect(layer.x, layer.y, layer.width, layer.height)
                }
            }

            if (layer.type === 'text' && layer.data?.text) {
                ctx.font = `${layer.data.fontWeight || 'normal'} ${layer.data.fontSize || 24}px ${layer.data.fontFamily || 'Inter'}`
                ctx.fillStyle = layer.data.color || '#000000'
                ctx.textBaseline = 'top'
                ctx.fillText(layer.data.text, layer.x, layer.y)
            }

            if (layer.type === 'draw' && layer.canvas) {
                ctx.drawImage(layer.canvas, 0, 0)
            }

            if (layer.type === 'image' && layer.data?.img) {
                ctx.drawImage(layer.data.img, layer.x, layer.y, layer.width, layer.height)
            }

            ctx.restore()
        })

        // Grid overlay
        if (showGrid) {
            ctx.save()
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)'
            ctx.lineWidth = 1
            for (let x = 0; x <= canvasWidth; x += 100) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke()
            }
            for (let y = 0; y <= canvasHeight; y += 100) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke()
            }
            ctx.restore()
        }

        // Selection indicator
        if (activeLayer) {
            ctx.save()
            ctx.strokeStyle = '#06b6d4'
            ctx.lineWidth = 3
            ctx.setLineDash([5, 5])
            // Highlight bounding box
            ctx.strokeRect(activeLayer.x - 2, activeLayer.y - 2, activeLayer.width + 4, activeLayer.height + 4)

            // Handles (Corners)
            // TopLeft
            ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#06b6d4'; ctx.setLineDash([]);
            ctx.beginPath(); ctx.arc(activeLayer.x, activeLayer.y, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            // BottomRight
            ctx.beginPath(); ctx.arc(activeLayer.x + activeLayer.width, activeLayer.y + activeLayer.height, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

            ctx.restore()
        }
    }, [layers, canvasWidth, canvasHeight, canvasBg, showGrid, activeLayerId, activeLayer])

    useEffect(() => { redrawCanvas() }, [redrawCanvas])

    // ─── Mouse Handlers ───
    const getMousePos = (e: React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        return {
            x: (e.clientX - rect.left) / zoom,
            y: (e.clientY - rect.top) / zoom,
        }
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        const pos = getMousePos(e)
        setStartPos(pos)
        setIsDrawing(true)

        // Selection Logic
        if (activeTool === 'select' || activeTool === 'move') {
            // Find clicked layer (topmost first)
            const clickedLayer = [...layers].reverse().find(l =>
                pos.x >= l.x && pos.x <= l.x + l.width &&
                pos.y >= l.y && pos.y <= l.y + l.height &&
                l.visible && !l.locked
            )
            if (clickedLayer) setActiveLayerId(clickedLayer.id)
            // else setActiveLayerId(null) // Optional: Deselect if clicked empty space
        }

        if (activeTool === 'brush' || activeTool === 'eraser') {
            drawPoints.current = [pos]
            // Create or use draw layer
            let drawLayer = layers.find(l => l.id === activeLayerId && l.type === 'draw')
            if (!drawLayer) {
                const newCanvas = document.createElement('canvas')
                newCanvas.width = canvasWidth
                newCanvas.height = canvasHeight
                const newLayer: Layer = {
                    id: genId(), name: `Çizim ${layers.filter(l => l.type === 'draw').length + 1}`,
                    type: 'draw', visible: true, locked: false, opacity: 100,
                    x: 0, y: 0, width: canvasWidth, height: canvasHeight,
                    data: {}, canvas: newCanvas,
                }
                setLayers(prev => [...prev, newLayer])
                setActiveLayerId(newLayer.id)
                drawLayer = newLayer
            }
            const dctx = drawLayer?.canvas?.getContext('2d')
            if (dctx) {
                dctx.beginPath()
                dctx.moveTo(pos.x, pos.y)
                dctx.strokeStyle = activeTool === 'eraser' ? 'rgba(0,0,0,1)' : brushColor // Eraser logic handles composite
                dctx.lineWidth = brushSize
                dctx.lineCap = 'round'
                dctx.lineJoin = 'round'
                if (activeTool === 'eraser') {
                    dctx.globalCompositeOperation = 'destination-out'
                } else {
                    dctx.globalCompositeOperation = 'source-over'
                }
            }
        }

        if (activeTool === 'text') {
            setTextPos(pos)
            setShowTextInput(true)
        }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDrawing) return
        const pos = getMousePos(e)

        if ((activeTool === 'brush' || activeTool === 'eraser') && drawPoints.current.length > 0) {
            const drawLayer = layers.find(l => l.id === activeLayerId && l.type === 'draw')
            const dctx = drawLayer?.canvas?.getContext('2d')
            if (dctx) {
                dctx.lineTo(pos.x, pos.y)
                dctx.stroke()
                drawPoints.current.push(pos)
                redrawCanvas()
            }
        }

        if (activeTool === 'move' && activeLayer && !activeLayer.locked && startPos) {
            const dx = pos.x - startPos.x
            const dy = pos.y - startPos.y
            setLayers(prev => prev.map(l => l.id === activeLayerId ? { ...l, x: l.x + dx, y: l.y + dy } : l))
            setStartPos(pos)
        }
    }

    const handleMouseUp = (e: React.MouseEvent) => {
        const pos = getMousePos(e)

        if ((activeTool === 'rectangle' || activeTool === 'circle') && startPos) {
            const w = Math.abs(pos.x - startPos.x)
            const h = Math.abs(pos.y - startPos.y)
            if (w > 5 && h > 5) {
                const newLayer: Layer = {
                    id: genId(),
                    name: activeTool === 'rectangle' ? `Dikdörtgen ${layers.filter(l => l.data?.shape === 'rect').length + 1}` : `Daire ${layers.filter(l => l.data?.shape === 'circle').length + 1}`,
                    type: 'shape', visible: true, locked: false, opacity: 100,
                    x: Math.min(pos.x, startPos.x), y: Math.min(pos.y, startPos.y),
                    width: w, height: h,
                    data: { fill: fillColor, stroke: strokeColor, shape: activeTool === 'circle' ? 'circle' : 'rect' }
                }
                setLayers(prev => [...prev, newLayer])
                setActiveLayerId(newLayer.id)
            }
        }

        if (activeTool === 'brush' || activeTool === 'eraser') {
            const drawLayer = layers.find(l => l.id === activeLayerId && l.type === 'draw')
            const dctx = drawLayer?.canvas?.getContext('2d')
            if (dctx) {
                dctx.globalCompositeOperation = 'source-over'
            }
        }

        setIsDrawing(false)
        setStartPos(null)
        drawPoints.current = []
    }

    // ─── Text Input Handler ───
    const handleTextSubmit = () => {
        if (!textInput.trim()) { setShowTextInput(false); return }
        const newLayer: Layer = {
            id: genId(), name: `Metin: "${textInput.slice(0, 20)}"`,
            type: 'text', visible: true, locked: false, opacity: 100,
            x: textPos.x, y: textPos.y, width: textInput.length * fontSize * 0.6, height: fontSize * 1.5,
            data: { text: textInput, fontSize, fontFamily, color: brushColor }
        }
        setLayers(prev => [...prev, newLayer])
        setActiveLayerId(newLayer.id)
        setTextInput('')
        setShowTextInput(false)
    }

    // ─── Layer Actions ───
    const addLayer = (type: Layer['type'] = 'shape') => {
        const newLayer: Layer = {
            id: genId(), name: `Katman ${layers.length + 1}`,
            type, visible: true, locked: false, opacity: 100,
            x: 100, y: 100, width: 200, height: 200,
            data: type === 'shape' ? { fill: fillColor, shape: 'rect' } : {}
        }
        setLayers(prev => [...prev, newLayer])
        setActiveLayerId(newLayer.id)
    }

    const deleteLayer = (id: string) => {
        if (layers.length <= 1) return
        setLayers(prev => prev.filter(l => l.id !== id))
        if (activeLayerId === id) setActiveLayerId(layers[0]?.id || null)
    }

    const duplicateLayer = (id: string) => {
        const source = layers.find(l => l.id === id)
        if (!source) return
        const clone: Layer = { ...source, id: genId(), name: `${source.name} (kopya)`, x: source.x + 20, y: source.y + 20 }
        setLayers(prev => [...prev, clone])
        setActiveLayerId(clone.id)
    }

    const moveLayerUp = (id: string) => {
        setLayers(prev => {
            const idx = prev.findIndex(l => l.id === id)
            if (idx >= prev.length - 1) return prev
            const arr = [...prev];
            [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
            return arr
        })
    }

    const moveLayerDown = (id: string) => {
        setLayers(prev => {
            const idx = prev.findIndex(l => l.id === id)
            if (idx <= 0) return prev
            const arr = [...prev];
            [arr[idx], arr[idx - 1]] = [arr[idx - 1], arr[idx]]
            return arr
        })
    }

    const toggleLayerVisibility = (id: string) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l))
    }

    const toggleLayerLock = (id: string) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l))
    }

    const setLayerOpacity = (id: string, val: number) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, opacity: val } : l))
    }

    // ─── Image Import ───
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            const img = new Image()
            img.onload = () => {
                const aspectRatio = img.width / img.height
                const maxW = canvasWidth * 0.8
                const maxH = canvasHeight * 0.8
                let w = img.width, h = img.height
                if (w > maxW) { w = maxW; h = w / aspectRatio }
                if (h > maxH) { h = maxH; w = h * aspectRatio }
                const newLayer: Layer = {
                    id: genId(), name: file.name.replace(/\.[^.]+$/, ''),
                    type: 'image', visible: true, locked: false, opacity: 100,
                    x: (canvasWidth - w) / 2, y: (canvasHeight - h) / 2,
                    width: w, height: h,
                    data: { img, src: reader.result }
                }
                setLayers(prev => [...prev, newLayer])
                setActiveLayerId(newLayer.id)
            }
            img.src = reader.result as string
        }
        reader.readAsDataURL(file)
    }

    // ─── Export ───
    const handleExport = (format: 'png' | 'jpg') => {
        const canvas = canvasRef.current
        if (!canvas) return
        const link = document.createElement('a')
        link.download = `design-${Date.now()}.${format}`
        link.href = canvas.toDataURL(format === 'jpg' ? 'image/jpeg' : 'image/png', 0.95)
        link.click()
    }

    // ─── Schedule Handler ───
    const handleSchedule = async () => {
        if (!scheduleDate) return alert('Lütfen bir tarih seçin.')

        setIsScheduling(true)
        const canvas = canvasRef.current
        if (!canvas) return

        const image = canvas.toDataURL('image/png', 0.9)

        try {
            const res = await fetch('/api/admin/social/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image, date: scheduleDate, caption: scheduleCaption })
            })

            if (res.ok) {
                alert('Tasarım başarıyla takvime eklendi!')
                setShowScheduleModal(false)
                setScheduleCaption('')
                setScheduleDate('')
            } else {
                alert('Bir hata oluştu.')
            }
        } catch (error) {
            console.error(error)
            alert('Bağlantı hatası.')
        }
        setIsScheduling(false)
    }

    // ─── AI Tool Handler ───
    const handleAiTool = async (toolId: string) => {
        setAiProcessing(toolId)
        // Simulate AI processing (stub — will connect to real AI API in production)
        await new Promise(resolve => setTimeout(resolve, 2000))
        setAiProcessing(null)
    }

    // ─── Keyboard Shortcuts ───
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            const key = e.key.toLowerCase()
            const tool = TOOLS.find(t => t.shortcut.toLowerCase() === key)
            if (tool) { setActiveTool(tool.id); e.preventDefault() }
            if (e.ctrlKey && key === 'z') { /* undo */ e.preventDefault() }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [activeLayerId])

    // ─── Render ───
    return (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Palette size={18} className="text-cyan-500" /> Tasarım Aracı v2.0
                    </span>
                    <span className="text-xs text-slate-400 ml-2">{canvasWidth} × {canvasHeight}px</span>
                </div>
                <div className="flex items-center gap-2">
                    {/* Mode Toggle */}
                    <button
                        onClick={() => setIsCorporateMode(!isCorporateMode)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isCorporateMode ? 'bg-blue-900 text-white border-blue-700' : 'bg-slate-100 text-slate-500 border-transparent'}`}
                        title="Kurumsal Mod: Logo ve renkleri kilitler"
                    >
                        <ShieldCheck size={14} /> {isCorporateMode ? 'Kurumsal Mod' : 'Serbest Mod'}
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2" />

                    {/* Canvas Size */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1">
                        <input type="number" value={canvasWidth} onChange={e => setCanvasWidth(Number(e.target.value))} className="w-12 text-xs bg-transparent text-center text-slate-700 dark:text-slate-300 outline-none" />
                        <span className="text-xs text-slate-400">×</span>
                        <input type="number" value={canvasHeight} onChange={e => setCanvasHeight(Number(e.target.value))} className="w-12 text-xs bg-transparent text-center text-slate-700 dark:text-slate-300 outline-none" />
                    </div>
                    {/* Zoom */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-1">
                        <button onClick={() => setZoom(z => Math.max(0.25, z - 0.25))} className="p-1 text-slate-400 hover:text-slate-600"><ZoomOut size={14} /></button>
                        <span className="text-xs text-slate-600 dark:text-slate-300 w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="p-1 text-slate-400 hover:text-slate-600"><ZoomIn size={14} /></button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Toolbar */}
                <div className="w-12 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center py-2 gap-0.5">
                    {TOOLS.map(tool => {
                        const Icon = tool.icon
                        return (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all relative group ${activeTool === tool.id ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                title={`${tool.label} (${tool.shortcut})`}
                            >
                                <Icon size={16} />
                            </button>
                        )
                    })}
                    <div className="w-8 border-t border-slate-200 dark:border-slate-700 my-1" />
                    {/* Color Pickers */}
                    <div className="relative">
                        <input type="color" value={brushColor} onChange={e => setBrushColor(e.target.value)} className="w-7 h-7 rounded cursor-pointer border-2 border-white dark:border-slate-600 shadow-sm" title="Ön Plan Rengi" />
                    </div>
                    <div className="relative -mt-2 ml-2">
                        <input type="color" value={fillColor} onChange={e => setFillColor(e.target.value)} className="w-6 h-6 rounded cursor-pointer border-2 border-white dark:border-slate-600 shadow-sm" title="Dolgu Rengi" />
                    </div>
                </div>

                {/* Tool Options Bar & Canvas */}
                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 min-h-[40px]">
                        {(activeTool === 'brush' || activeTool === 'eraser') && (
                            <>
                                <label className="text-[10px] text-slate-400 uppercase font-bold">Boyut</label>
                                <input type="range" min={1} max={100} value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-24 accent-cyan-500" />
                                <span className="text-xs text-slate-500 w-8 text-center font-mono">{brushSize}px</span>
                            </>
                        )}
                        {/* More tool options here... (truncated for brevity) */}
                        <div className="ml-auto flex items-center gap-2">
                            <button onClick={() => setShowGrid(!showGrid)} className={`p-1.5 rounded-lg transition-colors ${showGrid ? 'bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`} title="Grid"><Grid3x3 size={16} /></button>
                            <div className="w-px h-4 bg-slate-300 mx-1"></div>
                            {/* Schedule Button */}
                            <button onClick={() => setShowScheduleModal(true)} className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded text-xs font-bold hover:bg-purple-500 transition-colors mr-2">
                                <Calendar size={12} /> Takvime Ekle
                            </button>
                            <button onClick={() => handleExport('png')} className="flex items-center gap-1 px-3 py-1 bg-cyan-600 text-white rounded text-xs font-bold hover:bg-cyan-500 transition-colors">
                                <Download size={12} /> İndir
                            </button>
                        </div>
                    </div>

                    {/* Canvas Area */}
                    <div ref={containerRef} className="flex-1 overflow-auto bg-slate-200 dark:bg-slate-900 flex items-center justify-center p-8 relative" style={{ backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.15) 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                        <div className="relative shadow-2xl bg-white" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
                            <canvas
                                ref={canvasRef}
                                width={canvasWidth}
                                height={canvasHeight}
                                className="cursor-crosshair"
                                style={{ cursor: activeTool === 'move' ? 'grab' : activeTool === 'eyedropper' ? 'crosshair' : activeTool === 'text' ? 'text' : 'crosshair' }}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={() => { setIsDrawing(false); drawPoints.current = [] }}
                            />
                            {showTextInput && (
                                <div className="absolute bg-white dark:bg-slate-800 border-2 border-cyan-500 rounded-lg p-2 shadow-xl" style={{ left: textPos.x, top: textPos.y, minWidth: 200 }}>
                                    <input
                                        type="text" value={textInput} onChange={e => setTextInput(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleTextSubmit(); if (e.key === 'Escape') setShowTextInput(false) }}
                                        placeholder="Metin girin..."
                                        className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none"
                                        style={{ fontSize: `${fontSize}px`, fontFamily }}
                                        autoFocus
                                    />
                                    <div className="flex gap-1 mt-1">
                                        <button onClick={handleTextSubmit} className="px-2 py-0.5 bg-cyan-600 text-white rounded text-[10px] font-bold">Ekle</button>
                                        <button onClick={() => setShowTextInput(false)} className="px-2 py-0.5 bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-white rounded text-[10px]">İptal</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Panel — Layers + Properties + Templates */}
                <div className="w-72 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden">
                    {/* Panel Tabs */}
                    <div className="flex border-b border-slate-200 dark:border-slate-700">
                        <button onClick={() => setActivePanel('layers')} className={`flex-1 py-2 text-xs font-bold ${activePanel === 'layers' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-700'}`}>Katmanlar</button>
                        <button onClick={() => setActivePanel('templates')} className={`flex-1 py-2 text-xs font-bold ${activePanel === 'templates' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-700'}`}>Şablonlar</button>
                        <button onClick={() => setActivePanel('images')} className={`flex-1 py-2 text-xs font-bold ${activePanel === 'images' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-700'}`}>Görseller</button>
                        <button onClick={() => setActivePanel('ai')} className={`flex-1 py-2 text-xs font-bold ${activePanel === 'ai' ? 'text-cyan-600 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-700'}`}>AI</button>
                    </div>

                    {/* LAYERS PANEL */}
                    {activePanel === 'layers' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                                <span className="text-xs font-bold text-slate-600">Katmanlar ({layers.length})</span>
                                <button onClick={() => addLayer()} className="p-1 text-slate-400 hover:text-cyan-600"><Plus size={14} /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
                                {[...layers].reverse().map(layer => (
                                    <div
                                        key={layer.id}
                                        onClick={() => setActiveLayerId(layer.id)}
                                        className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-all text-xs group ${activeLayerId === layer.id ? 'bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800' : 'hover:bg-slate-50 border border-transparent'} ${layer.locked ? 'opacity-75' : ''}`}
                                    >
                                        <button onClick={e => { e.stopPropagation(); toggleLayerVisibility(layer.id) }} className="text-slate-400 hover:text-slate-600 shrink-0">
                                            {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                                        </button>
                                        <span className="truncate flex-1 font-medium">{layer.name}</span>
                                        {layer.locked && <Lock size={10} className="text-amber-500" />}
                                        <button onClick={e => { e.stopPropagation(); deleteLayer(layer.id) }} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500"><Trash2 size={12} /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TEMPLATES PANEL */}
                    {activePanel === 'templates' && (
                        <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 content-start">
                            {TEMPLATES.map(tpl => (
                                <button
                                    key={tpl.id}
                                    onClick={() => loadTemplate(tpl.id)}
                                    className="group relative aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200 hover:border-cyan-500 hover:shadow-md transition-all text-left"
                                >
                                    {/* Placeholder Preview */}
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
                                        <LayoutTemplate className="text-slate-300" size={32} />
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 bg-white/90 p-2 border-t border-slate-100">
                                        <div className="text-[10px] font-bold text-slate-800 truncate">{tpl.name}</div>
                                        <div className="text-[9px] text-slate-500">{tpl.category}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* IMAGES PANEL */}
                    {activePanel === 'images' && (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={pexelsQuery}
                                        onChange={(e) => setPexelsQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && searchPexels()}
                                        placeholder="Pexels'de ara..."
                                        className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                                    />
                                    <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                                </div>
                                <button
                                    onClick={searchPexels}
                                    disabled={pexelsLoading}
                                    className="w-full mt-2 bg-slate-800 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                                >
                                    {pexelsLoading ? 'Aranıyor...' : 'Ara'}
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2 content-start">
                                {pexelsImages.map((photo) => (
                                    <button
                                        key={photo.id}
                                        onClick={() => addPexelsImage(photo.src.large2x)}
                                        className="relative aspect-square rounded-lg overflow-hidden group bg-slate-100"
                                    >
                                        <img src={photo.src.medium} alt={photo.alt} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Plus className="text-white" />
                                        </div>
                                    </button>
                                ))}
                                {!pexelsLoading && pexelsImages.length === 0 && (
                                    <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
                                        <ImagePlus size={24} className="mx-auto mb-2 opacity-50" />
                                        Görsel aramak için arama yapın.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* AI PANEL */}
                    {activePanel === 'ai' && (
                        <div className="flex-1 p-3 space-y-2">
                            {AI_TOOLS.map(tool => (
                                <button
                                    key={tool.id}
                                    onClick={() => handleAiTool(tool.id)}
                                    disabled={aiProcessing !== null}
                                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left hover:bg-purple-50 border border-slate-100 hover:border-purple-200 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                                        <tool.icon size={16} />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-slate-700 group-hover:text-purple-700">{tool.label}</div>
                                        <div className="text-[10px] text-slate-400">{tool.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* PROPERTIES (Shared) */}
                    {activeLayer && (
                        <div className="border-t border-slate-200 dark:border-slate-700 p-3 space-y-3 bg-slate-50/50">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Özellikler</span>
                                <div className="flex gap-1">
                                    <button onClick={() => toggleLayerLock(activeLayer.id)} className={`p-1 rounded ${activeLayer.locked ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:bg-slate-200'}`}><Lock size={12} /></button>
                                </div>
                            </div>

                            {/* Corporate Colors Only if Mode Active */}
                            <div>
                                <label className="text-[10px] text-slate-400 block mb-1">
                                    {isCorporateMode ? "Kurumsal Renkler (Zorunlu)" : "Renk Paleti"}
                                </label>
                                <div className="flex gap-1 flex-wrap">
                                    {(isCorporateMode ? BRAND_COLORS : recentColors).map((c, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                if (activeLayer.locked && isCorporateMode) return; // Cant edit locked corp layers
                                                setBrushColor(c); setFillColor(c);
                                                // Live update selection
                                                setLayers(prev => prev.map(l => l.id === activeLayerId ? { ...l, data: { ...l.data, fill: c, color: c } } : l))
                                            }}
                                            className="w-5 h-5 rounded-full border border-slate-300 hover:scale-110 transition-transform shadow-sm"
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    {!isCorporateMode && <input type="color" className="w-5 h-5 opacity-0 absolute" onChange={(e) => setFillColor(e.target.value)} />}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-[9px] text-slate-400">Opaklık</label>
                                    <input type="range" min={0} max={100} value={activeLayer.opacity} onChange={e => setLayerOpacity(activeLayerId!, Number(e.target.value))} className="w-full accent-cyan-500 h-1 mt-1 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* SCHEDULE MODAL */}
            {showScheduleModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Calendar size={18} className="text-purple-500" /> Takvime Ekle
                            </h3>
                            <button onClick={() => setShowScheduleModal(false)}><X size={18} className="text-slate-400" /></button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Tarih & Saat</label>
                                <input
                                    type="datetime-local"
                                    value={scheduleDate}
                                    onChange={(e) => setScheduleDate(e.target.value)}
                                    className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Açıklama (Opsiyonel)</label>
                                <textarea
                                    value={scheduleCaption}
                                    onChange={(e) => setScheduleCaption(e.target.value)}
                                    placeholder="Gönderi metni..."
                                    className="w-full text-sm p-2 border border-slate-200 rounded-lg outline-none focus:border-purple-500 h-24 resize-none"
                                />
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
                            <button onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">İptal</button>
                            <button
                                onClick={handleSchedule}
                                disabled={isScheduling}
                                className="px-4 py-2 text-sm font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {isScheduling && <Loader2 size={14} className="animate-spin" />}
                                {isScheduling ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
