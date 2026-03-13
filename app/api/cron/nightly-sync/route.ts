import { NextResponse } from 'next/server'
import { invalidateAllCaches } from '@/lib/utils/api-cache'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
    // 1. Cron Authorization
    const authHeader = req.headers.get('authorization')
    if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[CRON] ═══════════════════════════════════════════')
    console.log('[CRON] Nightly WIPE & REWRITE started at', new Date().toISOString())
    const startMs = Date.now()

    const results: Record<string, { success: boolean; duration?: number; error?: string; details?: string }> = {}

    // ─── Step 1: Invalidate all in-memory API caches ───
    invalidateAllCaches()
    results.cacheInvalidation = { success: true, duration: 0 }

    // ─── Step 2: Wipe API-sourced DB tables ───
    try {
        const wipeStart = Date.now()

        const [
            deletedCompetitorPrices,
            deletedSocialDailyMetrics,
            deletedSocialPostMetrics,
            deletedBodrumEvents,
            deletedBodrumInfo,
            deletedElektraGuests,
        ] = await Promise.all([
            prisma.competitorPrice.deleteMany({}),
            prisma.socialDailyMetric.deleteMany({}),
            prisma.socialPostMetric.deleteMany({}),
            prisma.bodrumEvent.deleteMany({}),
            prisma.bodrumInfo.deleteMany({}),
            prisma.guestProfile.deleteMany({ where: { source: 'elektra' } }),
        ])

        const wipeSummary = [
            `CompetitorPrice: ${deletedCompetitorPrices.count}`,
            `SocialDailyMetric: ${deletedSocialDailyMetrics.count}`,
            `SocialPostMetric: ${deletedSocialPostMetrics.count}`,
            `BodrumEvent: ${deletedBodrumEvents.count}`,
            `BodrumInfo: ${deletedBodrumInfo.count}`,
            `GuestProfile(elektra): ${deletedElektraGuests.count}`,
        ].join(', ')

        results.dbWipe = {
            success: true,
            duration: Date.now() - wipeStart,
            details: wipeSummary
        }
        console.log(`[CRON] ✓ DB wipe completed: ${wipeSummary} in ${results.dbWipe.duration}ms`)
    } catch (error: any) {
        results.dbWipe = { success: false, error: error.message }
        console.error('[CRON] ✗ DB wipe failed:', error.message)
    }

    // ─── Step 3: Elektra PMS Sync (DELETE + REWRITE reservations + rates) ───
    try {
        const elektraStart = Date.now()
        const { ElektraCache } = await import('@/lib/services/elektra-cache')
        await ElektraCache.refresh()
        results.elektra = { success: true, duration: Date.now() - elektraStart }
        console.log(`[CRON] ✓ Elektra sync completed in ${results.elektra.duration}ms`)
    } catch (error: any) {
        results.elektra = { success: false, error: error.message }
        console.error('[CRON] ✗ Elektra sync failed:', error.message)
    }

    // ─── Step 4: Elektra Year Archive (current + previous year) ───
    try {
        const archiveStart = Date.now()
        const { ElektraCache } = await import('@/lib/services/elektra-cache')
        const currentYear = new Date().getFullYear()
        const prevYear = currentYear - 1
        const countCurrent = await ElektraCache.refreshYear(currentYear)
        const countPrev = await ElektraCache.refreshYear(prevYear)
        results.yearArchive = {
            success: true,
            duration: Date.now() - archiveStart,
            details: `${currentYear}: ${countCurrent}, ${prevYear}: ${countPrev}`
        }
        console.log(`[CRON] ✓ Year archive: ${currentYear}=${countCurrent}, ${prevYear}=${countPrev} in ${results.yearArchive.duration}ms`)
    } catch (error: any) {
        results.yearArchive = { success: false, error: error.message }
        console.error('[CRON] ✗ Year archive failed:', error.message)
    }

    // ─── Step 5: Guest Sync (rebuild from Elektra) ───
    try {
        const guestStart = Date.now()
        const { syncGuestsFromElektra } = await import('@/lib/services/guest-sync')
        const fromDate = new Date(new Date().getFullYear() - 2, 0, 1)
        const toDate = new Date(new Date().getFullYear() + 1, 11, 31)
        const result = await syncGuestsFromElektra(fromDate, toDate)
        results.guestSync = {
            success: true,
            duration: Date.now() - guestStart,
            details: `created: ${result.created}, updated: ${result.updated}, total: ${result.total}`
        }
        console.log(`[CRON] ✓ Guest sync: ${result.created} created, ${result.updated} updated in ${results.guestSync.duration}ms`)
    } catch (error: any) {
        results.guestSync = { success: false, error: error.message }
        console.error('[CRON] ✗ Guest sync failed:', error.message)
    }

    // ─── Step 6: Competitor Analysis Refresh ───
    try {
        const compStart = Date.now()
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        await fetch(`${baseUrl}/api/admin/competitor-analysis?refresh=true`)
        results.competitors = { success: true, duration: Date.now() - compStart }
        console.log(`[CRON] ✓ Competitor analysis refreshed in ${results.competitors.duration}ms`)
    } catch (error: any) {
        results.competitors = { success: false, error: error.message }
        console.error('[CRON] ✗ Competitor analysis failed:', error.message)
    }

    // ─── Step 7: Social Media Scheduled Posts Check ───
    try {
        const socialStart = Date.now()
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
        const cronSecret = process.env.CRON_SECRET
        const headers: HeadersInit = cronSecret ? { 'Authorization': `Bearer ${cronSecret}` } : {}
        await fetch(`${baseUrl}/api/cron/social`, { headers })
        results.socialPosts = { success: true, duration: Date.now() - socialStart }
        console.log(`[CRON] ✓ Social posts checked in ${results.socialPosts.duration}ms`)
    } catch (error: any) {
        results.socialPosts = { success: false, error: error.message }
        console.error('[CRON] ✗ Social posts check failed:', error.message)
    }

    // ─── Final Summary ───
    const totalDuration = Date.now() - startMs
    const failedSteps = Object.entries(results).filter(([, r]) => !r.success).map(([k]) => k)
    console.log(`[CRON] Nightly wipe & rewrite completed in ${totalDuration}ms`)
    if (failedSteps.length > 0) {
        console.log(`[CRON] ⚠ Failed steps: ${failedSteps.join(', ')}`)
    }
    console.log('[CRON] ═══════════════════════════════════════════')

    return NextResponse.json({
        success: failedSteps.length === 0,
        timestamp: new Date().toISOString(),
        totalDurationMs: totalDuration,
        failedSteps,
        results
    })
}
