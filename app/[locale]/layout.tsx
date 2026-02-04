import { ChatWidget } from '@/components/chat/ChatWidget'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getSiteSettings, getMenuItems, getActiveLanguages, seedDefaultLanguages } from '@/app/actions/settings'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  // Ensure default languages exist
  await seedDefaultLanguages()

  // Fetch dynamic data
  const [settings, menuItems, languages] = await Promise.all([
    getSiteSettings(locale),
    getMenuItems(locale),
    getActiveLanguages()
  ])

  // Transform menu items for Header component
  const headerMenuItems = menuItems.map(item => ({
    id: item.id,
    label: item.label,
    url: item.url,
    target: item.target
  }))

  // Transform languages for Header component
  const headerLanguages = languages.map(lang => ({
    code: lang.code,
    name: lang.name,
    nativeName: lang.nativeName || undefined,
    flag: lang.flag || undefined
  }))

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <Header
        settings={settings}
        menuItems={headerMenuItems}
        languages={headerLanguages}
        locale={locale}
      />

      <main className="flex-1 mt-16">
        {children}
      </main>

      <Footer settings={settings} locale={locale} />

      <ChatWidget />
    </div>
  )
}
