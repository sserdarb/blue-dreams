// ─── Widget Catalog ─────────────────────────────────────────────
// 250 Hotel PMS Widget Definitions
// 100 Chart + 100 Data + 50 Graph widgets across 10 categories
// Existing 15 widgets remain active; new ones start hidden

export type WidgetSize = '1x1' | '2x1' | '3x1'
export type WidgetType = 'chart' | 'data' | 'graph'
export type WidgetGroup = 'finance' | 'marketing' | 'operation' | 'management'
export type WidgetCategory =
    | 'revenue' | 'occupancy' | 'guest' | 'reservation'
    | 'operations' | 'fnb' | 'marketing' | 'staff'
    | 'yield' | 'financial'

export interface WidgetDefinition {
    id: string
    titleKey: string
    title: string
    group: WidgetGroup
    category: WidgetCategory
    type: WidgetType
    defaultSize: WidgetSize
    defaultVisible: boolean
}

// Map categories → groups for tab filtering
const CG: Record<WidgetCategory, WidgetGroup> = {
    revenue: 'finance', occupancy: 'operation', guest: 'marketing',
    reservation: 'management', operations: 'operation', fnb: 'operation',
    marketing: 'marketing', staff: 'management', yield: 'management', financial: 'finance',
}

function w(id: string, title: string, cat: WidgetCategory, type: WidgetType, size: WidgetSize = '1x1', visible = false, titleKey?: string): WidgetDefinition {
    return { id, titleKey: titleKey || id, title, group: CG[cat], category: cat, type, defaultSize: size, defaultVisible: visible }
}

export const ALL_WIDGETS: WidgetDefinition[] = [
    // ═══════════════════════════════════════════════════════════════
    // EXISTING 15 ACTIVE WIDGETS (visible by default)
    // ═══════════════════════════════════════════════════════════════
    w('kpis', 'Toplam Gelir', 'revenue', 'data', '3x1', true, 'totalRevenue'),
    w('monthly', 'Aylık Gelir', 'revenue', 'chart', '2x1', true, 'monthlyRevenue'),
    w('channels', 'Kanal Dağılımı', 'marketing', 'chart', '1x1', true, 'channelDistribution'),
    w('roomTypes', 'Oda Tipi Analizi', 'occupancy', 'chart', '1x1', true, 'roomTypeAnalysis'),
    w('agencies', 'En İyi Acentalar', 'marketing', 'data', '2x1', true, 'topAgencies'),
    w('occupancy', 'Doluluk Oranı', 'occupancy', 'chart', '2x1', true, 'occupancyRate'),
    w('adr', 'ADR', 'revenue', 'data', '1x1', true, 'adr'),
    w('nationality', 'Misafir Milliyeti', 'guest', 'chart', '1x1', true, 'guestNationality'),
    w('velocity', 'Rezervasyon Hızı', 'reservation', 'chart', '2x1', true, 'bookingVelocity'),
    w('lengthOfStay', 'Ort. Konaklama', 'reservation', 'data', '1x1', true, 'avgNights'),
    w('revpar', 'RevPAR', 'revenue', 'data', '1x1', true, 'revpar'),
    w('budget', 'Bütçe Analizi', 'financial', 'chart', '2x1', true, 'budgetAnalysis'),
    w('callCenter', 'Call Center Performansı', 'marketing', 'data', '2x1', true, 'callCenterPerf'),
    w('forecast', 'Gelecek Dönem Tahmini', 'yield', 'chart', '2x1', true, 'forecast'),
    w('operator', 'Operatör Performansı', 'operations', 'data', '1x1', true, 'operatorPerf'),

    // ═══════════════════════════════════════════════════════════════
    // REVENUE & FINANCE (Gelir & Finans)  — 38 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (15)
    w('rev-daily-chart', 'Günlük Gelir Grafiği', 'revenue', 'chart', '2x1'),
    w('rev-weekly-chart', 'Haftalık Gelir Trendi', 'revenue', 'chart', '2x1'),
    w('rev-yoy-chart', 'Yıllık Karşılaştırma', 'revenue', 'chart', '2x1'),
    w('rev-roomtype-chart', 'Oda Tipine Göre Gelir', 'revenue', 'chart', '1x1'),
    w('rev-channel-chart', 'Kanala Göre Gelir', 'revenue', 'chart', '1x1'),
    w('rev-nationality-chart', 'Milliyete Göre Gelir', 'revenue', 'chart', '1x1'),
    w('rev-segment-chart', 'Segmente Göre Gelir', 'revenue', 'chart', '1x1'),
    w('rev-mealplan-chart', 'Pansiyon Tipine Göre Gelir', 'revenue', 'chart', '1x1'),
    w('rev-pace-chart', 'Gelir Hızı (Pace)', 'revenue', 'chart', '2x1'),
    w('rev-forecast-chart', 'Gelir Tahmini', 'revenue', 'chart', '2x1'),
    w('rev-cumulative-chart', 'Kümülatif Gelir', 'revenue', 'chart', '2x1'),
    w('rev-hourly-chart', 'Saatlik Gelir Dağılımı', 'revenue', 'chart', '1x1'),
    w('rev-tax-chart', 'KDV & Vergi Dağılımı', 'revenue', 'chart', '1x1'),
    w('rev-commission-chart', 'Komisyon Analizi', 'revenue', 'chart', '1x1'),
    w('rev-refund-chart', 'İade & İptal Gelir Etkisi', 'revenue', 'chart', '1x1'),
    // Data (15)
    w('rev-daily-kpi', 'Günlük Gelir KPI', 'revenue', 'data', '1x1'),
    w('rev-weekly-kpi', 'Haftalık Gelir Özeti', 'revenue', 'data', '1x1'),
    w('rev-monthly-kpi', 'Aylık Gelir Özeti', 'revenue', 'data', '2x1'),
    w('rev-quarterly-kpi', 'Çeyreklik Gelir Analizi', 'revenue', 'data', '2x1'),
    w('rev-upsell', 'Upsell Gelirleri', 'revenue', 'data', '1x1'),
    w('rev-ancillary', 'Ek Hizmet Gelirleri', 'revenue', 'data', '1x1'),
    w('rev-late-checkout', 'Geç Çıkış Geliri', 'revenue', 'data', '1x1'),
    w('rev-early-checkin', 'Erken Giriş Geliri', 'revenue', 'data', '1x1'),
    w('rev-minibar', 'Minibar Gelirleri', 'revenue', 'data', '1x1'),
    w('rev-spa', 'Spa & Wellness Gelirleri', 'revenue', 'data', '1x1'),
    w('rev-laundry', 'Çamaşırhane Gelirleri', 'revenue', 'data', '1x1'),
    w('rev-parking', 'Otopark Gelirleri', 'revenue', 'data', '1x1'),
    w('rev-transfer', 'Transfer Gelirleri', 'revenue', 'data', '1x1'),
    w('rev-meeting-room', 'Toplantı Salonu Gelirleri', 'revenue', 'data', '1x1'),
    w('rev-deposit', 'Depozito Durumu', 'revenue', 'data', '2x1'),
    // Graphs (8)
    w('rev-heatmap', 'Gelir Isı Haritası', 'revenue', 'graph', '2x1'),
    w('rev-treemap', 'Gelir Ağaç Haritası', 'revenue', 'graph', '2x1'),
    w('rev-waterfall', 'Gelir Şelale Grafiği', 'revenue', 'graph', '2x1'),
    w('rev-scatter', 'Fiyat/Doluluk Scatter', 'revenue', 'graph', '2x1'),
    w('rev-gauge', 'Bütçe Gerçekleşme Göstergesi', 'revenue', 'graph', '1x1'),
    w('rev-sparklines', 'Gelir Mini Trendler', 'revenue', 'graph', '3x1'),
    w('rev-funnel', 'Gelir Hunisi', 'revenue', 'graph', '1x1'),
    w('rev-comparison-radar', 'Gelir Karşılaştırma Radar', 'revenue', 'graph', '1x1'),

    // ═══════════════════════════════════════════════════════════════
    // OCCUPANCY & ROOMS (Doluluk & Oda)  — 29 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (12)
    w('occ-daily-chart', 'Günlük Doluluk Grafiği', 'occupancy', 'chart', '2x1'),
    w('occ-monthly-chart', 'Aylık Doluluk Trendi', 'occupancy', 'chart', '2x1'),
    w('occ-weekday-chart', 'Gün Bazlı Doluluk', 'occupancy', 'chart', '1x1'),
    w('occ-roomtype-chart', 'Oda Tipine Göre Doluluk', 'occupancy', 'chart', '1x1'),
    w('occ-floor-chart', 'Kat Bazlı Doluluk', 'occupancy', 'chart', '1x1'),
    w('occ-forecast-chart', '14 Gün Doluluk Tahmini', 'occupancy', 'chart', '2x1'),
    w('occ-yoy-chart', 'Doluluk YoY Karşılaştırma', 'occupancy', 'chart', '2x1'),
    w('occ-ooo-chart', 'Out of Order Oda Trendi', 'occupancy', 'chart', '1x1'),
    w('occ-upgrade-chart', 'Oda Upgrade Analizi', 'occupancy', 'chart', '1x1'),
    w('occ-status-chart', 'Oda Durumu Dağılımı', 'occupancy', 'chart', '1x1'),
    w('occ-category-mix', 'Oda Kategori Mix', 'occupancy', 'chart', '1x1'),
    w('occ-rate-analysis', 'Oda Fiyat Analizi', 'occupancy', 'chart', '2x1'),
    // Data (12)
    w('occ-today-status', 'Bugünkü Oda Durumu', 'occupancy', 'data', '2x1'),
    w('occ-arrivals-today', 'Bugünkü Girişler', 'occupancy', 'data', '1x1'),
    w('occ-departures-today', 'Bugünkü Çıkışlar', 'occupancy', 'data', '1x1'),
    w('occ-stayovers', 'Stayover Misafirler', 'occupancy', 'data', '1x1'),
    w('occ-no-shows', 'No-Show Raporu', 'occupancy', 'data', '1x1'),
    w('occ-walkins', 'Walk-in Kayıtları', 'occupancy', 'data', '1x1'),
    w('occ-vip-rooms', 'VIP Oda Ataması', 'occupancy', 'data', '2x1'),
    w('occ-connecting', 'Connecting Oda Kullanımı', 'occupancy', 'data', '1x1'),
    w('occ-housekeeping', 'Housekeeping Durumu', 'occupancy', 'data', '2x1'),
    w('occ-maintenance', 'Bakım/Arıza Logu', 'occupancy', 'data', '2x1'),
    w('occ-inhouse-list', 'In-House Misafir Listesi', 'occupancy', 'data', '3x1'),
    w('occ-early-late', 'Erken Giriş / Geç Çıkış', 'occupancy', 'data', '1x1'),
    // Graphs (5)
    w('occ-heatmap', 'Doluluk Isı Haritası', 'occupancy', 'graph', '2x1'),
    w('occ-floor-map', 'Kat Haritası Görünümü', 'occupancy', 'graph', '3x1'),
    w('occ-bubble', 'Doluluk Balon Grafiği', 'occupancy', 'graph', '2x1'),
    w('occ-gauge', 'Doluluk Göstergesi', 'occupancy', 'graph', '1x1'),
    w('occ-timeline', 'Oda Doluluk Timeline', 'occupancy', 'graph', '3x1'),

    // ═══════════════════════════════════════════════════════════════
    // GUEST & CRM (Misafir & CRM)  — 27 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (10)
    w('guest-nationality-pie', 'Milliyet Dağılımı Pasta', 'guest', 'chart', '1x1'),
    w('guest-repeat-chart', 'Tekrar Misafir Trendi', 'guest', 'chart', '2x1'),
    w('guest-satisfaction-chart', 'Memnuniyet Trendi', 'guest', 'chart', '2x1'),
    w('guest-demographics-chart', 'Yaş & Cinsiyet Dağılımı', 'guest', 'chart', '1x1'),
    w('guest-spending-chart', 'Misafir Harcama Kalıbı', 'guest', 'chart', '2x1'),
    w('guest-los-chart', 'Konaklama Süresi Dağılımı', 'guest', 'chart', '1x1'),
    w('guest-source-chart', 'Misafir Kaynak Analizi', 'guest', 'chart', '1x1'),
    w('guest-loyalty-chart', 'Sadakat Programı İstatistik', 'guest', 'chart', '1x1'),
    w('guest-complaint-chart', 'Şikayet Kategori Dağılımı', 'guest', 'chart', '1x1'),
    w('guest-review-chart', 'Online Yorum Trendi', 'guest', 'chart', '2x1'),
    // Data (12)
    w('guest-vip-list', 'VIP Misafir Listesi', 'guest', 'data', '2x1'),
    w('guest-repeat-list', 'Tekrar Gelen Misafirler', 'guest', 'data', '2x1'),
    w('guest-birthday', 'Doğum Günü Takvimi', 'guest', 'data', '1x1'),
    w('guest-anniversary', 'Yıl Dönümü Raporu', 'guest', 'data', '1x1'),
    w('guest-special-req', 'Özel İstek Analizi', 'guest', 'data', '2x1'),
    w('guest-allergy', 'Alerji & Diyet Raporu', 'guest', 'data', '1x1'),
    w('guest-blacklist', 'Kara Liste', 'guest', 'data', '1x1'),
    w('guest-feedback-summary', 'Geri Bildirim Özeti', 'guest', 'data', '2x1'),
    w('guest-top-spenders', 'En Çok Harcayan Misafirler', 'guest', 'data', '2x1'),
    w('guest-country-revenue', 'Ülke Bazlı Gelir', 'guest', 'data', '2x1'),
    w('guest-preferences', 'Misafir Tercihleri', 'guest', 'data', '1x1'),
    w('guest-communication', 'İletişim Logları', 'guest', 'data', '2x1'),
    // Graphs (5)
    w('guest-world-map', 'Dünya Haritası Dağılımı', 'guest', 'graph', '3x1'),
    w('guest-satisfaction-radar', 'Memnuniyet Radar', 'guest', 'graph', '1x1'),
    w('guest-journey-sankey', 'Misafir Yolculuk Sankey', 'guest', 'graph', '2x1'),
    w('guest-segmentation-bubble', 'Segment Balon Grafiği', 'guest', 'graph', '2x1'),
    w('guest-retention-funnel', 'Misafir Tutma Hunisi', 'guest', 'graph', '1x1'),

    // ═══════════════════════════════════════════════════════════════
    // RESERVATION & SALES (Rezervasyon & Satış)  — 30 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (12)
    w('res-pace-chart', 'Booking Pace Raporu', 'reservation', 'chart', '2x1'),
    w('res-leadtime-chart', 'Lead Time Analizi', 'reservation', 'chart', '1x1'),
    w('res-cancel-chart', 'İptal Oranı Trendi', 'reservation', 'chart', '2x1'),
    w('res-noshow-chart', 'No-Show Trendi', 'reservation', 'chart', '1x1'),
    w('res-channel-trend', 'Kanal Bazlı Rez. Trendi', 'reservation', 'chart', '2x1'),
    w('res-daily-pickup', 'Günlük Pick-Up', 'reservation', 'chart', '2x1'),
    w('res-rate-code', 'Rate Code Performansı', 'reservation', 'chart', '1x1'),
    w('res-promo-chart', 'Promosyon Kodu Analizi', 'reservation', 'chart', '1x1'),
    w('res-group-chart', 'Grup Rez. Özeti', 'reservation', 'chart', '2x1'),
    w('res-overbooking', 'Overbooking Analizi', 'reservation', 'chart', '1x1'),
    w('res-modification', 'Rez. Değişiklik Trendi', 'reservation', 'chart', '1x1'),
    w('res-board-mix', 'Pansiyon Tipi Mix', 'reservation', 'chart', '1x1'),
    // Data (12)
    w('res-today-arrivals', 'Bugünkü Girişler Detay', 'reservation', 'data', '3x1'),
    w('res-today-departures', 'Bugünkü Çıkışlar Detay', 'reservation', 'data', '3x1'),
    w('res-pending', 'Bekleyen Rezervasyonlar', 'reservation', 'data', '2x1'),
    w('res-confirmed', 'Onaylı Rezervasyonlar', 'reservation', 'data', '2x1'),
    w('res-cancelled-list', 'İptal Edilen Rez. Listesi', 'reservation', 'data', '2x1'),
    w('res-waitlist', 'Bekleme Listesi', 'reservation', 'data', '1x1'),
    w('res-allotment', 'Allotment Kullanımı', 'reservation', 'data', '2x1'),
    w('res-agency-prod', 'Acenta Üretim Raporu', 'reservation', 'data', '2x1'),
    w('res-source-mix', 'Kaynak Mix Tablosu', 'reservation', 'data', '1x1'),
    w('res-avg-rate', 'Ortalama Fiyat Raporu', 'reservation', 'data', '1x1'),
    w('res-revenue-by-stay', 'Konaklama Bazlı Gelir', 'reservation', 'data', '2x1'),
    w('res-night-audit', 'Night Audit Özeti', 'reservation', 'data', '2x1'),
    // Graphs (6)
    w('res-pace-waterfall', 'Booking Pace Şelale', 'reservation', 'graph', '2x1'),
    w('res-channel-sankey', 'Kanal Akış Sankey', 'reservation', 'graph', '2x1'),
    w('res-heatmap', 'Rez. Yoğunluk Haritası', 'reservation', 'graph', '2x1'),
    w('res-funnel', 'Rezervasyon Hunisi', 'reservation', 'graph', '1x1'),
    w('res-calendar', 'Takvim Görünümü', 'reservation', 'graph', '3x1'),
    w('res-comparison-bar', 'Sezon Karşılaştırma Bar', 'reservation', 'graph', '2x1'),

    // ═══════════════════════════════════════════════════════════════
    // OPERATIONS (Operasyon)  — 27 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (10)
    w('ops-checkin-volume', 'Check-in Hacmi', 'operations', 'chart', '2x1'),
    w('ops-checkout-volume', 'Check-out Hacmi', 'operations', 'chart', '2x1'),
    w('ops-housekeeping-chart', 'HK Temizlik Trendi', 'operations', 'chart', '1x1'),
    w('ops-maintenance-chart', 'Arıza Kategorileri', 'operations', 'chart', '1x1'),
    w('ops-request-chart', 'Misafir İstek Trendi', 'operations', 'chart', '2x1'),
    w('ops-response-time', 'Yanıt Süresi Analizi', 'operations', 'chart', '1x1'),
    w('ops-energy-chart', 'Enerji Tüketimi', 'operations', 'chart', '2x1'),
    w('ops-water-chart', 'Su Tüketimi', 'operations', 'chart', '1x1'),
    w('ops-complaint-trend', 'Şikayet Trendi', 'operations', 'chart', '1x1'),
    w('ops-task-completion', 'Görev Tamamlama Oranı', 'operations', 'chart', '1x1'),
    // Data (12)
    w('ops-mod-report', 'MOD Raporu', 'operations', 'data', '3x1'),
    w('ops-night-audit-data', 'Night Audit Detay', 'operations', 'data', '3x1'),
    w('ops-lost-found', 'Kayıp & Bulunmuş', 'operations', 'data', '1x1'),
    w('ops-security-log', 'Güvenlik Logu', 'operations', 'data', '2x1'),
    w('ops-incident', 'Olay Raporu', 'operations', 'data', '2x1'),
    w('ops-pool-status', 'Havuz & Plaj Durumu', 'operations', 'data', '1x1'),
    w('ops-parking', 'Otopark Doluluk', 'operations', 'data', '1x1'),
    w('ops-laundry-stats', 'Çamaşırhane İstatistik', 'operations', 'data', '1x1'),
    w('ops-minibar-track', 'Minibar Takibi', 'operations', 'data', '2x1'),
    w('ops-shuttle-schedule', 'Transfer Programı', 'operations', 'data', '2x1'),
    w('ops-amenity-usage', 'Amenity Kullanımı', 'operations', 'data', '1x1'),
    w('ops-key-card', 'Kart Basımı İstatistik', 'operations', 'data', '1x1'),
    // Graphs (5)
    w('ops-floor-heatmap', 'Kat Bazlı Isı Haritası', 'operations', 'graph', '3x1'),
    w('ops-timeline', 'Operasyon Timeline', 'operations', 'graph', '3x1'),
    w('ops-response-gauge', 'Yanıt Süresi Göstergesi', 'operations', 'graph', '1x1'),
    w('ops-energy-gauge', 'Enerji Tüketim Göstergesi', 'operations', 'graph', '1x1'),
    w('ops-task-kanban', 'Görev Kanban Görünümü', 'operations', 'graph', '3x1'),

    // ═══════════════════════════════════════════════════════════════
    // F&B (Yiyecek & İçecek)  — 25 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (10)
    w('fnb-restaurant-rev', 'Restoran Geliri', 'fnb', 'chart', '2x1'),
    w('fnb-bar-rev', 'Bar Geliri', 'fnb', 'chart', '1x1'),
    w('fnb-roomservice-chart', 'Oda Servisi Trendi', 'fnb', 'chart', '1x1'),
    w('fnb-breakfast-count', 'Kahvaltı Sayacı', 'fnb', 'chart', '1x1'),
    w('fnb-allinc-consumption', 'AI Tüketim Analizi', 'fnb', 'chart', '2x1'),
    w('fnb-menu-popularity', 'Menü Popülerlik', 'fnb', 'chart', '2x1'),
    w('fnb-food-cost', 'Gıda Maliyet Oranı', 'fnb', 'chart', '1x1'),
    w('fnb-beverage-cost', 'İçecek Maliyet Oranı', 'fnb', 'chart', '1x1'),
    w('fnb-cover-count', 'Cover Sayısı Trendi', 'fnb', 'chart', '2x1'),
    w('fnb-avg-check', 'Ortalama Hesap', 'fnb', 'chart', '1x1'),
    // Data (10)
    w('fnb-daily-summary', 'F&B Günlük Özet', 'fnb', 'data', '2x1'),
    w('fnb-waste-report', 'İsraf Raporu', 'fnb', 'data', '1x1'),
    w('fnb-stock-alert', 'Stok Uyarıları', 'fnb', 'data', '2x1'),
    w('fnb-recipe-cost', 'Reçete Maliyeti', 'fnb', 'data', '1x1'),
    w('fnb-supplier-perf', 'Tedarikçi Performansı', 'fnb', 'data', '2x1'),
    w('fnb-special-diet', 'Özel Diyet Raporu', 'fnb', 'data', '1x1'),
    w('fnb-banquet-rev', 'Ziyafet Gelirleri', 'fnb', 'data', '1x1'),
    w('fnb-outlet-compare', 'Outlet Karşılaştırma', 'fnb', 'data', '2x1'),
    w('fnb-happy-hour', 'Happy Hour Performansı', 'fnb', 'data', '1x1'),
    w('fnb-inventory', 'F&B Envanter Durumu', 'fnb', 'data', '2x1'),
    // Graphs (5)
    w('fnb-treemap', 'F&B Gelir Ağaç Haritası', 'fnb', 'graph', '2x1'),
    w('fnb-cost-gauge', 'Maliyet Oranı Göstergesi', 'fnb', 'graph', '1x1'),
    w('fnb-popularity-bubble', 'Menü Popülerlik Balon', 'fnb', 'graph', '2x1'),
    w('fnb-outlet-radar', 'Outlet Performans Radar', 'fnb', 'graph', '1x1'),
    w('fnb-flow-sankey', 'F&B Akış Sankey', 'fnb', 'graph', '2x1'),

    // ═══════════════════════════════════════════════════════════════
    // MARKETING (Pazarlama)  — 25 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (10)
    w('mkt-direct-vs-ota', 'Direkt vs OTA', 'marketing', 'chart', '2x1'),
    w('mkt-website-conversion', 'Website Dönüşüm Oranı', 'marketing', 'chart', '1x1'),
    w('mkt-email-campaign', 'E-posta Kampanya Perf.', 'marketing', 'chart', '2x1'),
    w('mkt-social-engagement', 'Sosyal Medya Etkileşim', 'marketing', 'chart', '2x1'),
    w('mkt-seo-ranking', 'SEO Sıralama Trendi', 'marketing', 'chart', '1x1'),
    w('mkt-ppc-roi', 'PPC Reklam ROI', 'marketing', 'chart', '1x1'),
    w('mkt-review-scores', 'Yorum Puanları Trendi', 'marketing', 'chart', '2x1'),
    w('mkt-competitor-rate', 'Rakip Fiyat Analizi', 'marketing', 'chart', '2x1'),
    w('mkt-market-share', 'Pazar Payı', 'marketing', 'chart', '1x1'),
    w('mkt-brand-awareness', 'Marka Bilinirliği', 'marketing', 'chart', '1x1'),
    // Data (10)
    w('mkt-campaign-summary', 'Kampanya Özeti', 'marketing', 'data', '2x1'),
    w('mkt-promo-redemption', 'Promosyon Kullanım', 'marketing', 'data', '1x1'),
    w('mkt-referral', 'Referans Kaynak Analizi', 'marketing', 'data', '2x1'),
    w('mkt-review-list', 'Son Yorumlar Listesi', 'marketing', 'data', '2x1'),
    w('mkt-meta-perf', 'Meta Search Performansı', 'marketing', 'data', '1x1'),
    w('mkt-ota-ranking', 'OTA Sıralama Durumu', 'marketing', 'data', '1x1'),
    w('mkt-loyalty-stats', 'Sadakat Programı KPI', 'marketing', 'data', '1x1'),
    w('mkt-newsletter', 'Newsletter İstatistik', 'marketing', 'data', '1x1'),
    w('mkt-influencer', 'Influencer İşbirliği', 'marketing', 'data', '2x1'),
    w('mkt-content-perf', 'İçerik Performansı', 'marketing', 'data', '2x1'),
    // Graphs (5)
    w('mkt-channel-funnel', 'Kanal Hunisi', 'marketing', 'graph', '1x1'),
    w('mkt-attribution', 'Atıf Modeli Sankey', 'marketing', 'graph', '2x1'),
    w('mkt-competitor-radar', 'Rakip Karşılaştırma Radar', 'marketing', 'graph', '1x1'),
    w('mkt-roi-scatter', 'Kampanya ROI Scatter', 'marketing', 'graph', '2x1'),
    w('mkt-journey-flow', 'Misafir Yolculuk Akışı', 'marketing', 'graph', '2x1'),

    // ═══════════════════════════════════════════════════════════════
    // STAFF & HR (Personel & İK)  — 20 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (8)
    w('staff-schedule-chart', 'Vardiya Çizelgesi', 'staff', 'chart', '2x1'),
    w('staff-overtime-chart', 'Fazla Mesai Trendi', 'staff', 'chart', '1x1'),
    w('staff-labor-cost', 'İşçilik Maliyet Trendi', 'staff', 'chart', '2x1'),
    w('staff-productivity', 'Verimlilik Analizi', 'staff', 'chart', '1x1'),
    w('staff-turnover', 'Personel Devir Oranı', 'staff', 'chart', '1x1'),
    w('staff-training', 'Eğitim Tamamlama', 'staff', 'chart', '1x1'),
    w('staff-attendance', 'Devam Durumu', 'staff', 'chart', '2x1'),
    w('staff-department', 'Departman Dağılımı', 'staff', 'chart', '1x1'),
    // Data (8)
    w('staff-roster', 'Günlük Kadro Listesi', 'staff', 'data', '3x1'),
    w('staff-leave', 'İzin Takibi', 'staff', 'data', '2x1'),
    w('staff-performance', 'Performans Değerlendirme', 'staff', 'data', '2x1'),
    w('staff-certification', 'Sertifika Durumu', 'staff', 'data', '1x1'),
    w('staff-onboarding', 'İşe Alım Süreci', 'staff', 'data', '1x1'),
    w('staff-payroll-summary', 'Maaş Bordrosu Özeti', 'staff', 'data', '2x1'),
    w('staff-tip-report', 'Bahşiş Raporu', 'staff', 'data', '1x1'),
    w('staff-uniform', 'Üniforma Takibi', 'staff', 'data', '1x1'),
    // Graphs (4)
    w('staff-org-chart', 'Organizasyon Şeması', 'staff', 'graph', '3x1'),
    w('staff-workload-heatmap', 'İş Yükü Isı Haritası', 'staff', 'graph', '2x1'),
    w('staff-satisfaction-gauge', 'Personel Memnuniyet', 'staff', 'graph', '1x1'),
    w('staff-cost-pie', 'İşçilik Maliyet Dağılımı', 'staff', 'graph', '1x1'),

    // ═══════════════════════════════════════════════════════════════
    // YIELD MANAGEMENT  — 19 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (8)
    w('yield-rate-strategy', 'Fiyat Strateji Performansı', 'yield', 'chart', '2x1'),
    w('yield-demand-forecast', 'Talep Tahmini', 'yield', 'chart', '2x1'),
    w('yield-compset', 'CompSet Analizi', 'yield', 'chart', '2x1'),
    w('yield-pickup', 'Pick-Up Raporu', 'yield', 'chart', '2x1'),
    w('yield-displacement', 'Displacement Analizi', 'yield', 'chart', '1x1'),
    w('yield-los-pattern', 'LOS Kalıbı', 'yield', 'chart', '1x1'),
    w('yield-dow-analysis', 'Gün Bazlı Analiz', 'yield', 'chart', '1x1'),
    w('yield-seasonal', 'Sezonsal Trend', 'yield', 'chart', '2x1'),
    // Data (7)
    w('yield-rate-shop', 'Rate Shopping Tablosu', 'yield', 'data', '3x1'),
    w('yield-restrictions', 'Kısıtlama Raporu', 'yield', 'data', '2x1'),
    w('yield-overrides', 'Manuel Fiyat Override', 'yield', 'data', '2x1'),
    w('yield-segment-mix', 'Segment Mix Optimal', 'yield', 'data', '1x1'),
    w('yield-channel-margin', 'Kanal Kar Marjı', 'yield', 'data', '2x1'),
    w('yield-dynamic-pricing', 'Dinamik Fiyatlama Log', 'yield', 'data', '2x1'),
    w('yield-benchmark', 'Benchmark KPI', 'yield', 'data', '1x1'),
    // Graphs (4)
    w('yield-price-elasticity', 'Fiyat Esneklik Grafiği', 'yield', 'graph', '2x1'),
    w('yield-demand-heatmap', 'Talep Isı Haritası', 'yield', 'graph', '2x1'),
    w('yield-optimal-rate', 'Optimal Fiyat Göstergesi', 'yield', 'graph', '1x1'),
    w('yield-revenue-gauge', 'Gelir Potansiyel Gösterge', 'yield', 'graph', '1x1'),

    // ═══════════════════════════════════════════════════════════════
    // FINANCIAL / COST (Maliyet & Muhasebe)  — 10 widgets
    // ═══════════════════════════════════════════════════════════════
    // Charts (5)
    w('fin-pnl-chart', 'Kâr-Zarar Trendi', 'financial', 'chart', '2x1'),
    w('fin-cashflow-chart', 'Nakit Akış Grafiği', 'financial', 'chart', '2x1'),
    w('fin-ar-aging', 'Alacak Yaşlandırma', 'financial', 'chart', '2x1'),
    w('fin-ap-aging', 'Borç Yaşlandırma', 'financial', 'chart', '2x1'),
    w('fin-expense-chart', 'Gider Kategori Trendi', 'financial', 'chart', '1x1'),
    // Data (2)
    w('fin-payment-method', 'Ödeme Yöntemi Analizi', 'financial', 'data', '1x1'),
    w('fin-tax-summary', 'Vergi Özet Raporu', 'financial', 'data', '2x1'),
    // Graphs (3)
    w('fin-budget-gauge', 'Bütçe Gerçekleşme Gauge', 'financial', 'graph', '1x1'),
    w('fin-cost-breakdown', 'Maliyet Kırılım Treemap', 'financial', 'graph', '2x1'),
    w('fin-ratio-radar', 'Finansal Oran Radar', 'financial', 'graph', '1x1'),
]

// Category labels (Turkish)
export const CATEGORY_LABELS: Record<WidgetCategory, string> = {
    revenue: 'Gelir & Finans',
    occupancy: 'Doluluk & Oda',
    guest: 'Misafir & CRM',
    reservation: 'Rezervasyon & Satış',
    operations: 'Operasyon',
    fnb: 'Yiyecek & İçecek',
    marketing: 'Pazarlama',
    staff: 'Personel & İK',
    yield: 'Yield Yönetim',
    financial: 'Maliyet & Muhasebe',
}

// Widget type labels
export const TYPE_LABELS: Record<WidgetType, string> = {
    chart: 'Grafik',
    data: 'Veri Tablosu',
    graph: 'Gelişmiş Grafik',
}

// Title fallbacks for all widgets
export const TITLE_FALLBACKS: Record<string, string> = Object.fromEntries(
    ALL_WIDGETS.map(w => [w.titleKey, w.title])
)
