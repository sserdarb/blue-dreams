import { getPages } from '@/app/actions/admin'
import Link from 'next/link'

export default async function PageList({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const pages = await getPages()

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Pages</h2>
        <Link
          href={`/${locale}/admin/pages/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Page
        </Link>
      </div>

      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Slug</th>
              <th className="p-4">Locale</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-medium">{page.title}</td>
                <td className="p-4 text-gray-500">{page.slug}</td>
                <td className="p-4 uppercase">{page.locale}</td>
                <td className="p-4 space-x-2">
                  <Link
                    href={`/${locale}/admin/pages/${page.id}/editor`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit Widgets
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
