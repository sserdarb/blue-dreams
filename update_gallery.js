const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
    const pages = await prisma.page.findMany({
        where: { slug: "galeri" },
        include: { widgets: true }
    });

    const categories = {
        "tr": ["Genel", "Odalar", "Plaj & Havuz", "Gastronomi"],
        "en": ["General", "Rooms", "Beach & Pool", "Gastronomy"],
        "de": ["Allgemein", "Zimmer", "Strand & Pool", "Gastronomie"],
        "ru": ["Общие", "Номера", "Пляж и Бассейн", "Гастрономия"]
    };

    const imagesByCat = [
        { src: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", title: "Aerial View", catIdx: 0 },
        { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg", title: "Deluxe Room", catIdx: 1 },
        { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", title: "Club Room", catIdx: 1 },
        { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", title: "Infinity Pool", catIdx: 2 },
        { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg", title: "Pool View", catIdx: 2 },
        { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", title: "Sandy Beach", catIdx: 2 },
        { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", title: "Italian Restaurant", catIdx: 3 },
        { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", title: "Open Buffet", catIdx: 3 }
    ];

    let updateCount = 0;
    for (const page of pages) {
        const locale = page.locale || "tr";
        const cats = categories[locale] || categories["tr"];

        for (const widget of page.widgets) {
            if (widget.type === "gallery") {
                let data = typeof widget.data === "string" ? JSON.parse(widget.data) : widget.data;

                // Override with nicely categorized default set
                const newImages = imagesByCat.map(img => ({
                    src: img.src,
                    title: img.title,
                    category: cats[img.catIdx]
                }));

                data.images = newImages;

                await prisma.widget.update({
                    where: { id: widget.id },
                    data: { data: JSON.stringify(data) }
                });
                console.log(`Updated gallery widget for page ${page.slug} locale ${locale}`);
                updateCount++;
            }
        }
    }
    console.log(`Updated ${updateCount} widgets.`);
}

main().then(() => {
    process.exit(0);
}).catch(e => {
    console.error(e);
    process.exit(1);
});
