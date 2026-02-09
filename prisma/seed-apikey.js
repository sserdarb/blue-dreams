const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const apiKey = 'AIzaSyC6ApKPTkvPZJ35eN6gjSDfPe89QO93sEA'
    console.log('Seeding Gemini API Key...')

    const locales = ['tr', 'en', 'de', 'ru']

    for (const locale of locales) {
        const existing = await prisma.aiSettings.findFirst({ where: { language: locale } })

        if (existing) {
            await prisma.aiSettings.update({
                where: { id: existing.id },
                data: { apiKey }
            })
            console.log(`Updated API key for ${locale}`)
        } else {
            await prisma.aiSettings.create({
                data: {
                    language: locale,
                    systemPrompt: '',
                    tone: 'friendly',
                    apiKey
                }
            })
            console.log(`Created new settings with API key for ${locale}`)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
