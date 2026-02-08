const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    // Create default admin user
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

    // Create default languages
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
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
