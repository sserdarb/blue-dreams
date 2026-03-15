/**
 * Cron trigger for daily snapshot sync
 * 
 * Call this endpoint daily (e.g., via crontab, Coolify scheduled task, or health check):
 *   curl -X POST https://www.bluedreamsresort.com/api/cron/daily-sync?secret=YOUR_CRON_SECRET
 *
 * Security: requires CRON_SECRET env var to match the ?secret= query param
 */
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const secret = searchParams.get('secret')
  const cronSecret = process.env.CRON_SECRET

  // Security check
  if (cronSecret && secret !== cronSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Call the daily sync endpoint for today
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/admin/data-sync/daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()

    return NextResponse.json({
      ok: data.ok,
      message: 'Daily sync triggered',
      date: data.date,
      snapshot: data.snapshot,
      triggeredAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('[Cron] Daily sync error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

// POST also supported for flexibility
export { GET as POST }
