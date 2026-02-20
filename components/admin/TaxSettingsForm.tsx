'use client'

import { useState } from 'react'
import { updateTaxSettings } from '@/app/actions/settings'
import { Save, Receipt, Percent } from 'lucide-react'

interface TaxSettingsFormProps {
    initialRates: {
        vatAccommodation: number
        taxAccommodation: number
        vatFnb: number
    }
}

export default function TaxSettingsForm({ initialRates }: TaxSettingsFormProps) {
    const [rates, setRates] = useState(initialRates)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const totalAccommodationTax = rates.vatAccommodation + rates.taxAccommodation

    const handleSave = async () => {
        setSaving(true)
        try {
            await updateTaxSettings(rates)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
        } catch (err) {
            console.error('Tax settings save failed:', err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="max-w-2xl space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    <Receipt size={24} className="text-emerald-500" /> Vergi Ayarları
                </h2>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                    Raporlarda brüt/net hesaplamada kullanılan KDV ve diğer vergi oranları
                </p>
            </div>

            {/* Accommodation Taxes */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🏨 Konaklama Vergileri
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Konaklama KDV (%)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="100"
                                value={rates.vatAccommodation}
                                onChange={e => setRates(r => ({ ...r, vatAccommodation: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                            <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Varsayılan: %10</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Konaklama Vergisi (%)
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.5"
                                min="0"
                                max="100"
                                value={rates.taxAccommodation}
                                onChange={e => setRates(r => ({ ...r, taxAccommodation: parseFloat(e.target.value) || 0 }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            />
                            <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Varsayılan: %2</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        Toplam konaklama vergisi: <strong>%{totalAccommodationTax}</strong>
                    </span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-500 ml-auto">
                        Net = Brüt ÷ {(1 + totalAccommodationTax / 100).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* F&B Tax */}
            <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-white/10 p-6 space-y-5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    🍽️ F&B (Yiyecek & İçecek) Vergileri
                </h3>

                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                        F&B KDV (%)
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.5"
                            min="0"
                            max="100"
                            value={rates.vatFnb}
                            onChange={e => setRates(r => ({ ...r, vatFnb: parseFloat(e.target.value) || 0 }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                        <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Varsayılan: %20</p>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50"
                >
                    <Save size={16} />
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
                {saved && (
                    <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                        ✓ Kaydedildi
                    </span>
                )}
            </div>
        </div>
    )
}
