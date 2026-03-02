import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // In Next.js 15, params is a Promise
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { status, rejectionRsn } = body

        const updated = await prisma.socialTopicSuggestion.update({
            where: { id },
            data: {
                status,
                rejectionRsn
            }
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating topic:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
