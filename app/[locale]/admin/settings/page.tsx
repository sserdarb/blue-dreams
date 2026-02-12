import { getSiteSettings } from '@/app/actions/settings'
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm'

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
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
        googleMapsApiKey: settings.googleMapsApiKey ?? undefined,
    }

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
                <p className="text-gray-500 mt-1">
                    Configure global site settings for <span className="font-medium">{locale.toUpperCase()}</span> locale
                </p>
            </div>

            <SiteSettingsForm locale={locale} initialSettings={safeSettings} />
        </div>
    )
}
