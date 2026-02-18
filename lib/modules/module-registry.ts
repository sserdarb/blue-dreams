// ─── Module Registry ───
// Central registry of all admin modules with data source dependencies

export type DataSource = 'elektra' | 'purchasing_erp' | 'local' | 'none'

export interface ModuleDefinition {
    id: string                  // matches sidebar nav-id
    label: string               // Turkish display name
    section: string             // sidebar section id
    href: string                // admin page route
    dataSource: DataSource      // where the module gets data
    defaultEnabled: boolean     // default active state
    description: string         // short description
    offlineReason?: string      // reason if data source unavailable
    requiredEnv?: string[]      // env vars needed
}

export const MODULE_REGISTRY: ModuleDefinition[] = [
    // ── Raporlar & Analiz ──
    {
        id: 'nav-dashboard', label: 'Dashboard', section: 'section-raporlar',
        href: '', dataSource: 'elektra', defaultEnabled: true,
        description: 'Doluluk oranı, günlük rezervasyon, aylık gelir, ADR ve son rezervasyonlar',
        offlineReason: 'Elektra PMS API bağlantısı kurulamadı — canlı doluluk, gelir ve rezervasyon verileri alınamıyor',
    },
    {
        id: 'nav-reports', label: 'Raporlar', section: 'section-raporlar',
        href: '/statistics', dataSource: 'elektra', defaultEnabled: true,
        description: 'Sezon ve karşılaştırmalı rezervasyon raporları, 250 widget desteği',
        offlineReason: 'Elektra PMS API bağlantısı kurulamadı — rezervasyon ve gelir verileri alınamıyor',
    },
    {
        id: 'nav-management', label: 'Yönetim', section: 'section-raporlar',
        href: '/reports', dataSource: 'elektra', defaultEnabled: true,
        description: 'Yönetim raporları: gelir, kanal, bütçe analizi ve satın alma raporları',
        offlineReason: 'Elektra PMS ve/veya ERP API bağlantısı kurulamadı',
    },
    {
        id: 'nav-bigdata', label: 'Big Data', section: 'section-raporlar',
        href: '/bigdata', dataSource: 'elektra', defaultEnabled: true,
        description: 'Büyük veri analitiği: sezonluk trendler, doluluk tahminleri, kanal performansı',
        offlineReason: 'Elektra PMS API bağlantısı kurulamadı — büyük veri analizi için geçmiş ve canlı veriler gerekli',
    },

    // ── Satış & Pazarlama ──
    {
        id: 'nav-reservations', label: 'Rezervasyonlar', section: 'section-satis',
        href: '/reservations', dataSource: 'elektra', defaultEnabled: true,
        description: 'Rezervasyon listesi, yıllık karşılaştırma, kanal ve acente bazlı analiz',
        offlineReason: 'Elektra PMS API bağlantısı kurulamadı — rezervasyon verileri alınamıyor',
    },
    {
        id: 'nav-extras', label: 'Ekstra Satışlar', section: 'section-satis',
        href: '/extras', dataSource: 'elektra', defaultEnabled: true,
        description: 'Spa, minibar ve restoran ekstra gelir raporları',
        offlineReason: 'Elektra PMS API bağlantısı kurulamadı — departman gelir verileri alınamıyor',
    },
    {
        id: 'nav-crm', label: 'CRM (Misafir İlişkileri)', section: 'section-satis',
        href: '/crm', dataSource: 'elektra', defaultEnabled: true,
        description: 'Misafir yorumları, memnuniyet analizi, yanıt metrikleri',
        offlineReason: 'Elektra PMS API bağlantısı kurulamadı — misafir yorum ve memnuniyet verileri alınamıyor',
    },
    {
        id: 'nav-marketing', label: 'Pazarlama', section: 'section-satis',
        href: '/marketing', dataSource: 'local', defaultEnabled: true,
        description: 'Pazarlama kampanyaları ve reklam yönetimi',
    },
    {
        id: 'nav-social', label: 'Sosyal Medya', section: 'section-satis',
        href: '/social', dataSource: 'local', defaultEnabled: true,
        description: 'Sosyal medya hesap yönetimi ve paylaşım takvimi',
    },
    {
        id: 'nav-content-gen', label: 'İçerik Üretici', section: 'section-satis',
        href: '/social/content', dataSource: 'none', defaultEnabled: true,
        description: 'AI içerik üretici, tasarım aracı, video düzenleyici',
    },

    // ── Finans & Tedarik ──
    {
        id: 'nav-accounting', label: 'Muhasebe', section: 'section-finans',
        href: '/accounting', dataSource: 'local', defaultEnabled: true,
        description: 'Gelir-gider takibi, cari hesaplar, finansal raporlar',
    },
    {
        id: 'nav-purchasing', label: 'Satın Alma', section: 'section-finans',
        href: '/purchasing', dataSource: 'purchasing_erp', defaultEnabled: true,
        description: 'Satın alma siparişleri, stok yönetimi, tedarikçi analizi',
        offlineReason: 'Elektra ERP API (satın alma modülü) bağlantısı kurulamadı — IP kısıtlaması veya ağ hatası',
    },
    {
        id: 'nav-yield', label: 'Yield Management', section: 'section-satis',
        href: '/yield', dataSource: 'elektra', defaultEnabled: true,
        description: 'Gelir yönetimi: fiyatlandırma optimizasyonu, kanal performansı, RevPAR analizi',
        offlineReason: 'Elektra PMS cache verisi alınamadı — yield analizi için rezervasyon ve döviz verileri gerekli',
    },

    // ── İçerik ──
    {
        id: 'nav-rooms', label: 'Oda Fiyatları', section: 'section-icerik',
        href: '/rooms', dataSource: 'elektra', defaultEnabled: true,
        description: 'Oda tiplerinin canlı fiyat ve müsaitlik durumu',
        offlineReason: 'Elektra PMS API bağlantısı kurulamadı — oda müsaitlik ve fiyat verileri alınamıyor',
    },
    {
        id: 'nav-pages', label: 'Sayfalar', section: 'section-icerik',
        href: '/pages', dataSource: 'local', defaultEnabled: true,
        description: 'Web sitesi sayfa yönetimi (CMS)',
    },
    {
        id: 'nav-menu', label: 'Menü', section: 'section-icerik',
        href: '/menu', dataSource: 'local', defaultEnabled: true,
        description: 'Navigasyon menü düzenleme',
    },
    {
        id: 'nav-media', label: 'Medya', section: 'section-icerik',
        href: '/files', dataSource: 'local', defaultEnabled: true,
        description: 'Görsel ve dosya yönetimi',
    },
    {
        id: 'nav-settings', label: 'Ayarlar', section: 'section-icerik',
        href: '/settings', dataSource: 'local', defaultEnabled: true,
        description: 'Site ayarları, modül yönetimi, kullanıcı yetkileri',
    },

    // ── Otel Operasyon ──
    {
        id: 'nav-hotel-rooms', label: 'Odalar', section: 'section-operasyon',
        href: '/content/rooms', dataSource: 'local', defaultEnabled: true,
        description: 'Oda içerik yönetimi (fotoğraf, açıklama)',
    },
    {
        id: 'nav-dining', label: 'Yeme-İçme', section: 'section-operasyon',
        href: '/content/dining', dataSource: 'local', defaultEnabled: true,
        description: 'Restoran ve bar içerik yönetimi',
    },
    {
        id: 'nav-meeting', label: 'Toplantı', section: 'section-operasyon',
        href: '/content/meeting', dataSource: 'local', defaultEnabled: true,
        description: 'Toplantı salonu içerik yönetimi',
    },
    {
        id: 'nav-activities', label: 'Aktiviteler', section: 'section-operasyon',
        href: '/activities', dataSource: 'local', defaultEnabled: true,
        description: 'Otel aktiviteleri yönetimi',
    },
    {
        id: 'nav-ai-training', label: 'AI Eğitim', section: 'section-operasyon',
        href: '/ai-training', dataSource: 'local', defaultEnabled: true,
        description: 'Blue Concierge AI eğitim verileri',
    },
    {
        id: 'nav-users', label: 'Kullanıcılar', section: 'section-operasyon',
        href: '/users', dataSource: 'local', defaultEnabled: true,
        description: 'Admin kullanıcı yönetimi',
    },

    // ── Entegrasyonlar ──
    {
        id: 'nav-analytics', label: 'Analytics', section: 'section-entegrasyon',
        href: '/analytics', dataSource: 'local', defaultEnabled: true,
        description: 'Google Analytics ve performans metrikleri',
    },
    {
        id: 'nav-concierge', label: 'Blue Concierge', section: 'section-entegrasyon',
        href: '/chat', dataSource: 'local', defaultEnabled: true,
        description: 'AI concierge yönetimi ve sohbet geçmişi',
    },
    {
        id: 'nav-booking', label: 'Booking Engine', section: 'section-entegrasyon',
        href: '/integrations/booking', dataSource: 'local', defaultEnabled: true,
        description: 'Rezervasyon motoru entegrasyonu',
    },
]

// ─── Helpers ───

export function getModuleById(id: string) {
    return MODULE_REGISTRY.find(m => m.id === id)
}

export function getModulesBySection(sectionId: string) {
    return MODULE_REGISTRY.filter(m => m.section === sectionId)
}

export function getElektraModules() {
    return MODULE_REGISTRY.filter(m => m.dataSource === 'elektra')
}

export function getModulesByDataSource(source: DataSource) {
    return MODULE_REGISTRY.filter(m => m.dataSource === source)
}

export const ROLE_PRESETS: Record<string, { label: string; moduleIds: string[] }> = {
    admin: {
        label: 'Tam Yetki (Admin)',
        moduleIds: MODULE_REGISTRY.map(m => m.id),
    },
    manager: {
        label: 'Yönetici',
        moduleIds: MODULE_REGISTRY.filter(m =>
            ['section-raporlar', 'section-satis', 'section-finans'].includes(m.section)
        ).map(m => m.id),
    },
    operations: {
        label: 'Operasyon',
        moduleIds: MODULE_REGISTRY.filter(m =>
            ['section-operasyon', 'section-icerik'].includes(m.section)
        ).map(m => m.id),
    },
    marketing: {
        label: 'Pazarlama',
        moduleIds: MODULE_REGISTRY.filter(m =>
            m.section === 'section-satis' || m.id === 'nav-reports'
        ).map(m => m.id),
    },
}
