import { getSiteSettings } from '@/app/actions/settings'
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm'
import SettingsPageClient from './SettingsPageClient'

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
        <SettingsPageClient locale={locale} initialSettings={safeSettings} />
    )
}
