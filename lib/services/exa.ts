import Exa from 'exa-js';
import { exaCache } from '@/lib/utils/api-cache';

// Init Exa with the configured API key (or fallback if empty)
export const exa = new Exa(process.env.EXA_API_KEY || '91fe283e-2bbb-4cd7-b7a2-a5be70b9c1bb');

/**
 * Perform an AI-powered semantic search with Exa
 * @param query Natural language or explicit search term
 * @param numResults How many URLs/snippets to return
 * @returns Parsed Exa response (cached 60 min)
 */
export async function searchCompetitorsExa(query: string, numResults: number = 3) {
    const cacheKey = `exa:search:${query}:${numResults}`
    return exaCache.getOrFetch(cacheKey, async () => {
        try {
            const response = await exa.searchAndContents(query, {
                type: "neural",
                useAutoprompt: true,
                numResults,
                text: true,
                highlights: {
                    numSentences: 2,
                    highlightsPerUrl: 1,
                }
            });

            return response.results;
        } catch (error) {
            console.error('[Exa.js] Search error:', error);
            return [];
        }
    }, 60)
}

export function clearExaCache(): void {
    exaCache.invalidatePrefix('exa:')
}
