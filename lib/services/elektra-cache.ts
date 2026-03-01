// Elektra PMS DB-Based Cache Layer
// Caches reservation/availability data in SQL (Prisma) for instant dashboard loads
// Auto-refreshed via instrumentation.ts interval

import { ElektraService, type Reservation, type RoomAvailability, type ExchangeRates } from './elektra'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export interface ElektraCacheData {
    reservations: Reservation[]
    availability: RoomAvailability[]
    exchangeRates: ExchangeRates
    fetchedAt: string // ISO timestamp
    ttlMs: number
}

export interface CacheStatus {
    lastUpdated: string | null
    isStale: boolean
    nextRefresh: string | null
    reservationCount: number
    ttlMinutes: number
}

// Default TTL for "freshness" check, though DB holds data indefinitely
export interface ElektraConfig {
    ttlMinutes: number
}

const CONFIG_PATH = path.join(process.cwd(), 'data', 'elektra-config.json')

function getElektraConfig(): ElektraConfig {
    if (fs.existsSync(CONFIG_PATH)) {
        try {
            const data = fs.readFileSync(CONFIG_PATH, 'utf-8')
            return { ...{ ttlMinutes: 30 }, ...JSON.parse(data) }
        } catch { return { ttlMinutes: 30 } }
    }
    return { ttlMinutes: 30 }
}

export function setElektraConfig(config: Partial<ElektraConfig>) {
    const current = getElektraConfig()
    const newConfig = { ...current, ...config }
    const dir = path.dirname(CONFIG_PATH)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2), 'utf-8')
    return newConfig
}

// ─── Exported API ──────────────────────────────────────────────

export const ElektraCache = {
    /**
     * Get cached reservations from DB. 
     * Defaults to current year + next year if no range specified.
     */
    async getReservations(from?: Date, to?: Date): Promise<Reservation[]> {
        try {
            const start = from || new Date(new Date().getFullYear(), 0, 1)
            const end = to || new Date(new Date().getFullYear() + 1, 11, 31)

            const dbRes = await prisma.elektraReservation.findMany({
                where: {
                    checkIn: {
                        gte: start,
                        lte: end
                    }
                },
                orderBy: { checkIn: 'desc' }
            })

            // Map DB model back to Reservation type
            return dbRes.map(r => ({
                id: r.id,
                voucherNo: r.voucherNo || '',
                agency: r.agency || '',
                channel: r.channel || '',
                boardType: r.boardType || '',
                roomType: r.roomType || '',
                rateType: '', // Not stored in minimal schema
                checkIn: r.checkIn.toISOString().split('T')[0],
                checkOut: r.checkOut.toISOString().split('T')[0],
                totalPrice: r.totalPrice,
                paidPrice: r.paidPrice,
                currency: r.currency,
                roomCount: r.roomCount,
                contactName: null, // Not stored
                contactEmail: null,
                contactPhone: null,
                lastUpdate: r.bookedAt.toISOString(),
                reservationDate: r.bookedAt.toISOString(),
                guests: r.country ? [{ name: 'Guest', surname: '1', country: r.country }] : [],
                status: r.status,
                country: r.country || 'Unknown',
                dailyAverage: r.totalPrice / Math.max(1, Math.ceil((r.checkOut.getTime() - r.checkIn.getTime()) / 86400000)),
                nights: Math.max(1, Math.ceil((r.checkOut.getTime() - r.checkIn.getTime()) / 86400000))
            }))
        } catch (e) {
            console.error('[ElektraCache] DB Fetch Error:', e)
            return []
        }
    },

    /**
     * Force-refresh: fetch NEW data from Elektra PMS and upsert to DB.
     * Uses latest `bookedAt` to incremental fetch if possible, 
     * but strictly speaking we need to fetch by check-in range to catch updates.
     * Strategy: Fetch +/- 3 months window around today to keep active data fresh.
     */
    async refresh(): Promise<void> {
        console.log('[ElektraCache] Refreshing from Elektra PMS (DB Sync)...')
        const start = Date.now()

        // Fetch window: 3 months back to 12 months forward
        const today = new Date()
        const fromDate = new Date(today.getFullYear(), today.getMonth() - 3, 1)
        const toDate = new Date(today.getFullYear() + 1, today.getMonth(), 0)

        // Fetch Exchange Rates & Upsert
        try {
            const rates = await ElektraService.getExchangeRates()
            await prisma.elektraRate.upsert({
                where: { date: new Date() }, // Using today as key (ignoring time for simplicity in model, though standard datetime)
                update: {
                    eur: rates.EUR_TO_TRY,
                    usd: rates.USD_TO_TRY,
                    fetchedAt: new Date()
                },
                create: {
                    date: new Date(),
                    eur: rates.EUR_TO_TRY,
                    usd: rates.USD_TO_TRY,
                    fetchedAt: new Date()
                }
            })
        } catch (e) {
            console.error('[ElektraCache] Rate Refresh Error:', e)
        }

        // Fetch Reservations & Upsert
        try {
            const allReservations = await ElektraService.getReservations(fromDate, toDate)

            // ONLY cache data up to 23:59:59 of yesterday. 
            // Today's dynamically changing data will be fetched in real-time by the dashboard.
            const todayStr = today.toISOString().split('T')[0]
            const reservations = allReservations.filter(res => {
                const updatedDateStr = res.lastUpdate ? res.lastUpdate.slice(0, 10) : ''
                return updatedDateStr < todayStr
            })

            // Batch upsert (PRISMA doesn't support bulk upsert easily, so loop or createMany on conflict)
            // Using loop is safer for data integrity
            for (const res of reservations) {
                await prisma.elektraReservation.upsert({
                    where: { id: res.id },
                    update: {
                        voucherNo: res.voucherNo,
                        agency: res.agency,
                        channel: res.channel,
                        boardType: res.boardType,
                        roomType: res.roomType,
                        checkIn: new Date(res.checkIn),
                        checkOut: new Date(res.checkOut),
                        totalPrice: res.totalPrice,
                        paidPrice: res.paidPrice,
                        currency: res.currency,
                        status: res.status,
                        roomCount: res.roomCount,
                        country: res.country,
                        bookedAt: new Date(res.lastUpdate),
                    },
                    create: {
                        id: res.id,
                        voucherNo: res.voucherNo,
                        agency: res.agency,
                        channel: res.channel,
                        boardType: res.boardType,
                        roomType: res.roomType,
                        checkIn: new Date(res.checkIn),
                        checkOut: new Date(res.checkOut),
                        totalPrice: res.totalPrice,
                        paidPrice: res.paidPrice,
                        currency: res.currency,
                        status: res.status,
                        roomCount: res.roomCount,
                        adults: 2, // Default
                        children: 0,
                        country: res.country,
                        bookedAt: new Date(res.lastUpdate),
                    }
                })
            }
            console.log(`[ElektraCache] Synced ${reservations.length} reservations in ${Date.now() - start}ms`)
        } catch (e) {
            console.error('[ElektraCache] Reservation Refresh Error:', e)
        }
    },

    /**
     * Fetch and cache historical data for an entire year.
     * Unlike `refresh`, this explicitly loads distant past data without
     * excluding "today/future" explicitly - it's meant for archival.
     */
    async refreshYear(year: number): Promise<void> {
        console.log(`[ElektraCache] Syncing historical data for year ${year}...`)
        const startMs = Date.now()

        const fromDate = new Date(year, 0, 1)
        const toDate = new Date(year, 11, 31)

        try {
            const allReservations = await ElektraService.getReservations(fromDate, toDate)

            for (const res of allReservations) {
                await prisma.elektraReservation.upsert({
                    where: { id: res.id },
                    update: {
                        voucherNo: res.voucherNo,
                        agency: res.agency,
                        channel: res.channel,
                        boardType: res.boardType,
                        roomType: res.roomType,
                        checkIn: new Date(res.checkIn),
                        checkOut: new Date(res.checkOut),
                        totalPrice: res.totalPrice,
                        paidPrice: res.paidPrice,
                        currency: res.currency,
                        status: res.status,
                        roomCount: res.roomCount,
                        country: res.country,
                        bookedAt: new Date(res.lastUpdate),
                    },
                    create: {
                        id: res.id,
                        voucherNo: res.voucherNo,
                        agency: res.agency,
                        channel: res.channel,
                        boardType: res.boardType,
                        roomType: res.roomType,
                        checkIn: new Date(res.checkIn),
                        checkOut: new Date(res.checkOut),
                        totalPrice: res.totalPrice,
                        paidPrice: res.paidPrice,
                        currency: res.currency,
                        status: res.status,
                        roomCount: res.roomCount,
                        adults: 2,
                        children: 0,
                        country: res.country,
                        bookedAt: new Date(res.lastUpdate),
                    }
                })
            }
            console.log(`[ElektraCache] Archived ${allReservations.length} reservations for ${year} in ${Date.now() - startMs}ms`)
        } catch (e) {
            console.error(`[ElektraCache] Year ${year} Archive Error:`, e)
            throw e
        }
    },

    /**
     * Get cache status for admin dashboard
     */
    async getStatus(): Promise<CacheStatus> {
        try {
            const config = getElektraConfig()
            const ttlMs = config.ttlMinutes * 60 * 1000
            const count = await prisma.elektraReservation.count()
            const lastRate = await prisma.elektraRate.findFirst({ orderBy: { fetchedAt: 'desc' } })

            const lastUpdated = lastRate?.fetchedAt.toISOString() || null
            const isStale = lastUpdated ? (Date.now() - new Date(lastUpdated).getTime() > ttlMs) : true

            return {
                lastUpdated,
                isStale,
                nextRefresh: lastUpdated ? new Date(new Date(lastUpdated).getTime() + ttlMs).toISOString() : null,
                reservationCount: count,
                ttlMinutes: config.ttlMinutes
            }
        } catch (e) {
            return {
                lastUpdated: null,
                isStale: true,
                nextRefresh: null,
                reservationCount: 0,
                ttlMinutes: 30
            }
        }
    },

    /**
     * Get cached exchange rates
     */
    async getExchangeRates(): Promise<ExchangeRates | null> {
        const rate = await prisma.elektraRate.findFirst({ orderBy: { fetchedAt: 'desc' } })
        if (!rate) return null
        return {
            EUR_TO_TRY: rate.eur,
            USD_TO_TRY: rate.usd,
            fetchedAt: rate.fetchedAt.getTime()
        }
    }
}
