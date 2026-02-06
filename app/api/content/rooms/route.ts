import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const locale = searchParams.get('locale') || 'tr'

    try {
        const rooms = await prisma.room.findMany({
            where: { locale },
            orderBy: { order: 'asc' }
        })
        return NextResponse.json(rooms)
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { id, features, ...data } = body

        // Ensure features is a string (JSON) if it comes as an array
        const featuresStr = Array.isArray(features) ? JSON.stringify(features) : features

        const roomData = {
            ...data,
            features: featuresStr
        }

        if (id) {
            // Update
            const room = await prisma.room.update({
                where: { id },
                data: roomData
            })
            return NextResponse.json(room)
        } else {
            // Create
            const room = await prisma.room.create({
                data: roomData
            })
            return NextResponse.json(room)
        }
    } catch (error) {
        console.error('Room API Error:', error)
        return NextResponse.json({ error: 'Failed to save room' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

    try {
        await prisma.room.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
    }
}
