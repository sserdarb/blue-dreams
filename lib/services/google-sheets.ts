/**
 * Google Sheets Service for Blue Concierge AI
 * Fetches spreadsheet data and formats it as knowledge context.
 * API key is server-side only — never exposed to clients.
 */

// Server-side only — this key never leaves the server
const GOOGLE_SHEETS_API_KEY = 'AIzaSyDzSP67iaCmFwpZyYG0khTILFmPNgYGENc'
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets'

// In-memory cache: 5-minute TTL
const cache = new Map<string, { data: string; timestamp: number; rowCount: number; sheetNames: string[] }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export interface SheetData {
    text: string          // Formatted text for AI context
    rowCount: number      // Total row count across all sheets
    sheetNames: string[]  // Names of sheets/tabs
    error?: string
}

/**
 * Extract Google Sheet ID from various URL formats or raw ID
 */
export function extractSheetId(input: string): string | null {
    if (!input) return null
    const trimmed = input.trim()

    // Already a raw ID (no slashes, no google domain)
    if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed)) return trimmed

    // Full URL: https://docs.google.com/spreadsheets/d/SHEET_ID/...
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
    if (match) return match[1]

    return null
}

/**
 * Fetch all data from a Google Sheet and format as text context
 */
export async function fetchSheetData(sheetId: string): Promise<SheetData> {
    if (!sheetId) {
        return { text: '', rowCount: 0, sheetNames: [], error: 'Sheet ID boş' }
    }

    // Check cache
    const cached = cache.get(sheetId)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return { text: cached.data, rowCount: cached.rowCount, sheetNames: cached.sheetNames }
    }

    try {
        // Step 1: Get spreadsheet metadata (sheet names)
        const metaRes = await fetch(
            `${SHEETS_API_BASE}/${sheetId}?key=${GOOGLE_SHEETS_API_KEY}&fields=sheets.properties.title`,
            { next: { revalidate: 300 } }
        )

        if (!metaRes.ok) {
            const err = await metaRes.json().catch(() => ({}))
            const msg = err?.error?.message || `HTTP ${metaRes.status}`
            console.error('[GoogleSheets] Metadata fetch failed:', msg)
            return { text: '', rowCount: 0, sheetNames: [], error: `Sheet erişim hatası: ${msg}` }
        }

        const meta = await metaRes.json()
        const sheetNames: string[] = meta.sheets?.map((s: any) => s.properties?.title).filter(Boolean) || []

        if (sheetNames.length === 0) {
            return { text: '', rowCount: 0, sheetNames: [], error: 'Sheet boş veya erişilemiyor' }
        }

        // Step 2: Fetch data from all sheets using batchGet
        const ranges = sheetNames.map(name => encodeURIComponent(name))
        const dataRes = await fetch(
            `${SHEETS_API_BASE}/${sheetId}/values:batchGet?key=${GOOGLE_SHEETS_API_KEY}&ranges=${ranges.join('&ranges=')}`,
            { next: { revalidate: 300 } }
        )

        if (!dataRes.ok) {
            const err = await dataRes.json().catch(() => ({}))
            return { text: '', rowCount: 0, sheetNames, error: `Veri okuma hatası: ${err?.error?.message || dataRes.status}` }
        }

        const dataJson = await dataRes.json()
        const valueRanges = dataJson.valueRanges || []

        // Step 3: Format as readable text
        let totalRows = 0
        const sections: string[] = []

        for (let i = 0; i < valueRanges.length; i++) {
            const range = valueRanges[i]
            const values: string[][] = range.values || []
            if (values.length === 0) continue

            const sheetName = sheetNames[i] || `Sayfa ${i + 1}`
            const headers = values[0]
            const rows = values.slice(1)
            totalRows += rows.length

            if (rows.length === 0) {
                sections.push(`[${sheetName}]\nBaşlıklar: ${headers.join(', ')}\n(Veri yok)`)
                continue
            }

            // Format each row as "Header: Value" pairs
            const rowTexts = rows.map((row, ridx) => {
                const pairs = headers.map((h, cidx) => {
                    const val = row[cidx] || ''
                    return val ? `${h}: ${val}` : null
                }).filter(Boolean)
                return `  ${ridx + 1}. ${pairs.join(' | ')}`
            })

            sections.push(`[${sheetName}]\n${rowTexts.join('\n')}`)
        }

        const text = sections.join('\n\n')

        // Cache the result
        cache.set(sheetId, { data: text, timestamp: Date.now(), rowCount: totalRows, sheetNames })

        return { text, rowCount: totalRows, sheetNames }

    } catch (error: any) {
        console.error('[GoogleSheets] Fetch error:', error?.message || error)
        return { text: '', rowCount: 0, sheetNames: [], error: `Bağlantı hatası: ${error?.message || 'Bilinmeyen'}` }
    }
}

/**
 * Get a preview of the sheet data (for admin testing)
 */
export async function getSheetPreview(sheetId: string): Promise<{
    success: boolean
    sheetNames: string[]
    rowCount: number
    preview: string
    error?: string
}> {
    const result = await fetchSheetData(sheetId)

    if (result.error) {
        return { success: false, sheetNames: [], rowCount: 0, preview: '', error: result.error }
    }

    // Truncate preview to first 1000 chars
    const preview = result.text.length > 1000
        ? result.text.substring(0, 1000) + '\n... (devamı var)'
        : result.text

    return {
        success: true,
        sheetNames: result.sheetNames,
        rowCount: result.rowCount,
        preview
    }
}

/**
 * Clear cache for a specific sheet or all
 */
export function clearSheetCache(sheetId?: string) {
    if (sheetId) {
        cache.delete(sheetId)
    } else {
        cache.clear()
    }
}
