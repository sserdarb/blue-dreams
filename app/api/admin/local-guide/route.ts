import { NextResponse } from 'next/server'
import { fetchBodrumAttractions, fetchBodrumEvents, clearSerpCache } from '@/lib/services/serpapi'
import fs from 'fs'
import path from 'path'

const APPROVED_FILE = path.join(process.cwd(), 'data', 'approved-local-guide.json')

function ensureDataDir() {
    const dir = path.dirname(APPROVED_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

function readApproved(): { attractions: string[]; events: string[] } {
    ensureDataDir()
    if (!fs.existsSync(APPROVED_FILE)) return { attractions: [], events: [] }
    try {
        return JSON.parse(fs.readFileSync(APPROVED_FILE, 'utf-8'))
    } catch { return { attractions: [], events: [] } }
}

function writeApproved(data: { attractions: string[]; events: string[] }) {
    ensureDataDir()
    fs.writeFileSync(APPROVED_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

// GET — Fetch all attractions & events from SerpAPI, with approval status
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const onlyApproved = searchParams.get('approved') === 'true'
    const refresh = searchParams.get('refresh') === 'true'

    if (refresh) clearSerpCache()

    const approved = readApproved()

    try {
        if (type === 'attractions' || type === 'all') {
            const attractions = await fetchBodrumAttractions()
            const withApproval = attractions.map(a => ({
                ...a,
                approved: approved.attractions.includes(a.id),
            }))

            if (type === 'attractions') {
                return NextResponse.json({
                    attractions: onlyApproved ? withApproval.filter(a => a.approved) : withApproval,
                })
            }

            const events = await fetchBodrumEvents()
            const eventsWithApproval = events.map(e => ({
                ...e,
                approved: approved.events.includes(e.id),
            }))

            return NextResponse.json({
                attractions: onlyApproved ? withApproval.filter(a => a.approved) : withApproval,
                events: onlyApproved ? eventsWithApproval.filter(e => e.approved) : eventsWithApproval,
            })
        }

        if (type === 'events') {
            const events = await fetchBodrumEvents()
            const eventsWithApproval = events.map(e => ({
                ...e,
                approved: approved.events.includes(e.id),
            }))

            return NextResponse.json({
                events: onlyApproved ? eventsWithApproval.filter(e => e.approved) : eventsWithApproval,
            })
        }

        return NextResponse.json({ error: 'Invalid type param' }, { status: 400 })
    } catch (error) {
        console.error('[LocalGuide API] Error:', error)
        return NextResponse.json({ attractions: [], events: [] })
    }
}

// POST — Approve / reject items
export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { action, itemId, itemType } = body as {
            action: 'approve' | 'reject'
            itemId: string
            itemType: 'attraction' | 'event'
        }

        if (!action || !itemId || !itemType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const approved = readApproved()
        const key = itemType === 'attraction' ? 'attractions' : 'events'

        if (action === 'approve') {
            if (!approved[key].includes(itemId)) {
                approved[key].push(itemId)
            }
        } else {
            approved[key] = approved[key].filter(id => id !== itemId)
        }

        writeApproved(approved)

        return NextResponse.json({ success: true, approved })
    } catch (error) {
        console.error('[LocalGuide API] POST error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
