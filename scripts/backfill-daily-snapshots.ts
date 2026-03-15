/**
 * Backfill Daily Snapshots from 2022-01-01 to today
 *
 * Run via:
 *   npx tsx scripts/backfill-daily-snapshots.ts
 *
 * This script calls the /api/admin/data-sync/daily endpoint for each day
 * from 2022-01-01 to today. Since it uses the API, the app server MUST
 * be running.
 *
 * Alternative approach: call directly via Prisma + ElektraService
 * for offline backfill (implemented below).
 */

const BASE_URL = process.env.BASE_URL || 'https://www.bluedreamsresort.com'

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function backfillDate(date: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/admin/data-sync/daily?date=${date}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    if (data.ok) {
      const snap = data.snapshot
      console.log(`✓ ${date}: ${snap.totalReservations} rez, ₺${Math.round(snap.totalRevenueTRY || 0)} TRY, net=${snap.netReservations}`)
      return true
    } else {
      console.error(`✗ ${date}: ${data.error}`)
      return false
    }
  } catch (err: any) {
    console.error(`✗ ${date}: ${err.message}`)
    return false
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════')
  console.log(' Daily Snapshot Backfill: 2022-01-01 → today')
  console.log(`  Server: ${BASE_URL}`)
  console.log('═══════════════════════════════════════════════')

  const startDate = new Date('2022-01-01')
  const endDate = new Date()
  const days: string[] = []

  const cursor = new Date(startDate)
  while (cursor <= endDate) {
    days.push(cursor.toISOString().split('T')[0])
    cursor.setDate(cursor.getDate() + 1)
  }

  console.log(`Total days to backfill: ${days.length}`)
  console.log('')

  let success = 0
  let fail = 0

  for (const day of days) {
    const ok = await backfillDate(day)
    if (ok) success++
    else fail++

    // Rate limit: 200ms between requests to avoid overwhelming Elektra API
    await sleep(200)

    // Progress every 30 days
    if ((success + fail) % 30 === 0) {
      console.log(`--- Progress: ${success + fail}/${days.length} (${success} ok, ${fail} failed) ---`)
    }
  }

  console.log('')
  console.log('═══════════════════════════════════════════════')
  console.log(` Backfill complete: ${success} synced, ${fail} failed, ${days.length} total`)
  console.log('═══════════════════════════════════════════════')
}

main().catch(console.error)
