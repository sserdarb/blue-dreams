// Next.js Instrumentation — runs once on server startup
// Used for Elektra PMS cache auto-refresh cron

export async function register() {
    // Only run auto-refresh in Node.js runtime (not edge)
    if (process.env.NEXT_RUNTIME === 'nodejs') {

        // --- Global Error Catcher Mechanism ---
        process.on('uncaughtException', (err) => {
            console.error('[Global Error Catcher] Uncaught Exception:', err);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('[Global Error Catcher] Unhandled Rejection at:', promise, 'reason:', reason);
        });
        // --------------------------------------

        // Delay first refresh by 10 seconds to let the server warm up
        setTimeout(async () => {
            try {
                const { ElektraCache } = await import('@/lib/services/elektra-cache')
                console.log('[Instrumentation] Starting initial Elektra cache refresh...')
                await ElektraCache.refresh()
                console.log('[Instrumentation] Initial cache refresh complete')

                // Recursive refresh to support dynamic TTL config
                const scheduleNext = async () => {
                    // Quick import here since this runs outside standard execution
                    const path = await import('path')
                    const fs = await import('fs')
                    let ttlMs = 30 * 60 * 1000 // 30 min default

                    try {
                        const CONFIG_PATH = path.join(process.cwd(), 'data', 'elektra-config.json')
                        if (fs.existsSync(CONFIG_PATH)) {
                            const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
                            if (config.ttlMinutes) ttlMs = config.ttlMinutes * 60 * 1000
                        }
                    } catch (e) { }

                    setTimeout(async () => {
                        try {
                            console.log('[Instrumentation] Auto-refreshing Elektra cache...')
                            await ElektraCache.refresh()
                            console.log('[Instrumentation] Auto-refresh complete')
                        } catch (err) {
                            console.error('[Instrumentation] Auto-refresh failed:', err)
                        } finally {
                            scheduleNext() // queue next
                        }
                    }, ttlMs)
                }

                scheduleNext()
            } catch (err) {
                console.error('[Instrumentation] Initial refresh failed:', err)
            }
        }, 10000)
    }
}
