import { getPage } from '@/app/actions/page-actions'
import { WidgetRenderer } from '@/components/widgets/WidgetRenderer'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  // We assume the home page is stored with slug "home"
  const page = await getPage(['home'], locale)

  if (!page) {
    return (
        <div className="min-h-[50vh] flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Welcome to Blue Dreams Resort</h1>
                <p>Please configure the home page in the Admin Panel.</p>
            </div>
        </div>
    )
  }

  return (
    <div>
        <WidgetRenderer widgets={page.widgets} />
    </div>
  )
}
