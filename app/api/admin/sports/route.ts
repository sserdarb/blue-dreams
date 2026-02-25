import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const locale = searchParams.get('locale') || 'tr'

        const sports = await prisma.sport.findMany({
            where: { locale },
            orderBy: { order: 'asc' }
        })

        return NextResponse.json(sports)
    } catch (error) {
        console.error('Error fetching sports:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, description, image, locale, icon, images, isActive, order } = body

        if (!title || !description || !image || !locale) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        const sport = await prisma.sport.create({
            data: {
                title,
                description,
                image,
                locale,
                icon,
                images: images ? JSON.stringify(images) : null,
                isActive: isActive ?? true,
                order: order ?? 0
            }
        })

        return NextResponse.json(sport)
    } catch (error) {
        console.error('Error creating sport:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
