import type { MetadataRoute } from 'next'

const baseUrl = 'https://new.bluedreamsresort.com'
const locales = ['tr', 'en', 'de', 'ru']

// All public pages
const pages = [
    '',
    '/odalar',
    '/odalar/club',
    '/odalar/deluxe',
    '/odalar/family',
    '/restoran',
    '/spa',
    '/toplanti-salonu',
    '/galeri',
    '/hakkimizda',
    '/iletisim',
]

export default function sitemap(): MetadataRoute.Sitemap {
    const entries: MetadataRoute.Sitemap = []

    // Generate entries for each locale and page
    for (const locale of locales) {
        for (const page of pages) {
            const url = `${baseUrl}/${locale}${page}`

            // Priority based on page type
            let priority = 0.7
            if (page === '') priority = 1.0 // Homepage
            else if (page === '/odalar') priority = 0.9
            else if (page.startsWith('/odalar/')) priority = 0.8

            // Change frequency based on content type
            let changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly'
            if (page === '') changeFrequency = 'daily'
            else if (page === '/galeri') changeFrequency = 'monthly'

            entries.push({
                url,
                lastModified: new Date(),
                changeFrequency,
                priority,
                alternates: {
                    languages: Object.fromEntries(
                        locales.map(loc => [loc, `${baseUrl}/${loc}${page}`])
                    ),
                },
            })
        }
    }

    return entries
}
