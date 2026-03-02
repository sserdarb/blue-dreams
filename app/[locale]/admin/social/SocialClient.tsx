'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Loader2, Plus, Check, X, Calendar as CalendarIcon, MessageSquare, PenTool, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getFiles } from '@/app/actions/media'

type Topic = {
    id: string
    topic: string
    description: string
    source: string
    status: string
    rejectionRsn: string | null
    postDraftId: string | null
    createdAt: string
}

type Post = {
    id: string
    topicId: string | null
    content: string
    mediaUrls: string
    platforms: string
    status: string
    scheduledFor: string | null
    createdAt: string
}

type MediaFile = {
    id: string
    url: string
    filename: string
    type?: string
}

export default function SocialClient() {
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'ideation' | 'drafts' | 'calendar'>('ideation')

    const [topics, setTopics] = useState<Topic[]>([])
    const [posts, setPosts] = useState<Post[]>([])

    // Media manager state
    const [pickerOpen, setPickerOpen] = useState<string | null>(null) // null or post.id
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
    const [loadingMedia, setLoadingMedia] = useState(false)

    const [loadingTopics, setLoadingTopics] = useState(false)
    const [loadingPosts, setLoadingPosts] = useState(false)
    const [generatingIdeas, setGeneratingIdeas] = useState(false)
    const [generatingDraft, setGeneratingDraft] = useState<string | null>(null) // topic ID

    useEffect(() => {
        if (activeTab === 'ideation') fetchTopics()
        if (activeTab === 'drafts' || activeTab === 'calendar') fetchPosts()
    }, [activeTab])

    const fetchTopics = async () => {
        setLoadingTopics(true)
        try {
            const res = await fetch('/api/admin/social/topics')
            if (res.ok) setTopics(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingTopics(false)
        }
    }

    const fetchPosts = async () => {
        setLoadingPosts(true)
        try {
            const res = await fetch('/api/admin/social/posts')
            if (res.ok) setPosts(await res.json())
        } catch (e) {
            console.error(e)
        } finally {
            setLoadingPosts(false)
        }
    }

    const generateIdeas = async () => {
        setGeneratingIdeas(true)
        try {
            const res = await fetch('/api/admin/social/topics', { method: 'POST' })
            if (res.ok) await fetchTopics()
        } catch (e) {
            console.error(e)
        } finally {
            setGeneratingIdeas(false)
        }
    }

    const updateTopicStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/social/topics/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            })
            if (res.ok) {
                setTopics(topics.map(t => t.id === id ? { ...t, status } : t))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const generateDraft = async (topic: Topic) => {
        setGeneratingDraft(topic.id)
        try {
            const res = await fetch('/api/admin/social/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topicId: topic.id,
                    topic: topic.topic,
                    description: topic.description
                })
            })

            if (res.ok) {
                const post = await res.json()
                setTopics(topics.map(t => t.id === topic.id ? { ...t, postDraftId: post.id } : t))
                setActiveTab('drafts')
            }
        } catch (e) {
            console.error(e)
        } finally {
            setGeneratingDraft(null)
        }
    }

    // --- Media Fetching and Updating ---
    const openMediaPicker = async (postId: string) => {
        setPickerOpen(postId)
        if (mediaFiles.length === 0) {
            setLoadingMedia(true)
            try {
                const files = await getFiles()
                setMediaFiles(files as any)
            } catch (err) {
                console.error("Failed to load media files:", err)
            } finally {
                setLoadingMedia(false)
            }
        }
    }

    const handleMediaSelect = async (url: string) => {
        if (!pickerOpen) return
        const postId = pickerOpen
        setPickerOpen(null)

        // Save to DB
        const urlsString = JSON.stringify([url])
        try {
            const res = await fetch(`/api/admin/social/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaUrls: urlsString })
            })
            if (res.ok) {
                setPosts(posts.map(p => p.id === postId ? { ...p, mediaUrls: urlsString } : p))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const updatePostMedia = async (postId: string, urls: string[]) => {
        const urlsString = JSON.stringify(urls)
        try {
            const res = await fetch(`/api/admin/social/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mediaUrls: urlsString })
            })
            if (res.ok) {
                setPosts(posts.map(p => p.id === postId ? { ...p, mediaUrls: urlsString } : p))
            }
        } catch (e) {
            console.error(e)
        }
    }

    const updatePostContent = async (postId: string, content: string) => {
        try {
            await fetch(`/api/admin/social/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })
        } catch (e) {
            console.error(e)
        }
    }

    const updatePostSchedule = async (postId: string, dateStr: string) => {
        try {
            const res = await fetch(`/api/admin/social/posts/${postId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scheduledFor: dateStr ? new Date(dateStr).toISOString() : null, status: dateStr ? 'scheduled' : 'draft' })
            })
            if (res.ok) {
                setPosts(posts.map(p => p.id === postId ? { ...p, scheduledFor: dateStr, status: dateStr ? 'scheduled' : 'draft' } : p))
            }
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className="space-y-6">
            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-max overflow-x-auto">
                <button
                    onClick={() => setActiveTab('ideation')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'ideation' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                    <MessageSquare size={16} />
                    Fikirler & Konular
                </button>
                <button
                    onClick={() => setActiveTab('drafts')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'drafts' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                    <PenTool size={16} />
                    İçerik Taslakları
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${activeTab === 'calendar' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'}`}
                >
                    <CalendarIcon size={16} />
                    Takvim & Yayın
                </button>
            </div>

            {/* IDEATION TAB */}
            {activeTab === 'ideation' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div>
                            <h3 className="font-semibold text-slate-800 dark:text-white">Yeni Fikirler Üret</h3>
                            <p className="text-sm text-slate-500">Yapay zeka asistanı sizin için trend konulardan 3 yeni paylaşım fikri önersin.</p>
                        </div>
                        <button
                            onClick={generateIdeas}
                            disabled={generatingIdeas}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                        >
                            {generatingIdeas ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {generatingIdeas ? 'Üretiliyor...' : 'Fikir Üret'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {loadingTopics ? (
                            <div className="col-span-full py-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : topics.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-slate-500">Henüz hiç fikir üretilmemiş. Fikir Üret butonuna tıklayın.</div>
                        ) : (
                            topics.map(topic => (
                                <Card key={topic.id} className="p-5 flex flex-col justify-between bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                    <div>
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge variant={topic.status === 'approved' ? 'default' : topic.status === 'rejected' ? 'destructive' : 'outline'} className={topic.status === 'approved' ? 'bg-green-100 text-green-800' : ''}>
                                                {topic.status === 'approved' ? 'Onaylandı' : topic.status === 'rejected' ? 'Reddedildi' : 'Bekliyor'}
                                            </Badge>
                                            <span className="text-xs text-slate-400">{new Date(topic.createdAt).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                        <h3 className="font-semibold text-slate-800 dark:text-white text-lg mb-2">{topic.topic}</h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">{topic.description}</p>
                                    </div>

                                    {topic.status === 'pending' && (
                                        <div className="flex gap-2 mt-4">
                                            <button onClick={() => updateTopicStatus(topic.id, 'approved')} className="flex-1 flex justify-center items-center gap-1 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-md text-sm font-medium transition-colors">
                                                <Check size={16} /> Onayla
                                            </button>
                                            <button onClick={() => updateTopicStatus(topic.id, 'rejected')} className="flex-1 flex justify-center items-center gap-1 py-2 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-sm font-medium transition-colors">
                                                <X size={16} /> Reddet
                                            </button>
                                        </div>
                                    )}

                                    {topic.status === 'approved' && !topic.postDraftId && (
                                        <button
                                            onClick={() => generateDraft(topic)}
                                            disabled={generatingDraft === topic.id}
                                            className="w-full flex justify-center items-center gap-2 py-2 mt-4 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                                        >
                                            {generatingDraft === topic.id ? <Loader2 size={16} className="animate-spin" /> : <PenTool size={16} />}
                                            İçerik Taslağı Üret
                                        </button>
                                    )}

                                    {topic.postDraftId && (
                                        <button onClick={() => setActiveTab('drafts')} className="w-full flex justify-center items-center gap-2 py-2 mt-4 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md text-sm font-medium transition-colors">
                                            Taslağa Git
                                        </button>
                                    )}
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* DRAFTS TAB */}
            {activeTab === 'drafts' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        {loadingPosts ? (
                            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                        ) : posts.length === 0 ? (
                            <div className="py-12 text-center text-slate-500">Henüz taslak yok. Fikirler sekmesinden onaylanmış bir konuya taslak ürettirin.</div>
                        ) : (
                            posts.map(post => {
                                let parsedUrls: string[] = []
                                try { parsedUrls = JSON.parse(post.mediaUrls) } catch (e) { }

                                return (
                                    <Card key={post.id} className="p-5 flex flex-col md:flex-row gap-6 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                        {/* Image Area */}
                                        <div className="w-full md:w-64 flex flex-col gap-2">
                                            {parsedUrls.length > 0 ? (
                                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                                    {(parsedUrls[0].toLowerCase().endsWith('.mp4') || parsedUrls[0].toLowerCase().endsWith('.mov')) ? (
                                                        <video src={parsedUrls[0]} className="w-full h-full object-cover" controls />
                                                    ) : (
                                                        <img src={parsedUrls[0]} alt="Media" className="w-full h-full object-cover" />
                                                    )}
                                                    <button
                                                        onClick={() => updatePostMedia(post.id, [])}
                                                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md z-10"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => openMediaPicker(post.id)}
                                                    className="w-full h-48 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-colors border border-dashed border-slate-300 dark:border-slate-600 cursor-pointer"
                                                >
                                                    <ImageIcon size={32} className="mb-2" />
                                                    <span className="text-sm font-medium">Görsel/Video Seç</span>
                                                </button>
                                            )}
                                        </div>

                                        <div className="flex-1 max-w-2xl">
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge className={post.status === 'scheduled' ? 'bg-blue-500 text-white' : post.status === 'published' ? 'bg-green-500 text-white' : ''}>
                                                    {post.status === 'draft' ? 'Taslak' : post.status === 'scheduled' ? 'Zamanlandı' : post.status === 'published' ? 'Yayınlandı' : 'Hata'}
                                                </Badge>
                                                <span className="text-xs text-slate-400">ID: {post.id.split('-')[0]}</span>
                                            </div>
                                            <textarea
                                                className="w-full h-32 p-3 text-sm mt-2 border border-slate-200 dark:border-slate-700 rounded-md bg-transparent text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                                defaultValue={post.content}
                                                onBlur={(e) => updatePostContent(post.id, e.target.value)}
                                            />

                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 gap-4">
                                                <div className="flex gap-2 items-center">
                                                    <span className="text-xs font-semibold text-slate-500 uppercase">Platformlar: </span>
                                                    <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Facebook</Badge>
                                                    <Badge variant="outline" className="text-pink-600 border-pink-200 bg-pink-50">Instagram</Badge>
                                                </div>

                                                {post.status !== 'published' && (
                                                    <div className="flex gap-2 items-center flex-wrap">
                                                        <label className="text-xs font-medium text-slate-500">Zamanla:</label>
                                                        <input
                                                            type="datetime-local"
                                                            className="text-sm border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                            defaultValue={post.scheduledFor ? new Date(new Date(post.scheduledFor).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''}
                                                            onChange={(e) => updatePostSchedule(post.id, e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                )
                            })
                        )}
                    </div>
                </div>
            )}

            {/* MEDIA PICKER MODAL */}
            {pickerOpen && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[85vh] h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-slate-800 dark:text-white"><ImageIcon size={20} /> Kütüphaneden Görsel Seç</h3>
                            <button onClick={() => setPickerOpen(null)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-900/50">
                            {loadingMedia ? (
                                <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {mediaFiles.map(file => (
                                        <div
                                            key={file.id}
                                            onClick={() => handleMediaSelect(file.url)}
                                            className="group relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-500 cursor-pointer bg-white dark:bg-slate-800 shadow-sm transition-all"
                                        >
                                            {(file.type && file.type.startsWith('video/')) || file.url.toLowerCase().endsWith('.mp4') ? (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-700 text-slate-500 font-medium">Video Seç</div>
                                            ) : (
                                                <img src={file.url} alt={file.filename} className="w-full h-full object-cover" />
                                            )}

                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 translate-y-full group-hover:translate-y-0 transition-transform">
                                                <p className="text-white text-xs truncate font-medium">{file.filename}</p>
                                            </div>
                                        </div>
                                    ))}
                                    {mediaFiles.length === 0 && (
                                        <div className="col-span-full py-20 text-center text-slate-500">Medya kütüphanesinde hiç görsel bulunamadı.</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* CALENDAR TAB */}
            {activeTab === 'calendar' && (
                <div className="space-y-4">
                    {loadingPosts ? (
                        <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : posts.filter(p => p.status === 'scheduled' || p.status === 'published' || p.status === 'failed').length === 0 ? (
                        <div className="py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                            <CalendarIcon size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-200">Henüz Zamanlanmış İçerik Yok</h3>
                            <p className="text-slate-500 mt-2">İçerik taslakları sekmesinden gönderilerinize tarih belirleyerek takvime ekleyebilirsiniz.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {posts.filter(p => p.status === 'scheduled' || p.status === 'published' || p.status === 'failed')
                                .sort((a, b) => new Date(a.scheduledFor || 0).getTime() - new Date(b.scheduledFor || 0).getTime())
                                .map(post => {
                                    let parsedUrls: string[] = []
                                    try { parsedUrls = JSON.parse(post.mediaUrls) } catch (e) { }

                                    return (
                                        <Card key={post.id} className="overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 flex flex-col">
                                            {parsedUrls.length > 0 ? (
                                                <div className="h-40 w-full bg-slate-100 dark:bg-slate-800">
                                                    {(parsedUrls[0].toLowerCase().endsWith('.mp4') || parsedUrls[0].toLowerCase().endsWith('.mov')) ? (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">Video</div>
                                                    ) : (
                                                        <img src={parsedUrls[0]} className="w-full h-full object-cover" />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="h-40 w-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}
                                            <div className="p-4 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <Badge className={
                                                        post.status === 'scheduled' ? 'bg-blue-500 hover:bg-blue-600 text-white' :
                                                            post.status === 'published' ? 'bg-green-500 hover:bg-green-600 text-white' :
                                                                'bg-red-500 hover:bg-red-600 text-white'
                                                    }>
                                                        {post.status === 'scheduled' ? 'Zamanlandı' : post.status === 'published' ? 'Yayınlandı' : 'Hata'}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">{post.content}</p>
                                                <div className="mt-auto flex justify-between items-center text-sm font-medium text-slate-700 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700 pt-3">
                                                    <div className="flex items-center gap-1">
                                                        <CalendarIcon size={14} className="text-blue-500" />
                                                        {post.scheduledFor ? new Date(post.scheduledFor).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Belirsiz'}
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-60">
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1 py-0 cursor-default">FB/IG</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    )
                                })}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
