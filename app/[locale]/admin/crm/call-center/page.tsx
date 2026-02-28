import React from 'react'
import { getAdminTranslations, AdminLocale } from '@/lib/admin-translations'
import CallCenterClient from './CallCenterClient'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function CallCenterPage({ params }: PageProps) {
    const resolvedParams = await params
    const locale = (resolvedParams?.locale as AdminLocale) || 'tr'
    const t = getAdminTranslations(locale)

    return <CallCenterClient locale={locale} t={t} />
}
