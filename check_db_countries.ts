import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkCountries() {
    const res = await prisma.reservation.groupBy({
        by: ['country'],
        _count: {
            id: true
        }
    })
    console.log("Countries in DB:", res)
}

checkCountries().catch(console.error).finally(() => prisma.$disconnect())
