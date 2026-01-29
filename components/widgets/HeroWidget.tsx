import Image from 'next/image'

export function HeroWidget({ data }: { data: any }) {
  return (
    <div className="relative w-full h-[600px] md:h-[80vh]">
      {data.imageUrl && (
        <Image
          src={data.imageUrl}
          alt={data.title || 'Hero Image'}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      )}
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center text-center">
        <div className="text-white max-w-4xl px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{data.title}</h1>
          <p className="text-lg md:text-xl mb-8">{data.subtitle}</p>
          {data.ctaText && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition">
              {data.ctaText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
