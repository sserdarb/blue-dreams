import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const body = await request.json()
        const { title, area, capacity, height, type, image, order } = body

        const room = await prisma.meetingRoom.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(area !== undefined && { area }),
                ...(capacity !== undefined && { capacity }),
                ...(height !== undefined && { height }),
                ...(type !== undefined && { type }),
                ...(image !== undefined && { image }),
                ...(order !== undefined && { order }),
            }
        })

        return NextResponse.json(room)
    } catch (error) {
        console.error('[MeetingRooms PUT Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params

        await prisma.meetingRoom.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[MeetingRooms DELETE Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
