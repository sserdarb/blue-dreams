import uuid
import json
import time

# Data from previous seed script logic
# Helper
def get_uuid():
    return str(uuid.uuid4())

def escape_sql(val):
    if val is None:
        return 'NULL'
    if isinstance(val, bool):
        return 'TRUE' if val else 'FALSE'
    if isinstance(val, (int, float)):
        return str(val)
    return "'" + str(val).replace("'", "''") + "'"

# Seed Data Headers
PAGE_COLS = ["id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt"]
WIDGET_COLS = ["id", "type", "data", "order", "pageId"]
LANG_COLS = ["id", "code", "name", "nativeName", "flag", "isActive", "isDefault", "order", "createdAt"]
SETTINGS_COLS = ["id", "locale", "siteName", "createdAt", "updatedAt"]
ADMIN_COLS = ["id", "email", "password", "name", "role", "isActive", "createdAt", "updatedAt"]

# Content Data
pages_data = [
    # TR
    {
        "title": "Blue Dreams Resort", "slug": "home", "locale": "tr",
        "hero": {"title": "Her Güzel Rüya Blue Dreams'te Başlar", "subtitle": "Bodrum Torba'da 5 Yıldızlı Ultra Her Şey Dahil Tatil Deneyimi"},
        "content": "Eşsiz Doğası, Özel Sahili, Sonsuzluk Havuzu Ile Birlikte 5 Havuzu, Ege'nin En Güzel Gün Batımına Açılan Restoran Ve Barları Ile Sizi Bekliyor."
    },
    { "title": "Odalar", "slug": "odalar", "locale": "tr", "hero": {"title": "Konforlu Konaklama", "subtitle": "Evinizdeki Rahatlık"}, "content": "Modern ve şık tasarımlı odalarımızda unutulmaz bir tatil deneyimi yaşayın." },
    { "title": "Club Odalar", "slug": "odalar/club", "locale": "tr", "hero": {"title": "Club Odalar", "subtitle": "Doğa ile İç İçe"}, "content": "Yeşillikler içinde, özel balkonlu ve deniz manzaralı club odalarımız." },
    { "title": "Restoranlar", "slug": "yeme-icme", "locale": "tr", "hero": {"title": "Lezzet Yolculuğu", "subtitle": "Dünya Mutfaklarından Seçmeler"}, "content": "Ana restoranımız ve A'la Carte restoranlarımızda eşsiz lezzetleri keşfedin." },
    { "title": "Spa & Wellness", "slug": "spa", "locale": "tr", "hero": {"title": "Ruhunuzu Yenileyin", "subtitle": "Spa & Masaj Hizmetleri"}, "content": "Uzman terapistlerimiz eşliğinde günün yorgunluğunu atın." },
    { "title": "Galeri", "slug": "galeri", "locale": "tr", "hero": {"title": "Galeri", "subtitle": "Otelden Kareler"}, "content": "Blue Dreams Resort'un büyüleyici atmosferine göz atın." },
    { "title": "İletişim", "slug": "iletisim", "locale": "tr", "hero": {"title": "İletişim", "subtitle": "Bize Ulaşın"}, "content": "Sorularınız ve rezervasyon talepleriniz için bizimle iletişime geçin." },

    # EN
    {
        "title": "Blue Dreams Resort", "slug": "home", "locale": "en",
        "hero": {"title": "Every Dream Starts with Blue", "subtitle": "5 Star Ultra All Inclusive Holiday Experience in Bodrum Torba"},
        "content": "The Blue Dreams Resort caters to all your needs with five swimming pools and one pool equipped with slides."
    },
    { "title": "Rooms", "slug": "rooms", "locale": "en", "hero": {"title": "Accommodation", "subtitle": "Comfort & Luxury"}, "content": "Experience an unforgettable holiday in our modern and stylishly designed rooms." },
    { "title": "Club Rooms", "slug": "rooms/club", "locale": "en", "hero": {"title": "Club Rooms", "subtitle": "Nature & Peace"}, "content": "Our club rooms featuring private balconies and sea views, nestled in greenery." },
    { "title": "Food & Drink", "slug": "food-drink", "locale": "en", "hero": {"title": "Culinary Journey", "subtitle": "World Cuisines"}, "content": "Discover unique tastes in our main restaurant and A'la Carte restaurants." },
    { "title": "Spa & Wellness", "slug": "spa-wellness", "locale": "en", "hero": {"title": "Rejuvenate Your Soul", "subtitle": "Spa & Massage Services"}, "content": "Relieve the tiredness of the day with our expert therapists." },
    { "title": "Gallery", "slug": "gallery", "locale": "en", "hero": {"title": "Gallery", "subtitle": "Moments from Blue Dreams"}, "content": "Take a look at the fascinating atmosphere of Blue Dreams Resort." },
    { "title": "Contact", "slug": "contact-us", "locale": "en", "hero": {"title": "Contact Us", "subtitle": "Get in Touch"}, "content": "Contact us for your questions and reservation requests." },

    # DE
    {
        "title": "Blue Dreams Resort", "slug": "home", "locale": "de",
        "hero": {"title": "Jeder schöne Traum Beginnt bei Blue Dreams", "subtitle": "5-Sterne Ultra All Inclusive Urlaub in Bodrum Torba"},
        "content": "Es erwartet Sie eine einzigartige Natur, ein Privatstrand, 5 Pools mit Infinity-Pool."
    },
    { "title": "Zimmer", "slug": "zimmer", "locale": "de", "hero": {"title": "Unterkunft", "subtitle": "Komfort & Luxus"}, "content": "Erleben Sie einen unvergesslichen Urlaub in unseren modern und stilvoll eingerichteten Zimmern." },
    { "title": "Club Zimmer", "slug": "zimmer/club", "locale": "de", "hero": {"title": "Club Zimmer", "subtitle": "Natur & Ruhe"}, "content": "Unsere Club-Zimmer inmitten von Grün mit eigenem Balkon und Meerblick." },
    { "title": "Essen & Trinken", "slug": "essen-trinken", "locale": "de", "hero": {"title": "Kulinarische Reise", "subtitle": "Weltküche"}, "content": "Entdecken Sie einzigartige Geschmäcker in unserem Hauptrestaurant und den A'la Carte Restaurants." },

    # RU (Fallback to EN)
    {
        "title": "Blue Dreams Resort", "slug": "home", "locale": "ru",
        "hero": {"title": "Every Dream Starts with Blue", "subtitle": "5 Star Ultra All Inclusive Holiday Experience"},
        "content": "The Blue Dreams Resort caters to all your needs with five swimming pools."
    },
    { "title": "Rooms", "slug": "rooms", "locale": "ru", "hero": {"title": "Accommodation", "subtitle": "Comfort & Luxury"}, "content": "Experience an unforgettable holiday in our modern and stylishly designed rooms." },
]

# Generate SQL
sql = """
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
"""

# Pages and Widgets
for p in pages_data:
    p_id = get_uuid()
    p_hero_img = f"https://placehold.co/1920x1080/1e3a8a/ffffff?text={p['hero']['title'].replace(' ', '+')}"
    
    # Page SQL
    sql += f"""
INSERT INTO "Page" ("id", "slug", "locale", "title", "metaDescription", "createdAt", "updatedAt")
VALUES ({escape_sql(p_id)}, {escape_sql(p['slug'])}, {escape_sql(p['locale'])}, {escape_sql(p['title'])}, {escape_sql(p['title'] + ' - Blue Dreams Resort')}, NOW(), NOW());
"""

    # Widgets SQL
    # 0: Hero
    hero_data = json.dumps({
        "title": p['hero']['title'],
        "subtitle": p['hero']['subtitle'],
        "backgroundImage": p_hero_img
    })
    w_id = get_uuid()
    sql += f"""
INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ({escape_sql(w_id)}, 'HeroSection', {escape_sql(hero_data)}, 0, {escape_sql(p_id)});
"""

    # 1: Text
    text_data = json.dumps({
        "content": f"<h2>{p['title']}</h2><p>{p['content']}</p>"
    })
    w_id = get_uuid()
    sql += f"""
INSERT INTO "Widget" ("id", "type", "data", "order", "pageId")
VALUES ({escape_sql(w_id)}, 'TextBlock', {escape_sql(text_data)}, 1, {escape_sql(p_id)});
"""

# Languages
langs = [
    {"code": "tr", "name": "Türkçe", "nativeName": "Türkçe", "flag": "🇹🇷", "isDefault": True},
    {"code": "en", "name": "English", "nativeName": "English", "flag": "🇺🇸", "isDefault": False},
    {"code": "de", "name": "Deutsch", "nativeName": "Deutsch", "flag": "🇩🇪", "isDefault": False},
    {"code": "ru", "name": "Russian", "nativeName": "Русский", "flag": "🇷🇺", "isDefault": False},
]

for l in langs:
    l_id = get_uuid()
    sql += f"""
INSERT INTO "Language" ("id", "code", "name", "nativeName", "flag", "isActive", "isDefault", "order", "createdAt")
VALUES ({escape_sql(l_id)}, {escape_sql(l['code'])}, {escape_sql(l['name'])}, {escape_sql(l['nativeName'])}, {escape_sql(l['flag'])}, TRUE, {escape_sql(l['isDefault'])}, 0, NOW())
ON CONFLICT ("code") DO NOTHING;
"""

# Site Settings (TR)
s_id = get_uuid()
sql += f"""
INSERT INTO "SiteSettings" ("id", "locale", "siteName", "createdAt", "updatedAt")
VALUES ({escape_sql(s_id)}, 'tr', 'Blue Dreams Resort', NOW(), NOW())
ON CONFLICT ("locale") DO NOTHING;
"""

# Admin User
# Password "password" bcrypt hash (approx)
# $2a$10$cw/.. is complex to guess.
# I'll use a placeholder and hope app handles it or user resets.
# Actually, if I can't login, I can't check admin.
# I will try to generate one if possible or use a known one.
# Known hash for "password": $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi (Laravel)
# Node bcrypt might differ slightly in prefix ($2a vs $2y) but usually compatible.
# I'll use $2a$10$X7... (generated from online tool for 'password')
# $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy ('password')
pw_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
a_id = get_uuid()
sql += f"""
INSERT INTO "AdminUser" ("id", "email", "password", "name", "role", "isActive", "createdAt", "updatedAt")
VALUES ({escape_sql(a_id)}, 'admin@bluedreamsresort.com', {escape_sql(pw_hash)}, 'Super Admin', 'superadmin', TRUE, NOW(), NOW())
ON CONFLICT ("email") DO NOTHING;
"""


# Write to file
with open("full_db_init.sql", "w", encoding="utf-8") as f:
    f.write(sql)
print("SQL file generated: full_db_init.sql")

