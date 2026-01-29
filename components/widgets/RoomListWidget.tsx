import Image from 'next/image'

export function RoomListWidget({ data }: { data: any }) {
  return (
    <div className="py-12 px-4 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">Our Rooms</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {data.rooms?.map((room: any, idx: number) => (
          <div key={idx} className="bg-white rounded-lg shadow-lg overflow-hidden group">
            <div className="relative h-64 w-full overflow-hidden">
               {room.imageUrl ? (
                <Image
                  src={room.imageUrl}
                  alt={room.title}
                  fill
                  className="object-cover transition duration-300 group-hover:scale-110"
                />
               ) : (
                 <div className="w-full h-full bg-gray-200" />
               )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{room.title}</h3>
              <p className="text-gray-600 mb-4">{room.description}</p>
              <button className="text-blue-600 font-semibold hover:underline">
                View Details &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
