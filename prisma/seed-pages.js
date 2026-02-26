// Sub-page widget definitions for seed

function aboutWidgets(locale) {
    const t = {
        tr: {
            title: 'Hakkımızda', sub: 'Blue Dreams Resort hikayesi', bc: 'Hakkımızda', storyLabel: 'Hikayemiz', storyH: '25 Yıllık', storyHA: 'Tutku', p1: "Blue Dreams Resort, 1998 yılından bu yana Bodrum'un Torba koyunda, Ege'nin eşsiz mavisinde misafirlerini ağırlamaktadır.", p2: "55.000 m²'lik alanda konumlanan tesisimiz, 340'ı aşkın odasıyla her yıl binlerce misafire ev sahipliği yapmaktadır.", p3: "Doğa ile iç içe, modern konforu tarihsel dokuyla harmanlayan anlayışımızla, unutulmaz tatil deneyimleri sunuyoruz.", yrs: 'Yıllık Tecrübe', valLabel: 'Değerlerimiz', valH: 'Temel İlkelerimiz', v1t: 'Doğallık', v1d: 'Ege doğasıyla uyum içinde yaşam', v2t: 'Mükemmellik', v2d: 'Her detayda kusursuz hizmet anlayışı', v3t: 'Sürdürülebilirlik', v3d: 'Gelecek nesiller için doğayı koruma', ctaH: 'Sizi Bekliyoruz', ctaS: 'Hayalinizdeki tatili birlikte planlayalım.', ctaB1: 'İletişim', ctaB2: 'Online Rezervasyon',
            star: 'Otel Sınıfı', rooms: 'Oda Sayısı', year: 'Kuruluş Yılı', area: 'Alan (m²)'
        },
        en: {
            title: 'About Us', sub: 'The Blue Dreams Resort story', bc: 'About Us', storyLabel: 'Our Story', storyH: '25 Years of', storyHA: 'Passion', p1: "Blue Dreams Resort has been welcoming guests in Torba Bay, Bodrum, amidst the unique blue of the Aegean since 1998.", p2: "Spread across 55,000 m², our resort offers over 340 rooms, hosting thousands of guests each year.", p3: "We offer unforgettable holiday experiences with our philosophy of blending modern comfort with historical texture in harmony with nature.", yrs: 'Years of Experience', valLabel: 'Our Values', valH: 'Core Principles', v1t: 'Naturalness', v1d: 'Living in harmony with Aegean nature', v2t: 'Excellence', v2d: 'Flawless service in every detail', v3t: 'Sustainability', v3d: 'Protecting nature for future generations', ctaH: 'We Await You', ctaS: 'Let us plan your dream vacation together.', ctaB1: 'Contact Us', ctaB2: 'Online Booking',
            star: 'Hotel Class', rooms: 'Total Rooms', year: 'Founded', area: 'Area (m²)'
        },
        de: {
            title: 'Über Uns', sub: 'Die Geschichte des Blue Dreams Resort', bc: 'Über Uns', storyLabel: 'Unsere Geschichte', storyH: '25 Jahre', storyHA: 'Leidenschaft', p1: "Das Blue Dreams Resort empfängt seit 1998 Gäste in der Bucht von Torba, Bodrum.", p2: "Auf 55.000 m² bietet unser Resort über 340 Zimmer.", p3: "Wir bieten unvergessliche Urlaubserlebnisse mit unserer Philosophie.", yrs: 'Jahre Erfahrung', valLabel: 'Unsere Werte', valH: 'Grundprinzipien', v1t: 'Natürlichkeit', v1d: 'Leben im Einklang mit der ägäischen Natur', v2t: 'Exzellenz', v2d: 'Tadelloser Service in jedem Detail', v3t: 'Nachhaltigkeit', v3d: 'Schutz der Natur für zukünftige Generationen', ctaH: 'Wir erwarten Sie', ctaS: 'Planen wir gemeinsam Ihren Traumurlaub.', ctaB1: 'Kontakt', ctaB2: 'Online Buchung',
            star: 'Hotelklasse', rooms: 'Zimmeranzahl', year: 'Gründung', area: 'Fläche (m²)'
        },
        ru: {
            title: 'О нас', sub: 'История Blue Dreams Resort', bc: 'О нас', storyLabel: 'Наша история', storyH: '25 лет', storyHA: 'Страсти', p1: "Курорт Blue Dreams с 1998 года принимает гостей в бухте Торба, Бодрум.", p2: "На площади 55 000 м² наш курорт предлагает более 340 номеров.", p3: "Мы предлагаем незабываемый отдых, сочетая современный комфорт с природой.", yrs: 'Лет опыта', valLabel: 'Наши ценности', valH: 'Основные принципы', v1t: 'Естественность', v1d: 'Жизнь в гармонии с природой Эгейского моря', v2t: 'Превосходство', v2d: 'Безупречный сервис в каждой детали', v3t: 'Устойчивость', v3d: 'Защита природы для будущих поколений', ctaH: 'Мы ждём вас', ctaS: 'Давайте вместе спланируем ваш идеальный отпуск.', ctaB1: 'Контакт', ctaB2: 'Онлайн бронирование',
            star: 'Класс отеля', rooms: 'Номера', year: 'Год основания', area: 'Площадь (м²)'
        },
    }
    const c = t[locale] || t.tr
    return [
        { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/hakkimizda` }] } },
        { type: 'text-image', data: { label: c.storyLabel, heading: c.storyH, headingAccent: c.storyHA, paragraphs: [c.p1, c.p2, c.p3], image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", imageAlt: "Blue Dreams Resort", badge: { value: "25+", label: c.yrs } } },
        { type: 'stats', data: { items: [{ icon: 'award', value: '5★', label: c.star }, { icon: 'users', value: '340+', label: c.rooms }, { icon: 'calendar', value: '1998', label: c.year }, { icon: 'mappin', value: '55K', label: c.area }] } },
        { type: 'icon-grid', data: { label: c.valLabel, heading: c.valH, items: [{ icon: '🌊', title: c.v1t, description: c.v1d }, { icon: '✨', title: c.v2t, description: c.v2d }, { icon: '🌿', title: c.v3t, description: c.v3d }] } },
        { type: 'cta', data: { heading: c.ctaH, subtitle: c.ctaS, backgroundColor: 'white', buttons: [{ text: c.ctaB1, url: `/${locale}/iletisim`, variant: 'primary' }, { text: c.ctaB2, url: "https://new.bluedreamsresort.com/tr/booking", variant: 'outline' }] } },
    ]
}

function roomsWidgets(locale) {
    const t = {
        tr: { title: 'Odalar & Süitler', sub: 'Her bütçeye uygun konfor', bc: 'Odalar', badge: 'Konaklama', h: 'Konfor ve', ha: 'Zerafet', intro: '340\'ı aşkın odamız ile size en uygun konaklama seçeneğini sunuyoruz.', ctaT: 'Hayalinizdeki Odayı Bulun', ctaS: 'Online rezervasyon ile en iyi fiyat garantisi', ctaB: 'Hemen Rezervasyon Yap' },
        en: { title: 'Rooms & Suites', sub: 'Comfort for every budget', bc: 'Rooms', badge: 'Accommodation', h: 'Comfort and', ha: 'Elegance', intro: 'With over 340 rooms, we offer the most suitable accommodation option for you.', ctaT: 'Find Your Dream Room', ctaS: 'Best price guarantee with online booking', ctaB: 'Book Now' },
        de: { title: 'Zimmer & Suiten', sub: 'Komfort für jedes Budget', bc: 'Zimmer', badge: 'Unterkunft', h: 'Komfort und', ha: 'Eleganz', intro: 'Mit über 340 Zimmern bieten wir die passende Unterkunft.', ctaT: 'Finden Sie Ihr Traumzimmer', ctaS: 'Bestpreisgarantie bei Online-Buchung', ctaB: 'Jetzt Buchen' },
        ru: { title: 'Номера и Люксы', sub: 'Комфорт для любого бюджета', bc: 'Номера', badge: 'Размещение', h: 'Комфорт и', ha: 'Элегантность', intro: 'Более 340 номеров для вашего идеального отдыха.', ctaT: 'Найдите номер мечты', ctaS: 'Лучшая цена при онлайн-бронировании', ctaB: 'Забронировать' },
    }
    const c = t[locale] || t.tr
    return [
        { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/odalar` }] } },
        { type: 'text-block', data: { label: c.badge, heading: c.h, headingAccent: c.ha, content: c.intro, backgroundColor: 'white' } },
        { type: 'room-list', data: {} },
        { type: 'cta', data: { heading: c.ctaT, subtitle: c.ctaS, backgroundColor: 'dark', buttons: [{ text: c.ctaB, url: "https://new.bluedreamsresort.com/tr/booking", variant: 'white' }] } },
    ]
}

function restaurantWidgets(locale) {
    const t = {
        tr: { title: 'Restoran & Bar', sub: 'Eşsiz lezzetler', bc: 'Restoran', badge: 'Gastronomi', h: 'Tatlar ve', ha: 'Lezzetler', intro: 'Her damak zevkine hitap eden restoranlarımız ve barlarımız.', allH: 'Her Şey Dahil', allS: 'Zengin açık büfe ve a\'la carte seçenekleriyle gastronomi deneyimi.', allB1: 'WhatsApp', allB2: 'Odaları Gör' },
        en: { title: 'Restaurant & Bar', sub: 'Unique flavors', bc: 'Restaurant', badge: 'Gastronomy', h: 'Tastes and', ha: 'Flavors', intro: 'Our restaurants and bars cater to every palate.', allH: 'All Inclusive', allS: 'Gastronomy experience with rich buffet and a la carte options.', allB1: 'WhatsApp', allB2: 'View Rooms' },
        de: { title: 'Restaurant & Bar', sub: 'Einzigartige Aromen', bc: 'Restaurant', badge: 'Gastronomie', h: 'Geschmack und', ha: 'Aromen', intro: 'Unsere Restaurants und Bars für jeden Geschmack.', allH: 'All Inclusive', allS: 'Gastronomie-Erlebnis mit Buffet und A-la-carte.', allB1: 'WhatsApp', allB2: 'Zimmer ansehen' },
        ru: { title: 'Ресторан и Бар', sub: 'Уникальные вкусы', bc: 'Ресторан', badge: 'Гастрономия', h: 'Вкусы и', ha: 'Ароматы', intro: 'Наши рестораны и бары для любого вкуса.', allH: 'Всё включено', allS: 'Гастрономический опыт с шведским столом и а-ля карт.', allB1: 'WhatsApp', allB2: 'Смотреть номера' },
    }
    const c = t[locale] || t.tr
    return [
        { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/restoran` }] } },
        { type: 'text-block', data: { label: c.badge, heading: c.h, headingAccent: c.ha, content: c.intro, backgroundColor: 'white' } },
        {
            type: 'image-grid', data: {
                items: [
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", title: "Blue Restaurant", badge: "Ana Restoran", description: "Zengin açık büfe kahvaltı, öğle ve akşam yemekleri", meta: "07:00 - 22:00", meta2: "Dünya Mutfağı" },
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", title: "Italian A'la Carte", badge: "A'la Carte", description: "Otantik İtalyan lezzetleri ve taze makarnalar", meta: "19:00 - 22:00", meta2: "İtalyan" },
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", title: "Beach Bar", badge: "Bar", description: "Tropikal kokteyller ve hafif atıştırmalıklar", meta: "10:00 - 24:00" },
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", title: "Sunset Bar", badge: "Bar", description: "Gün batımı eşliğinde özel kokteyller", meta: "17:00 - 01:00" }
                ], variant: 'overlay', columns: 2
            }
        },
        { type: 'cta', data: { heading: c.allH, subtitle: c.allS, backgroundColor: 'dark', buttons: [{ text: c.allB1, url: "https://wa.me/902523371111", variant: 'white' }, { text: c.allB2, url: `/${locale}/odalar`, variant: 'white-outline' }] } },
    ]
}

function spaWidgets(locale) {
    const t = {
        tr: { title: 'Spa & Wellness', sub: 'Naya Spa ile huzurun adresi', bc: 'Spa', introH: 'Beden ve', introHA: 'Ruh Dengesi', p1: "Naya Spa, antik Anadolu şifa ritüellerinden ilham alan benzersiz masaj ve bakım programları sunar.", p2: "Profesyonel terapistlerimiz size özel wellness deneyimi yaratır.", bookBtn: 'Randevu Al', featLabel: 'Masaj Seçenekleri', featH: 'Öne Çıkan Bakımlar', wellH: 'Neden Naya Spa?', organic: 'Organik Ürünler', organicD: 'Doğal ve organik bakım ürünleri', therapists: 'Uzman Terapistler', therapistsD: 'Sertifikalı profesyonel ekip', atmosphere: 'Huzurlu Atmosfer', atmosphereD: 'Doğa ile iç içe spa ortamı', facLabel: 'Tesisler', facH: 'Spa Tesislerimiz', pool: 'Infinity Pool', poolD: 'Denize sıfır sonsuzluk havuzu', beach: 'Özel Plaj', beachD: 'Berrak sulara sahip özel kumsal', fitness: 'Fitness Center', fitnessD: 'Modern ekipmanlarla donatılmış salon', ctaH: 'Kendinize Bir İyilik Yapın', ctaS: 'Naya Spa\'da profesyonel bakım ve masaj için randevunuzu alın.', ctaB1: 'Randevu Al' },
        en: { title: 'Spa & Wellness', sub: 'Naya Spa — your haven of peace', bc: 'Spa', introH: 'Body and', introHA: 'Soul Balance', p1: "Naya Spa offers unique massage and care programs inspired by ancient Anatolian healing rituals.", p2: "Our professional therapists create a personalized wellness experience.", bookBtn: 'Book Appointment', featLabel: 'Massage Options', featH: 'Featured Treatments', wellH: 'Why Naya Spa?', organic: 'Organic Products', organicD: 'Natural and organic care products', therapists: 'Expert Therapists', therapistsD: 'Certified professional team', atmosphere: 'Peaceful Atmosphere', atmosphereD: 'Spa environment in harmony with nature', facLabel: 'Facilities', facH: 'Our Spa Facilities', pool: 'Infinity Pool', poolD: 'Beachfront infinity pool', beach: 'Private Beach', beachD: 'Private beach with crystal clear waters', fitness: 'Fitness Center', fitnessD: 'Fully equipped modern gym', ctaH: 'Treat Yourself', ctaS: 'Book your professional care and massage at Naya Spa.', ctaB1: 'Book Now' },
        de: { title: 'Spa & Wellness', sub: 'Naya Spa — Ihr Ort der Ruhe', bc: 'Spa', introH: 'Körper und', introHA: 'Seele Balance', p1: "Naya Spa bietet einzigartige Massage- und Pflegeprogramme.", p2: "Unsere professionellen Therapeuten schaffen ein persönliches Wellness-Erlebnis.", bookBtn: 'Termin buchen', featLabel: 'Massageoptionen', featH: 'Ausgewählte Behandlungen', wellH: 'Warum Naya Spa?', organic: 'Bio-Produkte', organicD: 'Natürliche und biologische Pflegeprodukte', therapists: 'Experten-Therapeuten', therapistsD: 'Zertifiziertes professionelles Team', atmosphere: 'Friedliche Atmosphäre', atmosphereD: 'Spa-Umgebung im Einklang mit der Natur', facLabel: 'Einrichtungen', facH: 'Unsere Spa-Einrichtungen', pool: 'Infinity Pool', poolD: 'Infinity-Pool am Strand', beach: 'Privatstrand', beachD: 'Privatstrand mit kristallklarem Wasser', fitness: 'Fitnesscenter', fitnessD: 'Voll ausgestattetes modernes Fitnessstudio', ctaH: 'Gönnen Sie sich etwas', ctaS: 'Buchen Sie Ihre professionelle Pflege und Massage im Naya Spa.', ctaB1: 'Jetzt Buchen' },
        ru: { title: 'Спа и Велнес', sub: 'Naya Spa — ваш оазис покоя', bc: 'Спа', introH: 'Баланс', introHA: 'Тела и Души', p1: "Naya Spa предлагает уникальные массажные и оздоровительные программы.", p2: "Наши профессиональные терапевты создадут персональный велнес-опыт.", bookBtn: 'Записаться', featLabel: 'Варианты массажа', featH: 'Избранные процедуры', wellH: 'Почему Naya Spa?', organic: 'Органические продукты', organicD: 'Натуральные и органические средства ухода', therapists: 'Эксперты-терапевты', therapistsD: 'Сертифицированная профессиональная команда', atmosphere: 'Атмосфера покоя', atmosphereD: 'Спа в гармонии с природой', facLabel: 'Удобства', facH: 'Наши спа-удобства', pool: 'Инфинити пул', poolD: 'Бассейн на берегу моря', beach: 'Частный пляж', beachD: 'Частный пляж с кристально чистой водой', fitness: 'Фитнес-центр', fitnessD: 'Современный тренажерный зал', ctaH: 'Побалуйте себя', ctaS: 'Запишитесь на профессиональный уход и массаж в Naya Spa.', ctaB1: 'Записаться' },
    }
    const c = t[locale] || t.tr
    return [
        { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/spa` }] } },
        { type: 'text-image', data: { label: 'Naya Spa', heading: c.introH, headingAccent: c.introHA, paragraphs: [c.p1, c.p2], image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg", imageAlt: "Naya Spa", buttons: [{ text: c.bookBtn, url: "https://wa.me/905495167801", variant: 'primary' }] } },
        {
            type: 'image-grid', data: {
                label: c.featLabel, heading: c.featH, items: [
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", title: "Bali Masajı", description: "Endonezya kökenli derin doku masajı", meta: "60 dk" },
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", title: "Aromaterapi", description: "Uçucu yağlarla rahatlatıcı masaj", meta: "45 dk" },
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", title: "Hot Stone", description: "Sıcak taş terapi ile derin gevşeme", meta: "60 dk" }
                ], variant: 'card', columns: 3
            }
        },
        {
            type: 'icon-grid', data: {
                heading: c.wellH, backgroundColor: 'dark', items: [
                    { icon: '🌿', title: c.organic, description: c.organicD },
                    { icon: '💆', title: c.therapists, description: c.therapistsD },
                    { icon: '🕊️', title: c.atmosphere, description: c.atmosphereD }
                ]
            }
        },
        {
            type: 'image-grid', data: {
                label: c.facLabel, heading: c.facH, items: [
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", title: c.pool, description: c.poolD },
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", title: c.beach, description: c.beachD },
                    { image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", title: c.fitness, description: c.fitnessD }
                ], variant: 'simple', columns: 3
            }
        },
        { type: 'cta', data: { heading: c.ctaH, subtitle: c.ctaS, backgroundColor: 'gradient', buttons: [{ text: c.ctaB1, url: "https://wa.me/905495167823", variant: 'white' }, { text: "+90 252 337 11 11", url: "tel:+902523371111", variant: 'white-outline' }] } },
    ]
}

function contactWidgets(locale) {
    const t = {
        tr: { title: 'İletişim', sub: 'Sorularınız için bize ulaşın', bc: 'İletişim' },
        en: { title: 'Contact', sub: 'Get in touch with us', bc: 'Contact' },
        de: { title: 'Kontakt', sub: 'Kontaktieren Sie uns', bc: 'Kontakt' },
        ru: { title: 'Контакты', sub: 'Свяжитесь с нами', bc: 'Контакты' },
    }
    const c = t[locale] || t.tr
    return [
        { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/iletisim` }] } },
        { type: 'contact', data: { infoLabel: locale === 'tr' ? 'İletişim Bilgileri' : 'Contact Info', infoHeading: locale === 'tr' ? 'Bize' : 'Get in', infoHeadingAccent: locale === 'tr' ? 'Ulaşın' : 'Touch', address: "Torba Mahallesi Herodot Bulvarı No:11\nBodrum / MUĞLA / TÜRKİYE", phone: "+90 252 337 11 11", whatsapp: "+90 549 516 78 03", email: "sales@bluedreamsresort.com", hours: locale === 'tr' ? "Resepsiyon: 7/24\nRezervasyon: 09:00 - 22:00" : "Reception: 24/7\nReservations: 09:00 - 22:00", socialLinks: { facebook: "https://www.facebook.com/bluedreamshotel", instagram: "https://www.instagram.com/clubbluedreamsresort/", youtube: "https://www.youtube.com/@bluedreamsresort8738/videos", linkedin: "https://www.linkedin.com/company/bluedreamsresortbodrum" }, subjects: [{ value: "reservation", label: locale === 'tr' ? "Rezervasyon" : "Reservation" }, { value: "info", label: locale === 'tr' ? "Bilgi Talebi" : "Information" }, { value: "complaint", label: locale === 'tr' ? "Şikayet" : "Complaint" }, { value: "other", label: locale === 'tr' ? "Diğer" : "Other" }] } },
        { type: 'map', data: { lat: 37.091832, lng: 27.4824998, zoom: 15 } },
    ]
}

function weddingWidgets(locale) {
    return [
        { type: 'hero', data: { backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3-1024x682.jpg", titleLine1: locale === 'tr' ? "Düğün & Davet" : "Wedding & Events", subtitle: locale === 'tr' ? "En özel anlarınız için eşsiz bir atmosfer" : "A unique atmosphere for your special moments" } },
        { type: 'text-image', data: { heading: locale === 'tr' ? "Rüyaların Gerçeğe Dönüştüğü Yer" : "Where Dreams Come True", headingAccent: "Blue Dreams Resort", paragraphs: [locale === 'tr' ? "Bodrum'un en güzel manzarası ayaklarınızın altında. Denize sıfır konumu, profesyonel ekibi ve büyüleyici atmosferi ile hayallerinizdeki düğünü gerçeğe dönüştürüyoruz." : "The most beautiful view of Bodrum at your feet. We make your dream wedding come true with our beachfront location and professional team."], image: "https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg", imagePosition: 'left', listItems: [locale === 'tr' ? "Eşsiz Gün Batımı Manzarası" : "Unique Sunset View", locale === 'tr' ? "Özel Kokteyl ve Yemek Menüleri" : "Special Cocktail & Dinner Menus", locale === 'tr' ? "Profesyonel Organizasyon Desteği" : "Professional Organization Support"] } },
        { type: 'youtube', data: { videos: [{ url: "https://www.youtube.com/embed/JJc20SjIENQ?controls=1&rel=0", title: "Wedding Video 1" }, { url: "https://www.youtube.com/embed/KDfh1NV2eUc?controls=1&rel=0", title: "Wedding Video 2" }], columns: 2 } },
        { type: 'cta', data: { heading: locale === 'tr' ? "Profesyonel Organizasyon Ekibi" : "Professional Organization Team", subtitle: locale === 'tr' ? "Hayalinizdeki geceyi en ince ayrıntısına kadar planlıyoruz." : "We plan the night of your dreams down to the last detail.", backgroundColor: 'brand' } },
        { type: 'icon-grid', data: { heading: locale === 'tr' ? "Etkinlik Alanlarımız" : "Our Event Venues", items: [{ icon: '📍', title: locale === 'tr' ? 'Mekan' : 'Venue', description: 'Sunset Pool' }, { icon: '🍷', title: locale === 'tr' ? 'Kokteyl' : 'Cocktail', description: locale === 'tr' ? 'Teras' : 'Terrace' }, { icon: '👥', title: locale === 'tr' ? 'Kişi Sayısı' : 'Capacity', description: '300 - 500' }], columns: 3 } },
        {
            type: 'gallery', data: {
                images: [
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00128.jpg", title: "Wedding 1" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.40.42.jpeg", title: "Wedding 2" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/WhatsApp-Image-2020-11-23-at-15.39.56.jpeg", title: "Wedding 3" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/DSC00170.jpg", title: "Wedding 4" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/0717_MR_2020__U5A2193_3.jpg", title: "Wedding 5" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/04/0713_MR_2020__U5A2186_3.jpg", title: "Wedding 6" }
                ]
            }
        },
    ]
}

function galleryWidgets(locale) {
    return [
        { type: 'page-header', data: { title: locale === 'tr' ? 'Galeri' : 'Gallery', subtitle: locale === 'tr' ? "Blue Dreams Resort'un atmosferini fotoğraflarla keşfedin." : "Discover the atmosphere of Blue Dreams Resort through photos.", backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", breadcrumbs: [{ label: locale === 'tr' ? 'Galeri' : 'Gallery', href: `/${locale}/galeri` }] } },
        {
            type: 'gallery', data: {
                images: [
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", title: "Aerial View", category: locale === 'tr' ? "Genel" : "General" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg", title: "Deluxe Room", category: locale === 'tr' ? "Odalar" : "Rooms" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg", title: "Infinity Pool", category: locale === 'tr' ? "Plaj & Havuz" : "Beach & Pool" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg", title: "Pool View", category: locale === 'tr' ? "Plaj & Havuz" : "Beach & Pool" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg", title: "Sandy Beach", category: locale === 'tr' ? "Plaj & Havuz" : "Beach & Pool" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg", title: "Italian Restaurant", category: locale === 'tr' ? "Gastronomi" : "Gastronomy" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", title: "Open Buffet", category: locale === 'tr' ? "Gastronomi" : "Gastronomy" },
                    { src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg", title: "Club Room", category: locale === 'tr' ? "Odalar" : "Rooms" }
                ]
            }
        },
    ]
}

function meetingWidgets(locale) {
    const t = {
        tr: { title: 'Toplantı & Etkinlik Alanları', sub: 'Kurumsal etkinlikleriniz için profesyonel çözümler', bc: 'Toplantı & Etkinlik', mainLabel: 'Ana Salon', mainDesc: 'En büyük salonumuz olan İstanbul, 770 m² genişliği ile büyük kongreler ve gala yemekleri için idealdir.', tableLabel: 'Toplantı Odaları', tableH: 'Farklı İhtiyaçlar İçin Farklı Mekanlar', ctaH: 'Etkinliğinizi Planlayalım', ctaS: 'Kurumsal toplantılarınız için ekibimizle iletişime geçin.', ctaB1: '+90 252 337 11 11', ctaB2: 'E-posta Gönderin', cols: ['Salon Adı', 'Tiyatro Düzeni', 'Toplantı Düzeni', 'Boyut', 'Yükseklik'] },
        en: { title: 'Meeting & Event Venues', sub: 'Professional solutions for corporate events', bc: 'Meeting & Events', mainLabel: 'Main Hall', mainDesc: 'Our largest hall Istanbul, with 770 m² area, is ideal for large congresses and gala dinners.', tableLabel: 'Meeting Rooms', tableH: 'Different Venues for Different Needs', ctaH: 'Let Us Plan Your Event', ctaS: 'Contact our team for your corporate meetings.', ctaB1: '+90 252 337 11 11', ctaB2: 'Send Email', cols: ['Hall Name', 'Theater Layout', 'Meeting Layout', 'Size', 'Height'] },
        de: { title: 'Tagungs- & Veranstaltungsräume', sub: 'Professionelle Lösungen für Firmenveranstaltungen', bc: 'Tagung & Events', mainLabel: 'Hauptsaal', mainDesc: 'Unser größter Saal Istanbul mit 770 m² ist ideal für Kongresse und Galadinner.', tableLabel: 'Tagungsräume', tableH: 'Verschiedene Räume für verschiedene Bedürfnisse', ctaH: 'Lassen Sie uns planen', ctaS: 'Kontaktieren Sie unser Team.', ctaB1: '+90 252 337 11 11', ctaB2: 'E-Mail senden', cols: ['Saalname', 'Theaterbestuhlung', 'Tagungsbestuhlung', 'Größe', 'Höhe'] },
        ru: { title: 'Конференц-залы', sub: 'Профессиональные решения для мероприятий', bc: 'Конференции', mainLabel: 'Главный зал', mainDesc: 'Наш самый большой зал Стамбул площадью 770 м² идеален для конгрессов и гала-ужинов.', tableLabel: 'Залы заседаний', tableH: 'Разные залы для разных потребностей', ctaH: 'Давайте спланируем', ctaS: 'Свяжитесь с нашей командой.', ctaB1: '+90 252 337 11 11', ctaB2: 'Отправить email', cols: ['Название', 'Театр', 'Переговоры', 'Размер', 'Высота'] },
    }
    const c = t[locale] || t.tr
    return [
        { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/toplanti-salonu` }] } },
        { type: 'text-image', data: { label: c.mainLabel, heading: 'İstanbul Salonu', paragraphs: [c.mainDesc], image: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg", badge: { value: '770 m²', label: c.mainLabel }, buttons: [{ text: c.ctaB1, url: "tel:+902523371111", variant: 'primary' }] } },
        {
            type: 'table', data: {
                label: c.tableLabel, heading: c.tableH, backgroundColor: 'sand', columns: [{ key: 'name', label: c.cols[0] }, { key: 'theater', label: c.cols[1], align: 'center' }, { key: 'meeting', label: c.cols[2], align: 'center' }, { key: 'size', label: c.cols[3], align: 'center' }, { key: 'height', label: c.cols[4], align: 'center' }], rows: [
                    { name: 'Turunç', theater: '35', meeting: '10', size: '4.50 x 6.50 mt', height: '3.20 mt' },
                    { name: 'Salamis', theater: '45', meeting: '14', size: '8.30 x 4.35 mt', height: '2.70 mt' },
                    { name: 'Belek', theater: '20', meeting: '10', size: '4.40 x 4.40 mt', height: '2.70 mt' },
                    { name: 'Marmaris', theater: '30', meeting: '10', size: '4.30 x 5.30 mt', height: '2.70 mt' },
                    { name: 'Stockholm', theater: '20', meeting: '10', size: '4.30 x 4.40 mt', height: '2.70 mt' }
                ]
            }
        },
        { type: 'cta', data: { heading: c.ctaH, subtitle: c.ctaS, backgroundColor: 'dark', buttons: [{ text: c.ctaB1, url: "tel:+902523371111", variant: 'white' }, { text: c.ctaB2, url: "mailto:sales@bluedreamsresort.com", variant: 'white-outline' }] } },
    ]
}

function bodrumWidgets(locale) {
    const t = {
        tr: {
            title: 'Bodrum Rehberi', sub: 'Bodrum hakkında bilmeniz gereken her şey', bc: 'Bodrum', placesH: 'Keşfedilecek Yerler', weatherT: 'Bodrum Hava Durumu', weatherS: 'Aylık ortalama sıcaklıklar', places: [
                { name: 'Bodrum Kalesi', desc: "Saint Peter Kalesi ve Sualtı Arkeoloji Müzesi'ne ev sahipliği yapar.", img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
                { name: 'Antik Tiyatro', desc: '13.000 kişilik yaz konserleri tiyatrosu.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
                { name: 'Bodrum Marina', desc: 'Lüks yatlar ve deniz kıyısı restoranları.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
                { name: 'Gümüşlük Koyu', desc: 'Antik Myndos ve Tavşan Adası.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' }
            ]
        },
        en: {
            title: 'Bodrum Guide', sub: 'Everything you need to know about Bodrum', bc: 'Bodrum', placesH: 'Places to Discover', weatherT: 'Bodrum Weather', weatherS: 'Monthly averages', places: [
                { name: 'Bodrum Castle', desc: 'Historic Castle of St. Peter and Underwater Archaeology Museum.', img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
                { name: 'Ancient Theater', desc: 'Roman theater with 13,000 capacity for summer concerts.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
                { name: 'Bodrum Marina', desc: 'Luxury yachts and waterfront restaurants.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
                { name: 'Gümüşlük Bay', desc: 'Ancient Myndos ruins and Rabbit Island.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' }
            ]
        },
        de: {
            title: 'Bodrum Reiseführer', sub: 'Alles über Bodrum', bc: 'Bodrum', placesH: 'Orte zum Entdecken', weatherT: 'Bodrum Wetter', weatherS: 'Monatliche Durchschnittswerte', places: [
                { name: 'Burg von Bodrum', desc: 'Historische St. Peter Burg und Unterwasser-Museum.', img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
                { name: 'Antikes Theater', desc: 'Römisches Theater für Sommerkonzerte.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
                { name: 'Bodrum Marina', desc: 'Luxusyachten und Restaurants am Wasser.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
                { name: 'Bucht Gümüşlük', desc: 'Antike Ruinen von Myndos.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' }
            ]
        },
        ru: {
            title: 'Путеводитель по Бодруму', sub: 'Всё о Бодруме', bc: 'Бодрум', placesH: 'Достопримечательности', weatherT: 'Погода в Бодруме', weatherS: 'Среднемесячные показатели', places: [
                { name: 'Замок Бодрума', desc: 'Замок Святого Петра и Музей подводной археологии.', img: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg' },
                { name: 'Античный театр', desc: 'Римский театр на 13 000 мест.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg' },
                { name: 'Марина Бодрума', desc: 'Роскошные яхты и рестораны.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg' },
                { name: 'Бухта Гюмюшлюк', desc: 'Руины древнего Миндоса.', img: 'https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg' }
            ]
        },
    }
    const c = t[locale] || t.tr
    return [
        { type: 'page-header', data: { title: c.title, subtitle: c.sub, backgroundImage: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg", breadcrumbs: [{ label: c.bc, href: `/${locale}/bodrum` }] } },
        { type: 'image-grid', data: { label: 'Bodrum', heading: c.placesH, items: c.places.map(p => ({ image: p.img, title: p.name, description: p.desc })), variant: 'card', columns: 4 } },
        {
            type: 'weather', data: {
                title: c.weatherT, subtitle: c.weatherS, months: [
                    { name: 'Oca', avgHigh: 15, avgLow: 7, icon: 'cloud', rainDays: 12 }, { name: 'Şub', avgHigh: 15, avgLow: 7, icon: 'cloud', rainDays: 10 },
                    { name: 'Mar', avgHigh: 18, avgLow: 9, icon: 'cloudsun', rainDays: 8 }, { name: 'Nis', avgHigh: 21, avgLow: 12, icon: 'sun', rainDays: 5 },
                    { name: 'May', avgHigh: 26, avgLow: 16, icon: 'sun', rainDays: 3 }, { name: 'Haz', avgHigh: 31, avgLow: 20, icon: 'sun', rainDays: 1 },
                    { name: 'Tem', avgHigh: 34, avgLow: 23, icon: 'sun', rainDays: 0 }, { name: 'Ağu', avgHigh: 34, avgLow: 23, icon: 'sun', rainDays: 0 },
                    { name: 'Eyl', avgHigh: 30, avgLow: 19, icon: 'sun', rainDays: 1 }, { name: 'Eki', avgHigh: 25, avgLow: 15, icon: 'cloudsun', rainDays: 4 },
                    { name: 'Kas', avgHigh: 20, avgLow: 11, icon: 'cloud', rainDays: 8 }, { name: 'Ara', avgHigh: 16, avgLow: 8, icon: 'cloud', rainDays: 11 }
                ]
            }
        },
    ]
}

module.exports = { aboutWidgets, roomsWidgets, restaurantWidgets, spaWidgets, contactWidgets, weddingWidgets, galleryWidgets, meetingWidgets, bodrumWidgets }
