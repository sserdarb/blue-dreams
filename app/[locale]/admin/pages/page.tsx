import { getPages } from '@/app/actions/admin'
import Link from 'next/link'
import { Edit, FileText, Globe } from 'lucide-react'

export default async function PageList({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const pages = await getPages()

  // Group pages by slug
  const groupedPages = pages.reduce((acc, page) => {
    if (!acc[page.slug]) {
      acc[page.slug] = { slug: page.slug, locales: {} }
    }
    acc[page.slug].locales[page.locale] = page
    return acc
  }, {} as Record<string, { slug: string, locales: Record<string, any> }>)

  const sortedGroups = Object.values(groupedPages).sort((a, b) => a.slug.localeCompare(b.slug))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sayfalar</h2>
          <p className="text-slate-500 text-sm mt-1">Web sitesindeki tüm içerik sayfalarını buradan yönetebilirsiniz.</p>
        </div>
        <Link
          href={`/${locale}/admin/pages/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FileText size={16} /> Yeni Sayfa
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sayfa (Slug)</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Diller & Durum</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sortedGroups.map((group) => (
              <tr key={group.slug} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-4">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <Globe size={16} className="text-slate-400" />
                    /{group.slug}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {['tr', 'en', 'de', 'ru'].map(lang => {
                      const page = group.locales[lang]
                      return (
                        <Link
                          key={lang}
                          href={page ? `/${locale}/admin/pages/${page.id}/editor` : `/${locale}/admin/pages/new?slug=${group.slug}&lang=${lang}`}
                          className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold border transition-all ${page
                              ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                              : 'bg-gray-50 text-gray-300 border-gray-100 hover:border-gray-300 hover:text-gray-500'
                            }`}
                          title={page ? `${page.title} (${lang.toUpperCase()}) - Düzenle` : `${lang.toUpperCase()} Oluştur`}
                        >
                          {lang.toUpperCase()}
                        </Link>
                      )
                    })}
                  </div>
                </td>
                <td className="p-4 text-right">
                  {group.locales['tr'] ? (
                    <Link
                      href={`/${locale}/admin/pages/${group.locales['tr'].id}/editor`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center gap-1"
                    >
                      <Edit size={14} /> Düzenle (TR)
                    </Link>
                  ) : (
                    <span className="text-gray-300 text-sm italic">Önce TR Ekle</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
