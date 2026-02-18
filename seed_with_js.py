import paramiko
import sys
import time

sys.stdout.reconfigure(encoding='utf-8')

SERVER_IP = '76.13.0.113'
USERNAME = 'root'
PASSWORD = "tvONwId?Z.nm'c/M-k7N"

def run(c, cmd, timeout=60):
    stdin, stdout, stderr = c.exec_command(cmd, timeout=timeout)
    out = stdout.read().decode('utf-8', errors='replace').strip()
    err = stderr.read().decode('utf-8', errors='replace').strip()
    return out, err

try:
    print(f"Connecting to {SERVER_IP}...")
    c = paramiko.SSHClient()
    c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    c.connect(SERVER_IP, username=USERNAME, password=PASSWORD, timeout=10)
    
    out, _ = run(c, 'docker ps --filter "name=vgk8" --format "{{.ID}}"')
    cid = out.split('\n')[0].strip()
    print(f"Container: {cid}")
    
    # Create a pure JS seed script that can run with plain node
    seed_js = r"""
const { PrismaClient } = require('@prisma/client');
const { seedPage, homeWidgets } = require('./seed-helpers');
const { aboutWidgets, roomsWidgets, restaurantWidgets, spaWidgets, contactWidgets, weddingWidgets, galleryWidgets, meetingWidgets, bodrumWidgets } = require('./seed-pages');

const prisma = new PrismaClient();

async function main() {
    // 1. Default Admin User
    const existingAdmin = await prisma.adminUser.findUnique({
        where: { email: 'sserdarb@gmail.com' }
    });

    if (!existingAdmin) {
        await prisma.adminUser.create({
            data: {
                email: 'sserdarb@gmail.com',
                password: 'Tuba@2015Tuana',
                name: 'Serdar',
                role: 'superadmin',
                isActive: true,
            }
        });
        console.log('Default admin user created');
    } else {
        console.log('Admin user already exists');
    }

    // 2. Languages
    const languages = [
        { code: 'tr', name: 'Turkce', nativeName: 'Turkce', flag: 'TR', isDefault: true, order: 0 },
        { code: 'en', name: 'English', nativeName: 'English', flag: 'GB', isDefault: false, order: 1 },
        { code: 'de', name: 'Deutsch', nativeName: 'Deutsch', flag: 'DE', isDefault: false, order: 2 },
        { code: 'ru', name: 'Russian', nativeName: 'Russian', flag: 'RU', isDefault: false, order: 3 },
    ];

    for (const lang of languages) {
        await prisma.language.upsert({
            where: { code: lang.code },
            update: {},
            create: lang,
        });
    }
    console.log('Languages seeded');

    // 3. Pages & Widgets
    const locales = ['tr', 'en', 'de', 'ru'];
    const pageDefs = [
        { slug: 'home', titleFn: function(l) { return l === 'tr' ? 'Ana Sayfa' : l === 'en' ? 'Home' : l === 'de' ? 'Startseite' : 'Home'; }, widgetsFn: homeWidgets },
        { slug: 'hakkimizda', titleFn: function(l) { return l === 'tr' ? 'Hakkimizda' : l === 'en' ? 'About Us' : l === 'de' ? 'Uber Uns' : 'About'; }, widgetsFn: aboutWidgets },
        { slug: 'odalar', titleFn: function(l) { return l === 'tr' ? 'Odalar' : l === 'en' ? 'Rooms' : l === 'de' ? 'Zimmer' : 'Rooms'; }, widgetsFn: roomsWidgets },
        { slug: 'restoran', titleFn: function(l) { return l === 'tr' ? 'Restoran' : l === 'en' ? 'Restaurant' : l === 'de' ? 'Restaurant' : 'Restaurant'; }, widgetsFn: restaurantWidgets },
        { slug: 'spa', titleFn: function(l) { return l === 'tr' ? 'Spa & Wellness' : l === 'en' ? 'Spa & Wellness' : l === 'de' ? 'Spa & Wellness' : 'Spa'; }, widgetsFn: spaWidgets },
        { slug: 'iletisim', titleFn: function(l) { return l === 'tr' ? 'Iletisim' : l === 'en' ? 'Contact' : l === 'de' ? 'Kontakt' : 'Contact'; }, widgetsFn: contactWidgets },
        { slug: 'dugun-davet', titleFn: function(l) { return l === 'tr' ? 'Dugun & Davet' : l === 'en' ? 'Wedding & Events' : l === 'de' ? 'Hochzeit' : 'Events'; }, widgetsFn: weddingWidgets },
        { slug: 'galeri', titleFn: function(l) { return l === 'tr' ? 'Galeri' : l === 'en' ? 'Gallery' : l === 'de' ? 'Galerie' : 'Gallery'; }, widgetsFn: galleryWidgets },
        { slug: 'toplanti-salonu', titleFn: function(l) { return l === 'tr' ? 'Toplanti Salonu' : l === 'en' ? 'Meeting Rooms' : l === 'de' ? 'Tagungsraume' : 'Meetings'; }, widgetsFn: meetingWidgets },
        { slug: 'bodrum', titleFn: function(l) { return l === 'tr' ? 'Bodrum Rehberi' : l === 'en' ? 'Bodrum Guide' : l === 'de' ? 'Bodrum Reisefuhrer' : 'Bodrum'; }, widgetsFn: bodrumWidgets },
    ];

    for (const pageDef of pageDefs) {
        for (const locale of locales) {
            await seedPage(pageDef.slug, locale, pageDef.titleFn(locale), pageDef.widgetsFn(locale));
        }
    }

    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
"""
    
    import base64
    b64 = base64.b64encode(seed_js.encode('utf-8')).decode('utf-8')
    cmd = f'docker exec {cid} sh -c "echo {b64} | base64 -d > /app/prisma/seed.js"'
    out, err = run(c, cmd)
    print(f"Write seed.js - out: {out}, err: {err}")
    
    # Verify file
    out, _ = run(c, f'docker exec {cid} head -5 /app/prisma/seed.js')
    print(f"Seed.js head: {out}")
    
    # Run the JS seed
    print("\n=== Running seed with node ===")
    cmd = f'docker exec -w /app -e DATABASE_URL="file:/app/data/database.sqlite" {cid} node prisma/seed.js 2>&1'
    out, err = run(c, cmd, timeout=120)
    print(f"Output:\n{out}")
    if err:
        print(f"Error:\n{err[:1000]}")
    
    # Check results
    print("\n=== Results ===")
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM Page;"')
    print(f"Page count: {out}")
    
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM Widget;"')
    print(f"Widget count: {out}")
    
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM AdminUser;"')
    print(f"Admin count: {out}")
    
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT COUNT(*) FROM Language;"')
    print(f"Language count: {out}")
    
    out, _ = run(c, f'docker exec {cid} sqlite3 /app/data/database.sqlite "SELECT slug, locale, title FROM Page LIMIT 20;"')
    print(f"Pages:\n{out}")
    
    c.close()

except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
