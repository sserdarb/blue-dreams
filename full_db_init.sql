
-- EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLES

CREATE TABLE IF NOT EXISTS "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "metaDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Page_slug_locale_key" ON "Page"("slug", "locale");

CREATE TABLE IF NOT EXISTS "Widget" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "pageId" TEXT NOT NULL,
    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Widget_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "ChatSession" (
    "id" TEXT NOT NULL,
    "customerName" TEXT,
    "status" TEXT DEFAULT 'active',
    "visitorId" TEXT,
    "visitorInfo" TEXT,
    "isOnline" BOOLEAN DEFAULT TRUE,
    "lastActivity" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isFromAdmin" BOOLEAN DEFAULT FALSE,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ChatMessage_session_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "AiSettings" (
    "id" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "language" TEXT DEFAULT 'tr',
    "tone" TEXT DEFAULT 'friendly',
    "isActive" BOOLEAN DEFAULT TRUE,
    "apiKey" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Language" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nativeName" TEXT,
    "flag" TEXT,
    "isActive" BOOLEAN DEFAULT TRUE,
    "isDefault" BOOLEAN DEFAULT FALSE,
    "order" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Language_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "Language_code_key" ON "Language"("code");

CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "siteName" TEXT DEFAULT 'Blue Dreams Resort',
    "logo" TEXT,
    "favicon" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "socialLinks" TEXT,
    "footerText" TEXT,
    "footerCopyright" TEXT,
    "headerStyle" TEXT DEFAULT 'default',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "SiteSettings_locale_key" ON "SiteSettings"("locale");

CREATE TABLE IF NOT EXISTS "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT DEFAULT 'Admin',
    "role" TEXT DEFAULT 'admin',
    "isActive" BOOLEAN DEFAULT TRUE,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "AdminUser_email_key" ON "AdminUser"("email");

-- Insert Data

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('ee5c8546-0a25-4468-b8fa-bb95d6758f75', 'home', 'tr', 'Blue Dreams Resort', 'Blue Dreams Resort - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('d8cbd443-8a6f-4de2-9e34-620022bf033e', 'HeroSection', '{"title": "Her G\u00fczel R\u00fcya Blue Dreams''te Ba\u015flar", "subtitle": "Bodrum Torba''da 5 Y\u0131ld\u0131zl\u0131 Ultra Her \u015eey Dahil Tatil Deneyimi", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Her+G\u00fczel+R\u00fcya+Blue+Dreams''te+Ba\u015flar"}', 0, 'ee5c8546-0a25-4468-b8fa-bb95d6758f75');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('d95758f4-4981-45c4-a0c3-7c8f0b258337', 'TextBlock', '{"content": "<h2>Blue Dreams Resort</h2><p>E\u015fsiz Do\u011fas\u0131, \u00d6zel Sahili, Sonsuzluk Havuzu Ile Birlikte 5 Havuzu, Ege''nin En G\u00fczel G\u00fcn Bat\u0131m\u0131na A\u00e7\u0131lan Restoran Ve Barlar\u0131 Ile Sizi Bekliyor.</p>"}', 1, 'ee5c8546-0a25-4468-b8fa-bb95d6758f75');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('dabb9c29-189b-43e1-b23a-cc9c6e7e3527', 'odalar', 'tr', 'Odalar', 'Odalar - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('1767287c-1835-4e60-b269-cc8d90abcacc', 'HeroSection', '{"title": "Konforlu Konaklama", "subtitle": "Evinizdeki Rahatl\u0131k", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Konforlu+Konaklama"}', 0, 'dabb9c29-189b-43e1-b23a-cc9c6e7e3527');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('aa3d3fa8-fb19-4355-a62d-a6e39431e5f6', 'TextBlock', '{"content": "<h2>Odalar</h2><p>Modern ve \u015f\u0131k tasar\u0131ml\u0131 odalar\u0131m\u0131zda unutulmaz bir tatil deneyimi ya\u015fay\u0131n.</p>"}', 1, 'dabb9c29-189b-43e1-b23a-cc9c6e7e3527');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('1a848cb6-bb91-4434-93aa-1c9d80036ba9', 'odalar/club', 'tr', 'Club Odalar', 'Club Odalar - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('aaed5c30-eebb-4984-be14-2341d74661d3', 'HeroSection', '{"title": "Club Odalar", "subtitle": "Do\u011fa ile \u0130\u00e7 \u0130\u00e7e", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Club+Odalar"}', 0, '1a848cb6-bb91-4434-93aa-1c9d80036ba9');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('59e5ef9d-a7f0-4914-b8ab-f64f9e50631b', 'TextBlock', '{"content": "<h2>Club Odalar</h2><p>Ye\u015fillikler i\u00e7inde, \u00f6zel balkonlu ve deniz manzaral\u0131 club odalar\u0131m\u0131z.</p>"}', 1, '1a848cb6-bb91-4434-93aa-1c9d80036ba9');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('fec3d245-2e03-4d99-92db-0416ab566dc5', 'yeme-icme', 'tr', 'Restoranlar', 'Restoranlar - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('2ad0f516-8e1d-4a6d-b60a-c095719b1f76', 'HeroSection', '{"title": "Lezzet Yolculu\u011fu", "subtitle": "D\u00fcnya Mutfaklar\u0131ndan Se\u00e7meler", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Lezzet+Yolculu\u011fu"}', 0, 'fec3d245-2e03-4d99-92db-0416ab566dc5');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('6e0d4b9d-fff9-4ba8-b7ed-c5eb44ed8d83', 'TextBlock', '{"content": "<h2>Restoranlar</h2><p>Ana restoran\u0131m\u0131z ve A''la Carte restoranlar\u0131m\u0131zda e\u015fsiz lezzetleri ke\u015ffedin.</p>"}', 1, 'fec3d245-2e03-4d99-92db-0416ab566dc5');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('bb686e0e-e804-4580-8efe-c40edd236b18', 'spa', 'tr', 'Spa & Wellness', 'Spa & Wellness - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('12d5f1dc-6521-436f-9c1c-9533042d1865', 'HeroSection', '{"title": "Ruhunuzu Yenileyin", "subtitle": "Spa & Masaj Hizmetleri", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Ruhunuzu+Yenileyin"}', 0, 'bb686e0e-e804-4580-8efe-c40edd236b18');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('f5efb950-5db2-49c4-b993-dee8c33ec3ca', 'TextBlock', '{"content": "<h2>Spa & Wellness</h2><p>Uzman terapistlerimiz e\u015fli\u011finde g\u00fcn\u00fcn yorgunlu\u011funu at\u0131n.</p>"}', 1, 'bb686e0e-e804-4580-8efe-c40edd236b18');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('2fbd7be2-a0b0-467d-8a2b-fe79496f46ab', 'galeri', 'tr', 'Galeri', 'Galeri - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('73e25542-7fc7-49d7-8b16-b87e2c8f39f6', 'HeroSection', '{"title": "Galeri", "subtitle": "Otelden Kareler", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Galeri"}', 0, '2fbd7be2-a0b0-467d-8a2b-fe79496f46ab');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('044904ce-d82d-4e9d-8a33-905a2060eea0', 'TextBlock', '{"content": "<h2>Galeri</h2><p>Blue Dreams Resort''un b\u00fcy\u00fcleyici atmosferine g\u00f6z at\u0131n.</p>"}', 1, '2fbd7be2-a0b0-467d-8a2b-fe79496f46ab');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('49728faf-e6d4-4a90-8aff-62cd9ce8fc5f', 'iletisim', 'tr', 'İletişim', 'İletişim - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('e13c091c-01d4-4f42-a0be-cfbd3bdcbe3e', 'HeroSection', '{"title": "\u0130leti\u015fim", "subtitle": "Bize Ula\u015f\u0131n", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=\u0130leti\u015fim"}', 0, '49728faf-e6d4-4a90-8aff-62cd9ce8fc5f');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('21cfeb59-6fb9-4aa8-9075-010f9703bb87', 'TextBlock', '{"content": "<h2>\u0130leti\u015fim</h2><p>Sorular\u0131n\u0131z ve rezervasyon talepleriniz i\u00e7in bizimle ileti\u015fime ge\u00e7in.</p>"}', 1, '49728faf-e6d4-4a90-8aff-62cd9ce8fc5f');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('7b07db55-70f7-4a56-bfc7-cac327f07c75', 'home', 'en', 'Blue Dreams Resort', 'Blue Dreams Resort - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('9ec293da-9d82-4968-986c-a3ff40dce2fd', 'HeroSection', '{"title": "Every Dream Starts with Blue", "subtitle": "5 Star Ultra All Inclusive Holiday Experience in Bodrum Torba", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Every+Dream+Starts+with+Blue"}', 0, '7b07db55-70f7-4a56-bfc7-cac327f07c75');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('3d362946-1e82-45c1-9262-7a6356236062', 'TextBlock', '{"content": "<h2>Blue Dreams Resort</h2><p>The Blue Dreams Resort caters to all your needs with five swimming pools and one pool equipped with slides.</p>"}', 1, '7b07db55-70f7-4a56-bfc7-cac327f07c75');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('248850b9-fdfc-4b33-98fe-c58dc9e666a7', 'rooms', 'en', 'Rooms', 'Rooms - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('590ce77c-1961-4889-b5bc-695464601dd9', 'HeroSection', '{"title": "Accommodation", "subtitle": "Comfort & Luxury", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Accommodation"}', 0, '248850b9-fdfc-4b33-98fe-c58dc9e666a7');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('ebe90328-a8a0-4384-885f-79ff6c4cec2a', 'TextBlock', '{"content": "<h2>Rooms</h2><p>Experience an unforgettable holiday in our modern and stylishly designed rooms.</p>"}', 1, '248850b9-fdfc-4b33-98fe-c58dc9e666a7');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('b8fd675c-e9f0-4464-8cd2-4fa505e0430b', 'rooms/club', 'en', 'Club Rooms', 'Club Rooms - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('f4f1cd84-d6d3-4014-875c-399f7bc1cd0c', 'HeroSection', '{"title": "Club Rooms", "subtitle": "Nature & Peace", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Club+Rooms"}', 0, 'b8fd675c-e9f0-4464-8cd2-4fa505e0430b');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('ac539f84-99d9-409c-b9c5-de6a62f20a5b', 'TextBlock', '{"content": "<h2>Club Rooms</h2><p>Our club rooms featuring private balconies and sea views, nestled in greenery.</p>"}', 1, 'b8fd675c-e9f0-4464-8cd2-4fa505e0430b');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('9f16885b-7ab3-4a15-a849-3420861c796b', 'food-drink', 'en', 'Food & Drink', 'Food & Drink - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('2077cc6c-8f56-40da-bc4d-73ff5b4ed214', 'HeroSection', '{"title": "Culinary Journey", "subtitle": "World Cuisines", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Culinary+Journey"}', 0, '9f16885b-7ab3-4a15-a849-3420861c796b');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('b0381dd4-e0e9-4d2c-9479-2ff5bb512693', 'TextBlock', '{"content": "<h2>Food & Drink</h2><p>Discover unique tastes in our main restaurant and A''la Carte restaurants.</p>"}', 1, '9f16885b-7ab3-4a15-a849-3420861c796b');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('fccd6cb9-b1a4-4575-a001-1cbf0db3c80e', 'spa-wellness', 'en', 'Spa & Wellness', 'Spa & Wellness - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('e628a339-203b-45bd-b0cb-9ebef4ef88e6', 'HeroSection', '{"title": "Rejuvenate Your Soul", "subtitle": "Spa & Massage Services", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Rejuvenate+Your+Soul"}', 0, 'fccd6cb9-b1a4-4575-a001-1cbf0db3c80e');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('4605d421-1bb1-4e3e-820f-dda0be6b01a7', 'TextBlock', '{"content": "<h2>Spa & Wellness</h2><p>Relieve the tiredness of the day with our expert therapists.</p>"}', 1, 'fccd6cb9-b1a4-4575-a001-1cbf0db3c80e');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('1c083ac2-5990-4dcf-8f57-07247b0f9e1f', 'gallery', 'en', 'Gallery', 'Gallery - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('13ef2853-7ef7-432e-a547-41cdb36fb693', 'HeroSection', '{"title": "Gallery", "subtitle": "Moments from Blue Dreams", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Gallery"}', 0, '1c083ac2-5990-4dcf-8f57-07247b0f9e1f');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('f8685bfd-c651-4b3d-86e0-b9fec756ca4e', 'TextBlock', '{"content": "<h2>Gallery</h2><p>Take a look at the fascinating atmosphere of Blue Dreams Resort.</p>"}', 1, '1c083ac2-5990-4dcf-8f57-07247b0f9e1f');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('d35e6125-db67-40ff-a767-95c30798dfb8', 'contact-us', 'en', 'Contact', 'Contact - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('229b2ab1-d071-41b6-aa81-61ba1c0ee3c4', 'HeroSection', '{"title": "Contact Us", "subtitle": "Get in Touch", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Contact+Us"}', 0, 'd35e6125-db67-40ff-a767-95c30798dfb8');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('7136f2ca-346c-43df-9498-64c8660d6bd9', 'TextBlock', '{"content": "<h2>Contact</h2><p>Contact us for your questions and reservation requests.</p>"}', 1, 'd35e6125-db67-40ff-a767-95c30798dfb8');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('eb54ef7f-123c-4c09-97ae-f09e8907e080', 'home', 'de', 'Blue Dreams Resort', 'Blue Dreams Resort - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('55a5e460-825b-4d6e-aa8a-e13c1e1f88c8', 'HeroSection', '{"title": "Jeder sch\u00f6ne Traum Beginnt bei Blue Dreams", "subtitle": "5-Sterne Ultra All Inclusive Urlaub in Bodrum Torba", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Jeder+sch\u00f6ne+Traum+Beginnt+bei+Blue+Dreams"}', 0, 'eb54ef7f-123c-4c09-97ae-f09e8907e080');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('8121e10a-849b-47d2-b46f-f2271a26032c', 'TextBlock', '{"content": "<h2>Blue Dreams Resort</h2><p>Es erwartet Sie eine einzigartige Natur, ein Privatstrand, 5 Pools mit Infinity-Pool.</p>"}', 1, 'eb54ef7f-123c-4c09-97ae-f09e8907e080');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('611b9f85-6c19-41f4-a701-ece099c4eaf4', 'zimmer', 'de', 'Zimmer', 'Zimmer - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('827ca3d7-69ab-47e7-ae4a-03e15f3a59f9', 'HeroSection', '{"title": "Unterkunft", "subtitle": "Komfort & Luxus", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Unterkunft"}', 0, '611b9f85-6c19-41f4-a701-ece099c4eaf4');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('a65b2ccc-c2d3-4004-8d6a-c170d4a183e0', 'TextBlock', '{"content": "<h2>Zimmer</h2><p>Erleben Sie einen unvergesslichen Urlaub in unseren modern und stilvoll eingerichteten Zimmern.</p>"}', 1, '611b9f85-6c19-41f4-a701-ece099c4eaf4');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('3cb1a109-7518-4b8d-80bb-79b740219f25', 'zimmer/club', 'de', 'Club Zimmer', 'Club Zimmer - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('a213b288-e450-47ef-a545-d67742c3e64a', 'HeroSection', '{"title": "Club Zimmer", "subtitle": "Natur & Ruhe", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Club+Zimmer"}', 0, '3cb1a109-7518-4b8d-80bb-79b740219f25');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('7bcbe95a-02df-41b7-9b4d-211cf804965d', 'TextBlock', '{"content": "<h2>Club Zimmer</h2><p>Unsere Club-Zimmer inmitten von Gr\u00fcn mit eigenem Balkon und Meerblick.</p>"}', 1, '3cb1a109-7518-4b8d-80bb-79b740219f25');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('5baeb14e-d88d-4566-86e1-efb88ffc2e47', 'essen-trinken', 'de', 'Essen & Trinken', 'Essen & Trinken - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('e714a70c-c7c7-4239-a8b3-97599536794d', 'HeroSection', '{"title": "Kulinarische Reise", "subtitle": "Weltk\u00fcche", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Kulinarische+Reise"}', 0, '5baeb14e-d88d-4566-86e1-efb88ffc2e47');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('632642fc-cf33-4215-8ca0-d49711893b7e', 'TextBlock', '{"content": "<h2>Essen & Trinken</h2><p>Entdecken Sie einzigartige Geschm\u00e4cker in unserem Hauptrestaurant und den A''la Carte Restaurants.</p>"}', 1, '5baeb14e-d88d-4566-86e1-efb88ffc2e47');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('18e62055-813c-46be-b90c-4170da82b4f1', 'home', 'ru', 'Blue Dreams Resort', 'Blue Dreams Resort - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('c53a098d-f57b-4f57-b4a8-90b174b748ac', 'HeroSection', '{"title": "Every Dream Starts with Blue", "subtitle": "5 Star Ultra All Inclusive Holiday Experience", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Every+Dream+Starts+with+Blue"}', 0, '18e62055-813c-46be-b90c-4170da82b4f1');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('3ca97529-3aaa-4b95-85f2-ea60dcc797de', 'TextBlock', '{"content": "<h2>Blue Dreams Resort</h2><p>The Blue Dreams Resort caters to all your needs with five swimming pools.</p>"}', 1, '18e62055-813c-46be-b90c-4170da82b4f1');

INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ('13292073-2226-4f3c-ac70-270bf8673c91', 'rooms', 'ru', 'Rooms', 'Rooms - Blue Dreams Resort', NOW(), NOW());

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('8ca0ee1b-29e1-4e88-bece-4f1f7a6445ba', 'HeroSection', '{"title": "Accommodation", "subtitle": "Comfort & Luxury", "backgroundImage": "https://placehold.co/1920x1080/1e3a8a/ffffff?text=Accommodation"}', 0, '13292073-2226-4f3c-ac70-270bf8673c91');

INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ('1843c4e6-1115-4340-8422-259fa86ec4e8', 'TextBlock', '{"content": "<h2>Rooms</h2><p>Experience an unforgettable holiday in our modern and stylishly designed rooms.</p>"}', 1, '13292073-2226-4f3c-ac70-270bf8673c91');

INSERT INTO "Language" ("id", "code", "name", "nativeName", "flag", "isActive", "isDefault", "order", "createdAt")
VALUES ('61e2bf82-87d3-48a3-8420-03cc1671231e', 'tr', 'Türkçe', 'Türkçe', '🇹🇷', TRUE, TRUE, 0, NOW())
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "Language" ("id", "code", "name", "nativeName", "flag", "isActive", "isDefault", "order", "createdAt")
VALUES ('48bb0a93-cb50-4b23-8e59-b57f684bdd2b', 'en', 'English', 'English', '🇺🇸', TRUE, FALSE, 0, NOW())
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "Language" ("id", "code", "name", "nativeName", "flag", "isActive", "isDefault", "order", "createdAt")
VALUES ('dbe785f5-db73-4139-ab71-20cc3cc8dfb0', 'de', 'Deutsch', 'Deutsch', '🇩🇪', TRUE, FALSE, 0, NOW())
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "Language" ("id", "code", "name", "nativeName", "flag", "isActive", "isDefault", "order", "createdAt")
VALUES ('b1a23678-60f6-4f2b-9c08-d200fae9a4d7', 'ru', 'Russian', 'Русский', '🇷🇺', TRUE, FALSE, 0, NOW())
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "SiteSettings" ("id", "locale", "siteName", "createdAt", "updatedAt")
VALUES ('a0c67dcf-afa9-4c62-b7c2-bc3847f9a9ef', 'tr', 'Blue Dreams Resort', NOW(), NOW())
ON CONFLICT ("locale") DO NOTHING;

INSERT INTO "AdminUser" ("id", "email", "password", "name", "role", "isActive", "createdAt", "updatedAt")
VALUES ('57699fa1-f5fa-4730-b569-1fc8a3665ddb', 'admin@bluedreamsresort.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Super Admin', 'superadmin', TRUE, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;
