export const dynamic = 'force-dynamic'

import MessagingClient from './MessagingClient'

export default async function MessagingPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Mesajlar</h1>
                <p className="text-slate-400">WhatsApp, Facebook ve Instagram mesajlarınızı yönetin.</p>
            </div>
            <MessagingClient />
        </div>
    )
}
