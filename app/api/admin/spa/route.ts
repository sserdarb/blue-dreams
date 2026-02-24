import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const locale = searchParams.get('locale') || 'tr'

        let spa = await prisma.spa.findUnique({
            where: { locale },
            include: { services: { orderBy: { order: 'asc' } } }
        })

        if (!spa) {
            spa = await prisma.spa.create({
                data: { locale },
                include: { services: true }
            })
        }

        return NextResponse.json(spa)
    } catch (error) {
        console.error('Error in Spa GET:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { locale, title, customLogo, heroImage, whatsappNumber, whatsappText, description1, description2, description3, gallery } = body

        if (!locale) {
            return new NextResponse('Locale is required', { status: 400 })
        }

        const spa = await prisma.spa.upsert({
            where: { locale },
            update: {
                title,
                customLogo,
                heroImage,
                whatsappNumber,
                whatsappText,
                description1,
                description2,
                description3,
                gallery: gallery ? JSON.stringify(gallery) : null
            },
            create: {
                locale,
                title: title || 'Spa & Wellness',
                customLogo,
                heroImage,
                whatsappNumber,
                whatsappText,
                description1,
                description2,
                description3,
                gallery: gallery ? JSON.stringify(gallery) : null
            },
            include: { services: { orderBy: { order: 'asc' } } }
        })

        return NextResponse.json(spa)
    } catch (error) {
        console.error('Error in Spa POST:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
