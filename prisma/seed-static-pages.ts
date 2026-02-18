
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const pages = [
    // TR Pages
    { title: 'Blue Dreams Resort', slug: 'home', locale: 'tr' },
    { title: 'Bodrum', slug: 'bodrum', locale: 'tr' },
    { title: 'Düğün & Davet', slug: 'dugun-davet', locale: 'tr' },
    { title: 'Galeri', slug: 'galeri', locale: 'tr' },
    { title: 'Hakkımızda', slug: 'hakkimizda', locale: 'tr' },
    { title: 'İletişim', slug: 'iletisim', locale: 'tr' },
    { title: 'Restoranlar', slug: 'restoran', locale: 'tr' },
    { title: 'Spa & Wellness', slug: 'spa', locale: 'tr' },
    { title: 'Toplantı Salonu', slug: 'toplanti-salonu', locale: 'tr' },
    { title: 'Odalar', slug: 'odalar', locale: 'tr' },
    { title: 'Aile Odaları', slug: 'odalar/aile', locale: 'tr' },
    { title: 'Club Odaları', slug: 'odalar/club', locale: 'tr' },
    { title: 'Deluxe Odalar', slug: 'odalar/deluxe', locale: 'tr' },

    // EN Pages (Corresponding)
    { title: 'Blue Dreams Resort', slug: 'home', locale: 'en' },
    { title: 'Bodrum', slug: 'bodrum', locale: 'en' },
    { title: 'Weddings & Events', slug: 'weddings-events', locale: 'en' }, // slug might differ? staying consistent with folder name usually better but let's assume direct translation or mapped. 
    // Wait, folder is 'dugun-davet'. Next.js i18n routing usually keeps slug same or localized? 
    // If [locale]/[...slug], then 'en/dugun-davet' works unless we have rewriting.
    // The user didn't specify rewriting. Let's use same slugs for simple routing match, 
    // OR localized slugs if we want better SEO.
    // Given the strictly static structure 'app/[locale]/dugun-davet', the slug IS 'dugun-davet'.
    // So for EN, the slug must ALSO be 'dugun-davet' unless we have a mapping.
    // I will use same slugs to ensure functionality first.

    { title: 'Weddings & Events', slug: 'dugun-davet', locale: 'en' },
    { title: 'Gallery', slug: 'galeri', locale: 'en' },
    { title: 'About Us', slug: 'hakkimizda', locale: 'en' },
    { title: 'Contact', slug: 'iletisim', locale: 'en' },
    { title: 'Dining', slug: 'restoran', locale: 'en' },
    { title: 'Spa & Wellness', slug: 'spa', locale: 'en' },
    { title: 'Meeting Rooms', slug: 'toplanti-salonu', locale: 'en' },
    { title: 'Accommodation', slug: 'odalar', locale: 'en' },
    { title: 'Family Rooms', slug: 'odalar/aile', locale: 'en' },
    { title: 'Club Rooms', slug: 'odalar/club', locale: 'en' },
    { title: 'Deluxe Rooms', slug: 'odalar/deluxe', locale: 'en' },
]

async function main() {
    console.log('Start seeding static pages...')

    for (const p of pages) {
        const page = await prisma.page.upsert({
            where: {
                slug_locale: {
                    slug: p.slug,
                    locale: p.locale,
                },
            },
            update: {}, // Don't overwrite if exists
            create: {
                title: p.title,
                slug: p.slug,
                locale: p.locale,
                metaDescription: \`\${p.title} - Blue Dreams Resort\`,
        widgets: {
          create: [
            {
              type: 'HeroSection',
              order: 0,
              data: JSON.stringify({
                title: p.title,
                subtitle: 'Welcome to Blue Dreams Resort',
                backgroundImage: '/images/hero-default.jpg', // Placeholder
              }),
            },
            {
              type: 'TextBlock',
              order: 1,
              data: JSON.stringify({
                content: \`<h2>\${p.title}</h2><p>Content for \${p.title} will be managed here.</p>\`,
              }),
            },
          ],
        },
      },
    })
    console.log(\`Upserted page: \${page.title} (\${page.slug}/\${page.locale})\`)
  }

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
