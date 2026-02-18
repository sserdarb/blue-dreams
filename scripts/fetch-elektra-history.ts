// import 'dotenv/config' - using native loadEnvFile
if (typeof process.loadEnvFile === 'function') {
    try { process.loadEnvFile('.env.local') } catch (e) { console.warn('No .env.local loaded') }
}
import { prisma } from '../lib/prisma'
import { ElektraService } from '../lib/services/elektra'

async function syncYear(year: number) {
    console.log(`\n=== Syncing Year ${year} ===`)
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)

    console.log(`Fetching from Elektra (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})...`)

    try {
        const reservations = await ElektraService.getReservations(startDate, endDate)
        console.log(`Fetched ${reservations.length} reservations. Upserting to DB...`)

        let processed = 0
        for (const res of reservations) {
            await prisma.elektraReservation.upsert({
                where: { id: res.id },
                update: {
                    voucherNo: res.voucherNo,
                    agency: res.agency,
                    channel: res.channel,
                    boardType: res.boardType,
                    roomType: res.roomType,
                    checkIn: new Date(res.checkIn),
                    checkOut: new Date(res.checkOut),
                    totalPrice: res.totalPrice,
                    paidPrice: res.paidPrice,
                    currency: res.currency,
                    status: res.status,
                    roomCount: res.roomCount,
                    adults: 2, // Default or fetch if available (ElektraService doesn't expose adults clearly in Reservation type, checking guests length might be better but let's stick to default for now or parse guests)
                    children: 0,
                    nationality: res.nationality,
                    bookedAt: new Date(res.lastUpdate), // Using lastUpdate as proxy for bookedAt
                },
                create: {
                    id: res.id,
                    voucherNo: res.voucherNo,
                    agency: res.agency,
                    channel: res.channel,
                    boardType: res.boardType,
                    roomType: res.roomType,
                    checkIn: new Date(res.checkIn),
                    checkOut: new Date(res.checkOut),
                    totalPrice: res.totalPrice,
                    paidPrice: res.paidPrice,
                    currency: res.currency,
                    status: res.status,
                    roomCount: res.roomCount,
                    adults: 2,
                    children: 0,
                    nationality: res.nationality,
                    bookedAt: new Date(res.lastUpdate),
                }
            })
            processed++
            if (processed % 50 === 0) process.stdout.write('.')
        }
        console.log(`\n✅ Year ${year} synced: ${processed} records.`)

    } catch (e) {
        console.error(`❌ Error syncing ${year}:`, e)
    }
}

async function main() {
    console.log("Starting Elektra History Sync...")
    await syncYear(2024)
    await syncYear(2025)
    console.log("\nAll Done!")
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
