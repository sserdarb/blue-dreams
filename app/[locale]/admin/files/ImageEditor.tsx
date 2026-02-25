'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Save, RotateCw, FlipHorizontal, FlipVertical, Crop, SunMedium, Contrast, Droplets, Sparkles, Loader2 } from 'lucide-react';
import { uploadFile } from '@/app/actions/media';

interface MediaFile {
    id: string;
    url: string;
    filename: string;
    type: string;
    createdAt: Date;
}

interface Props {
    file: MediaFile;
    onClose: () => void;
    onSaved: () => void;
}

const ASPECT_RATIOS = [
    { label: 'Free', value: null },
    { label: '1:1', value: 1 },
    { label: '16:9', value: 16 / 9 },
    { label: '4:3', value: 4 / 3 },
    { label: '3:2', value: 3 / 2 },
    { label: '9:16', value: 9 / 16 },
];

export default function ImageEditor({ file, onClose, onSaved }: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [loaded, setLoaded] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'crop' | 'adjust' | 'ai'>('adjust');

    // Adjustments
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [blur, setBlur] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [flipH, setFlipH] = useState(false);
    const [flipV, setFlipV] = useState(false);

    // Crop
    const [cropping, setCropping] = useState(false);
    const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
    const [cropStart, setCropStart] = useState<{ x: number; y: number } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);

    // AI
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<string | null>(null);

    // Load image
    useEffect(() => {
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => { imgRef.current = img; setLoaded(true); };
        img.src = file.url;
    }, [file.url]);

    // Render canvas
    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Apply filters
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;

        // Apply transforms
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

        ctx.restore();

        // Draw crop overlay
        if (cropping && cropRect.w > 0 && cropRect.h > 0) {
            const scaleX = canvas.width / canvas.offsetWidth;
            const scaleY = canvas.height / canvas.offsetHeight;
            const cx = cropRect.x * scaleX;
            const cy = cropRect.y * scaleY;
            const cw = cropRect.w * scaleX;
            const ch = cropRect.h * scaleY;

            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.clearRect(cx, cy, cw, ch);
            ctx.drawImage(img, cx, cy, cw, ch, cx, cy, cw, ch);
            ctx.strokeStyle = '#22d3ee';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 4]);
            ctx.strokeRect(cx, cy, cw, ch);
        }
    }, [brightness, contrast, saturation, blur, rotation, flipH, flipV, cropping, cropRect]);

    useEffect(() => { if (loaded) renderCanvas(); }, [loaded, renderCanvas]);

    // Crop handlers
    const handleCropMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!cropping) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setCropStart({ x, y });
        setCropRect({ x, y, w: 0, h: 0 });
    };

    const handleCropMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!cropping || !cropStart) return;
        const rect = canvasRef.current!.getBoundingClientRect();
        let w = e.clientX - rect.left - cropStart.x;
        let h = e.clientY - rect.top - cropStart.y;
        if (aspectRatio) { h = w / aspectRatio; }
        setCropRect({ x: cropStart.x, y: cropStart.y, w, h });
    };

    const handleCropMouseUp = () => { setCropStart(null); };

    const applyCrop = () => {
        const canvas = canvasRef.current; const img = imgRef.current;
        if (!canvas || !img || cropRect.w <= 0 || cropRect.h <= 0) return;
        const scaleX = canvas.width / canvas.offsetWidth;
        const scaleY = canvas.height / canvas.offsetHeight;
        const tempCanvas = document.createElement('canvas');
        const cw = Math.abs(cropRect.w * scaleX);
        const ch = Math.abs(cropRect.h * scaleY);
        tempCanvas.width = cw; tempCanvas.height = ch;
        const tctx = tempCanvas.getContext('2d')!;
        const sx = Math.min(cropRect.x, cropRect.x + cropRect.w) * scaleX;
        const sy = Math.min(cropRect.y, cropRect.y + cropRect.h) * scaleY;
        tctx.drawImage(canvas, sx, sy, cw, ch, 0, 0, cw, ch);
        const newImg = new window.Image();
        newImg.onload = () => { imgRef.current = newImg; setCropping(false); setCropRect({ x: 0, y: 0, w: 0, h: 0 }); renderCanvas(); };
        newImg.src = tempCanvas.toDataURL('image/jpeg', 0.95);
    };

    // Save
    const handleSave = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setSaving(true);
        try {
            const finalCanvas = document.createElement('canvas');
            const img = imgRef.current!;
            finalCanvas.width = img.naturalWidth || img.width;
            finalCanvas.height = img.naturalHeight || img.height;
            const ctx = finalCanvas.getContext('2d')!;
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
            ctx.translate(finalCanvas.width / 2, finalCanvas.height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
            ctx.drawImage(img, -img.width / 2, -img.height / 2);

            const blob = await new Promise<Blob>((resolve) => finalCanvas.toBlob(b => resolve(b!), 'image/jpeg', 0.92));
            const ext = file.filename.split('.').pop() || 'jpg';
            const baseName = file.filename.replace(/\.[^/.]+$/, '');
            const formData = new FormData();
            formData.append('file', blob, `${baseName}-edited.${ext}`);
            const result = await uploadFile(formData);
            if (result.success) { onSaved(); } else { alert('Save failed: ' + result.error); }
        } catch (err) { alert('Save failed'); }
        setSaving(false);
    };

    // AI Edit
    const handleAiEdit = async () => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true); setAiResult(null);
        try {
            const res = await fetch('/api/admin/ai-interpret', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: `Image editing request for ${file.url}: ${aiPrompt}. Provide specific CSS filter values or editing instructions.` }),
            });
            const data = await res.json();
            setAiResult(data.result || data.analysis || 'No suggestion available');
        } catch { setAiResult('AI edit failed.'); }
        setAiLoading(false);
    };

    const resetAll = () => { setBrightness(100); setContrast(100); setSaturation(100); setBlur(0); setRotation(0); setFlipH(false); setFlipV(false); };

    const Slider = ({ label, icon: Icon, value, onChange, min, max, unit }: any) => (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5"><Icon size={13} />{label}</span>
                <span className="text-xs font-mono text-slate-500">{value}{unit}</span>
            </div>
            <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500" />
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 flex">
            {/* Canvas Area */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                {!loaded ? (
                    <Loader2 className="animate-spin text-white" size={32} />
                ) : (
                    <canvas
                        ref={canvasRef}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                        style={{ cursor: cropping ? 'crosshair' : 'default' }}
                        onMouseDown={handleCropMouseDown}
                        onMouseMove={handleCropMouseMove}
                        onMouseUp={handleCropMouseUp}
                    />
                )}
            </div>

            {/* Sidebar */}
            <div className="w-80 bg-white dark:bg-slate-800 border-l dark:border-slate-700 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Image Editor</h3>
                    <div className="flex items-center gap-2">
                        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg disabled:opacity-50">
                            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Copy
                        </button>
                        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={18} /></button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b dark:border-slate-700">
                    {(['adjust', 'crop', 'ai'] as const).map(tab => (
                        <button key={tab} onClick={() => { setActiveTab(tab); if (tab === 'crop') setCropping(true); else setCropping(false); }}
                            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider transition-colors ${activeTab === tab ? 'text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-500' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                            {tab === 'adjust' ? '🎨 Adjust' : tab === 'crop' ? '✂️ Crop' : '✨ AI'}
                        </button>
                    ))}
                </div>

                {/* Panel Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    {activeTab === 'adjust' && (
                        <>
                            <Slider label="Brightness" icon={SunMedium} value={brightness} onChange={setBrightness} min={0} max={200} unit="%" />
                            <Slider label="Contrast" icon={Contrast} value={contrast} onChange={setContrast} min={0} max={200} unit="%" />
                            <Slider label="Saturation" icon={Droplets} value={saturation} onChange={setSaturation} min={0} max={200} unit="%" />
                            <Slider label="Blur" icon={Droplets} value={blur} onChange={setBlur} min={0} max={20} unit="px" />
                            <div className="h-px bg-slate-200 dark:bg-slate-700" />
                            <div className="grid grid-cols-3 gap-2">
                                <button onClick={() => setRotation(r => r + 90)} className="flex flex-col items-center gap-1 p-2 bg-slate-50 dark:bg-slate-900 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-xs text-slate-600 dark:text-slate-400"><RotateCw size={16} />Rotate</button>
                                <button onClick={() => setFlipH(f => !f)} className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs ${flipH ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}><FlipHorizontal size={16} />Flip H</button>
                                <button onClick={() => setFlipV(f => !f)} className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs ${flipV ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}><FlipVertical size={16} />Flip V</button>
                            </div>
                            <button onClick={resetAll} className="w-full py-2 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg font-medium">Reset All</button>
                        </>
                    )}

                    {activeTab === 'crop' && (
                        <>
                            <p className="text-xs text-slate-500">Click and drag on the image to select a crop area.</p>
                            <div className="grid grid-cols-3 gap-2">
                                {ASPECT_RATIOS.map(ar => (
                                    <button key={ar.label} onClick={() => setAspectRatio(ar.value)}
                                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${aspectRatio === ar.value ? 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 ring-1 ring-cyan-500' : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100'}`}>
                                        {ar.label}
                                    </button>
                                ))}
                            </div>
                            {cropRect.w > 0 && cropRect.h > 0 && (
                                <button onClick={applyCrop} className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2">
                                    <Crop size={16} /> Apply Crop
                                </button>
                            )}
                        </>
                    )}

                    {activeTab === 'ai' && (
                        <>
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-indigo-200 dark:border-indigo-800">
                                <div className="flex items-center gap-2 mb-2"><Sparkles size={16} className="text-indigo-500" /><span className="text-sm font-bold text-slate-800 dark:text-white">AI Image Assistant</span></div>
                                <p className="text-xs text-slate-500 mb-3">Describe what you&apos;d like to change or get suggestions for improving this image.</p>
                                <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g., Make this image warmer, remove background, enhance colors..." rows={3}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg text-sm dark:text-white resize-none focus:ring-2 focus:ring-indigo-500" />
                                <button onClick={handleAiEdit} disabled={aiLoading || !aiPrompt.trim()} className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
                                    {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />} {aiLoading ? 'Processing...' : 'Get AI Suggestion'}
                                </button>
                            </div>
                            {aiResult && (
                                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 border dark:border-slate-700">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{aiResult}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
