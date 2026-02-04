import { getSiteSettings } from '@/app/actions/settings'
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm'

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const settings = await getSiteSettings(locale)

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Site Settings</h1>
                <p className="text-gray-500 mt-1">
                    Configure global site settings for <span className="font-medium">{locale.toUpperCase()}</span> locale
                </p>
            </div>

            <SiteSettingsForm locale={locale} initialSettings={settings} />
        </div>
    )
}
