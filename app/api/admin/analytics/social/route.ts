import { NextResponse } from 'next/server'

// ─── Meta Graph API Service ───────────────────────────────────────────
// Fetches social media insights (Followers, Engagement) from Facebook and Instagram
// Requires: META_ACCESS_TOKEN, FB_PAGE_ID, IG_ACCOUNT_ID in .env

const META_API_VERSION = 'v19.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

export async function GET() {
    try {
        const accessToken = process.env.META_ACCESS_TOKEN
        const fbPageId = process.env.FB_PAGE_ID
        const igAccountId = process.env.IG_ACCOUNT_ID

        if (!accessToken) {
            return NextResponse.json({
                success: true,
                data: { facebook: null, instagram: null },
                warning: 'META_ACCESS_TOKEN env değişkeni ayarlanmamış. Coolify ortam değişkenlerinden ayarlayın.'
            })
        }

        const results = {
            facebook: null as any,
            instagram: null as any,
        }

        // 1. Fetch Facebook Page Data
        if (fbPageId) {
            const fbResponse = await fetch(
                `${BASE_URL}/${fbPageId}?fields=fan_count,followers_count,engagement,new_like_count&access_token=${accessToken}`
            )

            if (fbResponse.ok) {
                const fbData = await fbResponse.json()
                results.facebook = {
                    followers: fbData.followers_count || fbData.fan_count || 0,
                    newLikes: fbData.new_like_count || 0,
                    engagement: fbData.engagement?.count || 0
                }
            } else {
                console.warn('[Meta API] Failed to fetch FB Page data', await fbResponse.text())
            }
        }

        // 2. Fetch Instagram Account Data
        if (igAccountId) {
            const igResponse = await fetch(
                `${BASE_URL}/${igAccountId}?fields=followers_count,media_count,name,profile_picture_url&access_token=${accessToken}`
            )

            if (igResponse.ok) {
                const igData = await igResponse.json()

                // Also fetch some recent media engagement to calculate an average engagement rate
                const mediaResponse = await fetch(
                    `${BASE_URL}/${igAccountId}/media?fields=like_count,comments_count&limit=10&access_token=${accessToken}`
                )

                let engagementSum = 0
                if (mediaResponse.ok) {
                    const mediaData = await mediaResponse.json()
                    engagementSum = (mediaData.data || []).reduce((acc: number, item: any) => {
                        return acc + (item.like_count || 0) + (item.comments_count || 0)
                    }, 0)
                }

                results.instagram = {
                    username: igData.name,
                    followers: igData.followers_count || 0,
                    posts: igData.media_count || 0,
                    recentEngagement: engagementSum
                }
            } else {
                console.warn('[Meta API] Failed to fetch IG Account data', await igResponse.text())
            }
        }

        if (!results.facebook && !results.instagram) {
            return NextResponse.json({
                error: 'Could not fetch data for either Facebook or Instagram. Verify your IDs and Token.'
            }, { status: 400 })
        }

        return NextResponse.json({
            success: true,
            data: results
        })

    } catch (error: any) {
        console.error('[Meta Graph API Route Error]', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch Social Media data' },
            { status: 500 }
        )
    }
}
