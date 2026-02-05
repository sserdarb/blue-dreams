import { getPages } from '@/app/actions/admin'
import Link from 'next/link'

// Default locale for admin panel (no longer under [locale] route)
const DEFAULT_LOCALE = 'tr'

export default async function PageList() {
  const locale = DEFAULT_LOCALE
  const pages = await getPages()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Sayfalar</h2>
        <Link
          href={`/admin/pages/new`}
          className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
        >
          Yeni Sayfa Oluştur
        </Link>
      </div>

      <div className="bg-slate-800 rounded-lg shadow overflow-hidden border border-slate-700">
        <table className="w-full text-left">
          <thead className="bg-slate-900 border-b border-slate-700">
            <tr>
              <th className="p-4 text-slate-300">Başlık</th>
              <th className="p-4 text-slate-300">Slug</th>
              <th className="p-4 text-slate-300">Dil</th>
              <th className="p-4 text-slate-300">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-4 font-medium text-white">{page.title}</td>
                <td className="p-4 text-slate-400">{page.slug}</td>
                <td className="p-4 uppercase text-slate-300">{page.locale}</td>
                <td className="p-4 space-x-2">
                  <Link
                    href={`/admin/pages/${page.id}/editor`}
                    className="text-cyan-400 hover:underline"
                  >
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
