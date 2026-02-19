export const dynamic = 'force-dynamic'

import { ElektraService } from '@/lib/services/elektra'
import ReviewsClient from './ReviewsClient'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'

export default async function CrmPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = getAdminTranslations(locale as AdminLocale)

    // Fetch Reviews (Last 30 days default)
    const today = new Date()
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    // Comparison Date Range (Last Year)
    const prevStart = new Date(thirtyDaysAgo)
    prevStart.setFullYear(prevStart.getFullYear() - 1)
    const prevEnd = new Date(today)
    prevEnd.setFullYear(prevEnd.getFullYear() - 1)

    let reviews: any[] = []
    let prevReviews: any[] = []
    let metrics = { total: 0, replied: 0, pending: 0, responseRate: 0, avgResponseTimeHours: 0 }
    let error: string | undefined

    try {
        [reviews, prevReviews, metrics] = await Promise.all([
            ElektraService.getGuestReviews(thirtyDaysAgo, today),
            ElektraService.getGuestReviews(prevStart, prevEnd),
            ElektraService.getReviewResponseMetrics(thirtyDaysAgo, today)
        ])
    } catch (err) {
        console.error('[CRM] Error fetching data:', err)
        error = 'Elektra PMS bağlantı hatası veya veri alınamadı.'
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Guest Relations (CRM)</h1>
                    <p className="text-slate-400">Manage guest feedback, surveys, and reputation.</p>
                </div>
                <div className="text-right text-sm text-slate-500">
                    Data Source: {ElektraService.isFullyLive ? 'Elektra Live' : 'Mock Data'}
                </div>
            </div>

            <ReviewsClient
                initialReviews={reviews}
                comparisonReviews={prevReviews}
                metrics={metrics}
                error={error}
            />
        </div>
    )
}
