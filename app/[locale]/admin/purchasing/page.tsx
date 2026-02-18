import { PurchasingService } from '@/lib/services/purchasing'
import PurchasingClient from './PurchasingClient'

export default async function PurchasingPage() {
    let data: any = null
    let error: string | null = null

    try {
        const [kpis, orders, vendors, inventory, priceTrends, performance] = await Promise.all([
            PurchasingService.getKPIs(),
            PurchasingService.getPurchaseOrders(),
            PurchasingService.getVendors(),
            PurchasingService.analyzeInventory(),
            PurchasingService.getPriceTrends(),
            PurchasingService.getPerformanceReport(),
        ])

        data = {
            kpis,
            orders,
            vendors,
            inventory,
            priceTrends,
            performance,
            dataSource: kpis.dataSource || 'demo',
        }
    } catch (err) {
        console.error('[Purchasing] Error fetching data:', err)
        error = 'Satın alma verileri yüklenirken hata oluştu'
    }

    return <PurchasingClient data={data} error={error} />
}
