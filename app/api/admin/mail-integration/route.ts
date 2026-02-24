import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (!session) return null
    try { return JSON.parse(session.value) } catch { return null }
}

// GET — fetch current mail integration config
export async function GET() {
    const admin = await getSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const config = await prisma.mailIntegration.findFirst({
            where: { isActive: true },
            select: {
                id: true, email: true, provider: true,
                imapHost: true, imapPort: true, imapUser: true, imapSsl: true,
                smtpHost: true, smtpPort: true, smtpUser: true, smtpSsl: true,
                isConnected: true, lastSyncAt: true, syncCount: true,
                createdAt: true, updatedAt: true,
            }
        })
        return NextResponse.json(config || null)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// POST — save/update mail integration config
export async function POST(request: Request) {
    const admin = await getSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await request.json()
        const { email, imapHost, imapPort, imapUser, imapPass, imapSsl, smtpHost, smtpPort, smtpUser, smtpPass, smtpSsl } = body

        if (!email || !imapHost || !imapUser) {
            return NextResponse.json({ error: 'Email, IMAP host ve kullanıcı gerekli' }, { status: 400 })
        }

        // Check for existing config
        const existing = await prisma.mailIntegration.findFirst({ where: { isActive: true } })

        const data = {
            userId: admin.id || admin.email,
            provider: 'imap',
            email,
            imapHost, imapPort: Number(imapPort) || 993, imapUser,
            ...(imapPass ? { imapPass } : {}),
            imapSsl: imapSsl !== false,
            smtpHost: smtpHost || imapHost,
            smtpPort: Number(smtpPort) || 587,
            smtpUser: smtpUser || imapUser,
            ...(smtpPass ? { smtpPass } : {}),
            smtpSsl: smtpSsl !== false,
            isActive: true,
        }

        let config
        if (existing) {
            config = await prisma.mailIntegration.update({
                where: { id: existing.id },
                data,
            })
        } else {
            config = await prisma.mailIntegration.create({ data })
        }

        return NextResponse.json({
            id: config.id, email: config.email, provider: config.provider,
            imapHost: config.imapHost, imapPort: config.imapPort, imapUser: config.imapUser, imapSsl: config.imapSsl,
            smtpHost: config.smtpHost, smtpPort: config.smtpPort, smtpUser: config.smtpUser, smtpSsl: config.smtpSsl,
            isConnected: config.isConnected, lastSyncAt: config.lastSyncAt, syncCount: config.syncCount,
        })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE — remove mail config
export async function DELETE() {
    const admin = await getSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        await prisma.mailIntegration.deleteMany({ where: { isActive: true } })
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
