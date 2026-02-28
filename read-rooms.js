require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const page = await prisma.page.findFirst({
        where: { slug: 'home', locale: 'tr' },
        include: { widgets: true }
    });
    if (!page) return console.log('Page not found');
    const roomWidgets = page.widgets.filter(w => w.type.includes('room') || w.type.toLowerCase().includes('accommodation'));
    console.log(JSON.stringify(roomWidgets, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
