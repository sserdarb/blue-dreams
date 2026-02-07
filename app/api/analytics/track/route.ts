import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    try {
        const body = await request.json()

        if (body.type === 'pageview') {
            await (prisma as any).pageView.create({
                data: {
                    path: body.path || '/',
                    locale: body.locale || 'tr',
                    referrer: body.referrer || null,
                    device: body.device || 'unknown',
                    browser: body.browser || 'unknown',
                    sessionId: body.sessionId || null,
                    userAgent: request.headers.get('user-agent') || null,
                }
            })
            return NextResponse.json({ ok: true })
        }

        if (body.type === 'duration') {
            // Update the latest pageview for this session/path with duration
            const latestView = await (prisma as any).pageView.findFirst({
                where: {
                    sessionId: body.sessionId,
                    path: body.path
                },
                orderBy: { createdAt: 'desc' }
            })

            if (latestView) {
                await (prisma as any).pageView.update({
                    where: { id: latestView.id },
                    data: { duration: body.duration || 0 }
                })
            }
            return NextResponse.json({ ok: true })
        }

        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    } catch (error) {
        console.error('Analytics track error:', error)
        return NextResponse.json({ ok: true }) // Don't break user experience
    }
}
