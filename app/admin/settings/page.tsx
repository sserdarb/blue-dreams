import { getSiteSettings } from '@/app/actions/settings'
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm'

// Default locale for admin panel (no longer under [locale] route)
const DEFAULT_LOCALE = 'tr'

export default async function SettingsPage() {
    const locale = DEFAULT_LOCALE
    const settings = await getSiteSettings(locale)

    // Convert null values to undefined to match component prop types
    const safeSettings = {
        siteName: settings.siteName ?? undefined,
        logo: settings.logo ?? undefined,
        favicon: settings.favicon ?? undefined,
        phone: settings.phone ?? undefined,
        email: settings.email ?? undefined,
        address: settings.address ?? undefined,
        socialLinks: settings.socialLinks ?? undefined,
        footerText: settings.footerText ?? undefined,
        footerCopyright: settings.footerCopyright ?? undefined,
        headerStyle: settings.headerStyle ?? undefined,
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Site Ayarları</h1>
                <p className="text-gray-400 mt-1">
                    Site ayarlarını yapılandırın (<span className="font-medium">{locale.toUpperCase()}</span>)
                </p>
            </div>

            <SiteSettingsForm locale={locale} initialSettings={safeSettings} />
        </div>
    )
}

