export const dynamic = 'force-dynamic'

import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'
import { ElektraService } from '@/lib/services/elektra'
import ExtrasClient from './ExtrasClient'

export default async function ExtrasPage() {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1) // Start of month
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0) // End of month

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

    const t = getAdminTranslations('tr')

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Ekstra Satışlar</h1>
                    <p className="text-slate-400">Spa, Minibar ve Restoran gelirleri (Elektra PMS)</p>
                </div>
            </div>
            <ExtrasClient
                spaData={spaData}
                minibarData={minibarData}
                restaurantData={restaurantData}
                translations={t}
                error={error}
            />
        </div>
    )
}
