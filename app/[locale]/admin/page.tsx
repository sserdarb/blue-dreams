import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const pageCount = await prisma.page.count()
  const widgetCount = await prisma.widget.count()
  const activeChats = await prisma.chatSession.count({ where: { status: 'active' } })
  const mediaCount = await prisma.media.count()

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl text-gray-500">Total Pages</h3>
          <p className="text-4xl font-bold">{pageCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl text-gray-500">Total Widgets</h3>
          <p className="text-4xl font-bold">{widgetCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl text-gray-500">Media Files</h3>
          <p className="text-4xl font-bold">{mediaCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-xl text-gray-500">Active Chats</h3>
          <p className="text-4xl font-bold text-green-600">{activeChats}</p>
        </div>
      </div>
    </div>
  )
}
