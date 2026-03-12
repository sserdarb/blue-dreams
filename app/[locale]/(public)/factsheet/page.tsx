export const dynamic = 'force-dynamic'

import { getPageBySlug } from '@/app/actions/page-actions'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'
import { FactsheetWidget } from '@/components/widgets/FactsheetWidget'
import { defaultFactsheetData } from '@/components/admin/widget-editors/FactsheetEditor'
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

export default async function FactsheetPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const page = await getPageBySlug('factsheet', locale)

  // If the page is not created in the CMS yet, display the default factsheet to ensure it's always available
  if (!page || !page.widgets || page.widgets.length === 0) {
    return <FactsheetWidget data={defaultFactsheetData} />
  }

  const widgets = page.widgets.map(w => ({ id: w.id, type: w.type, data: w.data }))

  return <WidgetRenderer widgets={widgets} />
}
