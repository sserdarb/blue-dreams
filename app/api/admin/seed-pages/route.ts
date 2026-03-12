import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/seed-pages
 * Seeds all CMS pages with their widgets from the seed helper files.
 * Uses upsert: creates pages if missing, updates if existing.
 * All pages are set to 'published' status.
 */
export async function POST() {
  try {
    const results: string[] = []

    // Import seed helpers (CommonJS modules)
    const path = require('path')
    const seedHelpersPath = path.join(process.cwd(), 'prisma', 'seed-helpers.js')
    const seedPagesPath = path.join(process.cwd(), 'prisma', 'seed-pages.js')

    // Clear require cache to get fresh data
    delete require.cache[require.resolve(seedHelpersPath)]
    delete require.cache[require.resolve(seedPagesPath)]

    const { homeWidgets } = require(seedHelpersPath)
    const {
      aboutWidgets,
      roomsWidgets,
      restaurantWidgets,
      spaWidgets,
      contactWidgets,
      weddingWidgets,
      galleryWidgets,
      meetingWidgets,
      bodrumWidgets
    } = require(seedPagesPath)

    const locales = ['tr', 'en', 'de', 'ru']

    // Define all pages with their locale-specific slugs
    const pageDefinitions = [
      {
        titleMap: { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite', ru: 'Главная' },
        slugMap: { tr: 'home', en: 'home', de: 'home', ru: 'home' },
        widgetFn: homeWidgets,
      },
      {
        titleMap: { tr: 'Hakkımızda', en: 'About Us', de: 'Über Uns', ru: 'О нас' },
        slugMap: { tr: 'hakkimizda', en: 'about', de: 'about', ru: 'about' },
        widgetFn: aboutWidgets,
      },
      {
        titleMap: { tr: 'Odalar & Süitler', en: 'Rooms & Suites', de: 'Zimmer & Suiten', ru: 'Номера и Люксы' },
        slugMap: { tr: 'odalar', en: 'rooms', de: 'rooms', ru: 'rooms' },
        widgetFn: roomsWidgets,
      },
      {
        titleMap: { tr: 'Restoran & Bar', en: 'Restaurant & Bar', de: 'Restaurant & Bar', ru: 'Ресторан и Бар' },
        slugMap: { tr: 'restoran', en: 'restaurant', de: 'restaurant', ru: 'restaurant' },
        widgetFn: restaurantWidgets,
      },
      {
        titleMap: { tr: 'Spa & Wellness', en: 'Spa & Wellness', de: 'Spa & Wellness', ru: 'Спа и Велнес' },
        slugMap: { tr: 'spa', en: 'spa', de: 'spa', ru: 'spa' },
        widgetFn: spaWidgets,
      },
      {
        titleMap: { tr: 'İletişim', en: 'Contact', de: 'Kontakt', ru: 'Контакты' },
        slugMap: { tr: 'iletisim', en: 'contact', de: 'contact', ru: 'contact' },
        widgetFn: contactWidgets,
      },
      {
        titleMap: { tr: 'Düğün & Davet', en: 'Wedding & Events', de: 'Hochzeit & Events', ru: 'Свадьба и Мероприятия' },
        slugMap: { tr: 'dugun-davet', en: 'wedding', de: 'wedding', ru: 'wedding' },
        widgetFn: weddingWidgets,
      },
      {
        titleMap: { tr: 'Galeri', en: 'Gallery', de: 'Galerie', ru: 'Галерея' },
        slugMap: { tr: 'galeri', en: 'gallery', de: 'gallery', ru: 'gallery' },
        widgetFn: galleryWidgets,
      },
      {
        titleMap: { tr: 'Toplantı & Etkinlik', en: 'Meeting & Events', de: 'Tagung & Events', ru: 'Конференции' },
        slugMap: { tr: 'toplanti-salonu', en: 'meeting-room', de: 'meeting-room', ru: 'meeting-room' },
        widgetFn: meetingWidgets,
      },
      {
        titleMap: { tr: 'Bodrum Rehberi', en: 'Bodrum Guide', de: 'Bodrum Reiseführer', ru: 'Путеводитель по Бодруму' },
        slugMap: { tr: 'bodrum', en: 'bodrum', de: 'bodrum', ru: 'bodrum' },
        widgetFn: bodrumWidgets,
      },
    ]

    for (const locale of locales) {
      for (const pageDef of pageDefinitions) {
        const slug = pageDef.slugMap[locale as keyof typeof pageDef.slugMap] || pageDef.slugMap.tr
        const title = pageDef.titleMap[locale as keyof typeof pageDef.titleMap] || pageDef.titleMap.tr
        const widgets = pageDef.widgetFn(locale)

        // Upsert the page
        const page = await prisma.page.upsert({
          where: { slug_locale: { slug, locale } },
          update: { title, status: 'published' },
          create: {
            slug,
            locale,
            title,
            status: 'published',
            visibility: 'public',
            template: 'default',
          },
        })

        // Delete old widgets for this page
        await prisma.widget.deleteMany({ where: { pageId: page.id } })

        // Create new widgets
        for (let i = 0; i < widgets.length; i++) {
          const w = widgets[i]
          await prisma.widget.create({
            data: {
              pageId: page.id,
              type: w.type,
              data: typeof w.data === 'string' ? w.data : JSON.stringify(w.data),
              order: w.order ?? (i + 1),
            },
          })
        }

        results.push(`✅ ${locale}/${slug} — ${title} (${widgets.length} widgets)`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Seeded ${results.length} pages successfully`,
      details: results,
    })
  } catch (error: any) {
    console.error('Seed pages error:', error)
    return NextResponse.json(
      { error: 'Failed to seed pages', details: error.message },
      { status: 500 }
    )
  }
}
