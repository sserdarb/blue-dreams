import { AccountingService } from '@/lib/services/accounting'
import AccountingClient from './AccountingClient'

export default async function AccountingPage() {
    let data: any = null
    let error: string | null = null

    try {
        const [kpis, stockResult, receiptsResult, forecastResult] = await Promise.all([
            AccountingService.getKPIs(),
            AccountingService.getStockList(),
            AccountingService.getAccountingReceipts(),
            AccountingService.getForecast(),
        ])

        data = {
            kpis,
            stock: stockResult.items,
            receipts: receiptsResult.receipts,
            forecast: forecastResult.forecast,
            dataSource: kpis.dataSource,
        }
    } catch (err) {
        console.error('[Accounting] Error fetching data:', err)
        error = 'Muhasebe verileri yüklenirken hata oluştu'
    }

    return <AccountingClient data={data} error={error} />
}
