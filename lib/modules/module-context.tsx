'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { MODULE_REGISTRY, type ModuleDefinition } from './module-registry'

// ─── Types ───
interface UserPermission {
    userId: string
    userName: string
    role: string
    allowedModules: string[]
}

interface ModuleConfig {
    enabledModules: string[]
    userPermissions: UserPermission[]
    elektraStatus: 'online' | 'offline' | 'unknown'
    lastElektraCheck: number
}

interface ModuleContextType {
    config: ModuleConfig
    isModuleEnabled: (moduleId: string) => boolean
    isModuleAccessible: (moduleId: string) => boolean
    toggleModule: (moduleId: string) => void
    setModuleEnabled: (moduleId: string, enabled: boolean) => void
    updateUserPermissions: (perms: UserPermission[]) => void
    checkElektraStatus: () => Promise<void>
    getModuleOfflineReason: (moduleId: string) => string | null
}

const STORAGE_KEY = 'bdr_module_config'

const defaultConfig: ModuleConfig = {
    enabledModules: MODULE_REGISTRY.filter(m => m.defaultEnabled).map(m => m.id),
    userPermissions: [
        { userId: 'admin', userName: 'Admin', role: 'admin', allowedModules: MODULE_REGISTRY.map(m => m.id) },
    ],
    elektraStatus: 'unknown',
    lastElektraCheck: 0,
}

const ModuleContext = createContext<ModuleContextType | null>(null)

export function ModuleProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<ModuleConfig>(defaultConfig)

    // Load from localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored) as Partial<ModuleConfig>
                setConfig(prev => ({
                    ...prev,
                    ...parsed,
                    // Ensure all default modules exist
                    enabledModules: parsed.enabledModules || prev.enabledModules,
                }))
            }
        } catch { /* first use */ }
    }, [])

    // Persist
    const persist = useCallback((next: ModuleConfig) => {
        setConfig(next)
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* quota */ }
    }, [])

    const isModuleEnabled = useCallback((id: string) => config.enabledModules.includes(id), [config.enabledModules])

    const isModuleAccessible = useCallback((id: string) => {
        const mod = MODULE_REGISTRY.find(m => m.id === id)
        if (!mod) return false
        if (!config.enabledModules.includes(id)) return false
        // If module needs Elektra and Elektra is offline, mark as inaccessible
        if ((mod.dataSource === 'elektra' || mod.dataSource === 'purchasing_erp') && config.elektraStatus === 'offline') {
            return false
        }
        return true
    }, [config.enabledModules, config.elektraStatus])

    const toggleModule = useCallback((id: string) => {
        const next = { ...config }
        if (next.enabledModules.includes(id)) {
            next.enabledModules = next.enabledModules.filter(m => m !== id)
        } else {
            next.enabledModules = [...next.enabledModules, id]
        }
        persist(next)
    }, [config, persist])

    const setModuleEnabled = useCallback((id: string, enabled: boolean) => {
        const next = { ...config }
        if (enabled && !next.enabledModules.includes(id)) {
            next.enabledModules = [...next.enabledModules, id]
        } else if (!enabled) {
            next.enabledModules = next.enabledModules.filter(m => m !== id)
        }
        persist(next)
    }, [config, persist])

    const updateUserPermissions = useCallback((perms: UserPermission[]) => {
        persist({ ...config, userPermissions: perms })
    }, [config, persist])

    const checkElektraStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/elektra-cache')
            const status = res.ok ? 'online' : 'offline'
            persist({ ...config, elektraStatus: status as 'online' | 'offline', lastElektraCheck: Date.now() })
        } catch {
            persist({ ...config, elektraStatus: 'offline', lastElektraCheck: Date.now() })
        }
    }, [config, persist])

    const getModuleOfflineReason = useCallback((id: string): string | null => {
        const mod = MODULE_REGISTRY.find(m => m.id === id)
        if (!mod) return 'Modül bulunamadı'
        if (!config.enabledModules.includes(id)) return 'Bu modül yönetici tarafından devre dışı bırakılmış'
        if ((mod.dataSource === 'elektra' || mod.dataSource === 'purchasing_erp') && config.elektraStatus === 'offline') {
            return mod.offlineReason || 'Veri kaynağına erişilemiyor'
        }
        return null
    }, [config])

    return (
        <ModuleContext.Provider value={{
            config, isModuleEnabled, isModuleAccessible, toggleModule,
            setModuleEnabled, updateUserPermissions, checkElektraStatus, getModuleOfflineReason,
        }}>
            {children}
        </ModuleContext.Provider>
    )
}

export function useModules() {
    const ctx = useContext(ModuleContext)
    if (!ctx) throw new Error('useModules must be used within ModuleProvider')
    return ctx
}

export type { UserPermission, ModuleConfig }
