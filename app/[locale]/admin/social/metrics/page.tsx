import type { Metadata } from 'next'
import SocialMetricsClient from './SocialMetricsClient'

export const metadata: Metadata = {
    title: 'Sosyal Medya Metrikleri | Blue Dreams Resort',
    description: 'Kapsamlı sosyal medya analiz ve raporlama paneli'
}

export default function SocialMetricsPage() {
    return (
        <div className="p-6">
            <SocialMetricsClient />
        </div>
    )
}
