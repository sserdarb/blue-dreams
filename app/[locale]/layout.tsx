import { ChatWidget } from '@/components/chat/ChatWidget'
import Link from 'next/link'

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-800">
      <header className="bg-white/90 backdrop-blur-md fixed top-0 w-full z-40 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={`/${locale}`} className="text-2xl font-bold text-blue-900 tracking-wider">
             BLUE DREAMS
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-bold text-gray-600">
            <Link href={`/${locale}/accommodation`} className="hover:text-blue-600 transition">ACCOMMODATION</Link>
            <Link href={`/${locale}/dining`} className="hover:text-blue-600 transition">DINING</Link>
            <Link href={`/${locale}/spa`} className="hover:text-blue-600 transition">SPA</Link>
            <Link href={`/${locale}/gallery`} className="hover:text-blue-600 transition">GALLERY</Link>
            <Link href={`/${locale}/contact`} className="hover:text-blue-600 transition">CONTACT</Link>
          </nav>
          <div className="flex gap-2 text-xs font-bold">
            <Link href="/en" className={`p-1 ${locale === 'en' ? 'text-blue-600' : 'text-gray-400'}`}>EN</Link>
            <Link href="/tr" className={`p-1 ${locale === 'tr' ? 'text-blue-600' : 'text-gray-400'}`}>TR</Link>
            <Link href="/de" className={`p-1 ${locale === 'de' ? 'text-blue-600' : 'text-gray-400'}`}>DE</Link>
            <Link href="/ru" className={`p-1 ${locale === 'ru' ? 'text-blue-600' : 'text-gray-400'}`}>RU</Link>
          </div>
        </div>
      </header>

      <main className="flex-1 mt-16">
        {children}
      </main>

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
                <h3 className="font-bold text-lg mb-4 tracking-wider">BLUE DREAMS RESORT</h3>
                <p className="text-gray-400 text-sm">Torba Mahallesi Herodot Bulvarı No:11 Bodrum / MUĞLA / TÜRKİYE</p>
            </div>
            <div>
                <h4 className="font-bold mb-4">Contact</h4>
                <p className="text-gray-400 text-sm">+90 252 337 11 11</p>
                <p className="text-gray-400 text-sm">sales@bluedreamsresort.com</p>
            </div>
             <div>
                <h4 className="font-bold mb-4">Links</h4>
                <Link href={`/${locale}/admin`} className="text-gray-400 text-sm hover:text-white block">Admin Panel</Link>
            </div>
        </div>
      </footer>

      <ChatWidget />
    </div>
  )
}
