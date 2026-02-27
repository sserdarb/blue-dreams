// Admin panel translations — all UI strings for the admin panel
// Used by layout, reports, pages, etc.

export type AdminLocale = 'tr' | 'en' | 'de' | 'ru'

export function getAdminTranslations(locale: AdminLocale) {
    return translations[locale] || translations.tr
}

const translations: Record<AdminLocale, AdminTranslations> = {
    tr: {
        // Navigation sections
        navReports: 'Raporlar & Analiz',
        navSales: 'Satış & Pazarlama',
        navFinance: 'Finans & Tedarik',
        navContent: 'İçerik Yönetimi',
        navOperations: 'Otel Operasyon',
        navIntegrations: 'Entegrasyonlar',

        // Navigation items
        dashboard: 'Dashboard',
        reports: 'Raporlar',
        reservations: 'Rezervasyonlar',
        extras: 'Ekstra Satışlar',
        crm: 'CRM (Misafir İlişkileri)',
        marketing: 'Pazarlama',
        management: 'Yönetim',
        operation: 'Operasyon',
        finance: 'Finans',
        roomPrices: 'Oda Fiyatları',
        pages: 'Sayfalar',
        menu: 'Menü',
        media: 'Medya',
        localization: 'Lokalizasyon',
        settings: 'Ayarlar',
        analytics: 'Analytics',
        blueConcierge: 'Blue Concierge',
        bookingEngine: 'Booking Engine',
        rooms: 'Odalar',
        dining: 'Restoranlar',
        meeting: 'Toplantı',
        activities: 'Aktiviteler',
        sportsAndActivities: 'Spor & Aktiviteler',
        aiTraining: 'AI Eğitim',
        users: 'Kullanıcılar',
        viewSite: 'Siteyi Görüntüle',
        editingLang: 'Düzenleme:',
        bigData: 'Big Data',
        accounting: 'Muhasebe',
        purchasing: 'Satın Alma',
        yieldManagement: 'Yield Management',
        socialMedia: 'Sosyal Medya',
        contentCreator: 'İçerik Üretici',
        reservationPerformance: 'Rezervasyon Performansı',
        live: 'Canlı',
        recentReservations: 'Son Rezervasyonlar',
        viewAll: 'Tümünü Gör',
        // Task Management
        taskManagement: 'Görev Yönetimi',
        tasks: 'Görevler',
        workflows: 'İş Akışları',
        mailIntegration: 'Mail Entegrasyonu',
        createTask: 'Görev Oluştur',
        assignee: 'Atanan',
        priority: 'Öncelik',
        dueDate: 'Bitiş Tarihi',
        mailIntegrationPage: {
            title: 'Mail Entegrasyonu',
            subtitle: 'E-postaları AI ile görevlere dönüştürün',
            connected: 'Bağlı',
            disconnected: 'Bağlantı Yok',
            sync: 'Senkronize Et',
            syncing: 'Senkronize...',
            settings: 'Ayarlar',
            serverSettings: 'Mail Sunucu Ayarları',
            imapTitle: 'IMAP (Gelen)',
            smtpTitle: 'SMTP (Giden)',
            emailAddress: 'E-posta adresi',
            username: 'Kullanıcı adı',
            password: 'Şifre',
            port: 'Port',
            emptySmtpDesc: 'Boş bırakılırsa IMAP ayarları kullanılır',
            saveAndConnect: 'Kaydet & Bağlan',
            cancelConnection: 'Bağlantıyı Kaldır',
            lastSync: 'Son senkronizasyon',
            inbox: 'Gelen Kutusu',
            new: 'yeni',
            selectEmailDesc: 'AI ile görevlere dönüştürmek için sol taraftaki bir e-postaya tıklayın',
            configFirstDesc: 'Önce mail sunucu ayarlarını yapılandırın',
            sender: 'Gönderen:',
            noContent: '(İçerik yok)',
            aiAnalyze: 'AI ile Göreve Dönüştür',
            aiAnalyzing: 'AI Analiz Ediyor...',
            aiSuggestion: 'AI Görev Önerisi',
            createAsTask: 'Görev Olarak Oluştur',
            creating: 'Oluşturuluyor...'
        },
        roomPricesPage: {
            title: 'Oda Fiyatları & Müsaitlik',
            subtitle: 'Elektra PMS — Hotelweb & Call Center kanalları',
            live: 'Canlı',
            pdfExporting: 'PDF...',
            pdf: 'PDF',
            bookingEngine: 'Booking Engine',
            today: 'Bugün',
            days7: '7 Gün',
            days30: '30 Gün',
            days60: '60 Gün',
            days90: '90 Gün',
            query: 'Sorgula',
            loading: 'Yükleniyor...',
            roomTypes: 'Oda Tipleri',
            queryRange: 'Sorgu Aralığı',
            avgNightly: 'Ort. Gecelik',
            stopSale: 'Stop Sale',
            sortLabel: 'Sırala:',
            sortName: 'İsim',
            sortPrice: 'Fiyat',
            sortAvailable: 'Müsaitlik',
            timelineTitle: 'Fiyat Timeline — Oda Tipi Bazında',
            timelineSubtitlePrefix: 'Hotelweb & Call Center kanalları',
            dailyPriceTable: 'Günlük Fiyat Tablosu',
            dateHeader: 'Tarih',
            noPrice: 'Fiyat yok',
            startingPrice: 'başlangıç fiyatı',
            availableLabel: 'Müsait',
            avgPriceLabel: 'Ort. Fiyat',
            minPriceLabel: 'Min. Fiyat',
            occupancy: 'Doluluk',
            bookNow: 'Rezervasyon Yap',
            days: 'gün'
        },
        widgetTitles: { 'kpis': 'Toplam Gelir', 'monthly': 'Aylık Gelir', 'channels': 'Kanal Dağılımı', 'roomTypes': 'Oda Tipi Analizi', 'agencies': 'En İyi Acentalar', 'occupancy': 'Doluluk Oranı', 'adr': 'ADR', 'country': 'Misafir Milliyeti', 'velocity': 'Rezervasyon Hızı', 'lengthOfStay': 'Ort. Konaklama', 'revpar': 'RevPAR', 'budget': 'Bütçe Analizi', 'callCenter': 'Call Center Performansı', 'forecast': 'Gelecek Dönem Tahmini', 'operator': 'Operatör Performansı', 'rev-daily-chart': 'Günlük Gelir Grafiği', 'rev-weekly-chart': 'Haftalık Gelir Trendi', 'rev-yoy-chart': 'Yıllık Karşılaştırma', 'rev-roomtype-chart': 'Oda Tipine Göre Gelir', 'rev-channel-chart': 'Kanala Göre Gelir', 'rev-country-chart': 'Milliyete Göre Gelir', 'rev-segment-chart': 'Segmente Göre Gelir', 'rev-mealplan-chart': 'Pansiyon Tipine Göre Gelir', 'rev-pace-chart': 'Gelir Hızı (Pace)', 'rev-forecast-chart': 'Gelir Tahmini', 'rev-cumulative-chart': 'Kümülatif Gelir', 'rev-hourly-chart': 'Saatlik Gelir Dağılımı', 'rev-tax-chart': 'KDV & Vergi Dağılımı', 'rev-commission-chart': 'Komisyon Analizi', 'rev-refund-chart': 'İade & İptal Gelir Etkisi', 'rev-daily-kpi': 'Günlük Gelir KPI', 'rev-weekly-kpi': 'Haftalık Gelir Özeti', 'rev-monthly-kpi': 'Aylık Gelir Özeti', 'rev-quarterly-kpi': 'Çeyreklik Gelir Analizi', 'rev-upsell': 'Upsell Gelirleri', 'rev-ancillary': 'Ek Hizmet Gelirleri', 'rev-late-checkout': 'Geç Çıkış Geliri', 'rev-early-checkin': 'Erken Giriş Geliri', 'rev-minibar': 'Minibar Gelirleri', 'rev-spa': 'Spa & Wellness Gelirleri', 'rev-laundry': 'Çamaşırhane Gelirleri', 'rev-parking': 'Otopark Gelirleri', 'rev-transfer': 'Transfer Gelirleri', 'rev-meeting-room': 'Toplantı Salonu Gelirleri', 'rev-deposit': 'Depozito Durumu', 'rev-heatmap': 'Gelir Isı Haritası', 'rev-treemap': 'Gelir Ağaç Haritası', 'rev-waterfall': 'Gelir Şelale Grafiği', 'rev-scatter': 'Fiyat/Doluluk Scatter', 'rev-gauge': 'Bütçe Gerçekleşme Göstergesi', 'rev-sparklines': 'Gelir Mini Trendler', 'rev-funnel': 'Gelir Hunisi', 'rev-comparison-radar': 'Gelir Karşılaştırma Radar', 'occ-daily-chart': 'Günlük Doluluk Grafiği', 'occ-monthly-chart': 'Aylık Doluluk Trendi', 'occ-weekday-chart': 'Gün Bazlı Doluluk', 'occ-roomtype-chart': 'Oda Tipine Göre Doluluk', 'occ-floor-chart': 'Kat Bazlı Doluluk', 'occ-forecast-chart': '14 Gün Doluluk Tahmini', 'occ-yoy-chart': 'Doluluk YoY Karşılaştırma', 'occ-ooo-chart': 'Out of Order Oda Trendi', 'occ-upgrade-chart': 'Oda Upgrade Analizi', 'occ-status-chart': 'Oda Durumu Dağılımı', 'occ-category-mix': 'Oda Kategori Mix', 'occ-rate-analysis': 'Oda Fiyat Analizi', 'occ-today-status': 'Bugünkü Oda Durumu', 'occ-arrivals-today': 'Bugünkü Girişler', 'occ-departures-today': 'Bugünkü Çıkışlar', 'occ-stayovers': 'Stayover Misafirler', 'occ-no-shows': 'No-Show Raporu', 'occ-walkins': 'Walk-in Kayıtları', 'occ-vip-rooms': 'VIP Oda Ataması', 'occ-connecting': 'Connecting Oda Kullanımı', 'occ-housekeeping': 'Housekeeping Durumu', 'occ-maintenance': 'Bakım/Arıza Logu', 'occ-inhouse-list': 'In-House Misafir Listesi', 'occ-early-late': 'Erken Giriş / Geç Çıkış', 'occ-heatmap': 'Doluluk Isı Haritası', 'occ-floor-map': 'Kat Haritası Görünümü', 'occ-bubble': 'Doluluk Balon Grafiği', 'occ-gauge': 'Doluluk Göstergesi', 'occ-timeline': 'Oda Doluluk Timeline', 'guest-country-pie': 'Milliyet Dağılımı Pasta', 'guest-repeat-chart': 'Tekrar Misafir Trendi', 'guest-satisfaction-chart': 'Memnuniyet Trendi', 'guest-demographics-chart': 'Yaş & Cinsiyet Dağılımı', 'guest-spending-chart': 'Misafir Harcama Kalıbı', 'guest-los-chart': 'Konaklama Süresi Dağılımı', 'guest-source-chart': 'Misafir Kaynak Analizi', 'guest-loyalty-chart': 'Sadakat Programı İstatistik', 'guest-complaint-chart': 'Şikayet Kategori Dağılımı', 'guest-review-chart': 'Online Yorum Trendi', 'guest-vip-list': 'VIP Misafir Listesi', 'guest-repeat-list': 'Tekrar Gelen Misafirler', 'guest-birthday': 'Doğum Günü Takvimi', 'guest-anniversary': 'Yıl Dönümü Raporu', 'guest-special-req': 'Özel İstek Analizi', 'guest-allergy': 'Alerji & Diyet Raporu', 'guest-blacklist': 'Kara Liste', 'guest-feedback-summary': 'Geri Bildirim Özeti', 'guest-top-spenders': 'En Çok Harcayan Misafirler', 'guest-country-revenue': 'Ülke Bazlı Gelir', 'guest-preferences': 'Misafir Tercihleri', 'guest-communication': 'İletişim Logları', 'guest-world-map': 'Dünya Haritası Dağılımı', 'guest-satisfaction-radar': 'Memnuniyet Radar', 'guest-journey-sankey': 'Misafir Yolculuk Sankey', 'guest-segmentation-bubble': 'Segment Balon Grafiği', 'guest-retention-funnel': 'Misafir Tutma Hunisi', 'res-pace-chart': 'Booking Pace Raporu', 'res-leadtime-chart': 'Lead Time Analizi', 'res-cancel-chart': 'İptal Oranı Trendi', 'res-noshow-chart': 'No-Show Trendi', 'res-channel-trend': 'Kanal Bazlı Rez. Trendi', 'res-daily-pickup': 'Günlük Pick-Up', 'res-rate-code': 'Rate Code Performansı', 'res-promo-chart': 'Promosyon Kodu Analizi', 'res-group-chart': 'Grup Rez. Özeti', 'res-overbooking': 'Overbooking Analizi', 'res-modification': 'Rez. Değişiklik Trendi', 'res-board-mix': 'Pansiyon Tipi Mix', 'res-today-arrivals': 'Bugünkü Girişler Detay', 'res-today-departures': 'Bugünkü Çıkışlar Detay', 'res-pending': 'Bekleyen Rezervasyonlar', 'res-confirmed': 'Onaylı Rezervasyonlar', 'res-cancelled-list': 'İptal Edilen Rez. Listesi', 'res-waitlist': 'Bekleme Listesi', 'res-allotment': 'Allotment Kullanımı', 'res-agency-prod': 'Acenta Üretim Raporu', 'res-source-mix': 'Kaynak Mix Tablosu', 'res-avg-rate': 'Ortalama Fiyat Raporu', 'res-revenue-by-stay': 'Konaklama Bazlı Gelir', 'res-night-audit': 'Night Audit Özeti', 'res-pace-waterfall': 'Booking Pace Şelale', 'res-channel-sankey': 'Kanal Akış Sankey', 'res-heatmap': 'Rez. Yoğunluk Haritası', 'res-funnel': 'Rezervasyon Hunisi', 'res-calendar': 'Takvim Görünümü', 'res-comparison-bar': 'Sezon Karşılaştırma Bar', 'ops-checkin-volume': 'Check-in Hacmi', 'ops-checkout-volume': 'Check-out Hacmi', 'ops-housekeeping-chart': 'HK Temizlik Trendi', 'ops-maintenance-chart': 'Arıza Kategorileri', 'ops-request-chart': 'Misafir İstek Trendi', 'ops-response-time': 'Yanıt Süresi Analizi', 'ops-energy-chart': 'Enerji Tüketimi', 'ops-water-chart': 'Su Tüketimi', 'ops-complaint-trend': 'Şikayet Trendi', 'ops-task-completion': 'Görev Tamamlama Oranı', 'ops-mod-report': 'MOD Raporu', 'ops-night-audit-data': 'Night Audit Detay', 'ops-lost-found': 'Kayıp & Bulunmuş', 'ops-security-log': 'Güvenlik Logu', 'ops-incident': 'Olay Raporu', 'ops-pool-status': 'Havuz & Plaj Durumu', 'ops-parking': 'Otopark Doluluk', 'ops-laundry-stats': 'Çamaşırhane İstatistik', 'ops-minibar-track': 'Minibar Takibi', 'ops-shuttle-schedule': 'Transfer Programı', 'ops-amenity-usage': 'Amenity Kullanımı', 'ops-key-card': 'Kart Basımı İstatistik', 'ops-floor-heatmap': 'Kat Bazlı Isı Haritası', 'ops-timeline': 'Operasyon Timeline', 'ops-response-gauge': 'Yanıt Süresi Göstergesi', 'ops-energy-gauge': 'Enerji Tüketim Göstergesi', 'ops-task-kanban': 'Görev Kanban Görünümü', 'fnb-restaurant-rev': 'Restoran Geliri', 'fnb-bar-rev': 'Bar Geliri', 'fnb-roomservice-chart': 'Oda Servisi Trendi', 'fnb-breakfast-count': 'Kahvaltı Sayacı', 'fnb-allinc-consumption': 'AI Tüketim Analizi', 'fnb-menu-popularity': 'Menü Popülerlik', 'fnb-food-cost': 'Gıda Maliyet Oranı', 'fnb-beverage-cost': 'İçecek Maliyet Oranı', 'fnb-cover-count': 'Cover Sayısı Trendi', 'fnb-avg-check': 'Ortalama Hesap', 'fnb-daily-summary': 'F&B Günlük Özet', 'fnb-waste-report': 'İsraf Raporu', 'fnb-stock-alert': 'Stok Uyarıları', 'fnb-recipe-cost': 'Reçete Maliyeti', 'fnb-supplier-perf': 'Tedarikçi Performansı', 'fnb-special-diet': 'Özel Diyet Raporu', 'fnb-banquet-rev': 'Ziyafet Gelirleri', 'fnb-outlet-compare': 'Outlet Karşılaştırma', 'fnb-happy-hour': 'Happy Hour Performansı', 'fnb-inventory': 'F&B Envanter Durumu', 'fnb-treemap': 'F&B Gelir Ağaç Haritası', 'fnb-cost-gauge': 'Maliyet Oranı Göstergesi', 'fnb-popularity-bubble': 'Menü Popülerlik Balon', 'fnb-outlet-radar': 'Outlet Performans Radar', 'fnb-flow-sankey': 'F&B Akış Sankey', 'mkt-direct-vs-ota': 'Direkt vs OTA', 'mkt-website-conversion': 'Website Dönüşüm Oranı', 'mkt-email-campaign': 'E-posta Kampanya Perf.', 'mkt-social-engagement': 'Sosyal Medya Etkileşim', 'mkt-seo-ranking': 'SEO Sıralama Trendi', 'mkt-ppc-roi': 'PPC Reklam ROI', 'mkt-review-scores': 'Yorum Puanları Trendi', 'mkt-competitor-rate': 'Rakip Fiyat Analizi', 'mkt-market-share': 'Pazar Payı', 'mkt-brand-awareness': 'Marka Bilinirliği', 'mkt-campaign-summary': 'Kampanya Özeti', 'mkt-promo-redemption': 'Promosyon Kullanım', 'mkt-referral': 'Referans Kaynak Analizi', 'mkt-review-list': 'Son Yorumlar Listesi', 'mkt-meta-perf': 'Meta Search Performansı', 'mkt-ota-ranking': 'OTA Sıralama Durumu', 'mkt-loyalty-stats': 'Sadakat Programı KPI', 'mkt-newsletter': 'Newsletter İstatistik', 'mkt-influencer': 'Influencer İşbirliği', 'mkt-content-perf': 'İçerik Performansı', 'mkt-channel-funnel': 'Kanal Hunisi', 'mkt-attribution': 'Atıf Modeli Sankey', 'mkt-competitor-radar': 'Rakip Karşılaştırma Radar', 'mkt-roi-scatter': 'Kampanya ROI Scatter', 'mkt-journey-flow': 'Misafir Yolculuk Akışı', 'staff-schedule-chart': 'Vardiya Çizelgesi', 'staff-overtime-chart': 'Fazla Mesai Trendi', 'staff-labor-cost': 'İşçilik Maliyet Trendi', 'staff-productivity': 'Verimlilik Analizi', 'staff-turnover': 'Personel Devir Oranı', 'staff-training': 'Eğitim Tamamlama', 'staff-attendance': 'Devam Durumu', 'staff-department': 'Departman Dağılımı', 'staff-roster': 'Günlük Kadro Listesi', 'staff-leave': 'İzin Takibi', 'staff-performance': 'Performans Değerlendirme', 'staff-certification': 'Sertifika Durumu', 'staff-onboarding': 'İşe Alım Süreci', 'staff-payroll-summary': 'Maaş Bordrosu Özeti', 'staff-tip-report': 'Bahşiş Raporu', 'staff-uniform': 'Üniforma Takibi', 'staff-org-chart': 'Organizasyon Şeması', 'staff-workload-heatmap': 'İş Yükü Isı Haritası', 'staff-satisfaction-gauge': 'Personel Memnuniyet', 'staff-cost-pie': 'İşçilik Maliyet Dağılımı', 'yield-rate-strategy': 'Fiyat Strateji Performansı', 'yield-demand-forecast': 'Talep Tahmini', 'yield-compset': 'CompSet Analizi', 'yield-pickup': 'Pick-Up Raporu', 'yield-displacement': 'Displacement Analizi', 'yield-los-pattern': 'LOS Kalıbı', 'yield-dow-analysis': 'Gün Bazlı Analiz', 'yield-seasonal': 'Sezonsal Trend', 'yield-rate-shop': 'Rate Shopping Tablosu', 'yield-restrictions': 'Kısıtlama Raporu', 'yield-overrides': 'Manuel Fiyat Override', 'yield-segment-mix': 'Segment Mix Optimal', 'yield-channel-margin': 'Kanal Kar Marjı', 'yield-dynamic-pricing': 'Dinamik Fiyatlama Log', 'yield-benchmark': 'Benchmark KPI', 'yield-price-elasticity': 'Fiyat Esneklik Grafiği', 'yield-demand-heatmap': 'Talep Isı Haritası', 'yield-optimal-rate': 'Optimal Fiyat Göstergesi', 'yield-revenue-gauge': 'Gelir Potansiyel Gösterge', 'fin-pnl-chart': 'Kâr-Zarar Trendi', 'fin-cashflow-chart': 'Nakit Akış Grafiği', 'fin-ar-aging': 'Alacak Yaşlandırma', 'fin-ap-aging': 'Borç Yaşlandırma', 'fin-expense-chart': 'Gider Kategori Trendi', 'fin-payment-method': 'Ödeme Yöntemi Analizi', 'fin-tax-summary': 'Vergi Özet Raporu', 'fin-budget-gauge': 'Bütçe Gerçekleşme Gauge', 'fin-cost-breakdown': 'Maliyet Kırılım Treemap', 'fin-ratio-radar': 'Finansal Oran Radar' },
        categoryLabels: { revenue: 'Gelir & Finans', occupancy: 'Doluluk & Oda', guest: 'Misafir & CRM', reservation: 'Rezervasyon & Satış', operations: 'Operasyon', fnb: 'Yiyecek & İçecek', marketing: 'Pazarlama', staff: 'Personel & İK', yield: 'Yield Yönetim', financial: 'Maliyet & Muhasebe' }, typeLabels: { chart: 'Grafik', data: 'Veri Tablosu', graph: 'Gelişmiş Grafik' },
        reportsPage: {
            managementReports: 'Yönetim Raporları',
            financeReports: 'Finans Raporları',
            purchasingReports: 'Satın Alma Raporları',
            hrReports: 'İnsan Kaynakları Raporları',
            elektraSubtext: 'Elektra ERP entegrasyonu ile güncel veriler'
            , next14DaysTotal: 'Gelecek 14 Gün Toplamı', operator: 'Operatör', operation: 'Operasyon', score: 'Puan', last30Days: 'Son 30 Gün', last12Weeks: 'Son 12 Hafta', unknown: 'Bilinmeyen', direct: 'Direkt', agency: 'Acente', unspecified: 'Belirtilmemiş', other: 'Diğer', pctOfTotalRevenue: 'Toplam Gelirdeki Payı (%)', avg: 'Ortalama', cumulativeRevenuePace: 'Kümülatif Gelir Hızı', totalStr: 'Toplam', estimate: 'Tahmin', salesByHourEst: 'Saatlik Satış Tahmini', taxRate: 'Vergi Oranı', estCommissionDist: 'Tahmini Komisyon Dağılımı'
        },

        // Reports
        reportTitle: 'Kapsamlı Performans Raporu',
        totalRevenue: 'Toplam Gelir',
        totalReservations: 'Toplam Rezervasyon',
        avgDailyRate: 'Ort. Günlük Ücret',
        avgBookingValue: 'Ort. Rezervasyon Değeri',
        roomNights: 'Oda/Gece',
        monthlyRevenue: 'Aylık Gelir',
        channelDistribution: 'Kanal Dağılımı',
        topAgencies: 'En İyi Acenteler',
        roomTypeAnalysis: 'Oda Tipi Analizi',
        boardTypeAnalysis: 'Pansiyon Tipi Analizi',
        budgetAnalysis: 'Bütçe Analizi',
        bookingVelocity: 'Rezervasyon Hızı',
        occupancyRate: 'Doluluk Oranı',
        roomOccupancy: 'Oda Doluluk',
        adr: 'ADR (Ort. Günlük Fiyat)',
        revpar: 'RevPAR',
        bedNightLabel: 'Yatak Geceleme',
        roomRevenue: 'Oda Geliri',
        monthLabel: 'Ay',
        seasonLabel: 'Sezon',
        exchangeRateLabel: 'Kur:',
        avgNights: 'Ort. Konaklama',
        guestNationality: 'Misafir Milliyeti',
        overview: 'Genel Bakış',
        recordDate: 'Kayıt Tarihi',
        budget: 'Bütçe',
        agency: 'Acente',
        exportPDF: 'PDF İndir',
        exportCSV: 'CSV İndir',
        currency: 'Para Birimi',
        dateRange: 'Tarih Aralığı',
        startDate: 'Başlangıç',
        endDate: 'Bitiş',
        allTime: 'Tüm Zamanlar',
        last7Days: 'Son 7 Gün',
        last30Days: 'Son 30 Gün',
        last90Days: 'Son 90 Gün',
        last180Days: 'Son 180 Gün',
        revenue: 'Gelir',
        count: 'Adet',
        percentage: 'Oran',
        channel: 'Kanal',
        nights: 'Gece',
        avgStay: 'Ort. Kalış',
        target: 'Hedef',
        variance: 'Sapma',
        daily: 'Günlük',
        weekly: 'Haftalık',
        grossRevenue: 'Brüt Gelir',
        netRevenue: 'Net Gelir',
        vatAndAccTax: 'KDV + Konaklama Vergisi',
        stayDate: 'Konaklama Tarihi',
        reservationDate: 'Rez. Tarihi',
        stay: 'Konaklama',
        dailyAverage: 'Günlük Ort',
        noData: 'Veri bulunamadı',
        loadingError: 'Veriler yüklenirken hata oluştu',

        // Widget system
        addWidget: 'Widget Ekle',
        removeWidget: 'Kaldır',
        editCriteria: 'Kriterleri Düzenle',
        saveCriteria: 'Kaydet',
        cancelEdit: 'İptal',
        aiInterpret: 'AI ile Yorumla',
        aiLoading: 'AI yorumluyor...',
        dragHint: 'Sürükleyerek sırayı değiştirin',
        widgetSettings: 'Widget Ayarları',

        // Extra Sales
        extraSales: 'Ekstra Satışlar',
        spaRevenue: 'Spa Geliri',
        minibarRevenue: 'Minibar Geliri',
        restaurantExtras: 'Restoran Ekstraları',
        category: 'Kategori',
        amount: 'Tutar',
        date: 'Tarih',
        callCenterPerf: 'Call Center Performansı',
        forecast: 'Gelecek Dönem Tahmini',
        operatorPerf: 'Operatör Performansı',

        // General
        save: 'Kaydet',
        cancel: 'İptal',
        delete: 'Sil',
        edit: 'Düzenle',
        add: 'Ekle',
        loading: 'Yükleniyor...',
        saving: 'Kaydediliyor...',
        saved: 'Kaydedildi!',
        error: 'Hata',
        success: 'Başarılı',
        confirm: 'Emin misiniz?',

        // Yield Management
        yieldTitle: 'Yield Management',
        yieldSubtitle: 'Gelir yönetimi ve fiyat analizi',
        tabOverview: 'Genel Bakış',
        tabChannels: 'Kanal Analizi',
        tabAgencies: 'Acenta Analizi',
        tabPricing: 'Fiyat Matrisi',
        tabAi: 'AI Değerlendirmesi',
        seasonHigh: 'Yüksek',
        seasonShoulder: 'Omuz',
        seasonLow: 'Düşük',
        seasonOff: 'Kapalı',
        refresh: 'Yenile',
        refreshing: 'Yenileniyor...',
        cacheEmpty: 'Cache boş',
        lastUpdate: 'Son güncelleme',
        stale: 'Eski',
        thisMonth: 'Bu Ay',
        thisSeason: 'Bu Sezon',
        thisYear: 'Bu Yıl',
        custom: 'Özel',
        channelDist: 'Kanal Dağılımı (Rezervasyon)',
        channelRevenue: 'Kanal Bazlı Gelir',
        agencyAnalysis: 'Acenta & Ülke Bazlı Analiz',
        priceVolumeMatrix: 'Fiyat-Volume Matrisi',
        periodAdrComparison: 'Dönem Bazlı ADR Karşılaştırması',
        monthlyAdrRoomNight: 'Aylık ADR & Room Night',
        aiPriceEval: 'AI Fiyat Değerlendirmesi',
        aiPriceDesc: 'Gemini AI ile mevcut fiyatlandırma stratejinizi değerlendirin',
        startAnalysis: 'Analiz Başlat',
        analyzing: 'Analiz Ediliyor...',
        totalRevLabel: 'Toplam Gelir',
        avgAdr: 'Ortalama ADR',
        roomNightLabel: 'Room Night',
        channelCount: 'Kanal Sayısı',
        avgStayNights: 'Ort. Konaklama',
        revenueShare: 'Gelir Payı',
        roomNightShare: 'Room Night Payı',
        vsLastYear: 'Önceki Yıla Göre',
        monthNames: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
        managementReports: {
            netReservations: 'Net Rezervasyonlar',
            paceReport: 'YTD Pace Raporu',
            agencyReport: 'Acente Raporu',
            market: 'Acenta',
            allMarkets: 'Tüm Acentalar',
            ytd: 'Bugüne Kadar (YTD)',
            allSeasons: 'Tüm Sezonlar',
            clear: 'Temizle',
            sendEmail: 'E-posta Gönder',
            aiInterpretGrouped: 'AI Yorumu',
            total: 'Toplam',
            kpiSummary: 'Aylık KPI Özeti',
            revenueShare: 'Gelir Payı',
            comparison: 'Karşılaştırma',
            details: 'Detay Tablosu',
            resCount: 'Rez. Sayısı',
            sharePct: 'Pay %',
            actual: 'Gerçekleşen',
            remaining: 'Kalan',
            targetAdr: 'Hedef ADR',
            requiredRes: 'Gereken Rez.',
            remainingRn: 'Kalan Oda-Gece',
            groupRes: 'Grup Rez.',
            channelBudgetSplit: 'Kanal Bütçe Dağılımı',
            budgetRealization: 'Bütçe Gerçekleşme',
            ofTarget: 'hedefin'
        },
        // Time presets
        presetToday: 'Bugün',
        presetYesterday: 'Dün',

        // AI buttons
        aiInterpretAll: 'Tümünü Yorumla',
        aiInterpreted: 'Yorumlandı',
        aiInterpretingProgress: 'yorumlanıyor...',

        // Day names
        dayNames: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'],
        monthNamesFull: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],

        // Fallback labels
        unknown: 'Bilinmiyor',
        unspecified: 'Belirtilmemiş',
        other: 'Diğer',

        // Report sections
        statisticsReports: 'İstatistik Raporları',
        allCategories: 'Tüm Kategoriler',
        totalRes: 'Toplam Rez.',
        confirmed: 'Onaylı',
        cancelled: 'İptal',
        walkIn: 'Walk-in',
        direct: 'Direkt',
        tourOperator: 'Tur Operatörü',
        onlineRes: 'Online Rez.',

        // Revenue widget titles
        upsellRevenue: 'Upsell Gelirleri',
        ancillaryRevenue: 'Ek Hizmet Gelirleri',
        lateCheckout: 'Geç Çıkış Geliri',
        earlyCheckin: 'Erken Giriş Geliri',
        spaWellness: 'Spa & Wellness',
        laundry: 'Çamaşırhane',
        parking: 'Otopark',
        transferRevenue: 'Transfer',
        meetingRoomRevenue: 'Toplantı Salonu',

        // Staff roles
        reception: 'Resepsiyon',
        resOffice: 'Rezervasyon',
        nightAudit: 'Gece Müdürü',

        localGuide: 'Çevre Rehberi',
        approve: 'Onayla',
        reject: 'Kaldır',
        approved: 'Onaylı',
        pending: 'Bekleyen',
        all: 'Tümü',

        widgets: {
            next14DaysTotal: 'Gelecek 14 Gün Toplamı', operator: 'Operatör', operation: 'Operasyon', score: 'Puan', last30Days: 'Son 30 Gün', last12Weeks: 'Son 12 Hafta', unknown: 'Bilinmeyen', direct: 'Direkt', agency: 'Acente', unspecified: 'Belirtilmemiş', other: 'Diğer', pctOfTotalRevenue: 'Toplam Gelirdeki Payı (%)', avg: 'Ortalama', cumulativeRevenuePace: 'Kümülatif Gelir Hızı', totalStr: 'Toplam', estimate: 'Tahmin', salesByHourEst: 'Saatlik Satış Tahmini', taxRate: 'Vergi Oranı', estCommissionDist: 'Tahmini Komisyon Dağılımı',
            cancelCount: 'İptal Sayısı',
            rate: 'oran',
            revenueImpact: 'Gelir Etkisi',
            loss: 'kayıp',
            todayRevenue: 'Bugünkü Gelir',
            yesterdayRevenue: 'Dünkü gelir',
            change: 'değişim',
            thisWeek: 'Bu Hafta',
            avgPerDay: 'ort',
            perDay: '/gün',
            outOfOrderRooms: 'Out of Order Odalar',
            totalRoomsPct: 'Toplam odaların',
            availableRooms: 'Kullanılabilir',
            expectedOccupancy: 'Beklenen Doluluk',
            totalCommission: 'Toplam Komisyon',
            roomsSuffix: 'oda',
            resSuffix: 'rezervasyon',
            collectionRate: 'tahsilat oranı',
            occupancy: 'Doluluk'
        },
        bigDataPage: {
            tabs: { overview: 'Genel Bakış', revenue: 'Gelir Analizi', occupancy: 'Doluluk', channels: 'Kanal & Acenta', guests: 'Misafir & Demografik', booking: 'Rez. Kalıpları', performance: 'Performans', forecast: 'Tahmin & Pace', comparative: 'Karşılaştırma', rawdata: 'Ham Veri' },
            header: { title: 'Big Data Analytics', reservations: 'rezervasyon', countries: 'ülke', lastUpdate: 'Son güncelleme:', liveApi: 'Canlı API', loadingData: 'Veri yükleniyor...' },
            overview: { budgetRealization: 'Bütçe Gerçekleşme', monthlyRevVsBudget: 'Aylık Gelir vs Bütçe', channelDist: 'Kanal Dağılımı', adrTrendMonthly: 'ADR Trendi (Aylık)', occupancyRate: 'Doluluk Oranı', nationalityDist: 'Milliyet Dağılımı', boardType: 'Pansiyon Tipi' },
            revenue: { title: '💰 Gelir Analitiği — 10 Rapor & Grafik', seasonBudget: '📊 2026 Sezon Bütçesi', target: 'Hedef:', actual: 'Gerçekleşen:', realization: 'Gerçekleşme', remaining: 'Kalan', excess: 'Aşım', r1: 'R1: Günlük Gelir Trendi', r2: 'R2: Haftalık Gelir', r3: 'R3: Aylık Gelir vs Bütçe (€)', r5: 'R5: Gelir Tahmini (7 Günlük MA)', r6: 'R6: RevPAR Trendi', r7: 'R7: ADR Trendi', r8: 'R8: Para Birimi Dağılımı', r9: 'R9: Toplam vs Ödenen Gelir', r10: 'R10: Gelir Isı Haritası (Gün×Ay, ₺K)', tableTitle: 'Aylık Gelir & Bütçe Tablosu' },
            occupancy: { title: '🛏️ Doluluk & Oda Analizi — 8 Rapor & Grafik', r11: 'R11: Günlük Doluluk Oranı (%)', r12: 'R12: Doluluk Tahmini', r13: 'R13: Oda Tipi Dağılımı', r14: 'R14: Doluluk vs ADR Korelasyon', r15: 'R15: Doluluk Isı Haritası (Gün×Ay, %)', r16: 'R16: Hafta İçi vs Hafta Sonu', r17: 'R17: Sezonluk Karşılaştırma', r18: 'R18: Boş Oda Kaybı (₺)', avgNightsSuffix: 'gece ort.', tableTitle: 'Oda Tipi Detay Tablosu' },
            channels: { title: '📡 Kanal & Acenta Analizi — 7 Rapor & Grafik', r19: 'R19: Kanal Dağılımı', r20: 'R20: Kanal Bazlı Gelir Trendi', r21: 'R21: Kanal Bazlı ADR', r22: 'R22: Kanal Performans Trendi', r23: 'R23: OTA vs Direkt', r25: 'R25: Kanal Mix Değişimi (%)', r24: 'R24: Acenta Sıralaması (Top 30)', tableTitle: 'Kanal Özet Tablosu' },
            guests: { title: '🌍 Misafir & Demografik Analiz — 7 Rapor & Grafik', r26: 'R26: Milliyet Dağılımı', r27: 'R27: Ülke Bazlı Gelir (₺)', r28: 'R28: Ülke Bazlı Ort. Kalış', r29: 'R29: Milliyet Trendi (Aylık)', r30: 'R30: Misafir Segmentasyonu', r31: 'R31: Milliyet-Kanal Matrisi', r32: 'R32: Ülke Bazlı Ort. Fiyat', tableTitle: 'Milliyet Detay Tablosu' },
            booking: { title: '📋 Rezervasyon Kalıpları — 8 Rapor & Grafik', r33: 'R33: Rez. Lead Time Dağılımı', r34: 'R34: Rez. Günü Analizi (Hangi Gün)', r35: 'R35: İptal Oranı (Aylık)', r36: 'R36: Ortalama Kalış Süresi Trendi', r37: 'R37: Oda Sayısı Dağılımı', r38: 'R38: Pansiyon Tipi Dağılımı', r39: 'R39: Oda Tipi Tercihi', r40: 'R40: Kalış Süresi Dağılımı', leadTimeTable: 'Lead Time Detay Tablosu', stayLengthTable: 'Kalış Süresi Detay' },
            performance: { title: '🎯 Performans Göstergeleri — 8 Rapor & Grafik', r41: 'R41: GOPPAR (Brüt Operasyonel Kâr / Oda)', r42: 'R42: TRevPAR (Toplam Gelir / Mevcut Oda)', r46: 'R46: Check-in Gün Dağılımı', r47: 'R47: Fiyat Segmenti Trendi', r48: 'R48: Aylık Performans & Bütçe İndeksi', r49: 'R49: Gelir Yoğunlaşma (Pareto)', r50: 'R50: Rate Tipi Analizi', tableTitle: 'Rate Tipi Detay Tablosu' },
            forecast: { title: '⚡ Tahmin & Pace Raporu — 5 Rapor & Grafik', r5: 'R5: Gelir Tahmin (MA-7)', r43: 'R43: Pace Raporu (Bu Yıl vs Geçen Yıl)', r44: 'R44: Pick-up Analizi (Günlük Yeni Rez.)', r12: 'R12: Doluluk Tahmin', seasonalComp: 'Sezonluk Tahmin Karşılaştırma' },
            comparative: { title: '📊 Karşılaştırmalı Raporlar — 5 Rapor & Grafik', r4: 'R4: Yıllık Karşılaştırma (YoY)', metric: 'Metrik', thisSeason: 'Bu Sezon', lastSeason: 'Geçen Sezon', change: 'Değişim', paceComp: 'Pace: Bu Yıl vs Geçen Yıl', seasonalRevComp: 'Sezonluk Gelir Karşılaştırma', channelAdrComp: 'Kanal Bazlı ADR Karşılaştırma', roomTypeRevComp: 'Oda Tipi Gelir Karşılaştırma' },
            rawdata: { title: '🗄️ Ham Veri & Tablolar', searchPlaceholder: 'Ara (acenta, ülke, voucher, oda tipi)...', recordsSuffix: 'kayıt', tableTitle: 'Tüm Rezervasyonlar' },
            tableCols: { month: 'Ay', resCount: 'Rez.', revenueYtl: 'Gelir (₺)', budgetEur: 'Bütçe (€)', actualEur: 'Gerçek (€)', remainingEur: 'Kalan (€)', percent: '%', adrYtl: 'ADR (₺)', roomType: 'Oda Tipi', avgRate: 'Ort. Fiyat', avgNights: 'Ort. Kalış', share: 'Pay (%)', channel: 'Kanal', agency: 'Acenta', country: 'Ülke', avgRateYtl: 'Ort. Fiyat (₺)', durationRange: 'Süre Aralığı', resCountLong: 'Rez. Sayısı', duration: 'Süre', realization: 'Gerçekleşme', occupancyRate: 'Doluluk (%)', revparYtl: 'RevPAR (₺)', rateType: 'Rate Tipi', voucher: 'Voucher', boardType: 'Pansiyon', checkIn: 'Giriş', checkOut: 'Çıkış', nights: 'Gece', price: 'Fiyat', currency: 'Döviz', status: 'Durum' }
        }
    },
    en: {
        navReports: 'Reports & Analysis',
        navSales: 'Sales & Marketing',
        navFinance: 'Finance & Supply',
        navContent: 'Content Management',
        navOperations: 'Hotel Operations',
        navIntegrations: 'Integrations',

        dashboard: 'Dashboard',
        reports: 'Reports',
        reservations: 'Reservations',
        extras: 'Extra Sales',
        crm: 'CRM (Guest Relations)',
        marketing: 'Marketing',
        management: 'Management',
        operation: 'Operation',
        finance: 'Finance',
        roomPrices: 'Room Prices',
        pages: 'Pages',
        menu: 'Menu',
        media: 'Media',
        localization: 'Localization',
        settings: 'Settings',
        analytics: 'Analytics',
        blueConcierge: 'Blue Concierge',
        bookingEngine: 'Booking Engine',
        rooms: 'Rooms',
        dining: 'Restaurants',
        meeting: 'Meeting',
        activities: 'Activities',
        sportsAndActivities: 'Sports & Activities',
        aiTraining: 'AI Training',
        users: 'Users',
        viewSite: 'View Site',
        editingLang: 'Editing:',
        bigData: 'Big Data',
        accounting: 'Accounting',
        purchasing: 'Purchasing',
        yieldManagement: 'Yield Management',
        socialMedia: 'Social Media',
        contentCreator: 'Content Creator',
        reservationPerformance: 'Reservation Performance',
        live: 'Live',
        recentReservations: 'Recent Reservations',
        viewAll: 'View All',
        taskManagement: 'Task Management',
        tasks: 'Tasks',
        workflows: 'Workflows',
        mailIntegration: 'Mail Integration',
        createTask: 'Create Task',
        assignee: 'Assignee',
        priority: 'Priority',
        dueDate: 'Due Date',
        mailIntegrationPage: {
            title: 'Mail Integration',
            subtitle: 'Convert emails to tasks with AI',
            connected: 'Connected',
            disconnected: 'Not Connected',
            sync: 'Synchronize',
            syncing: 'Syncing...',
            settings: 'Settings',
            serverSettings: 'Mail Server Settings',
            imapTitle: 'IMAP (Incoming)',
            smtpTitle: 'SMTP (Outgoing)',
            emailAddress: 'Email address',
            username: 'Username',
            password: 'Password',
            port: 'Port',
            emptySmtpDesc: 'If empty, IMAP settings are used',
            saveAndConnect: 'Save & Connect',
            cancelConnection: 'Disconnect',
            lastSync: 'Last synchronization',
            inbox: 'Inbox',
            new: 'new',
            selectEmailDesc: 'Click an email on the left to convert it to a task with AI',
            configFirstDesc: 'Configure mail server settings first',
            sender: 'Sender:',
            noContent: '(No content)',
            aiAnalyze: 'Convert to Task with AI',
            aiAnalyzing: 'AI Analyzing...',
            aiSuggestion: 'AI Task Suggestion',
            createAsTask: 'Create as Task',
            creating: 'Creating...'
        },
        roomPricesPage: {
            title: 'Room Prices & Availability',
            subtitle: 'Elektra PMS — Hotelweb & Call Center channels',
            live: 'Live',
            pdfExporting: 'PDF...',
            pdf: 'PDF',
            bookingEngine: 'Booking Engine',
            today: 'Today',
            days7: '7 Days',
            days30: '30 Days',
            days60: '60 Days',
            days90: '90 Days',
            query: 'Query',
            loading: 'Loading...',
            roomTypes: 'Room Types',
            queryRange: 'Query Range',
            avgNightly: 'Avg. Nightly',
            stopSale: 'Stop Sale',
            sortLabel: 'Sort by:',
            sortName: 'Name',
            sortPrice: 'Price',
            sortAvailable: 'Availability',
            timelineTitle: 'Price Timeline — By Room Type',
            timelineSubtitlePrefix: 'Hotelweb & Call Center channels',
            dailyPriceTable: 'Daily Price Table',
            dateHeader: 'Date',
            noPrice: 'No price',
            startingPrice: 'starting price',
            availableLabel: 'Available',
            avgPriceLabel: 'Avg. Price',
            minPriceLabel: 'Min. Price',
            occupancy: 'Occupancy',
            bookNow: 'Book Now',
            days: 'days'
        },
        widgetTitles: { 'kpis': 'Total Revenue', 'monthly': 'Monthly Revenue', 'channels': 'Channel Distribution', 'roomTypes': 'Room Tipi Analysis', 'agencies': 'En İyi Agencylar', 'occupancy': 'Occupancy Rate', 'adr': 'ADR', 'country': 'Guest Nationalityi', 'velocity': 'Reservation Hızı', 'lengthOfStay': 'Ort. Konaklama', 'revpar': 'RevPAR', 'budget': 'Bütçe Analysis', 'callCenter': 'Call Center Performanceı', 'forecast': 'Gelecek Dönem Forecast', 'operator': 'Operatör Performanceı', 'rev-daily-chart': 'Daily Revenue Chart', 'rev-weekly-chart': 'Weekly Revenue Trend', 'rev-yoy-chart': 'Yearly Comparison', 'rev-roomtype-chart': 'Room by Type Revenue', 'rev-channel-chart': 'Channela Göre Revenue', 'rev-country-chart': 'Nationalitye Göre Revenue', 'rev-segment-chart': 'by Segment Revenue', 'rev-mealplan-chart': 'Pansiyon by Type Revenue', 'rev-pace-chart': 'Revenue Hızı (Pace)', 'rev-forecast-chart': 'Revenue Forecast', 'rev-cumulative-chart': 'Cumulative Revenue', 'rev-hourly-chart': 'Hourly Revenue Distribution', 'rev-tax-chart': 'KDV & Tax Distribution', 'rev-commission-chart': 'Commission Analysis', 'rev-refund-chart': 'Refund & Cancellation Revenue Etkisi', 'rev-daily-kpi': 'Daily Revenue KPI', 'rev-weekly-kpi': 'Weekly Revenue Summary', 'rev-monthly-kpi': 'Monthly Revenue Summary', 'rev-quarterly-kpi': 'Quarterly Revenue Analysis', 'rev-upsell': 'Upsell Revenueleri', 'rev-ancillary': 'Ancillary Revenueleri', 'rev-late-checkout': 'Late Checkout Revenuei', 'rev-early-checkin': 'Early Check-in Revenuei', 'rev-minibar': 'Minibar Revenueleri', 'rev-spa': 'Spa & Wellness Revenueleri', 'rev-laundry': 'Laundry Revenueleri', 'rev-parking': 'Otopark Revenueleri', 'rev-transfer': 'Transfer Revenueleri', 'rev-meeting-room': 'Meeting Salonu Revenueleri', 'rev-deposit': 'Deposit Status', 'rev-heatmap': 'Revenue Heatmap', 'rev-treemap': 'Revenue Treemap', 'rev-waterfall': 'Revenue Waterfall Chart', 'rev-scatter': 'Price/Occupancy Scatter', 'rev-gauge': 'Bütçe Gerçekleşme Gauge', 'rev-sparklines': 'Revenue Mini Trendler', 'rev-funnel': 'Revenue Funnel', 'rev-comparison-radar': 'Revenue Comparison Radar', 'occ-daily-chart': 'Daily Occupancy Chart', 'occ-monthly-chart': 'Monthly Occupancy Trend', 'occ-weekday-chart': 'Gün Bazlı Occupancy', 'occ-roomtype-chart': 'Room by Type Occupancy', 'occ-floor-chart': 'Kat Bazlı Occupancy', 'occ-forecast-chart': '14 Gün Occupancy Forecast', 'occ-yoy-chart': 'Occupancy YoY Comparison', 'occ-ooo-chart': 'Out of Order Room Trend', 'occ-upgrade-chart': 'Room Upgrade Analysis', 'occ-status-chart': 'Room Status Distribution', 'occ-category-mix': 'Room Kategori Mix', 'occ-rate-analysis': 'Room Price Analysis', 'occ-today-status': 'Bugünkü Room Status', 'occ-arrivals-today': 'Bugünkü Arrivals', 'occ-departures-today': 'Bugünkü Departures', 'occ-stayovers': 'Stayover Guestler', 'occ-no-shows': 'No-Show Report', 'occ-walkins': 'Walk-in Kayıtları', 'occ-vip-rooms': 'VIP Room Ataması', 'occ-connecting': 'Connecting Room Kullanımı', 'occ-housekeeping': 'Housekeeping Status', 'occ-maintenance': 'Bakım/Maintenance Logu', 'occ-inhouse-list': 'In-House Guest List', 'occ-early-late': 'Early Check-in / Late Checkout', 'occ-heatmap': 'Occupancy Heatmap', 'occ-floor-map': 'Kat Haritası Görünümü', 'occ-bubble': 'Occupancy Balon Chart', 'occ-gauge': 'Occupancy Gauge', 'occ-timeline': 'Room Occupancy Timeline', 'guest-country-pie': 'Country Distribution Pasta', 'guest-repeat-chart': 'Tekrar Guest Trend', 'guest-satisfaction-chart': 'Satisfaction Trend', 'guest-demographics-chart': 'Yaş & Cinsiyet Distribution', 'guest-spending-chart': 'Guest Spending Kalıbı', 'guest-los-chart': 'Konaklama Duration Distribution', 'guest-source-chart': 'Guest Kaynak Analysis', 'guest-loyalty-chart': 'Sadakat Programı İstatistik', 'guest-complaint-chart': 'Complaint Kategori Distribution', 'guest-review-chart': 'Online Review Trend', 'guest-vip-list': 'VIP Guest List', 'guest-repeat-list': 'Tekrar Gelen Guestler', 'guest-birthday': 'Doğum Günü Takvimi', 'guest-anniversary': 'Yıl Dönümü Report', 'guest-special-req': 'Özel İstek Analysis', 'guest-allergy': 'Alerji & Diyet Report', 'guest-blacklist': 'Kara Liste', 'guest-feedback-summary': 'Geri Bildirim Summary', 'guest-top-spenders': 'En Çok Harcayan Guestler', 'guest-country-revenue': 'Ülke Bazlı Revenue', 'guest-preferences': 'Guest Tercihleri', 'guest-communication': 'İletişim Logları', 'guest-world-map': 'Dünya Haritası Distribution', 'guest-satisfaction-radar': 'Satisfaction Radar', 'guest-journey-sankey': 'Guest Yolculuk Sankey', 'guest-segmentation-bubble': 'Segment Balon Chart', 'guest-retention-funnel': 'Guest Tutma Funnel', 'res-pace-chart': 'Booking Pace Report', 'res-leadtime-chart': 'Lead Time Analysis', 'res-cancel-chart': 'Cancellation Rate Trend', 'res-noshow-chart': 'No-Show Trend', 'res-channel-trend': 'Channel Bazlı Rez. Trend', 'res-daily-pickup': 'Daily Pick-Up', 'res-rate-code': 'Rate Code Performanceı', 'res-promo-chart': 'Promosyon Kodu Analysis', 'res-group-chart': 'Grup Rez. Summary', 'res-overbooking': 'Overbooking Analysis', 'res-modification': 'Rez. Değişiklik Trend', 'res-board-mix': 'Pansiyon Tipi Mix', 'res-today-arrivals': 'Bugünkü Arrivals Detay', 'res-today-departures': 'Bugünkü Departures Detay', 'res-pending': 'Bekleyen Reservationlar', 'res-confirmed': 'Onaylı Reservationlar', 'res-cancelled-list': 'Cancellation Edilen Rez. List', 'res-waitlist': 'Bekleme List', 'res-allotment': 'Allotment Kullanımı', 'res-agency-prod': 'Agency Üretim Report', 'res-source-mix': 'Kaynak Mix Tablosu', 'res-avg-rate': 'Ortalama Price Report', 'res-revenue-by-stay': 'Konaklama Bazlı Revenue', 'res-night-audit': 'Night Audit Summary', 'res-pace-waterfall': 'Booking Pace Waterfall', 'res-channel-sankey': 'Channel Akış Sankey', 'res-heatmap': 'Rez. Yoğunluk Haritası', 'res-funnel': 'Reservation Funnel', 'res-calendar': 'Takvim Görünümü', 'res-comparison-bar': 'Sezon Comparison Bar', 'ops-checkin-volume': 'Check-in Hacmi', 'ops-checkout-volume': 'Check-out Hacmi', 'ops-housekeeping-chart': 'HK Housekeeping Trend', 'ops-maintenance-chart': 'Maintenance Kategorileri', 'ops-request-chart': 'Guest İstek Trend', 'ops-response-time': 'Yanıt Duration Analysis', 'ops-energy-chart': 'Enerji Tüketimi', 'ops-water-chart': 'Su Tüketimi', 'ops-complaint-trend': 'Complaint Trend', 'ops-task-completion': 'Görev Tamamlama Rate', 'ops-mod-report': 'MOD Report', 'ops-night-audit-data': 'Night Audit Detay', 'ops-lost-found': 'Kayıp & Bulunmuş', 'ops-security-log': 'Güvenlik Logu', 'ops-incident': 'Olay Report', 'ops-pool-status': 'Havuz & Plaj Status', 'ops-parking': 'Otopark Occupancy', 'ops-laundry-stats': 'Laundry İstatistik', 'ops-minibar-track': 'Minibar Takibi', 'ops-shuttle-schedule': 'Transfer Programı', 'ops-amenity-usage': 'Amenity Kullanımı', 'ops-key-card': 'Kart Basımı İstatistik', 'ops-floor-heatmap': 'Kat Bazlı Heatmap', 'ops-timeline': 'Operasyon Timeline', 'ops-response-gauge': 'Yanıt Duration Gauge', 'ops-energy-gauge': 'Enerji Tüketim Gauge', 'ops-task-kanban': 'Görev Kanban Görünümü', 'fnb-restaurant-rev': 'Restoran Revenuei', 'fnb-bar-rev': 'Bar Revenuei', 'fnb-roomservice-chart': 'Room Servisi Trend', 'fnb-breakfast-count': 'Kahvaltı Sayacı', 'fnb-allinc-consumption': 'AI Tüketim Analysis', 'fnb-menu-popularity': 'Menü Popülerlik', 'fnb-food-cost': 'Gıda Cost Rate', 'fnb-beverage-cost': 'İçecek Cost Rate', 'fnb-cover-count': 'Cover Sayısı Trend', 'fnb-avg-check': 'Ortalama Hesap', 'fnb-daily-summary': 'F&B Daily Özet', 'fnb-waste-report': 'İsraf Report', 'fnb-stock-alert': 'Stok Uyarıları', 'fnb-recipe-cost': 'Reçete Costi', 'fnb-supplier-perf': 'Tedarikçi Performanceı', 'fnb-special-diet': 'Özel Diyet Report', 'fnb-banquet-rev': 'Ziyafet Revenueleri', 'fnb-outlet-compare': 'Outlet Comparison', 'fnb-happy-hour': 'Happy Hour Performanceı', 'fnb-inventory': 'F&B Envanter Status', 'fnb-treemap': 'F&B Revenue Treemap', 'fnb-cost-gauge': 'Cost Rate Gauge', 'fnb-popularity-bubble': 'Menü Popülerlik Balon', 'fnb-outlet-radar': 'Outlet Performance Radar', 'fnb-flow-sankey': 'F&B Akış Sankey', 'mkt-direct-vs-ota': 'Direkt vs OTA', 'mkt-website-conversion': 'Website Dönüşüm Rate', 'mkt-email-campaign': 'E-posta Campaign Perf.', 'mkt-social-engagement': 'Sosyal Medya Etkileşim', 'mkt-seo-ranking': 'SEO Sıralama Trend', 'mkt-ppc-roi': 'PPC Reklam ROI', 'mkt-review-scores': 'Review Puanları Trend', 'mkt-competitor-rate': 'Rakip Price Analysis', 'mkt-market-share': 'Pazar Payı', 'mkt-brand-awareness': 'Marka Bilinirliği', 'mkt-campaign-summary': 'Campaign Summary', 'mkt-promo-redemption': 'Promosyon Kullanım', 'mkt-referral': 'Referans Kaynak Analysis', 'mkt-review-list': 'Son Reviewlar List', 'mkt-meta-perf': 'Meta Search Performanceı', 'mkt-ota-ranking': 'OTA Sıralama Status', 'mkt-loyalty-stats': 'Sadakat Programı KPI', 'mkt-newsletter': 'Newsletter İstatistik', 'mkt-influencer': 'Influencer İşbirliği', 'mkt-content-perf': 'İçerik Performanceı', 'mkt-channel-funnel': 'Channel Funnel', 'mkt-attribution': 'Atıf Modeli Sankey', 'mkt-competitor-radar': 'Rakip Comparison Radar', 'mkt-roi-scatter': 'Campaign ROI Scatter', 'mkt-journey-flow': 'Guest Yolculuk Akışı', 'staff-schedule-chart': 'Vardiya Çizelgesi', 'staff-overtime-chart': 'Fazla Mesai Trend', 'staff-labor-cost': 'İşçilik Cost Trend', 'staff-productivity': 'Verimlilik Analysis', 'staff-turnover': 'Staff Devir Rate', 'staff-training': 'Eğitim Tamamlama', 'staff-attendance': 'Devam Status', 'staff-department': 'Departman Distribution', 'staff-roster': 'Daily Kadro List', 'staff-leave': 'İzin Takibi', 'staff-performance': 'Performance Değerlendirme', 'staff-certification': 'Sertifika Status', 'staff-onboarding': 'İşe Alım Süreci', 'staff-payroll-summary': 'Maaş Bordrosu Summary', 'staff-tip-report': 'Bahşiş Report', 'staff-uniform': 'Üniforma Takibi', 'staff-org-chart': 'Organizasyon Şeması', 'staff-workload-heatmap': 'İş Yükü Heatmap', 'staff-satisfaction-gauge': 'Staff Satisfaction', 'staff-cost-pie': 'İşçilik Cost Distribution', 'yield-rate-strategy': 'Price Strateji Performanceı', 'yield-demand-forecast': 'Talep Forecast', 'yield-compset': 'CompSet Analysis', 'yield-pickup': 'Pick-Up Report', 'yield-displacement': 'Displacement Analysis', 'yield-los-pattern': 'LOS Kalıbı', 'yield-dow-analysis': 'Gün Bazlı Analiz', 'yield-seasonal': 'Sezonsal Trend', 'yield-rate-shop': 'Rate Shopping Tablosu', 'yield-restrictions': 'Kısıtlama Report', 'yield-overrides': 'Manuel Price Override', 'yield-segment-mix': 'Segment Mix Optimal', 'yield-channel-margin': 'Channel Kar Marjı', 'yield-dynamic-pricing': 'Dinamik Pricelama Log', 'yield-benchmark': 'Benchmark KPI', 'yield-price-elasticity': 'Price Esneklik Chart', 'yield-demand-heatmap': 'Talep Heatmap', 'yield-optimal-rate': 'Optimal Price Gauge', 'yield-revenue-gauge': 'Revenue Potansiyel Gösterge', 'fin-pnl-chart': 'Kâr-Zarar Trend', 'fin-cashflow-chart': 'Nakit Akış Chart', 'fin-ar-aging': 'Alacak Yaşlandırma', 'fin-ap-aging': 'Borç Yaşlandırma', 'fin-expense-chart': 'Expense Kategori Trend', 'fin-payment-method': 'Ödeme Yöntemi Analysis', 'fin-tax-summary': 'Tax Özet Report', 'fin-budget-gauge': 'Bütçe Gerçekleşme Gauge', 'fin-cost-breakdown': 'Cost Kırılım Treemap', 'fin-ratio-radar': 'Finansal Oran Radar' },
        categoryLabels: { revenue: 'Revenue & Finance', occupancy: 'Occupancy & Rooms', guest: 'Guest & CRM', reservation: 'Reservation & Sales', operations: 'Operations', fnb: 'Food & Beverage', marketing: 'Marketing', staff: 'Staff & HR', yield: 'Yield Management', financial: 'Cost & Accounting' }, typeLabels: { chart: 'Chart', data: 'Data Table', graph: 'Advanced Graph' },
        reportsPage: {
            managementReports: 'Management Reports',
            financeReports: 'Finance Reports',
            purchasingReports: 'Purchasing Reports',
            hrReports: 'HR Reports',
            elektraSubtext: 'Live data with Elektra ERP integration'
            , next14DaysTotal: 'Next 14 Days Total', operator: 'Operator', operation: 'Operation', score: 'Score', last30Days: 'Last 30 Days', last12Weeks: 'Last 12 Weeks', unknown: 'Unknown', direct: 'Direct', agency: 'Agency', unspecified: 'Unspecified', other: 'Other', pctOfTotalRevenue: '% of Total Revenue', avg: 'Avg', cumulativeRevenuePace: 'Cumulative Revenue Pace', totalStr: 'Total', estimate: 'Estimate', salesByHourEst: 'Sales By Hour (Est)', taxRate: 'Tax Rate', estCommissionDist: 'Est. Commission Dist.'
        },
        reportTitle: 'Comprehensive Performance Report',
        totalRevenue: 'Total Revenue',
        totalReservations: 'Total Reservations',
        avgDailyRate: 'Avg. Daily Rate',
        avgBookingValue: 'Avg. Booking Value',
        roomNights: 'Room Nights',
        monthlyRevenue: 'Monthly Revenue',
        channelDistribution: 'Channel Distribution',
        topAgencies: 'Top Agencies',
        roomTypeAnalysis: 'Room Type Analysis',
        boardTypeAnalysis: 'Board Type Analysis',
        budgetAnalysis: 'Budget Analysis',
        bookingVelocity: 'Booking Velocity',
        occupancyRate: 'Occupancy Rate',
        roomOccupancy: 'Room Occupancy',
        adr: 'ADR (Avg. Daily Rate)',
        revpar: 'RevPAR',
        bedNightLabel: 'Bed Nights',
        roomRevenue: 'Room Revenue',
        monthLabel: 'Month',
        seasonLabel: 'Season',
        exchangeRateLabel: 'Ex. Rate:',
        avgNights: 'Avg. Length of Stay',
        guestNationality: 'Guest Country',
        overview: 'Overview',
        recordDate: 'Record Date',
        budget: 'Budget',
        agency: 'Agency',
        exportPDF: 'Export PDF',
        exportCSV: 'Export CSV',
        currency: 'Currency',
        dateRange: 'Date Range',
        startDate: 'Start',
        endDate: 'End',
        allTime: 'All Time',
        last7Days: 'Last 7 Days',
        last30Days: 'Last 30 Days',
        last90Days: 'Last 90 Days',
        last180Days: 'Last 180 Days',
        revenue: 'Revenue',
        count: 'Count',
        percentage: 'Share',
        channel: 'Channel',
        nights: 'Nights',
        avgStay: 'Avg. Stay',
        target: 'Target',
        variance: 'Variance',
        daily: 'Daily',
        weekly: 'Weekly',
        grossRevenue: 'Gross Revenue',
        netRevenue: 'Net Revenue',
        vatAndAccTax: 'VAT + Accommodation Tax',
        stayDate: 'Stay Date',
        reservationDate: 'Res. Date',
        stay: 'Stay',
        dailyAverage: 'Daily Avg',
        noData: 'No data found',
        loadingError: 'Error loading data',

        addWidget: 'Add Widget',
        removeWidget: 'Remove',
        editCriteria: 'Edit Criteria',
        saveCriteria: 'Save',
        cancelEdit: 'Cancel',
        aiInterpret: 'AI Interpret',
        aiLoading: 'AI analyzing...',
        dragHint: 'Drag to reorder',
        widgetSettings: 'Widget Settings',

        extraSales: 'Extra Sales',
        spaRevenue: 'Spa Revenue',
        minibarRevenue: 'Minibar Revenue',
        restaurantExtras: 'Restaurant Extras',
        category: 'Category',
        amount: 'Amount',
        date: 'Date',
        callCenterPerf: 'Call Center Performance',
        forecast: 'Forecast',
        operatorPerf: 'Operator Performance',

        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        add: 'Add',
        loading: 'Loading...',
        saving: 'Saving...',
        saved: 'Saved!',
        error: 'Error',
        success: 'Success',
        confirm: 'Are you sure?',

        yieldTitle: 'Yield Management',
        yieldSubtitle: 'Revenue management and pricing analysis',
        tabOverview: 'Overview',
        tabChannels: 'Channel Analysis',
        tabAgencies: 'Agency Analysis',
        tabPricing: 'Price Matrix',
        tabAi: 'AI Assessment',
        seasonHigh: 'High',
        seasonShoulder: 'Shoulder',
        seasonLow: 'Low',
        seasonOff: 'Off',
        refresh: 'Refresh',
        refreshing: 'Refreshing...',
        cacheEmpty: 'Cache empty',
        lastUpdate: 'Last update',
        stale: 'Stale',
        thisMonth: 'This Month',
        thisSeason: 'This Season',
        thisYear: 'This Year',
        custom: 'Custom',
        channelDist: 'Channel Distribution (Reservations)',
        channelRevenue: 'Revenue by Channel',
        agencyAnalysis: 'Agency & Country Analysis',
        priceVolumeMatrix: 'Price-Volume Matrix',
        periodAdrComparison: 'Period ADR Comparison',
        monthlyAdrRoomNight: 'Monthly ADR & Room Nights',
        aiPriceEval: 'AI Price Assessment',
        aiPriceDesc: 'Evaluate your pricing strategy with Gemini AI',
        startAnalysis: 'Start Analysis',
        analyzing: 'Analyzing...',
        totalRevLabel: 'Total Revenue',
        avgAdr: 'Average ADR',
        roomNightLabel: 'Room Nights',
        channelCount: 'Channel Count',
        avgStayNights: 'Avg. Stay',
        revenueShare: 'Revenue Share',
        roomNightShare: 'Room Night Share',
        vsLastYear: 'vs Last Year',
        monthNames: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        managementReports: {
            netReservations: 'Net Reservations',
            paceReport: 'YTD Pace Report',
            agencyReport: 'Agency Report',
            market: 'Agency',
            allMarkets: 'All Agencies',
            ytd: 'Year to Date (YTD)',
            allSeasons: 'All Seasons',
            clear: 'Clear',
            sendEmail: 'Send Email',
            aiInterpretGrouped: 'AI Assessment',
            total: 'Total',
            kpiSummary: 'Monthly KPI Summary',
            revenueShare: 'Revenue Share',
            comparison: 'Comparison',
            details: 'Details Table',
            resCount: 'Res. Count',
            sharePct: 'Share %',
            actual: 'Actual',
            remaining: 'Remaining',
            targetAdr: 'Target ADR',
            requiredRes: 'Required Res.',
            remainingRn: 'Remaining RN',
            groupRes: 'Group Res.',
            channelBudgetSplit: 'Channel Budget Split',
            budgetRealization: 'Budget Realization',
            ofTarget: 'of target'
        },
        presetToday: 'Today',
        presetYesterday: 'Yesterday',
        aiInterpretAll: 'Interpret All',
        aiInterpreted: 'Interpreted',
        aiInterpretingProgress: 'interpreting...',
        dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        monthNamesFull: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        unknown: 'Unknown',
        unspecified: 'Unspecified',
        other: 'Other',
        statisticsReports: 'Statistics Reports',
        allCategories: 'All Categories',
        totalRes: 'Total Res.',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        walkIn: 'Walk-in',
        direct: 'Direct',
        tourOperator: 'Tour Operator',
        onlineRes: 'Online Res.',
        upsellRevenue: 'Upsell Revenue',
        ancillaryRevenue: 'Ancillary Revenue',
        lateCheckout: 'Late Checkout Revenue',
        earlyCheckin: 'Early Check-in Revenue',
        spaWellness: 'Spa & Wellness',
        laundry: 'Laundry',
        parking: 'Parking',
        transferRevenue: 'Transfer',
        meetingRoomRevenue: 'Meeting Room',
        reception: 'Reception',
        resOffice: 'Reservations',
        nightAudit: 'Night Audit',
        localGuide: 'Local Guide',
        approve: 'Approve',
        reject: 'Remove',
        approved: 'Approved',
        pending: 'Pending',
        all: 'All',
        widgets: {
            next14DaysTotal: 'Next 14 Days Total', operator: 'Operator', operation: 'Operation', score: 'Score', last30Days: 'Last 30 Days', last12Weeks: 'Last 12 Weeks', unknown: 'Unknown', direct: 'Direct', agency: 'Agency', unspecified: 'Unspecified', other: 'Other', pctOfTotalRevenue: '% of Total Revenue', avg: 'Avg', cumulativeRevenuePace: 'Cumulative Revenue Pace', totalStr: 'Total', estimate: 'Estimate', salesByHourEst: 'Sales By Hour (Est)', taxRate: 'Tax Rate', estCommissionDist: 'Est. Commission Dist.',
            cancelCount: 'Cancellations',
            rate: 'rate',
            revenueImpact: 'Revenue Impact',
            loss: 'loss',
            todayRevenue: 'Today\'s Revenue',
            yesterdayRevenue: 'Yesterday\'s Revenue',
            change: 'change',
            thisWeek: 'This Week',
            avgPerDay: 'avg',
            perDay: '/day',
            outOfOrderRooms: 'Out of Order Rooms',
            totalRoomsPct: 'Of total rooms',
            availableRooms: 'Available',
            expectedOccupancy: 'Expected Occupancy',
            totalCommission: 'Total Commission',
            roomsSuffix: 'rooms',
            resSuffix: 'reservations',
            collectionRate: 'collection rate',
            occupancy: 'Occupancy'
        },
        bigDataPage: {
            tabs: { overview: 'Overview', revenue: 'Revenue Analysis', occupancy: 'Occupancy', channels: 'Channels & Agencies', guests: 'Guests & Demographics', booking: 'Booking Patterns', performance: 'Performance', forecast: 'Forecast & Pace', comparative: 'Comparative', rawdata: 'Raw Data' },
            header: { title: 'Big Data Analytics', reservations: 'reservations', countries: 'countries', lastUpdate: 'Last update:', liveApi: 'Live API', loadingData: 'Loading data...' },
            overview: { budgetRealization: 'Budget Realization', monthlyRevVsBudget: 'Monthly Revenue vs Budget', channelDist: 'Channel Distribution', adrTrendMonthly: 'ADR Trend (Monthly)', occupancyRate: 'Occupancy Rate', nationalityDist: 'Country Distribution', boardType: 'Board Type' },
            revenue: { title: '💰 Revenue Analytics — 10 Reports & Charts', seasonBudget: '📊 2026 Season Budget', target: 'Target:', actual: 'Actual:', realization: 'Realization', remaining: 'Remaining', excess: 'Excess', r1: 'R1: Daily Revenue Trend', r2: 'R2: Weekly Revenue', r3: 'R3: Monthly Revenue vs Budget (€)', r5: 'R5: Revenue Forecast (7-Day MA)', r6: 'R6: RevPAR Trend', r7: 'R7: ADR Trend', r8: 'R8: Currency Breakdown', r9: 'R9: Total vs Paid Revenue', r10: 'R10: Revenue Heatmap (Day×Month, ₺K)', tableTitle: 'Monthly Revenue & Budget Table' },
            occupancy: { title: '🛏️ Occupancy & Room Analysis — 8 Reports & Charts', r11: 'R11: Daily Occupancy Rate (%)', r12: 'R12: Occupancy Forecast', r13: 'R13: Room Type Distribution', r14: 'R14: Occupancy vs ADR Correlation', r15: 'R15: Occupancy Heatmap (Day×Month, %)', r16: 'R16: Weekday vs Weekend', r17: 'R17: Seasonal Comparison', r18: 'R18: Vacant Room Loss (₺)', avgNightsSuffix: 'nights avg.', tableTitle: 'Room Type Detail Table' },
            channels: { title: '📡 Channel & Agency Analysis — 7 Reports & Charts', r19: 'R19: Channel Distribution', r20: 'R20: Revenue Trend by Channel', r21: 'R21: ADR by Channel', r22: 'R22: Channel Performance Trend', r23: 'R23: OTA vs Direct', r25: 'R25: Channel Mix Change (%)', r24: 'R24: Agency Ranking (Top 30)', tableTitle: 'Channel Summary Table' },
            guests: { title: '🌍 Guest & Demographics Analysis — 7 Reports & Charts', r26: 'R26: Country Distribution', r27: 'R27: Revenue by Country (₺)', r28: 'R28: Avg. Stay by Country', r29: 'R29: Country Trend (Monthly)', r30: 'R30: Guest Segmentation', r31: 'R31: Country-Channel Matrix', r32: 'R32: Avg. Rate by Country', tableTitle: 'Country Detail Table' },
            booking: { title: '📋 Booking Patterns — 8 Reports & Charts', r33: 'R33: Booking Lead Time Distribution', r34: 'R34: Booking Day Analysis', r35: 'R35: Cancellation Rate (Monthly)', r36: 'R36: Avg. Length of Stay Trend', r37: 'R37: Room Count Distribution', r38: 'R38: Board Type Distribution', r39: 'R39: Room Type Preference', r40: 'R40: Length of Stay Distribution', leadTimeTable: 'Lead Time Detail Table', stayLengthTable: 'Length of Stay Detail' },
            performance: { title: '🎯 Performance Indicators — 8 Reports & Charts', r41: 'R41: GOPPAR (Gross Op. Profit / Room)', r42: 'R42: TRevPAR (Total Rev / Available Room)', r46: 'R46: Check-in Day Distribution', r47: 'R47: Price Segment Trend', r48: 'R48: Monthly Performance & Budget Index', r49: 'R49: Revenue Concentration (Pareto)', r50: 'R50: Rate Type Analysis', tableTitle: 'Rate Type Detail Table' },
            forecast: { title: '⚡ Forecast & Pace Report — 5 Reports & Charts', r5: 'R5: Revenue Forecast (MA-7)', r43: 'R43: Pace Report (This Year vs Last)', r44: 'R44: Pick-up Analysis (Daily New Res.)', r12: 'R12: Occupancy Forecast', seasonalComp: 'Seasonal Forecast Comparison' },
            comparative: { title: '📊 Comparative Reports — 5 Reports & Charts', r4: 'R4: Year-over-Year (YoY) Comparison', metric: 'Metric', thisSeason: 'This Season', lastSeason: 'Last Season', change: 'Change', paceComp: 'Pace: This Year vs Last', seasonalRevComp: 'Seasonal Revenue Comparison', channelAdrComp: 'ADR Comparison by Channel', roomTypeRevComp: 'Revenue Comparison by Room Type' },
            rawdata: { title: '🗄️ Raw Data & Tables', searchPlaceholder: 'Search (agency, country, voucher, room type)...', recordsSuffix: 'records', tableTitle: 'All Reservations' },
            tableCols: { month: 'Month', resCount: 'Res.', revenueYtl: 'Revenue (₺)', budgetEur: 'Budget (€)', actualEur: 'Actual (€)', remainingEur: 'Remaining (€)', percent: '%', adrYtl: 'ADR (₺)', roomType: 'Room Type', avgRate: 'Avg. Rate', avgNights: 'Avg. Stay', share: 'Share (%)', channel: 'Channel', agency: 'Agency', country: 'Country', avgRateYtl: 'Avg. Rate (₺)', durationRange: 'Duration Range', resCountLong: 'Res. Count', duration: 'Duration', realization: 'Realization', occupancyRate: 'Occupancy (%)', revparYtl: 'RevPAR (₺)', rateType: 'Rate Type', voucher: 'Voucher', boardType: 'Board', checkIn: 'Check In', checkOut: 'Check Out', nights: 'Nights', price: 'Price', currency: 'Currency', status: 'Status' }
        }
    },
    de: {
        navReports: 'Berichte & Analyse',
        navSales: 'Vertrieb & Marketing',
        navFinance: 'Finanzen & Beschaffung',
        navContent: 'Content Management',
        navOperations: 'Hotelbetrieb',
        navIntegrations: 'Integrationen',

        dashboard: 'Dashboard',
        reports: 'Berichte',
        reservations: 'Reservierungen',
        extras: 'Zusatzverkäufe',
        crm: 'CRM (Gästebetreuung)',
        marketing: 'Marketing',
        management: 'Management',
        operation: 'Betrieb',
        finance: 'Finanzen',
        roomPrices: 'Zimmerpreise',
        pages: 'Seiten',
        menu: 'Menü',
        media: 'Medien',
        localization: 'Lokalisierung',
        settings: 'Einstellungen',
        analytics: 'Analytics',
        blueConcierge: 'Blue Concierge',
        bookingEngine: 'Buchungsmaschine',
        rooms: 'Zimmer',
        dining: 'Restaurants',
        meeting: 'Tagung',
        activities: 'Aktivitäten',
        sportsAndActivities: 'Sport & Aktivitäten',
        aiTraining: 'AI Training',
        users: 'Benutzer',
        viewSite: 'Seite Ansehen',
        editingLang: 'Bearbeiten:',
        bigData: 'Big Data',
        accounting: 'Buchhaltung',
        purchasing: 'Einkauf',
        yieldManagement: 'Yield Management',
        socialMedia: 'Soziale Medien',
        contentCreator: 'Content Creator',
        reservationPerformance: 'Reservierungsleistung',
        live: 'Live',
        recentReservations: 'Letzte Reservierungen',
        viewAll: 'Alle ansehen',
        taskManagement: 'Aufgabenverwaltung',
        tasks: 'Aufgaben',
        workflows: 'Arbeitsabläufe',
        mailIntegration: 'E-Mail-Integration',
        createTask: 'Aufgabe erstellen',
        assignee: 'Zugewiesen',
        priority: 'Priorität',
        dueDate: 'Fälligkeitsdatum',
        mailIntegrationPage: {
            title: 'Mail-Integration',
            subtitle: 'E-Mails mit KI in Aufgaben umwandeln',
            connected: 'Verbunden',
            disconnected: 'Nicht verbunden',
            sync: 'Synchronisieren',
            syncing: 'Synchronisiere...',
            settings: 'Einstellungen',
            serverSettings: 'Mail-Server-Einstellungen',
            imapTitle: 'IMAP (Eingehend)',
            smtpTitle: 'SMTP (Ausgehend)',
            emailAddress: 'E-Mail-Adresse',
            username: 'Benutzername',
            password: 'Passwort',
            port: 'Port',
            emptySmtpDesc: 'Wenn leer, werden IMAP-Einstellungen verwendet',
            saveAndConnect: 'Speichern & Verbinden',
            cancelConnection: 'Verbindung trennen',
            lastSync: 'Letzte Synchronisation',
            inbox: 'Posteingang',
            new: 'neu',
            selectEmailDesc: 'Klicken Sie links auf eine E-Mail, um sie mit KI in eine Aufgabe umzuwandeln',
            configFirstDesc: 'Konfigurieren Sie zuerst die Mail-Server-Einstellungen',
            sender: 'Absender:',
            noContent: '(Kein Inhalt)',
            aiAnalyze: 'Mit KI in Aufgabe umwandeln',
            aiAnalyzing: 'KI analysiert...',
            aiSuggestion: 'KI-Aufgabenvorschlag',
            createAsTask: 'Als Aufgabe erstellen',
            creating: 'Wird erstellt...'
        },
        roomPricesPage: {
            title: 'Zimmerpreise & Verfügbarkeit',
            subtitle: 'Elektra PMS — Hotelweb & Call Center Kanäle',
            live: 'Live',
            pdfExporting: 'PDF...',
            pdf: 'PDF',
            bookingEngine: 'Buchungsmaschine',
            today: 'Heute',
            days7: '7 Tage',
            days30: '30 Tage',
            days60: '60 Tage',
            days90: '90 Tage',
            query: 'Abfragen',
            loading: 'Wird geladen...',
            roomTypes: 'Zimmertypen',
            queryRange: 'Abfragezeitraum',
            avgNightly: 'Ø pro Nacht',
            stopSale: 'Verkaufsstopp',
            sortLabel: 'Sortieren nach:',
            sortName: 'Name',
            sortPrice: 'Preis',
            sortAvailable: 'Verfügbarkeit',
            timelineTitle: 'Preis-Timeline — Nach Zimmertyp',
            timelineSubtitlePrefix: 'Hotelweb & Call Center Kanäle',
            dailyPriceTable: 'Tägliche Preistabelle',
            dateHeader: 'Datum',
            noPrice: 'Kein Preis',
            startingPrice: 'ab-Preis',
            availableLabel: 'Verfügbar',
            avgPriceLabel: 'Ø Preis',
            minPriceLabel: 'Min. Preis',
            occupancy: 'Belegung',
            bookNow: 'Jetzt buchen',
            days: 'Tage'
        },
        widgetTitles: { 'kpis': 'Total Revenue', 'monthly': 'Monthly Revenue', 'channels': 'Channel Distribution', 'roomTypes': 'Room Tipi Analysis', 'agencies': 'En İyi Agencylar', 'occupancy': 'Occupancy Rate', 'adr': 'ADR', 'country': 'Guest Nationalityi', 'velocity': 'Reservation Hızı', 'lengthOfStay': 'Ort. Konaklama', 'revpar': 'RevPAR', 'budget': 'Bütçe Analysis', 'callCenter': 'Call Center Performanceı', 'forecast': 'Gelecek Dönem Forecast', 'operator': 'Operatör Performanceı', 'rev-daily-chart': 'Daily Revenue Chart', 'rev-weekly-chart': 'Weekly Revenue Trend', 'rev-yoy-chart': 'Yearly Comparison', 'rev-roomtype-chart': 'Room by Type Revenue', 'rev-channel-chart': 'Channela Göre Revenue', 'rev-country-chart': 'Nationalitye Göre Revenue', 'rev-segment-chart': 'by Segment Revenue', 'rev-mealplan-chart': 'Pansiyon by Type Revenue', 'rev-pace-chart': 'Revenue Hızı (Pace)', 'rev-forecast-chart': 'Revenue Forecast', 'rev-cumulative-chart': 'Cumulative Revenue', 'rev-hourly-chart': 'Hourly Revenue Distribution', 'rev-tax-chart': 'KDV & Tax Distribution', 'rev-commission-chart': 'Commission Analysis', 'rev-refund-chart': 'Refund & Cancellation Revenue Etkisi', 'rev-daily-kpi': 'Daily Revenue KPI', 'rev-weekly-kpi': 'Weekly Revenue Summary', 'rev-monthly-kpi': 'Monthly Revenue Summary', 'rev-quarterly-kpi': 'Quarterly Revenue Analysis', 'rev-upsell': 'Upsell Revenueleri', 'rev-ancillary': 'Ancillary Revenueleri', 'rev-late-checkout': 'Late Checkout Revenuei', 'rev-early-checkin': 'Early Check-in Revenuei', 'rev-minibar': 'Minibar Revenueleri', 'rev-spa': 'Spa & Wellness Revenueleri', 'rev-laundry': 'Laundry Revenueleri', 'rev-parking': 'Otopark Revenueleri', 'rev-transfer': 'Transfer Revenueleri', 'rev-meeting-room': 'Meeting Salonu Revenueleri', 'rev-deposit': 'Deposit Status', 'rev-heatmap': 'Revenue Heatmap', 'rev-treemap': 'Revenue Treemap', 'rev-waterfall': 'Revenue Waterfall Chart', 'rev-scatter': 'Price/Occupancy Scatter', 'rev-gauge': 'Bütçe Gerçekleşme Gauge', 'rev-sparklines': 'Revenue Mini Trendler', 'rev-funnel': 'Revenue Funnel', 'rev-comparison-radar': 'Revenue Comparison Radar', 'occ-daily-chart': 'Daily Occupancy Chart', 'occ-monthly-chart': 'Monthly Occupancy Trend', 'occ-weekday-chart': 'Gün Bazlı Occupancy', 'occ-roomtype-chart': 'Room by Type Occupancy', 'occ-floor-chart': 'Kat Bazlı Occupancy', 'occ-forecast-chart': '14 Gün Occupancy Forecast', 'occ-yoy-chart': 'Occupancy YoY Comparison', 'occ-ooo-chart': 'Out of Order Room Trend', 'occ-upgrade-chart': 'Room Upgrade Analysis', 'occ-status-chart': 'Room Status Distribution', 'occ-category-mix': 'Room Kategori Mix', 'occ-rate-analysis': 'Room Price Analysis', 'occ-today-status': 'Bugünkü Room Status', 'occ-arrivals-today': 'Bugünkü Arrivals', 'occ-departures-today': 'Bugünkü Departures', 'occ-stayovers': 'Stayover Guestler', 'occ-no-shows': 'No-Show Report', 'occ-walkins': 'Walk-in Kayıtları', 'occ-vip-rooms': 'VIP Room Ataması', 'occ-connecting': 'Connecting Room Kullanımı', 'occ-housekeeping': 'Housekeeping Status', 'occ-maintenance': 'Bakım/Maintenance Logu', 'occ-inhouse-list': 'In-House Guest List', 'occ-early-late': 'Early Check-in / Late Checkout', 'occ-heatmap': 'Occupancy Heatmap', 'occ-floor-map': 'Kat Haritası Görünümü', 'occ-bubble': 'Occupancy Balon Chart', 'occ-gauge': 'Occupancy Gauge', 'occ-timeline': 'Room Occupancy Timeline', 'guest-country-pie': 'Country Distribution Pasta', 'guest-repeat-chart': 'Tekrar Guest Trend', 'guest-satisfaction-chart': 'Satisfaction Trend', 'guest-demographics-chart': 'Yaş & Cinsiyet Distribution', 'guest-spending-chart': 'Guest Spending Kalıbı', 'guest-los-chart': 'Konaklama Duration Distribution', 'guest-source-chart': 'Guest Kaynak Analysis', 'guest-loyalty-chart': 'Sadakat Programı İstatistik', 'guest-complaint-chart': 'Complaint Kategori Distribution', 'guest-review-chart': 'Online Review Trend', 'guest-vip-list': 'VIP Guest List', 'guest-repeat-list': 'Tekrar Gelen Guestler', 'guest-birthday': 'Doğum Günü Takvimi', 'guest-anniversary': 'Yıl Dönümü Report', 'guest-special-req': 'Özel İstek Analysis', 'guest-allergy': 'Alerji & Diyet Report', 'guest-blacklist': 'Kara Liste', 'guest-feedback-summary': 'Geri Bildirim Summary', 'guest-top-spenders': 'En Çok Harcayan Guestler', 'guest-country-revenue': 'Ülke Bazlı Revenue', 'guest-preferences': 'Guest Tercihleri', 'guest-communication': 'İletişim Logları', 'guest-world-map': 'Dünya Haritası Distribution', 'guest-satisfaction-radar': 'Satisfaction Radar', 'guest-journey-sankey': 'Guest Yolculuk Sankey', 'guest-segmentation-bubble': 'Segment Balon Chart', 'guest-retention-funnel': 'Guest Tutma Funnel', 'res-pace-chart': 'Booking Pace Report', 'res-leadtime-chart': 'Lead Time Analysis', 'res-cancel-chart': 'Cancellation Rate Trend', 'res-noshow-chart': 'No-Show Trend', 'res-channel-trend': 'Channel Bazlı Rez. Trend', 'res-daily-pickup': 'Daily Pick-Up', 'res-rate-code': 'Rate Code Performanceı', 'res-promo-chart': 'Promosyon Kodu Analysis', 'res-group-chart': 'Grup Rez. Summary', 'res-overbooking': 'Overbooking Analysis', 'res-modification': 'Rez. Değişiklik Trend', 'res-board-mix': 'Pansiyon Tipi Mix', 'res-today-arrivals': 'Bugünkü Arrivals Detay', 'res-today-departures': 'Bugünkü Departures Detay', 'res-pending': 'Bekleyen Reservationlar', 'res-confirmed': 'Onaylı Reservationlar', 'res-cancelled-list': 'Cancellation Edilen Rez. List', 'res-waitlist': 'Bekleme List', 'res-allotment': 'Allotment Kullanımı', 'res-agency-prod': 'Agency Üretim Report', 'res-source-mix': 'Kaynak Mix Tablosu', 'res-avg-rate': 'Ortalama Price Report', 'res-revenue-by-stay': 'Konaklama Bazlı Revenue', 'res-night-audit': 'Night Audit Summary', 'res-pace-waterfall': 'Booking Pace Waterfall', 'res-channel-sankey': 'Channel Akış Sankey', 'res-heatmap': 'Rez. Yoğunluk Haritası', 'res-funnel': 'Reservation Funnel', 'res-calendar': 'Takvim Görünümü', 'res-comparison-bar': 'Sezon Comparison Bar', 'ops-checkin-volume': 'Check-in Hacmi', 'ops-checkout-volume': 'Check-out Hacmi', 'ops-housekeeping-chart': 'HK Housekeeping Trend', 'ops-maintenance-chart': 'Maintenance Kategorileri', 'ops-request-chart': 'Guest İstek Trend', 'ops-response-time': 'Yanıt Duration Analysis', 'ops-energy-chart': 'Enerji Tüketimi', 'ops-water-chart': 'Su Tüketimi', 'ops-complaint-trend': 'Complaint Trend', 'ops-task-completion': 'Görev Tamamlama Rate', 'ops-mod-report': 'MOD Report', 'ops-night-audit-data': 'Night Audit Detay', 'ops-lost-found': 'Kayıp & Bulunmuş', 'ops-security-log': 'Güvenlik Logu', 'ops-incident': 'Olay Report', 'ops-pool-status': 'Havuz & Plaj Status', 'ops-parking': 'Otopark Occupancy', 'ops-laundry-stats': 'Laundry İstatistik', 'ops-minibar-track': 'Minibar Takibi', 'ops-shuttle-schedule': 'Transfer Programı', 'ops-amenity-usage': 'Amenity Kullanımı', 'ops-key-card': 'Kart Basımı İstatistik', 'ops-floor-heatmap': 'Kat Bazlı Heatmap', 'ops-timeline': 'Operasyon Timeline', 'ops-response-gauge': 'Yanıt Duration Gauge', 'ops-energy-gauge': 'Enerji Tüketim Gauge', 'ops-task-kanban': 'Görev Kanban Görünümü', 'fnb-restaurant-rev': 'Restoran Revenuei', 'fnb-bar-rev': 'Bar Revenuei', 'fnb-roomservice-chart': 'Room Servisi Trend', 'fnb-breakfast-count': 'Kahvaltı Sayacı', 'fnb-allinc-consumption': 'AI Tüketim Analysis', 'fnb-menu-popularity': 'Menü Popülerlik', 'fnb-food-cost': 'Gıda Cost Rate', 'fnb-beverage-cost': 'İçecek Cost Rate', 'fnb-cover-count': 'Cover Sayısı Trend', 'fnb-avg-check': 'Ortalama Hesap', 'fnb-daily-summary': 'F&B Daily Özet', 'fnb-waste-report': 'İsraf Report', 'fnb-stock-alert': 'Stok Uyarıları', 'fnb-recipe-cost': 'Reçete Costi', 'fnb-supplier-perf': 'Tedarikçi Performanceı', 'fnb-special-diet': 'Özel Diyet Report', 'fnb-banquet-rev': 'Ziyafet Revenueleri', 'fnb-outlet-compare': 'Outlet Comparison', 'fnb-happy-hour': 'Happy Hour Performanceı', 'fnb-inventory': 'F&B Envanter Status', 'fnb-treemap': 'F&B Revenue Treemap', 'fnb-cost-gauge': 'Cost Rate Gauge', 'fnb-popularity-bubble': 'Menü Popülerlik Balon', 'fnb-outlet-radar': 'Outlet Performance Radar', 'fnb-flow-sankey': 'F&B Akış Sankey', 'mkt-direct-vs-ota': 'Direkt vs OTA', 'mkt-website-conversion': 'Website Dönüşüm Rate', 'mkt-email-campaign': 'E-posta Campaign Perf.', 'mkt-social-engagement': 'Sosyal Medya Etkileşim', 'mkt-seo-ranking': 'SEO Sıralama Trend', 'mkt-ppc-roi': 'PPC Reklam ROI', 'mkt-review-scores': 'Review Puanları Trend', 'mkt-competitor-rate': 'Rakip Price Analysis', 'mkt-market-share': 'Pazar Payı', 'mkt-brand-awareness': 'Marka Bilinirliği', 'mkt-campaign-summary': 'Campaign Summary', 'mkt-promo-redemption': 'Promosyon Kullanım', 'mkt-referral': 'Referans Kaynak Analysis', 'mkt-review-list': 'Son Reviewlar List', 'mkt-meta-perf': 'Meta Search Performanceı', 'mkt-ota-ranking': 'OTA Sıralama Status', 'mkt-loyalty-stats': 'Sadakat Programı KPI', 'mkt-newsletter': 'Newsletter İstatistik', 'mkt-influencer': 'Influencer İşbirliği', 'mkt-content-perf': 'İçerik Performanceı', 'mkt-channel-funnel': 'Channel Funnel', 'mkt-attribution': 'Atıf Modeli Sankey', 'mkt-competitor-radar': 'Rakip Comparison Radar', 'mkt-roi-scatter': 'Campaign ROI Scatter', 'mkt-journey-flow': 'Guest Yolculuk Akışı', 'staff-schedule-chart': 'Vardiya Çizelgesi', 'staff-overtime-chart': 'Fazla Mesai Trend', 'staff-labor-cost': 'İşçilik Cost Trend', 'staff-productivity': 'Verimlilik Analysis', 'staff-turnover': 'Staff Devir Rate', 'staff-training': 'Eğitim Tamamlama', 'staff-attendance': 'Devam Status', 'staff-department': 'Departman Distribution', 'staff-roster': 'Daily Kadro List', 'staff-leave': 'İzin Takibi', 'staff-performance': 'Performance Değerlendirme', 'staff-certification': 'Sertifika Status', 'staff-onboarding': 'İşe Alım Süreci', 'staff-payroll-summary': 'Maaş Bordrosu Summary', 'staff-tip-report': 'Bahşiş Report', 'staff-uniform': 'Üniforma Takibi', 'staff-org-chart': 'Organizasyon Şeması', 'staff-workload-heatmap': 'İş Yükü Heatmap', 'staff-satisfaction-gauge': 'Staff Satisfaction', 'staff-cost-pie': 'İşçilik Cost Distribution', 'yield-rate-strategy': 'Price Strateji Performanceı', 'yield-demand-forecast': 'Talep Forecast', 'yield-compset': 'CompSet Analysis', 'yield-pickup': 'Pick-Up Report', 'yield-displacement': 'Displacement Analysis', 'yield-los-pattern': 'LOS Kalıbı', 'yield-dow-analysis': 'Gün Bazlı Analiz', 'yield-seasonal': 'Sezonsal Trend', 'yield-rate-shop': 'Rate Shopping Tablosu', 'yield-restrictions': 'Kısıtlama Report', 'yield-overrides': 'Manuel Price Override', 'yield-segment-mix': 'Segment Mix Optimal', 'yield-channel-margin': 'Channel Kar Marjı', 'yield-dynamic-pricing': 'Dinamik Pricelama Log', 'yield-benchmark': 'Benchmark KPI', 'yield-price-elasticity': 'Price Esneklik Chart', 'yield-demand-heatmap': 'Talep Heatmap', 'yield-optimal-rate': 'Optimal Price Gauge', 'yield-revenue-gauge': 'Revenue Potansiyel Gösterge', 'fin-pnl-chart': 'Kâr-Zarar Trend', 'fin-cashflow-chart': 'Nakit Akış Chart', 'fin-ar-aging': 'Alacak Yaşlandırma', 'fin-ap-aging': 'Borç Yaşlandırma', 'fin-expense-chart': 'Expense Kategori Trend', 'fin-payment-method': 'Ödeme Yöntemi Analysis', 'fin-tax-summary': 'Tax Özet Report', 'fin-budget-gauge': 'Bütçe Gerçekleşme Gauge', 'fin-cost-breakdown': 'Cost Kırılım Treemap', 'fin-ratio-radar': 'Finansal Oran Radar' },
        categoryLabels: { revenue: 'Umsatz & Finanzen', occupancy: 'Belegung & Zimmer', guest: 'Gast & CRM', reservation: 'Reservierung & Verkauf', operations: 'Betrieb', fnb: 'Gastronomie', marketing: 'Marketing', staff: 'Personal & HR', yield: 'Ertragsmanagement', financial: 'Kosten & Buchhaltung' }, typeLabels: { chart: 'Diagramm', data: 'Datentabelle', graph: 'Erweitertes Diagramm' },
        reportsPage: {
            managementReports: 'Management-Berichte',
            financeReports: 'Finanzberichte',
            purchasingReports: 'Einkaufsberichte',
            hrReports: 'HR-Berichte',
            elektraSubtext: 'Aktuelle Daten durch Elektra ERP-Integration'
            , next14DaysTotal: 'In den nächsten 14 Tagen', operator: 'Operator', operation: 'Betrieb', score: 'Ergebnis', last30Days: 'Letzte 30 Tage', last12Weeks: 'Letzte 12 Wochen', unknown: 'Unbekannt', direct: 'Direkt', agency: 'Agentur', unspecified: 'Nicht angegeben', other: 'Andere', pctOfTotalRevenue: '% vom Gesamtumsatz', avg: 'Durchschnitt', cumulativeRevenuePace: 'Kumuliertes Umsatztempo', totalStr: 'Gesamt', estimate: 'Schätzung', salesByHourEst: 'Umsatz pro Stunde (geschätzt)', taxRate: 'Steuersatz', estCommissionDist: 'Geschätzte Provisionsverteilung'
        },

        reportTitle: 'Umfassender Leistungsbericht',
        totalRevenue: 'Gesamtumsatz',
        totalReservations: 'Gesamte Reservierungen',
        avgDailyRate: 'Ø Tagesrate',
        avgBookingValue: 'Ø Buchungswert',
        roomNights: 'Zimmernächte',
        monthlyRevenue: 'Monatsumsatz',
        channelDistribution: 'Kanalverteilung',
        topAgencies: 'Top-Agenturen',
        roomTypeAnalysis: 'Zimmertypanalyse',
        boardTypeAnalysis: 'Verpflegungsanalyse',
        budgetAnalysis: 'Budgetanalyse',
        bookingVelocity: 'Buchungsgeschwindigkeit',
        occupancyRate: 'Auslastungsrate',
        roomOccupancy: 'Zimmerauslastung',
        adr: 'ADR (Ø Tagesrate)',
        revpar: 'RevPAR',
        bedNightLabel: 'Bettennächte',
        roomRevenue: 'Zimmerumsatz',
        monthLabel: 'Monat',
        seasonLabel: 'Saison',
        exchangeRateLabel: 'Wechselkurs:',
        avgNights: 'Ø Aufenthaltsdauer',
        guestNationality: 'Gästenationalität',
        overview: 'Übersicht',
        recordDate: 'Erfassungsdatum',
        budget: 'Budget',
        agency: 'Agentur',
        exportPDF: 'PDF Export',
        exportCSV: 'CSV Export',
        currency: 'Währung',
        dateRange: 'Zeitraum',
        startDate: 'Von',
        endDate: 'Bis',
        allTime: 'Gesamtzeitraum',
        last7Days: 'Letzte 7 Tage',
        last30Days: 'Letzte 30 Tage',
        last90Days: 'Letzte 90 Tage',
        last180Days: 'Letzte 180 Tage',
        revenue: 'Umsatz',
        count: 'Anzahl',
        percentage: 'Anteil',
        channel: 'Kanal',
        nights: 'Nächte',
        avgStay: 'Ø Aufenthalt',
        target: 'Ziel',
        variance: 'Abweichung',
        daily: 'Täglich',
        weekly: 'Wöchentlich',
        grossRevenue: 'Bruttoumsatz',
        netRevenue: 'Nettoumsatz',
        vatAndAccTax: 'MwSt. + Übernachtungssteuer',
        stayDate: 'Aufenthaltsdatum',
        reservationDate: 'Res.-Datum',
        stay: 'Aufenthalt',
        dailyAverage: 'Täglicher Ø',
        noData: 'Keine Daten gefunden',
        loadingError: 'Fehler beim Laden der Daten',

        addWidget: 'Widget Hinzufügen',
        removeWidget: 'Entfernen',
        editCriteria: 'Kriterien Bearbeiten',
        saveCriteria: 'Speichern',
        cancelEdit: 'Abbrechen',
        aiInterpret: 'AI Interpretation',
        aiLoading: 'AI analysiert...',
        dragHint: 'Ziehen zum Neuordnen',
        widgetSettings: 'Widget-Einstellungen',

        extraSales: 'Zusatzverkäufe',
        spaRevenue: 'Spa-Umsatz',
        minibarRevenue: 'Minibar-Umsatz',
        restaurantExtras: 'Restaurant-Extras',
        category: 'Kategorie',
        amount: 'Betrag',
        date: 'Datum',
        callCenterPerf: 'Call Center Leistung',
        forecast: 'Prognose',
        operatorPerf: 'Operator Leistung',

        save: 'Speichern',
        cancel: 'Abbrechen',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        add: 'Hinzufügen',
        loading: 'Laden...',
        saving: 'Speichern...',
        saved: 'Gespeichert!',
        error: 'Fehler',
        success: 'Erfolg',
        confirm: 'Sind Sie sicher?',

        yieldTitle: 'Yield Management',
        yieldSubtitle: 'Ertragsmanagement und Preisanalyse',
        tabOverview: 'Übersicht',
        tabChannels: 'Kanalanalyse',
        tabAgencies: 'Agenturanalyse',
        tabPricing: 'Preismatrix',
        tabAi: 'AI Bewertung',
        seasonHigh: 'Hoch',
        seasonShoulder: 'Übergang',
        seasonLow: 'Niedrig',
        seasonOff: 'Geschlossen',
        refresh: 'Aktualisieren',
        refreshing: 'Aktualisierung...',
        cacheEmpty: 'Cache leer',
        lastUpdate: 'Letzte Aktualisierung',
        stale: 'Veraltet',
        thisMonth: 'Dieser Monat',
        thisSeason: 'Diese Saison',
        thisYear: 'Dieses Jahr',
        custom: 'Benutzerdefiniert',
        channelDist: 'Kanalverteilung (Reservierungen)',
        channelRevenue: 'Umsatz nach Kanal',
        agencyAnalysis: 'Agentur- & Länderanalyse',
        priceVolumeMatrix: 'Preis-Volumen-Matrix',
        periodAdrComparison: 'ADR-Vergleich nach Zeitraum',
        monthlyAdrRoomNight: 'Monatliche ADR & Zimmernächte',
        aiPriceEval: 'AI Preisbewertung',
        aiPriceDesc: 'Bewerten Sie Ihre Preisstrategie mit Gemini AI',
        startAnalysis: 'Analyse starten',
        analyzing: 'Analyse läuft...',
        totalRevLabel: 'Gesamtumsatz',
        avgAdr: 'Durchschnittliche ADR',
        roomNightLabel: 'Zimmernächte',
        channelCount: 'Kanalanzahl',
        avgStayNights: 'Ø Aufenthalt',
        revenueShare: 'Umsatzanteil',
        roomNightShare: 'Zimmernächteanteil',
        vsLastYear: 'gg. Vorjahr',
        monthNames: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        managementReports: {
            netReservations: 'Netto Reservierungen',
            paceReport: 'YTD Pace Bericht',
            agencyReport: 'Agenturbericht',
            market: 'Agentur',
            allMarkets: 'Alle Agenturen',
            ytd: 'Bisher in diesem Jahr (YTD)',
            allSeasons: 'Alle Saisons',
            clear: 'Löschen',
            sendEmail: 'E-Mail Senden',
            aiInterpretGrouped: 'AI Bewertung',
            total: 'Gesamt',
            kpiSummary: 'Monatliche KPI-Zusammenfassung',
            revenueShare: 'Umsatzanteil',
            comparison: 'Vergleich',
            details: 'Detailtabelle',
            resCount: 'Res. Anzahl',
            sharePct: 'Anteil %',
            actual: 'Ist',
            remaining: 'Verbleibend',
            targetAdr: 'Ziel-ADR',
            requiredRes: 'Erforderliche Res.',
            remainingRn: 'Verbleibende RN',
            groupRes: 'Gruppenres.',
            channelBudgetSplit: 'Kanalbudget-Verteilung',
            budgetRealization: 'Budget-Realisierung',
            ofTarget: 'vom Ziel'
        },
        presetToday: 'Heute',
        presetYesterday: 'Gestern',
        aiInterpretAll: 'Alle Interpretieren',
        aiInterpreted: 'Interpretiert',
        aiInterpretingProgress: 'wird interpretiert...',
        dayNames: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
        monthNamesFull: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        unknown: 'Unbekannt',
        unspecified: 'Nicht angegeben',
        other: 'Sonstige',
        statisticsReports: 'Statistikberichte',
        allCategories: 'Alle Kategorien',
        totalRes: 'Gesamt Res.',
        confirmed: 'Bestätigt',
        cancelled: 'Storniert',
        walkIn: 'Walk-in',
        direct: 'Direkt',
        tourOperator: 'Reiseveranstalter',
        onlineRes: 'Online Res.',
        upsellRevenue: 'Upselling-Umsatz',
        ancillaryRevenue: 'Nebenerlöse',
        lateCheckout: 'Spätabreise-Umsatz',
        earlyCheckin: 'Frühanreise-Umsatz',
        spaWellness: 'Spa & Wellness',
        laundry: 'Wäscherei',
        parking: 'Parkplatz',
        transferRevenue: 'Transfer',
        meetingRoomRevenue: 'Tagungsraum',
        reception: 'Rezeption',
        resOffice: 'Reservierung',
        nightAudit: 'Nachtauditor',
        localGuide: 'Reiseführer',
        approve: 'Genehmigen',
        reject: 'Entfernen',
        approved: 'Genehmigt',
        pending: 'Ausstehend',
        all: 'Alle',
        widgets: {
            next14DaysTotal: 'Next 14 Days Total', operator: 'Operator', operation: 'Operation', score: 'Score', last30Days: 'Last 30 Days', last12Weeks: 'Last 12 Weeks', unknown: 'Unknown', direct: 'Direct', agency: 'Agency', unspecified: 'Unspecified', other: 'Other', pctOfTotalRevenue: '% of Total Revenue', avg: 'Avg', cumulativeRevenuePace: 'Cumulative Revenue Pace', totalStr: 'Total', estimate: 'Estimate', salesByHourEst: 'Sales By Hour (Est)', taxRate: 'Tax Rate', estCommissionDist: 'Est. Commission Dist.',
            cancelCount: 'Stornierungen',
            rate: 'Rate',
            revenueImpact: 'Umsatzauswirkung',
            loss: 'Verlust',
            todayRevenue: 'Heutiger Umsatz',
            yesterdayRevenue: 'Gestriger Umsatz',
            change: 'Änderung',
            thisWeek: 'Diese Woche',
            avgPerDay: 'durchschnittlich',
            perDay: '/Tag',
            outOfOrderRooms: 'Defekte Zimmer',
            totalRoomsPct: 'Von der Gesamtzahl',
            availableRooms: 'Verfügbar',
            expectedOccupancy: 'Erwartete Belegung',
            totalCommission: 'Gesamtprovision',
            roomsSuffix: 'Zimmer',
            resSuffix: 'Reservierungen',
            collectionRate: 'Einziehungsquote',
            occupancy: 'Belegung'
        },
        bigDataPage: {
            tabs: { overview: 'Overview', revenue: 'Revenue Analysis', occupancy: 'Occupancy', channels: 'Channels & Agencies', guests: 'Guests & Demographics', booking: 'Booking Patterns', performance: 'Performance', forecast: 'Forecast & Pace', comparative: 'Comparative', rawdata: 'Raw Data' },
            header: { title: 'Big Data Analytics', reservations: 'reservations', countries: 'countries', lastUpdate: 'Last update:', liveApi: 'Live API', loadingData: 'Loading data...' },
            overview: { budgetRealization: 'Budget Realization', monthlyRevVsBudget: 'Monthly Revenue vs Budget', channelDist: 'Channel Distribution', adrTrendMonthly: 'ADR Trend (Monthly)', occupancyRate: 'Occupancy Rate', nationalityDist: 'Country Distribution', boardType: 'Board Type' },
            revenue: { title: '💰 Revenue Analytics — 10 Reports & Charts', seasonBudget: '📊 2026 Season Budget', target: 'Target:', actual: 'Actual:', realization: 'Realization', remaining: 'Remaining', excess: 'Excess', r1: 'R1: Daily Revenue Trend', r2: 'R2: Weekly Revenue', r3: 'R3: Monthly Revenue vs Budget (€)', r5: 'R5: Revenue Forecast (7-Day MA)', r6: 'R6: RevPAR Trend', r7: 'R7: ADR Trend', r8: 'R8: Currency Breakdown', r9: 'R9: Total vs Paid Revenue', r10: 'R10: Revenue Heatmap (Day×Month, ₺K)', tableTitle: 'Monthly Revenue & Budget Table' },
            occupancy: { title: '🛏️ Occupancy & Room Analysis — 8 Reports & Charts', r11: 'R11: Daily Occupancy Rate (%)', r12: 'R12: Occupancy Forecast', r13: 'R13: Room Type Distribution', r14: 'R14: Occupancy vs ADR Correlation', r15: 'R15: Occupancy Heatmap (Day×Month, %)', r16: 'R16: Weekday vs Weekend', r17: 'R17: Seasonal Comparison', r18: 'R18: Vacant Room Loss (₺)', avgNightsSuffix: 'nights avg.', tableTitle: 'Room Type Detail Table' },
            channels: { title: '📡 Channel & Agency Analysis — 7 Reports & Charts', r19: 'R19: Channel Distribution', r20: 'R20: Revenue Trend by Channel', r21: 'R21: ADR by Channel', r22: 'R22: Channel Performance Trend', r23: 'R23: OTA vs Direct', r25: 'R25: Channel Mix Change (%)', r24: 'R24: Agency Ranking (Top 30)', tableTitle: 'Channel Summary Table' },
            guests: { title: '🌍 Guest & Demographics Analysis — 7 Reports & Charts', r26: 'R26: Country Distribution', r27: 'R27: Revenue by Country (₺)', r28: 'R28: Avg. Stay by Country', r29: 'R29: Country Trend (Monthly)', r30: 'R30: Guest Segmentation', r31: 'R31: Country-Channel Matrix', r32: 'R32: Avg. Rate by Country', tableTitle: 'Country Detail Table' },
            booking: { title: '📋 Booking Patterns — 8 Reports & Charts', r33: 'R33: Booking Lead Time Distribution', r34: 'R34: Booking Day Analysis', r35: 'R35: Cancellation Rate (Monthly)', r36: 'R36: Avg. Length of Stay Trend', r37: 'R37: Room Count Distribution', r38: 'R38: Board Type Distribution', r39: 'R39: Room Type Preference', r40: 'R40: Length of Stay Distribution', leadTimeTable: 'Lead Time Detail Table', stayLengthTable: 'Length of Stay Detail' },
            performance: { title: '🎯 Performance Indicators — 8 Reports & Charts', r41: 'R41: GOPPAR (Gross Op. Profit / Room)', r42: 'R42: TRevPAR (Total Rev / Available Room)', r46: 'R46: Check-in Day Distribution', r47: 'R47: Price Segment Trend', r48: 'R48: Monthly Performance & Budget Index', r49: 'R49: Revenue Concentration (Pareto)', r50: 'R50: Rate Type Analysis', tableTitle: 'Rate Type Detail Table' },
            forecast: { title: '⚡ Forecast & Pace Report — 5 Reports & Charts', r5: 'R5: Revenue Forecast (MA-7)', r43: 'R43: Pace Report (This Year vs Last)', r44: 'R44: Pick-up Analysis (Daily New Res.)', r12: 'R12: Occupancy Forecast', seasonalComp: 'Seasonal Forecast Comparison' },
            comparative: { title: '📊 Comparative Reports — 5 Reports & Charts', r4: 'R4: Year-over-Year (YoY) Comparison', metric: 'Metric', thisSeason: 'This Season', lastSeason: 'Last Season', change: 'Change', paceComp: 'Pace: This Year vs Last', seasonalRevComp: 'Seasonal Revenue Comparison', channelAdrComp: 'ADR Comparison by Channel', roomTypeRevComp: 'Revenue Comparison by Room Type' },
            rawdata: { title: '🗄️ Raw Data & Tables', searchPlaceholder: 'Search (agency, country, voucher, room type)...', recordsSuffix: 'records', tableTitle: 'All Reservations' },
            tableCols: { month: 'Month', resCount: 'Res.', revenueYtl: 'Revenue (₺)', budgetEur: 'Budget (€)', actualEur: 'Actual (€)', remainingEur: 'Remaining (€)', percent: '%', adrYtl: 'ADR (₺)', roomType: 'Room Type', avgRate: 'Avg. Rate', avgNights: 'Avg. Stay', share: 'Share (%)', channel: 'Channel', agency: 'Agency', country: 'Country', avgRateYtl: 'Avg. Rate (₺)', durationRange: 'Duration Range', resCountLong: 'Res. Count', duration: 'Duration', realization: 'Realization', occupancyRate: 'Occupancy (%)', revparYtl: 'RevPAR (₺)', rateType: 'Rate Type', voucher: 'Voucher', boardType: 'Board', checkIn: 'Check In', checkOut: 'Check Out', nights: 'Nights', price: 'Price', currency: 'Currency', status: 'Status' }
        }
    },
    ru: {
        navReports: 'Отчеты & Аналитика',
        navSales: 'Продажи & Маркетинг',
        navFinance: 'Финансы & Закупки',
        navContent: 'Управление Контентом',
        navOperations: 'Операции Отеля',
        navIntegrations: 'Интеграции',

        dashboard: 'Панель',
        reports: 'Отчёты',
        reservations: 'Бронирования',
        extras: 'Допродажи',
        crm: 'CRM (Отзывы)',
        marketing: 'Маркетинг',
        management: 'Управление',
        operation: 'Операции',
        finance: 'Финансы',
        roomPrices: 'Цены Номеров',
        pages: 'Страницы',
        menu: 'Меню',
        media: 'Медиа',
        localization: 'Локализация',
        settings: 'Настройки',
        analytics: 'Аналитика',
        blueConcierge: 'Blue Concierge',
        bookingEngine: 'Модуль бронирования',
        rooms: 'Номера',
        dining: 'Рестораны',
        meeting: 'Конференции',
        activities: 'Активности',
        sportsAndActivities: 'Спорт & Мероприятия',
        aiTraining: 'AI Обучение',
        users: 'Пользователи',
        viewSite: 'Просмотр Сайта',
        editingLang: 'Редактирование:',
        bigData: 'Big Data',
        accounting: 'Бухгалтерия',
        purchasing: 'Закупки',
        yieldManagement: 'Yield Management',
        socialMedia: 'Социальные сети',
        contentCreator: 'Создатель контента',
        reservationPerformance: 'Эффективность бронирования',
        live: 'В эфире',
        recentReservations: 'Последние бронирования',
        viewAll: 'Смотреть все',
        taskManagement: 'Управление задачами',
        tasks: 'Задачи',
        workflows: 'Рабочие процессы',
        mailIntegration: 'Интеграция почты',
        createTask: 'Создать задачу',
        assignee: 'Исполнитель',
        priority: 'Приоритет',
        dueDate: 'Срок выполнения',
        mailIntegrationPage: {
            title: 'Интеграция почты',
            subtitle: 'Преобразование писем в задачи с помощью ИИ',
            connected: 'Подключено',
            disconnected: 'Не подключено',
            sync: 'Синхронизировать',
            syncing: 'Синхронизация...',
            settings: 'Настройки',
            serverSettings: 'Настройки почтового сервера',
            imapTitle: 'IMAP (Входящие)',
            smtpTitle: 'SMTP (Исходящие)',
            emailAddress: 'Адрес электронной почты',
            username: 'Имя пользователя',
            password: 'Пароль',
            port: 'Порт',
            emptySmtpDesc: 'Если пусто, используются настройки IMAP',
            saveAndConnect: 'Сохранить и подключить',
            cancelConnection: 'Отключить',
            lastSync: 'Последняя синхронизация',
            inbox: 'Входящие',
            new: '새로운',
            selectEmailDesc: 'Нажмите на письмо слева, чтобы преобразовать его в задачу с помощью ИИ',
            configFirstDesc: 'Сначала настройте почтовый сервер',
            sender: 'Отправитель:',
            noContent: '(Нет содержимого)',
            aiAnalyze: 'Преобразовать в задачу с помощью ИИ',
            aiAnalyzing: 'ИИ анализирует...',
            aiSuggestion: 'Предложение задачи от ИИ',
            createAsTask: 'Создать как задачу',
            creating: 'Создание...'
        },
        roomPricesPage: {
            title: 'Цены на номера и наличие',
            subtitle: 'Elektra PMS — каналы Hotelweb и Call Center',
            live: 'Live',
            pdfExporting: 'PDF...',
            pdf: 'PDF',
            bookingEngine: 'Модуль бронирования',
            today: 'Сегодня',
            days7: '7 дней',
            days30: '30 дней',
            days60: '60 дней',
            days90: '90 дней',
            query: 'Запрос',
            loading: 'Загрузка...',
            roomTypes: 'Типы номеров',
            queryRange: 'Диапазон',
            avgNightly: 'Ср. за ночь',
            stopSale: 'Остановка продаж',
            sortLabel: 'Сортировка:',
            sortName: 'Название',
            sortPrice: 'Цена',
            sortAvailable: 'Наличие',
            timelineTitle: 'Динамика цен — По типам',
            timelineSubtitlePrefix: 'Каналы Hotelweb и Call Center',
            dailyPriceTable: 'Таблица цен',
            dateHeader: 'Дата',
            noPrice: 'Нет цены',
            startingPrice: 'начальная цена',
            availableLabel: 'Доступно',
            avgPriceLabel: 'Ср. цена',
            minPriceLabel: 'Мин. цена',
            occupancy: 'Занятость',
            bookNow: 'Забронировать',
            days: 'дней'
        },
        widgetTitles: { 'kpis': 'Total Revenue', 'monthly': 'Monthly Revenue', 'channels': 'Channel Distribution', 'roomTypes': 'Room Tipi Analysis', 'agencies': 'En İyi Agencylar', 'occupancy': 'Occupancy Rate', 'adr': 'ADR', 'country': 'Guest Nationalityi', 'velocity': 'Reservation Hızı', 'lengthOfStay': 'Ort. Konaklama', 'revpar': 'RevPAR', 'budget': 'Bütçe Analysis', 'callCenter': 'Call Center Performanceı', 'forecast': 'Gelecek Dönem Forecast', 'operator': 'Operatör Performanceı', 'rev-daily-chart': 'Daily Revenue Chart', 'rev-weekly-chart': 'Weekly Revenue Trend', 'rev-yoy-chart': 'Yearly Comparison', 'rev-roomtype-chart': 'Room by Type Revenue', 'rev-channel-chart': 'Channela Göre Revenue', 'rev-country-chart': 'Nationalitye Göre Revenue', 'rev-segment-chart': 'by Segment Revenue', 'rev-mealplan-chart': 'Pansiyon by Type Revenue', 'rev-pace-chart': 'Revenue Hızı (Pace)', 'rev-forecast-chart': 'Revenue Forecast', 'rev-cumulative-chart': 'Cumulative Revenue', 'rev-hourly-chart': 'Hourly Revenue Distribution', 'rev-tax-chart': 'KDV & Tax Distribution', 'rev-commission-chart': 'Commission Analysis', 'rev-refund-chart': 'Refund & Cancellation Revenue Etkisi', 'rev-daily-kpi': 'Daily Revenue KPI', 'rev-weekly-kpi': 'Weekly Revenue Summary', 'rev-monthly-kpi': 'Monthly Revenue Summary', 'rev-quarterly-kpi': 'Quarterly Revenue Analysis', 'rev-upsell': 'Upsell Revenueleri', 'rev-ancillary': 'Ancillary Revenueleri', 'rev-late-checkout': 'Late Checkout Revenuei', 'rev-early-checkin': 'Early Check-in Revenuei', 'rev-minibar': 'Minibar Revenueleri', 'rev-spa': 'Spa & Wellness Revenueleri', 'rev-laundry': 'Laundry Revenueleri', 'rev-parking': 'Otopark Revenueleri', 'rev-transfer': 'Transfer Revenueleri', 'rev-meeting-room': 'Meeting Salonu Revenueleri', 'rev-deposit': 'Deposit Status', 'rev-heatmap': 'Revenue Heatmap', 'rev-treemap': 'Revenue Treemap', 'rev-waterfall': 'Revenue Waterfall Chart', 'rev-scatter': 'Price/Occupancy Scatter', 'rev-gauge': 'Bütçe Gerçekleşme Gauge', 'rev-sparklines': 'Revenue Mini Trendler', 'rev-funnel': 'Revenue Funnel', 'rev-comparison-radar': 'Revenue Comparison Radar', 'occ-daily-chart': 'Daily Occupancy Chart', 'occ-monthly-chart': 'Monthly Occupancy Trend', 'occ-weekday-chart': 'Gün Bazlı Occupancy', 'occ-roomtype-chart': 'Room by Type Occupancy', 'occ-floor-chart': 'Kat Bazlı Occupancy', 'occ-forecast-chart': '14 Gün Occupancy Forecast', 'occ-yoy-chart': 'Occupancy YoY Comparison', 'occ-ooo-chart': 'Out of Order Room Trend', 'occ-upgrade-chart': 'Room Upgrade Analysis', 'occ-status-chart': 'Room Status Distribution', 'occ-category-mix': 'Room Kategori Mix', 'occ-rate-analysis': 'Room Price Analysis', 'occ-today-status': 'Bugünkü Room Status', 'occ-arrivals-today': 'Bugünkü Arrivals', 'occ-departures-today': 'Bugünkü Departures', 'occ-stayovers': 'Stayover Guestler', 'occ-no-shows': 'No-Show Report', 'occ-walkins': 'Walk-in Kayıtları', 'occ-vip-rooms': 'VIP Room Ataması', 'occ-connecting': 'Connecting Room Kullanımı', 'occ-housekeeping': 'Housekeeping Status', 'occ-maintenance': 'Bakım/Maintenance Logu', 'occ-inhouse-list': 'In-House Guest List', 'occ-early-late': 'Early Check-in / Late Checkout', 'occ-heatmap': 'Occupancy Heatmap', 'occ-floor-map': 'Kat Haritası Görünümü', 'occ-bubble': 'Occupancy Balon Chart', 'occ-gauge': 'Occupancy Gauge', 'occ-timeline': 'Room Occupancy Timeline', 'guest-country-pie': 'Country Distribution Pasta', 'guest-repeat-chart': 'Tekrar Guest Trend', 'guest-satisfaction-chart': 'Satisfaction Trend', 'guest-demographics-chart': 'Yaş & Cinsiyet Distribution', 'guest-spending-chart': 'Guest Spending Kalıbı', 'guest-los-chart': 'Konaklama Duration Distribution', 'guest-source-chart': 'Guest Kaynak Analysis', 'guest-loyalty-chart': 'Sadakat Programı İstatistik', 'guest-complaint-chart': 'Complaint Kategori Distribution', 'guest-review-chart': 'Online Review Trend', 'guest-vip-list': 'VIP Guest List', 'guest-repeat-list': 'Tekrar Gelen Guestler', 'guest-birthday': 'Doğum Günü Takvimi', 'guest-anniversary': 'Yıl Dönümü Report', 'guest-special-req': 'Özel İstek Analysis', 'guest-allergy': 'Alerji & Diyet Report', 'guest-blacklist': 'Kara Liste', 'guest-feedback-summary': 'Geri Bildirim Summary', 'guest-top-spenders': 'En Çok Harcayan Guestler', 'guest-country-revenue': 'Ülke Bazlı Revenue', 'guest-preferences': 'Guest Tercihleri', 'guest-communication': 'İletişim Logları', 'guest-world-map': 'Dünya Haritası Distribution', 'guest-satisfaction-radar': 'Satisfaction Radar', 'guest-journey-sankey': 'Guest Yolculuk Sankey', 'guest-segmentation-bubble': 'Segment Balon Chart', 'guest-retention-funnel': 'Guest Tutma Funnel', 'res-pace-chart': 'Booking Pace Report', 'res-leadtime-chart': 'Lead Time Analysis', 'res-cancel-chart': 'Cancellation Rate Trend', 'res-noshow-chart': 'No-Show Trend', 'res-channel-trend': 'Channel Bazlı Rez. Trend', 'res-daily-pickup': 'Daily Pick-Up', 'res-rate-code': 'Rate Code Performanceı', 'res-promo-chart': 'Promosyon Kodu Analysis', 'res-group-chart': 'Grup Rez. Summary', 'res-overbooking': 'Overbooking Analysis', 'res-modification': 'Rez. Değişiklik Trend', 'res-board-mix': 'Pansiyon Tipi Mix', 'res-today-arrivals': 'Bugünkü Arrivals Detay', 'res-today-departures': 'Bugünkü Departures Detay', 'res-pending': 'Bekleyen Reservationlar', 'res-confirmed': 'Onaylı Reservationlar', 'res-cancelled-list': 'Cancellation Edilen Rez. List', 'res-waitlist': 'Bekleme List', 'res-allotment': 'Allotment Kullanımı', 'res-agency-prod': 'Agency Üretim Report', 'res-source-mix': 'Kaynak Mix Tablosu', 'res-avg-rate': 'Ortalama Price Report', 'res-revenue-by-stay': 'Konaklama Bazlı Revenue', 'res-night-audit': 'Night Audit Summary', 'res-pace-waterfall': 'Booking Pace Waterfall', 'res-channel-sankey': 'Channel Akış Sankey', 'res-heatmap': 'Rez. Yoğunluk Haritası', 'res-funnel': 'Reservation Funnel', 'res-calendar': 'Takvim Görünümü', 'res-comparison-bar': 'Sezon Comparison Bar', 'ops-checkin-volume': 'Check-in Hacmi', 'ops-checkout-volume': 'Check-out Hacmi', 'ops-housekeeping-chart': 'HK Housekeeping Trend', 'ops-maintenance-chart': 'Maintenance Kategorileri', 'ops-request-chart': 'Guest İstek Trend', 'ops-response-time': 'Yanıt Duration Analysis', 'ops-energy-chart': 'Enerji Tüketimi', 'ops-water-chart': 'Su Tüketimi', 'ops-complaint-trend': 'Complaint Trend', 'ops-task-completion': 'Görev Tamamlama Rate', 'ops-mod-report': 'MOD Report', 'ops-night-audit-data': 'Night Audit Detay', 'ops-lost-found': 'Kayıp & Bulunmuş', 'ops-security-log': 'Güvenlik Logu', 'ops-incident': 'Olay Report', 'ops-pool-status': 'Havuz & Plaj Status', 'ops-parking': 'Otopark Occupancy', 'ops-laundry-stats': 'Laundry İstatistik', 'ops-minibar-track': 'Minibar Takibi', 'ops-shuttle-schedule': 'Transfer Programı', 'ops-amenity-usage': 'Amenity Kullanımı', 'ops-key-card': 'Kart Basımı İstatistik', 'ops-floor-heatmap': 'Kat Bazlı Heatmap', 'ops-timeline': 'Operasyon Timeline', 'ops-response-gauge': 'Yanıt Duration Gauge', 'ops-energy-gauge': 'Enerji Tüketim Gauge', 'ops-task-kanban': 'Görev Kanban Görünümü', 'fnb-restaurant-rev': 'Restoran Revenuei', 'fnb-bar-rev': 'Bar Revenuei', 'fnb-roomservice-chart': 'Room Servisi Trend', 'fnb-breakfast-count': 'Kahvaltı Sayacı', 'fnb-allinc-consumption': 'AI Tüketim Analysis', 'fnb-menu-popularity': 'Menü Popülerlik', 'fnb-food-cost': 'Gıda Cost Rate', 'fnb-beverage-cost': 'İçecek Cost Rate', 'fnb-cover-count': 'Cover Sayısı Trend', 'fnb-avg-check': 'Ortalama Hesap', 'fnb-daily-summary': 'F&B Daily Özet', 'fnb-waste-report': 'İsraf Report', 'fnb-stock-alert': 'Stok Uyarıları', 'fnb-recipe-cost': 'Reçete Costi', 'fnb-supplier-perf': 'Tedarikçi Performanceı', 'fnb-special-diet': 'Özel Diyet Report', 'fnb-banquet-rev': 'Ziyafet Revenueleri', 'fnb-outlet-compare': 'Outlet Comparison', 'fnb-happy-hour': 'Happy Hour Performanceı', 'fnb-inventory': 'F&B Envanter Status', 'fnb-treemap': 'F&B Revenue Treemap', 'fnb-cost-gauge': 'Cost Rate Gauge', 'fnb-popularity-bubble': 'Menü Popülerlik Balon', 'fnb-outlet-radar': 'Outlet Performance Radar', 'fnb-flow-sankey': 'F&B Akış Sankey', 'mkt-direct-vs-ota': 'Direkt vs OTA', 'mkt-website-conversion': 'Website Dönüşüm Rate', 'mkt-email-campaign': 'E-posta Campaign Perf.', 'mkt-social-engagement': 'Sosyal Medya Etkileşim', 'mkt-seo-ranking': 'SEO Sıralama Trend', 'mkt-ppc-roi': 'PPC Reklam ROI', 'mkt-review-scores': 'Review Puanları Trend', 'mkt-competitor-rate': 'Rakip Price Analysis', 'mkt-market-share': 'Pazar Payı', 'mkt-brand-awareness': 'Marka Bilinirliği', 'mkt-campaign-summary': 'Campaign Summary', 'mkt-promo-redemption': 'Promosyon Kullanım', 'mkt-referral': 'Referans Kaynak Analysis', 'mkt-review-list': 'Son Reviewlar List', 'mkt-meta-perf': 'Meta Search Performanceı', 'mkt-ota-ranking': 'OTA Sıralama Status', 'mkt-loyalty-stats': 'Sadakat Programı KPI', 'mkt-newsletter': 'Newsletter İstatistik', 'mkt-influencer': 'Influencer İşbirliği', 'mkt-content-perf': 'İçerik Performanceı', 'mkt-channel-funnel': 'Channel Funnel', 'mkt-attribution': 'Atıf Modeli Sankey', 'mkt-competitor-radar': 'Rakip Comparison Radar', 'mkt-roi-scatter': 'Campaign ROI Scatter', 'mkt-journey-flow': 'Guest Yolculuk Akışı', 'staff-schedule-chart': 'Vardiya Çizelgesi', 'staff-overtime-chart': 'Fazla Mesai Trend', 'staff-labor-cost': 'İşçilik Cost Trend', 'staff-productivity': 'Verimlilik Analysis', 'staff-turnover': 'Staff Devir Rate', 'staff-training': 'Eğitim Tamamlama', 'staff-attendance': 'Devam Status', 'staff-department': 'Departman Distribution', 'staff-roster': 'Daily Kadro List', 'staff-leave': 'İzin Takibi', 'staff-performance': 'Performance Değerlendirme', 'staff-certification': 'Sertifika Status', 'staff-onboarding': 'İşe Alım Süreci', 'staff-payroll-summary': 'Maaş Bordrosu Summary', 'staff-tip-report': 'Bahşiş Report', 'staff-uniform': 'Üniforma Takibi', 'staff-org-chart': 'Organizasyon Şeması', 'staff-workload-heatmap': 'İş Yükü Heatmap', 'staff-satisfaction-gauge': 'Staff Satisfaction', 'staff-cost-pie': 'İşçilik Cost Distribution', 'yield-rate-strategy': 'Price Strateji Performanceı', 'yield-demand-forecast': 'Talep Forecast', 'yield-compset': 'CompSet Analysis', 'yield-pickup': 'Pick-Up Report', 'yield-displacement': 'Displacement Analysis', 'yield-los-pattern': 'LOS Kalıbı', 'yield-dow-analysis': 'Gün Bazlı Analiz', 'yield-seasonal': 'Sezonsal Trend', 'yield-rate-shop': 'Rate Shopping Tablosu', 'yield-restrictions': 'Kısıtlama Report', 'yield-overrides': 'Manuel Price Override', 'yield-segment-mix': 'Segment Mix Optimal', 'yield-channel-margin': 'Channel Kar Marjı', 'yield-dynamic-pricing': 'Dinamik Pricelama Log', 'yield-benchmark': 'Benchmark KPI', 'yield-price-elasticity': 'Price Esneklik Chart', 'yield-demand-heatmap': 'Talep Heatmap', 'yield-optimal-rate': 'Optimal Price Gauge', 'yield-revenue-gauge': 'Revenue Potansiyel Gösterge', 'fin-pnl-chart': 'Kâr-Zarar Trend', 'fin-cashflow-chart': 'Nakit Akış Chart', 'fin-ar-aging': 'Alacak Yaşlandırma', 'fin-ap-aging': 'Borç Yaşlandırma', 'fin-expense-chart': 'Expense Kategori Trend', 'fin-payment-method': 'Ödeme Yöntemi Analysis', 'fin-tax-summary': 'Tax Özet Report', 'fin-budget-gauge': 'Bütçe Gerçekleşme Gauge', 'fin-cost-breakdown': 'Cost Kırılım Treemap', 'fin-ratio-radar': 'Finansal Oran Radar' },
        categoryLabels: { revenue: 'Доход и Финансы', occupancy: 'Заполняемость и Номера', guest: 'Гость и CRM', reservation: 'Бронирование и Продажи', operations: 'Операции', fnb: 'Еда и Напитки', marketing: 'Маркетинг', staff: 'Персонал', yield: 'Управление доходами', financial: 'Затраты и Учет' }, typeLabels: { chart: 'График', data: 'Таблица данных', graph: 'Расширенный график' },
        reportsPage: {
            managementReports: 'Управленческие Отчеты',
            financeReports: 'Финансовые Отчеты',
            purchasingReports: 'Отчеты по Закупкам',
            hrReports: 'Кадровые Отчеты',
            elektraSubtext: 'Актуальные данные благодаря интеграции с Elektra ERP'
            , next14DaysTotal: 'Всего за следующие 14 дней', operator: 'Оператор', operation: 'Операция', score: 'Оценка', last30Days: 'Последние 30 дней', last12Weeks: 'Последние 12 недель', unknown: 'Неизвестно', direct: 'Прямой', agency: 'Агентство', unspecified: 'Не указано', other: 'Другое', pctOfTotalRevenue: '% от общего дохода', avg: 'Среднее', cumulativeRevenuePace: 'Совокупный темп доходов', totalStr: 'Итого', estimate: 'Оценка', salesByHourEst: 'Продажи по часам (оценка)', taxRate: 'Налоговая ставка', estCommissionDist: 'Расчетное распределение комиссий'
        },

        reportTitle: 'Комплексный отчет об эффективности',
        totalRevenue: 'Общий Доход',
        totalReservations: 'Всего Бронирований',
        avgDailyRate: 'Ср. Дневная Ставка',
        avgBookingValue: 'Ср. Стоимость Брони',
        roomNights: 'Номеро-ночи',
        monthlyRevenue: 'Месячный Доход',
        channelDistribution: 'Распределение по Каналам',
        topAgencies: 'Лучшие Агентства',
        roomTypeAnalysis: 'Анализ Типов Номеров',
        boardTypeAnalysis: 'Анализ Типов Питания',
        budgetAnalysis: 'Анализ Бюджета',
        bookingVelocity: 'Скорость Бронирований',
        occupancyRate: 'Загрузка',
        roomOccupancy: 'Загрузка Номеров',
        adr: 'ADR (Ср. Дневная Ставка)',
        revpar: 'RevPAR',
        bedNightLabel: 'Место-ночи',
        roomRevenue: 'Отельный Доход',
        monthLabel: 'Месяц',
        seasonLabel: 'Сезон',
        exchangeRateLabel: 'Курс:',
        avgNights: 'Ср. Пребывание (ночей)',
        guestNationality: 'Национальность Гостей',
        overview: 'Обзор',
        recordDate: 'Дата Записи',
        budget: 'Бюджет',
        agency: 'Агентство',
        exportPDF: 'Экспорт PDF',
        exportCSV: 'Экспорт CSV',
        currency: 'Валюта',
        dateRange: 'Период',
        startDate: 'Начало',
        endDate: 'Конец',
        allTime: 'Весь Период',
        last7Days: 'Последние 7 Дней',
        last30Days: 'Последние 30 Дней',
        last90Days: 'Последние 90 Дней',
        last180Days: 'Последние 180 Дней',
        revenue: 'Доход',
        count: 'Количество',
        percentage: 'Доля',
        channel: 'Канал',
        nights: 'Ночи',
        avgStay: 'Ср. Пребывание',
        target: 'Цель',
        variance: 'Отклонение',
        daily: 'Ежедневно',
        weekly: 'Еженедельно',
        grossRevenue: 'Валовой доход',
        netRevenue: 'Чистый доход',
        vatAndAccTax: 'НДС + Налог на проживание',
        stayDate: 'Дата проживания',
        reservationDate: 'Дата бронирования',
        stay: 'Проживание',
        dailyAverage: 'Среднее за день',
        noData: 'Данные не найдены',
        loadingError: 'Ошибка загрузки данных',

        addWidget: 'Добавить Виджет',
        removeWidget: 'Удалить',
        editCriteria: 'Изменить Критерии',
        saveCriteria: 'Сохранить',
        cancelEdit: 'Отмена',
        aiInterpret: 'AI Анализ',
        aiLoading: 'AI анализирует...',
        dragHint: 'Перетащите для сортировки',
        widgetSettings: 'Настройки Виджета',

        extraSales: 'Допродажи',
        spaRevenue: 'Доход Спа',
        minibarRevenue: 'Доход Минибара',
        restaurantExtras: 'Ресторанные Допродажи',
        category: 'Категория',
        amount: 'Сумма',
        date: 'Дата',
        callCenterPerf: 'Call Center',
        forecast: 'Прогноз',
        operatorPerf: 'Операторы',

        save: 'Сохранить',
        cancel: 'Отмена',
        delete: 'Удалить',
        edit: 'Редактировать',
        add: 'Добавить',
        loading: 'Загрузка...',
        saving: 'Сохранение...',
        saved: 'Сохранено!',
        error: 'Ошибка',
        success: 'Успешно',
        confirm: 'Вы уверены?',

        yieldTitle: 'Yield Management',
        yieldSubtitle: 'Управление доходами и анализ цен',
        tabOverview: 'Обзор',
        tabChannels: 'Анализ каналов',
        tabAgencies: 'Анализ агентств',
        tabPricing: 'Матрица цен',
        tabAi: 'Оценка AI',
        seasonHigh: 'Высокий',
        seasonShoulder: 'Переходный',
        seasonLow: 'Низкий',
        seasonOff: 'Закрыто',
        refresh: 'Обновить',
        refreshing: 'Обновление...',
        cacheEmpty: 'Кэш пуст',
        lastUpdate: 'Последнее обновление',
        stale: 'Устарело',
        thisMonth: 'Этот месяц',
        thisSeason: 'Этот сезон',
        thisYear: 'Этот год',
        custom: 'Произвольный',
        channelDist: 'Распределение по каналам (бронирования)',
        channelRevenue: 'Доход по каналам',
        agencyAnalysis: 'Анализ агентств и стран',
        priceVolumeMatrix: 'Матрица цена-объём',
        periodAdrComparison: 'Сравнение ADR по периодам',
        monthlyAdrRoomNight: 'Ежемесячный ADR и номеро-ночи',
        aiPriceEval: 'AI Оценка цен',
        aiPriceDesc: 'Оцените стратегию ценообразования с помощью Gemini AI',
        startAnalysis: 'Начать анализ',
        analyzing: 'Анализируем...',
        totalRevLabel: 'Общий доход',
        avgAdr: 'Средняя ADR',
        roomNightLabel: 'Номеро-ночи',
        channelCount: 'Кол-во каналов',
        avgStayNights: 'Ср. пребывание',
        revenueShare: 'Доля дохода',
        roomNightShare: 'Доля номеро-ночей',
        vsLastYear: 'г/г изменение',
        monthNames: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
        managementReports: {
            netReservations: 'Чистые Бронирования',
            paceReport: 'YTD Pace Отчет',
            agencyReport: 'Отчет по Агентствам',
            market: 'Агентство',
            allMarkets: 'Все Агентства',
            ytd: 'С начала года (YTD)',
            allSeasons: 'Все Сезоны',
            clear: 'Очистить',
            sendEmail: 'Отправить Email',
            aiInterpretGrouped: 'AI Оценка',
            total: 'Итого',
            kpiSummary: 'Месячная KPI Сводка',
            revenueShare: 'Доля Дохода',
            comparison: 'Сравнение',
            details: 'Детальная Таблица',
            resCount: 'Кол-во Броней',
            sharePct: 'Доля %',
            actual: 'Факт',
            remaining: 'Остаток',
            targetAdr: 'Целевой ADR',
            requiredRes: 'Требуемые брони',
            remainingRn: 'Остаток Ночей',
            groupRes: 'Груп. Брони',
            channelBudgetSplit: 'Распределение Бюджета По Каналам',
            budgetRealization: 'Реализация Бюджета',
            ofTarget: 'от цели'
        },
        presetToday: 'Сегодня',
        presetYesterday: 'Вчера',
        aiInterpretAll: 'Интерпретировать Все',
        aiInterpreted: 'Интерпретировано',
        aiInterpretingProgress: 'интерпретация...',
        dayNames: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        monthNamesFull: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        unknown: 'Неизвестно',
        unspecified: 'Не указано',
        other: 'Прочее',
        statisticsReports: 'Статистические отчёты',
        allCategories: 'Все категории',
        totalRes: 'Общ. Бронь',
        confirmed: 'Подтверждённые',
        cancelled: 'Отменённые',
        walkIn: 'Walk-in',
        direct: 'Прямые',
        tourOperator: 'Туроператор',
        onlineRes: 'Онлайн Бронь',
        upsellRevenue: 'Доход от Апселлов',
        ancillaryRevenue: 'Доп. услуги',
        lateCheckout: 'Поздний выезд',
        earlyCheckin: 'Ранний заезд',
        spaWellness: 'Спа и Велнес',
        laundry: 'Прачечная',
        parking: 'Парковка',
        transferRevenue: 'Трансфер',
        meetingRoomRevenue: 'Конференц-зал',
        reception: 'Ресепшн',
        resOffice: 'Бронирование',
        nightAudit: 'Ночной аудитор',
        localGuide: 'Путеводитель',
        approve: 'Одобрить',
        reject: 'Удалить',
        approved: 'Одобрено',
        pending: 'Ожидание',
        all: 'Все',
        widgets: {
            next14DaysTotal: 'Next 14 Days Total', operator: 'Operator', operation: 'Operation', score: 'Score', last30Days: 'Last 30 Days', last12Weeks: 'Last 12 Weeks', unknown: 'Unknown', direct: 'Direct', agency: 'Agency', unspecified: 'Unspecified', other: 'Other', pctOfTotalRevenue: '% of Total Revenue', avg: 'Avg', cumulativeRevenuePace: 'Cumulative Revenue Pace', totalStr: 'Total', estimate: 'Estimate', salesByHourEst: 'Sales By Hour (Est)', taxRate: 'Tax Rate', estCommissionDist: 'Est. Commission Dist.',
            cancelCount: 'Отмены',
            rate: 'рейт',
            revenueImpact: 'Влияние на доход',
            loss: 'убыток',
            todayRevenue: 'Доход сегодня',
            yesterdayRevenue: 'Доход вчера',
            change: 'изменение',
            thisWeek: 'Эта неделя',
            avgPerDay: 'в среднем',
            perDay: '/день',
            outOfOrderRooms: 'Номера не в порядке',
            totalRoomsPct: 'От общего числа номеров',
            availableRooms: 'Доступно',
            expectedOccupancy: 'Ожидаемая загрузка',
            totalCommission: 'Общая комиссия',
            roomsSuffix: 'номера',
            resSuffix: 'бронирования',
            collectionRate: 'коэффициент сбора',
            occupancy: 'Загрузка'
        },
        bigDataPage: {
            tabs: { overview: 'Overview', revenue: 'Revenue Analysis', occupancy: 'Occupancy', channels: 'Channels & Agencies', guests: 'Guests & Demographics', booking: 'Booking Patterns', performance: 'Performance', forecast: 'Forecast & Pace', comparative: 'Comparative', rawdata: 'Raw Data' },
            header: { title: 'Big Data Analytics', reservations: 'reservations', countries: 'countries', lastUpdate: 'Last update:', liveApi: 'Live API', loadingData: 'Loading data...' },
            overview: { budgetRealization: 'Budget Realization', monthlyRevVsBudget: 'Monthly Revenue vs Budget', channelDist: 'Channel Distribution', adrTrendMonthly: 'ADR Trend (Monthly)', occupancyRate: 'Occupancy Rate', nationalityDist: 'Country Distribution', boardType: 'Board Type' },
            revenue: { title: '💰 Revenue Analytics — 10 Reports & Charts', seasonBudget: '📊 2026 Season Budget', target: 'Target:', actual: 'Actual:', realization: 'Realization', remaining: 'Remaining', excess: 'Excess', r1: 'R1: Daily Revenue Trend', r2: 'R2: Weekly Revenue', r3: 'R3: Monthly Revenue vs Budget (€)', r5: 'R5: Revenue Forecast (7-Day MA)', r6: 'R6: RevPAR Trend', r7: 'R7: ADR Trend', r8: 'R8: Currency Breakdown', r9: 'R9: Total vs Paid Revenue', r10: 'R10: Revenue Heatmap (Day×Month, ₺K)', tableTitle: 'Monthly Revenue & Budget Table' },
            occupancy: { title: '🛏️ Occupancy & Room Analysis — 8 Reports & Charts', r11: 'R11: Daily Occupancy Rate (%)', r12: 'R12: Occupancy Forecast', r13: 'R13: Room Type Distribution', r14: 'R14: Occupancy vs ADR Correlation', r15: 'R15: Occupancy Heatmap (Day×Month, %)', r16: 'R16: Weekday vs Weekend', r17: 'R17: Seasonal Comparison', r18: 'R18: Vacant Room Loss (₺)', avgNightsSuffix: 'nights avg.', tableTitle: 'Room Type Detail Table' },
            channels: { title: '📡 Channel & Agency Analysis — 7 Reports & Charts', r19: 'R19: Channel Distribution', r20: 'R20: Revenue Trend by Channel', r21: 'R21: ADR by Channel', r22: 'R22: Channel Performance Trend', r23: 'R23: OTA vs Direct', r25: 'R25: Channel Mix Change (%)', r24: 'R24: Agency Ranking (Top 30)', tableTitle: 'Channel Summary Table' },
            guests: { title: '🌍 Guest & Demographics Analysis — 7 Reports & Charts', r26: 'R26: Country Distribution', r27: 'R27: Revenue by Country (₺)', r28: 'R28: Avg. Stay by Country', r29: 'R29: Country Trend (Monthly)', r30: 'R30: Guest Segmentation', r31: 'R31: Country-Channel Matrix', r32: 'R32: Avg. Rate by Country', tableTitle: 'Country Detail Table' },
            booking: { title: '📋 Booking Patterns — 8 Reports & Charts', r33: 'R33: Booking Lead Time Distribution', r34: 'R34: Booking Day Analysis', r35: 'R35: Cancellation Rate (Monthly)', r36: 'R36: Avg. Length of Stay Trend', r37: 'R37: Room Count Distribution', r38: 'R38: Board Type Distribution', r39: 'R39: Room Type Preference', r40: 'R40: Length of Stay Distribution', leadTimeTable: 'Lead Time Detail Table', stayLengthTable: 'Length of Stay Detail' },
            performance: { title: '🎯 Performance Indicators — 8 Reports & Charts', r41: 'R41: GOPPAR (Gross Op. Profit / Room)', r42: 'R42: TRevPAR (Total Rev / Available Room)', r46: 'R46: Check-in Day Distribution', r47: 'R47: Price Segment Trend', r48: 'R48: Monthly Performance & Budget Index', r49: 'R49: Revenue Concentration (Pareto)', r50: 'R50: Rate Type Analysis', tableTitle: 'Rate Type Detail Table' },
            forecast: { title: '⚡ Forecast & Pace Report — 5 Reports & Charts', r5: 'R5: Revenue Forecast (MA-7)', r43: 'R43: Pace Report (This Year vs Last)', r44: 'R44: Pick-up Analysis (Daily New Res.)', r12: 'R12: Occupancy Forecast', seasonalComp: 'Seasonal Forecast Comparison' },
            comparative: { title: '📊 Comparative Reports — 5 Reports & Charts', r4: 'R4: Year-over-Year (YoY) Comparison', metric: 'Metric', thisSeason: 'This Season', lastSeason: 'Last Season', change: 'Change', paceComp: 'Pace: This Year vs Last', seasonalRevComp: 'Seasonal Revenue Comparison', channelAdrComp: 'ADR Comparison by Channel', roomTypeRevComp: 'Revenue Comparison by Room Type' },
            rawdata: { title: '🗄️ Raw Data & Tables', searchPlaceholder: 'Search (agency, country, voucher, room type)...', recordsSuffix: 'records', tableTitle: 'All Reservations' },
            tableCols: { month: 'Month', resCount: 'Res.', revenueYtl: 'Revenue (₺)', budgetEur: 'Budget (€)', actualEur: 'Actual (€)', remainingEur: 'Remaining (€)', percent: '%', adrYtl: 'ADR (₺)', roomType: 'Room Type', avgRate: 'Avg. Rate', avgNights: 'Avg. Stay', share: 'Share (%)', channel: 'Channel', agency: 'Agency', country: 'Country', avgRateYtl: 'Avg. Rate (₺)', durationRange: 'Duration Range', resCountLong: 'Res. Count', duration: 'Duration', realization: 'Realization', occupancyRate: 'Occupancy (%)', revparYtl: 'RevPAR (₺)', rateType: 'Rate Type', voucher: 'Voucher', boardType: 'Board', checkIn: 'Check In', checkOut: 'Check Out', nights: 'Nights', price: 'Price', currency: 'Currency', status: 'Status' }
        }
    },
}

export interface AdminTranslations {
    _?: (text: string) => string;
    navReports: string
    navSales: string
    navFinance: string
    navContent: string
    navOperations: string
    navIntegrations: string
    dashboard: string
    reports: string
    reservations: string
    extras: string
    crm: string
    marketing: string
    management: string
    operation: string
    finance: string
    roomPrices: string
    pages: string
    menu: string
    media: string
    settings: string
    analytics: string
    blueConcierge: string
    bookingEngine: string
    rooms: string
    dining: string
    meeting: string
    activities: string
    sportsAndActivities: string
    aiTraining: string
    users: string
    viewSite: string
    editingLang: string
    bigData: string
    accounting: string
    purchasing: string
    yieldManagement: string
    socialMedia: string
    contentCreator: string
    reservationPerformance: string
    live: string
    recentReservations: string
    viewAll: string
    // Task Management
    taskManagement: string
    tasks: string
    workflows: string
    mailIntegration: string
    createTask: string
    assignee: string
    priority: string
    dueDate: string
    mailIntegrationPage: {
        title: string
        subtitle: string
        connected: string
        disconnected: string
        sync: string
        syncing: string
        settings: string
        serverSettings: string
        imapTitle: string
        smtpTitle: string
        emailAddress: string
        username: string
        password: string
        port: string
        emptySmtpDesc: string
        saveAndConnect: string
        cancelConnection: string
        lastSync: string
        inbox: string
        new: string
        selectEmailDesc: string
        configFirstDesc: string
        sender: string
        noContent: string
        aiAnalyze: string
        aiAnalyzing: string
        aiSuggestion: string
        createAsTask: string
        creating: string
    }
    roomPricesPage: {
        title: string
        subtitle: string
        live: string
        pdfExporting: string
        pdf: string
        bookingEngine: string
        today: string
        days7: string
        days30: string
        days60: string
        days90: string
        query: string
        loading: string
        roomTypes: string
        queryRange: string
        avgNightly: string
        stopSale: string
        sortLabel: string
        sortName: string
        sortPrice: string
        sortAvailable: string
        timelineTitle: string
        timelineSubtitlePrefix: string
        dailyPriceTable: string
        dateHeader: string
        noPrice: string
        startingPrice: string
        availableLabel: string
        avgPriceLabel: string
        minPriceLabel: string
        occupancy: string
        bookNow: string
        days: string
    }
    widgetTitles: { 'kpis': string; 'monthly': string; 'channels': string; 'roomTypes': string; 'agencies': string; 'occupancy': string; 'adr': string; 'country': string; 'velocity': string; 'lengthOfStay': string; 'revpar': string; 'budget': string; 'callCenter': string; 'forecast': string; 'operator': string; 'rev-daily-chart': string; 'rev-weekly-chart': string; 'rev-yoy-chart': string; 'rev-roomtype-chart': string; 'rev-channel-chart': string; 'rev-country-chart': string; 'rev-segment-chart': string; 'rev-mealplan-chart': string; 'rev-pace-chart': string; 'rev-forecast-chart': string; 'rev-cumulative-chart': string; 'rev-hourly-chart': string; 'rev-tax-chart': string; 'rev-commission-chart': string; 'rev-refund-chart': string; 'rev-daily-kpi': string; 'rev-weekly-kpi': string; 'rev-monthly-kpi': string; 'rev-quarterly-kpi': string; 'rev-upsell': string; 'rev-ancillary': string; 'rev-late-checkout': string; 'rev-early-checkin': string; 'rev-minibar': string; 'rev-spa': string; 'rev-laundry': string; 'rev-parking': string; 'rev-transfer': string; 'rev-meeting-room': string; 'rev-deposit': string; 'rev-heatmap': string; 'rev-treemap': string; 'rev-waterfall': string; 'rev-scatter': string; 'rev-gauge': string; 'rev-sparklines': string; 'rev-funnel': string; 'rev-comparison-radar': string; 'occ-daily-chart': string; 'occ-monthly-chart': string; 'occ-weekday-chart': string; 'occ-roomtype-chart': string; 'occ-floor-chart': string; 'occ-forecast-chart': string; 'occ-yoy-chart': string; 'occ-ooo-chart': string; 'occ-upgrade-chart': string; 'occ-status-chart': string; 'occ-category-mix': string; 'occ-rate-analysis': string; 'occ-today-status': string; 'occ-arrivals-today': string; 'occ-departures-today': string; 'occ-stayovers': string; 'occ-no-shows': string; 'occ-walkins': string; 'occ-vip-rooms': string; 'occ-connecting': string; 'occ-housekeeping': string; 'occ-maintenance': string; 'occ-inhouse-list': string; 'occ-early-late': string; 'occ-heatmap': string; 'occ-floor-map': string; 'occ-bubble': string; 'occ-gauge': string; 'occ-timeline': string; 'guest-country-pie': string; 'guest-repeat-chart': string; 'guest-satisfaction-chart': string; 'guest-demographics-chart': string; 'guest-spending-chart': string; 'guest-los-chart': string; 'guest-source-chart': string; 'guest-loyalty-chart': string; 'guest-complaint-chart': string; 'guest-review-chart': string; 'guest-vip-list': string; 'guest-repeat-list': string; 'guest-birthday': string; 'guest-anniversary': string; 'guest-special-req': string; 'guest-allergy': string; 'guest-blacklist': string; 'guest-feedback-summary': string; 'guest-top-spenders': string; 'guest-country-revenue': string; 'guest-preferences': string; 'guest-communication': string; 'guest-world-map': string; 'guest-satisfaction-radar': string; 'guest-journey-sankey': string; 'guest-segmentation-bubble': string; 'guest-retention-funnel': string; 'res-pace-chart': string; 'res-leadtime-chart': string; 'res-cancel-chart': string; 'res-noshow-chart': string; 'res-channel-trend': string; 'res-daily-pickup': string; 'res-rate-code': string; 'res-promo-chart': string; 'res-group-chart': string; 'res-overbooking': string; 'res-modification': string; 'res-board-mix': string; 'res-today-arrivals': string; 'res-today-departures': string; 'res-pending': string; 'res-confirmed': string; 'res-cancelled-list': string; 'res-waitlist': string; 'res-allotment': string; 'res-agency-prod': string; 'res-source-mix': string; 'res-avg-rate': string; 'res-revenue-by-stay': string; 'res-night-audit': string; 'res-pace-waterfall': string; 'res-channel-sankey': string; 'res-heatmap': string; 'res-funnel': string; 'res-calendar': string; 'res-comparison-bar': string; 'ops-checkin-volume': string; 'ops-checkout-volume': string; 'ops-housekeeping-chart': string; 'ops-maintenance-chart': string; 'ops-request-chart': string; 'ops-response-time': string; 'ops-energy-chart': string; 'ops-water-chart': string; 'ops-complaint-trend': string; 'ops-task-completion': string; 'ops-mod-report': string; 'ops-night-audit-data': string; 'ops-lost-found': string; 'ops-security-log': string; 'ops-incident': string; 'ops-pool-status': string; 'ops-parking': string; 'ops-laundry-stats': string; 'ops-minibar-track': string; 'ops-shuttle-schedule': string; 'ops-amenity-usage': string; 'ops-key-card': string; 'ops-floor-heatmap': string; 'ops-timeline': string; 'ops-response-gauge': string; 'ops-energy-gauge': string; 'ops-task-kanban': string; 'fnb-restaurant-rev': string; 'fnb-bar-rev': string; 'fnb-roomservice-chart': string; 'fnb-breakfast-count': string; 'fnb-allinc-consumption': string; 'fnb-menu-popularity': string; 'fnb-food-cost': string; 'fnb-beverage-cost': string; 'fnb-cover-count': string; 'fnb-avg-check': string; 'fnb-daily-summary': string; 'fnb-waste-report': string; 'fnb-stock-alert': string; 'fnb-recipe-cost': string; 'fnb-supplier-perf': string; 'fnb-special-diet': string; 'fnb-banquet-rev': string; 'fnb-outlet-compare': string; 'fnb-happy-hour': string; 'fnb-inventory': string; 'fnb-treemap': string; 'fnb-cost-gauge': string; 'fnb-popularity-bubble': string; 'fnb-outlet-radar': string; 'fnb-flow-sankey': string; 'mkt-direct-vs-ota': string; 'mkt-website-conversion': string; 'mkt-email-campaign': string; 'mkt-social-engagement': string; 'mkt-seo-ranking': string; 'mkt-ppc-roi': string; 'mkt-review-scores': string; 'mkt-competitor-rate': string; 'mkt-market-share': string; 'mkt-brand-awareness': string; 'mkt-campaign-summary': string; 'mkt-promo-redemption': string; 'mkt-referral': string; 'mkt-review-list': string; 'mkt-meta-perf': string; 'mkt-ota-ranking': string; 'mkt-loyalty-stats': string; 'mkt-newsletter': string; 'mkt-influencer': string; 'mkt-content-perf': string; 'mkt-channel-funnel': string; 'mkt-attribution': string; 'mkt-competitor-radar': string; 'mkt-roi-scatter': string; 'mkt-journey-flow': string; 'staff-schedule-chart': string; 'staff-overtime-chart': string; 'staff-labor-cost': string; 'staff-productivity': string; 'staff-turnover': string; 'staff-training': string; 'staff-attendance': string; 'staff-department': string; 'staff-roster': string; 'staff-leave': string; 'staff-performance': string; 'staff-certification': string; 'staff-onboarding': string; 'staff-payroll-summary': string; 'staff-tip-report': string; 'staff-uniform': string; 'staff-org-chart': string; 'staff-workload-heatmap': string; 'staff-satisfaction-gauge': string; 'staff-cost-pie': string; 'yield-rate-strategy': string; 'yield-demand-forecast': string; 'yield-compset': string; 'yield-pickup': string; 'yield-displacement': string; 'yield-los-pattern': string; 'yield-dow-analysis': string; 'yield-seasonal': string; 'yield-rate-shop': string; 'yield-restrictions': string; 'yield-overrides': string; 'yield-segment-mix': string; 'yield-channel-margin': string; 'yield-dynamic-pricing': string; 'yield-benchmark': string; 'yield-price-elasticity': string; 'yield-demand-heatmap': string; 'yield-optimal-rate': string; 'yield-revenue-gauge': string; 'fin-pnl-chart': string; 'fin-cashflow-chart': string; 'fin-ar-aging': string; 'fin-ap-aging': string; 'fin-expense-chart': string; 'fin-payment-method': string; 'fin-tax-summary': string; 'fin-budget-gauge': string; 'fin-cost-breakdown': string; 'fin-ratio-radar': string; };
    categoryLabels: { revenue: string; occupancy: string; guest: string; reservation: string; operations: string; fnb: string; marketing: string; staff: string; yield: string; financial: string; }; typeLabels: { chart: string; data: string; graph: string; };
    reportsPage: {
        next14DaysTotal: string; operator: string; operation: string; score: string; last30Days: string; last12Weeks: string; unknown: string; direct: string; agency: string; unspecified: string; other: string; pctOfTotalRevenue: string; avg: string; cumulativeRevenuePace: string; totalStr: string; estimate: string; salesByHourEst: string; taxRate: string; estCommissionDist: string;
        managementReports: string
        financeReports: string
        purchasingReports: string
        hrReports: string
        elektraSubtext: string
    }
    target: string
    variance: string
    daily: string
    weekly: string
    grossRevenue: string
    netRevenue: string
    vatAndAccTax: string
    stayDate: string
    reservationDate: string
    stay: string
    dailyAverage: string

    reportTitle: string
    totalRevenue: string
    totalReservations: string
    avgDailyRate: string
    avgBookingValue: string
    roomNights: string
    monthlyRevenue: string
    channelDistribution: string
    topAgencies: string
    roomTypeAnalysis: string
    boardTypeAnalysis: string
    budgetAnalysis: string
    bookingVelocity: string
    occupancyRate: string
    roomOccupancy: string
    adr: string
    revpar: string
    bedNightLabel: string
    roomRevenue: string
    monthLabel: string
    seasonLabel: string
    exchangeRateLabel: string
    avgNights: string
    guestNationality: string
    overview: string
    recordDate: string
    budget: string
    agency: string
    exportPDF: string
    exportCSV: string
    currency: string
    dateRange: string
    startDate: string
    endDate: string
    allTime: string
    last7Days: string
    last30Days: string
    last90Days: string
    last180Days: string
    revenue: string
    count: string
    percentage: string
    channel: string
    nights: string
    avgStay: string
    noData: string
    loadingError: string

    addWidget: string
    removeWidget: string
    editCriteria: string
    saveCriteria: string
    cancelEdit: string
    aiInterpret: string
    aiLoading: string
    dragHint: string
    widgetSettings: string

    extraSales: string
    spaRevenue: string
    minibarRevenue: string
    restaurantExtras: string
    category: string
    amount: string
    date: string

    callCenterPerf: string
    forecast: string
    operatorPerf: string

    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    loading: string
    saving: string
    saved: string
    error: string
    success: string
    confirm: string

    // Yield Management
    yieldTitle: string
    yieldSubtitle: string
    tabOverview: string
    tabChannels: string
    tabAgencies: string
    tabPricing: string
    tabAi: string
    seasonHigh: string
    seasonShoulder: string
    seasonLow: string
    seasonOff: string
    refresh: string
    refreshing: string
    cacheEmpty: string
    lastUpdate: string
    stale: string
    thisMonth: string
    thisSeason: string
    thisYear: string
    custom: string
    channelDist: string
    channelRevenue: string
    agencyAnalysis: string
    priceVolumeMatrix: string
    periodAdrComparison: string
    monthlyAdrRoomNight: string
    aiPriceEval: string
    aiPriceDesc: string
    startAnalysis: string
    analyzing: string
    totalRevLabel: string
    avgAdr: string
    roomNightLabel: string
    channelCount: string
    avgStayNights: string
    revenueShare: string
    roomNightShare: string
    vsLastYear: string
    monthNames: string[]
    managementReports: {
        netReservations: string
        paceReport: string
        agencyReport: string
        market: string
        allMarkets: string
        ytd: string
        allSeasons: string
        clear: string
        sendEmail: string
        aiInterpretGrouped: string
        total: string
        kpiSummary: string
        revenueShare: string
        comparison: string
        details: string
        resCount: string
        sharePct: string
        actual: string
        remaining: string
        targetAdr: string
        requiredRes: string
        remainingRn: string
        groupRes: string
        channelBudgetSplit: string
        budgetRealization: string
        ofTarget: string
    }

    // New i18n keys
    presetToday: string
    presetYesterday: string
    aiInterpretAll: string
    aiInterpreted: string
    aiInterpretingProgress: string
    dayNames: string[]
    monthNamesFull: string[]
    unknown: string
    unspecified: string
    other: string
    statisticsReports: string
    allCategories: string
    totalRes: string
    confirmed: string
    cancelled: string
    walkIn: string
    direct: string
    tourOperator: string
    onlineRes: string
    upsellRevenue: string
    ancillaryRevenue: string
    lateCheckout: string
    earlyCheckin: string
    spaWellness: string
    laundry: string
    parking: string
    transferRevenue: string
    meetingRoomRevenue: string
    reception: string
    resOffice: string
    nightAudit: string
    localGuide: string
    localization: string
    approve: string
    reject: string
    approved: string
    pending: string
    all: string

    widgets: {
        next14DaysTotal: string; operator: string; operation: string; score: string; last30Days: string; last12Weeks: string; unknown: string; direct: string; agency: string; unspecified: string; other: string; pctOfTotalRevenue: string; avg: string; cumulativeRevenuePace: string; totalStr: string; estimate: string; salesByHourEst: string; taxRate: string; estCommissionDist: string;
        cancelCount: string
        rate: string
        revenueImpact: string
        loss: string
        todayRevenue: string
        yesterdayRevenue: string
        change: string
        thisWeek: string
        avgPerDay: string
        perDay: string
        outOfOrderRooms: string
        totalRoomsPct: string
        availableRooms: string
        expectedOccupancy: string
        totalCommission: string
        roomsSuffix: string
        resSuffix: string
        collectionRate: string
        occupancy: string
    }
    bigDataPage: {
        tabs: { overview: string; revenue: string; occupancy: string; channels: string; guests: string; booking: string; performance: string; forecast: string; comparative: string; rawdata: string }
        header: { title: string; reservations: string; countries: string; lastUpdate: string; liveApi: string; loadingData: string }
        overview: { budgetRealization: string; monthlyRevVsBudget: string; channelDist: string; adrTrendMonthly: string; occupancyRate: string; nationalityDist: string; boardType: string }
        revenue: { title: string; seasonBudget: string; target: string; actual: string; realization: string; remaining: string; excess: string; r1: string; r2: string; r3: string; r5: string; r6: string; r7: string; r8: string; r9: string; r10: string; tableTitle: string }
        occupancy: { title: string; r11: string; r12: string; r13: string; r14: string; r15: string; r16: string; r17: string; r18: string; avgNightsSuffix: string; tableTitle: string }
        channels: { title: string; r19: string; r20: string; r21: string; r22: string; r23: string; r25: string; r24: string; tableTitle: string }
        guests: { title: string; r26: string; r27: string; r28: string; r29: string; r30: string; r31: string; r32: string; tableTitle: string }
        booking: { title: string; r33: string; r34: string; r35: string; r36: string; r37: string; r38: string; r39: string; r40: string; leadTimeTable: string; stayLengthTable: string }
        performance: { title: string; r41: string; r42: string; r46: string; r47: string; r48: string; r49: string; r50: string; tableTitle: string }
        forecast: { title: string; r5: string; r43: string; r44: string; r12: string; seasonalComp: string }
        comparative: { title: string; r4: string; metric: string; thisSeason: string; lastSeason: string; change: string; paceComp: string; seasonalRevComp: string; channelAdrComp: string; roomTypeRevComp: string }
        rawdata: { title: string; searchPlaceholder: string; recordsSuffix: string; tableTitle: string }
        tableCols: { month: string; resCount: string; revenueYtl: string; budgetEur: string; actualEur: string; remainingEur: string; percent: string; adrYtl: string; roomType: string; avgRate: string; avgNights: string; share: string; channel: string; agency: string; country: string; avgRateYtl: string; durationRange: string; resCountLong: string; duration: string; realization: string; occupancyRate: string; revparYtl: string; rateType: string; voucher: string; boardType: string; checkIn: string; checkOut: string; nights: string; price: string; currency: string; status: string }
    }

    extrasPage?: {
        title: string; totalExtras: string; dailyTotalRev: string; noDataSelected: string; pmsWaiting: string; noSpaData: string; noMinibarData: string; noRestData: string; deptComparison: string; revenue: string; relatedModules: string;
        yieldDesc: string; reportsDesc: string; reservationsDesc: string; purchasingDesc: string;
    }
    yieldPage?: {
        title: string; subtitle: string; overview: string; channelAnalysis: string; agencyAnalysis: string; priceMatrix: string; aiAssessment: string; currentSeasons: string; high: string; shoulder: string; low: string; off: string; refresh: string; refreshing: string; cacheEmpty: string; lastUpdate: string; stale: string; live: string; datePreset: string;
        charts: { channelResDist: string; channelRevDist: string; agencyCountryAnalysis: string; priceVolMatrix: string; periodAdrComp: string; monthlyAdrRoomNight: string; }
        tableCols: { amount: string; category: string; count: string; percentage: string; revenue: string; avgAdr: string; roomNights: string; share: string; }
        aiSection: { title: string; desc: string; button: string; analyzing: string; }
        labels: { totalRev: string; avgAdr: string; roomNights: string; channelCount: string; avgStay: string; revShare: string; rnShare: string; vsLastYear: string; }
    }
}