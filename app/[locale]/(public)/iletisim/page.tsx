export const dynamic = 'force-dynamic'

import { getPageBySlug } from '@/app/actions/page-actions'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    const page = await getPageBySlug('iletisim', locale)

    if (!page) {
        return (
            <div className="flex items-center justify-center min-h-[50vh] text-center p-8">
                <div>
                    <h1 className="text-3xl font-serif text-gray-900 mb-4">Sayfa Bulunamadı</h1>
                    <p className="text-gray-500">Bu sayfa henüz oluşturulmamış. Admin panelden içerik ekleyin.</p>
                </div>
            </div>
        )
    }

    const widgets = page.widgets.map(w => ({ id: w.id, type: w.type, data: w.data }))

    return <WidgetRenderer widgets={widgets} />
}
