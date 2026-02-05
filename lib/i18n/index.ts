import { Locale, locales, defaultLocale, isValidLocale } from './config'

// Import translations
import tr from './translations/tr.json'
import en from './translations/en.json'
import de from './translations/de.json'
import ru from './translations/ru.json'

const translations: Record<Locale, typeof tr> = {
    tr,
    en,
    de,
    ru
}

type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`
}[keyof ObjectType & (string | number)]

type TranslationKey = NestedKeyOf<typeof tr>

function getNestedValue(obj: Record<string, unknown>, path: string): string {
    const keys = path.split('.')
    let value: unknown = obj

    for (const key of keys) {
        if (value && typeof value === 'object' && key in value) {
            value = (value as Record<string, unknown>)[key]
        } else {
            return path // Return key if not found
        }
    }

    return typeof value === 'string' ? value : path
}

export function getTranslation(locale: string) {
    const validLocale = isValidLocale(locale) ? locale : defaultLocale
    const t = translations[validLocale]

    return function translate(key: TranslationKey): string {
        return getNestedValue(t as unknown as Record<string, unknown>, key)
    }
}

// For server components
export async function getServerTranslation(locale: string) {
    return getTranslation(locale)
}

// Export types and utilities
export { locales, defaultLocale, isValidLocale }
export type { Locale, TranslationKey }
