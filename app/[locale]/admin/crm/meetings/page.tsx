import { getAdminTranslations } from '@/lib/admin-translations'
import MeetingsClient from './MeetingsClient'

export const metadata = {
    title: 'Toplantı (MICE) Talepleri - Blue Dreams Resort Admin',
}

export default async function MeetingsPage({
    params: { locale }
}: {
    params: { locale: string }
}) {
    const t = await getAdminTranslations(locale)
    return <MeetingsClient locale={locale} t={t} />
}
