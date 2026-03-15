/**
 * Daily Snapshot Sync API
 * POST — Sync a specific date (or today) into DailySnapshot table
 * GET  — Retrieve snapshots for a date range
 *
 * POST /api/admin/data-sync/daily?date=2026-03-15
 * GET  /api/admin/data-sync/daily?from=2022-01-01&to=2026-03-15
 */
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { ElektraService } from '@/lib/services/elektra'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date')

    // Default to today in Turkey timezone
    const turkeyNowStr = new Date().toLocaleString('en-US', { timeZone: 'Europe/Istanbul' })
    const turkeyNow = new Date(turkeyNowStr)
    const today = `${turkeyNow.getFullYear()}-${String(turkeyNow.getMonth() + 1).padStart(2, '0')}-${String(turkeyNow.getDate()).padStart(2, '0')}`
    const targetDate = dateStr || today

    // Fetch all season reservations
    const allReservations = await ElektraService.getAllSeasonReservations()
    const stats = await ElektraService.getDailyStats()
    const tryRate = stats.exchangeRate?.EUR_TO_TRY || 1

    // Filter to reservations whose booking/sale date = targetDate
    const periodReservations = allReservations.filter((r: any) => {
      const d = (r.reservationDate || r.lastUpdate || r.checkIn).slice(0, 10)
      return d === targetDate
    })

    const activeRez = periodReservations.filter((r: any) => r.status !== 'Cancelled' && r.status !== 'İptal')
    const cancelledRez = periodReservations.filter((r: any) => r.status === 'Cancelled' || r.status === 'İptal')

    // Calculate metrics
    const totalRevenueTRY = activeRez.reduce((sum: number, r: any) => sum + (r.amountTry || 0), 0)
    const totalRevenueEUR = activeRez.reduce((sum: number, r: any) => sum + (r.amountEur || 0), 0)
    const totalGuests = activeRez.reduce((sum: number, r: any) => sum + (r.guests?.length || 2), 0)
    const totalRoomNights = activeRez.reduce((sum: number, r: any) => sum + ((r.nights || 1) * (r.roomCount || 1)), 0)
    const avgStayNights = activeRez.length > 0 
      ? activeRez.reduce((s: number, r: any) => s + (r.nights || 1), 0) / activeRez.length 
      : 0
    const adrTRY = totalRoomNights > 0 ? totalRevenueTRY / totalRoomNights : 0
    const adrEUR = totalRoomNights > 0 ? totalRevenueEUR / totalRoomNights : 0

    // Channel breakdown
    const channelMap: Record<string, number> = {}
    activeRez.forEach((r: any) => {
      const ch = r.channel || 'Unknown'
      channelMap[ch] = (channelMap[ch] || 0) + 1
    })

    // Country breakdown
    const countryMap: Record<string, number> = {}
    activeRez.forEach((r: any) => {
      const country = r.country || 'Unknown'
      countryMap[country] = (countryMap[country] || 0) + 1
    })

    // Upsert snapshot
    const snapshot = await prisma.dailySnapshot.upsert({
      where: { date: new Date(`${targetDate}T00:00:00.000Z`) },
      create: {
        date: new Date(`${targetDate}T00:00:00.000Z`),
        totalReservations: activeRez.length,
        netReservations: activeRez.length - cancelledRez.length,
        cancelledCount: cancelledRez.length,
        totalRevenueTRY,
        totalRevenueEUR,
        avgStayNights,
        totalGuests,
        totalRoomNights,
        adrEUR,
        adrTRY,
        occupancyPercent: 0, // Can be filled via separate occupancy call if needed
        eurToTry: tryRate,
        channelBreakdown: JSON.stringify(channelMap),
        countryBreakdown: JSON.stringify(countryMap),
      },
      update: {
        totalReservations: activeRez.length,
        netReservations: activeRez.length - cancelledRez.length,
        cancelledCount: cancelledRez.length,
        totalRevenueTRY,
        totalRevenueEUR,
        avgStayNights,
        totalGuests,
        totalRoomNights,
        adrEUR,
        adrTRY,
        eurToTry: tryRate,
        channelBreakdown: JSON.stringify(channelMap),
        countryBreakdown: JSON.stringify(countryMap),
      },
    })

    return NextResponse.json({
      ok: true,
      date: targetDate,
      snapshot: {
        id: snapshot.id,
        totalReservations: snapshot.totalReservations,
        netReservations: snapshot.netReservations,
        cancelledCount: snapshot.cancelledCount,
        totalRevenueTRY: snapshot.totalRevenueTRY,
        totalRevenueEUR: snapshot.totalRevenueEUR,
        avgStayNights: snapshot.avgStayNights,
      }
    })
  } catch (error: any) {
    console.error('[DailySync] Error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const date = searchParams.get('date')

    if (date) {
      // Single date lookup
      const snapshot = await prisma.dailySnapshot.findUnique({
        where: { date: new Date(`${date}T00:00:00.000Z`) }
      })
      return NextResponse.json({ ok: true, snapshot })
    }

    if (!from || !to) {
      // Default: last 30 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)
      
      const snapshots = await prisma.dailySnapshot.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { date: 'asc' }
      })
      return NextResponse.json({ ok: true, count: snapshots.length, snapshots })
    }

    // Date range query
    const snapshots = await prisma.dailySnapshot.findMany({
      where: {
        date: {
          gte: new Date(`${from}T00:00:00.000Z`),
          lte: new Date(`${to}T23:59:59.999Z`)
        }
      },
      orderBy: { date: 'asc' }
    })

    return NextResponse.json({ ok: true, count: snapshots.length, snapshots })
  } catch (error: any) {
    console.error('[DailySync] GET Error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
