import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const HTML_FILE = 'live_gallery.html';

const categoryMap: Record<string, string> = {
    '0': 'Genel Alanlar',
    '1': 'Odalar',
    '2': 'Restoranlar ve Barlar',
    '3': 'Toplantı',
    'all': 'Tümü', // Normally we ignore 'all'
};

async function main() {
    console.log('Reading HTML file...');
    const html = fs.readFileSync(HTML_FILE, 'utf-8');

    // Extract all <a class="e-gallery-item ...> blocks
    const itemRegex = /<a[^>]+class="[^"]*e-gallery-item[^"]*"[^>]*>/g;

    const matches = [...html.matchAll(itemRegex)];
    console.log(`Found ${matches.length} gallery items.`);

    const images: any[] = [];
    const mediaToInsert: any[] = [];

    for (const match of matches) {
        const tagString = match[0];

        let href = '';
        const hrefMatch = tagString.match(/href="([^"]+)"/);
        if (hrefMatch) href = hrefMatch[1];

        let title = '';
        const titleMatch = tagString.match(/data-elementor-lightbox-title="([^"]+)"/);
        if (titleMatch) title = titleMatch[1];
        if (title === 'default' || !title) {
            title = href.split('/').pop()?.split('.')[0] || 'Image';
        }

        let tags: string[] = [];
        const tagsMatch = tagString.match(/data-e-gallery-tags="([^"]+)"/);
        if (tagsMatch) {
            tags = tagsMatch[1].split(',').map(t => t.trim());
        }

        // Add to Media table array
        mediaToInsert.push({
            url: href,
            name: title,
            type: 'image'
        });

        // Add to Widget JSON array (duplicate for multiple categories if needed)
        if (tags.length === 0) {
            images.push({ url: href, title, category: 'Genel Alanlar' });
        } else {
            for (const tag of tags) {
                const catName = categoryMap[tag] || 'Genel Alanlar';
                images.push({ url: href, title, category: catName });
            }
        }
    }

    console.log(`Prepared ${images.length} image references for the widget.`);
    console.log(`Prepared ${mediaToInsert.length} distinct media files.`);

    // 1. Insert into Media table (ignore duplicates by URL if possible, or just insert them)
    // To prevent failure on duplicates, we'll do it sequentially, checking if URL exists
    let newMediaCount = 0;
    for (const item of mediaToInsert) {
        const exists = await prisma.media.findFirst({ where: { url: item.url } });
        if (!exists) {
            await prisma.media.create({ data: item });
            newMediaCount++;
        }
    }
    console.log(`Inserted ${newMediaCount} new items into Media table.`);

    // 2. Create or Update 'galeri' Page and Widget
    // Check if Page exists for 'tr'
    for (const locale of ['tr', 'en', 'de', 'ru']) {
        let page = await prisma.page.findFirst({ where: { slug: 'galeri', locale } });
        if (!page) {
            page = await prisma.page.create({
                data: {
                    slug: 'galeri',
                    locale,
                    title: locale === 'tr' ? 'Galeri' : 'Gallery',
                }
            });
            console.log(`Created new Page 'galeri' for locale '${locale}'.`);
        }

        // Check if gallery widget exists for this page
        const existingWidget = await prisma.widget.findFirst({
            where: { pageId: page.id, type: 'gallery' }
        });

        const widgetData = {
            images,
            columns: 3,
            gap: 'medium',
            style: 'grid'
        };

        if (existingWidget) {
            await prisma.widget.update({
                where: { id: existingWidget.id },
                data: { data: JSON.stringify(widgetData) }
            });
            console.log(`Updated existing Gallery widget for locale '${locale}'.`);
        } else {
            // Count existing widgets to determine order
            const count = await prisma.widget.count({ where: { pageId: page.id } });
            await prisma.widget.create({
                data: {
                    type: 'gallery',
                    data: JSON.stringify(widgetData),
                    order: count,
                    pageId: page.id
                }
            });
            console.log(`Created new Gallery widget for locale '${locale}'.`);
        }
    }

    console.log('Gallery seeding completed successfully.');
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
