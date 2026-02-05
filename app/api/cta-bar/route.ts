'use server'

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch currently active CTA bar (within date range)
export async function GET() {
    try {
        const now = new Date()

        const ctaBar = await prisma.ctaBar.findFirst({
            where: {
                isActive: true,
                OR: [
                    // No date restrictions
                    {
                        AND: [
                            { startDate: null },
                            { endDate: null }
                        ]
                    },
                    // Within date range
                    {
                        AND: [
                            { startDate: { lte: now } },
                            { endDate: { gte: now } }
                        ]
                    },
                    // Started but no end date
                    {
                        AND: [
                            { startDate: { lte: now } },
                            { endDate: null }
                        ]
                    },
                    // No start date but has end date in future
                    {
                        AND: [
                            { startDate: null },
                            { endDate: { gte: now } }
                        ]
                    }
                ]
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(ctaBar)
    } catch (error) {
        console.error('Get CTA bar error:', error)
        return NextResponse.json({ error: 'Failed to get CTA bar' }, { status: 500 })
    }
}
