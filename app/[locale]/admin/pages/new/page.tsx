import { getPagesForParentSelect } from '@/app/actions/admin'
import { getCmsTranslations } from '@/lib/cms-translations'
import { NewPageClient } from '@/components/admin/NewPageClient'

export default async function NewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = getCmsTranslations(locale)
  const parentOptions = await getPagesForParentSelect(locale)

  return (
    <NewPageClient
      locale={locale}
      t={t}
      parentOptions={parentOptions}
    />
  )
}
