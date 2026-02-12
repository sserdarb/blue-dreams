import { NextRequest, NextResponse } from 'next/server'
import { ElektraService } from '@/lib/services/elektra'

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url)
        const from = url.searchParams.get('from')
        const to = url.searchParams.get('to')
        const channel = url.searchParams.get('channel')
        const status = url.searchParams.get('status')
        const search = url.searchParams.get('search')
        const dateType = url.searchParams.get('dateType') || 'sale' // 'sale' or 'checkin'
        const page = parseInt(url.searchParams.get('page') || '1')
        const limit = parseInt(url.searchParams.get('limit') || '50')

        // Default: last 30 days for sale date, or next 30 days for check-in
        const today = new Date()
        let fromDate: Date, toDate: Date

        if (from && to) {
            fromDate = new Date(from)
            toDate = new Date(to)
        } else if (dateType === 'sale') {
            fromDate = new Date(today)
            fromDate.setDate(today.getDate() - 30)
            toDate = new Date(today)
        } else {
            fromDate = new Date(today)
            toDate = new Date(today)
            toDate.setDate(today.getDate() + 90)
        }

        let reservations = dateType === 'sale'
            ? await ElektraService.getReservationsByBookingDate(fromDate, toDate)
            : await ElektraService.getReservations(fromDate, toDate, status || undefined)

        // Filter by channel
        if (channel && channel !== 'all') {
            reservations = reservations.filter(r => r.channel === channel)
        }

        // Filter by status (for sale-date based queries where status wasn't pre-filtered)
        if (status && status !== 'all' && dateType === 'sale') {
            reservations = reservations.filter(r => r.status === status)
        }

        // Search filter
        if (search) {
            const q = search.toLowerCase()
            reservations = reservations.filter(r =>
                (r.contactName || '').toLowerCase().includes(q) ||
                r.voucherNo.toLowerCase().includes(q) ||
                r.agency.toLowerCase().includes(q) ||
                r.guests.some(g => (g.name + ' ' + g.surname).toLowerCase().includes(q))
            )
        }

        // Sort by lastUpdate (sale date) descending by default
        reservations.sort((a, b) => b.lastUpdate.localeCompare(a.lastUpdate))

        // Total before pagination
        const total = reservations.length
        const totalRevenue = reservations.reduce((sum, r) => {
            return sum + (r.currency === 'TRY' ? r.totalPrice : r.totalPrice * 38)
        }, 0)

        // Channel summary
        const channelSummary: Record<string, { count: number; revenue: number }> = {}
        for (const r of reservations) {
            if (!channelSummary[r.channel]) {
                channelSummary[r.channel] = { count: 0, revenue: 0 }
            }
            channelSummary[r.channel].count++
            channelSummary[r.channel].revenue += r.currency === 'TRY' ? r.totalPrice : r.totalPrice * 38
        }

        // Paginate
        const start = (page - 1) * limit
        const paginated = reservations.slice(start, start + limit)

        return NextResponse.json({
            reservations: paginated.map(r => ({
                id: r.id,
                voucherNo: r.voucherNo,
                guestName: r.guests.length > 0
                    ? `${r.guests[0].name} ${r.guests[0].surname}`
                    : r.contactName || 'N/A',
                contactEmail: r.contactEmail,
                contactPhone: r.contactPhone,
                agency: r.agency,
                channel: r.channel,
                roomType: r.roomType,
                boardType: r.boardType,
                rateType: r.rateType,
                checkIn: r.checkIn.slice(0, 10),
                checkOut: r.checkOut.slice(0, 10),
                nights: Math.max(1, Math.ceil(
                    (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 86400000
                )),
                totalPrice: r.totalPrice,
                paidPrice: r.paidPrice,
                currency: r.currency,
                roomCount: r.roomCount,
                status: r.status,
                saleDate: r.lastUpdate.slice(0, 10),
                lastUpdate: r.lastUpdate,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalRevenue: Math.round(totalRevenue),
                channelSummary,
            }
        })
    } catch (err) {
        console.error('[API] Reservations error:', err)
        return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 })
    }
}
