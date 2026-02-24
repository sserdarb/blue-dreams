import React from 'react'
import { headers } from 'next/headers'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

import { ThemeProvider } from '@/components/admin/ThemeProvider'
import { ModuleProvider } from '@/lib/modules/module-context'
import NotificationBell from '@/components/admin/NotificationBell'

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
    <ThemeProvider>
      <ModuleProvider>
        <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
          {/* Client-side Sidebar with Mobile Toggle */}
          <AdminSidebar locale={locale} t={t} />

          {/* Main Content */}
          <main className="transition-all duration-300 md:ml-64 pt-16 md:pt-0">
            {/* Top Bar with Notifications */}
            <div className="hidden md:flex items-center justify-end px-8 py-3 border-b border-slate-100 dark:border-slate-800">
              <NotificationBell />
            </div>
            <div className="p-4 md:p-8">
              {children}
            </div>
          </main>
        </div>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </ModuleProvider>
    </ThemeProvider>
  )
}

