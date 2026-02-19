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
