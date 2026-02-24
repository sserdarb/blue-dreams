import { prisma } from '@/lib/prisma'

// Default model — gemini-1.5-flash has higher rate limits and better performance
export const GEMINI_MODEL = 'gemini-1.5-flash'

// REST API model path (for routes using raw fetch instead of SDK)
export const GEMINI_REST_MODEL = 'gemini-1.5-flash'

/**
 * Get the Gemini API key with 3-tier fallback:
 *   1. Database (AiSettings.apiKey) — admin panel configurable
 *   2. Environment variable (GEMINI_API_KEY)
 *   3. Empty string (caller should handle missing key)
 */
export async function getGeminiApiKey(locale = 'tr'): Promise<{ key: string; source: string }> {
    // 1. Try database first (admin-configurable)
    try {
        const settings = await prisma.aiSettings.findFirst({
            where: { language: locale },
            select: { apiKey: true }
        })
        if (settings?.apiKey) {
            return { key: settings.apiKey, source: 'database' }
        }
    } catch (e) {
        // DB might not be ready yet, fall through
    }

    // 2. Environment variable
    const envKey = process.env.GEMINI_API_KEY
    if (envKey) {
        return { key: envKey, source: 'env' }
    }

    // 3. No key found
    return { key: '', source: 'none' }
}

// Legacy export for backward compat (env var only, synchronous)
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
