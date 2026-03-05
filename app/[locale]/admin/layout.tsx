import React from 'react'
import { headers, cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getAdminTranslations, type AdminLocale } from '@/lib/admin-translations'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const dynamic = 'force-dynamic'

import { ThemeProvider } from '@/components/admin/ThemeProvider'
import { ModuleProvider } from '@/lib/modules/module-context'
import NotificationBell from '@/components/admin/NotificationBell'

import ChunkErrorHandler from '@/components/admin/ChunkErrorHandler'

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

  // Route-based access control for viewer role
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('admin_session')
  let sessionRole = 'admin'
  let sessionName = ''
  let sessionAvatar = ''
  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie.value)
      sessionRole = session.role || 'admin'
      sessionName = session.name || ''
      sessionAvatar = session.avatar || ''
      const allowedViewerPaths = ['/admin', '/admin/tasks', '/admin/profile']
      const isViewerRoute = allowedViewerPaths.some(p => pathname.endsWith(p)) || pathname.includes('/admin/tasks/')

      if (session.role === 'viewer' && !isViewerRoute && pathname.includes('/admin')) {
        redirect(`/${locale}/admin/tasks`)
      }
    } catch { }
  }

  return (
    <ThemeProvider>
      <ModuleProvider>
        <div className="min-h-screen bg-white dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 transition-colors duration-300">
          {/* Client-side Sidebar with Mobile Toggle */}
          <AdminSidebar locale={locale} t={t} userRole={sessionRole} userName={sessionName} userAvatar={sessionAvatar} />

          {/* Main Content */}
          <main className="transition-all duration-300 md:ml-64 pt-16 md:pt-0 overflow-x-hidden">
            {/* Top Bar with Notifications */}
            <div className="hidden md:flex items-center justify-end px-8 py-3 border-b border-slate-100 dark:border-slate-800">
              <NotificationBell />
            </div>
            <div className="p-4 md:p-8">
              <ChunkErrorHandler>
                {children}
              </ChunkErrorHandler>
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

