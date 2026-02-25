import { prisma } from '@/lib/prisma'

// Default model — gemini-2.0-flash (current production model)
export const GEMINI_MODEL = 'gemini-2.0-flash'

// REST API model path (for routes using raw fetch instead of SDK)
export const GEMINI_REST_MODEL = 'gemini-2.0-flash'

/**
 * Pool of backup API keys for automatic failover.
 * If the primary key (from DB or env) hits 429/quota, the system
 * rotates through these backup keys automatically.
 */
const BACKUP_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[]

// Track which keys are temporarily exhausted (in-memory, resets on restart)
const exhaustedKeys = new Map<string, number>() // key -> exhausted until (timestamp)
const EXHAUSTED_TTL = 60 * 60 * 1000 // 1 hour cooldown for exhausted keys

/**
 * Get the Gemini API key with 3-tier fallback + rotation:
 *   1. Database (AiSettings.apiKey) — admin panel configurable
 *   2. Environment variable pool (GEMINI_API_KEY, _2, _3)
 *   3. Empty string (caller should handle missing key)
 * 
 * Keys that recently returned 429 are deprioritized.
 */
export async function getGeminiApiKey(locale = 'tr'): Promise<{ key: string; source: string }> {
    const now = Date.now()

    // Clean expired exhaustion markers
    for (const [k, until] of exhaustedKeys) {
        if (now > until) exhaustedKeys.delete(k)
    }

    // 1. Try database first (admin-configurable)
    try {
        const settings = await prisma.aiSettings.findFirst({
            where: { language: locale },
            select: { apiKey: true }
        })
        if (settings?.apiKey && !exhaustedKeys.has(settings.apiKey)) {
            return { key: settings.apiKey, source: 'database' }
        }
    } catch (e) {
        // DB might not be ready yet, fall through
    }

    // 2. Environment variable pool — pick the first non-exhausted key
    for (const envKey of BACKUP_KEYS) {
        if (envKey && !exhaustedKeys.has(envKey)) {
            return { key: envKey, source: 'env' }
        }
    }

    // 3. All keys exhausted — return the DB/env key anyway (will get 429, but at least tries)
    try {
        const settings = await prisma.aiSettings.findFirst({
            where: { language: locale },
            select: { apiKey: true }
        })
        if (settings?.apiKey) {
            return { key: settings.apiKey, source: 'database (exhausted)' }
        }
    } catch { }

    const envKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
    if (envKey) {
        return { key: envKey, source: 'env (exhausted)' }
    }

    // 4. No key found at all
    return { key: '', source: 'none' }
}

/**
 * Mark a key as temporarily exhausted (called after 429).
 */
export function markKeyExhausted(key: string) {
    exhaustedKeys.set(key, Date.now() + EXHAUSTED_TTL)
    console.log(`[AI Config] Key ${key.substring(0, 10)}... marked exhausted for 1 hour`)
}

/**
 * Get the next available key (different from the exhausted one).
 * Returns null if no alternative key is available.
 */
export async function getAlternativeKey(exhaustedKey: string, locale = 'tr'): Promise<{ key: string; source: string } | null> {
    markKeyExhausted(exhaustedKey)

    // Try to get a different key
    const result = await getGeminiApiKey(locale)
    if (result.key && result.key !== exhaustedKey) {
        return result
    }

    return null
}

// Legacy export for backward compat (env var only, synchronous)
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
