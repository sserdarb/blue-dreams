import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding...')

  // Cleanup
  await prisma.widget.deleteMany()
  await prisma.page.deleteMany()

  // --- EN: Home ---
  const homeEn = await prisma.page.create({
    data: {
      title: 'Home',
      slug: 'home',
      locale: 'en',
    },
  })

  await prisma.widget.createMany({
    data: [
      {
        pageId: homeEn.id,
        type: 'hero',
        order: 1,
        data: JSON.stringify({
          title: 'Every Dream Starts with Blue',
          subtitle: 'Located in the beautiful bay of Torba Zeytinlikahve in Bodrum.',
          imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC06925-2-768x512.jpg',
          ctaText: 'Discover More',
        }),
      },
      {
        pageId: homeEn.id,
        type: 'text',
        order: 2,
        data: JSON.stringify({
            content: `
                <h2 class="text-3xl font-bold mb-4">BLUE DREAMS RESORT *****</h2>
                <p class="mb-4">The Blue Dreams Resort caters to all your needs with five swimming pools and one pool equipped with slides. Even if you don't want to sacrifice your healthy lifestyle and exercise routine on vacation, the resort offers tennis courts, water sports, various sports activities during the day and Spa services that help you unwind later.</p>
            `,
            alignment: 'center'
        })
      },
      {
        pageId: homeEn.id,
        type: 'room-list',
        order: 3,
        data: JSON.stringify({
            rooms: [
                {
                    title: 'Club Rooms',
                    description: 'Our hotel rooms are built into the hillside bungalows.',
                    imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/08/DSC02469-768x512.jpg'
                },
                {
                    title: 'Deluxe Rooms',
                    description: 'Modern luxury with stunning sea views.',
                    imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/08/DSC02219.jpg'
                }
            ]
        })
      }
    ]
  })

  // --- TR: Home ---
  const homeTr = await prisma.page.create({
    data: {
      title: 'Anasayfa',
      slug: 'home',
      locale: 'tr',
    },
  })

  await prisma.widget.createMany({
    data: [
      {
        pageId: homeTr.id,
        type: 'hero',
        order: 1,
        data: JSON.stringify({
          title: 'Her Rüya Maviyle Başlar',
          subtitle: 'Bodrum Torba Zeytinlikahve\'nin güzel koyunda yer almaktadır.',
          imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC06925-2-768x512.jpg',
          ctaText: 'Keşfet',
        }),
      },
      {
        pageId: homeTr.id,
        type: 'text',
        order: 2,
        data: JSON.stringify({
            content: `
                <h2 class="text-3xl font-bold mb-4">BLUE DREAMS RESORT *****</h2>
                <p class="mb-4">Blue Dreams Resort, beş yüzme havuzu ve kaydıraklı bir havuzu ile tüm ihtiyaçlarınıza cevap veriyor. Tatilde sağlıklı yaşam tarzınızdan ve egzersiz rutininizden ödün vermek istemeseniz bile, tesis tenis kortları, su sporları, gün boyu çeşitli spor aktiviteleri ve daha sonra gevşemenize yardımcı olacak Spa hizmetleri sunmaktadır.</p>
            `,
            alignment: 'center'
        })
      }
    ]
  })

  // --- EN: Accommodation ---
  const accomEn = await prisma.page.create({
      data: {
          title: 'Accommodation',
          slug: 'accommodation',
          locale: 'en'
      }
  })

  await prisma.widget.create({
      data: {
          pageId: accomEn.id,
          type: 'text',
          order: 1,
          data: JSON.stringify({
              content: '<h1>Accommodation</h1><p>Relax in our comfortable rooms.</p>'
          })
      }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
