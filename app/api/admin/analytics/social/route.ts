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

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error: any) {
        console.error('[Social Metrics API]', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
