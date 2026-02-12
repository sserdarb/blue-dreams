import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { extractSheetId, getSheetPreview, clearSheetCache } from '@/lib/services/google-sheets'

// Require admin session
async function requireAdmin() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (!session) return null
    try {
        return JSON.parse(session.value)
    } catch {
        return null
    }
}

// GET - Preview/test a Google Sheet connection
export async function GET(request: Request) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const sheetIdParam = searchParams.get('sheetId')
    const locale = searchParams.get('locale') || 'tr'

    let sheetId = sheetIdParam

    // If no sheetId param, try to get from DB
    if (!sheetId) {
        try {
            const settings = await prisma.aiSettings.findFirst({ where: { language: locale } })
            sheetId = settings?.googleSheetId || null
        } catch (e) {
            // ignore
        }
    }

    if (!sheetId) {
        return NextResponse.json({
            success: false,
            error: 'Google Sheet ID yapılandırılmamış'
        })
    }

    const extracted = extractSheetId(sheetId)
    if (!extracted) {
        return NextResponse.json({
            success: false,
            error: 'Geçersiz Google Sheet URL veya ID'
        })
    }

    const preview = await getSheetPreview(extracted)
    return NextResponse.json(preview)
}

// POST - Clear cache for a sheet
export async function POST(request: Request) {
    const admin = await requireAdmin()
    if (!admin) {
        return NextResponse.json({ error: 'Yetkiniz yok' }, { status: 403 })
    }

    try {
        const { sheetId } = await request.json()
        if (sheetId) {
            const extracted = extractSheetId(sheetId)
            if (extracted) clearSheetCache(extracted)
        } else {
            clearSheetCache()
        }
        return NextResponse.json({ success: true, message: 'Cache temizlendi' })
    } catch {
        clearSheetCache()
        return NextResponse.json({ success: true, message: 'Tüm cache temizlendi' })
    }
}
