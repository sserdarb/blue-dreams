// Admin panel translations — all UI strings for the admin panel
// Used by layout, reports, pages, etc.

export type AdminLocale = 'tr' | 'en' | 'de' | 'ru'

export function getAdminTranslations(locale: AdminLocale) {
    return translations[locale] || translations.tr
}

const translations: Record<AdminLocale, AdminTranslations> = {
    tr: {
        // Navigation sections
        navReports: 'Raporlar',
        navContent: 'İçerik',
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
        settings: 'Ayarlar',
        analytics: 'Analytics',
        blueConcierge: 'Blue Concierge',
        rooms: 'Odalar',
        dining: 'Restoranlar',
        meeting: 'Toplantı',
        activities: 'Aktiviteler',
        aiTraining: 'AI Eğitim',
        users: 'Kullanıcılar',
        viewSite: 'Siteyi Görüntüle',
        editingLang: 'Düzenleme:',
        // Task Management
        taskManagement: 'Görev Yönetimi',
        tasks: 'Görevler',
        workflows: 'İş Akışları',
        mailIntegration: 'Mail Entegrasyonu',
        createTask: 'Görev Oluştur',
        assignee: 'Atanan',
        priority: 'Öncelik',
        dueDate: 'Bitiş Tarihi',

        // Reports
        reportTitle: 'Raporlar',
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
            market: 'Market',
            allMarkets: 'Tüm Marketler',
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

        // CRM / Local Guide
        localGuide: 'Çevre Rehberi',
        localization: 'Lokalizasyon',
        approve: 'Onayla',
        reject: 'Kaldır',
        approved: 'Onaylı',
        pending: 'Bekleyen',
        all: 'Tümü',

        widgets: {
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
        }
    },
    en: {
        navReports: 'Reports',
        navContent: 'Content',
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
        settings: 'Settings',
        analytics: 'Analytics',
        blueConcierge: 'Blue Concierge',
        rooms: 'Rooms',
        dining: 'Restaurants',
        meeting: 'Meeting',
        activities: 'Activities',
        aiTraining: 'AI Training',
        users: 'Users',
        viewSite: 'View Site',
        editingLang: 'Editing:',
        taskManagement: 'Task Management',
        tasks: 'Tasks',
        workflows: 'Workflows',
        mailIntegration: 'Mail Integration',
        createTask: 'Create Task',
        assignee: 'Assignee',
        priority: 'Priority',
        dueDate: 'Due Date',

        reportTitle: 'Reports',
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
        guestNationality: 'Guest Nationality',
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
            market: 'Market',
            allMarkets: 'All Markets',
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
        localization: 'Localization',
        approve: 'Approve',
        reject: 'Remove',
        approved: 'Approved',
        pending: 'Pending',
        all: 'All',
        widgets: {
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
        }
    },
    de: {
        navReports: 'Berichte',
        navContent: 'Inhalt',
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
        settings: 'Einstellungen',
        analytics: 'Analytics',
        blueConcierge: 'Blue Concierge',
        rooms: 'Zimmer',
        dining: 'Restaurants',
        meeting: 'Tagung',
        activities: 'Aktivitäten',
        aiTraining: 'AI Training',
        users: 'Benutzer',
        viewSite: 'Seite Ansehen',
        editingLang: 'Bearbeiten:',
        taskManagement: 'Aufgabenverwaltung',
        tasks: 'Aufgaben',
        workflows: 'Arbeitsabläufe',
        mailIntegration: 'E-Mail-Integration',
        createTask: 'Aufgabe erstellen',
        assignee: 'Zugewiesen',
        priority: 'Priorität',
        dueDate: 'Fälligkeitsdatum',

        reportTitle: 'Berichte',
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
            market: 'Markt',
            allMarkets: 'Alle Märkte',
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
        localization: 'Lokalisierung',
        approve: 'Genehmigen',
        reject: 'Entfernen',
        approved: 'Genehmigt',
        pending: 'Ausstehend',
        all: 'Alle',
        widgets: {
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
        }
    },
    ru: {
        navReports: 'Отчёты',
        navContent: 'Контент',
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
        settings: 'Настройки',
        analytics: 'Аналитика',
        blueConcierge: 'Blue Concierge',
        rooms: 'Номера',
        dining: 'Рестораны',
        meeting: 'Конференции',
        activities: 'Активности',
        aiTraining: 'AI Обучение',
        users: 'Пользователи',
        viewSite: 'Просмотр Сайта',
        editingLang: 'Редактирование:',
        taskManagement: 'Управление задачами',
        tasks: 'Задачи',
        workflows: 'Рабочие процессы',
        mailIntegration: 'Интеграция почты',
        createTask: 'Создать задачу',
        assignee: 'Исполнитель',
        priority: 'Приоритет',
        dueDate: 'Срок выполнения',

        reportTitle: 'Отчёты',
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
            market: 'Рынок',
            allMarkets: 'Все Рынки',
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
        localization: 'Локализация',
        approve: 'Одобрить',
        reject: 'Удалить',
        approved: 'Одобрено',
        pending: 'Ожидание',
        all: 'Все',
        widgets: {
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
        }
    },
}

export interface AdminTranslations {
    navReports: string
    navContent: string
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
    rooms: string
    dining: string
    meeting: string
    activities: string
    aiTraining: string
    users: string
    viewSite: string
    editingLang: string
    // Task Management
    taskManagement: string
    tasks: string
    workflows: string
    mailIntegration: string
    createTask: string
    assignee: string
    priority: string
    dueDate: string

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
    target: string
    variance: string
    daily: string
    weekly: string
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
}
