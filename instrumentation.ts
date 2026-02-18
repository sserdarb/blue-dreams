// Next.js Instrumentation — runs once on server startup
// Used for Elektra PMS cache auto-refresh cron

export async function register() {
    // Only run auto-refresh in Node.js runtime (not edge)
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        const REFRESH_INTERVAL_MS = 30 * 60 * 1000 // 30 minutes

        // Delay first refresh by 10 seconds to let the server warm up
        setTimeout(async () => {
            try {
                const { ElektraCache } = await import('@/lib/services/elektra-cache')
                console.log('[Instrumentation] Starting initial Elektra cache refresh...')
                await ElektraCache.refresh()
                console.log('[Instrumentation] Initial cache refresh complete')

                // Set up periodic refresh
                setInterval(async () => {
                    try {
                        console.log('[Instrumentation] Auto-refreshing Elektra cache...')
                        await ElektraCache.refresh()
                        console.log('[Instrumentation] Auto-refresh complete')
                    } catch (err) {
                        console.error('[Instrumentation] Auto-refresh failed:', err)
                    }
                }, REFRESH_INTERVAL_MS)
            } catch (err) {
                console.error('[Instrumentation] Initial refresh failed:', err)
            }
        }, 10000)
    }
}
