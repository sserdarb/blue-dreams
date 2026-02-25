import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()
        const { label, url, target, order, parentId, isActive } = body

        const menuItem = await prisma.menuItem.update({
            where: { id },
            data: {
                label,
                url,
                target,
                order,
                parentId,
                isActive
            }
        })

        return NextResponse.json(menuItem)
    } catch (error) {
        console.error('Error updating menu item:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        await prisma.menuItem.delete({
            where: { id }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error('Error deleting menu item:', error)
        return new NextResponse('Internal Error', { status: 500 })
    }
}
