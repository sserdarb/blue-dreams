import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// 1. GET Report Formulas
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const userId = searchParams.get('userId') || 'default'
        const globalOnly = searchParams.get('global') === 'true'

        // Retrieve formulas
        let formulas

        if (globalOnly) {
            formulas = await prisma.reportFormula.findMany({
                where: { isGlobal: true }
            })
        } else {
            // Fetch both user-specific and global formulas
            formulas = await prisma.reportFormula.findMany({
                where: {
                    OR: [
                        { userId },
                        { isGlobal: true }
                    ]
                },
                orderBy: {
                    isGlobal: 'asc' // User-specific override global if same widgetId
                }
            })

            // Deduplicate by widgetId, preferring user-specific
            const formulaMap = new Map()
            for (const f of formulas) {
                // Because order is ascending (isGlobal: false comes first conceptually, but boolean false is less than true in some DBs. Let's do it manually)
                if (!f.isGlobal || !formulaMap.has(f.widgetId)) {
                    formulaMap.set(f.widgetId, f)
                }
            }
            formulas = Array.from(formulaMap.values())
        }

        return NextResponse.json({ formulas })

    } catch (error: any) {
        console.error('[Formulas Config GET] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// 2. POST Report Formulas (Save array of formulas)
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { formulas, isGlobal = false, userId = 'default' } = body

        if (!formulas || !Array.isArray(formulas)) {
            return NextResponse.json({ error: 'Invalid formulas payload' }, { status: 400 })
        }

        const results = []

        // In a real app we might use a transaction here
        for (const f of formulas) {
            const { widgetId, config } = f

            if (!widgetId) continue

            const configString = typeof config === 'string' ? config : JSON.stringify(config)

            // Upsert
            const existingRecord = await prisma.reportFormula.findFirst({
                where: {
                    widgetId,
                    isGlobal: isGlobal,
                    userId: isGlobal ? null : userId
                }
            })

            let updatedRecord
            if (existingRecord) {
                updatedRecord = await prisma.reportFormula.update({
                    where: { id: existingRecord.id },
                    data: { config: configString, updatedAt: new Date() }
                })
            } else {
                updatedRecord = await prisma.reportFormula.create({
                    data: {
                        widgetId,
                        isGlobal,
                        userId: isGlobal ? null : userId,
                        config: configString
                    }
                })
            }
            results.push(updatedRecord)
        }

        return NextResponse.json({
            success: true,
            formulas: results
        })
    } catch (error: any) {
        console.error('[Formulas Config POST] Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
