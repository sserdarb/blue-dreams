import { NextResponse } from 'next/server'

// ─── Meta Graph API Service ───────────────────────────────────────────
// Fetches social media insights (Followers, Engagement) from Facebook and Instagram
// Requires: META_ACCESS_TOKEN, FB_PAGE_ID, IG_ACCOUNT_ID in .env

const META_API_VERSION = 'v19.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

export async function GET() {
    try {
        // Ortam değişkenleri
        const accessToken = process.env.META_ACCESS_TOKEN || "EAAeyAgqUYnQBQ5n1wczEEMUM5STILvNSAOG65uWwXbYAk100kzWsjEANi4lCmCy59qW9kGNWhlVNpufteKOzYgcbjT6UpekLI3jKLCf1JD0K0zVFjFZA5Dsm0ZCs2ZAsnufeU7qh3qOogymvQZCwtMktZBA8dd1TN8nWQp2po0w1PA6y3Er9tLbiousXZAFwyi11b8sSEBJplcRZBcZCZCVISx46mclYRcAlgZCuzw";
        const fbPageId = process.env.FB_PAGE_ID;
        const igAccountId = process.env.IG_ACCOUNT_ID;

        if (!accessToken) {
            return NextResponse.json({
                success: true,
                data: { facebook: null, instagram: null },
                warning: 'META_ACCESS_TOKEN env değişkeni ayarlanmamış. Coolify ortam değişkenlerinden ayarlayın.'
            })
        }

        const results: {
            facebook: any,
            instagram: any,
            error?: string
        } = {
            facebook: null,
            instagram: null,
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
                const errData = await fbResponse.json()
                console.warn('[Meta API] Failed to fetch FB Page data:', errData)
                results.error = errData.error?.message || 'FB API Error'
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
                const errData = await igResponse.json()
                console.warn('[Meta API] Failed to fetch IG Account data:', errData)
                if (!results.error) results.error = errData.error?.message || 'IG API Error'
            }
        }

        if (results.error) {
            return NextResponse.json({
                success: false,
                error: `Meta API Hatası: ${results.error} (Lütfen token'ınızı yenileyin)`
            }, { status: 200 })
        }

        if (!results.facebook && !results.instagram) {
            return NextResponse.json({
                success: false,
                error: 'Could not fetch data for either Facebook or Instagram. Verify your IDs and Token.'
            }, { status: 200 })
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
