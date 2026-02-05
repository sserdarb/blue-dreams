import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch AI settings
export async function GET() {
    try {
        let settings = await prisma.aiSettings.findFirst({
            where: { isActive: true }
        })

        if (!settings) {
            // Create default settings
            settings = await prisma.aiSettings.create({
                data: {
                    systemPrompt: `Sen Blue Dreams Resort'un dijital konsiyerjisin. Misafirperver, profesyonel ve yardımsever ol.`,
                    language: 'tr',
                    tone: 'friendly',
                    isActive: true
                }
            })
        }

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Get AI settings error:', error)
        return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
    }
}

// POST - Update AI settings
export async function POST(request: NextRequest) {
    try {
        const { systemPrompt, language, tone, isActive } = await request.json()

        // Deactivate all existing settings
        await prisma.aiSettings.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        })

        // Create new settings
        const settings = await prisma.aiSettings.create({
            data: {
                systemPrompt: systemPrompt || '',
                language: language || 'tr',
                tone: tone || 'friendly',
                isActive: isActive !== false
            }
        })

        return NextResponse.json(settings)
    } catch (error) {
        console.error('Update AI settings error:', error)
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }
}
