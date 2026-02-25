import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const locale = searchParams.get('locale') || 'tr'

        // Fetch all top level menu items and include their children
        const menuItems = await prisma.menuItem.findMany({
            where: { locale, parentId: null },
            orderBy: { order: 'asc' },
            include: {
                children: {
                    orderBy: { order: 'asc' }
                }
            }
        })

        return NextResponse.json(menuItems)
    } catch (error) {
        console.error('Error fetching menu items:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { locale, label, url, target, order, parentId, isActive } = body

        if (!locale || !label || !url) {
            return new NextResponse('Missing required fields', { status: 400 })
        }

        const menuItem = await prisma.menuItem.create({
            data: {
                locale,
                label,
                url,
                target: target || '_self',
                order: order ?? 0,
                parentId: parentId || null,
                isActive: isActive ?? true
            },
            include: {
                children: true
            }
        })

        return NextResponse.json(menuItem)
    } catch (error) {
        console.error('Error creating menu item:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
