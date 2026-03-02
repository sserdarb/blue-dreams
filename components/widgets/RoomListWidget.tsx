import Image from 'next/image'
import Link from 'next/link'
import { ROOM_TYPES } from '@/lib/content'

export function RoomListWidget({ data }: { data: any }) {
  const roomsToDisplay = data?.rooms?.length > 0 ? data.rooms : ROOM_TYPES

  return (
    <div className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-brand text-xs font-bold tracking-[0.3em] uppercase mb-4 block">
            Konaklama Seçenekleri
          </span>
          <h2 className="text-4xl font-serif text-gray-900 mb-4">Oda Tiplerimiz</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Her bütçeye ve ihtiyaca uygun oda seçeneklerimiz ile unutulmaz bir tatil deneyimi yaşayın.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {roomsToDisplay.map((room: any, idx: number) => {
            const isFallback = !data?.rooms?.length
            // Fallback object uses 'heroImage' instead of 'imageUrl'
            const imgSource = isFallback ? room.heroImage : room.imageUrl
            // Fallback object uses 'slug' for link, whereas cms might not provide a link or uses id
            const linkHref = isFallback ? `/tr/odalar/${room.slug}` : `#`

            return (
              <Link
                href={linkHref}
                key={idx}
                className="group block bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col"
              >
                <div className="relative h-64 overflow-hidden shrink-0">
                  {imgSource ? (
                    <img
                      src={imgSource}
                      alt={room.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-brand text-[10px] font-bold tracking-[0.2em] uppercase">
                      {isFallback ? room.subtitle : 'Oda Detayları'}
                    </span>
                    <h3 className="text-2xl font-serif text-white mt-1">
                      {room.title}
                    </h3>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
                    {room.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-brand font-bold text-sm uppercase tracking-widest group-hover:tracking-[0.2em] transition-all">
                      Detayları Gör
                    </span>
                    <span className="w-8 h-8 flex items-center justify-center bg-brand text-white rounded-full group-hover:bg-brand-dark transition-colors text-lg">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
