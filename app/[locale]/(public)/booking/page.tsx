import { Metadata } from 'next'
import BookingClient from './BookingClient'

const seo: Record<string, { title: string; description: string }> = {
    tr: { title: 'Rezervasyon | Blue Dreams Resort', description: 'Blue Dreams Resort Torba\'da en iyi fiyatlarla doğrudan rezervasyon yapın. Gerçek zamanlı müsaitlik ve anında onay.' },
    en: { title: 'Book Your Stay | Blue Dreams Resort', description: 'Book directly at Blue Dreams Resort Torba for the best rates. Real-time availability and instant confirmation.' },
    de: { title: 'Reservierung | Blue Dreams Resort', description: 'Buchen Sie direkt im Blue Dreams Resort Torba zum besten Preis. Echtzeitverfügbarkeit und sofortige Bestätigung.' },
    ru: { title: 'Бронирование | Blue Dreams Resort', description: 'Забронируйте напрямую в Blue Dreams Resort Torba по лучшей цене. Доступность в реальном времени.' },
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    const s = seo[locale] || seo.en
    return {
        title: s.title,
        description: s.description,
        openGraph: { title: s.title, description: s.description, type: 'website' },
        alternates: {
            canonical: `https://new.bluedreamsresort.com/${locale}/booking`,
            languages: { tr: '/tr/booking', en: '/en/booking', de: '/de/booking', ru: '/ru/booking' }
        }
    }
}

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params
    return <BookingClient locale={locale} />
}
