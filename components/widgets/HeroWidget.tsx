'use client'

import { ChevronDown } from 'lucide-react'

interface HeroData {
  // Generic hero fields
  title?: string
  subtitle?: string
  imageUrl?: string
  youtubeUrl?: string
  ctaText?: string
  ctaUrl?: string
  overlayOpacity?: number
  textAlign?: 'left' | 'center' | 'right'
  // Homepage-style fields
  backgroundImage?: string
  badge?: string
  titleLine1?: string
  titleLine2?: string
  subtitle2?: string
  button1Text?: string
  button1Url?: string
  button2Text?: string
  button2Url?: string
  scrollText?: string
}

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
  // Determine if this is a "homepage-style" hero or a generic hero
  const isHomepageStyle = !!(data.titleLine1 || data.badge)
  const bgImage = data.backgroundImage || data.imageUrl
  const youtubeId = data.youtubeUrl ? extractYouTubeId(data.youtubeUrl) : null

  if (isHomepageStyle) {
    return (
      <div className="relative h-screen min-h-[700px] w-full bg-dark overflow-hidden">
        <div className="absolute inset-0">
          {bgImage && <img src={bgImage} alt="Hero" className="w-full h-full object-cover scale-105 animate-kenburns" />}
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
        </div>

        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center container mx-auto px-4">
          <div className="animate-fade-in-up space-y-6 max-w-4xl mx-auto">
            {data.badge && (
              <div className="inline-block border border-white/30 backdrop-blur-sm bg-white/10 px-6 py-2 rounded-full mb-4">
                <span className="text-white text-xs md:text-sm font-bold tracking-[0.3em] uppercase">{data.badge}</span>
              </div>
            )}
            <h1 className="flex flex-col items-center">
              {data.titleLine1 && <span className="text-5xl md:text-7xl lg:text-8xl font-serif text-white leading-[1.1] drop-shadow-2xl">{data.titleLine1}</span>}
              {data.titleLine2 && <span className="text-6xl md:text-8xl lg:text-9xl font-serif italic text-brand-light leading-[1] -mt-2 md:-mt-4 drop-shadow-2xl">{data.titleLine2}</span>}
            </h1>
            {(data.subtitle || data.subtitle2) && (
              <p className="text-white/90 text-sm md:text-lg font-light tracking-wider max-w-xl mx-auto mt-6 leading-relaxed drop-shadow-md">
                {data.subtitle} {data.subtitle2 && <><br className="hidden md:block" />{data.subtitle2}</>}
              </p>
            )}
            {(data.button1Text || data.button2Text) && (
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-10">
                {data.button1Text && (
                  <a href={data.button1Url || '#'} className="bg-brand hover:bg-white hover:text-brand text-white px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-sm shadow-xl hover:shadow-2xl">
                    {data.button1Text}
                  </a>
                )}
                {data.button2Text && (
                  <a href={data.button2Url || '#'} target="_blank" rel="noreferrer" className="border border-white text-white hover:bg-white hover:text-dark px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 rounded-sm shadow-md">
                    {data.button2Text}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {data.scrollText && (
          <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-30 animate-bounce text-white/70">
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest opacity-80">{data.scrollText}</span>
              <ChevronDown size={24} strokeWidth={1} />
            </div>
          </div>
        )}
      </div>
    )
  }

  // Generic hero style
  const overlayOpacity = data.overlayOpacity ?? 50
  const textAlign = data.textAlign || 'center'
  const alignClasses = { left: 'items-start text-left', center: 'items-center text-center', right: 'items-end text-right' }

  return (
    <div className="relative w-full h-[600px] md:h-[80vh] overflow-hidden">
      {youtubeId ? (
        <div className="absolute inset-0 pointer-events-none">
          <iframe src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&playlist=${youtubeId}`}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300%] h-[300%] min-w-full min-h-full"
            allow="autoplay; encrypted-media" style={{ border: 'none' }} />
        </div>
      ) : bgImage ? (
        <img src={bgImage} alt={data.title || 'Hero'} className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-blue-600" />
      )}

      <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity / 100 }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      <div className={`absolute inset-0 flex flex-col justify-center px-4 md:px-16 ${alignClasses[textAlign]}`}>
        <div className="max-w-4xl">
          {data.title && <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-white mb-4 md:mb-6 leading-tight">{data.title}</h1>}
          {data.subtitle && <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">{data.subtitle}</p>}
          {data.ctaText && (
            <a href={data.ctaUrl || '#'} className="inline-block bg-brand text-white hover:bg-white hover:text-brand font-bold py-4 px-10 text-sm uppercase tracking-wider transition-all shadow-lg">
              {data.ctaText}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
