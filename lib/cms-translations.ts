// CMS Page Management translations for the admin panel
// Lightweight module used by page listing, editor, and widget picker

export type CmsLocale = 'tr' | 'en' | 'de' | 'ru'

export function getCmsTranslations(locale: string) {
    return cmsTranslations[(locale as CmsLocale)] || cmsTranslations.tr
}

const cmsTranslations: Record<CmsLocale, CmsTranslations> = {
    tr: {
        pageManagement: 'Sayfa Yönetimi',
        pageManagementDesc: 'Web sitenizin yapısal içeriğini yönetin ve düzenleyin.',
        addNewPage: '+ Yeni Sayfa Ekle',
        searchPlaceholder: 'Başlık veya slug ile ara...',
        allStatus: 'Tüm Durumlar',
        published: 'Yayında',
        draft: 'Taslak',
        sortByDate: 'Tarihe Göre',
        sortByTitle: 'Başlığa Göre',
        pageTitle: 'Sayfa Başlığı',
        slug: 'Slug',
        status: 'Durum',
        lastModified: 'Son Değişiklik',
        actions: 'İşlemler',
        showing: 'Gösterilen',
        of: '/',
        pagesLabel: 'sayfa',
        previous: 'Önceki',
        next: 'Sonraki',
        edit: 'Düzenle',
        preview: 'Önizle',
        deleteAction: 'Sil',
        confirmDelete: 'Bu sayfayı silmek istediğinize emin misiniz?',
        noPages: 'Henüz sayfa oluşturulmamış.',
        createFirstPage: 'İlk sayfanızı oluşturmak için yukarıdaki butona tıklayın.',

        // New/Edit Page
        addNewPageTitle: 'Yeni Sayfa Ekle',
        editPageTitle: 'Sayfayı Düzenle',
        pageTitlePlaceholder: 'örn. Şirket Vizyonumuz',
        slugPlaceholder: 'sirket-vizyonumuz',
        slugPrefix: 'bluedreamsresort.com/',
        metaDescription: 'Meta Açıklama',
        metaDescriptionPlaceholder: 'SEO açıklaması (160 karakter)',

        // Publishing
        publishingOptions: 'Yayın Seçenekleri',
        visibility: 'Görünürlük',
        visibilityPublic: 'Herkese Açık',
        visibilityPrivate: 'Özel',
        schedule: 'Zamanlama',
        immediately: 'Hemen',
        updateDraft: 'Taslak Güncelle',
        publishNow: 'Şimdi Yayınla',
        saveDraft: 'Taslak Kaydet',
        publish: 'Yayınla',
        previewBtn: 'Önizle',

        // Featured Image
        featuredImage: 'Öne Çıkan Görsel',
        clickToUpload: 'Görsel yüklemek için tıklayın',
        removeImage: 'Görseli Kaldır',

        // Page Attributes
        pageAttributes: 'Sayfa Özellikleri',
        parentPage: 'Üst Sayfa',
        noParent: '(üst sayfa yok)',
        template: 'Şablon',
        templateDefault: 'Varsayılan',
        templateFullWidth: 'Tam Genişlik',
        templateSidebar: 'Yan Menülü',

        // Content Builder
        pageContentBuilder: 'Sayfa İçerik Oluşturucu',
        blocksAdded: 'BLOK EKLENDİ',
        insertBlock: 'Yeni içerik bloğu ekle',
        widgetPicker: 'Widget Seçici',
        widgetPickerDesc: 'Sayfanıza eklemek istediğiniz widget türünü seçin',

        // Widget Categories
        catLayout: 'Düzen',
        catContent: 'İçerik',
        catMedia: 'Medya',
        catInteractive: 'Etkileşimli',
        catData: 'Veri',
        catAll: 'Tümü',

        // Language
        language: 'Dil',
        selectLanguage: 'Dil Seçin',

        // Widget actions
        duplicateWidget: 'Kopyala',
        collapseWidget: 'Daralt',
        expandWidget: 'Genişlet',
        deleteWidget: 'Sil',
        saving: 'Kaydediliyor...',
        saved: 'Kaydedildi!',
        error: 'Hata oluştu',
        goBack: 'Geri Dön',
        backToPages: '← Sayfalara Dön',

        // AI Features
        aiGenerate: 'AI ile Oluştur',
        aiGenerateDesc: 'Yapay zeka ile widget içeriğini otomatik oluşturun',
        aiGenerateBtn: '🤖 AI ile Doldur',
        aiTopic: 'Konu',
        aiTopicPlaceholder: 'İçerik konusunu yazın...',
        aiGenerating: 'AI üretiyor...',
        aiGenerateSuccess: 'İçerik başarıyla üretildi!',
        aiTranslate: 'AI Çeviri',
        aiTranslateDesc: 'Bu sayfayı yapay zeka ile başka bir dile çevirin',
        aiTranslateBtn: '🌐 Sayfayı Çevir',
        aiTranslating: 'Çeviriliyor...',
        aiTranslateSuccess: 'Sayfa başarıyla çevrildi!',
        aiTranslateFailed: 'Çeviri başarısız oldu',
        targetLanguage: 'Hedef Dil',
        aiError: 'AI hatası oluştu',
    },
    en: {
        pageManagement: 'Page Management',
        pageManagementDesc: 'Manage and organize your website\'s structural content.',
        addNewPage: '+ Add New Page',
        searchPlaceholder: 'Search pages by title or slug...',
        allStatus: 'All Status',
        published: 'Published',
        draft: 'Draft',
        sortByDate: 'Sort by Date',
        sortByTitle: 'Sort by Title',
        pageTitle: 'Page Title',
        slug: 'Slug',
        status: 'Status',
        lastModified: 'Last Modified',
        actions: 'Actions',
        showing: 'Showing',
        of: 'of',
        pagesLabel: 'pages',
        previous: 'Previous',
        next: 'Next',
        edit: 'Edit',
        preview: 'Preview',
        deleteAction: 'Delete',
        confirmDelete: 'Are you sure you want to delete this page?',
        noPages: 'No pages created yet.',
        createFirstPage: 'Click the button above to create your first page.',
        addNewPageTitle: 'Add New Page',
        editPageTitle: 'Edit Page',
        pageTitlePlaceholder: 'e.g. Our Company Vision',
        slugPlaceholder: 'our-company-vision',
        slugPrefix: 'bluedreamsresort.com/',
        metaDescription: 'Meta Description',
        metaDescriptionPlaceholder: 'SEO description (160 chars)',
        publishingOptions: 'Publishing Options',
        visibility: 'Visibility',
        visibilityPublic: 'Public',
        visibilityPrivate: 'Private',
        schedule: 'Schedule',
        immediately: 'Immediately',
        updateDraft: 'Update Draft',
        publishNow: 'Publish Now',
        saveDraft: 'Save Draft',
        publish: 'Publish',
        previewBtn: 'Preview',
        featuredImage: 'Featured Image',
        clickToUpload: 'Click to upload image',
        removeImage: 'Remove Image',
        pageAttributes: 'Page Attributes',
        parentPage: 'Parent Page',
        noParent: '(no parent)',
        template: 'Template',
        templateDefault: 'Default',
        templateFullWidth: 'Full Width',
        templateSidebar: 'With Sidebar',
        pageContentBuilder: 'Page Content Builder',
        blocksAdded: 'BLOCKS ADDED',
        insertBlock: 'Insert a new content block',
        widgetPicker: 'Widget Picker',
        widgetPickerDesc: 'Choose a widget type to add to your page',
        catLayout: 'Layout',
        catContent: 'Content',
        catMedia: 'Media',
        catInteractive: 'Interactive',
        catData: 'Data',
        catAll: 'All',
        language: 'Language',
        selectLanguage: 'Select Language',
        duplicateWidget: 'Duplicate',
        collapseWidget: 'Collapse',
        expandWidget: 'Expand',
        deleteWidget: 'Delete',
        saving: 'Saving...',
        saved: 'Saved!',
        error: 'An error occurred',
        goBack: 'Go Back',
        backToPages: '← Back to Pages',

        // AI Features
        aiGenerate: 'AI Generate',
        aiGenerateDesc: 'Automatically generate widget content with AI',
        aiGenerateBtn: '🤖 AI Fill',
        aiTopic: 'Topic',
        aiTopicPlaceholder: 'Enter the content topic...',
        aiGenerating: 'AI generating...',
        aiGenerateSuccess: 'Content generated successfully!',
        aiTranslate: 'AI Translation',
        aiTranslateDesc: 'Translate this page to another language with AI',
        aiTranslateBtn: '🌐 Translate Page',
        aiTranslating: 'Translating...',
        aiTranslateSuccess: 'Page translated successfully!',
        aiTranslateFailed: 'Translation failed',
        targetLanguage: 'Target Language',
        aiError: 'AI error occurred',
    },
    de: {
        pageManagement: 'Seitenverwaltung',
        pageManagementDesc: 'Verwalten und organisieren Sie den strukturellen Inhalt Ihrer Website.',
        addNewPage: '+ Neue Seite hinzufügen',
        searchPlaceholder: 'Seiten nach Titel oder Slug suchen...',
        allStatus: 'Alle Status',
        published: 'Veröffentlicht',
        draft: 'Entwurf',
        sortByDate: 'Nach Datum sortieren',
        sortByTitle: 'Nach Titel sortieren',
        pageTitle: 'Seitentitel',
        slug: 'Slug',
        status: 'Status',
        lastModified: 'Zuletzt geändert',
        actions: 'Aktionen',
        showing: 'Anzeige',
        of: 'von',
        pagesLabel: 'Seiten',
        previous: 'Zurück',
        next: 'Weiter',
        edit: 'Bearbeiten',
        preview: 'Vorschau',
        deleteAction: 'Löschen',
        confirmDelete: 'Möchten Sie diese Seite wirklich löschen?',
        noPages: 'Noch keine Seiten erstellt.',
        createFirstPage: 'Klicken Sie auf die Schaltfläche oben, um Ihre erste Seite zu erstellen.',
        addNewPageTitle: 'Neue Seite hinzufügen',
        editPageTitle: 'Seite bearbeiten',
        pageTitlePlaceholder: 'z.B. Unsere Unternehmensvision',
        slugPlaceholder: 'unsere-unternehmensvision',
        slugPrefix: 'bluedreamsresort.com/',
        metaDescription: 'Meta-Beschreibung',
        metaDescriptionPlaceholder: 'SEO-Beschreibung (160 Zeichen)',
        publishingOptions: 'Veröffentlichungsoptionen',
        visibility: 'Sichtbarkeit',
        visibilityPublic: 'Öffentlich',
        visibilityPrivate: 'Privat',
        schedule: 'Zeitplan',
        immediately: 'Sofort',
        updateDraft: 'Entwurf aktualisieren',
        publishNow: 'Jetzt veröffentlichen',
        saveDraft: 'Entwurf speichern',
        publish: 'Veröffentlichen',
        previewBtn: 'Vorschau',
        featuredImage: 'Beitragsbild',
        clickToUpload: 'Klicken zum Hochladen',
        removeImage: 'Bild entfernen',
        pageAttributes: 'Seitenattribute',
        parentPage: 'Übergeordnete Seite',
        noParent: '(keine übergeordnete)',
        template: 'Vorlage',
        templateDefault: 'Standard',
        templateFullWidth: 'Volle Breite',
        templateSidebar: 'Mit Seitenleiste',
        pageContentBuilder: 'Seiten-Inhaltserstellung',
        blocksAdded: 'BLÖCKE HINZUGEFÜGT',
        insertBlock: 'Neuen Inhaltsblock einfügen',
        widgetPicker: 'Widget-Auswahl',
        widgetPickerDesc: 'Wählen Sie einen Widget-Typ für Ihre Seite',
        catLayout: 'Layout',
        catContent: 'Inhalt',
        catMedia: 'Medien',
        catInteractive: 'Interaktiv',
        catData: 'Daten',
        catAll: 'Alle',
        language: 'Sprache',
        selectLanguage: 'Sprache wählen',
        duplicateWidget: 'Duplizieren',
        collapseWidget: 'Einklappen',
        expandWidget: 'Ausklappen',
        deleteWidget: 'Löschen',
        saving: 'Speichert...',
        saved: 'Gespeichert!',
        error: 'Ein Fehler ist aufgetreten',
        goBack: 'Zurück',
        backToPages: '← Zurück zu Seiten',

        // AI Features
        aiGenerate: 'AI-Generierung',
        aiGenerateDesc: 'Widget-Inhalte automatisch mit KI generieren',
        aiGenerateBtn: '🤖 KI-Füllung',
        aiTopic: 'Thema',
        aiTopicPlaceholder: 'Inhaltsthema eingeben...',
        aiGenerating: 'KI generiert...',
        aiGenerateSuccess: 'Inhalt erfolgreich generiert!',
        aiTranslate: 'KI-Übersetzung',
        aiTranslateDesc: 'Diese Seite mit KI in eine andere Sprache übersetzen',
        aiTranslateBtn: '🌐 Seite übersetzen',
        aiTranslating: 'Übersetzt...',
        aiTranslateSuccess: 'Seite erfolgreich übersetzt!',
        aiTranslateFailed: 'Übersetzung fehlgeschlagen',
        targetLanguage: 'Zielsprache',
        aiError: 'KI-Fehler aufgetreten',
    },
    ru: {
        pageManagement: 'Управление страницами',
        pageManagementDesc: 'Управляйте и организуйте структурное содержание вашего сайта.',
        addNewPage: '+ Добавить страницу',
        searchPlaceholder: 'Поиск по названию или slug...',
        allStatus: 'Все статусы',
        published: 'Опубликовано',
        draft: 'Черновик',
        sortByDate: 'По дате',
        sortByTitle: 'По названию',
        pageTitle: 'Заголовок страницы',
        slug: 'Slug',
        status: 'Статус',
        lastModified: 'Последнее изменение',
        actions: 'Действия',
        showing: 'Показано',
        of: 'из',
        pagesLabel: 'страниц',
        previous: 'Назад',
        next: 'Далее',
        edit: 'Редактировать',
        preview: 'Предпросмотр',
        deleteAction: 'Удалить',
        confirmDelete: 'Вы уверены, что хотите удалить эту страницу?',
        noPages: 'Страницы еще не созданы.',
        createFirstPage: 'Нажмите кнопку выше, чтобы создать первую страницу.',
        addNewPageTitle: 'Добавить страницу',
        editPageTitle: 'Редактировать страницу',
        pageTitlePlaceholder: 'напр. Видение нашей компании',
        slugPlaceholder: 'videnie-nashej-kompanii',
        slugPrefix: 'bluedreamsresort.com/',
        metaDescription: 'Мета-описание',
        metaDescriptionPlaceholder: 'SEO описание (160 символов)',
        publishingOptions: 'Параметры публикации',
        visibility: 'Видимость',
        visibilityPublic: 'Публичная',
        visibilityPrivate: 'Приватная',
        schedule: 'Расписание',
        immediately: 'Немедленно',
        updateDraft: 'Обновить черновик',
        publishNow: 'Опубликовать',
        saveDraft: 'Сохранить черновик',
        publish: 'Опубликовать',
        previewBtn: 'Предпросмотр',
        featuredImage: 'Изображение',
        clickToUpload: 'Нажмите для загрузки',
        removeImage: 'Удалить изображение',
        pageAttributes: 'Атрибуты страницы',
        parentPage: 'Родительская страница',
        noParent: '(нет родительской)',
        template: 'Шаблон',
        templateDefault: 'По умолчанию',
        templateFullWidth: 'Полная ширина',
        templateSidebar: 'С боковой панелью',
        pageContentBuilder: 'Конструктор содержимого',
        blocksAdded: 'БЛОКОВ ДОБАВЛЕНО',
        insertBlock: 'Вставить новый блок контента',
        widgetPicker: 'Выбор виджета',
        widgetPickerDesc: 'Выберите тип виджета для добавления на страницу',
        catLayout: 'Макет',
        catContent: 'Контент',
        catMedia: 'Медиа',
        catInteractive: 'Интерактив',
        catData: 'Данные',
        catAll: 'Все',
        language: 'Язык',
        selectLanguage: 'Выберите язык',
        duplicateWidget: 'Дублировать',
        collapseWidget: 'Свернуть',
        expandWidget: 'Развернуть',
        deleteWidget: 'Удалить',
        saving: 'Сохранение...',
        saved: 'Сохранено!',
        error: 'Произошла ошибка',
        goBack: 'Назад',
        backToPages: '← К страницам',

        // AI Features
        aiGenerate: 'AI генерация',
        aiGenerateDesc: 'Автоматически создайте контент виджета с помощью ИИ',
        aiGenerateBtn: '🤖 ИИ заполнение',
        aiTopic: 'Тема',
        aiTopicPlaceholder: 'Введите тему контента...',
        aiGenerating: 'ИИ генерирует...',
        aiGenerateSuccess: 'Контент успешно создан!',
        aiTranslate: 'ИИ перевод',
        aiTranslateDesc: 'Переведите эту страницу на другой язык с помощью ИИ',
        aiTranslateBtn: '🌐 Перевести страницу',
        aiTranslating: 'Перевод...',
        aiTranslateSuccess: 'Страница успешно переведена!',
        aiTranslateFailed: 'Перевод не удался',
        targetLanguage: 'Целевой язык',
        aiError: 'Ошибка ИИ',
    },
}

export type CmsTranslations = {
    pageManagement: string
    pageManagementDesc: string
    addNewPage: string
    searchPlaceholder: string
    allStatus: string
    published: string
    draft: string
    sortByDate: string
    sortByTitle: string
    pageTitle: string
    slug: string
    status: string
    lastModified: string
    actions: string
    showing: string
    of: string
    pagesLabel: string
    previous: string
    next: string
    edit: string
    preview: string
    deleteAction: string
    confirmDelete: string
    noPages: string
    createFirstPage: string
    addNewPageTitle: string
    editPageTitle: string
    pageTitlePlaceholder: string
    slugPlaceholder: string
    slugPrefix: string
    metaDescription: string
    metaDescriptionPlaceholder: string
    publishingOptions: string
    visibility: string
    visibilityPublic: string
    visibilityPrivate: string
    schedule: string
    immediately: string
    updateDraft: string
    publishNow: string
    saveDraft: string
    publish: string
    previewBtn: string
    featuredImage: string
    clickToUpload: string
    removeImage: string
    pageAttributes: string
    parentPage: string
    noParent: string
    template: string
    templateDefault: string
    templateFullWidth: string
    templateSidebar: string
    pageContentBuilder: string
    blocksAdded: string
    insertBlock: string
    widgetPicker: string
    widgetPickerDesc: string
    catLayout: string
    catContent: string
    catMedia: string
    catInteractive: string
    catData: string
    catAll: string
    language: string
    selectLanguage: string
    duplicateWidget: string
    collapseWidget: string
    expandWidget: string
    deleteWidget: string
    saving: string
    saved: string
    error: string
    goBack: string
    backToPages: string
    // AI Features
    aiGenerate: string
    aiGenerateDesc: string
    aiGenerateBtn: string
    aiTopic: string
    aiTopicPlaceholder: string
    aiGenerating: string
    aiGenerateSuccess: string
    aiTranslate: string
    aiTranslateDesc: string
    aiTranslateBtn: string
    aiTranslating: string
    aiTranslateSuccess: string
    aiTranslateFailed: string
    targetLanguage: string
    aiError: string
}
