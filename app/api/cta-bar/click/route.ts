'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Increment click count for analytics
export async function POST(request: NextRequest) {
    try {
        const { id } = await request.json()

        if (!id) {
            return NextResponse.json({ error: 'CTA bar ID required' }, { status: 400 })
        }

        const ctaBar = await prisma.ctaBar.update({
            where: { id },
            data: {
                clickCount: { increment: 1 }
            }
        })

        return NextResponse.json({ success: true, clickCount: ctaBar.clickCount })
    } catch (error) {
        console.error('Track CTA click error:', error)
        return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
    }
}
