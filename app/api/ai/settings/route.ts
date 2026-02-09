import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'tr'

    try {
        let settings = await prisma.aiSettings.findFirst({
            where: { language: locale }
        })

        // Create default if not exists
        if (!settings) {
            return NextResponse.json({ systemPrompt: '', tone: 'friendly', apiKey: '' })
        }

        return NextResponse.json(settings)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { systemPrompt, language = 'tr', tone = 'friendly', apiKey } = body

        // Upsert settings
        const existing = await prisma.aiSettings.findFirst({ where: { language } })

        let settings;
        if (existing) {
            settings = await prisma.aiSettings.update({
                where: { id: existing.id },
                data: { systemPrompt, tone, apiKey }
            })
        } else {
            settings = await prisma.aiSettings.create({
                data: {
                    systemPrompt,
                    language,
                    tone,
                    apiKey
                }
            })
        }

        return NextResponse.json(settings)

    } catch (error) {
        console.error('Settings API Error:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}
