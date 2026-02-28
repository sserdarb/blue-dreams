'use server'

import { prisma } from '@/lib/prisma'

/**
 * Get a page and its widgets by slug and locale.
 * Used by all public pages to load content from the database.
 */
export async function getPageBySlug(slug: string, locale: string) {
  try {
    const page = await prisma.page.findUnique({
      where: {
        slug_locale: { slug, locale },
      },
      include: {
        widgets: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!page) return null

    // Hydrate local-guide widgets with dynamic SerpApi data
    const hasLocalGuide = page.widgets.some(w => w.type === 'local-guide')
    if (hasLocalGuide) {
      let approved: { attractions: string[], events: string[] } = { attractions: [], events: [] }
      try {
        const fs = await import('fs')
        const path = await import('path')
        const approvedPath = path.join(process.cwd(), 'data', 'approved-local-guide.json')
        if (fs.existsSync(approvedPath)) {
          approved = JSON.parse(fs.readFileSync(approvedPath, 'utf-8'))
        }
      } catch (e) { }

      if (approved.attractions.length > 0 || approved.events.length > 0) {
        const { fetchBodrumAttractions, fetchBodrumEvents } = await import('@/lib/services/serpapi')
        const allAttractions = await fetchBodrumAttractions()
        const allEvents = await fetchBodrumEvents()

        const approvedAttractions = allAttractions.filter(a => approved.attractions.includes(a.id)).slice(0, 6)
        const approvedEvents = allEvents.filter(e => approved.events.includes(e.id)).slice(0, 6)

        page.widgets = page.widgets.map(w => {
          if (w.type === 'local-guide') {
            let data = w.data as any
            if (typeof data === 'string') {
              try { data = JSON.parse(data) } catch (e) { data = {} }
            }

            if (approvedAttractions.length > 0) {
              data.attractions = approvedAttractions.map(a => ({
                title: a.title,
                distance: a.address ? a.address.split(',')[0] : '',
                description: a.description,
                image: a.thumbnail,
                tag: a.type || 'Turistik'
              }))
            }
            if (approvedEvents.length > 0) {
              data.events = approvedEvents.map(e => ({
                day: e.date ? e.date.split(' ')[0] : 'Yakın',
                month: e.date ? e.date.split(' ')[1] || '' : '',
                title: e.title,
                time: e.time || '',
                location: e.venue || '',
                description: e.description,
                icon: e.source === 'google_events' ? 'anchor' : 'music'
              }))
            }

            if (typeof w.data === 'string') {
              w.data = JSON.stringify(data)
            } else {
              w.data = data
            }
          }
          return w
        }) as typeof page.widgets
      }
    }

    return page
  } catch (error) {
    console.error(`Error fetching page "${slug}" for locale "${locale}":`, error)
    return null
  }
}

/**
 * Get all pages for a specific locale (used in admin panel)
 */
export async function getAllPages(locale?: string) {
  return await prisma.page.findMany({
    where: locale ? { locale } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { widgets: true } },
    },
  })
}
