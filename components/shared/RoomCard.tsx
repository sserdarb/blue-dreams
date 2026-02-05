import { Wifi, Coffee, Wind, Tv, Bath, Lock, Users, Maximize } from 'lucide-react'

export interface RoomData {
    id: string
    title: string
    subtitle?: string
    description: string
    image: string
    gallery?: string[]
    size: string
    capacity: string
    view: string
    amenities: string[]
    features?: string[]
}

interface RoomCardProps {
    room: RoomData
    variant?: 'horizontal' | 'vertical'
    href?: string
}

const amenityIcons: Record<string, React.ReactNode> = {
    'Wifi': <Wifi size={18} />,
    'Kahve Makinesi': <Coffee size={18} />,
    'Klima': <Wind size={18} />,
    'Uydu TV': <Tv size={18} />,
    'Duş': <Bath size={18} />,
    'Kasa': <Lock size={18} />,
}

export default function RoomCard({ room, variant = 'vertical', href }: RoomCardProps) {
    const Component = href ? 'a' : 'div'

    if (variant === 'horizontal') {
        return (
            <Component
                href={href}
                className="group grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
            >
                {/* Image */}
                <div className="relative h-[300px] lg:h-[400px] overflow-hidden">
                    <img
                        src={room.image}
                        alt={room.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-8 lg:p-12 flex flex-col justify-center">
                    <span className="text-brand text-xs font-bold tracking-widest uppercase mb-2">
                        {room.subtitle || 'Oda'}
                    </span>
                    <h3 className="text-3xl font-serif text-gray-900 mb-4 group-hover:text-brand transition-colors">
                        {room.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">
                        {room.description}
                    </p>

                    {/* Quick Info */}
                    <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                            <Maximize size={16} /> {room.size}
                        </span>
                        <span className="flex items-center gap-1">
                            <Users size={16} /> {room.capacity}
                        </span>
                    </div>

                    {/* Amenities */}
                    <div className="flex flex-wrap gap-3">
                        {room.amenities.slice(0, 5).map((amenity, index) => (
                            <span
                                key={index}
                                className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full"
                            >
                                {amenityIcons[amenity] || null} {amenity}
                            </span>
                        ))}
                    </div>

                    {href && (
                        <div className="mt-8">
                            <span className="inline-flex items-center text-brand font-bold text-sm uppercase tracking-widest group-hover:gap-3 gap-2 transition-all">
                                Detayları İncele →
                            </span>
                        </div>
                    )}
                </div>
            </Component>
        )
    }

    // Vertical variant
    return (
        <Component
            href={href}
            className="group bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
        >
            {/* Image */}
            <div className="relative h-[280px] overflow-hidden">
                <img
                    src={room.image}
                    alt={room.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>

                {/* Size badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-gray-900">
                    {room.size}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <h3 className="text-xl font-serif text-gray-900 mb-2 group-hover:text-brand transition-colors">
                    {room.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
                    {room.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{room.view}</span>
                    <span className="flex items-center gap-1">
                        <Users size={14} /> {room.capacity}
                    </span>
                </div>
            </div>
        </Component>
    )
}
