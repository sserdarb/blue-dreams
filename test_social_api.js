const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const rawConversations = await prisma.$queryRaw`
            SELECT 
                COALESCE("phone", "socialId") as identifier,
                "platform",
                COUNT(*) as _count,
                MAX("createdAt") as lastMessageAt
            FROM "SocialMessage"
            GROUP BY COALESCE("phone", "socialId"), "platform"
            ORDER BY MAX("createdAt") DESC
            LIMIT 100 OFFSET 0
        `;

        console.log("Raw query success:", rawConversations.length, "conversations found.");

        const enriched = await Promise.all(
            rawConversations.map(async (conv) => {
                const guest = await prisma.guestProfile.findFirst({
                    where: {
                        phone: conv.identifier
                    },
                    select: { id: true, name: true, surname: true, country: true, totalStays: true },
                });

                const lastMessage = await prisma.socialMessage.findFirst({
                    where: {
                        platform: conv.platform,
                        OR: [
                            { phone: conv.identifier },
                            { socialId: conv.identifier }
                        ]
                    },
                    orderBy: { createdAt: 'desc' },
                });

                return {
                    identifier: conv.identifier,
                    platform: conv.platform,
                    messageCount: Number(conv._count),
                    lastMessageAt: conv.lastmessageat || conv.lastMessageAt,
                    senderName: lastMessage?.senderName || null,
                };
            })
        );
        console.log("Enrichment success.");
        console.log(enriched[0]);
    } catch (e) {
        console.error("ERROR REPRODUCED:", e);
    } finally {
        await prisma.$disconnect();
    }
}

test();
