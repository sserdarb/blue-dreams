const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Create odalar page with room-booking widget
    const page = await prisma.page.upsert({
        where: { slug_locale: { slug: 'odalar', locale: 'tr' } },
        update: {},
        create: {
            slug: 'odalar',
            locale: 'tr',
            title: 'Odalarımız',
            metaDescription: 'Blue Dreams Resort odaları ve fiyatları',
            widgets: {
                create: [
                    {
                        type: 'room-booking',
                        order: 0,
                        data: JSON.stringify({
                            title: 'Odalarımız & Fiyatlar',
                            subtitle: 'Tarih seçerek müsaitlik ve güncel fiyatları görüntüleyin.',
                            eyebrow: 'ONLİNE REZERVASYON'
                        })
                    }
                ]
            }
        }
    });
    console.log('Created page:', page.id, page.slug);

    // Create homepage
    await prisma.page.upsert({
        where: { slug_locale: { slug: '', locale: 'tr' } },
        update: {},
        create: {
            slug: '',
            locale: 'tr',
            title: 'Blue Dreams Resort',
            metaDescription: 'Blue Dreams Resort & Spa',
            widgets: {
                create: [
                    {
                        type: 'hero',
                        order: 0,
                        data: JSON.stringify({
                            title: 'Blue Dreams Resort & Spa',
                            subtitle: 'Bodrum\'un en güzel koyunda tatil deneyimi',
                            backgroundImage: '/images/hero.jpg'
                        })
                    }
                ]
            }
        }
    });
    console.log('Homepage created');

    // Create admin user
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('blueconcierge', 10);
    await prisma.adminUser.upsert({
        where: { email: 'admin@bluedreams.com' },
        update: {},
        create: {
            email: 'admin@bluedreams.com',
            password: hash,
            name: 'Admin',
            role: 'superadmin'
        }
    });
    console.log('Admin user created');
}

main().catch(console.error).finally(() => prisma.$disconnect());
