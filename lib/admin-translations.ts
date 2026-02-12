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
}
