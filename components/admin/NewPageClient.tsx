'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Rocket, Eye, Image } from 'lucide-react'
import ImageUrlField from '@/components/admin/ImageUrlField'
import type { CmsTranslations } from '@/lib/cms-translations'

interface ParentOption {
    id: string
    title: string
    slug: string
}

export function NewPageClient({
    locale,
    t,
    parentOptions,
}: {
    locale: string
    t: CmsTranslations
    parentOptions: ParentOption[]
}) {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [slug, setSlug] = useState('')
    const [metaDesc, setMetaDesc] = useState('')
    const [pageLocale, setPageLocale] = useState(locale)
    const [status, setStatus] = useState('draft')
    const [visibility, setVisibility] = useState('public')
    const [template, setTemplate] = useState('default')
    const [parentId, setParentId] = useState('')
    const [featuredImage, setFeaturedImage] = useState('')
    const [saving, setSaving] = useState(false)

    const generateSlug = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİ]/g, 'i')
            .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
            .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }

    const handleTitleChange = (val: string) => {
        setTitle(val)
        if (!slug || slug === generateSlug(title)) {
            setSlug(generateSlug(val))
        }
    }

    const handleSubmit = async (submitStatus: string) => {
        if (!title.trim() || !slug.trim()) return
        setSaving(true)
        try {
            const formData = new FormData()
            formData.set('title', title)
            formData.set('slug', slug)
            formData.set('locale', pageLocale)
            formData.set('status', submitStatus)
            formData.set('visibility', visibility)
            formData.set('template', template)
            formData.set('parentId', parentId)
            formData.set('metaDescription', metaDesc)
            formData.set('featuredImage', featuredImage)

            const { createPage } = await import('@/app/actions/admin')
            const page = await createPage(formData)
            router.push(`/${locale}/admin/pages/${(page as any).id}/editor`)
        } catch (err) {
            console.error('Create page failed:', err)
        }
        setSaving(false)
    }

    return (
        <div>
            {/* Top bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/${locale}/admin/pages`}
                        className="text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1"
                    >
                        <ArrowLeft size={14} /> {t.backToPages}
                    </Link>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">{t.addNewPageTitle}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSubmit('draft')}
                        disabled={saving || !title.trim()}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition disabled:opacity-50"
                    >
                        <Save size={14} /> {t.saveDraft}
                    </button>
                    <button
                        onClick={() => handleSubmit('published')}
                        disabled={saving || !title.trim()}
                        className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
                    >
                        <Rocket size={14} /> {t.publish}
                    </button>
                </div>
            </div>

            {/* Main layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Title + Slug */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.pageTitle}</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => handleTitleChange(e.target.value)}
                                placeholder={t.pageTitlePlaceholder}
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t.slug} (URL)</label>
                            <div className="flex items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                                <span className="px-3 py-3 text-sm text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                    {t.slugPrefix}
                                </span>
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={e => setSlug(e.target.value)}
                                    placeholder={t.slugPlaceholder}
                                    className="flex-1 px-3 py-3 bg-transparent text-slate-900 dark:text-white text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content Builder placeholder */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{t.pageContentBuilder}</h3>
                            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">0 {t.blocksAdded}</span>
                        </div>
                        <div className="p-8 text-center">
                            <p className="text-slate-400 dark:text-slate-500 text-sm mb-2">
                                Sayfayı oluşturduktan sonra widget ekleyebileceksiniz.
                            </p>
                            <p className="text-xs text-slate-300 dark:text-slate-600">
                                Sağ taraftan sayfa ayarlarını yapılandırıp kaydedin.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="space-y-6">
                    {/* Publishing Options */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
                            <Rocket size={16} className="text-blue-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.publishingOptions}</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">{t.status}:</span>
                                <span className="font-bold text-slate-900 dark:text-white">{t.draft}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">{t.visibility}:</span>
                                <select
                                    value={visibility}
                                    onChange={e => setVisibility(e.target.value)}
                                    className="bg-transparent text-blue-600 dark:text-blue-400 font-semibold text-sm cursor-pointer focus:outline-none"
                                >
                                    <option value="public">{t.visibilityPublic}</option>
                                    <option value="private">{t.visibilityPrivate}</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400">{t.schedule}:</span>
                                <span className="text-blue-600 dark:text-blue-400 font-semibold">{t.immediately}</span>
                            </div>

                            <div className="pt-2 space-y-2">
                                <button
                                    onClick={() => handleSubmit('draft')}
                                    disabled={saving || !title.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-600 transition disabled:opacity-50"
                                >
                                    <Save size={14} /> {saving ? t.saving : t.updateDraft}
                                </button>
                                <button
                                    onClick={() => handleSubmit('published')}
                                    disabled={saving || !title.trim()}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-50"
                                >
                                    <Rocket size={14} /> {t.publishNow}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Featured Image */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
                            <Image size={16} className="text-emerald-500" />
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.featuredImage}</h3>
                        </div>
                        <div className="p-5">
                            <ImageUrlField
                                value={featuredImage}
                                onChange={setFeaturedImage}
                                label={t.featuredImage}
                            />
                        </div>
                    </div>

                    {/* Page Attributes */}
                    <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-purple-500">💎</span>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t.pageAttributes}</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.parentPage}</label>
                                <select
                                    value={parentId}
                                    onChange={e => setParentId(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">{t.noParent}</option>
                                    {parentOptions.map(p => (
                                        <option key={p.id} value={p.id}>{p.title} (/{p.slug})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.template}</label>
                                <select
                                    value={template}
                                    onChange={e => setTemplate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="default">{t.templateDefault}</option>
                                    <option value="full-width">{t.templateFullWidth}</option>
                                    <option value="sidebar">{t.templateSidebar}</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.metaDescription}</label>
                                <textarea
                                    value={metaDesc}
                                    onChange={e => setMetaDesc(e.target.value)}
                                    placeholder={t.metaDescriptionPlaceholder}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{t.language}</label>
                                <select
                                    value={pageLocale}
                                    onChange={e => setPageLocale(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="tr">🇹🇷 Türkçe (TR)</option>
                                    <option value="en">🇬🇧 English (EN)</option>
                                    <option value="de">🇩🇪 Deutsch (DE)</option>
                                    <option value="ru">🇷🇺 Русский (RU)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
