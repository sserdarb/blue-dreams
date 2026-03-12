export const dynamic = 'force-dynamic'

import { getPageBySlug } from '@/app/actions/page-actions'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'
import { FactsheetWidget } from '@/components/widgets/FactsheetWidget'
import { defaultFactsheetData } from '@/components/admin/widget-editors/FactsheetEditor'
import { prisma } from '@/lib/prisma'
import React from 'react'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const page = await getPageBySlug('factsheet', locale)

  return {
    title: page?.title || 'Blue Dreams Resort - Factsheet',
    description: page?.metaDescription || 'Blue Dreams Resort 2026 Season Factsheet. Overview, location, accommodation, dining, and facilities.',
  }
}

/**
 * Auto-seed the factsheet page in the CMS database if it doesn't exist yet.
 * This ensures admins can always find and edit it from the Pages panel.
 */
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
      console.log(`✅ Auto-created factsheet page for locale: ${locale}`)
    }
  } catch (err) {
    console.error('Failed to auto-seed factsheet page:', err)
  }
}

export default async function FactsheetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  // Auto-seed the page in the DB so admins can find it
  await ensureFactsheetPage(locale)

  const page = await getPageBySlug('factsheet', locale)

  // If still no widgets (shouldn't happen after seed), use defaults
  if (!page || !page.widgets || page.widgets.length === 0) {
    return <FactsheetWidget data={defaultFactsheetData} />
  }

  const widgets = page.widgets.map(w => ({ id: w.id, type: w.type, data: w.data }))

  return <WidgetRenderer widgets={widgets} />
}
