import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import BookingWidget from '@/components/widgets/BookingWidget'
import { ChatWidget } from '@/components/chat/ChatWidget'
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker'
import { getMenuItems } from '@/app/actions/settings'

export default async function PublicLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    // Fetch dynamic menu items
    const dbMenuItems = await getMenuItems(locale)

    // Map to Navbar expected format
    const menuItems = dbMenuItems.map(item => ({
        label: item.title,
        url: item.url,
        // target: item.target 
    }))

    return (
        <div className="min-h-screen flex flex-col">
            <AnalyticsTracker />
            <Navbar locale={locale} menuItems={menuItems} />
            <div className="flex-1">
                {children}
            </div>
            <Footer locale={locale} />
            <BookingWidget />
            <ChatWidget locale={locale as any} />
        </div>
    )
}
