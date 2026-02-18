
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper for placeholders
const HERO_IMG = (text: string) => \`https://placehold.co/1920x1080/1e3a8a/ffffff?text=\${encodeURIComponent(text)}\`
const ROOM_IMG = (text: string) => \`https://placehold.co/800x600/1e3a8a/ffffff?text=\${encodeURIComponent(text)}\`

const pages = [
  // ==================== TR ====================
  {
    title: 'Blue Dreams Resort',
    slug: 'home',
    locale: 'tr',
    hero: { title: "Her Güzel Rüya Blue Dreams'te Başlar", subtitle: "Bodrum Torba'da 5 Yıldızlı Ultra Her Şey Dahil Tatil Deneyimi" },
    content: "Eşsiz Doğası, Özel Sahili, Sonsuzluk Havuzu Ile Birlikte 5 Havuzu, Ege'nin En Güzel Gün Batımına Açılan Restoran Ve Barları Ile Sizi Bekliyor."
  },
  {
    title: 'Odalar',
    slug: 'odalar',
    locale: 'tr',
    hero: { title: "Konforlu Konaklama", subtitle: "Evinizdeki Rahatlık" },
    content: "Modern ve şık tasarımlı odalarımızda unutulmaz bir tatil deneyimi yaşayın."
  },
  {
    title: 'Club Odalar',
    slug: 'odalar/club',
    locale: 'tr',
    hero: { title: "Club Odalar", subtitle: "Doğa ile İç İçe" },
    content: "Yeşillikler içinde, özel balkonlu ve deniz manzaralı club odalarımız."
  },
  {
    title: 'Restoranlar',
    slug: 'yeme-icme', // Matching menu link
    locale: 'tr',
    hero: { title: "Lezzet Yolculuğu", subtitle: "Dünya Mutfaklarından Seçmeler" },
    content: "Ana restoranımız ve A'la Carte restoranlarımızda eşsiz lezzetleri keşfedin."
  },
  {
    title: 'Spa & Wellness',
    slug: 'spa',
    locale: 'tr',
    hero: { title: "Ruhunuzu Yenileyin", subtitle: "Spa & Masaj Hizmetleri" },
    content: "Uzman terapistlerimiz eşliğinde günün yorgunluğunu atın."
  },
    {
    title: 'Galeri',
    slug: 'galeri',
    locale: 'tr',
    hero: { title: "Galeri", subtitle: "Otirden Kareler" }, // typo intentional matching content? No fixing typo "Otelden"
    content: "Blue Dreams Resort'un büyüleyici atmosferine göz atın."
  },
  {
    title: 'İletişim',
    slug: 'iletisim',
    locale: 'tr',
    hero: { title: "İletişim", subtitle: "Bize Ulaşın" },
    content: "Sorularınız ve rezervasyon talepleriniz için bizimle iletişime geçin."
  },

  // ==================== EN ====================
  {
    title: 'Blue Dreams Resort',
    slug: 'home', // or 'ana-sayfa' to match scraped? 
    // Usually 'home' is internal canonical. Next.js middleware handles routing.
    // I will use 'home' and ensure frontend maps '/' to 'home'.
    locale: 'en',
    hero: { title: "Every Dream Starts with Blue", subtitle: "5 Star Ultra All Inclusive Holiday Experience in Bodrum Torba" },
    content: "The Blue Dreams Resort caters to all your needs with five swimming pools and one pool equipped with slides."
  },
  {
    title: 'Rooms',
    slug: 'rooms',
    locale: 'en',
    hero: { title: "Accommodation", subtitle: "Comfort & Luxury" },
    content: "Experience an unforgettable holiday in our modern and stylishly designed rooms."
  },
  {
    title: 'Club Rooms',
    slug: 'rooms/club',
    locale: 'en',
    hero: { title: "Club Rooms", subtitle: "Nature & Peace" },
    content: "Our club rooms featuring private balconies and sea views, nestled in greenery."
  },
  {
    title: 'Food & Drink',
    slug: 'food-drink',
    locale: 'en',
    hero: { title: "Culinary Journey", subtitle: "World Cuisines" },
    content: "Discover unique tastes in our main restaurant and A'la Carte restaurants."
  },
   {
    title: 'Spa & Wellness',
    slug: 'spa-wellness',
    locale: 'en',
    hero: { title: "Rejuvenate Your Soul", subtitle: "Spa & Massage Services" },
    content: "Relieve the tiredness of the day with our expert therapists."
  },
  {
    title: 'Gallery',
    slug: 'gallery',
    locale: 'en',
    hero: { title: "Gallery", subtitle: "Moments from Blue Dreams" },
    content: "Take a look at the fascinating atmosphere of Blue Dreams Resort."
  },
  {
    title: 'Contact',
    slug: 'contact-us',
    locale: 'en',
    hero: { title: "Contact Us", subtitle: "Get in Touch" },
    content: "Contact us for your questions and reservation requests."
  },

  // ==================== DE ====================
  {
    title: 'Blue Dreams Resort',
    slug: 'home',
    locale: 'de',
    hero: { title: "Jeder schöne Traum Beginnt bei Blue Dreams", subtitle: "5-Sterne Ultra All Inclusive Urlaub in Bodrum Torba" },
    content: "Es erwartet Sie eine einzigartige Natur, ein Privatstrand, 5 Pools mit Infinity-Pool."
  },
  {
    title: 'Zimmer',
    slug: 'zimmer', // inferred
    locale: 'de',
    hero: { title: "Unterkunft", subtitle: "Komfort & Luxus" },
    content: "Erleben Sie einen unvergesslichen Urlaub in unseren modern und stilvoll eingerichteten Zimmern."
  },
  {
    title: 'Club Zimmer',
    slug: 'zimmer/club',
    locale: 'de',
    hero: { title: "Club Zimmer", subtitle: "Natur & Ruhe" },
    content: "Unsere Club-Zimmer inmitten von Grün mit eigenem Balkon und Meerblick."
  },
  {
    title: 'Essen & Trinken',
    slug: 'essen-trinken', // inferred
    locale: 'de',
    hero: { title: "Kulinarische Reise", subtitle: "Weltküche" },
    content: "Entdecken Sie einzigartige Geschmäcker in unserem Hauptrestaurant und den A'la Carte Restaurants."
  },

  // ==================== RU (Fallback to EN) ====================
  {
    title: 'Blue Dreams Resort',
    slug: 'home',
    locale: 'ru',
    hero: { title: "Every Dream Starts with Blue", subtitle: "5 Star Ultra All Inclusive Holiday Experience" },
    content: "The Blue Dreams Resort caters to all your needs with five swimming pools."
  },
  {
    title: 'Rooms',
    slug: 'rooms', // fallback slug
    locale: 'ru',
    hero: { title: "Accommodation", subtitle: "Comfort & Luxury" },
    content: "Experience an unforgettable holiday in our modern and stylishly designed rooms."
  },
]

// Additional pages can be added similarly logic

async function main() {
  console.log('Start seeding static pages (4 Languages)...')

  for (const p of pages) {
    const page = await prisma.page.upsert({
      where: {
        slug_locale: {
          slug: p.slug,
          locale: p.locale,
        },
      },
      update: {
         // Optionally update content if we want to force refresh
         title: p.title
      },
      create: {
        title: p.title,
        slug: p.slug,
        locale: p.locale,
        metaDescription: \`\${p.title} - Blue Dreams Resort\`,
        widgets: {
          create: [
            {
              type: 'HeroSection',
              order: 0,
              data: JSON.stringify({
                title: p.hero.title,
                subtitle: p.hero.subtitle,
                backgroundImage: HERO_IMG(p.hero.title),
              }),
            },
            {
              type: 'TextBlock',
              order: 1,
              data: JSON.stringify({
                content: \`<h2>\${p.title}</h2><p>\${p.content}</p>\`,
              }),
            },
             // Add gallery for gallery page
            ...(p.slug.includes('galeri') || p.slug.includes('gallery') ? [{
                type: 'Gallery',
                order: 2,
                data: JSON.stringify({
                    images: [
                        { url: HERO_IMG('Gallery 1'), caption: 'Hotel View' },
                        { url: HERO_IMG('Gallery 2'), caption: 'Pool' },
                        { url: HERO_IMG('Gallery 3'), caption: 'Room' },
                    ]
                })
            }] : [])
          ],
        },
      },
    })
    console.log(\`Upserted: \${page.title} (\${page.locale}/\${page.slug})\`)
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
