import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// 1. GET Dashboard Widget Config
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId') || 'default' // Temporary fallback until auth is fully hooked in this route
        const globalOnly = searchParams.get('global') === 'true'

        // Retrieve config
        let configRec = null

        if (globalOnly) {
            configRec = await prisma.dashboardWidgetConfig.findFirst({
                where: { isGlobal: true }
            })
        } else {
            // First try user-specific, then global
            configRec = await prisma.dashboardWidgetConfig.findFirst({
                where: { userId, isGlobal: false }
            })

            if (!configRec) {
                configRec = await prisma.dashboardWidgetConfig.findFirst({
                    where: { isGlobal: true }
                })
            }
        }

        if (!configRec) {
            return NextResponse.json({ config: null })
        }

        return NextResponse.json({
            config: JSON.parse(configRec.config),
            isGlobal: configRec.isGlobal,
            userId: configRec.userId
        })

    } catch (error: any) {
        console.error('[Dashboard Config GET] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// 2. POST Dashboard Widget Config
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { config, isGlobal = false, userId = 'default' } = body

        if (!config || !Array.isArray(config)) {
            return NextResponse.json({ error: 'Invalid config payload' }, { status: 400 })
        }

        const configString = JSON.stringify(config)

        // Upsert based on isGlobal and userId combination
        let updatedRecord

        const existingRecord = await prisma.dashboardWidgetConfig.findFirst({
            where: {
                isGlobal: isGlobal,
                userId: isGlobal ? null : userId
            }
        })

        if (existingRecord) {
            updatedRecord = await prisma.dashboardWidgetConfig.update({
                where: { id: existingRecord.id },
                data: { config: configString, updatedAt: new Date() }
            })
        } else {
            updatedRecord = await prisma.dashboardWidgetConfig.create({
                data: {
                    isGlobal,
                    userId: isGlobal ? null : userId,
                    config: configString
                }
            })
        }

        return NextResponse.json({
            success: true,
            config: JSON.parse(updatedRecord.config),
            isGlobal: updatedRecord.isGlobal
        })
    } catch (error: any) {
        console.error('[Dashboard Config POST] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
