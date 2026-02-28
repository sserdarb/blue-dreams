import React from 'react'
import { getAdminTranslations, AdminLocale } from '@/lib/admin-translations'
import CompetitorAnalysisClient from './CompetitorAnalysisClient'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function CompetitorsPage({ params }: PageProps) {
    const resolvedParams = await params
    const locale = (resolvedParams?.locale as AdminLocale) || 'tr'
    const t = getAdminTranslations(locale)

    return <CompetitorAnalysisClient locale={locale} t={t} />
}
