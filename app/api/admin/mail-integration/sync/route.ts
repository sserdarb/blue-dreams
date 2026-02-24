import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import Imap from 'imap'

async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (!session) return null
    try { return JSON.parse(session.value) } catch { return null }
}

interface MailMessage {
    id: string
    subject: string
    from: string
    date: string
    snippet: string
    isRead: boolean
}

// POST — sync/fetch emails from IMAP server
export async function POST() {
    const admin = await getSession()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const config = await prisma.mailIntegration.findFirst({ where: { isActive: true } })
        if (!config) {
            return NextResponse.json({ error: 'Mail yapılandırması bulunamadı. Önce ayarlardan mail bağlantısı ekleyin.' }, { status: 404 })
        }

        const emails = await fetchImapEmails(config)

        // Update sync status
        await prisma.mailIntegration.update({
            where: { id: config.id },
            data: { lastSyncAt: new Date(), syncCount: { increment: 1 }, isConnected: true },
        })

        return NextResponse.json({ emails, count: emails.length })
    } catch (error: any) {
        // Update connection status on failure
        const config = await prisma.mailIntegration.findFirst({ where: { isActive: true } })
        if (config) {
            await prisma.mailIntegration.update({
                where: { id: config.id },
                data: { isConnected: false },
            })
        }
        return NextResponse.json({ error: `Mail senkronizasyon hatası: ${error.message}` }, { status: 500 })
    }
}

function fetchImapEmails(config: any): Promise<MailMessage[]> {
    return new Promise((resolve, reject) => {
        const imap = new Imap({
            user: config.imapUser,
            password: config.imapPass,
            host: config.imapHost,
            port: config.imapPort,
            tls: config.imapSsl,
            tlsOptions: { rejectUnauthorized: false },
            connTimeout: 10000,
            authTimeout: 10000,
        })

        const messages: MailMessage[] = []

        imap.once('ready', () => {
            imap.openBox('INBOX', true, (err: any, box: any) => {
                if (err) { imap.end(); return reject(err) }

                // Fetch last 20 emails
                const total = box.messages.total
                const from = Math.max(1, total - 19)
                const fetchRange = `${from}:${total}`

                const f = imap.seq.fetch(fetchRange, {
                    bodies: ['HEADER.FIELDS (FROM SUBJECT DATE)'],
                    struct: true,
                })

                f.on('message', (msg: any, seqno: number) => {
                    let header = ''
                    const flags: string[] = []

                    msg.on('body', (stream: any) => {
                        stream.on('data', (chunk: Buffer) => { header += chunk.toString('utf8') })
                    })

                    msg.on('attributes', (attrs: any) => {
                        if (attrs.flags) flags.push(...attrs.flags)
                    })

                    msg.once('end', () => {
                        const subjectMatch = header.match(/Subject:\s*(.+)/i)
                        const fromMatch = header.match(/From:\s*(.+)/i)
                        const dateMatch = header.match(/Date:\s*(.+)/i)

                        messages.push({
                            id: `msg-${seqno}`,
                            subject: subjectMatch ? decodeHeader(subjectMatch[1].trim()) : '(Konu yok)',
                            from: fromMatch ? decodeHeader(fromMatch[1].trim()) : '(Bilinmeyen)',
                            date: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
                            snippet: '',
                            isRead: flags.includes('\\Seen'),
                        })
                    })
                })

                f.once('error', (err: any) => { imap.end(); reject(err) })
                f.once('end', () => { imap.end(); resolve(messages.reverse()) })
            })
        })

        imap.once('error', (err: any) => reject(err))
        imap.once('end', () => { })
        imap.connect()
    })
}

function decodeHeader(str: string): string {
    // Decode MIME encoded-word (=?charset?encoding?text?=)
    return str.replace(/=\?([^?]+)\?([BQ])\?([^?]+)\?=/gi, (_, charset, encoding, text) => {
        try {
            if (encoding.toUpperCase() === 'B') {
                return Buffer.from(text, 'base64').toString(charset.toLowerCase() === 'utf-8' ? 'utf-8' : 'latin1')
            }
            if (encoding.toUpperCase() === 'Q') {
                return text.replace(/_/g, ' ').replace(/=([0-9A-F]{2})/gi, (_: string, hex: string) => String.fromCharCode(parseInt(hex, 16)))
            }
        } catch { }
        return text
    })
}
