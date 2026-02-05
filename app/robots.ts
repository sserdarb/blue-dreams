import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://new.bluedreamsresort.com'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/_next/',
                    '/*/admin/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
