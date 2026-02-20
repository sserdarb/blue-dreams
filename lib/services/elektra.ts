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
    reservationDate: string
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

export type ExchangeRates = {
    EUR_TO_TRY: number
    USD_TO_TRY: number
    fetchedAt: number
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

// ─── Exchange Rate Cache ───────────────────────────────────────
let cachedRates: ExchangeRates | null = null
const RATE_CACHE_TTL = 3600000 // 1 hour
const FALLBACK_RATES: ExchangeRates = { EUR_TO_TRY: 38.5, USD_TO_TRY: 35.7, fetchedAt: 0 }

// ─── Country Cache ─────────────────────────────────────────────
let cachedCountries: Map<number, string> | null = null
let countriesFetchedAt: number = 0
const COUNTRY_CACHE_TTL = 86400000 // 24 hours

async function fetchCountries(): Promise<Map<number, string>> {
    if (cachedCountries && Date.now() - countriesFetchedAt < COUNTRY_CACHE_TTL) {
        return cachedCountries
    }
    try {
        const jwt = await getJwt()
        const res = await fetch(`${API_BASE}/countries`, {
            headers: { 'Authorization': `Bearer ${jwt}` },
            next: { revalidate: 86400 }
        })
        if (res.ok) {
            const data = await res.json()
            const map = new Map<number, string>()
            if (Array.isArray(data)) {
                for (const c of data) {
                    const id = c['country-id'] || c['id'] || c['countryId']
                    const name = c['country-name'] || c['name'] || c['countryName'] || ''
                    if (id && name) map.set(Number(id), String(name))
                }
            }
            cachedCountries = map
            countriesFetchedAt = Date.now()
            console.log(`[Elektra] Countries fetched: ${map.size} entries`)
            return map
        }
    } catch (err) {
        console.warn('[Elektra] Countries fetch failed:', err)
    }
    return cachedCountries || new Map()
}

function resolveCountry(guest: Record<string, unknown>, countryMap: Map<number, string>): string {
    // 1. Try country-id lookup first
    const countryId = guest['country-id'] || guest['countryId'] || guest['country_id']
    if (countryId && countryMap.size > 0) {
        const name = countryMap.get(Number(countryId))
        if (name) return name
    }
    // 2. Try direct nationality string
    const nat = guest['nationality'] as string
    if (nat && nat !== 'Unknown' && nat.length > 1) return nat
    // 3. Try country string
    const country = guest['country'] as string
    if (country && country !== 'Unknown' && country.length > 1) return country
    // 4. Try country-name
    const countryName = guest['country-name'] as string
    if (countryName && countryName.length > 1) return countryName
    return 'Unknown'
}

async function fetchExchangeRates(): Promise<ExchangeRates> {
    if (cachedRates && Date.now() - cachedRates.fetchedAt < RATE_CACHE_TTL) {
        return cachedRates
    }
    try {
        const jwt = await getJwt()
        const res = await fetch(`${API_BASE}/hotel/${HOTEL_ID}/exchangerates`, {
            headers: { 'Authorization': `Bearer ${jwt}` },
            next: { revalidate: 3600 }
        })
        if (res.ok) {
            const data = await res.json()
            // API returns rates array; find EUR and USD
            const eurRate = Array.isArray(data)
                ? data.find((r: any) => r['currency-code'] === 'EUR' || r['currency'] === 'EUR')
                : null
            const usdRate = Array.isArray(data)
                ? data.find((r: any) => r['currency-code'] === 'USD' || r['currency'] === 'USD')
                : null
            cachedRates = {
                EUR_TO_TRY: eurRate?.['rate'] || eurRate?.['buying-rate'] || FALLBACK_RATES.EUR_TO_TRY,
                USD_TO_TRY: usdRate?.['rate'] || usdRate?.['buying-rate'] || FALLBACK_RATES.USD_TO_TRY,
                fetchedAt: Date.now()
            }
            console.log('[Elektra] Exchange rates fetched:', cachedRates)
            return cachedRates
        }
    } catch (err) {
        console.warn('[Elektra] Exchange rates fetch failed, using fallback:', err)
    }
    return FALLBACK_RATES
}

function toTRY(amount: number, currency: string, rates: ExchangeRates): number {
    if (currency === 'TRY') return amount
    if (currency === 'EUR') return amount * rates.EUR_TO_TRY
    if (currency === 'USD') return amount * rates.USD_TO_TRY
    return amount * rates.EUR_TO_TRY // default to EUR rate
}

function tryToEur(tryAmount: number, rates: ExchangeRates): number {
    return rates.EUR_TO_TRY > 0 ? tryAmount / rates.EUR_TO_TRY : 0
}

async function getJwt(): Promise<string> {
    if (cachedJwt && Date.now() < jwtExpiresAt - 3600000) {
        return cachedJwt
    }

    const MAX_RETRIES = 3
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
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

            if (res.status === 429) {
                const wait = Math.pow(2, attempt + 1) * 1000 // 2s, 4s, 8s
                console.warn(`[Elektra] Rate limited (429), retrying in ${wait / 1000}s... (attempt ${attempt + 1}/${MAX_RETRIES})`)
                await new Promise(r => setTimeout(r, wait))
                continue
            }

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
            if (attempt === MAX_RETRIES - 1) {
                console.error('[Elektra] Login error after retries:', err)
                // Return stale JWT if available rather than crashing
                if (cachedJwt) {
                    console.warn('[Elektra] Using stale JWT as fallback')
                    return cachedJwt
                }
                throw err
            }
        }
    }
    // Should never reach here, but satisfy TS
    throw new Error('Elektra login: max retries exceeded')
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
    const countryMap = await fetchCountries()

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

        // Guests & Nationality — resolve via country-id map
        const guests = ((item['guest-list'] as Array<Record<string, unknown>>) || []).map(g => ({
            name: (g['name'] as string) || '',
            surname: (g['surname'] as string) || '',
            nationality: resolveCountry(g, countryMap)
        }))

        // Also try reservation-level nationality fields
        const firstGuestNationality = guests.length > 0 && guests[0].nationality !== 'Unknown'
            ? guests[0].nationality
            : resolveCountry(item as Record<string, unknown>, countryMap)

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
            reservationDate: (item['reservation-date'] as string) || (item['lastupdate-date'] as string) || '',
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

    // Filter reservations by BOOKING/SALE date (reservationDate), not check-in date
    // reservationDate is the original booking creation date (not overwritten at checkout like lastUpdate)
    async getReservationsByBookingDate(salesFrom: Date, salesTo: Date): Promise<Reservation[]> {
        const allReservations = await this.getAllSeasonReservations()
        const fromStr = salesFrom.toISOString().split('T')[0]
        const toStr = salesTo.toISOString().split('T')[0]
        return allReservations.filter(r => {
            const saleDate = r.reservationDate.slice(0, 10)
            return saleDate >= fromStr && saleDate <= toStr
        })
    },

    // Fetch reservations by booking/sale date for a SPECIFIC YEAR
    // Uses reservationDate (original booking creation date) for filtering
    async getReservationsByBookingDateForYear(salesFrom: Date, salesTo: Date, year: number): Promise<Reservation[]> {
        const checkInFrom = new Date(year, 0, 1)       // Jan 1 of target year
        const checkInTo = new Date(year + 1, 11, 31)    // Dec 31 of next year
        const from = checkInFrom.toISOString().split('T')[0]
        const to = checkInTo.toISOString().split('T')[0]
        const statuses = ['Reservation', 'Waiting', 'InHouse', 'CheckOut']
        const all: Reservation[] = []
        for (const s of statuses) {
            try {
                const res = await fetchReservations(from, to, s)
                all.push(...res)
            } catch (err) {
                console.error(`[Elektra] Reservations for year ${year} (${s}) error:`, err)
            }
        }
        const fromStr = salesFrom.toISOString().split('T')[0]
        const toStr = salesTo.toISOString().split('T')[0]
        console.log(`[Elektra] YoY comparison: fetched ${all.length} reservations (check-in ${from}→${to}), filtering reservationDate ${fromStr}→${toStr}`)
        const filtered = all.filter(r => {
            const saleDate = r.reservationDate.slice(0, 10)
            return saleDate >= fromStr && saleDate <= toStr
        })
        console.log(`[Elektra] YoY comparison: ${filtered.length} reservations match reservationDate range`)
        return filtered
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
            const rates = await fetchExchangeRates()
            const amount = toTRY(res.totalPrice, res.currency, rates)
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
            const rates = await fetchExchangeRates()
            entry.revenue += toTRY(res.totalPrice, res.currency, rates)
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

        // Parallel fetch — occupancy + all season reservations + exchange rates
        const [occupancy, allReservations, rates] = await Promise.all([
            this.getTodayOccupancy(),
            this.getAllSeasonReservations().catch(() => [] as Reservation[]),
            fetchExchangeRates(),
        ])

        // Reservations SOLD today (by lastUpdate/booking date, not check-in)
        const todaySales = allReservations.filter(r => r.lastUpdate.slice(0, 10) === todayStr)

        // This month's sales (reservations booked this month)
        const monthStartStr = monthStart.toISOString().split('T')[0]
        const monthSales = allReservations.filter(r => r.lastUpdate.slice(0, 10) >= monthStartStr)

        // Monthly revenue from sales made this month (in TRY)
        const monthlyRevenueTRY = monthSales.reduce((sum, r) => {
            return sum + toTRY(r.totalPrice, r.currency, rates)
        }, 0)
        const monthlyRevenueEUR = tryToEur(monthlyRevenueTRY, rates)

        // ADR = Average Daily Rate (monthly revenue / booked room nights)
        const totalRoomNights = monthSales.reduce((sum, r) => {
            const nights = Math.max(1, Math.ceil(
                (new Date(r.checkOut).getTime() - new Date(r.checkIn).getTime()) / 86400000
            ))
            return sum + nights * r.roomCount
        }, 0)
        const adrTRY = totalRoomNights > 0 ? Math.round(monthlyRevenueTRY / totalRoomNights) : 0
        const adrEUR = totalRoomNights > 0 ? Math.round(monthlyRevenueEUR / totalRoomNights) : 0

        // Today's revenue
        const todayRevenueTRY = todaySales.reduce((sum, r) => {
            return sum + toTRY(r.totalPrice, r.currency, rates)
        }, 0)
        const todayRevenueEUR = tryToEur(todayRevenueTRY, rates)

        return {
            todaySalesCount: todaySales.length,
            todayRevenue: `₺${todayRevenueTRY.toLocaleString('tr-TR')}`,
            todayRevenueEUR: `€${Math.round(todayRevenueEUR).toLocaleString('tr-TR')}`,
            totalRevenue: `₺${monthlyRevenueTRY.toLocaleString('tr-TR')}`,
            totalRevenueEUR: `€${Math.round(monthlyRevenueEUR).toLocaleString('tr-TR')}`,
            occupancyRate: `${occupancy.rate}%`,
            occupancyAvailable: occupancy.available,
            occupancyTotal: occupancy.total,
            adr: `₺${adrTRY.toLocaleString('tr-TR')}`,
            adrEUR: `€${adrEUR.toLocaleString('tr-TR')}`,
            monthlyReservationCount: monthSales.length,
            exchangeRate: rates,
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
            entry.revenue += toTRY(res.totalPrice, res.currency, FALLBACK_RATES)
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
        const reviews: GuestReview[] = []
        const count = 60
        const sources: GuestReview['source'][] = ['Google', 'Booking.com', 'TripAdvisor', 'Survey', 'Direct']
        const sourceWeights = [0.3, 0.35, 0.15, 0.1, 0.1] // Booking.com dominant
        const languages = ['tr', 'en', 'de', 'ru']

        // Realistic review templates organized by sentiment
        const positiveComments = [
            'Personel çok ilgili ve güler yüzlüydü, harika bir tatil geçirdik!',
            'Havuz alanı mükemmeldi, çocuklarımız bayıldı. Temizlik kusursuzdu.',
            'Yemekler çok lezzetli, özellikle akşam büfesi muhteşemdi.',
            'Deniz manzarası odamızdan nefes kesiciydi. Spa hizmeti çok iyiydi.',
            'Everything was perfect! The beach is stunning and food quality is top notch.',
            'Wunderschönes Hotel, tolles Essen, sehr freundliches Personal!',
            'Прекрасный отель! Чистота, еда и обслуживание на высшем уровне.',
            'All-inclusive concept was amazing, never had such a great service.',
            'Animasyon ekibi harikaydı, her gece farklı etkinlikler düzenlediler.',
            'Plaj çok temiz ve bakımlı. Şezlong hizmeti mükemmeldi.',
        ]
        const neutralComments = [
            'Genel olarak iyi bir tatildi. Oda biraz küçüktü ama temizdi.',
            'Yemekler fena değil ama biraz daha çeşitlilik olabilirdi.',
            'Hotel is nice but the room could use some renovation. Staff was friendly.',
            'WiFi zayıftı, bunun dışında herşey iyiydi.',
            'Havuz kalabalıktı ama animasyon ekibi iyiydi.',
        ]
        const negativeComments = [
            'Klima düzgün çalışmıyordu, çok sıcaktı. Defalarca söylememize rağmen düzelmedi.',
            'Gürültü seviyesi çok yüksekti, gece uyuyamadık.',
            'Oda temizliğinden memnun kalmadık, banyo lekeliydi.',
            'Food quality was below expectations for a 5-star resort.',
            'Check-in process was very slow, waited over 1 hour.',
        ]

        const guestNames = [
            'Mehmet Yılmaz', 'Ayşe Kaya', 'John Smith', 'Hans Müller',
            'Иван Петров', 'Fatma Demir', 'Emily Johnson', 'Karl Schmidt',
            'Елена Иванова', 'Ali Öztürk', 'Sarah Wilson', 'Wolfgang Wagner',
            'Ahmet Çelik', 'Maria González', 'Petra Bauer', 'Дмитрий Сидоров',
            'Zeynep Arslan', 'Michael Brown', 'Anna Fischer', 'Сергей Козлов',
        ]

        // Deterministic seed for consistent mock data
        let seed = 42
        const seededRandom = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }

        for (let i = 0; i < count; i++) {
            const dayOffset = Math.floor(seededRandom() * ((endDate.getTime() - startDate.getTime()) / 86400000))
            const date = new Date(startDate.getTime() + dayOffset * 86400000)
            const r = seededRandom()
            const sentiment: GuestReview['sentiment'] = r > 0.25 ? 'positive' : r > 0.08 ? 'neutral' : 'negative'
            const rating = sentiment === 'positive' ? Math.floor(seededRandom() * 3) + 8
                : sentiment === 'neutral' ? Math.floor(seededRandom() * 2) + 6
                    : Math.floor(seededRandom() * 3) + 3

            const comments = sentiment === 'positive' ? positiveComments
                : sentiment === 'neutral' ? neutralComments : negativeComments
            const comment = comments[Math.floor(seededRandom() * comments.length)]

            // Source selection with weighted distribution
            let sourceIdx = 0
            let cumWeight = 0
            const srcRand = seededRandom()
            for (let s = 0; s < sourceWeights.length; s++) {
                cumWeight += sourceWeights[s]
                if (srcRand <= cumWeight) { sourceIdx = s; break }
            }

            const hasReply = seededRandom() > 0.35
            const guestName = guestNames[Math.floor(seededRandom() * guestNames.length)]

            reviews.push({
                id: i + 1000,
                date: date.toISOString().split('T')[0],
                guestName,
                roomNumber: `${200 + Math.floor(seededRandom() * 400)}`,
                rating,
                comment,
                status: hasReply ? 'replied' : 'pending',
                reply: hasReply ? 'Değerli misafirimiz, yorumunuz için teşekkür ederiz.' : undefined,
                replyDate: hasReply ? new Date(date.getTime() + (1 + Math.floor(seededRandom() * 3)) * 86400000).toISOString().split('T')[0] : undefined,
                source: sources[sourceIdx],
                language: languages[Math.floor(seededRandom() * languages.length)],
                sentiment
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
    },

    // ─── Exchange Rates ─────────────────────────────────────────
    async getExchangeRates(): Promise<ExchangeRates> {
        return fetchExchangeRates()
    },
}
