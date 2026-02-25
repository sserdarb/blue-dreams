'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Copy, RotateCw, Maximize2 } from 'lucide-react';

interface MediaFile {
    id: string;
    url: string;
    filename: string;
    type: string;
    createdAt: Date;
}

interface Props {
    file: MediaFile;
    files: MediaFile[];
    onClose: () => void;
    onNavigate: (file: MediaFile) => void;
}

export default function ImagePreviewModal({ file, files, onClose, onNavigate }: Props) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const currentIndex = imageFiles.findIndex(f => f.id === file.id);

    const goPrev = useCallback(() => {
        if (currentIndex > 0) {
            setZoom(1); setRotation(0); setPosition({ x: 0, y: 0 });
            onNavigate(imageFiles[currentIndex - 1]);
        }
    }, [currentIndex, imageFiles, onNavigate]);

    const goNext = useCallback(() => {
        if (currentIndex < imageFiles.length - 1) {
            setZoom(1); setRotation(0); setPosition({ x: 0, y: 0 });
            onNavigate(imageFiles[currentIndex + 1]);
        }
    }, [currentIndex, imageFiles, onNavigate]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goPrev();
            if (e.key === 'ArrowRight') goNext();
            if (e.key === '+' || e.key === '=') setZoom(z => Math.min(z + 0.25, 5));
            if (e.key === '-') setZoom(z => Math.max(z - 0.25, 0.25));
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [onClose, goPrev, goNext]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        setZoom(z => Math.max(0.25, Math.min(5, z + (e.deltaY > 0 ? -0.15 : 0.15))));
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) { setDragging(true); setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y }); }
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (dragging) setPosition({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    };
    const handleMouseUp = () => setDragging(false);

    const copyUrl = () => {
        navigator.clipboard.writeText(window.location.origin + file.url);
    };

    const downloadFile = () => {
        const a = document.createElement('a');
        a.href = file.url; a.download = file.filename; a.click();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col" onClick={(e) => e.target === e.currentTarget && onClose()}>
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-black/50 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-4">
                    <p className="text-white text-sm font-medium truncate max-w-xs">{file.filename}</p>
                    <span className="text-white/40 text-xs">{currentIndex + 1} / {imageFiles.length}</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setZoom(z => Math.min(z + 0.25, 5))} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Zoom In"><ZoomIn size={18} /></button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.25, 0.25))} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Zoom Out"><ZoomOut size={18} /></button>
                    <button onClick={() => { setZoom(1); setPosition({ x: 0, y: 0 }); }} className="px-2 py-1 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors text-xs font-mono">{Math.round(zoom * 100)}%</button>
                    <button onClick={() => setRotation(r => r + 90)} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Rotate"><RotateCw size={18} /></button>
                    <div className="w-px h-6 bg-white/20 mx-1" />
                    <button onClick={copyUrl} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Copy URL"><Copy size={18} /></button>
                    <button onClick={downloadFile} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Download"><Download size={18} /></button>
                    <div className="w-px h-6 bg-white/20 mx-1" />
                    <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Close"><X size={20} /></button>
                </div>
            </div>

            {/* Image Area */}
            <div
                className="flex-1 flex items-center justify-center relative overflow-hidden select-none"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                style={{ cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default' }}
            >
                {currentIndex > 0 && (
                    <button onClick={goPrev} className="absolute left-4 z-10 p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm">
                        <ChevronLeft size={24} />
                    </button>
                )}

                <div
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                        transition: dragging ? 'none' : 'transform 0.2s ease',
                    }}
                >
                    <Image
                        src={file.url}
                        alt={file.filename}
                        width={1200}
                        height={800}
                        className="max-h-[80vh] w-auto object-contain pointer-events-none"
                        unoptimized
                        priority
                    />
                </div>

                {currentIndex < imageFiles.length - 1 && (
                    <button onClick={goNext} className="absolute right-4 z-10 p-3 bg-black/40 hover:bg-black/70 text-white rounded-full transition-all backdrop-blur-sm">
                        <ChevronRight size={24} />
                    </button>
                )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex items-center justify-center gap-2 px-6 py-3 bg-black/50 backdrop-blur-sm border-t border-white/10 overflow-x-auto">
                {imageFiles.map((f, i) => (
                    <button
                        key={f.id}
                        onClick={() => { setZoom(1); setRotation(0); setPosition({ x: 0, y: 0 }); onNavigate(f); }}
                        className={`w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${f.id === file.id ? 'border-cyan-500 opacity-100 scale-110' : 'border-transparent opacity-50 hover:opacity-80'}`}
                    >
                        <Image src={f.url} alt="" width={48} height={48} className="w-full h-full object-cover" unoptimized />
                    </button>
                ))}
            </div>
        </div>
    );
}
