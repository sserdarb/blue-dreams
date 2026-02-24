import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const departments = await prisma.department.findMany({ orderBy: { order: 'asc' }, include: { _count: { select: { tasks: true } } } })
        return NextResponse.json(departments)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, color, icon, order } = await request.json()
        if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
        const dept = await prisma.department.create({ data: { name, color: color || '#3b82f6', icon: icon || 'building', order: order || 0 } })
        return NextResponse.json(dept)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { id, name, color, icon, order } = await request.json()
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
        const dept = await prisma.department.update({ where: { id }, data: { name, color, icon, order } })
        return NextResponse.json(dept)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { id } = await request.json()
        await prisma.department.delete({ where: { id } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
