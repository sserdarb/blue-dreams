import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const entry = await prisma.dining.findUnique({
            where: { id: params.id },
            include: { events: true }
        })

        if (!entry) {
            return new NextResponse('Not found', { status: 404 })
        }

        return NextResponse.json(entry)
    } catch (error) {
        console.error('[Dining Item GET Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json()
        const { title, name, type, description, image, images, order, cuisine, hours, capacity, location, features, isActive } = body

        if (!(title || name) || !image) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        const entry = await prisma.dining.update({
            where: { id: params.id },
            data: {
                title: title || name,
                type: type || 'restaurant',
                description: description || '',
                image,
                images: images ? JSON.parse(JSON.stringify(images)) : null,
                order,
                cuisine,
                hours,
                capacity,
                location,
                features,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(entry)
    } catch (error) {
        console.error('[Dining Item PUT Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.dining.delete({
            where: { id: params.id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[Dining Item DELETE Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
