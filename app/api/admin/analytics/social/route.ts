import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Meta Graph API + Demo Data Service ─────────────────────────────────
const META_API_VERSION = 'v19.0'
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`

// ─── Demo data for when real API is unavailable ─────────────────────────
function getDemoData() {
    return {
        success: true,
        demo: true,
        data: {
            facebook: {
                followers: 28450,
                newLikes: 342,
                engagement: 1856
            },
            instagram: {
                username: 'bluedreamsresort',
                followers: 45200,
                posts: 892,
                recentEngagement: 12340
            }
        }
    }
}

async function isDemoMode(): Promise<boolean> {
    if (process.env.DEMO_MODE_SOCIAL === 'true') return true
    try {
        const db = prisma as any
        const setting = await db.siteSetting?.findUnique?.({ where: { key: 'demo_mode_social' } })
        return setting?.value === 'true'
    } catch { return false }
}

export async function GET(request: Request) {
    try {
        // Check demo mode
        const { searchParams } = new URL(request.url)
        if (searchParams.get('demo') === 'true' || await isDemoMode()) {
            return NextResponse.json(getDemoData())
        }

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

        const results: { facebook: any, instagram: any, error?: string } = {
            facebook: null,
            instagram: null,
        }

        // 1. Fetch Facebook Page Data (removed 'engagement' field — unsupported for page tokens)
        if (fbPageId) {
            const fbResponse = await fetch(
                `${BASE_URL}/${fbPageId}?fields=fan_count,followers_count,new_like_count,talking_about_count&access_token=${accessToken}`
            )

            if (fbResponse.ok) {
                const fbData = await fbResponse.json()
                results.facebook = {
                    followers: fbData.followers_count || fbData.fan_count || 0,
                    newLikes: fbData.new_like_count || 0,
                    engagement: fbData.talking_about_count || 0
                }
            } else {
                const errData = await fbResponse.json()
                console.warn('[Meta API] FB error:', errData.error?.message)
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
                console.warn('[Meta API] IG error:', errData.error?.message)
                if (!results.error) results.error = errData.error?.message || 'IG API Error'
            }
        }

        if (results.error) {
            return NextResponse.json({
                success: false,
                error: `Meta API Hatası: ${results.error}`,
                hint: 'Hata devam ederse Ayarlar > Demo Modu\'nu açabilirsiniz.'
            }, { status: 200 })
        }

        if (!results.facebook && !results.instagram) {
            return NextResponse.json({
                success: false,
                error: 'Facebook veya Instagram verisi alınamadı. ID ve Token bilgilerini kontrol edin.'
            }, { status: 200 })
        }

        return NextResponse.json({ success: true, data: results })

    } catch (error: any) {
        console.error('[Meta Graph API Route Error]', error)
        return NextResponse.json(
            { error: error.message || 'Failed to fetch Social Media data' },
            { status: 500 }
        )
    }
}
