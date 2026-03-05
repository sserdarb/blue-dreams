import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Demo Mode Toggle API ──────────────────────────────────────────────
// GET: Returns current demo mode status for all modules
// POST: Toggle demo mode for a specific module

const DEMO_MODULES = [
    { key: 'demoModeAnalytics', label: 'Analitik', description: 'Google Analytics yerine demo trafik verisi gösterir' },
    { key: 'demoModeSocial', label: 'Sosyal Medya', description: 'Meta API yerine demo sosyal medya verisi gösterir' },
    { key: 'demoModeTasks', label: 'Görev Yönetimi', description: 'Demo görevler ve proje verileri gösterir' },
    { key: 'demoModeInbox', label: 'Mesaj Kutusu', description: 'Demo mesajlar ve iletişim verileri gösterir' },
    { key: 'demoModeFinance', label: 'Finans', description: 'ERP bağlantısı koptuğunda / olmadığında demo rapor verisi gösterir' },
    { key: 'demoModePurchasing', label: 'Satın Alma', description: 'ERP bağlantısı koptuğunda / olmadığında demo stok verisi gösterir' },
]

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findFirst()

        const modules = DEMO_MODULES.map(m => ({
            ...m,
            enabled: settings ? !!(settings as any)[m.key] : false
        }))

        return NextResponse.json({
            success: true,
            modules
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

        let settings = await prisma.siteSettings.findFirst()
        if (!settings) {
            settings = await prisma.siteSettings.create({
                data: {
                    locale: 'tr',
                }
            })
        }

        await prisma.siteSettings.update({
            where: { id: settings.id },
            data: {
                [key]: enabled
            }
        })

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
