import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Demo Mode Toggle API ──────────────────────────────────────────────
// GET: Returns current demo mode status for all modules
// POST: Toggle demo mode for a specific module

const DEMO_MODULES = [
    { key: 'demo_mode_analytics', label: 'Analitik', description: 'Google Analytics yerine demo trafik verisi gösterir' },
    { key: 'demo_mode_social', label: 'Sosyal Medya', description: 'Meta API yerine demo sosyal medya verisi gösterir' },
    { key: 'demo_mode_tasks', label: 'Görev Yönetimi', description: 'Demo görevler ve proje verileri gösterir' },
    { key: 'demo_mode_inbox', label: 'Mesaj Kutusu', description: 'Demo mesajlar ve iletişim verileri gösterir' },
]

export async function GET() {
    try {
        const db = prisma as any
        const settings: Record<string, boolean> = {}

        for (const mod of DEMO_MODULES) {
            try {
                const setting = await db.siteSetting?.findUnique?.({ where: { key: mod.key } })
                settings[mod.key] = setting?.value === 'true'
            } catch {
                settings[mod.key] = false
            }
        }

        return NextResponse.json({
            success: true,
            modules: DEMO_MODULES.map(m => ({
                ...m,
                enabled: settings[m.key] || false
            }))
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { key, enabled } = body

        if (!key || !DEMO_MODULES.some(m => m.key === key)) {
            return NextResponse.json({ success: false, error: 'Geçersiz modül anahtarı' }, { status: 400 })
        }

        const db = prisma as any

        // Upsert the setting
        try {
            await db.siteSetting?.upsert?.({
                where: { key },
                update: { value: enabled ? 'true' : 'false' },
                create: { key, value: enabled ? 'true' : 'false' }
            })
        } catch {
            // SiteSetting table may not exist — use env fallback
            return NextResponse.json({
                success: false,
                error: 'SiteSetting tablosu mevcut değil. Coolify env üzerinden DEMO_MODE_ANALYTICS=true vb. ayarlayın.',
                fallbackHint: `Coolify > Environment Variables > ${key.toUpperCase().replace('DEMO_MODE_', 'DEMO_MODE_')} = true`
            }, { status: 200 })
        }

        return NextResponse.json({
            success: true,
            message: `${key} ${enabled ? 'açıldı' : 'kapatıldı'}`,
            key,
            enabled
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
