const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const { seedPage, homeWidgets } = require('./seed-helpers')
const { aboutWidgets, roomsWidgets, restaurantWidgets, spaWidgets, contactWidgets, weddingWidgets, galleryWidgets, meetingWidgets, bodrumWidgets } = require('./seed-pages')

const prisma = new PrismaClient()

async function main() {
    // ===========================
    // 1. Default Admin User
    // ===========================
    const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: '***REDACTED_EMAIL***' }
    })

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('***REDACTED_ADMIN_PASSWORD***', 10)
        await prisma.adminUser.create({
            data: {
                email: '***REDACTED_EMAIL***',
                password: hashedPassword,
                name: 'Serdar',
                role: 'superadmin',
                isActive: true,
            }
        })
        console.log('✅ Default admin user created: ***REDACTED_EMAIL***')
    } else {
        console.log('ℹ️ Admin user already exists: ***REDACTED_EMAIL***')
    }

    // ===========================
    // 2. Languages
    // ===========================
    const languages = [
        { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe', flag: '🇹🇷', isDefault: true, order: 0 },
        { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', isDefault: false, order: 1 },
        { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: '🇩🇪', isDefault: false, order: 2 },
        { code: 'ru', name: 'Русский', nativeName: 'Русский', flag: '🇷🇺', isDefault: false, order: 3 },
    ]

    for (const lang of languages) {
        await prisma.language.upsert({
            where: { code: lang.code },
            update: {},
            create: lang,
        })
    }
    console.log('✅ Languages seeded')

    // ===========================
    // 3. Pages & Widgets (All Locales)
    // ===========================
    console.log('\n📄 Seeding Pages & Widgets...')

    const locales = ['tr', 'en', 'de', 'ru']

    function getTitle(slug, l) {
        const titles = {
            'home': { tr: 'Ana Sayfa', en: 'Home', de: 'Startseite', ru: 'Главная' },
            'hakkimizda': { tr: 'Hakkımızda', en: 'About Us', de: 'Über Uns', ru: 'О нас' },
            'odalar': { tr: 'Odalar', en: 'Rooms', de: 'Zimmer', ru: 'Номера' },
            'restoran': { tr: 'Restoran', en: 'Restaurant', de: 'Restaurant', ru: 'Ресторан' },
            'spa': { tr: 'Spa & Wellness', en: 'Spa & Wellness', de: 'Spa & Wellness', ru: 'Спа и Велнес' },
            'iletisim': { tr: 'İletişim', en: 'Contact', de: 'Kontakt', ru: 'Контакты' },
            'dugun-davet': { tr: 'Düğün & Davet', en: 'Wedding & Events', de: 'Hochzeit & Events', ru: 'Свадьба и Мероприятия' },
            'galeri': { tr: 'Galeri', en: 'Gallery', de: 'Galerie', ru: 'Галерея' },
            'toplanti-salonu': { tr: 'Toplantı Salonu', en: 'Meeting Rooms', de: 'Tagungsräume', ru: 'Конференц-залы' },
            'bodrum': { tr: 'Bodrum Rehberi', en: 'Bodrum Guide', de: 'Bodrum Reiseführer', ru: 'Путеводитель' },
        }
        return (titles[slug] && titles[slug][l]) || slug
    }

    const pageDefs = [
        { slug: 'home', widgetsFn: homeWidgets },
        { slug: 'hakkimizda', widgetsFn: aboutWidgets },
        { slug: 'odalar', widgetsFn: roomsWidgets },
        { slug: 'restoran', widgetsFn: restaurantWidgets },
        { slug: 'spa', widgetsFn: spaWidgets },
        { slug: 'iletisim', widgetsFn: contactWidgets },
        { slug: 'dugun-davet', widgetsFn: weddingWidgets },
        { slug: 'galeri', widgetsFn: galleryWidgets },
        { slug: 'toplanti-salonu', widgetsFn: meetingWidgets },
        { slug: 'bodrum', widgetsFn: bodrumWidgets },
    ]

    for (const pageDef of pageDefs) {
        for (const locale of locales) {
            await seedPage(pageDef.slug, locale, getTitle(pageDef.slug, locale), pageDef.widgetsFn(locale))
        }
    }

    console.log('\n🎉 Seed completed successfully!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
