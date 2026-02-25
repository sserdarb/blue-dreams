'use client';

import { useEffect, useRef } from 'react';
import { Eye, Copy, Download, Pencil, Type, Sparkles, Trash2, Scissors } from 'lucide-react';

interface Props {
    x: number;
    y: number;
    isImage: boolean;
    onClose: () => void;
    onPreview: () => void;
    onCopyUrl: () => void;
    onDownload: () => void;
    onRename: () => void;
    onCropFilter: () => void;
    onAiDescribe: () => void;
    onAiEdit: () => void;
    onDelete: () => void;
}

export default function ContextMenu({ x, y, isImage, onClose, onPreview, onCopyUrl, onDownload, onRename, onCropFilter, onAiDescribe, onAiEdit, onDelete }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
    }, [onClose]);

    // Adjust position to stay within viewport
    const style: React.CSSProperties = {
        position: 'fixed',
        left: Math.min(x, window.innerWidth - 220),
        top: Math.min(y, window.innerHeight - 350),
        zIndex: 200,
    };

    const Item = ({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) => (
        <button
            onClick={() => { onClick(); onClose(); }}
            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${danger
                ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
        >
            <Icon size={15} />
            {label}
        </button>
    );

    return (
        <div ref={ref} style={style} className="w-52 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border dark:border-slate-700 py-1.5 px-1.5 animate-in fade-in zoom-in-95 duration-150">
            {isImage && <Item icon={Eye} label="Preview" onClick={onPreview} />}
            <Item icon={Copy} label="Copy URL" onClick={onCopyUrl} />
            <Item icon={Download} label="Download" onClick={onDownload} />
            <Item icon={Type} label="Rename" onClick={onRename} />
            {isImage && (
                <>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
                    <Item icon={Scissors} label="Crop & Filter" onClick={onCropFilter} />
                    <Item icon={Sparkles} label="AI Describe" onClick={onAiDescribe} />
                    <Item icon={Sparkles} label="AI Edit" onClick={onAiEdit} />
                </>
            )}
            <div className="h-px bg-slate-200 dark:bg-slate-700 my-1 mx-2" />
            <Item icon={Trash2} label="Delete" onClick={onDelete} danger />
        </div>
    );
}
