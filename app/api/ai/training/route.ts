import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all training documents
export async function GET() {
    try {
        const documents = await prisma.aiTrainingDocument.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(documents)
    } catch (error) {
        console.error('Get training documents error:', error)
        return NextResponse.json({ error: 'Failed to get documents' }, { status: 500 })
    }
}

// POST - Add new training document
export async function POST(request: NextRequest) {
    try {
        const { title, content, type, filename } = await request.json()

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
        }

        const document = await prisma.aiTrainingDocument.create({
            data: {
                title,
                content,
                type: type || 'txt',
                filename
            }
        })

        return NextResponse.json(document)
    } catch (error) {
        console.error('Create training document error:', error)
        return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
    }
}

// DELETE - Remove training document
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Document ID is required' }, { status: 400 })
        }

        await prisma.aiTrainingDocument.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete training document error:', error)
        return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
    }
}
