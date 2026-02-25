import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const locale = searchParams.get('locale') || 'tr'

        const rooms = await prisma.meetingRoom.findMany({
            where: { locale },
            orderBy: { order: 'asc' },
        })

        return NextResponse.json(rooms)
    } catch (error) {
        console.error('[MeetingRooms GET Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { title, area, capacity, height, type, image, locale, order } = body

        if (!title || !locale) {
            return new NextResponse('Missing required fields (title, locale)', { status: 400 })
        }

        const room = await prisma.meetingRoom.create({
            data: {
                title: title,
                area: area || '',
                capacity: capacity || '',
                height: height || '',
                type: type || 'meeting',
                image: image || '',
                locale,
                order: order || 0,
            }
        })

        return NextResponse.json(room)
    } catch (error) {
        console.error('[MeetingRooms POST Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
