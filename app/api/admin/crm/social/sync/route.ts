import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Meta Graph API → SocialMessage Sync ──────────────────────────
// Fetches Instagram DMs and Facebook conversations from Meta Graph API
// and upserts them into the SocialMessage table for the unified inbox

export async function POST(request: Request) {
    try {
        const META_TOKEN = process.env.META_ACCESS_TOKEN
        const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID
        const FB_PAGE_ID = process.env.FB_PAGE_ID

        if (!META_TOKEN) {
            return NextResponse.json({
                success: false,
                error: 'META_ACCESS_TOKEN tanımlı değil'
            }, { status: 200 })
        }

        const results = { instagram: 0, facebook: 0, errors: [] as string[] }

        // ── 1. Instagram DMs (via Instagram Conversations API) ──
        if (IG_ACCOUNT_ID) {
            try {
                // Get conversations
                const convoRes = await fetch(
                    `https://graph.facebook.com/v19.0/${IG_ACCOUNT_ID}/conversations?fields=participants,messages.limit(10){id,message,from,created_time}&access_token=${META_TOKEN}`
                )

                if (convoRes.ok) {
                    const convoData = await convoRes.json()
                    const conversations = convoData.data || []

                    for (const convo of conversations) {
                        const messages = convo.messages?.data || []
                        for (const msg of messages) {
                            const senderName = msg.from?.name || msg.from?.username || 'Instagram User'
                            const senderId = msg.from?.id || ''
                            const isFromPage = senderId === IG_ACCOUNT_ID

                            // Upsert — don't duplicate
                            await prisma.socialMessage.upsert({
                                where: { waMessageId: msg.id },
                                update: {},
                                create: {
                                    waMessageId: msg.id,
                                    platform: 'instagram',
                                    socialId: senderId,
                                    direction: isFromPage ? 'outbound' : 'inbound',
                                    type: 'text',
                                    content: msg.message || '',
                                    metadata: JSON.stringify({ senderName }),
                                    status: 'delivered',
                                    isFromGuest: !isFromPage,
                                    createdAt: msg.created_time ? new Date(msg.created_time) : new Date(),
                                }
                            })
                            results.instagram++
                        }
                    }
                } else {
                    const errText = await convoRes.text()
                    results.errors.push(`Instagram DM: ${errText.substring(0, 200)}`)
                }
            } catch (err: any) {
                results.errors.push(`Instagram: ${err.message}`)
            }
        }

        // ── 2. Facebook Page Conversations ──
        if (FB_PAGE_ID) {
            try {
                const convoRes = await fetch(
                    `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/conversations?fields=participants,messages.limit(10){id,message,from,created_time}&access_token=${META_TOKEN}`
                )

                if (convoRes.ok) {
                    const convoData = await convoRes.json()
                    const conversations = convoData.data || []

                    for (const convo of conversations) {
                        const messages = convo.messages?.data || []
                        for (const msg of messages) {
                            const senderName = msg.from?.name || 'Facebook User'
                            const senderId = msg.from?.id || ''
                            const isFromPage = senderId === FB_PAGE_ID

                            await prisma.socialMessage.upsert({
                                where: { waMessageId: msg.id },
                                update: {},
                                create: {
                                    waMessageId: msg.id,
                                    platform: 'facebook',
                                    socialId: senderId,
                                    direction: isFromPage ? 'outbound' : 'inbound',
                                    type: 'text',
                                    content: msg.message || '',
                                    metadata: JSON.stringify({ senderName }),
                                    status: 'delivered',
                                    isFromGuest: !isFromPage,
                                    createdAt: msg.created_time ? new Date(msg.created_time) : new Date(),
                                }
                            })
                            results.facebook++
                        }
                    }
                } else {
                    const errText = await convoRes.text()
                    results.errors.push(`Facebook DM: ${errText.substring(0, 200)}`)
                }
            } catch (err: any) {
                results.errors.push(`Facebook: ${err.message}`)
            }
        }

        return NextResponse.json({
            success: true,
            synced: results,
            message: `Instagram: ${results.instagram} mesaj, Facebook: ${results.facebook} mesaj senkronize edildi`
        })
    } catch (error: any) {
        console.error('[Inbox Sync] Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// GET — Check sync status
export async function GET() {
    try {
        const [total, platforms] = await Promise.all([
            prisma.socialMessage.count(),
            prisma.socialMessage.groupBy({
                by: ['platform'],
                _count: true,
                orderBy: { _count: { platform: 'desc' } }
            })
        ])

        const lastSync = await prisma.socialMessage.findFirst({
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true, platform: true }
        })

        return NextResponse.json({
            success: true,
            totalMessages: total,
            byPlatform: Object.fromEntries(platforms.map(p => [p.platform, p._count])),
            lastSync: lastSync?.createdAt
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
