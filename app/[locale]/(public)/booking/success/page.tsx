import { CheckCircle2, ArrowLeft, Mail } from 'lucide-react'
import Link from 'next/link'

export default async function BookingSuccessPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>,
    searchParams: Promise<{ ref?: string }>
}) {
    const { locale } = await params
    const { ref } = await searchParams

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4 py-20">
            <div className="max-w-lg w-full text-center">
                <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl shadow-emerald-200 animate-bounce">
                    <CheckCircle2 size={48} className="text-white" />
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Ödemeniz Başarılı!
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Rezervasyonunuz onaylanmıştır. Kısa süre içinde onay e-postası gönderilecektir.
                </p>

                {ref && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8">
                        <p className="text-sm text-emerald-600 font-medium mb-1">Rezervasyon Referans Numaranız</p>
                        <p className="text-3xl font-mono font-black text-emerald-800 tracking-wider">{ref}</p>
                        <p className="text-xs text-emerald-500 mt-2">Bu numarayı lütfen saklayınız</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <Mail size={20} className="text-brand" />
                        <h3 className="font-semibold text-gray-800">E-posta Onayı</h3>
                    </div>
                    <p className="text-sm text-gray-500">
                        Rezervasyon detaylarınız ve ödeme bilgileriniz belirttiğiniz e-posta adresine gönderilmiştir.
                        Lütfen spam/gereksiz klasörünüzü de kontrol ediniz.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href={`/${locale}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                    >
                        <ArrowLeft size={18} />
                        Ana Sayfaya Dön
                    </Link>
                    <Link
                        href={`/${locale}/odalar`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-brand hover:text-brand transition-all"
                    >
                        Odaları İncele
                    </Link>
                </div>
            </div>
        </div>
    )
}
