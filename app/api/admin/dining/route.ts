import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const locale = searchParams.get('locale') || 'tr'

        const entries = await prisma.dining.findMany({
            where: { locale },
            orderBy: { order: 'asc' },
        })

        return NextResponse.json(entries)
    } catch (error) {
        console.error('[Dining GET Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, name, type, description, image, images, locale, order, cuisine, hours, capacity, location, features, menuUrl, isActive } = body

        if (!(title || name) || !locale || !image) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        const entry = await prisma.dining.create({
            data: {
                title: title || name,
                type: type || 'restaurant',
                description: description || '',
                image,
                images: images ? JSON.parse(JSON.stringify(images)) : null,
                locale,
                order: order || 0,
                cuisine,
                hours,
                capacity,
                location,
                features,
                menuUrl,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(entry)
    } catch (error) {
        console.error('[Dining POST Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
