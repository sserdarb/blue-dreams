import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const competitors = await prisma.competitorHotel.findMany({
            orderBy: { name: 'asc' }
        })
        return NextResponse.json(competitors)
    } catch (e) {
        console.error('[Competitors GET]', e)
        return NextResponse.json({ error: 'Failed to fetch competitors' }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const { name } = await req.json()
        if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

        const comp = await prisma.competitorHotel.create({
            data: { name }
        })
        return NextResponse.json(comp)
    } catch (e) {
        console.error('[Competitors POST]', e)
        return NextResponse.json({ error: 'Failed to add competitor' }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        await prisma.competitorHotel.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (e) {
        console.error('[Competitors DELETE]', e)
        return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }
}
