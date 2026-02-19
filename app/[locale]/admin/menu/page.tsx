export const dynamic = 'force-dynamic'

import { getAllMenuItems } from '@/app/actions/settings'
import { MenuManager } from '@/components/admin/MenuManager'

export default async function MenuPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const menuItems = await getAllMenuItems(locale)

    // Flatten for the manager (we'll handle hierarchy separately)
    const flatItems = menuItems.map(item => ({
        id: item.id,
        label: item.label,
        url: item.url,
        target: item.target,
        order: item.order,
        isActive: item.isActive
    }))

    return (
        <div className="max-w-3xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                <p className="text-gray-500 mt-1">
                    Manage navigation menu for <span className="font-medium">{locale.toUpperCase()}</span> locale
                </p>
            </div>

            <MenuManager locale={locale} initialItems={flatItems} />

            <div className="mt-8 p-4 bg-gray-50 rounded-xl border text-sm text-gray-600">
                <h3 className="font-medium text-gray-800 mb-2">Tips</h3>
                <ul className="list-disc list-inside space-y-1">
                    <li>Use relative URLs like <code className="bg-gray-200 px-1 rounded">/accommodation</code> for internal pages</li>
                    <li>Use absolute URLs like <code className="bg-gray-200 px-1 rounded">https://example.com</code> for external links</li>
                    <li>Hidden items won't appear in the navigation but are saved</li>
                    <li>Reorder items using the arrows on the left</li>
                </ul>
            </div>
        </div>
    )
}
