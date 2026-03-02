import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    // 1. Cron Authorization (Optional but recommended)
    const authHeader = req.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const now = new Date()
        // 2. Find eligible posts
        const scheduledPosts = await prisma.socialMediaPost.findMany({
            where: {
                status: 'scheduled',
                scheduledFor: {
                    lte: now
                }
            }
        })

        if (scheduledPosts.length === 0) {
            return NextResponse.json({ success: true, message: 'No scheduled posts to publish.', publishedCount: 0 })
        }

        const FB_PAGE_ID = process.env.FB_PAGE_ID
        const IG_ACCOUNT_ID = process.env.IG_ACCOUNT_ID
        const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN

        if (!META_ACCESS_TOKEN || (!FB_PAGE_ID && !IG_ACCOUNT_ID)) {
            console.error('Missing Meta API credentials.')
            return NextResponse.json({ error: 'Missing Meta API credentials' }, { status: 500 })
        }

        const results = []

        // 3. Process each post
        for (const post of scheduledPosts) {
            let isSuccess = false
            let fbPostId = null
            let igMediaId = null

            let imageUrls: string[] = []
            try { imageUrls = JSON.parse(post.mediaUrls) } catch (e) { }

            // Defaulting to the first image. Graph API supports carousels but single image is safer for basic implementation.
            const primaryImageUrl = imageUrls.length > 0 ? getAbsoluteUrl(imageUrls[0], req) : null

            if (!primaryImageUrl) {
                // Cannot post empty media to IG, flag as failed.
                await prisma.socialMediaPost.update({
                    where: { id: post.id },
                    data: { status: 'failed', content: post.content + '\n\n[HATA: Görsel URL bulunamadı.]' }
                })
                results.push({ id: post.id, status: 'failed', reason: 'No Image URL' })
                continue
            }

            const isVideo = primaryImageUrl.toLowerCase().endsWith('.mp4') || primaryImageUrl.toLowerCase().endsWith('.mov')

            try {
                // --- 3a. Publish to Facebook Page ---
                if (FB_PAGE_ID) {
                    const fbEndpoint = isVideo
                        ? `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/videos`
                        : `https://graph.facebook.com/v19.0/${FB_PAGE_ID}/photos`

                    const fbBody = isVideo
                        ? { file_url: primaryImageUrl, description: post.content, access_token: META_ACCESS_TOKEN }
                        : { url: primaryImageUrl, message: post.content, access_token: META_ACCESS_TOKEN }

                    const fbRes = await fetch(fbEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(fbBody)
                    })

                    const fbData = await fbRes.json()
                    if (!fbRes.ok) throw new Error(`Facebook Error: ${fbData.error?.message}`)
                    fbPostId = fbData.id
                    isSuccess = true
                }

                // --- 3b. Publish to Instagram ---
                if (IG_ACCOUNT_ID) {
                    // Instagram requires a 2-step process: Create Media Container -> Publish Container
                    const containerEndpoint = `https://graph.facebook.com/v19.0/${IG_ACCOUNT_ID}/media`

                    let containerBody: any = {
                        caption: post.content,
                        access_token: META_ACCESS_TOKEN
                    }

                    if (isVideo) {
                        containerBody.media_type = 'VIDEO'
                        containerBody.video_url = primaryImageUrl
                    } else {
                        containerBody.image_url = primaryImageUrl
                    }

                    const containerRes = await fetch(containerEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(containerBody)
                    })

                    const containerData = await containerRes.json()
                    if (!containerRes.ok) throw new Error(`IG Container Error: ${containerData.error?.message}`)
                    const creationId = containerData.id

                    if (creationId) {
                        // Step 2: Publish
                        const publishEndpoint = `https://graph.facebook.com/v19.0/${IG_ACCOUNT_ID}/media_publish`
                        const publishRes = await fetch(publishEndpoint, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ creation_id: creationId, access_token: META_ACCESS_TOKEN })
                        })

                        const publishData = await publishRes.json()
                        if (!publishRes.ok) throw new Error(`IG Publish Error: ${publishData.error?.message}`)
                        igMediaId = publishData.id
                        isSuccess = true
                    }
                }

                // 4. Update Database Status
                if (isSuccess) {
                    await prisma.socialMediaPost.update({
                        where: { id: post.id },
                        data: { status: 'published' }
                    })
                    results.push({ id: post.id, status: 'published', fbPostId, igMediaId })
                } else {
                    throw new Error('No social networks configured.')
                }

            } catch (error: any) {
                console.error(`Post failed [${post.id}]:`, error.message)
                await prisma.socialMediaPost.update({
                    where: { id: post.id },
                    data: { status: 'failed', content: post.content + `\n\n[HATA: ${error.message}]` }
                })
                results.push({ id: post.id, status: 'failed', reason: error.message })
            }
        }

        return NextResponse.json({ success: true, publishedCount: results.length, results })

    } catch (error: any) {
        console.error('CRON Social Publish Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Helper to ensure URLs are absolute for Facebook API
function getAbsoluteUrl(url: string, req: NextRequest) {
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    // Use host from request to construct absolute URL
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const host = req.headers.get('host')
    return `${protocol}://${host}${url.startsWith('/') ? '' : '/'}${url}`
}
