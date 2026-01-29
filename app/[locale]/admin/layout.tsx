import React from 'react'
import Link from 'next/link'

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
        <nav className="space-y-4">
          <Link href={`/${locale}/admin`} className="block hover:text-blue-300">Dashboard</Link>
          <Link href={`/${locale}/admin/pages`} className="block hover:text-blue-300">Pages</Link>
          <Link href={`/${locale}/admin/files`} className="block hover:text-blue-300">File Manager</Link>
          <Link href={`/${locale}/admin/chat`} className="block hover:text-blue-300">Blue Concierge</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
