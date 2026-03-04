import { NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

export async function GET() {
    try {
        // Use Elektra reservation data as the real CRM data source
        const today = new Date()
        const yearStart = new Date(today.getFullYear(), 0, 1)
        const fromStr = yearStart.toISOString().split('T')[0]
        const toStr = today.toISOString().split('T')[0]

        let totalGuests = 0
        let totalRevenue = 0
        let totalStays = 0
        let loyalGuests = 0
        let highSpenders = 0
        let churnRisk = 0

        try {
            const reservations = await ElektraService.getReservations(fromStr, toStr, 'Reservation')
            const rates = await ElektraService.getExchangeRates()

            // Unique guest tracking
            const guestMap = new Map<string, { stays: number; revenue: number; lastDate: string }>()

            for (const r of reservations) {
                const key = `${r.name || ''}_${r.surname || ''}_${r.country || ''}`.toLowerCase()
                const existing = guestMap.get(key)
                const revEur = r.currency === 'EUR' ? r.totalPrice :
                    r.currency === 'USD' ? r.totalPrice * (rates.EUR_TO_TRY / rates.USD_TO_TRY) :
                        r.totalPrice / rates.EUR_TO_TRY

                if (existing) {
                    existing.stays += 1
                    existing.revenue += revEur
                    if (r.checkIn > existing.lastDate) existing.lastDate = r.checkIn
                } else {
                    guestMap.set(key, { stays: 1, revenue: revEur, lastDate: r.checkIn })
                }
                totalRevenue += revEur
                totalStays += 1
            }

            totalGuests = guestMap.size

            // Segment calculation
            const sixMonthsAgo = new Date()
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
            const sixMonthsStr = sixMonthsAgo.toISOString().split('T')[0]

            for (const [, g] of guestMap) {
                if (g.stays >= 3) loyalGuests++
                if (g.revenue > 5000) highSpenders++
                if (g.lastDate < sixMonthsStr && g.stays > 1) churnRisk++
            }
        } catch (err) {
            console.error('[CRM Overview] Elektra fetch error:', err)
        }

        return NextResponse.json({
            stats: {
                totalGuests,
                totalRevenue: Math.round(totalRevenue),
                totalStays,
                avgRevenuePerGuest: totalGuests > 0 ? (totalRevenue / totalGuests).toFixed(2) : 0,
            },
            segments: {
                loyalGuests,
                churnRisk,
                highSpenders,
            },
            funnel: [
                { step: 'Toplam Misafir', count: totalGuests },
                { step: 'Tekrar Gelen', count: loyalGuests },
                { step: 'Yüksek Harcama', count: highSpenders },
                { step: 'Kayıp Riski', count: churnRisk },
            ],
            recentCampaigns: []
        })
    } catch (e: any) {
        console.error('[CRM Overview]', e)
        return NextResponse.json({ error: 'Failed to load overview data' }, { status: 500 })
    }
}
