import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json()
        const { title, description, image, icon, images, isActive, order } = body
        const { id } = await params

        if (!title || !description || !image) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        const sport = await prisma.sport.update({
            where: { id },
            data: {
                title,
                description,
                image,
                icon,
                images: images ? JSON.stringify(images) : null,
                isActive,
                order
            }
        })

        return NextResponse.json(sport)
    } catch (error) {
        console.error('Error updating sport:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.sport.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting sport:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
