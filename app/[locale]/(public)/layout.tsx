import Navbar from '@/components/sections/Navbar'
import Footer from '@/components/sections/Footer'
import BookingWidget from '@/components/widgets/BookingWidget'

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
            <Navbar />
            <div className="flex-1">
                {children}
            </div>
            <Footer />
            <BookingWidget />
        </div>
    )
}
