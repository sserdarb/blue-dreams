const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    let config = await prisma.analyticsConfig.findFirst();
    if (config) {
        await prisma.analyticsConfig.update({
            where: { id: config.id },
            data: { gaId: 'G-KHMZFFEDPJ' }
        });
        console.log('Updated existing config');
    } else {
        await prisma.analyticsConfig.create({
            data: { gaId: 'G-KHMZFFEDPJ' }
        });
        console.log('Created new config');
    }
}
main().catch(console.error).finally(() => prisma.$disconnect());
