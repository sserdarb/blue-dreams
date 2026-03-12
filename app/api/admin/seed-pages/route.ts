import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ALL_PAGES } from '@/lib/seed-page-data'

const LOCALES = ['tr', 'en']

async function seedPage(
  slug: string,
  locale: string,
  title: string,
  widgets: { type: string; order?: number; data: Record<string, any> }[]
) {
  const page = await prisma.page.upsert({
    where: { slug_locale: { slug, locale } },
    update: { title, status: 'published', publishedAt: new Date(), visibility: 'public' },
    create: { slug, locale, title, status: 'published', publishedAt: new Date(), visibility: 'public' },
  })

  // Delete old widgets
  await prisma.widget.deleteMany({ where: { pageId: page.id } })

  // Create new widgets
  for (let i = 0; i < widgets.length; i++) {
    const w = widgets[i]
    await prisma.widget.create({
      data: {
        pageId: page.id,
        type: w.type,
        order: w.order ?? i + 1,
        data: JSON.stringify(w.data),
      },
    })
  }

  return page
}

export async function POST() {
  try {
    const results: string[] = []

    for (const pageDef of ALL_PAGES) {
      for (const locale of LOCALES) {
        const slug  = (pageDef.slugMap as any)[locale] || (pageDef.slugMap as any).tr
        const title = (pageDef.titleMap as any)[locale] || (pageDef.titleMap as any).tr
        const widgets = pageDef.widgetFn(locale)

        await seedPage(slug, locale, title, widgets)
        results.push(`✅ ${locale}/${slug} (${title}) – ${widgets.length} widgets`)
      }
    }

    return NextResponse.json({ success: true, seeded: results.length, details: results })
  } catch (error: any) {
    console.error('Seed-pages error:', error)
    return NextResponse.json(
      { success: false, error: error.message, stack: error.stack?.split('\n').slice(0, 5) },
      { status: 500 }
    )
  }
}
