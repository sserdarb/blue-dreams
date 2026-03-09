export const dynamic = 'force-dynamic'

import { getPages } from '@/app/actions/admin'
import { getCmsTranslations } from '@/lib/cms-translations'
import { PageListClient } from '@/components/admin/PageListClient'

export default async function PageList({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const pages = await getPages(locale)
  const t = getCmsTranslations(locale)

  return (
    <PageListClient
      pages={pages.map(p => ({
        id: p.id,
        slug: p.slug,
        locale: p.locale,
        title: p.title,
        status: p.status,
        updatedAt: p.updatedAt.toISOString(),
        _count: (p as any)._count,
      }))}
      locale={locale}
      t={t}
    />
  )
}
