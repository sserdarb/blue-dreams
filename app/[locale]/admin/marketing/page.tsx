export const dynamic = 'force-dynamic'

import MarketingClient from './MarketingClient'

export default async function MarketingPage({
    params
}: {
    params: Promise<{ locale: string }>
}) {
    return <MarketingClient />
}
