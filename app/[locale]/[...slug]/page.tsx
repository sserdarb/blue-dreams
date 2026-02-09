import { getPageBySlug } from '@/app/actions/page-actions'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'
import { notFound } from 'next/navigation'

export default async function DynamicPage({ params }: { params: Promise<{ slug: string[], locale: string }> }) {
  const { slug, locale } = await params
  const slugString = slug ? slug.join('/') : 'home'
  const page = await getPageBySlug(slugString, locale)

  if (!page) {
    notFound()
  }

  return (
    <div>
      <WidgetRenderer widgets={page.widgets.map(w => ({ id: w.id, type: w.type, data: w.data }))} />
    </div>
  )
}
