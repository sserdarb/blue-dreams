import React from 'react'
import { getTranslations } from 'next-intl/server'

export default async function ChannelManagerPage({ params }: { params: { locale: string } }) {
    const { locale } = await params

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Kanal Yöneticisi
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                    Online seyahat acenteleri (OTA) ve satış kanallarımızın yönetimi.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-white/10 text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Entegrasyon Hazırlık Aşamasında</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Kanal yöneticisi API bağlantıları ve OTA senkronizasyon özellikleri şu anda aktif edilmeyi bekliyor. Gerekli altyapı güncellemelerinden sonra kullanımınıza açılacaktır.
                </p>
            </div>
        </div>
    )
}
