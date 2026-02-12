// Elektra PMS Full Integration — Real API via bookingapi.elektraweb.com
// Hotel ID: 33264 (Blue Dreams Resort)

export type SalesData = {
    date: string
    web: number
    callCenter: number
    ota: number
    tourOperator: number
    direct: number
}

export type OccupancyData = {
    date: string
    occupancy: number
    adr: number
}

export type GuestDemographics = {
    country: string
    percentage: number
}

export type RoomAvailability = {
    date: string
    roomType: string
    roomTypeId: number
    availableCount: number
    basePrice: number | null
    discountedPrice: number | null
    stopsell: boolean
    vatAmount: number | null
}

export type DailyOccupancy = {
    date: string
    totalRooms: number
    availableRooms: number
    occupiedRooms: number
    occupancyRate: number
}

export type Reservation = {
    id: number
    voucherNo: string
    agency: string
    channel: string        // Grouped channel category
    boardType: string
    roomType: string
    rateType: string
    checkIn: string
    checkOut: string
    totalPrice: number
    paidPrice: number
    currency: string
    roomCount: number
    contactName: string | null
    contactEmail: string | null
    contactPhone: string | null
    lastUpdate: string
    guests: { name: string; surname: string; nationality: string }[]
    status: string
    // Enhanced Fields
    nationality: string // derived from first guest or contact
    dailyAverage: number // totalPrice / nights
    nights: number
}

export type ChannelBreakdown = {
    name: string
    value: number
    count: number
    color: string
}

export type MonthlyReport = {
    month: string
    reservationCount: number
    revenue: number
    currency: string
}

export type DepartmentRevenue = {
    date: string
    departmentId: string
    revenue: number
    currency: string
}

export type GuestReview = {
    id: number
    date: string
    guestName: string
    roomNumber: string
    rating: number // 1-5 or 1-10
    comment: string
    reply?: string
    replyDate?: string
    status: 'replied' | 'pending' | 'ignored'
    source: 'Google' | 'Booking.com' | 'TripAdvisor' | 'Survey' | 'Direct'
    language: string
    sentiment: 'positive' | 'neutral' | 'negative' // AI can fill this
}

export type SurveyResult = {
    id: number
    date: string
    score: number // NPS or CSAT
    answers: { question: string, answer: string }[]
}

// ─── Config ────────────────────────────────────────────────────
const API_BASE = 'https://bookingapi.elektraweb.com'
const HOTEL_ID = 33264
const USER_CODE = 'asis'
const PASSWORD = 'Bdr.2025'
const TOTAL_ROOMS = 370

// ─── Channel Grouping ──────────────────────────────────────────
const CHANNEL_MAP: Record<string, string> = {
    // OTA
    'BOOKING.COM': 'OTA',
    'EXPEDIA': 'OTA',
    'WEBBEDS': 'OTA',
    'HYPERGUEST': 'OTA',
    'OSTROVOK': 'OTA',
    'BEDSOPIA': 'OTA',
    'BOOKTOWORLD': 'OTA',
    // Call Center
    'CALL CENTER BDR': 'Call Center',
    'CALL CENTER TL': 'Call Center',
    'CALL CENTER EUR': 'Call Center',
    // Walk-in / Direct
    'WALKIN': 'Direkt',
    'WALKIN ': 'Direkt',
    'MUNFERIT TL': 'Direkt',
    'MUNFERIT EURO': 'Direkt',
    // Website
    'HOTELWEB TL': 'Website',
    'HOTELWEB EUR': 'Website',
}

const CHANNEL_COLORS: Record<string, string> = {
    'OTA': '#f59e0b',
    'Call Center': '#0ea5e9',
    'Tur Operatörü': '#8b5cf6',
    'Direkt': '#10b981',
    'Website': '#ec4899',
}

function getChannel(agency: string): string {
    const upper = (agency || '').trim().toUpperCase()
    if (CHANNEL_MAP[upper]) return CHANNEL_MAP[upper]
    if (CHANNEL_MAP[agency?.trim()]) return CHANNEL_MAP[agency.trim()]
    return 'Tur Operatörü'
}

// ─── JWT Token Cache ───────────────────────────────────────────
let cachedJwt: string | null = null
let jwtExpiresAt: number = 0

async function getJwt(): Promise<string> {
    if (cachedJwt && Date.now() < jwtExpiresAt - 3600000) {
        return cachedJwt
    }

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'hotel-id': HOTEL_ID,
                'usercode': USER_CODE,
                'password': PASSWORD
            }),
            cache: 'no-store'
        })

        if (!res.ok) {
            console.error('[Elektra] Login failed:', res.status)
            throw new Error(`Elektra login failed: ${res.status}`)
        }

        const data = await res.json()
        if (!data.success || !data.jwt) {
            throw new Error('Elektra login: no JWT received')
        }

        cachedJwt = data.jwt
        jwtExpiresAt = Date.now() + 12 * 60 * 60 * 1000
        console.log('[Elektra] JWT obtained successfully')
        return cachedJwt!
    } catch (err) {
        console.error('[Elektra] Login error:', err)
        throw err
    }
}

// ─── Real API Calls ────────────────────────────────────────────

async function fetchAvailability(fromDate: string, toDate: string, currency: string = 'TRY'): Promise<RoomAvailability[]> {
    const jwt = await getJwt()

    const url = new URL(`${API_BASE}/hotel/${HOTEL_ID}/availability`)
    url.searchParams.set('currency', currency)
    url.searchParams.set('fromdate', fromDate)
    url.searchParams.set('todate', toDate)
    url.searchParams.set('adult', '2')
    url.searchParams.set('child', '0')

    const res = await fetch(url.toString(), {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        next: { revalidate: 300 }
    })

    if (!res.ok) {
        console.error('[Elektra] Availability fetch failed:', res.status)
        return []
    }

    const raw = await res.json()
    return raw.map((item: Record<string, unknown>) => ({
        date: item['date'] as string,
        roomType: item['room-type'] as string,
        roomTypeId: item['room-type-id'] as number,
        availableCount: item['available-room-count'] as number,
        basePrice: item['base-price'] as number | null,
        discountedPrice: item['discounted-price'] as number | null,
        stopsell: item['stopsell'] as boolean,
        vatAmount: item['vat-amount'] as number | null,
    }))
}

async function fetchReservations(fromDate: string, toDate: string, status: string = 'Reservation'): Promise<Reservation[]> {
    const jwt = await getJwt()

    // Date format: yyyy-MM-dd (simple date works)
    const url = `${API_BASE}/hotel/${HOTEL_ID}/reservation-list?from-check-in=${fromDate}&to-check-in=${toDate}&reservation-status=${encodeURIComponent(status)}`

    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
        },
        next: { revalidate: 300 }
    })

    if (!res.ok) {
        console.error('[Elektra] Reservation fetch failed:', res.status)
        return []
    }

    const raw = await res.json()
    if (!Array.isArray(raw)) return []

    return raw.map((item: Record<string, unknown>) => {
        const checkIn = (item['check-in-date'] as string) || ''
        const checkOut = (item['check-out-date'] as string) || ''
        const totalPrice = (item['reservation-total-price'] as number) || 0

        // Calculate nights
        const d1 = new Date(checkIn)
        const d2 = new Date(checkOut)
        const nights = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))
        const dailyAverage = totalPrice / nights

        // Guests & Nationality
        const guests = ((item['guest-list'] as Array<Record<string, string>>) || []).map(g => ({
            name: g['name'] || '',
            surname: g['surname'] || '',
            nationality: g['nationality'] || g['country'] || 'Unknown'
        }))

        const firstGuestNationality = guests.length > 0 ? guests[0].nationality : 'Unknown'

        return {
            id: item['reservation-id'] as number,
            voucherNo: (item['voucher-no'] as string) || '',
            agency: (item['agency'] as string) || 'Unknown',
            channel: getChannel(item['agency'] as string),
            boardType: (item['board-type'] as string) || '',
            roomType: (item['room-type'] as string) || '',
            rateType: (item['rate-type'] as string) || '',
            checkIn,
            checkOut,
            totalPrice,
            paidPrice: (item['reservation-paid-price'] as number) || 0,
            currency: (item['reservation-currency'] as string) || 'TRY',
            roomCount: (item['reservation-room-count'] as number) || 1,
            contactName: item['contact-name'] as string | null,
            contactEmail: item['contact-email'] as string | null,
            contactPhone: item['contact-phone'] as string | null,
            lastUpdate: (item['lastupdate-date'] as string) || '',
            guests,
            status,
            // Enhanced
            nationality: firstGuestNationality,
            nights,
            dailyAverage
        }
    })
}

function computeOccupancy(availability: RoomAvailability[]): DailyOccupancy[] {
    const byDate = new Map<string, RoomAvailability[]>()
    for (const item of availability) {
        if (!byDate.has(item.date)) byDate.set(item.date, [])
        byDate.get(item.date)!.push(item)
    }

    const result: DailyOccupancy[] = []
    for (const [date, rooms] of byDate) {
        const availableRooms = rooms.reduce((sum, r) => sum + r.availableCount, 0)
        const effectiveTotal = Math.max(TOTAL_ROOMS, availableRooms)
        const occupiedRooms = effectiveTotal - availableRooms
        const occupancyRate = Math.round((occupiedRooms / effectiveTotal) * 100)

        result.push({
            date,
            totalRooms: effectiveTotal,
            availableRooms,
            occupiedRooms: Math.max(0, occupiedRooms),
            occupancyRate: Math.max(0, Math.min(100, occupancyRate))
        })
    }

    return result.sort((a, b) => a.date.localeCompare(b.date))
}

// ─── Exported Service ──────────────────────────────────────────

export const ElektraService = {
    isDemoMode: false,
    isPartialLive: false,
    isFullyLive: true,

    // ─── Availability ───────────────────────────────────────

    async getAvailability(startDate: Date, endDate: Date, currency?: string): Promise<RoomAvailability[]> {
        const from = startDate.toISOString().split('T')[0]
        const to = endDate.toISOString().split('T')[0]
        try {
            return await fetchAvailability(from, to, currency)
        } catch (err) {
            console.error('[Elektra] Availability error:', err)
            return []
        }
    },

    async getOccupancy(startDate: Date, endDate: Date): Promise<DailyOccupancy[]> {
        const availability = await this.getAvailability(startDate, endDate)
        return computeOccupancy(availability)
    },

    async getTodayOccupancy(): Promise<{ rate: number; available: number; total: number }> {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        try {
            const occupancy = await this.getOccupancy(today, tomorrow)
            if (occupancy.length > 0) {
                return { rate: occupancy[0].occupancyRate, available: occupancy[0].availableRooms, total: occupancy[0].totalRooms }
            }
        } catch (err) {
            console.error('[Elektra] Today occupancy error:', err)
        }
        return { rate: 0, available: 0, total: TOTAL_ROOMS }
    },

    async getRoomTypeBreakdown(): Promise<{ name: string; available: number; total: number }[]> {
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        const roomTotals: Record<string, number> = {
            'Club Room': 81, 'Club Room Sea View': 136, 'Club Family Room': 58,
            'Deluxe Room': 38, 'Deluxe Family Room': 28, 'Beach Side Room': 29,
        }
        try {
            const availability = await this.getAvailability(today, tomorrow)
            const todayStr = today.toISOString().split('T')[0]
            const todayData = availability.filter(a => a.date === todayStr)
            return todayData
                .filter(a => roomTotals[a.roomType])
                .map(a => ({ name: a.roomType, available: a.availableCount, total: roomTotals[a.roomType] || a.availableCount }))
        } catch (err) {
            console.error('[Elektra] Room breakdown error:', err)
            return Object.entries(roomTotals).map(([name, total]) => ({ name, available: 0, total }))
        }
    },

    // ─── Reservations (REAL DATA) ───────────────────────────

    async getReservations(startDate: Date, endDate: Date, status?: string): Promise<Reservation[]> {
        const from = startDate.toISOString().split('T')[0]
        const to = endDate.toISOString().split('T')[0]
        const statuses = status ? [status] : ['Reservation', 'Waiting', 'InHouse', 'CheckOut']
        const all: Reservation[] = []
        for (const s of statuses) {
            try {
                const res = await fetchReservations(from, to, s)
                all.push(...res)
            } catch (err) {
                console.error(`[Elektra] Reservations (${s}) error:`, err)
            }
        }
        return all
    },

    // Fetch full season reservations (broad check-in range) — reusable across components
    async getAllSeasonReservations(): Promise<Reservation[]> {
        const today = new Date()
        // Fetch from 3 months ago to 12 months ahead to cover all active bookings
        const from = new Date(today.getFullYear(), today.getMonth() - 3, 1)
        const to = new Date(today.getFullYear() + 1, today.getMonth(), 0)
        return this.getReservations(from, to)
    },

    // Filter reservations by BOOKING/SALE date (lastUpdate), not check-in date
    // This allows seeing sales even when hotel is closed
    async getReservationsByBookingDate(salesFrom: Date, salesTo: Date): Promise<Reservation[]> {
        const allReservations = await this.getAllSeasonReservations()
        const fromStr = salesFrom.toISOString().split('T')[0]
        const toStr = salesTo.toISOString().split('T')[0]
        return allReservations.filter(r => {
            const saleDate = r.lastUpdate.slice(0, 10) // YYYY-MM-DD from ISO timestamp
            return saleDate >= fromStr && saleDate <= toStr
        })
    },

    async getRecentReservations(limit: number = 10): Promise<Reservation[]> {
        // Get most recently booked/updated reservations across all check-in dates
        const allReservations = await this.getAllSeasonReservations()
        // Sort by lastUpdate (booking/sale date) descending and take first N
        return allReservations
            .sort((a, b) => b.lastUpdate.localeCompare(a.lastUpdate))
            .slice(0, limit)
    },

    // ─── Sales & Channel Data (REAL DATA) ───────────────────
    // Sales are grouped by BOOKING/SALE DATE (lastUpdate), not check-in date
    // This way sales are visible even during off-season

    async getSalesData(salesFrom: Date, salesTo: Date): Promise<SalesData[]> {
        const reservations = await this.getReservationsByBookingDate(salesFrom, salesTo)

        // Group by sale/booking date (lastUpdate) and channel
        const byDate = new Map<string, SalesData>()
        for (const res of reservations) {
            const date = res.lastUpdate.slice(0, 10) // YYYY-MM-DD from ISO
            if (!date) continue
            if (!byDate.has(date)) {
                byDate.set(date, { date, web: 0, callCenter: 0, ota: 0, tourOperator: 0, direct: 0 })
            }
            const entry = byDate.get(date)!
            const amount = res.currency === 'TRY' ? res.totalPrice : res.totalPrice * 38 // rough EUR→TRY
            switch (res.channel) {
                case 'Website': entry.web += amount; break
                case 'Call Center': entry.callCenter += amount; break
                case 'OTA': entry.ota += amount; break
                case 'Direkt': entry.direct += amount; break
                default: entry.tourOperator += amount; break
            }
        }

        return Array.from(byDate.values()).sort((a, b) => a.date.localeCompare(b.date))
    },

    async getChannelDistribution(): Promise<ChannelBreakdown[]> {
        // Use all season reservations for channel distribution
        const reservations = await this.getAllSeasonReservations()

        // Count by channel
        const channels = new Map<string, { count: number; revenue: number }>()
        for (const res of reservations) {
            const ch = res.channel
            if (!channels.has(ch)) channels.set(ch, { count: 0, revenue: 0 })
            const entry = channels.get(ch)!
            entry.count += 1
            entry.revenue += res.currency === 'TRY' ? res.totalPrice : res.totalPrice * 38
        }

        const total = Array.from(channels.values()).reduce((sum, c) => sum + c.count, 0) || 1

        return Array.from(channels.entries())
            .map(([name, data]) => ({
                name,
                value: Math.round((data.count / total) * 100),
                count: data.count,
                color: CHANNEL_COLORS[name] || '#64748b'
            }))
            .sort((a, b) => b.count - a.count)
    },

    async getDailyStats() {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

        // Parallel fetch — occupancy + all season reservations
        const [occupancy, allReservations] = await Promise.all([
            this.getTodayOccupancy(),
            this.getAllSeasonReservations().catch(() => [] as Reservation[]),
        ])

        // Reservations SOLD today (by lastUpdate/booking date, not check-in)
        const todaySales = allReservations.filter(r => r.lastUpdate.slice(0, 10) === todayStr)

        // This month's sales (reservations booked this month)
        const monthStartStr = monthStart.toISOString().split('T')[0]
        const monthSales = allReservations.filter(r => r.lastUpdate.slice(0, 10) >= monthStartStr)

        // Monthly revenue from sales made this month
        const monthlyRevenue = monthSales.reduce((sum, r) => {
            return sum + (r.currency === 'TRY' ? r.totalPrice : r.totalPrice * 38)
        }, 0)

        // ADR = Average Daily Rate (monthly revenue / booked room nights)
        const totalRoomNights = monthSales.reduce((sum, r) => {
            const nights = Math.max(1, Math.ceil(
                (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 86400000
            ))
            return sum + nights * r.roomCount
        }, 0)
        const adr = totalRoomNights > 0 ? Math.round(monthlyRevenue / totalRoomNights) : 0

        // Today's revenue
        const todayRevenue = todaySales.reduce((sum, r) => {
            return sum + (r.currency === 'TRY' ? r.totalPrice : r.totalPrice * 38)
        }, 0)

        return {
            todaySalesCount: todaySales.length,
            todayRevenue: `₺${todayRevenue.toLocaleString('tr-TR')}`,
            totalRevenue: `₺${monthlyRevenue.toLocaleString('tr-TR')}`,
            occupancyRate: `${occupancy.rate}%`,
            occupancyAvailable: occupancy.available,
            occupancyTotal: occupancy.total,
            adr: `₺${adr.toLocaleString('tr-TR')}`,
            monthlyReservationCount: monthSales.length,
        }
    },

    async getMonthlyReport(year: number): Promise<MonthlyReport[]> {
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31)
        const reservations = await this.getReservations(startDate, endDate)

        const monthly = new Map<string, MonthlyReport>()
        for (const res of reservations) {
            const month = res.checkIn.slice(0, 7) // YYYY-MM
            if (!month) continue
            if (!monthly.has(month)) {
                monthly.set(month, { month, reservationCount: 0, revenue: 0, currency: 'TRY' })
            }
            const entry = monthly.get(month)!
            entry.reservationCount += 1
            entry.revenue += res.currency === 'TRY' ? res.totalPrice : res.totalPrice * 38
        }

        return Array.from(monthly.values()).sort((a, b) => a.month.localeCompare(b.month))
    },

    // ─── Extra Revenue (Spa, Minibar, Restaurant) ────────────────
    // Placeholder implementations as specific endpoints are not confirmed

    async getDepartmentRevenue(department: string, startDate: Date, endDate: Date): Promise<DepartmentRevenue[]> {
        // Mock data logic for now
        const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        const data: DepartmentRevenue[] = []

        for (let i = 0; i <= days; i++) {
            const d = new Date(startDate)
            d.setDate(d.getDate() + i)
            const dateStr = d.toISOString().split('T')[0]

            // Generate some random realistic numbers
            const base = department === 'SPA' ? 500 : department === 'MINIBAR' ? 100 : 2000
            const random = Math.floor(Math.random() * base * 0.5) + base

            data.push({
                date: dateStr,
                departmentId: department,
                revenue: random,
                currency: 'EUR'
            })
        }
        return data
    },

    async getSpaRevenue(startDate: Date, endDate: Date): Promise<DepartmentRevenue[]> {
        return this.getDepartmentRevenue('SPA', startDate, endDate)
    },

    async getMinibarRevenue(startDate: Date, endDate: Date): Promise<DepartmentRevenue[]> {
        return this.getDepartmentRevenue('MINIBAR', startDate, endDate)
    },

    async getRestaurantExtras(startDate: Date, endDate: Date): Promise<DepartmentRevenue[]> {
        return this.getDepartmentRevenue('RESTAURANT', startDate, endDate)
    },

    // ─── CRM (Reviews & Surveys) ─────────────────────────────────

    async getGuestReviews(startDate: Date, endDate: Date): Promise<GuestReview[]> {
        // Placeholder for Real API: `${API_BASE}/hotel/${HOTEL_ID}/crm/reviews...`
        const from = startDate.toISOString().split('T')[0]
        const to = endDate.toISOString().split('T')[0]

        // Mock Data Generation
        const reviews: GuestReview[] = []
        const count = 25
        const sources = ['Google', 'Booking.com', 'TripAdvisor', 'Survey']
        const languages = ['tr', 'en', 'de', 'ru']

        for (let i = 0; i < count; i++) {
            const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()))
            const hasReply = Math.random() > 0.4

            reviews.push({
                id: i + 1000,
                date: date.toISOString().split('T')[0],
                guestName: `Guest ${i + 1}`,
                roomNumber: `${100 + i}`,
                rating: Math.floor(Math.random() * 5) + 6, // 6-10
                comment: `Great stay, loved the view! Staff was ${Math.random() > 0.5 ? 'amazing' : 'okay'}.`,
                status: hasReply ? 'replied' : 'pending',
                reply: hasReply ? 'Thank you for your feedback!' : undefined,
                replyDate: hasReply ? new Date(date.getTime() + 86400000).toISOString().split('T')[0] : undefined,
                source: sources[Math.floor(Math.random() * sources.length)] as any,
                language: languages[Math.floor(Math.random() * languages.length)],
                sentiment: 'positive'
            })
        }
        return reviews.sort((a, b) => b.date.localeCompare(a.date))
    },

    async getSurveyResults(startDate: Date, endDate: Date): Promise<SurveyResult[]> {
        // Mock Surveys
        return []
    },

    async getReviewResponseMetrics(startDate: Date, endDate: Date) {
        const reviews = await this.getGuestReviews(startDate, endDate)
        const total = reviews.length
        const replied = reviews.filter(r => r.status === 'replied').length

        // Calculate Avg Response Time (Mock calculation based on difference)
        const totalTime = reviews.reduce((sum, r) => {
            if (r.replyDate && r.date) {
                return sum + (new Date(r.replyDate).getTime() - new Date(r.date).getTime())
            }
            return sum
        }, 0)

        return {
            total,
            replied,
            pending: total - replied,
            responseRate: total > 0 ? Math.round((replied / total) * 100) : 0,
            avgResponseTimeHours: replied > 0 ? Math.round((totalTime / replied) / 3600000) : 0
        }
    }
}
