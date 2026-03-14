export const dynamic = 'force-dynamic'

import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'
import { ElektraService } from '@/lib/services/elektra'
import ExtrasClient from './ExtrasClient'

export default async function ExtrasPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>
    searchParams: Promise<{ month?: string }>
}) {
    const { locale } = await params
    const resolvedSearchParams = await searchParams
    const monthParam = resolvedSearchParams.month

    let startDate: Date
    let endDate: Date

    if (monthParam) {
        const [yearStr, monthStr] = monthParam.split('-')
        const y = parseInt(yearStr, 10)
        let m = parseInt(monthStr, 10) - 1 // 0-indexed month
        startDate = new Date(y, m, 1)
        endDate = new Date(y, m + 1, 0)
    } else {
        const today = new Date()
        startDate = new Date(today.getFullYear(), today.getMonth(), 1) // Start of month
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0) // End of month
    }

    let spaData: any[] = []
    let minibarData: any[] = []
    let restaurantData: any[] = []
    let error: string | undefined

    try {
        [spaData, minibarData, restaurantData] = await Promise.all([
            ElektraService.getSpaRevenue(startDate, endDate),
            ElektraService.getMinibarRevenue(startDate, endDate),
            ElektraService.getRestaurantExtras(startDate, endDate)
        ])
    } catch (err) {
        console.error('[ExtrasPage] Error fetching data:', err)
        error = 'Elektra PMS bağlantı hatası veya veri alınamadı.'
    }

    const t = getAdminTranslations(locale as AdminLocale)

    // Current selected month to pass to MonthPicker (YYYY-MM format)
    const currentMonth = monthParam || `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`

    return (
        <div className="max-w-6xl mx-auto">
            <ExtrasClient
                spaData={spaData}
                minibarData={minibarData}
                restaurantData={restaurantData}
                translations={t}
                error={error}
                currentMonth={currentMonth}
            />
        </div>
    )
}
