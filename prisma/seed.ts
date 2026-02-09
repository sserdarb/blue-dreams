const { PrismaClient } = require('@prisma/client')
const { seedPage, homeWidgets } = require('./seed-helpers')
const { aboutWidgets, roomsWidgets, restaurantWidgets, spaWidgets, contactWidgets, weddingWidgets, galleryWidgets, meetingWidgets, bodrumWidgets } = require('./seed-pages')

const prisma = new PrismaClient()

async function main() {
    // ===========================
    // 1. Default Admin User
    // ===========================
    const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: 'sserdarb@gmail.com' }
    })

    if (!existingAdmin) {
        await prisma.adminUser.create({
            data: {
                email: 'sserdarb@gmail.com',
                password: 'Tuba@2015Tuana',
                name: 'Serdar',
                role: 'superadmin',
                isActive: true,
            }
        })
        console.log('✅ Default admin user created: sserdarb@gmail.com')
    } else {
        console.log('ℹ️ Admin user already exists: sserdarb@gmail.com')
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
    const pageDefs = [
        { slug: 'home', titleFn: (l: string) => l === 'tr' ? 'Ana Sayfa' : l === 'en' ? 'Home' : l === 'de' ? 'Startseite' : 'Главная', widgetsFn: homeWidgets },
        { slug: 'hakkimizda', titleFn: (l: string) => l === 'tr' ? 'Hakkımızda' : l === 'en' ? 'About Us' : l === 'de' ? 'Über Uns' : 'О нас', widgetsFn: aboutWidgets },
        { slug: 'odalar', titleFn: (l: string) => l === 'tr' ? 'Odalar' : l === 'en' ? 'Rooms' : l === 'de' ? 'Zimmer' : 'Номера', widgetsFn: roomsWidgets },
        { slug: 'restoran', titleFn: (l: string) => l === 'tr' ? 'Restoran' : l === 'en' ? 'Restaurant' : l === 'de' ? 'Restaurant' : 'Ресторан', widgetsFn: restaurantWidgets },
        { slug: 'spa', titleFn: (l: string) => l === 'tr' ? 'Spa & Wellness' : l === 'en' ? 'Spa & Wellness' : l === 'de' ? 'Spa & Wellness' : 'Спа и Велнес', widgetsFn: spaWidgets },
        { slug: 'iletisim', titleFn: (l: string) => l === 'tr' ? 'İletişim' : l === 'en' ? 'Contact' : l === 'de' ? 'Kontakt' : 'Контакты', widgetsFn: contactWidgets },
        { slug: 'dugun-davet', titleFn: (l: string) => l === 'tr' ? 'Düğün & Davet' : l === 'en' ? 'Wedding & Events' : l === 'de' ? 'Hochzeit & Events' : 'Свадьба и Мероприятия', widgetsFn: weddingWidgets },
        { slug: 'galeri', titleFn: (l: string) => l === 'tr' ? 'Galeri' : l === 'en' ? 'Gallery' : l === 'de' ? 'Galerie' : 'Галерея', widgetsFn: galleryWidgets },
        { slug: 'toplanti-salonu', titleFn: (l: string) => l === 'tr' ? 'Toplantı Salonu' : l === 'en' ? 'Meeting Rooms' : l === 'de' ? 'Tagungsräume' : 'Конференц-залы', widgetsFn: meetingWidgets },
        { slug: 'bodrum', titleFn: (l: string) => l === 'tr' ? 'Bodrum Rehberi' : l === 'en' ? 'Bodrum Guide' : l === 'de' ? 'Bodrum Reiseführer' : 'Путеводитель', widgetsFn: bodrumWidgets },
    ]

    for (const pageDef of pageDefs) {
        for (const locale of locales) {
            await seedPage(pageDef.slug, locale, pageDef.titleFn(locale), pageDef.widgetsFn(locale))
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
