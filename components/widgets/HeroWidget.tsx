'use client'

import Image from 'next/image'

interface HeroData {
  title?: string
  subtitle?: string
  imageUrl?: string
  youtubeUrl?: string
  ctaText?: string
  ctaUrl?: string
  overlayOpacity?: number
  textAlign?: 'left' | 'center' | 'right'
}

// Extract YouTube video ID from various URL formats
function extractYouTubeId(url: string): string | null {
  if (!url) return null

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

export function HeroWidget({ data }: { data: HeroData }) {
  const youtubeId = data.youtubeUrl ? extractYouTubeId(data.youtubeUrl) : null
  const overlayOpacity = data.overlayOpacity ?? 30
  const textAlign = data.textAlign || 'center'

  const alignmentClasses = {
    left: 'items-start text-left',
    center: 'items-center text-center',
    right: 'items-end text-right'
  }

  return (
    <div className="relative w-full h-[600px] md:h-[80vh] overflow-hidden">
      {/* Background: YouTube Video or Image */}
      {youtubeId ? (
        <div className="absolute inset-0 pointer-events-none">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&playlist=${youtubeId}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] min-w-full min-h-full"
            allow="autoplay; encrypted-media"
            style={{ border: 'none' }}
          />
        </div>
      ) : data.imageUrl ? (
        <Image
          src={data.imageUrl}
          alt={data.title || 'Hero Image'}
          fill
          className="object-cover"
          priority
          unoptimized
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-600" />
      )}

      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black flex justify-center"
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className={`absolute inset-0 flex flex-col justify-center px-4 md:px-16 ${alignmentClasses[textAlign]}`}>
        <div className="max-w-4xl">
          {data.title && (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6 leading-tight">
              {data.title}
            </h1>
          )}

          {data.subtitle && (
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl">
              {data.subtitle}
            </p>
          )}

          {data.ctaText && (
            <a
              href={data.ctaUrl || '#'}
              className="inline-block bg-white text-blue-900 hover:bg-blue-100 font-bold py-3 md:py-4 px-8 md:px-10 rounded-full text-sm md:text-base uppercase tracking-wider transition-all transform hover:scale-105 shadow-lg"
            >
              {data.ctaText}
            </a>
          )}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-white/70 rounded-full" />
        </div>
      </div>
    </div>
  )
}
