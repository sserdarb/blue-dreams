import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { diningId, title, description, date, time, image, isActive } = body

        if (!title || !diningId) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        const entry = await prisma.diningEvent.update({
            where: { id },
            data: {
                diningId,
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
        console.error('[DiningEvent PUT Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.diningEvent.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('[DiningEvent DELETE Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
