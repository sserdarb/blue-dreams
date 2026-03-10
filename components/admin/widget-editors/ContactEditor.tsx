'use client'

import { useState } from 'react'
import { updateWidget } from '@/app/actions/admin'
import { Plus, Trash2, MapPin, Phone, Mail, Clock, Share2, HelpCircle } from 'lucide-react'
import { EditorSection, EditorField, EditorInput, EditorTextarea, EditorRepeater, SaveBar, EditorGrid2, EditorGrid3 } from './EditorUI'

interface Subject { value: string; label: string }

interface ContactData {
    infoLabel?: string
    infoHeading?: string
    infoHeadingAccent?: string
    address?: string
    phone?: string
    whatsapp?: string
    email?: string
    hours?: string
    socialLinks?: { facebook?: string; instagram?: string; youtube?: string; linkedin?: string }
    subjects?: Subject[]
}

export function ContactEditor({ id, initialData }: { id: string; initialData: string }) {
    const [data, setData] = useState<ContactData>(() => {
        try { return typeof initialData === 'string' ? JSON.parse(initialData) : initialData } catch { return {} }
    })
    const [isDirty, setIsDirty] = useState(false)
    const [saving, setSaving] = useState(false)

    const set = (field: keyof ContactData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
    }

    const socialLinks = data.socialLinks || {}
    const subjects = data.subjects || []

    const handleSave = async () => {
        setSaving(true)
        try { await updateWidget(id, data); setIsDirty(false) }
        catch (e) { console.error('Save failed:', e) }
        setSaving(false)
    }

    return (
        <div className="space-y-4">
            <EditorSection title="Başlık Alanı" icon={<Type size={14} />} defaultOpen>
                <EditorGrid3>
                    <EditorField label="Etiket (Badge)">
                        <EditorInput value={data.infoLabel || ''} onChange={v => set('infoLabel', v)} placeholder="İletişim Bilgileri" />
                    </EditorField>
                    <EditorField label="Başlık">
                        <EditorInput value={data.infoHeading || ''} onChange={v => set('infoHeading', v)} placeholder="Bize" />
                    </EditorField>
                    <EditorField label="Vurgulu Başlık">
                        <EditorInput value={data.infoHeadingAccent || ''} onChange={v => set('infoHeadingAccent', v)} placeholder="Ulaşın" />
                    </EditorField>
                </EditorGrid3>
            </EditorSection>

            <EditorSection title="İletişim Bilgileri" icon={<Phone size={14} />} defaultOpen>
                <EditorGrid2>
                    <EditorField label="Telefon">
                        <EditorInput value={data.phone || ''} onChange={v => set('phone', v)} placeholder="+90 252 337 11 11" type="tel" />
                    </EditorField>
                    <EditorField label="WhatsApp">
                        <EditorInput value={data.whatsapp || ''} onChange={v => set('whatsapp', v)} placeholder="+90 549 516 78 03" type="tel" />
                    </EditorField>
                </EditorGrid2>
                <div className="mt-3">
                    <EditorField label="E-posta">
                        <EditorInput value={data.email || ''} onChange={v => set('email', v)} placeholder="sales@bluedreamsresort.com" type="email" icon={<Mail size={14} />} />
                    </EditorField>
                </div>
            </EditorSection>

            <EditorSection title="Adres & Konum" icon={<MapPin size={14} />} defaultOpen={false}>
                <EditorField label="Açık Adres">
                    <EditorTextarea value={data.address || ''} onChange={v => set('address', v)} placeholder="Adres detayları..." rows={3} />
                </EditorField>
            </EditorSection>

            <EditorSection title="Çalışma Saatleri" icon={<Clock size={14} />} defaultOpen={false}>
                <EditorField label="Saatler">
                    <EditorTextarea value={data.hours || ''} onChange={v => set('hours', v)} placeholder="Resepsiyon: 7/24&#10;Rezervasyon: 09:00 - 22:00" rows={3} />
                </EditorField>
            </EditorSection>

            <EditorSection title="Sosyal Medya" icon={<Share2 size={14} />} defaultOpen={false}>
                <EditorGrid2>
                    <EditorField label="Facebook Bağlantısı">
                        <EditorInput value={socialLinks.facebook || ''} onChange={v => set('socialLinks', { ...socialLinks, facebook: v })} placeholder="https://facebook.com/..." type="url" />
                    </EditorField>
                    <EditorField label="Instagram Bağlantısı">
                        <EditorInput value={socialLinks.instagram || ''} onChange={v => set('socialLinks', { ...socialLinks, instagram: v })} placeholder="https://instagram.com/..." type="url" />
                    </EditorField>
                    <EditorField label="YouTube Bağlantısı">
                        <EditorInput value={socialLinks.youtube || ''} onChange={v => set('socialLinks', { ...socialLinks, youtube: v })} placeholder="https://youtube.com/..." type="url" />
                    </EditorField>
                    <EditorField label="LinkedIn Bağlantısı">
                        <EditorInput value={socialLinks.linkedin || ''} onChange={v => set('socialLinks', { ...socialLinks, linkedin: v })} placeholder="https://linkedin.com/..." type="url" />
                    </EditorField>
                </EditorGrid2>
            </EditorSection>

            <EditorSection title="İletişim Formu Konuları" icon={<HelpCircle size={14} />} badge={subjects.length} defaultOpen={false}>
                <EditorRepeater<Subject>
                    items={subjects}
                    onUpdate={items => set('subjects', items)}
                    createNewItem={() => ({ value: '', label: '' })}
                    addLabel="Konu Ekle"
                    emptyMessage="Henüz konu eklenmedi"
                    renderItem={(s, _i, update) => (
                        <EditorGrid2>
                            <EditorField label="Kısa Kod (Value)">
                                <EditorInput value={s.value} onChange={v => update({ ...s, value: v })} placeholder="reservation" />
                            </EditorField>
                            <EditorField label="Gösterilen İsim (Label)">
                                <EditorInput value={s.label} onChange={v => update({ ...s, label: v })} placeholder="Oda Rezervasyonu" />
                            </EditorField>
                        </EditorGrid2>
                    )}
                />
            </EditorSection>

            <SaveBar isDirty={isDirty} saving={saving} onSave={handleSave} />
        </div>
    )
}

function Type(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" x2="15" y1="20" y2="20" /><line x1="12" x2="12" y1="4" y2="20" /></svg>
}
