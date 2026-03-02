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
                    isGlobal: 'asc' // User-specific override global if same key
                }
            })

            // Deduplicate by reportId + metricName, preferring user-specific
            const formulaMap = new Map()
            for (const f of formulas) {
                const key = `${f.reportId}_${f.metricName}`
                if (!f.isGlobal || !formulaMap.has(key)) {
                    formulaMap.set(key, f)
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
            const { reportId, metricName, expression } = f

            if (!reportId || !metricName || !expression) continue

            // Upsert
            const existingRecord = await prisma.reportFormula.findFirst({
                where: {
                    reportId: reportId,
                    metricName: metricName,
                    isGlobal: isGlobal,
                    userId: isGlobal ? null : userId
                }
            })

            let updatedRecord
            if (existingRecord) {
                updatedRecord = await prisma.reportFormula.update({
                    where: { id: existingRecord.id },
                    data: { expression, updatedAt: new Date() }
                })
            } else {
                updatedRecord = await prisma.reportFormula.create({
                    data: {
                        reportId: reportId,
                        metricName: metricName,
                        expression: expression,
                        isGlobal,
                        userId: isGlobal ? null : userId
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
