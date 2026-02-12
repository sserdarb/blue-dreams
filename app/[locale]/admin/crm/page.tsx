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

    const reviews = await ElektraService.getGuestReviews(thirtyDaysAgo, today)
    const metrics = await ElektraService.getReviewResponseMetrics(thirtyDaysAgo, today)

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

            <ReviewsClient initialReviews={reviews} metrics={metrics} />
        </div>
    )
}
