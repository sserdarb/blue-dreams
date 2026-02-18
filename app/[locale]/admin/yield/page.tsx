import { ElektraCache } from '@/lib/services/elektra-cache'
import YieldManagementClient from './YieldManagementClient'

export default async function YieldManagementPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    let reservations: any[] = []
    let exchangeRates: any = { EUR_TO_TRY: 38.5, USD_TO_TRY: 35.7, fetchedAt: 0 }
    let cacheStatus: any = { lastUpdated: null, isStale: true, recordCount: 0 }
    let error: string | undefined

    try {
        // Try to refresh if DB is stale, but don't block on failure
        const status = await ElektraCache.getStatus()
        if (status.isStale) {
            try {
                await ElektraCache.refresh()
            } catch {
                console.warn('[YieldPage] Cache refresh failed, using existing DB data')
            }
        }

        const currentYear = new Date().getFullYear()

        // Fetch reservations from DB cache (last 2 years)
        const from = new Date(currentYear - 1, 0, 1)
        const to = new Date(currentYear + 1, 11, 31)
        reservations = await ElektraCache.getReservations(from, to)

        // Get exchange rates from DB
        exchangeRates = await ElektraCache.getExchangeRates() || exchangeRates

        // Get updated cache status
        cacheStatus = await ElektraCache.getStatus()
    } catch (err) {
        console.error('[YieldPage] Error fetching data:', err)
        error = 'Veritabanı bağlantı hatası veya veri alınamadı.'
    }

    const currentYear = new Date().getFullYear()

    // Split into current and previous year
    const currentYearRes = reservations.filter(r => {
        const ci = r.checkIn?.slice(0, 4)
        return ci === String(currentYear)
    })
    const prevYearRes = reservations.filter(r => {
        const ci = r.checkIn?.slice(0, 4)
        return ci === String(currentYear - 1)
    })

    return (
        <div>
            <YieldManagementClient
                locale={locale}
                data={{
                    currentYear,
                    currentYearReservations: currentYearRes,
                    prevYearReservations: prevYearRes,
                    allReservations: reservations,
                    exchangeRates,
                    cacheStatus,
                }}
                error={error}
            />
        </div>
    )
}
