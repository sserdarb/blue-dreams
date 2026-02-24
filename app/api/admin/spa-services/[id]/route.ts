import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { title, description, image, order, isActive } = body

        if (!title) {
            return new NextResponse('Title is required', { status: 400 })
        }

        const service = await prisma.spaService.update({
            where: { id },
            data: {
                title,
                description,
                image,
                order,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(service)
    } catch (error) {
        console.error('Error updating Spa Service:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.spaService.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting Spa Service:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
