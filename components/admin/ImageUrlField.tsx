'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import {
    Upload, Image as ImageIcon, FolderOpen, X, FileText,
    Link as LinkIcon, Loader2, Check, Eye, Trash2
} from 'lucide-react'

interface UploadedFile {
    name: string
    url: string
    size: number
    type: 'image' | 'pdf' | 'other'
    modifiedAt: string
}

interface ImageUrlFieldProps {
    value: string
    onChange: (url: string) => void
    label?: string
    placeholder?: string
    accept?: string  // file input accept attribute
    className?: string
    id?: string
}

export default function ImageUrlField({
    value,
    onChange,
    label = 'Görsel URL',
    placeholder = 'URL giriniz veya dosya yükleyiniz...',
    accept = 'image/*,.pdf',
    className = '',
    id
}: ImageUrlFieldProps) {
    const [mode, setMode] = useState<'url' | 'upload' | 'browse'>('url')
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [showPreview, setShowPreview] = useState(false)
    const [files, setFiles] = useState<UploadedFile[]>([])
    const [loadingFiles, setLoadingFiles] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const isPdf = value?.toLowerCase().endsWith('.pdf')
    const isImage = value && !isPdf && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(value)
    const hasValue = !!value?.trim()

    // Upload file
    const handleUpload = useCallback(async (file: File) => {
        setUploading(true)
        setUploadError(null)
        try {
            const formData = new FormData()
            formData.append('file', file)
            const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (res.ok && data.url) {
                onChange(data.url)
                setMode('url')
            } else {
                setUploadError(data.error || 'Yükleme hatası')
            }
        } catch {
            setUploadError('Bağlantı hatası')
        } finally {
            setUploading(false)
        }
    }, [onChange])

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
    }

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file) handleUpload(file)
    }, [handleUpload])

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    // Load file manager
    const loadFiles = useCallback(async () => {
        setLoadingFiles(true)
        try {
            const res = await fetch('/api/admin/upload?filter=all')
            const data = await res.json()
            setFiles(data.files || [])
        } catch {
            setFiles([])
        } finally {
            setLoadingFiles(false)
        }
    }, [])

    useEffect(() => {
        if (mode === 'browse') loadFiles()
    }, [mode, loadFiles])

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Label */}
            {label && (
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase" htmlFor={id}>
                    {label}
                </label>
            )}

            {/* Mode Tabs */}
            <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                {[
                    { key: 'url' as const, icon: LinkIcon, text: 'URL' },
                    { key: 'upload' as const, icon: Upload, text: 'Yükle' },
                    { key: 'browse' as const, icon: FolderOpen, text: 'Dosya Yöneticisi' },
                ].map(({ key, icon: Icon, text }) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setMode(key)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all ${
                            mode === key
                                ? 'bg-cyan-600 text-white shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Icon size={14} />
                        {text}
                    </button>
                ))}
            </div>

            {/* URL Input Mode */}
            {mode === 'url' && (
                <div className="relative">
                    <input
                        id={id}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-full px-3 py-2 pr-20 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    />
                    <div className="absolute right-1 top-1 flex gap-1">
                        {hasValue && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="p-1.5 text-slate-400 hover:text-cyan-600 transition-colors rounded"
                                    title="Önizle"
                                >
                                    <Eye size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onChange('')}
                                    className="p-1.5 text-slate-400 hover:text-red-500 transition-colors rounded"
                                    title="Temizle"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Upload Mode */}
            {mode === 'upload' && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-500 dark:hover:border-cyan-500 transition-colors bg-white dark:bg-slate-800"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    {uploading ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 size={24} className="animate-spin text-cyan-600" />
                            <p className="text-sm text-slate-500">Yükleniyor...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Upload size={24} className="text-slate-400" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                Dosya sürükleyip bırakın veya tıklayın
                            </p>
                            <p className="text-xs text-slate-400">
                                JPG, PNG, GIF, WebP, SVG, PDF — Maks 10MB
                            </p>
                        </div>
                    )}
                    {uploadError && (
                        <p className="mt-2 text-xs text-red-500 font-medium">{uploadError}</p>
                    )}
                </div>
            )}

            {/* File Browser Mode */}
            {mode === 'browse' && (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 overflow-hidden">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Sunucudaki Dosyalar ({files.length})
                        </span>
                        <button
                            type="button"
                            onClick={loadFiles}
                            className="text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                            Yenile
                        </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                        {loadingFiles ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 size={20} className="animate-spin text-cyan-600" />
                            </div>
                        ) : files.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-400">
                                Henüz yüklenmiş dosya yok
                            </div>
                        ) : (
                            files.map((file) => (
                                <button
                                    key={file.name}
                                    type="button"
                                    onClick={() => {
                                        onChange(file.url)
                                        setMode('url')
                                    }}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                                        value === file.url ? 'bg-cyan-50 dark:bg-cyan-900/20' : ''
                                    }`}
                                >
                                    {/* Thumbnail */}
                                    <div className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        {file.type === 'image' ? (
                                            <img
                                                src={file.url}
                                                alt={file.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FileText size={16} className="text-red-500" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {formatSize(file.size)} · {file.type === 'pdf' ? 'PDF' : 'Görsel'}
                                        </p>
                                    </div>
                                    {value === file.url && (
                                        <Check size={16} className="text-cyan-600 shrink-0" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Preview */}
            {hasValue && (showPreview || mode === 'url') && (
                <div className="mt-2">
                    {isPdf ? (
                        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border-b border-slate-200 dark:border-slate-700">
                                <FileText size={16} className="text-red-500" />
                                <span className="text-xs font-semibold text-red-600 dark:text-red-400">PDF Dosyası</span>
                                <a
                                    href={value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ml-auto text-xs text-cyan-600 hover:text-cyan-700 font-medium"
                                >
                                    Yeni Sekmede Aç ↗
                                </a>
                            </div>
                            <iframe
                                src={value}
                                title="PDF Preview"
                                className="w-full h-[300px] bg-white"
                            />
                        </div>
                    ) : isImage ? (
                        <div className="relative group">
                            <img
                                src={value}
                                alt="Preview"
                                className="w-full max-h-48 object-contain rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none'
                                }}
                            />
                        </div>
                    ) : hasValue ? (
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                            <LinkIcon size={14} className="text-slate-400" />
                            <a
                                href={value}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan-600 hover:text-cyan-700 truncate"
                            >
                                {value}
                            </a>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    )
}
