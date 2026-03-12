export const dynamic = 'force-dynamic'

import { getPageBySlug } from '@/app/actions/page-actions'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'
import { FactsheetWidget } from '@/components/widgets/FactsheetWidget'
import { getFactsheetDataForLocale, defaultFactsheetData } from '@/lib/factsheet-defaults'
import { prisma } from '@/lib/prisma'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  return {
    title: 'Blue Dreams Resort - Factsheet',
    description: 'Blue Dreams Resort 2026 Season Factsheet. Overview, location, accommodation, dining, and facilities.',
  }
}

async function ensureFactsheetPage(locale: string) {
  try {
    const localeData = getFactsheetDataForLocale(locale)
    const existing = await prisma.page.findUnique({
      where: { slug_locale: { slug: 'factsheet', locale } },
      include: { widgets: true },
    })

    if (!existing) {
      await prisma.page.create({
        data: {
          slug: 'factsheet',
          locale,
          title: 'Factsheet',
          metaDescription: 'Blue Dreams Resort 2026 Season Factsheet',
          status: 'published',
          visibility: 'public',
          template: 'full-width',
          widgets: {
            create: [{
              type: 'factsheet',
              name: 'Factsheet Content',
              data: JSON.stringify(localeData),
              order: 0,
            }],
          },
        },
      })
    } else {
      // Check if the existing widget has stale data (e.g. English on a TR page)
      const fsWidget = existing.widgets.find(w => w.type === 'factsheet')
      if (fsWidget) {
        try {
          const currentData = typeof fsWidget.data === 'string' ? JSON.parse(fsWidget.data as string) : fsWidget.data
          // If the hero title doesn't match our locale default, update it
          if (currentData?.hero?.title && currentData.hero.title !== localeData.hero.title) {
            await prisma.widget.update({
              where: { id: fsWidget.id },
              data: { data: JSON.stringify(localeData) },
            })
          }
        } catch {}
      }
    }
  } catch (err) {
    console.error('Failed to auto-seed factsheet page:', err)
  }
}

export default async function FactsheetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  await ensureFactsheetPage(locale)

  const page = await getPageBySlug('factsheet', locale)

  // If we have a page with a factsheet widget, use it directly
  if (page && page.widgets && page.widgets.length > 0) {
    const fsWidget = page.widgets.find((w: any) => w.type === 'factsheet')
    if (fsWidget) {
      let widgetData = fsWidget.data
      // Handle string-encoded data
      if (typeof widgetData === 'string') {
        try { widgetData = JSON.parse(widgetData) } catch { widgetData = null }
      }
      // Still stringified? (double-encoded edge case)
      if (typeof widgetData === 'string') {
        try { widgetData = JSON.parse(widgetData) } catch { widgetData = null }
      }
      if (widgetData && widgetData.hero) {
        return <FactsheetWidget data={widgetData} />
      }
    }
    // Try WidgetRenderer for non-factsheet widget pages
    const widgets = page.widgets.map((w: any) => ({ id: w.id, type: w.type, data: w.data }))
    return <WidgetRenderer widgets={widgets} />
  }

  // Fallback to locale defaults
  return <FactsheetWidget data={getFactsheetDataForLocale(locale)} />
}
