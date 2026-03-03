import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const locales = ['tr', 'en', 'de', 'ru'];
const missingItems = [
    { label: { tr: 'Sürdürülebilirlik', en: 'Sustainability', de: 'Nachhaltigkeit', ru: 'Устойчивое развитие' }, url: '/surdurulebilirlik' },
    { label: { tr: 'Spor & Aktivite', en: 'Sports & Activities', de: 'Sport & Aktivitäten', ru: 'Спорт и Активности' }, url: '/spor' },
    { label: { tr: 'KVKK & Gizlilik', en: 'Privacy Policy', de: 'Datenschutzrichtlinie', ru: 'Политика конфиденциальности' }, url: '/kvkk' },
    { label: { tr: 'Rezervasyon', en: 'Booking', de: 'Reservierung', ru: 'Бронирование' }, url: '/booking' },
];

async function main() {
    console.log('Starting seed for missing menu items...');

    for (const locale of locales) {
        console.log(`Processing locale: ${locale}`);

        let orderMax = 10; // Start at the end of existing items
        const existingItems = await prisma.menuItem.findMany({
            where: { locale, parentId: null }
        });

        if (existingItems.length > 0) {
            orderMax = Math.max(...existingItems.map(i => i.order)) + 1;
        }

        for (const item of missingItems) {
            const urlPath = `/${locale}${item.url}`;
            const existing = await prisma.menuItem.findFirst({
                where: { locale, url: urlPath }
            });

            if (!existing) {
                const label = item.label[locale as keyof typeof item.label];
                await prisma.menuItem.create({
                    data: {
                        locale,
                        label,
                        url: urlPath,
                        order: orderMax,
                        isActive: true
                    }
                });
                console.log(`Added ${label} (${urlPath}) to ${locale}`);
                orderMax++;
            } else {
                console.log(`Already exists: ${existing.label} (${urlPath})`);
            }
        }
    }

    console.log('Seed completed successfully!');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
