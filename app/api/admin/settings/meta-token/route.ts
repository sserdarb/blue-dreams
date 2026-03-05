import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET: Check current Meta token status
 * POST: Exchange a short-lived token for a long-lived one (60 days)
 *       and get a never-expiring Page Access Token
 */

export async function GET() {
    const token = process.env.META_ACCESS_TOKEN
    if (!token) {
        return NextResponse.json({ status: 'missing', message: 'META_ACCESS_TOKEN not set' })
    }

    try {
        const debugRes = await fetch(
            `https://graph.facebook.com/v19.0/debug_token?input_token=${token}&access_token=${token}`
        )
        const debugData = await debugRes.json()

        if (debugData.error) {
            return NextResponse.json({
                status: 'expired',
                error: debugData.error.message,
                suggestion: 'Token has expired. Generate a new User Access Token from Meta Business Suite (business.facebook.com > Settings > System Users) with ads_read, pages_messaging, pages_read_engagement, instagram_basic permissions, then POST it to this endpoint.'
            })
        }

        const tokenData = debugData.data || {}
        return NextResponse.json({
            status: 'valid',
            type: tokenData.type,
            app_id: tokenData.app_id,
            expires_at: tokenData.expires_at ? new Date(tokenData.expires_at * 1000).toISOString() : 'never',
            scopes: tokenData.scopes,
            is_valid: tokenData.is_valid
        })
    } catch (e: any) {
        return NextResponse.json({ status: 'error', error: e.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { token: newToken, appId, appSecret } = body

        if (!newToken) {
            return NextResponse.json({ error: 'token is required' }, { status: 400 })
        }

        // Step 1: Verify the new token works
        const verifyRes = await fetch(
            `https://graph.facebook.com/v19.0/me?access_token=${newToken}`
        )
        const verifyData = await verifyRes.json()

        if (verifyData.error) {
            return NextResponse.json({
                error: 'Token verification failed',
                details: verifyData.error.message
            }, { status: 400 })
        }

        let finalToken = newToken
        let tokenType = 'short-lived'

        // Step 2: If App credentials provided, exchange for long-lived token
        if (appId && appSecret) {
            try {
                const exchangeRes = await fetch(
                    `https://graph.facebook.com/v19.0/oauth/access_token?` +
                    `grant_type=fb_exchange_token&` +
                    `client_id=${appId}&` +
                    `client_secret=${appSecret}&` +
                    `fb_exchange_token=${newToken}`
                )
                const exchangeData = await exchangeRes.json()

                if (exchangeData.access_token) {
                    finalToken = exchangeData.access_token
                    tokenType = 'long-lived (60 days)'
                    console.log('[Meta Token] Successfully exchanged for long-lived token')
                } else {
                    console.warn('[Meta Token] Long-lived exchange failed:', exchangeData)
                }
            } catch (e) {
                console.warn('[Meta Token] Exchange error:', e)
            }
        }

        // Step 3: Try to get a never-expiring Page Access Token
        const pageId = process.env.FB_PAGE_ID
        let pageToken = null
        if (pageId) {
            try {
                const pageRes = await fetch(
                    `https://graph.facebook.com/v19.0/${pageId}?fields=access_token&access_token=${finalToken}`
                )
                const pageData = await pageRes.json()
                if (pageData.access_token) {
                    pageToken = pageData.access_token
                    console.log('[Meta Token] Got page access token')
                }
            } catch (e) {
                console.warn('[Meta Token] Page token error:', e)
            }
        }

        // Step 4: Save to SiteSettings for persistence
        const settings = await prisma.siteSettings.findFirst()
        if (settings) {
            await prisma.siteSettings.update({
                where: { id: settings.id },
                data: {
                    metaAccessToken: finalToken,
                    ...(pageToken ? { metaPageToken: pageToken } : {})
                }
            })
        }

        return NextResponse.json({
            success: true,
            tokenType,
            userId: verifyData.id,
            userName: verifyData.name,
            message: `Token saved. Type: ${tokenType}. Please also update META_ACCESS_TOKEN in your .env and Coolify env vars.`,
            newToken: finalToken,
            ...(pageToken ? { pageToken } : {})
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
