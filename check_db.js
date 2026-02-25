const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const page = await prisma.page.findFirst({ where: { slug: 'spa' } });
    console.log(page);
    const spa = await prisma.spa.findFirst();
    console.log(spa);
}
main().catch(console.error).finally(() => prisma.$disconnect());
