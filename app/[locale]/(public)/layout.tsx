import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import BookingWidget from '@/components/widgets/BookingWidget'
import { ChatWidget } from '@/components/chat/ChatWidget'
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker'

export default async function PublicLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params

    return (
        <div className="min-h-screen flex flex-col">
            <AnalyticsTracker />
            <Navbar />
            <div className="flex-1">
                {children}
            </div>
            <Footer />
            <BookingWidget />
            <ChatWidget locale={locale as any} />
        </div>
    )
}

