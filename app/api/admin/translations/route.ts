import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'

// GET — Retrieve all translations for a locale (defaults + DB overrides merged)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get('locale') || 'tr') as AdminLocale

    try {
        // Get default translations from code
        const defaults = getAdminTranslations(locale) as Record<string, any>

        // Get DB overrides for this locale
        const overrides = await prisma.adminTranslation.findMany({
            where: { locale }
        })

        // Build flat key-value map of overrides
        const overrideMap: Record<string, string> = {}
        for (const o of overrides) {
            overrideMap[o.key] = o.value
        }

        // Flatten defaults to dot-notation keys for the editor
        const flatDefaults: Record<string, string> = {}
        function flatten(obj: any, prefix = '') {
            for (const [k, v] of Object.entries(obj)) {
                const key = prefix ? `${prefix}.${k}` : k
                if (typeof v === 'string') {
                    flatDefaults[key] = v
                } else if (Array.isArray(v)) {
                    flatDefaults[key] = JSON.stringify(v)
                } else if (typeof v === 'object' && v !== null) {
                    flatten(v, key)
                }
            }
        }
        flatten(defaults)

        // Merge: override wins
        const merged: Record<string, { value: string; isOverride: boolean; default: string }> = {}
        for (const [key, defaultVal] of Object.entries(flatDefaults)) {
            merged[key] = {
                value: overrideMap[key] || defaultVal,
                isOverride: !!overrideMap[key],
                default: defaultVal
            }
        }

        return NextResponse.json({ translations: merged, locale, overrideCount: overrides.length })
    } catch (error: any) {
        console.error('[Translations API] GET error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PUT — Save translation overrides
export async function PUT(request: Request) {
    try {
        const { locale, updates } = await request.json() as {
            locale: string
            updates: Record<string, string | null> // null = reset to default
        }

        if (!locale || !updates) {
            return NextResponse.json({ error: 'Missing locale or updates' }, { status: 400 })
        }

        let saved = 0
        let deleted = 0

        for (const [key, value] of Object.entries(updates)) {
            if (value === null) {
                // Reset to default — delete DB override
                await prisma.adminTranslation.deleteMany({ where: { key, locale } })
                deleted++
            } else {
                // Upsert override
                await prisma.adminTranslation.upsert({
                    where: { key_locale: { key, locale } },
                    update: { value },
                    create: { key, locale, value }
                })
                saved++
            }
        }

        return NextResponse.json({ success: true, saved, deleted })
    } catch (error: any) {
        console.error('[Translations API] PUT error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
