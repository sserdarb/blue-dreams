import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const locale = searchParams.get('locale') || 'tr'

        const entries = await prisma.diningEvent.findMany({
            where: { locale },
            include: { dining: true },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json(entries)
    } catch (error) {
        console.error('[DiningEvent GET Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { diningId, locale, title, description, date, time, image, isActive } = body

        if (!diningId || !locale || !title) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        const entry = await prisma.diningEvent.create({
            data: {
                diningId,
                locale,
                title,
                description,
                date: date ? new Date(date) : null,
                time,
                image,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(entry)
    } catch (error) {
        console.error('[DiningEvent POST Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
