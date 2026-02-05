interface StructuredDataProps {
    locale?: string
}

export function HotelStructuredData({ locale = 'tr' }: StructuredDataProps) {
    const baseUrl = 'https://new.bluedreamsresort.com'

    const hotelData = {
        '@context': 'https://schema.org',
        '@type': 'Hotel',
        name: 'Blue Dreams Resort',
        description: locale === 'tr'
            ? "Bodrum'un Torba Koyu'nda 5 yıldızlı ultra her şey dahil tatil deneyimi."
            : locale === 'en'
                ? 'A 5-star ultra all-inclusive vacation experience in Bodrum Torba Bay.'
                : locale === 'de'
                    ? 'Ein 5-Sterne Ultra-All-Inclusive-Urlaubserlebnis in der Bucht von Bodrum Torba.'
                    : 'Пятизвездочный отдых по системе ультра все включено в бухте Торба, Бодрум.',
        image: 'https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg',
        url: `${baseUrl}/${locale}`,
        telephone: '+90 252 367 1362',
        email: 'info@bluedreamsresort.com',
        address: {
            '@type': 'PostalAddress',
            streetAddress: 'Torba Mahallesi, Herodot Bulvarı No:3',
            addressLocality: 'Bodrum',
            addressRegion: 'Muğla',
            postalCode: '48400',
            addressCountry: 'TR'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 37.0799,
            longitude: 27.4422
        },
        starRating: {
            '@type': 'Rating',
            ratingValue: 5
        },
        priceRange: '€€€',
        amenityFeature: [
            { '@type': 'LocationFeatureSpecification', name: 'Private Beach' },
            { '@type': 'LocationFeatureSpecification', name: 'Swimming Pool' },
            { '@type': 'LocationFeatureSpecification', name: 'Spa' },
            { '@type': 'LocationFeatureSpecification', name: 'Restaurant' },
            { '@type': 'LocationFeatureSpecification', name: 'Free WiFi' },
            { '@type': 'LocationFeatureSpecification', name: 'Fitness Center' },
            { '@type': 'LocationFeatureSpecification', name: 'Meeting Rooms' }
        ],
        numberOfRooms: 340,
        checkinTime: '14:00',
        checkoutTime: '12:00',
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '00:00',
            closes: '23:59'
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: 8.7,
            bestRating: 10,
            worstRating: 1,
            ratingCount: 2847
        }
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(hotelData) }}
        />
    )
}

export function BreadcrumbStructuredData({
    items,
    locale = 'tr'
}: {
    items: { name: string; url: string }[]
    locale?: string
}) {
    const baseUrl = 'https://new.bluedreamsresort.com'

    const breadcrumbData = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `${baseUrl}/${locale}${item.url}`
        }))
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
        />
    )
}
