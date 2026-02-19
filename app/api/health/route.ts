import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    const checks: Record<string, string> = { status: 'ok' }

    try {
        // Verify DB connection with a lightweight query
        await (prisma as any).$queryRaw`SELECT 1`
        checks.database = 'connected'
    } catch {
        checks.database = 'disconnected'
    }

    const allOk = checks.database === 'connected'

    return NextResponse.json(checks, { status: allOk ? 200 : 503 })
}
