export const dynamic = 'force-dynamic'

import { getPageById, getPagesForParentSelect } from '@/app/actions/admin'
import { getCmsTranslations } from '@/lib/cms-translations'
import { PageEditorClient } from '@/components/admin/PageEditorClient'
import Link from 'next/link'

export default async function PageEditor({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id, locale } = await params
  const page = await getPageById(id)
  const t = getCmsTranslations(locale)

  if (!page) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 text-lg">Sayfa bulunamadı</p>
        <Link href={`/${locale}/admin/pages`} className="text-blue-500 hover:underline text-sm mt-2 inline-block">
          {t.backToPages}
        </Link>
      </div>
    )
  }

  const parentOptions = await getPagesForParentSelect(page.locale, page.id)

  return (
    <PageEditorClient
      page={{
        id: page.id,
        slug: page.slug,
        locale: page.locale,
        title: page.title,
        metaDescription: page.metaDescription,
        status: page.status,
        visibility: page.visibility,
        template: page.template,
        featuredImage: page.featuredImage,
        parentId: page.parentId,
        publishedAt: page.publishedAt?.toISOString() || null,
      }}
      widgets={page.widgets.map(w => ({
        id: w.id,
        type: w.type,
        name: w.name,
        data: w.data,
        order: w.order,
      }))}
      locale={locale}
      t={t}
      parentOptions={parentOptions}
    />
  )
}
