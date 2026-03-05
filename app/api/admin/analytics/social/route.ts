import { NextResponse } from 'next/server'
import { MetaSocialService } from '@/lib/services/meta-social'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const action = searchParams.get('action') || 'overview'

        if (action === 'overview') {
            // Get combined social metrics
            const [igProfile, fbPage] = await Promise.all([
                MetaSocialService.getInstagramProfile(),
                MetaSocialService.getFacebookPageInfo(),
            ])

            return NextResponse.json({
                success: true,
                data: {
                    instagram: igProfile ? {
                        username: igProfile.username,
                        name: igProfile.name,
                        followers: igProfile.followers_count,
                        following: igProfile.follows_count,
                        posts: igProfile.media_count,
                        profilePicture: igProfile.profile_picture_url,
                        bio: igProfile.biography,
                    } : null,
                    facebook: fbPage ? {
                        name: fbPage.name,
                        likes: fbPage.fan_count,
                        followers: fbPage.followers_count,
                        talkingAbout: fbPage.talking_about_count,
                        recentPosts: (fbPage.posts?.data || []).map((p: any) => ({
                            message: p.message,
                            createdAt: p.created_time,
                            shares: p.shares?.count || 0,
                            likes: p.likes?.summary?.total_count || 0,
                            comments: p.comments?.summary?.total_count || 0,
                        })),
                    } : null,
                }
            })
        }

        if (action === 'instagram-media') {
            const limit = parseInt(searchParams.get('limit') || '12')
            const media = await MetaSocialService.getInstagramMedia(limit)
            return NextResponse.json({ success: true, media })
        }

        if (action === 'instagram-insights') {
            const period = (searchParams.get('period') || 'day') as 'day' | 'week' | 'days_28'
            const insights = await MetaSocialService.getInstagramInsights(period)
            return NextResponse.json({ success: true, insights })
        }

        if (action === 'facebook-insights') {
            const period = (searchParams.get('period') || 'day') as 'day' | 'week' | 'days_28'
            const insights = await MetaSocialService.getFacebookInsights(period)
            return NextResponse.json({ success: true, insights })
        }

        if (action === 'demographics') {
            const demographics = await MetaSocialService.getAudienceDemographics()
            return NextResponse.json({ success: true, demographics })
        }

        if (action === 'follower-growth') {
            const growth = await MetaSocialService.getFollowerGrowth()
            return NextResponse.json({ success: true, growth })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('[Social Metrics API]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const token = process.env.META_ACCESS_TOKEN

        if (!token) {
            return NextResponse.json({ error: 'Meta API token not configured' }, { status: 500 })
        }

        if (body.action === 'reply-comment') {
            // Reply to a comment on a post
            const { postId, message, commentId } = body
            if (!postId || !message) {
                return NextResponse.json({ error: 'postId and message required' }, { status: 400 })
            }

            // If commentId provided, reply to that specific comment
            const targetId = commentId || postId
            const res = await fetch(
                `https://graph.facebook.com/v19.0/${targetId}/comments?message=${encodeURIComponent(message)}&access_token=${token}`,
                { method: 'POST' }
            )

            if (!res.ok) {
                const err = await res.json()
                return NextResponse.json({ error: err.error?.message || 'Failed to post reply' }, { status: res.status })
            }

            const result = await res.json()
            return NextResponse.json({ success: true, commentId: result.id })
        }

        if (body.action === 'get-comments') {
            // Fetch comments for a specific post
            const { postId } = body
            if (!postId) {
                return NextResponse.json({ error: 'postId required' }, { status: 400 })
            }

            const res = await fetch(
                `https://graph.facebook.com/v19.0/${postId}/comments?fields=id,text,from,timestamp,like_count,replies{id,text,from,timestamp}&limit=50&access_token=${token}`
            )

            if (!res.ok) {
                const err = await res.json()
                return NextResponse.json({ error: err.error?.message || 'Failed to fetch comments' }, { status: res.status })
            }

            const data = await res.json()
            return NextResponse.json({ success: true, comments: data.data || [] })
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('[Social Metrics API POST]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
