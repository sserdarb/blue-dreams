export const dynamic = 'force-dynamic'

import { getPageBySlug } from '@/app/actions/page-actions'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'
import { FactsheetWidget } from '@/components/widgets/FactsheetWidget'
import { defaultFactsheetData } from '@/lib/factsheet-defaults'
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
    const existing = await prisma.page.findUnique({
      where: { slug_locale: { slug: 'factsheet', locale } },
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
              data: JSON.stringify(defaultFactsheetData),
              order: 0,
            }],
          },
        },
      })
    }
  } catch (err) {
    console.error('Failed to auto-seed factsheet page:', err)
  }
}

export default async function FactsheetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  await ensureFactsheetPage(locale)

  const page = await getPageBySlug('factsheet', locale)

  if (!page || !page.widgets || page.widgets.length === 0) {
    return <FactsheetWidget data={defaultFactsheetData} />
  }

  const widgets = page.widgets.map(w => ({ id: w.id, type: w.type, data: w.data }))

  return <WidgetRenderer widgets={widgets} />
}
