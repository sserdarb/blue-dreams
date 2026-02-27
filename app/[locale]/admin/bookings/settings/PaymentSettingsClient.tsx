'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, CreditCard, ShieldAlert } from 'lucide-react'

type Installment = {
    id?: string;
    installments: number;
    commissionRate: number;
}

type ProviderSetting = {
    provider: string;
    apiKey: string;
    secretKey: string;
    merchantId: string;
    merchantSalt: string;
    mode: 'sandbox' | 'live';
    isActive: boolean;
    baseCommissionRate: number;
    installments: Installment[];
}

export default function PaymentSettingsClient() {
    const [iyzico, setIyzico] = useState<ProviderSetting>({
        provider: 'iyzico', apiKey: '', secretKey: '', merchantId: '', merchantSalt: '',
        mode: 'sandbox', isActive: false, baseCommissionRate: 0, installments: []
    })

    const [paytr, setPaytr] = useState<ProviderSetting>({
        provider: 'paytr', apiKey: '', secretKey: '', merchantId: '', merchantSalt: '',
        mode: 'sandbox', isActive: false, baseCommissionRate: 0, installments: []
    })

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchSettings()
    }, [])

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/payment-settings')
            const data = await res.json()
            if (data.settings && data.settings.length > 0) {
                const iyzData = data.settings.find((s: any) => s.provider === 'iyzico')
                const paytrData = data.settings.find((s: any) => s.provider === 'paytr')

                if (iyzData) setIyzico({
                    ...iyzData,
                    apiKey: iyzData.apiKey || '',
                    secretKey: iyzData.secretKey || ''
                })

                if (paytrData) setPaytr({
                    ...paytrData,
                    merchantId: paytrData.merchantId || '',
                    merchantSalt: paytrData.merchantSalt || '',
                    secretKey: paytrData.secretKey || '' // PayTR uses Merchant Key as Secret
                })
            }
        } catch (error) {
            console.error('Failed to fetch settings', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (providerData: ProviderSetting) => {
        setSaving(true)
        setMessage('')
        try {
            const res = await fetch('/api/admin/payment-settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(providerData)
            })
            if (res.ok) {
                setMessage(`${providerData.provider.toUpperCase()} ayarları başarıyla kaydedildi.`)
                setTimeout(() => setMessage(''), 3000)
            } else {
                setMessage(`Kayıt hatası: ${(await res.json()).error}`)
            }
        } catch (error) {
            setMessage('Bağlantı hatası oluştu.')
        } finally {
            setSaving(false)
        }
    }

    const ProviderForm = ({ state, setState, title }: { state: ProviderSetting, setState: any, title: string }) => {
        const isIyzico = state.provider === 'iyzico'

        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <div className="flex items-center justify-between border-b pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <CreditCard size={24} />
                        </div>
                        <h2 className="text-lg font-semibold text-gray-800">{title} Entegrasyonu</h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 font-medium">Mod:</span>
                        <select
                            value={state.mode}
                            onChange={(e) => setState({ ...state, mode: e.target.value })}
                            className={`text-sm rounded-lg px-3 py-1.5 border-0 font-medium ${state.mode === 'live' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}
                        >
                            <option value="sandbox">Sandbox (Test)</option>
                            <option value="live">Live (Canlı)</option>
                        </select>
                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                            <input type="checkbox" className="sr-only peer" checked={state.isActive} onChange={(e) => setState({ ...state, isActive: e.target.checked })} />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            <span className="ml-3 text-sm font-medium text-gray-700">Aktif</span>
                        </label>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* API Credentials */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <ShieldAlert size={16} className="text-orange-500" />
                            API Kimlik Bilgileri
                        </h3>
                        <p className="text-xs text-gray-500">Bu bilgiler veritabanında şifrelenerek saklanır.</p>

                        {isIyzico ? (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                                    <input type="text" value={state.apiKey} onChange={(e) => setState({ ...state, apiKey: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm" placeholder="sandbox-..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                                    <input type="password" value={state.secretKey} onChange={(e) => setState({ ...state, secretKey: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm" placeholder="••••••••••••" />
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Merchant ID</label>
                                    <input type="text" value={state.merchantId} onChange={(e) => setState({ ...state, merchantId: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm" placeholder="Mağaza No" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Key</label>
                                    <input type="password" value={state.secretKey} onChange={(e) => setState({ ...state, secretKey: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm" placeholder="••••••••••••" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Merchant Salt</label>
                                    <input type="password" value={state.merchantSalt} onChange={(e) => setState({ ...state, merchantSalt: e.target.value })} className="w-full px-4 py-2 bg-gray-50 border rounded-lg text-sm" placeholder="••••••••••••" />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Commission Settings */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-700">Komisyon & Taksit Ayarları</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tek Çekim Komisyonu (%)</label>
                            <input type="number" step="0.01" value={state.baseCommissionRate} onChange={(e) => setState({ ...state, baseCommissionRate: parseFloat(e.target.value) })} className="w-24 px-4 py-2 border rounded-lg text-sm" />
                        </div>

                        <div className="pt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Taksit Seçenekleri</label>
                            <div className="space-y-2">
                                {state.installments.map((inst, idx) => (
                                    <div key={idx} className="flex items-center gap-3">
                                        <div className="flex items-center gap-2">
                                            <input type="number" value={inst.installments} onChange={(e) => {
                                                const newInst = [...state.installments]; newInst[idx].installments = parseInt(e.target.value); setState({ ...state, installments: newInst })
                                            }} className="w-16 px-2 py-1.5 border rounded-md text-sm text-center" />
                                            <span className="text-sm text-gray-500">Taksit</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="number" step="0.01" value={inst.commissionRate} onChange={(e) => {
                                                const newInst = [...state.installments]; newInst[idx].commissionRate = parseFloat(e.target.value); setState({ ...state, installments: newInst })
                                            }} className="w-20 px-2 py-1.5 border rounded-md text-sm text-center" />
                                            <span className="text-sm text-gray-500">% Komisyon</span>
                                        </div>
                                        <button onClick={() => {
                                            const newInst = state.installments.filter((_, i) => i !== idx); setState({ ...state, installments: newInst })
                                        }} className="p-1.5 text-red-500 hover:bg-red-50 rounded-md">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}

                                <button onClick={() => setState({ ...state, installments: [...state.installments, { installments: 3, commissionRate: 0 }] })} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                                    <Plus size={16} /> Yeni Taksit Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                    <button
                        onClick={() => handleSave(state)}
                        disabled={saving}
                        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                    </button>
                </div>
            </div>
        )
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Ödeme Altyapısı (Sanal POS)</h1>
                    <p className="text-gray-500 text-sm mt-1">Sanal POS kimlik bilgilerini ve taksit komisyon oranlarını yönetin.</p>
                </div>
            </div>

            {message && (
                <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center justify-between">
                    <span>{message}</span>
                </div>
            )}

            <div className="grid gap-8">
                <ProviderForm state={iyzico} setState={setIyzico} title="iyzico" />
                <ProviderForm state={paytr} setState={setPaytr} title="PayTR" />
            </div>
        </div>
    )
}
