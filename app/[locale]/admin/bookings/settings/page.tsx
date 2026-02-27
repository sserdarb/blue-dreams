import PaymentSettingsClient from './PaymentSettingsClient'

export const metadata = {
    title: 'Ödeme Ayarları - Admin Panel',
}

export default async function PaymentSettingsPage() {

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <PaymentSettingsClient />
        </div>
    )
}
