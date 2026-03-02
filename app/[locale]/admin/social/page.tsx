import SocialClient from './SocialClient'

export const metadata = {
    title: 'Sosyal Medya Yapay Zeka Asistanı | Blue Dreams Resort',
}

export default async function SocialAdminPage() {
    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Sosyal Medya Yapay Zeka Asistanı</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">İçerik fikirleri üretin, taslaklar hazırlayın ve gönderilerinizi takvimleyin.</p>
            </div>

            <SocialClient />
        </div>
    )
}
