import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const posts = await prisma.socialMediaPost.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(posts)
    } catch (error) {
        console.error('Error fetching social posts:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
