'use client'

import React, { useState } from 'react'
import { Calendar as CalendarIcon, Users, Building, Phone, Mail, User, Send, CheckCircle2, Loader2, Info } from 'lucide-react'

export default function MeetingFormMessage() {
    const [submitting, setSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        const form = e.currentTarget
        const data = new FormData(form)
        const payload = Object.fromEntries(data.entries())

        // Ensure numerical values are parsed correctly before sending
        if (payload.attendees) {
            payload.attendees = String(parseInt(payload.attendees.toString(), 10))
        }

        try {
            const res = await fetch('/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const responseData = await res.json()
            if (res.ok && responseData.success) {
                setSuccess(true)
            } else {
                setError(responseData.error || 'Gönderim sırasında bir hata oluştu.')
            }
        } catch (err) {
            setError('Bağlantı hatası oluştu. Lütfen tekrar deneyin.')
        }
        setSubmitting(false)
    }

    if (success) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm text-center">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Talebiniz Alındı</h4>
                <p className="text-sm text-slate-500 mb-4">
                    Toplantı ve etkinlik talebiniz satış ekibimize ulaştı. En kısa sürede sizinle iletişime geçeceğiz.
                </p>
                <div className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 p-2 rounded flex items-center justify-center gap-1.5 mx-auto w-max">
                    <Info size={12} /> Size yardımcı olmaya devam edebilirim.
                </div>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm w-[90%] md:w-full space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-3">
                Toplantı / Grup Talebi
            </h4>

            {error && (
                <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 p-3 rounded-lg text-xs">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                <div className="grid grid-cols-1 gap-3">
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            name="contactName"
                            required
                            placeholder="Adınız Soyadınız"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                        />
                    </div>
                    <div className="relative">
                        <Building className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            name="companyName"
                            placeholder="Firma/Kurum Adı (Opsiyonel)"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="E-posta"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                        />
                    </div>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Telefon"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="date"
                            name="eventDate"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white text-slate-500 placeholder-slate-400"
                        />
                    </div>
                    <div className="relative">
                        <Users className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="number"
                            name="attendees"
                            placeholder="Kişi Sayısı"
                            min="1"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <textarea
                        name="description"
                        required
                        placeholder="Toplantı veya etkinliğinizin detaylarından kısaca bahsedin (Konaklama, salon düzeni, ikram vb.)"
                        rows={3}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:text-white resize-none"
                    ></textarea>
                </div>
            </div>

            <button
                type="submit"
                disabled={submitting}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
                {submitting ? (
                    <>
                        <Loader2 className="animate-spin" size={16} /> Gönderiliyor...
                    </>
                ) : (
                    <>
                        <Send size={16} /> Talebi Gönder
                    </>
                )}
            </button>
        </form>
    )
}
