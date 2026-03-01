import { getAdminTranslations } from '@/lib/admin-translations'
import MeetingsClient from './MeetingsClient'

export const metadata = {
    title: 'Toplantı (MICE) Talepleri - Blue Dreams Resort Admin',
}

export default async function MeetingsPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = await getAdminTranslations(locale as any)
    return <MeetingsClient locale={locale} t={t} />
}
