import paramiko, sys, json
sys.stdout.reconfigure(encoding='utf-8')
c = paramiko.SSHClient()
c.set_missing_host_key_policy(paramiko.AutoAddPolicy())
c.connect('76.13.0.113', username='root', password="tvONwId?Z.nm'c/M-k7N", timeout=30, look_for_keys=False, allow_agent=False)
c.get_transport().set_keepalive(15)

def run(cmd, timeout=30):
    si, so, se = c.exec_command(cmd, timeout=timeout)
    out = so.read().decode('utf-8','replace').strip()
    err = se.read().decode('utf-8','replace').strip()
    return (out + '\n' + err).strip()

cname = run("docker ps --format '{{.Names}}' | grep vgk8").split('\n')[0].strip()

fix_script = r"""
const { PrismaClient } = require('/app/node_modules/@prisma/client');
const p = new PrismaClient();

async function fix() {
    // Check if odalar pages already exist
    const existing = await p.page.findFirst({ where: { slug: 'odalar', locale: 'tr' } });
    if (existing) {
        console.log('Odalar TR page already exists, skipping', existing.id);
        return;
    }
    
    // Re-create odalar pages with proper room-list widget data
    // TR Page
    const trPage = await p.page.create({
        data: {
            slug: 'odalar',
            locale: 'tr',
            title: 'Odalar & Suitler',
            metaDescription: 'Blue Dreams Resort odalar ve suit secenekleri. Club, Deluxe ve Aile Suitleri.',
            widgets: {
                create: [
                    {
                        type: 'page-header',
                        order: 1,
                        data: JSON.stringify({
                            title: 'Odalar & Suitler',
                            subtitle: 'Her butceye uygun konfor',
                            breadcrumbs: [
                                { label: 'Ana Sayfa', href: '/' },
                                { label: 'Odalar' }
                            ],
                            backgroundImage: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg'
                        })
                    },
                    {
                        type: 'text-block',
                        order: 2,
                        data: JSON.stringify({
                            eyebrow: 'KONAKLAMA',
                            title: 'Konfor ve Zerafet',
                            content: "340'i askin odamiz ile size en uygun konaklama secenegini sunuyoruz."
                        })
                    },
                    {
                        type: 'room-list',
                        order: 3,
                        data: JSON.stringify({
                            rooms: [
                                {
                                    title: 'Club Odalar',
                                    description: 'Dogayla ic ice yapisi ve denize nazir konumda konforlu bir konaklama deneyimi. 20-22 m2 buyuklugunde, 2 kisi kapasiteli.',
                                    imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
                                    href: '/odalar/club',
                                    size: '20-22 m2',
                                    capacity: '2 Kisi',
                                    view: 'Kara veya Deniz Manzarali'
                                },
                                {
                                    title: 'Deluxe Odalar',
                                    description: 'Modern tasarimin essiz Bodrum manzarasiyla bulustugu, genis ve ferah yasam alanlari. 40-45 m2, 2-3 kisi kapasiteli.',
                                    imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
                                    href: '/odalar/deluxe',
                                    size: '40-45 m2',
                                    capacity: '2-3 Kisi',
                                    view: 'Panoramik Deniz ve Havuz Manzarasi'
                                },
                                {
                                    title: 'Aile Suitleri',
                                    description: 'Genis aileler icin tasarlanmis, iki yatak odali ve konforlu ortak yasam alanina sahip suitler. 55-60 m2.',
                                    imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
                                    href: '/odalar/aile',
                                    size: '55-60 m2',
                                    capacity: '4-5 Kisi',
                                    view: 'Bahce ve Kismi Deniz Manzarasi'
                                }
                            ]
                        })
                    },
                    {
                        type: 'cta',
                        order: 4,
                        data: JSON.stringify({
                            title: 'Hayalinizdeki Odayi Bulun',
                            subtitle: 'Online rezervasyon ile en iyi fiyat garantisi',
                            buttonText: 'HEMEN REZERVASYON YAP',
                            buttonUrl: 'https://blue-dreams.rezervasyonal.com',
                            variant: 'dark'
                        })
                    }
                ]
            }
        }
    });
    console.log('Created TR odalar page:', trPage.id);

    // EN Page
    const enPage = await p.page.create({
        data: {
            slug: 'odalar',
            locale: 'en',
            title: 'Rooms & Suites',
            metaDescription: 'Blue Dreams Resort room and suite options. Club, Deluxe and Family Suites.',
            widgets: {
                create: [
                    {
                        type: 'page-header',
                        order: 1,
                        data: JSON.stringify({
                            title: 'Rooms & Suites',
                            subtitle: 'Comfort for every budget',
                            breadcrumbs: [
                                { label: 'Home', href: '/' },
                                { label: 'Rooms' }
                            ],
                            backgroundImage: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg'
                        })
                    },
                    {
                        type: 'text-block',
                        order: 2,
                        data: JSON.stringify({
                            eyebrow: 'ACCOMMODATION',
                            title: 'Comfort and Elegance',
                            content: 'With over 340 rooms, we offer the most suitable accommodation option for you.'
                        })
                    },
                    {
                        type: 'room-list',
                        order: 3,
                        data: JSON.stringify({
                            rooms: [
                                {
                                    title: 'Club Rooms',
                                    description: 'Comfortable accommodation with unique architecture in a sea-view location. 20-22 sqm, 2 guests.',
                                    imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg',
                                    href: '/odalar/club',
                                    size: '20-22 sqm',
                                    capacity: '2 Guests',
                                    view: 'Land or Sea View'
                                },
                                {
                                    title: 'Deluxe Rooms',
                                    description: 'Spacious living areas where modern design meets the unique Bodrum panorama. 40-45 sqm, 2-3 guests.',
                                    imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg',
                                    href: '/odalar/deluxe',
                                    size: '40-45 sqm',
                                    capacity: '2-3 Guests',
                                    view: 'Panoramic Sea and Pool View'
                                },
                                {
                                    title: 'Family Suites',
                                    description: 'Specially designed suites for large families with two bedrooms. 55-60 sqm, 4-5 guests.',
                                    imageUrl: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg',
                                    href: '/odalar/aile',
                                    size: '55-60 sqm',
                                    capacity: '4-5 Guests',
                                    view: 'Garden and Partial Sea View'
                                }
                            ]
                        })
                    },
                    {
                        type: 'cta',
                        order: 4,
                        data: JSON.stringify({
                            title: 'Find Your Dream Room',
                            subtitle: 'Best price guarantee with online reservation',
                            buttonText: 'BOOK NOW',
                            buttonUrl: 'https://blue-dreams.rezervasyonal.com',
                            variant: 'dark'
                        })
                    }
                ]
            }
        }
    });
    console.log('Created EN odalar page:', enPage.id);
    console.log('DONE');
}

fix().catch(e => console.error('ERR:', e.message)).finally(() => process.exit());
"""

sftp = c.open_sftp()
with sftp.open('/tmp/fix_odalar.js', 'w') as f:
    f.write(fix_script)
sftp.close()

run("docker cp /tmp/fix_odalar.js " + cname + ":/app/fix_odalar.js")
result = run("docker exec " + cname + " node /app/fix_odalar.js 2>&1", timeout=30)
print(result)

c.close()
