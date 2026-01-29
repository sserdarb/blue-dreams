import { getPage } from '@/app/actions/page-actions'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'
import { notFound } from 'next/navigation'

export default async function DynamicPage({ params }: { params: Promise<{ slug: string[], locale: string }> }) {
  const { slug, locale } = await params
  const page = await getPage(slug, locale)

  if (!page) {
    notFound()
  }

  return (
    <div>
        <WidgetRenderer widgets={page.widgets} />
    </div>
  )
}
