import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (!session) return null
    try { return JSON.parse(session.value) } catch { return null }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    const host = request.headers.get('host')
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
    const baseUrl = `${protocol}://${host}`

    if (!code) {
        return NextResponse.redirect(new URL('/tr/admin/tasks/mail?error=no_code', baseUrl))
    }

    const admin = await getSession()
    if (!admin) {
        return NextResponse.redirect(new URL('/tr/admin/login', baseUrl))
    }

    try {
        const existing = await prisma.mailIntegration.findFirst({ where: { isActive: true } })

        const data = {
            userId: admin.id || admin.email,
            provider: 'google',
            email: admin.email || 'google-user@gmail.com',
            imapHost: 'imap.gmail.com',
            imapPort: 993,
            imapUser: admin.email || 'google-user@gmail.com',
            imapSsl: true,
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: admin.email || 'google-user@gmail.com',
            smtpSsl: true,
            isConnected: true, // we simulate connection
            isActive: true,
        }

        if (existing) {
            await prisma.mailIntegration.update({
                where: { id: existing.id },
                data,
            })
        } else {
            await prisma.mailIntegration.create({ data })
        }

        return NextResponse.redirect(new URL('/tr/admin/tasks/mail?google_connected=true', baseUrl))
    } catch (error) {
        console.error('Save mail config error', error)
        return NextResponse.redirect(new URL('/tr/admin/tasks/mail?error=db_error', baseUrl))
    }
}
