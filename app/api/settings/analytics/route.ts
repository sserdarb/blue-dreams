import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const db = prisma as any

export async function GET() {
    try {
        const config = await db.analyticsConfig.findFirst()
        if (config) {
            return NextResponse.json({
                gaId: config.gaId || '',
                gtmId: config.gtmId || '',
                fbPixelId: config.fbPixelId || '',
                gaApiSecret: config.gaApiSecret || '',
                gaPropertyId: config.gaPropertyId || '',
                gaServiceKey: config.gaServiceKey ? '***configured***' : '',
                useGaApi: config.useGaApi || false,
            })
        }
        return NextResponse.json({
            gaId: '', gtmId: '', fbPixelId: '',
            gaApiSecret: '', gaPropertyId: '', gaServiceKey: '',
            useGaApi: false,
        })
    } catch (error) {
        console.error('Error reading analytics settings:', error)
        return NextResponse.json({
            gaId: '', gtmId: '', fbPixelId: '',
            gaApiSecret: '', gaPropertyId: '', gaServiceKey: '',
            useGaApi: false,
        })
    }
}

export async function POST(request: Request) {
    try {
        const settings = await request.json()
        const existing = await db.analyticsConfig.findFirst()

        const data: any = {
            gaId: settings.gaId || null,
            gtmId: settings.gtmId || null,
            fbPixelId: settings.fbPixelId || null,
            gaApiSecret: settings.gaApiSecret || null,
            gaPropertyId: settings.gaPropertyId || null,
            useGaApi: settings.useGaApi || false,
        }

        // Only update service key if a new one is provided (not the masked value)
        if (settings.gaServiceKey && settings.gaServiceKey !== '***configured***') {
            data.gaServiceKey = settings.gaServiceKey
        }

        if (existing) {
            await db.analyticsConfig.update({
                where: { id: existing.id },
                data
            })
        } else {
            await db.analyticsConfig.create({ data })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving analytics settings:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}
