import { XCircle, ArrowLeft, PhoneCall, RotateCcw } from 'lucide-react'
import Link from 'next/link'

export default async function BookingFailedPage({
    params,
    searchParams
}: {
    params: Promise<{ locale: string }>,
    searchParams: Promise<{ reason?: string }>
}) {
    const { locale } = await params
    const { reason } = await searchParams

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4 py-20">
            <div className="max-w-lg w-full text-center">
                <div className="w-24 h-24 bg-red-500 rounded-full mx-auto mb-8 flex items-center justify-center shadow-xl shadow-red-200">
                    <XCircle size={48} className="text-white" />
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Ödeme Başarısız
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Ödemeniz işlenirken bir sorun oluştu. Kartınızdan herhangi bir tutar çekilmemiştir.
                </p>

                {reason && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-8">
                        <p className="text-sm text-red-600 font-medium">Hata Nedeni</p>
                        <p className="text-sm text-red-800 mt-1">{decodeURIComponent(reason)}</p>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8 text-left">
                    <h3 className="font-semibold text-gray-800 mb-3">Olası Nedenler:</h3>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            Kart limiti yetersiz olabilir
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            3D Secure doğrulaması zaman aşımına uğramış olabilir
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            Bankanız işlemi reddetmiş olabilir
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-red-400 mt-0.5">•</span>
                            İnternet bağlantınızda kesinti yaşanmış olabilir
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href={`/${locale}/odalar`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20"
                    >
                        <RotateCcw size={18} />
                        Tekrar Dene
                    </Link>
                    <Link
                        href={`/${locale}`}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-brand hover:text-brand transition-all"
                    >
                        <ArrowLeft size={18} />
                        Ana Sayfaya Dön
                    </Link>
                </div>

                <div className="mt-8 flex items-center justify-center gap-2 text-gray-500">
                    <PhoneCall size={16} />
                    <p className="text-sm">Yardım için: <a href="tel:+902523577300" className="text-brand font-medium hover:underline">+90 252 357 73 00</a></p>
                </div>
            </div>
        </div>
    )
}
