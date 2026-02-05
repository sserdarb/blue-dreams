// i18n configuration for Blue Dreams Resort
export const locales = ['tr', 'en', 'de', 'ru'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'tr'

export const localeNames: Record<Locale, string> = {
    tr: 'Türkçe',
    en: 'English',
    de: 'Deutsch',
    ru: 'Русский'
}

export const localeFlags: Record<Locale, string> = {
    tr: '🇹🇷',
    en: '🇬🇧',
    de: '🇩🇪',
    ru: '🇷🇺'
}

export function isValidLocale(locale: string): locale is Locale {
    return locales.includes(locale as Locale)
}
