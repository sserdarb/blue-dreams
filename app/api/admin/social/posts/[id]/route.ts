import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Next.js 15
) {
    try {
        const { id } = await params
        const body = await req.json()
        const { content, mediaUrls, platforms, status, scheduledFor, errorMsg } = body

        const data: any = {}
        if (content !== undefined) data.content = content
        if (mediaUrls !== undefined) data.mediaUrls = mediaUrls // Should be stringified JSON
        if (platforms !== undefined) data.platforms = platforms // Should be stringified JSON
        if (status !== undefined) data.status = status
        if (scheduledFor !== undefined) data.scheduledFor = scheduledFor ? new Date(scheduledFor) : null
        if (errorMsg !== undefined) data.errorMsg = errorMsg

        const updated = await prisma.socialMediaPost.update({
            where: { id },
            data
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Error updating post:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        await prisma.socialMediaPost.delete({
            where: { id }
        })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting post:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
