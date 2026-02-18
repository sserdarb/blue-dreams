'use client'

import React, { useState, useEffect } from 'react'
import { Settings, Puzzle, Users, Shield, Server, WifiOff, Wifi, RefreshCw, Search, ChevronDown, Check, X } from 'lucide-react'
import { MODULE_REGISTRY, ROLE_PRESETS, type ModuleDefinition } from '@/lib/modules/module-registry'
import { useModules, type UserPermission } from '@/lib/modules/module-context'

type SettingsTab = 'modules' | 'permissions'

const SECTION_LABELS: Record<string, string> = {
    'section-raporlar': 'Raporlar & Analiz',
    'section-satis': 'Satış & Pazarlama',
    'section-finans': 'Finans & Tedarik',
    'section-icerik': 'İçerik',
    'section-operasyon': 'Otel Operasyon',
    'section-entegrasyon': 'Entegrasyonlar',
}

const DATA_SOURCE_LABELS: Record<string, { label: string; color: string }> = {
    elektra: { label: 'Elektra PMS', color: 'bg-blue-500/20 text-blue-400' },
    purchasing_erp: { label: 'Elektra ERP', color: 'bg-amber-500/20 text-amber-400' },
    local: { label: 'Lokal', color: 'bg-emerald-500/20 text-emerald-400' },
    none: { label: 'Bağımsız', color: 'bg-slate-500/20 text-slate-400' },
}

// Demo users for permission management
const DEMO_USERS: UserPermission[] = [
    { userId: 'admin', userName: 'Admin', role: 'admin', allowedModules: MODULE_REGISTRY.map(m => m.id) },
    { userId: 'manager', userName: 'Genel Müdür', role: 'manager', allowedModules: [] },
    { userId: 'frontdesk', userName: 'Resepsiyon', role: 'operations', allowedModules: [] },
    { userId: 'marketing', userName: 'Pazarlama Sorumlusu', role: 'marketing', allowedModules: [] },
    { userId: 'accounting', userName: 'Muhasebe', role: 'manager', allowedModules: [] },
]

export default function SettingsModuleManager() {
    const [tab, setTab] = useState<SettingsTab>('modules')
    const { config, toggleModule, isModuleEnabled, checkElektraStatus, updateUserPermissions } = useModules()
    const [search, setSearch] = useState('')
    const [filterSource, setFilterSource] = useState<string>('all')
    const [checking, setChecking] = useState(false)
    const [users, setUsers] = useState<UserPermission[]>([])
    const [selectedUser, setSelectedUser] = useState<string>('admin')
    const [expandedSection, setExpandedSection] = useState<string | null>(null)

    // Init users from config or demo
    useEffect(() => {
        if (config.userPermissions.length > 0) {
            // Merge with demo users to ensure all exist
            const merged = DEMO_USERS.map(demo => {
                const existing = config.userPermissions.find(u => u.userId === demo.userId)
                return existing || {
                    ...demo,
                    allowedModules: ROLE_PRESETS[demo.role]?.moduleIds || [],
                }
            })
            setUsers(merged)
        } else {
            setUsers(DEMO_USERS.map(u => ({
                ...u,
                allowedModules: ROLE_PRESETS[u.role]?.moduleIds || [],
            })))
        }
    }, [config.userPermissions])

    const handleElektraCheck = async () => {
        setChecking(true)
        await checkElektraStatus()
        setTimeout(() => setChecking(false), 1000)
    }

    // Group modules by section
    const sections = Object.entries(SECTION_LABELS).map(([id, label]) => ({
        id, label,
        modules: MODULE_REGISTRY.filter(m => m.section === id)
    }))

    // Filtered modules
    const filteredModules = MODULE_REGISTRY.filter(m => {
        if (search && !m.label.toLowerCase().includes(search.toLowerCase()) && !m.description.toLowerCase().includes(search.toLowerCase())) return false
        if (filterSource !== 'all' && m.dataSource !== filterSource) return false
        return true
    })

    const filteredSections = sections.map(s => ({
        ...s,
        modules: s.modules.filter(m => filteredModules.includes(m))
    })).filter(s => s.modules.length > 0)

    // Counts
    const elektraModules = MODULE_REGISTRY.filter(m => m.dataSource === 'elektra' || m.dataSource === 'purchasing_erp')
    const enabledCount = MODULE_REGISTRY.filter(m => isModuleEnabled(m.id)).length
    const elektraCount = elektraModules.length

    // User permission helpers
    const currentUser = users.find(u => u.userId === selectedUser)

    const toggleUserModule = (userId: string, moduleId: string) => {
        const updated = users.map(u => {
            if (u.userId !== userId) return u
            const has = u.allowedModules.includes(moduleId)
            return {
                ...u,
                allowedModules: has
                    ? u.allowedModules.filter(m => m !== moduleId)
                    : [...u.allowedModules, moduleId]
            }
        })
        setUsers(updated)
        updateUserPermissions(updated)
    }

    const applyRolePreset = (userId: string, role: string) => {
        const preset = ROLE_PRESETS[role]
        if (!preset) return
        const updated = users.map(u =>
            u.userId === userId ? { ...u, role, allowedModules: [...preset.moduleIds] } : u
        )
        setUsers(updated)
        updateUserPermissions(updated)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Settings size={28} className="text-cyan-500" /> Ayarlar
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Modül yönetimi ve kullanıcı yetkileri</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                <button
                    onClick={() => setTab('modules')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${tab === 'modules'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-cyan-600 dark:to-blue-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Puzzle size={16} /> Modül Yönetimi
                </button>
                <button
                    onClick={() => setTab('permissions')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-all ${tab === 'permissions'
                        ? 'bg-white dark:bg-gradient-to-r dark:from-purple-600 dark:to-pink-600 text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                >
                    <Shield size={16} /> Kullanıcı Yetkileri
                </button>
            </div>

            {/* MODULE MANAGEMENT TAB */}
            {tab === 'modules' && (
                <div className="space-y-6">
                    {/* Status Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Elektra Status */}
                        <div className={`rounded-xl p-4 border ${config.elektraStatus === 'online'
                            ? 'bg-emerald-500/5 border-emerald-500/20'
                            : config.elektraStatus === 'offline'
                                ? 'bg-red-500/5 border-red-500/20'
                                : 'bg-slate-500/5 border-slate-500/20'
                            }`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {config.elektraStatus === 'online' ? (
                                        <Wifi size={18} className="text-emerald-400" />
                                    ) : (
                                        <WifiOff size={18} className="text-red-400" />
                                    )}
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">Elektra PMS</span>
                                </div>
                                <button
                                    onClick={handleElektraCheck}
                                    disabled={checking}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <RefreshCw size={14} className={`text-slate-400 ${checking ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                            <p className={`text-xs mt-1 ${config.elektraStatus === 'online' ? 'text-emerald-400' : config.elektraStatus === 'offline' ? 'text-red-400' : 'text-slate-500'}`}>
                                {config.elektraStatus === 'online' ? 'Bağlı — Canlı veri aktif' :
                                    config.elektraStatus === 'offline' ? 'Bağlantı yok — Modüller pasif' :
                                        'Henüz kontrol edilmedi'}
                            </p>
                        </div>

                        {/* Active Modules */}
                        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <Puzzle size={18} className="text-cyan-400" />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Aktif Modüller</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{enabledCount}<span className="text-slate-500 text-base font-normal">/{MODULE_REGISTRY.length}</span></p>
                        </div>

                        {/* Elektra Dependent */}
                        <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-slate-200 dark:border-white/10">
                            <div className="flex items-center gap-2">
                                <Server size={18} className="text-blue-400" />
                                <span className="text-sm font-medium text-slate-900 dark:text-white">Elektra Bağımlı</span>
                            </div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{elektraCount}<span className="text-slate-500 text-base font-normal"> modül</span></p>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Modül ara..."
                                className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/50 outline-none"
                            />
                        </div>
                        <div className="flex gap-1">
                            {[{ key: 'all', label: 'Tümü' }, ...Object.entries(DATA_SOURCE_LABELS).map(([k, v]) => ({ key: k, label: v.label }))].map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilterSource(f.key)}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filterSource === f.key
                                        ? 'bg-cyan-600 text-white'
                                        : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Module List by Section */}
                    <div className="space-y-4">
                        {filteredSections.map(section => (
                            <div key={section.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{section.label}</span>
                                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-xs rounded-full">
                                            {section.modules.filter(m => isModuleEnabled(m.id)).length}/{section.modules.length}
                                        </span>
                                    </div>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform ${expandedSection === section.id ? 'rotate-180' : ''}`} />
                                </button>

                                {(expandedSection === section.id || expandedSection === null) && (
                                    <div className="border-t border-slate-100 dark:border-white/5 divide-y divide-slate-100 dark:divide-white/5">
                                        {section.modules.map(mod => (
                                            <ModuleRow
                                                key={mod.id}
                                                mod={mod}
                                                enabled={isModuleEnabled(mod.id)}
                                                elektraStatus={config.elektraStatus}
                                                onToggle={() => toggleModule(mod.id)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* USER PERMISSIONS TAB */}
            {tab === 'permissions' && (
                <div className="space-y-6">
                    {/* User List */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* User Sidebar */}
                        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4 space-y-2">
                            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Kullanıcılar</p>
                            {users.map(u => (
                                <button
                                    key={u.userId}
                                    onClick={() => setSelectedUser(u.userId)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${selectedUser === u.userId
                                        ? 'bg-cyan-500/10 border border-cyan-500/30'
                                        : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                                        {u.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{u.userName}</p>
                                        <p className="text-xs text-slate-500">{ROLE_PRESETS[u.role]?.label || u.role}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Permission Matrix */}
                        <div className="md:col-span-3 space-y-4">
                            {currentUser && (
                                <>
                                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{currentUser.userName}</h3>
                                                <p className="text-sm text-slate-500">
                                                    {currentUser.allowedModules.length}/{MODULE_REGISTRY.length} modül erişimi
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500">Rol Preset:</span>
                                                {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
                                                    <button
                                                        key={key}
                                                        onClick={() => applyRolePreset(currentUser.userId, key)}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${currentUser.role === key
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10'
                                                            }`}
                                                    >
                                                        {preset.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Module Checkboxes by Section */}
                                    {sections.map(section => (
                                        <div key={section.id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl p-4">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{section.label}</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                {section.modules.map(mod => {
                                                    const hasAccess = currentUser.allowedModules.includes(mod.id)
                                                    return (
                                                        <button
                                                            key={mod.id}
                                                            onClick={() => toggleUserModule(currentUser.userId, mod.id)}
                                                            className={`flex items-center gap-2 p-2.5 rounded-lg text-left text-sm transition-colors ${hasAccess
                                                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                                                                : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500'
                                                                }`}
                                                        >
                                                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${hasAccess
                                                                ? 'bg-emerald-500 border-emerald-500'
                                                                : 'border-slate-300 dark:border-slate-600'
                                                                }`}>
                                                                {hasAccess && <Check size={12} className="text-white" />}
                                                            </div>
                                                            <span className={hasAccess ? 'text-slate-900 dark:text-white' : ''}>{mod.label}</span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── Module Row Component ───
function ModuleRow({ mod, enabled, elektraStatus, onToggle }: {
    mod: ModuleDefinition
    enabled: boolean
    elektraStatus: string
    onToggle: () => void
}) {
    const isElektra = mod.dataSource === 'elektra' || mod.dataSource === 'purchasing_erp'
    const isOffline = isElektra && elektraStatus === 'offline'
    const source = DATA_SOURCE_LABELS[mod.dataSource] || DATA_SOURCE_LABELS.none

    return (
        <div className="flex items-center justify-between px-4 py-3 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{mod.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${source.color}`}>{source.label}</span>
                    {isOffline && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/20 text-red-400">Çevrimdışı</span>
                    )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{mod.description}</p>
                {isOffline && mod.offlineReason && (
                    <p className="text-xs text-red-400/80 mt-1 flex items-center gap-1">
                        <WifiOff size={10} /> {mod.offlineReason}
                    </p>
                )}
            </div>

            {/* Toggle Switch */}
            <button
                onClick={onToggle}
                className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? (isOffline ? 'bg-amber-500' : 'bg-emerald-500') : 'bg-slate-300 dark:bg-slate-600'}`}
            >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
        </div>
    )
}
