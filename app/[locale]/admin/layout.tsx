import React from 'react'
import { headers } from 'next/headers'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = getAdminTranslations(locale as AdminLocale)

  // Check if this is the login page — render without sidebar
  const headersList = await headers()
  const pathname = headersList.get('x-next-url') || headersList.get('x-invoke-path') || ''
  const isLoginPage = pathname.includes('/login')

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-[#0f172a]">
      {/* Client-side Sidebar with Mobile Toggle */}
      <AdminSidebar locale={locale} t={t} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-[#0f172a] pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
