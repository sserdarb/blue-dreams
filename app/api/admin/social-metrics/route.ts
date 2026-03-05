import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// ─── Social Metrics API + Demo Data ────────────────────────────────────
const META_API_VERSION = 'v19.0'
const BASE = `https://graph.facebook.com/${META_API_VERSION}`

function getToken() {
    return process.env.META_ACCESS_TOKEN || ''
}

// ─── Demo data for Social Metrics ───────────────────────────────────────
function getSocialMetricsDemoData() {
    const posts = Array.from({ length: 15 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i * 2)
        const likes = 80 + Math.floor(Math.random() * 200)
        const comments = 5 + Math.floor(Math.random() * 30)
        return {
            id: `demo_${i}`, caption: ['Bodrum günbatımı 🌅', 'Havuz keyfi ☀️', 'Restoran menümüz 🍽️', 'Spa & Wellness 💆', 'Aktiviteler 🏊'][i % 5],
            type: ['IMAGE', 'CAROUSEL_ALBUM', 'VIDEO'][i % 3], mediaUrl: null,
            timestamp: d.toISOString(), likes, comments, engagement: likes + comments,
            permalink: '#'
        }
    })
    const totalEng = posts.reduce((s, p) => s + p.engagement, 0)
    return {
        success: true, demo: true,
        overview: {
            facebook: { name: 'Blue Dreams Resort', followers: 28450, fans: 27800, newLikes: 342, talkingAbout: 156, wereHere: 8920, link: '#', picture: null },
            instagram: { name: 'Blue Dreams Resort', username: 'bluedreamsresort', followers: 45200, following: 420, posts: 892, profilePicture: null, bio: 'Bodrum\'un en güzel tatil deneyimi 🌊' }
        },
        engagement: {
            rate: 3.8, avgLikes: Math.round(posts.reduce((s, p) => s + p.likes, 0) / posts.length),
            avgComments: Math.round(posts.reduce((s, p) => s + p.comments, 0) / posts.length),
            totalEngagement: totalEng,
            bestPost: posts[0],
            byType: [{ type: 'IMAGE', count: 5, avgEngagement: 180 }, { type: 'CAROUSEL_ALBUM', count: 5, avgEngagement: 220 }, { type: 'VIDEO', count: 5, avgEngagement: 310 }]
        },
        recentPosts: posts,
        fbInsights: { page_impressions: Array.from({ length: 28 }, (_, i) => ({ date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0], value: 800 + Math.floor(Math.random() * 400) })) },
        igInsights: { reach: 12400, impressions: 34500, profile_views: 2100 },
        fetchedAt: new Date().toISOString()
    }
}

import { isDemoSession } from '@/lib/demo-session'

async function isDemoMode(): Promise<boolean> {
    try {
        if (await isDemoSession()) return true
        const s = await prisma.siteSettings.findFirst()
        return s?.demoModeSocial ?? false
    } catch { return false }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    if (searchParams.get('demo') === 'true' || await isDemoMode()) {
        return NextResponse.json(getSocialMetricsDemoData())
    }

    const token = getToken()
    const fbPageId = process.env.FB_PAGE_ID
    const igAccountId = process.env.IG_ACCOUNT_ID

    if (!token) {
        return NextResponse.json({
            success: false,
            error: 'META_ACCESS_TOKEN tanımlı değil. Coolify ortam değişkenlerini kontrol edin.'
        }, { status: 200 })
    }

    const result: any = {
        overview: { instagram: null, facebook: null },
        engagement: { rate: 0, trend: [] },
        recentPosts: [],
        audienceInsights: null,
        fetchedAt: new Date().toISOString()
    }

    try {
        // ─── 1. Facebook Page Metrics ──────────────────────────────────
        if (fbPageId) {
            try {
                const fbRes = await fetch(
                    `${BASE}/${fbPageId}?fields=name,fan_count,followers_count,new_like_count,talking_about_count,were_here_count,link,picture&access_token=${token}`
                )
                if (fbRes.ok) {
                    const fb = await fbRes.json()
                    result.overview.facebook = {
                        name: fb.name,
                        followers: fb.followers_count || fb.fan_count || 0,
                        fans: fb.fan_count || 0,
                        newLikes: fb.new_like_count || 0,
                        talkingAbout: fb.talking_about_count || 0,
                        wereHere: fb.were_here_count || 0,
                        link: fb.link,
                        picture: fb.picture?.data?.url
                    }
                } else {
                    const e = await fbRes.json()
                    result.overview.facebook = { error: e.error?.message || 'FB API hatası' }
                }
            } catch (e: any) {
                result.overview.facebook = { error: e.message }
            }

            // FB Page Insights (28 days)
            try {
                const insRes = await fetch(
                    `${BASE}/${fbPageId}/insights?metric=page_impressions,page_engaged_users,page_post_engagements,page_fans&period=day&date_preset=last_28d&access_token=${token}`
                )
                if (insRes.ok) {
                    const ins = await insRes.json()
                    const metrics: any = {}
                    for (const entry of (ins.data || [])) {
                        metrics[entry.name] = entry.values?.map((v: any) => ({
                            date: v.end_time?.split('T')[0],
                            value: v.value
                        })) || []
                    }
                    result.fbInsights = metrics
                }
            } catch (_) { /* FB insights may fail for non-page tokens */ }
        }

        // ─── 2. Instagram Account Metrics ──────────────────────────────
        if (igAccountId) {
            try {
                const igRes = await fetch(
                    `${BASE}/${igAccountId}?fields=name,username,followers_count,follows_count,media_count,profile_picture_url,biography&access_token=${token}`
                )
                if (igRes.ok) {
                    const ig = await igRes.json()
                    result.overview.instagram = {
                        name: ig.name,
                        username: ig.username,
                        followers: ig.followers_count || 0,
                        following: ig.follows_count || 0,
                        posts: ig.media_count || 0,
                        profilePicture: ig.profile_picture_url,
                        bio: ig.biography
                    }
                } else {
                    const e = await igRes.json()
                    result.overview.instagram = { error: e.error?.message || 'IG API hatası' }
                }
            } catch (e: any) {
                result.overview.instagram = { error: e.message }
            }

            // IG Insights (28 days)
            try {
                const insRes = await fetch(
                    `${BASE}/${igAccountId}/insights?metric=reach,impressions,profile_views,follower_count&period=day&metric_type=total_value&access_token=${token}`
                )
                if (insRes.ok) {
                    const ins = await insRes.json()
                    const metrics: any = {}
                    for (const entry of (ins.data || [])) {
                        metrics[entry.name] = entry.total_value?.value || entry.values?.map((v: any) => ({
                            date: v.end_time?.split('T')[0],
                            value: v.value
                        })) || 0
                    }
                    result.igInsights = metrics
                }
            } catch (_) { /* IG insights may require business account */ }

            // ─── 3. Recent Posts with Engagement ──────────────────────────
            try {
                const mediaRes = await fetch(
                    `${BASE}/${igAccountId}/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=25&access_token=${token}`
                )
                if (mediaRes.ok) {
                    const mediaData = await mediaRes.json()
                    const posts = (mediaData.data || []).map((p: any) => ({
                        id: p.id,
                        caption: p.caption?.substring(0, 120) || '',
                        type: p.media_type,
                        mediaUrl: p.media_url || p.thumbnail_url,
                        timestamp: p.timestamp,
                        likes: p.like_count || 0,
                        comments: p.comments_count || 0,
                        engagement: (p.like_count || 0) + (p.comments_count || 0),
                        permalink: p.permalink
                    }))

                    result.recentPosts = posts

                    // Calculate engagement metrics
                    const totalEngagement = posts.reduce((s: number, p: any) => s + p.engagement, 0)
                    const avgEngagement = posts.length > 0 ? totalEngagement / posts.length : 0
                    const followers = result.overview.instagram?.followers || 1
                    const engagementRate = (avgEngagement / followers) * 100

                    result.engagement = {
                        rate: Math.round(engagementRate * 100) / 100,
                        avgLikes: Math.round(posts.reduce((s: number, p: any) => s + p.likes, 0) / Math.max(posts.length, 1)),
                        avgComments: Math.round(posts.reduce((s: number, p: any) => s + p.comments, 0) / Math.max(posts.length, 1)),
                        totalEngagement,
                        bestPost: posts.length > 0 ? posts.reduce((best: any, p: any) => p.engagement > best.engagement ? p : best, posts[0]) : null,
                        byType: calculateByType(posts)
                    }
                }
            } catch (_) { /* Media fetch may fail */ }
        }

        result.success = true
        return NextResponse.json(result)

    } catch (error: any) {
        console.error('[Social Metrics API Error]', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Internal Server Error' },
            { status: 500 }
        )
    }
}

function calculateByType(posts: any[]) {
    const types: Record<string, { count: number; totalEng: number }> = {}
    for (const p of posts) {
        const t = p.type || 'UNKNOWN'
        if (!types[t]) types[t] = { count: 0, totalEng: 0 }
        types[t].count++
        types[t].totalEng += p.engagement
    }
    return Object.entries(types).map(([type, data]) => ({
        type,
        count: data.count,
        avgEngagement: Math.round(data.totalEng / data.count)
    }))
}
