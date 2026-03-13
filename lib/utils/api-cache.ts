// ─── Unified In-Memory TTL Cache ────────────────────────────────
// Generic cache utility used across all API services.
// Supports: get/set/invalidate/getOrFetch pattern
// Thread-safe for Node.js (single-threaded event loop)

interface CacheEntry<T> {
    data: T
    expiresAt: number
}

export class ApiCache {
    private store = new Map<string, CacheEntry<any>>()
    private defaultTTL: number

    /**
     * @param defaultTTLMinutes Default time-to-live in minutes
     */
    constructor(defaultTTLMinutes: number = 15) {
        this.defaultTTL = defaultTTLMinutes * 60 * 1000
    }

    /** Get cached value if not expired */
    get<T>(key: string): T | null {
        const entry = this.store.get(key)
        if (!entry) return null
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key)
            return null
        }
        return entry.data as T
    }

    /** Set value with optional custom TTL (in minutes) */
    set<T>(key: string, data: T, ttlMinutes?: number): void {
        const ttl = ttlMinutes ? ttlMinutes * 60 * 1000 : this.defaultTTL
        this.store.set(key, {
            data,
            expiresAt: Date.now() + ttl,
        })
    }

    /** Get cached value or fetch from async source */
    async getOrFetch<T>(
        key: string,
        fetcher: () => Promise<T>,
        ttlMinutes?: number
    ): Promise<T> {
        const cached = this.get<T>(key)
        if (cached !== null) return cached

        const data = await fetcher()
        this.set(key, data, ttlMinutes)
        return data
    }

    /** Invalidate a specific key */
    invalidate(key: string): void {
        this.store.delete(key)
    }

    /** Invalidate all keys matching a prefix */
    invalidatePrefix(prefix: string): void {
        for (const key of this.store.keys()) {
            if (key.startsWith(prefix)) {
                this.store.delete(key)
            }
        }
    }

    /** Clear all cached data */
    clear(): void {
        this.store.clear()
    }

    /** Get cache stats for monitoring */
    getStats(): { size: number; keys: string[] } {
        // Clean expired entries first
        const now = Date.now()
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.expiresAt) this.store.delete(key)
        }
        return {
            size: this.store.size,
            keys: Array.from(this.store.keys()),
        }
    }
}

// ─── Pre-configured Cache Instances ────────────────────────────

/** ERP services cache (purchasing, accounting, finance, hr) — 30 min TTL */
export const erpCache = new ApiCache(30)

/** Meta Social API cache — 15 min TTL */
export const metaCache = new ApiCache(15)

/** BigData analytics cache — 15 min TTL */
export const bigdataCache = new ApiCache(15)

/** ASISIA PMS cache — 10 min TTL */
export const asisiaCache = new ApiCache(10)

/** Exa AI search cache — 6 hour TTL */
export const exaCache = new ApiCache(360)

/** Scraper cache (competitor rates) — 24 hour TTL */
export const scraperCache = new ApiCache(1440)

/** Master invalidation for nightly sync */
export function invalidateAllCaches(): void {
    erpCache.clear()
    metaCache.clear()
    bigdataCache.clear()
    asisiaCache.clear()
    exaCache.clear()
    scraperCache.clear()
    console.log('[ApiCache] All caches invalidated')
}
