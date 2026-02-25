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
        console.error('[Public MeetingRooms Error]', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
