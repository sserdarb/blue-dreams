const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const where = {
            OR: [
                { phone: "378563394392" },
                { socialId: "378563394392" }
            ]
        };

        console.log("Testing findMany...");
        const messages = await prisma.socialMessage.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: 0,
            take: 50,
        });

        console.log("Success! Messages:", messages.length);
    } catch (e) {
        console.error("ERROR REPRODUCED:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
