// Dashboard widget translations — localized strings for all dashboard components
// Follows the same pattern as DashboardFilter's embedded translations

export type DashboardLocale = 'tr' | 'en' | 'de' | 'ru'

export function getDashboardTranslations(locale: string) {
    return dashboardTranslations[(locale as DashboardLocale)] || dashboardTranslations.tr
}

const dashboardTranslations: Record<DashboardLocale, DashboardTranslationMap> = {
    tr: {
        // Dashboard Page
        page: {
            connectionStatus: 'Asisia PMS Canlı MS SQL Bağlantısı Aktif',
            selectedPeriod: 'Seçili Dönem',
            totalReservations: 'Toplam Rezervasyon',
            confirmedReservations: 'Adet Onaylı Rezervasyon',
            totalGuests: 'Toplam Misafir',
            adrTitle: 'ADR (Ort. Günlük Ücret)',
            revenuePerRoomNight: 'Ciro / Oda Geceleme',
            avgNightlyProfit: 'Gecelik Ortalama Kâr',
            currentRate: 'Güncel Kur',
            cancelledReservations: 'İptal Edilen Rezervasyonlar',
            cancelCount: 'Adet İptal',
            lostRevenue: 'Kaybedilen Ciro',
            generalReservationTrend: 'Genel Rezervasyon Trendi',
            chartInfo: 'Grafik Bilgisi',
            chartDescription: 'Bu grafik, seçilen tarih aralığında rezervasyonların kanallara göre dağılımını (ciro olarak) ve toplam rezervasyon adetini (çizgi ile) göstermektedir. Seçili aralıktaki rezervasyon oluşturulma/güncelleme tarihleri (pickup) baz alınır.',
            otaTrends: 'OTA Rezervasyon Trendleri',
            callCenterTrends: 'Call Center Trendleri',
            onlineTrends: 'Online (Web) Rez. Trendi',
            welcomeMessage: 'Pma Gravity yönetim paneline hoş geldiniz',
            moduleOfflineName: 'Dashboard & Canlı Veriler',
            moduleOfflineReason: 'Elektra PMS ana veri bağlantısı sağlanamadı. Lütfen ağ ayarlarınızı kontrol edin.',
            netReservations: 'Net Rezervasyon',
            netCount: 'Adet Net (Onaylı - İptal)',
            totalRevenueLabel: 'Toplam Gelir',
            avgStay: 'Ort. Konaklama Süresi',
            avgStayNights: 'Gece Ortalama',
            roomNightsTotal: 'Toplam Oda Geceleme'
        },
        // Forecast Widget
        forecast: {
            occupancy: 'Doluluk %',
            adr: 'ADR',
            dailyRevenue: 'Günlük Gelir',
            guestCount: 'Misafir Sayısı',
            seasonForecast: 'Sezon Forecast',
            apr: 'Nis',
            oct: 'Eki',
            fullSeasonView: 'Tam sezon görünümü',
            dayWindow: 'günlük pencere',
            dayEffectTooltip: 'Seçili tarih aralığında yaratılan veya iptal edilen rezervasyonların (Pickup) gelecekteki günlere net oda etkisi.',
            dayEffect: 'Gün Etkisi (Day Effect)',
            dayEffectNet: 'Gün Etkisi (Net Oda)',
            scrollLeft: 'Sola Kaydır',
            zoomIn: 'Yakınlaştır',
            zoomOut: 'Uzaklaştır',
            scrollRight: 'Sağa Kaydır',
            fullSeason: 'Tam Sezon',
            all: 'TÜM',
            allAgencies: 'Tüm Acenteler',
            allRoomTypes: 'Tüm Oda Tipleri',
            avgOccupancy: 'Ort. Doluluk',
            avgAdr: 'Ort. ADR',
            avgGuestsDay: 'Ort. Misafir/Gün',
            totalRevenue: 'Toplam Gelir',
            roomNights: 'Oda Geceleme',
            series: 'Temsil',
            occupiedRooms: 'Dolu Oda',
            noDataFound: 'Seçili dönem için onaylı rezervasyon bulunamadı.'
        },
        // Pickup Widget
        pickup: {
            pickupTrend: 'Gelişim (Pickup) Trendi',
            netPickup: 'Net Pickup',
            revenueImpact: 'Ciro Etkisi',
            reservations: 'Rez.',
            newReservation: 'Yeni Rezervasyon',
            cancelled: 'İptal',
            positiveImpact: 'Pozitif Etki (Ciro Artışı)',
            noPositiveAgency: 'Pozitif etki eden acente bulunamadı.',
            negativeImpact: 'Negatif Etki (İptal / Kayıp)',
            noNegativeAgency: 'Negatif etki eden acente bulunamadı.'
        },
        // Last Reservations Widget
        lastReservations: {
            title: 'Son Rezervasyonlar',
            live: 'Canlı',
            viewAll: 'Tümünü Gör',
            bestAgency: 'En Başarılı Acente (Yüksek ADR)',
            worstAgency: 'Gelişime Açık Acente (Düşük ADR)',
            voucherName: 'Voucher & İsim',
            agencyChannel: 'Acente / Kanal',
            date: 'Tarih',
            roomNight: 'Oda & Gece',
            dailyAvgAdr: 'Günlük Ort. (ADR)',
            performance: 'Performans',
            notSpecified: 'Belirtilmemiş',
            entry: 'Giriş',
            night: 'Gece',
            room: 'Oda',
            total: 'Top',
            cancelledStatus: 'İptal',
            high: 'Yüksek',
            low: 'Alçak',
            calculatedAvgAdr: 'Hesaplanan Ortalama ADR',
            clickToViewAll: 'Satırların üzerine tıklayarak tüm rezervasyonlar listesine gidebilirsiniz.'
        },
        // Agency Performance Widget
        agencyPerformance: {
            title: 'Acente Performansı ve Pazar Etkisi',
            subtitle: 'Oda tipi bazlı ADR analizi · Orijinal döviz cinsinden',
            noDataInRange: 'Bu tarih aralığında acente verisi bulunamadı.',
            agencyName: 'Acente Adı',
            reservations: 'Rez.',
            roomType: 'Oda Tipi',
            roomNights: 'Oda Gecl.',
            marketImpact: 'Pazar Etkisi',
            agency: 'Acente',
            impact: 'Etki',
            aboveAvg: '↑ Ortalama+',
            belowAvg: '↓ Ortalama-',
            roomTypeAdrAnalysis: 'Oda Tipi Bazlı ADR Analizi',
            resCount: 'Rez. Adeti',
            roomNightsLabel: 'Oda Geceleme',
            agencyAdr: 'Acente ADR',
            marketAdr: 'Pazar ADR',
            priceImpact: 'Fiyat Etkisi',
            marketAvg: 'pazar ort.',
            market: 'Pazar',
            typeSuffix: 'tip',
            cancelSuffix: 'i',
            viewFullReport: 'Tüm Acente Raporunu Gör'
        }
    },
    en: {
        page: {
            connectionStatus: 'Asisia PMS Live MS SQL Connection Active',
            selectedPeriod: 'Selected Period',
            totalReservations: 'Total Reservations',
            confirmedReservations: 'Confirmed Reservations',
            totalGuests: 'Total Guests',
            adrTitle: 'ADR (Avg. Daily Rate)',
            revenuePerRoomNight: 'Revenue / Room Night',
            avgNightlyProfit: 'Avg. Nightly Profit',
            currentRate: 'Current Rate',
            cancelledReservations: 'Cancelled Reservations',
            cancelCount: 'Cancelled',
            lostRevenue: 'Lost Revenue',
            generalReservationTrend: 'General Reservation Trend',
            chartInfo: 'Chart Info',
            chartDescription: 'This chart shows the distribution of reservations by channel (revenue) and total reservation count (line) for the selected date range. Based on reservation creation/update dates (pickup).',
            otaTrends: 'OTA Reservation Trends',
            callCenterTrends: 'Call Center Trends',
            onlineTrends: 'Online (Web) Reservation Trend',
            welcomeMessage: 'Welcome to Pma Gravity management panel',
            moduleOfflineName: 'Dashboard & Live Data',
            moduleOfflineReason: 'Unable to connect to Elektra PMS. Please check your network settings.',
            netReservations: 'Net Reservations',
            netCount: 'Net Count (Confirmed - Cancelled)',
            totalRevenueLabel: 'Total Revenue',
            avgStay: 'Avg. Stay Duration',
            avgStayNights: 'Nights Average',
            roomNightsTotal: 'Total Room Nights'
        },
        forecast: {
            occupancy: 'Occupancy %',
            adr: 'ADR',
            dailyRevenue: 'Daily Revenue',
            guestCount: 'Guest Count',
            seasonForecast: 'Season Forecast',
            apr: 'Apr',
            oct: 'Oct',
            fullSeasonView: 'Full season view',
            dayWindow: 'day window',
            dayEffectTooltip: 'Net room impact of reservations created or cancelled in the selected date range (Pickup) on future days.',
            dayEffect: 'Day Effect',
            dayEffectNet: 'Day Effect (Net Rooms)',
            scrollLeft: 'Scroll Left',
            zoomIn: 'Zoom In',
            zoomOut: 'Zoom Out',
            scrollRight: 'Scroll Right',
            fullSeason: 'Full Season',
            all: 'ALL',
            allAgencies: 'All Agencies',
            allRoomTypes: 'All Room Types',
            avgOccupancy: 'Avg. Occupancy',
            avgAdr: 'Avg. ADR',
            avgGuestsDay: 'Avg. Guests/Day',
            totalRevenue: 'Total Revenue',
            roomNights: 'Room Nights',
            series: 'Series',
            occupiedRooms: 'Occupied Rooms',
            noDataFound: 'No confirmed reservations found for the selected period.'
        },
        pickup: {
            pickupTrend: 'Pickup Trend',
            netPickup: 'Net Pickup',
            revenueImpact: 'Revenue Impact',
            reservations: 'Res.',
            newReservation: 'New Reservation',
            cancelled: 'Cancelled',
            positiveImpact: 'Positive Impact (Revenue Increase)',
            noPositiveAgency: 'No agency with positive impact found.',
            negativeImpact: 'Negative Impact (Cancellation / Loss)',
            noNegativeAgency: 'No agency with negative impact found.'
        },
        lastReservations: {
            title: 'Recent Reservations',
            live: 'Live',
            viewAll: 'View All',
            bestAgency: 'Best Agency (High ADR)',
            worstAgency: 'Needs Improvement (Low ADR)',
            voucherName: 'Voucher & Name',
            agencyChannel: 'Agency / Channel',
            date: 'Date',
            roomNight: 'Room & Night',
            dailyAvgAdr: 'Daily Avg. (ADR)',
            performance: 'Performance',
            notSpecified: 'Not Specified',
            entry: 'Entry',
            night: 'Night',
            room: 'Room',
            total: 'Total',
            cancelledStatus: 'Cancelled',
            high: 'High',
            low: 'Low',
            calculatedAvgAdr: 'Calculated Avg. ADR',
            clickToViewAll: 'Click on rows to view the full reservations list.'
        },
        agencyPerformance: {
            title: 'Agency Performance & Market Impact',
            subtitle: 'Room type ADR analysis · In original currency',
            noDataInRange: 'No agency data found for this date range.',
            agencyName: 'Agency Name',
            reservations: 'Res.',
            roomType: 'Room Type',
            roomNights: 'Room Nts.',
            marketImpact: 'Market Impact',
            agency: 'Agency',
            impact: 'Impact',
            aboveAvg: '↑ Above Avg.',
            belowAvg: '↓ Below Avg.',
            roomTypeAdrAnalysis: 'Room Type ADR Analysis',
            resCount: 'Res. Count',
            roomNightsLabel: 'Room Nights',
            agencyAdr: 'Agency ADR',
            marketAdr: 'Market ADR',
            priceImpact: 'Price Impact',
            marketAvg: 'mkt. avg.',
            market: 'Market',
            typeSuffix: 'types',
            cancelSuffix: 'c',
            viewFullReport: 'View Full Agency Report'
        }
    },
    de: {
        page: {
            connectionStatus: 'Asisia PMS Live MS SQL Verbindung Aktiv',
            selectedPeriod: 'Ausgewählter Zeitraum',
            totalReservations: 'Gesamtbuchungen',
            confirmedReservations: 'Bestätigte Buchungen',
            totalGuests: 'Gesamtgäste',
            adrTitle: 'ADR (Durchschn. Tagesrate)',
            revenuePerRoomNight: 'Umsatz / Zimmernacht',
            avgNightlyProfit: 'Durchschn. Nachtgewinn',
            currentRate: 'Aktueller Kurs',
            cancelledReservations: 'Stornierte Buchungen',
            cancelCount: 'Storniert',
            lostRevenue: 'Verlorener Umsatz',
            generalReservationTrend: 'Allgemeiner Buchungstrend',
            chartInfo: 'Diagramm-Info',
            chartDescription: 'Dieses Diagramm zeigt die Verteilung der Buchungen nach Kanal (Umsatz) und Gesamtanzahl (Linie) für den gewählten Zeitraum.',
            otaTrends: 'OTA Buchungstrends',
            callCenterTrends: 'Call Center Trends',
            onlineTrends: 'Online (Web) Buchungstrend',
            welcomeMessage: 'Willkommen im Pma Gravity Verwaltungspanel',
            moduleOfflineName: 'Dashboard & Live-Daten',
            moduleOfflineReason: 'Verbindung zum Elektra PMS konnte nicht hergestellt werden. Bitte überprüfen Sie Ihre Netzwerkeinstellungen.',
            netReservations: 'Netto-Buchungen',
            netCount: 'Netto (Bestätigt - Storniert)',
            totalRevenueLabel: 'Gesamtumsatz',
            avgStay: 'Durchschn. Aufenthaltsdauer',
            avgStayNights: 'Nächte Durchschnitt',
            roomNightsTotal: 'Gesamtübernachtungen'
        },
        forecast: {
            occupancy: 'Belegung %',
            adr: 'ADR',
            dailyRevenue: 'Tagesumsatz',
            guestCount: 'Gästeanzahl',
            seasonForecast: 'Saisonprognose',
            apr: 'Apr',
            oct: 'Okt',
            fullSeasonView: 'Gesamte Saisonansicht',
            dayWindow: 'Tage Fenster',
            dayEffectTooltip: 'Nettoauswirkung der in dem gewählten Zeitraum erstellten oder stornierten Buchungen auf zukünftige Tage.',
            dayEffect: 'Tageseffekt',
            dayEffectNet: 'Tageseffekt (Netto Zimmer)',
            scrollLeft: 'Nach links scrollen',
            zoomIn: 'Vergrößern',
            zoomOut: 'Verkleinern',
            scrollRight: 'Nach rechts scrollen',
            fullSeason: 'Gesamte Saison',
            all: 'ALLE',
            allAgencies: 'Alle Agenturen',
            allRoomTypes: 'Alle Zimmertypen',
            avgOccupancy: 'Durchschn. Belegung',
            avgAdr: 'Durchschn. ADR',
            avgGuestsDay: 'Durchschn. Gäste/Tag',
            totalRevenue: 'Gesamtumsatz',
            roomNights: 'Zimmernächte',
            series: 'Serien',
            occupiedRooms: 'Belegte Zimmer',
            noDataFound: 'Keine bestätigten Buchungen für den ausgewählten Zeitraum gefunden.'
        },
        pickup: {
            pickupTrend: 'Pickup-Trend',
            netPickup: 'Netto Pickup',
            revenueImpact: 'Umsatzauswirkung',
            reservations: 'Buch.',
            newReservation: 'Neue Buchung',
            cancelled: 'Storniert',
            positiveImpact: 'Positive Auswirkung (Umsatzsteigerung)',
            noPositiveAgency: 'Keine Agentur mit positiver Auswirkung gefunden.',
            negativeImpact: 'Negative Auswirkung (Stornierung / Verlust)',
            noNegativeAgency: 'Keine Agentur mit negativer Auswirkung gefunden.'
        },
        lastReservations: {
            title: 'Letzte Buchungen',
            live: 'Live',
            viewAll: 'Alle anzeigen',
            bestAgency: 'Beste Agentur (Hoher ADR)',
            worstAgency: 'Verbesserungsbedarf (Niedriger ADR)',
            voucherName: 'Voucher & Name',
            agencyChannel: 'Agentur / Kanal',
            date: 'Datum',
            roomNight: 'Zimmer & Nacht',
            dailyAvgAdr: 'Täglicher Durchschn. (ADR)',
            performance: 'Leistung',
            notSpecified: 'Nicht angegeben',
            entry: 'Eintritt',
            night: 'Nacht',
            room: 'Zimmer',
            total: 'Gesamt',
            cancelledStatus: 'Storniert',
            high: 'Hoch',
            low: 'Niedrig',
            calculatedAvgAdr: 'Berechneter Durchschn. ADR',
            clickToViewAll: 'Klicken Sie auf Zeilen, um die vollständige Buchungsliste anzuzeigen.'
        },
        agencyPerformance: {
            title: 'Agenturleistung & Marktauswirkung',
            subtitle: 'ADR-Analyse nach Zimmertyp · In Originalwährung',
            noDataInRange: 'Keine Agenturdaten für diesen Zeitraum gefunden.',
            agencyName: 'Agenturname',
            reservations: 'Buch.',
            roomType: 'Zimmertyp',
            roomNights: 'Zimmernächte',
            marketImpact: 'Marktauswirkung',
            agency: 'Agentur',
            impact: 'Auswirkung',
            aboveAvg: '↑ Über Durchschn.',
            belowAvg: '↓ Unter Durchschn.',
            roomTypeAdrAnalysis: 'ADR-Analyse nach Zimmertyp',
            resCount: 'Buchungsanzahl',
            roomNightsLabel: 'Zimmernächte',
            agencyAdr: 'Agentur ADR',
            marketAdr: 'Markt ADR',
            priceImpact: 'Preisauswirkung',
            marketAvg: 'Marktdurchschn.',
            market: 'Markt',
            typeSuffix: 'Typen',
            cancelSuffix: 's',
            viewFullReport: 'Vollständigen Agenturbericht anzeigen'
        }
    },
    ru: {
        page: {
            connectionStatus: 'Подключение Asisia PMS Live MS SQL активно',
            selectedPeriod: 'Выбранный период',
            totalReservations: 'Всего бронирований',
            confirmedReservations: 'Подтверждённых бронирований',
            totalGuests: 'Всего гостей',
            adrTitle: 'ADR (Ср. дневная ставка)',
            revenuePerRoomNight: 'Выручка / Номеро-ночь',
            avgNightlyProfit: 'Ср. ночная прибыль',
            currentRate: 'Текущий курс',
            cancelledReservations: 'Отменённые бронирования',
            cancelCount: 'Отменено',
            lostRevenue: 'Потерянная выручка',
            generalReservationTrend: 'Общий тренд бронирований',
            chartInfo: 'Информация о графике',
            chartDescription: 'Этот график показывает распределение бронирований по каналам (выручка) и общее количество (линия) за выбранный период.',
            otaTrends: 'Тренды OTA бронирований',
            callCenterTrends: 'Тренды Call Center',
            onlineTrends: 'Тренд онлайн (Web) бронирований',
            welcomeMessage: 'Добро пожаловать в панель управления Pma Gravity',
            moduleOfflineName: 'Дашборд и данные в реальном времени',
            moduleOfflineReason: 'Не удалось подключиться к Elektra PMS. Пожалуйста, проверьте сетевые настройки.',
            netReservations: 'Чистые бронирования',
            netCount: 'Нетто (Подтв. - Отменённые)',
            totalRevenueLabel: 'Общий доход',
            avgStay: 'Ср. длительность проживания',
            avgStayNights: 'Ночей в среднем',
            roomNightsTotal: 'Всего ночей номера'
        },
        forecast: {
            occupancy: 'Загрузка %',
            adr: 'ADR',
            dailyRevenue: 'Дневная выручка',
            guestCount: 'Кол-во гостей',
            seasonForecast: 'Прогноз сезона',
            apr: 'Апр',
            oct: 'Окт',
            fullSeasonView: 'Полный обзор сезона',
            dayWindow: 'дневное окно',
            dayEffectTooltip: 'Чистое влияние бронирований, созданных или отменённых в выбранном диапазоне дат, на будущие дни.',
            dayEffect: 'Дневной эффект',
            dayEffectNet: 'Дневной эффект (Нетто номера)',
            scrollLeft: 'Прокрутить влево',
            zoomIn: 'Увеличить',
            zoomOut: 'Уменьшить',
            scrollRight: 'Прокрутить вправо',
            fullSeason: 'Весь сезон',
            all: 'ВСЕ',
            allAgencies: 'Все агентства',
            allRoomTypes: 'Все типы номеров',
            avgOccupancy: 'Ср. загрузка',
            avgAdr: 'Ср. ADR',
            avgGuestsDay: 'Ср. гостей/день',
            totalRevenue: 'Общая выручка',
            roomNights: 'Номеро-ночи',
            series: 'Показатели',
            occupiedRooms: 'Занятые номера',
            noDataFound: 'Подтверждённых бронирований за выбранный период не найдено.'
        },
        pickup: {
            pickupTrend: 'Тренд Pickup',
            netPickup: 'Нетто Pickup',
            revenueImpact: 'Влияние на выручку',
            reservations: 'Брон.',
            newReservation: 'Новое бронирование',
            cancelled: 'Отмена',
            positiveImpact: 'Положительное влияние (Рост выручки)',
            noPositiveAgency: 'Агентства с положительным влиянием не найдены.',
            negativeImpact: 'Отрицательное влияние (Отмена / Потеря)',
            noNegativeAgency: 'Агентства с отрицательным влиянием не найдены.'
        },
        lastReservations: {
            title: 'Последние бронирования',
            live: 'Live',
            viewAll: 'Показать все',
            bestAgency: 'Лучшее агентство (Высокий ADR)',
            worstAgency: 'Требует улучшения (Низкий ADR)',
            voucherName: 'Ваучер и имя',
            agencyChannel: 'Агентство / Канал',
            date: 'Дата',
            roomNight: 'Номер и ночь',
            dailyAvgAdr: 'Ср. дневной (ADR)',
            performance: 'Производительность',
            notSpecified: 'Не указано',
            entry: 'Заезд',
            night: 'Ночь',
            room: 'Номер',
            total: 'Итого',
            cancelledStatus: 'Отменено',
            high: 'Высокий',
            low: 'Низкий',
            calculatedAvgAdr: 'Расчётный ср. ADR',
            clickToViewAll: 'Нажмите на строки, чтобы перейти к полному списку бронирований.'
        },
        agencyPerformance: {
            title: 'Эффективность агентств и влияние на рынок',
            subtitle: 'Анализ ADR по типу номера · В оригинальной валюте',
            noDataInRange: 'Нет данных агентств за этот период.',
            agencyName: 'Название агентства',
            reservations: 'Брон.',
            roomType: 'Тип номера',
            roomNights: 'Номеро-ночи',
            marketImpact: 'Влияние на рынок',
            agency: 'Агентство',
            impact: 'Влияние',
            aboveAvg: '↑ Выше ср.',
            belowAvg: '↓ Ниже ср.',
            roomTypeAdrAnalysis: 'Анализ ADR по типу номера',
            resCount: 'Кол-во брон.',
            roomNightsLabel: 'Номеро-ночи',
            agencyAdr: 'ADR агентства',
            marketAdr: 'ADR рынка',
            priceImpact: 'Ценовое влияние',
            marketAvg: 'ср. рынка',
            market: 'Рынок',
            typeSuffix: 'типов',
            cancelSuffix: 'о',
            viewFullReport: 'Посмотреть полный отчёт по агентствам'
        }
    }
}

interface DashboardTranslationMap {
    page: {
        connectionStatus: string
        selectedPeriod: string
        totalReservations: string
        confirmedReservations: string
        totalGuests: string
        adrTitle: string
        revenuePerRoomNight: string
        avgNightlyProfit: string
        currentRate: string
        cancelledReservations: string
        cancelCount: string
        lostRevenue: string
        generalReservationTrend: string
        chartInfo: string
        chartDescription: string
        otaTrends: string
        callCenterTrends: string
        onlineTrends: string
        welcomeMessage: string
        moduleOfflineName: string
        moduleOfflineReason: string
        netReservations: string
        netCount: string
        totalRevenueLabel: string
        avgStay: string
        avgStayNights: string
        roomNightsTotal: string
    }
    forecast: {
        occupancy: string
        adr: string
        dailyRevenue: string
        guestCount: string
        seasonForecast: string
        apr: string
        oct: string
        fullSeasonView: string
        dayWindow: string
        dayEffectTooltip: string
        dayEffect: string
        dayEffectNet: string
        scrollLeft: string
        zoomIn: string
        zoomOut: string
        scrollRight: string
        fullSeason: string
        all: string
        allAgencies: string
        allRoomTypes: string
        avgOccupancy: string
        avgAdr: string
        avgGuestsDay: string
        totalRevenue: string
        roomNights: string
        series: string
        occupiedRooms: string
        noDataFound: string
    }
    pickup: {
        pickupTrend: string
        netPickup: string
        revenueImpact: string
        reservations: string
        newReservation: string
        cancelled: string
        positiveImpact: string
        noPositiveAgency: string
        negativeImpact: string
        noNegativeAgency: string
    }
    lastReservations: {
        title: string
        live: string
        viewAll: string
        bestAgency: string
        worstAgency: string
        voucherName: string
        agencyChannel: string
        date: string
        roomNight: string
        dailyAvgAdr: string
        performance: string
        notSpecified: string
        entry: string
        night: string
        room: string
        total: string
        cancelledStatus: string
        high: string
        low: string
        calculatedAvgAdr: string
        clickToViewAll: string
    }
    agencyPerformance: {
        title: string
        subtitle: string
        noDataInRange: string
        agencyName: string
        reservations: string
        roomType: string
        roomNights: string
        marketImpact: string
        agency: string
        impact: string
        aboveAvg: string
        belowAvg: string
        roomTypeAdrAnalysis: string
        resCount: string
        roomNightsLabel: string
        agencyAdr: string
        marketAdr: string
        priceImpact: string
        marketAvg: string
        market: string
        typeSuffix: string
        cancelSuffix: string
        viewFullReport: string
    }
}
