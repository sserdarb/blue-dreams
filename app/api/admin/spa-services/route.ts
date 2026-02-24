import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { spaId, locale, title, description, image, order, isActive } = body

        if (!spaId || !locale || !title) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        const service = await prisma.spaService.create({
            data: {
                spaId,
                locale,
                title,
                description,
                image,
                order: order || 0,
                isActive: isActive ?? true
            }
        })

        return NextResponse.json(service)
    } catch (error) {
        console.error('Error creating Spa Service:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
