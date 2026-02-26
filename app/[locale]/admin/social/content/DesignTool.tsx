'use client'

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
    MousePointer2, Pencil, Type, Square, Circle, Eraser, Paintbrush,
    ImageIcon, Download, Upload, Undo2, Redo2, ZoomIn, ZoomOut,
    Eye, EyeOff, Trash2, Copy, Lock, Unlock, ChevronUp, ChevronDown,
    Plus, Minus, Sparkles, Wand2, Scissors, Layers, RotateCw,
    Palette, Pipette, Move, X, Save, FileDown, FileUp, Maximize2,
    Grid3x3, Settings2, SlidersHorizontal, Loader2, LayoutTemplate, ShieldCheck,
    ImagePlus, Search, Calendar, Menu, PanelRightClose, Filter
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

    // Mobile responsive state
    const [showMobilePanel, setShowMobilePanel] = useState(false)

    // Template preview & filter state
    const [templatePreviews, setTemplatePreviews] = useState<Record<string, string>>({})
    const [templateSearch, setTemplateSearch] = useState('')
    const [templateCategory, setTemplateCategory] = useState<string>('all')

    // Derive unique categories
    const templateCategories = useMemo(() => {
        const cats = new Set(TEMPLATES.map(t => t.category))
        return ['all', ...Array.from(cats)]
    }, [])

    // Filter templates
    const filteredTemplates = useMemo(() => {
        return TEMPLATES.filter(t => {
            const matchCat = templateCategory === 'all' || t.category === templateCategory
            const matchSearch = !templateSearch.trim() || t.name.toLowerCase().includes(templateSearch.toLowerCase()) || t.category.toLowerCase().includes(templateSearch.toLowerCase())
            return matchCat && matchSearch
        })
    }, [templateCategory, templateSearch])

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

        const newLayers: Layer[] = []
        for (const l of tpl.layers) {
            let layer: any = {
                ...l,
                id: genId(),
                visible: true,
                locked: isCorporateMode && (l.data?.text?.includes('Blue Dreams') || l.type === 'shape' && l.data?.fill === '#005f73'),
                opacity: l.opacity || 100,
                x: l.x || 0,
                y: l.y || 0,
                width: l.width || 100,
                height: l.height || 100,
            }

            // Convert placeholder shapes to actual images if needed
            if (layer.type === 'shape' && (layer.name === 'Image Placeholder' || layer.name === 'Room Image')) {
                layer.type = 'image'
                const src = layer.name === 'Room Image'
                    ? 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1080&q=80' // Luxury Room
                    : 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1080&q=80' // Food

                layer.data = { ...layer.data, src }

                // Load the image asynchronously
                const img = new Image()
                img.crossOrigin = "anonymous"
                img.onload = () => {
                    setLayers(prev => prev.map(pl => pl.id === layer.id ? { ...pl, data: { ...pl.data, img } } : pl))
                }
                img.src = src
            }
            newLayers.push(layer as Layer)
        }

        setLayers(newLayers)
        setActiveLayerId(newLayers[newLayers.length - 1]?.id)
        setShowMobilePanel(false) // Close mobile panel after selection
    }

    // ─── Template Thumbnail Generator ───
    useEffect(() => {
        const THUMB_SIZE = 200
        const generated: Record<string, string> = {}
        for (const tpl of TEMPLATES) {
            try {
                const offscreen = document.createElement('canvas')
                offscreen.width = THUMB_SIZE
                offscreen.height = THUMB_SIZE
                const ctx = offscreen.getContext('2d')
                if (!ctx) continue

                const scale = THUMB_SIZE / 1080 // templates are 1080x1080
                ctx.scale(scale, scale)

                for (const l of tpl.layers) {
                    ctx.save()
                    ctx.globalAlpha = (l.opacity || 100) / 100

                    if (l.type === 'shape' && (l.data as any)?.fill && (l.data as any).fill !== 'transparent') {
                        ctx.fillStyle = (l.data as any).fill
                        if ((l.data as any).shape === 'circle') {
                            ctx.beginPath()
                            ctx.ellipse((l.x || 0) + (l.width || 0) / 2, (l.y || 0) + (l.height || 0) / 2, (l.width || 0) / 2, (l.height || 0) / 2, 0, 0, Math.PI * 2)
                            ctx.fill()
                        } else {
                            ctx.fillRect(l.x || 0, l.y || 0, l.width || 0, l.height || 0)
                        }
                    }

                    if (l.type === 'shape' && (l.data as any)?.stroke) {
                        ctx.strokeStyle = (l.data as any).stroke
                        ctx.lineWidth = 3
                        ctx.strokeRect(l.x || 0, l.y || 0, l.width || 0, l.height || 0)
                    }

                    if (l.type === 'text' && (l.data as any)?.text) {
                        const fs = (l.data as any).fontSize || 24
                        ctx.font = `${(l.data as any).fontWeight || 'normal'} ${fs}px ${(l.data as any).fontFamily || 'Inter'}`
                        ctx.fillStyle = (l.data as any).color || '#000000'
                        ctx.textBaseline = 'top'
                        ctx.fillText((l.data as any).text, l.x || 0, l.y || 0)
                    }

                    ctx.restore()
                }

                generated[tpl.id] = offscreen.toDataURL('image/png', 0.7)
            } catch { /* skip problematic templates */ }
        }
        setTemplatePreviews(generated)
    }, [])

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
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[400px] lg:min-h-[600px] bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-3 lg:px-4 py-2 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Palette size={18} className="text-cyan-500" /> <span className="hidden sm:inline">Tasarım Aracı v2.0</span><span className="sm:hidden">Tasarım</span>
                    </span>
                    <span className="text-xs text-slate-400 ml-2 hidden md:inline">{canvasWidth} × {canvasHeight}px</span>
                </div>
                <div className="flex items-center gap-1 lg:gap-2">
                    {/* Mode Toggle */}
                    <button
                        onClick={() => setIsCorporateMode(!isCorporateMode)}
                        className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isCorporateMode ? 'bg-blue-900 text-white border-blue-700' : 'bg-slate-100 text-slate-500 border-transparent'}`}
                        title="Kurumsal Mod: Logo ve renkleri kilitler"
                    >
                        <ShieldCheck size={14} /> {isCorporateMode ? 'Kurumsal Mod' : 'Serbest Mod'}
                    </button>

                    <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden md:block" />

                    {/* Canvas Size */}
                    <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-2 py-1">
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

                    {/* Mobile Panel Toggle */}
                    <button
                        onClick={() => setShowMobilePanel(!showMobilePanel)}
                        className="lg:hidden p-2 rounded-lg bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition-colors"
                        title="Panel aç/kapat"
                    >
                        <Menu size={18} />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Toolbar — vertical on desktop, horizontal on mobile */}
                <div className="hidden lg:flex w-12 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex-col items-center py-2 gap-0.5">
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
                {/* Desktop: always visible sidebar. Mobile: slide-over drawer */}
                {showMobilePanel && <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setShowMobilePanel(false)} />}
                <div className={`
                    bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden
                    fixed lg:static inset-y-0 right-0 z-50 w-[85vw] sm:w-80 lg:w-72
                    transition-transform duration-300 ease-in-out
                    ${showMobilePanel ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
                `}>
                    {/* Mobile close button */}
                    <div className="lg:hidden flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-bold text-slate-700 dark:text-white">Panel</span>
                        <button onClick={() => setShowMobilePanel(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"><X size={18} /></button>
                    </div>
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
                        <div className="flex-1 flex flex-col overflow-hidden">
                            {/* Search & Filter Bar */}
                            <div className="p-3 border-b border-slate-200 dark:border-slate-700 space-y-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={templateSearch}
                                        onChange={e => setTemplateSearch(e.target.value)}
                                        placeholder="Şablon ara..."
                                        className="w-full pl-8 pr-2 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:border-cyan-500 bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                                    />
                                    <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                    {templateCategories.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setTemplateCategory(cat)}
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border ${templateCategory === cat
                                                ? 'bg-cyan-600 text-white border-cyan-600'
                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-cyan-400'
                                                }`}
                                        >
                                            {cat === 'all' ? 'Tümü' : cat}
                                        </button>
                                    ))}
                                </div>
                                <div className="text-[10px] text-slate-400">{filteredTemplates.length} şablon</div>
                            </div>

                            {/* Template Grid */}
                            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-3 content-start">
                                {filteredTemplates.map(tpl => {
                                    const preview = templatePreviews[tpl.id]
                                    const catColorMap: Record<string, string> = {
                                        'Sales': 'bg-orange-100 text-orange-700',
                                        'Events': 'bg-purple-100 text-purple-700',
                                        'F&B': 'bg-pink-100 text-pink-700',
                                        'Rooms': 'bg-blue-100 text-blue-700',
                                        'Reviews': 'bg-green-100 text-green-700',
                                    }
                                    const catColor = catColorMap[tpl.category] || 'bg-slate-100 text-slate-600'

                                    return (
                                        <button
                                            key={tpl.id}
                                            onClick={() => loadTemplate(tpl.id)}
                                            className="group relative aspect-square bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:border-cyan-500 hover:shadow-lg hover:shadow-cyan-500/10 transition-all text-left"
                                        >
                                            {/* Canvas-Rendered Preview */}
                                            {preview ? (
                                                <img
                                                    src={preview}
                                                    alt={tpl.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                                                    <Loader2 size={20} className="animate-spin text-slate-300" />
                                                </div>
                                            )}

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-end justify-center pb-12">
                                                <span className="px-4 py-1.5 bg-cyan-500 text-white text-xs font-bold rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                                                    Kullan
                                                </span>
                                            </div>

                                            {/* Bottom Info Bar */}
                                            <div className="absolute inset-x-0 bottom-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm p-2 border-t border-slate-100 dark:border-slate-700">
                                                <div className="text-[10px] font-bold text-slate-800 dark:text-white truncate">{tpl.name}</div>
                                                <span className={`inline-block mt-0.5 px-1.5 py-0 rounded text-[8px] font-bold ${catColor}`}>{tpl.category}</span>
                                            </div>
                                        </button>
                                    )
                                })}
                                {filteredTemplates.length === 0 && (
                                    <div className="col-span-2 text-center py-8 text-slate-400 text-xs">
                                        <LayoutTemplate size={24} className="mx-auto mb-2 opacity-50" />
                                        Aramanıza uygun şablon bulunamadı.
                                    </div>
                                )}
                            </div>
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
