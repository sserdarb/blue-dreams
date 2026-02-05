import {
    Wifi, Coffee, Wind, Tv, Bath, Lock, Phone,
    Shirt, Snowflake, UtensilsCrossed, Waves, Users,
    Maximize, Mountain, Sunrise
} from 'lucide-react'

export interface Amenity {
    icon: string
    label: string
}

interface AmenityGridProps {
    amenities: Amenity[]
    columns?: 2 | 3 | 4
}

const iconMap: Record<string, React.ReactNode> = {
    'wifi': <Wifi size={24} />,
    'coffee': <Coffee size={24} />,
    'ac': <Wind size={24} />,
    'tv': <Tv size={24} />,
    'bath': <Bath size={24} />,
    'safe': <Lock size={24} />,
    'phone': <Phone size={24} />,
    'wardrobe': <Shirt size={24} />,
    'minibar': <Snowflake size={24} />,
    'room-service': <UtensilsCrossed size={24} />,
    'pool': <Waves size={24} />,
    'capacity': <Users size={24} />,
    'size': <Maximize size={24} />,
    'view': <Mountain size={24} />,
    'balcony': <Sunrise size={24} />,
}

export default function AmenityGrid({ amenities, columns = 4 }: AmenityGridProps) {
    const gridCols = {
        2: 'grid-cols-2',
        3: 'grid-cols-2 md:grid-cols-3',
        4: 'grid-cols-2 md:grid-cols-4',
    }

    return (
        <div className={`grid ${gridCols[columns]} gap-4`}>
            {amenities.map((amenity, index) => (
                <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-brand/5 transition-colors group"
                >
                    <div className="text-brand group-hover:scale-110 transition-transform">
                        {iconMap[amenity.icon] || <Wifi size={24} />}
                    </div>
                    <span className="text-gray-700 text-sm font-medium">
                        {amenity.label}
                    </span>
                </div>
            ))}
        </div>
    )
}
