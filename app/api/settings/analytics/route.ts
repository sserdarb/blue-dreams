import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'analytics-settings.json')

// Ensure data directory exists
function ensureDataDir() {
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
    }
}

export async function GET() {
    try {
        ensureDataDir()
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf-8')
            return NextResponse.json(JSON.parse(data))
        }
        return NextResponse.json({ gaId: '', gtmId: '', fbPixelId: '' })
    } catch (error) {
        console.error('Error reading analytics settings:', error)
        return NextResponse.json({ gaId: '', gtmId: '', fbPixelId: '' })
    }
}

export async function POST(request: Request) {
    try {
        ensureDataDir()
        const settings = await request.json()
        fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2))
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving analytics settings:', error)
        return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
    }
}
