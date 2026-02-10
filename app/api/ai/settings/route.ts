import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function maskApiKey(key: string | null | undefined): string {
    if (!key) return ''
    if (key.length <= 8) return '••••••••'
    return '••••••••••••' + key.slice(-4)
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'tr'

    try {
        let settings = await prisma.aiSettings.findFirst({
            where: { language: locale }
        })

        // Create default if not exists
        if (!settings) {
            return NextResponse.json({ systemPrompt: '', tone: 'friendly', apiKeyMasked: '' })
        }

        // Never expose real API key — only send masked version
        return NextResponse.json({
            ...settings,
            apiKey: undefined,
            apiKeyMasked: maskApiKey(settings.apiKey)
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { systemPrompt, language = 'tr', tone = 'friendly', apiKey } = body

        // Build update data — only include apiKey if a new one was provided
        const updateData: any = { systemPrompt, tone }
        if (apiKey && apiKey.trim()) {
            updateData.apiKey = apiKey.trim()
        }

        // Upsert settings
        const existing = await prisma.aiSettings.findFirst({ where: { language } })

        let settings;
        if (existing) {
            settings = await prisma.aiSettings.update({
                where: { id: existing.id },
                data: updateData
            })
        } else {
            settings = await prisma.aiSettings.create({
                data: {
                    systemPrompt,
                    language,
                    tone,
                    apiKey: apiKey?.trim() || ''
                }
            })
        }

        // Return with masked key
        return NextResponse.json({
            ...settings,
            apiKey: undefined,
            apiKeyMasked: maskApiKey(settings.apiKey)
        })

    } catch (error) {
        console.error('Settings API Error:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}

