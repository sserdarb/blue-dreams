'use client';

import { useState, useRef } from 'react';
import { uploadFile, deleteFile } from '@/app/actions/media';
import Image from 'next/image';
Trash2, Copy, Upload, Folder, Image as ImageIcon,
  Search, Grid, List, Download, HardDrive, Globe,
  Sparkles, MoreVertical, X, Server,
  FileText, Film, Music, Box, File
} from 'lucide-react';

interface MediaFile {
  id: string;
  url: string;
  filename: string;
  type: string;
  createdAt: Date;
}

export default function FileManager({ initialFiles }: { initialFiles: MediaFile[] }) {
  const [files, setFiles] = useState<MediaFile[]>(initialFiles);
  const [activeTab, setActiveTab] = useState<'local' | 'ftp' | 'pexels' | 'ai'>('local');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pexelsQuery, setPexelsQuery] = useState('luxury hotel');
  const [pexelsResults, setPexelsResults] = useState<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  // --- Local File Handlers ---

  async function handleUpload(formData: FormData) {
    setUploading(true);
    const result = await uploadFile(formData);
    setUploading(false);

    if (result.success) {
      formRef.current?.reset();
      window.location.reload();
    } else {
      alert('Upload failed: ' + result.error);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    const result = await deleteFile(id);
    if (result.success) {
      setFiles(files.filter(f => f.id !== id));
    } else {
      alert('Delete failed');
    }
  }

  function copyToClipboard(url: string) {
    const fullUrl = window.location.origin + url;
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert('URL copied: ' + fullUrl);
    });
  }

  // --- Search Logic ---

  const filteredFiles = files.filter(f =>
    f.filename.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Pexels Mock Logic ---
  const handlePexelsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate fetching from Pexels (using Picsum for demo as we lack API key)
    const mockImages = Array.from({ length: 12 }).map((_, i) => ({
      id: `pexels-${i}`,
      src: `https://picsum.photos/seed/${pexelsQuery}${i}/400/300`,
      alt: `${pexelsQuery} ${i + 1}`,
      photographer: 'Stock Photographer'
    }));
    setPexelsResults(mockImages);
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 rounded-xl overflow-hidden shadow-xl">

      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-slate-800 border-r dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b dark:border-slate-700">
          <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Folder className="text-cyan-500" />
            Media Library
          </h2>
        </div>

        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          <button
            onClick={() => setActiveTab('local')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'local'
              ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
          >
            <HardDrive size={18} />
            Local Storage
            <span className="ml-auto text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
              {files.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ftp')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ftp'
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }`}
          >
            <Server size={18} />
            FTP / SFTP
          </button>

          <div className="pt-4 mt-4 border-t dark:border-slate-700">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Integrations</p>
            <button
              onClick={() => setActiveTab('pexels')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pexels'
                ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
            >
              <Globe size={18} />
              Stock Photos (Pexels)
            </button>
            <button
              onClick={() => setActiveTab('ai')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ai'
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
            >
              <Sparkles size={18} />
              AI Generation
            </button>
          </div>
        </nav>

        {/* Local Storage Stats */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t dark:border-slate-700">
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>Storage</span>
            <span>45% used</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-500 w-[45%]"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-900/50">

        {/* Toolbar */}
        <div className="h-16 border-b dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4 flex-1">
            {activeTab === 'local' && (
              <>
                <form ref={formRef} action={handleUpload} className="flex gap-2">
                  <label className="cursor-pointer bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Upload size={16} />
                    {uploading ? 'Uploading...' : 'Upload File'}
                    <input type="file" name="file" className="hidden" onChange={(e) => e.target.form?.requestSubmit()} disabled={uploading} />
                  </label>
                </form>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
              </>
            )}

            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                placeholder={activeTab === 'pexels' ? "Search stock photos..." : "Search files..."}
                value={activeTab === 'pexels' ? pexelsQuery : searchQuery}
                onChange={(e) => activeTab === 'pexels' ? setPexelsQuery(e.target.value) : setSearchQuery(e.target.value)}
                onKeyDown={(e) => activeTab === 'pexels' && e.key === 'Enter' && handlePexelsSearch(e)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 border-l dark:border-slate-700 pl-4 ml-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-cyan-600 dark:text-cyan-400' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* View Area */}
        <div className="flex-1 overflow-y-auto p-6">

          {activeTab === 'local' && (
            <>
              {filteredFiles.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={48} className="mb-4 opacity-50" />
                  <p>No files found</p>
                  <p className="text-sm mt-2">Upload a file to get started</p>
                </div>
              ) : (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4">
                    {filteredFiles.map((file) => (
                      <div key={file.id} className="group relative bg-white dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border dark:border-slate-700">
                        <div className="aspect-square relative bg-slate-100 dark:bg-slate-900">
                          {file.type.startsWith('image/') ? (
                            <Image
                              src={file.url}
                              alt={file.filename}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-slate-400">
                              <div className="text-center">
                                <FileIcon type={file.type} />
                                <p className="text-xs mt-2 uppercase">{file.filename.split('.').pop()}</p>
                              </div>
                            </div>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                            <button
                              onClick={() => copyToClipboard(file.url)}
                              className="p-2 bg-white/20 hover:bg-white text-white hover:text-cyan-600 rounded-full transition-all"
                              title="Copy URL"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="p-2 bg-white/20 hover:bg-white text-white hover:text-red-600 rounded-full transition-all"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="p-3">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate" title={file.filename}>
                            {file.filename}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border dark:border-slate-700 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 border-b dark:border-slate-700">
                        <tr>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">File</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y dark:divide-slate-700">
                        {filteredFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 relative overflow-hidden flex-shrink-0">
                                {file.type.startsWith('image/') ? (
                                  <Image src={file.url} alt="" fill className="object-cover" unoptimized />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-slate-400">
                                    <FileIcon type={file.type} size={20} />
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-xs">{file.filename}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{file.type}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{new Date(file.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => copyToClipboard(file.url)} className="p-2 text-slate-400 hover:text-cyan-600 transition-colors">
                                  <Copy size={16} />
                                </button>
                                <button onClick={() => handleDelete(file.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </>
          )}

          {activeTab === 'ftp' && (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Server size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">Connect to FTP/SFTP</h3>
                <p className="text-slate-500">Access external file servers directly from your media library.</p>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border dark:border-slate-700 text-left space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Host</label>
                    <input type="text" placeholder="ftp.example.com" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Username</label>
                      <input type="text" placeholder="user" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Password</label>
                      <input type="password" placeholder="••••••" className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border dark:border-slate-700 rounded-lg text-sm" />
                    </div>
                  </div>
                  <button className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors">
                    Connect
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pexels' && (
            <div className="space-y-6">
              {pexelsResults.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Globe size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white">Search Stock Photos</h3>
                  <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    Search for high-quality royalty-free images from Pexels and add them to your library instantly.
                  </p>
                  <button onClick={handlePexelsSearch} className="mt-6 px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-500">
                    Browsing Popular: "Luxury Hotel"
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {pexelsResults.map((img) => (
                    <div key={img.id} className="group relative bg-slate-200 dark:bg-slate-800 aspect-[4/3] rounded-xl overflow-hidden cursor-pointer" onClick={() => alert('Import feature coming soon')}>
                      <Image src={img.src} alt={img.alt} fill className="object-cover" unoptimized />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white flex flex-col items-center gap-2">
                          <Download size={24} />
                          <span className="text-xs font-bold">Import Image</span>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent text-white text-xs truncate">
                        by {img.photographer}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="h-full flex items-center justify-center text-center">
              <div className="max-w-md">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Sparkles size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white">AI Image Generation</h3>
                <p className="text-slate-500 mt-2">
                  Create unique images for your hotel using advanced AI models (DALL-E 3 / Midjourney).
                </p>
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/50 rounded-lg text-sm text-yellow-800 dark:text-yellow-200">
                  Coming Soon in Version 2.4
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function FileIcon({ type, size = 24 }: { type: string, size?: number }) {
  if (type.startsWith('video/')) return <Film size={size} className="text-purple-500" />;
  if (type.startsWith('audio/')) return <Music size={size} className="text-pink-500" />;
  if (type.includes('pdf')) return <FileText size={size} className="text-red-500" />;
  if (type.includes('spreadsheet') || type.includes('excel')) return <FileText size={size} className="text-green-500" />;
  if (type.includes('word') || type.includes('document')) return <FileText size={size} className="text-blue-500" />;
  if (type.includes('zip') || type.includes('compressed')) return <Box size={size} className="text-orange-500" />;
  return <File size={size} className="text-slate-400" />;
}
