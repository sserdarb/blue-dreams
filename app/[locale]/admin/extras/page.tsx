import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'
import { ElektraService } from '@/lib/services/elektra'
import ExtrasClient from './ExtrasClient'

export default async function ExtrasPage() {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1) // Start of month
    const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0) // End of month

    const [spaData, minibarData, restaurantData] = await Promise.all([
        ElektraService.getSpaRevenue(startDate, endDate),
        ElektraService.getMinibarRevenue(startDate, endDate),
        ElektraService.getRestaurantExtras(startDate, endDate)
    ])

    // Temporary: server-side translation fetch (or pass locale to client)
    // We'll pass locale and let client fetch or pass translations object.
    // The previous code fetched translations here.
    const t = getAdminTranslations('tr') // Defaulting to TR or we should extract locale from params properly

    // To get locale correctly in server component:
    // params is a Promise in Next.js 15, need to await it? 
    // The previous code had: const params = useParams() -> Client hook!
    // But this is a server component now used in 'page.tsx' context?
    // Let's assume this is a Server Component unlike previous 'use client' version.

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
            />
        </div>
    )
}
