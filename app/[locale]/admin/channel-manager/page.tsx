import React from 'react'
import ChannelManagerClient from './ChannelManagerClient'

export const dynamic = 'force-dynamic'

export default async function ChannelManagerPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <ChannelManagerClient />
        </div>
    )
}
