'use client'

import React from 'react'
import Image from 'next/image'
import { MapPin, Plane, Car, Waves, Utensils, Sparkles, Check, Info, BedDouble, Wine } from 'lucide-react'

export function FactsheetWidget({ data }: { data: any }) {
  if (!data || !data.hero) return null

  const handlePdfExport = () => {
    window.print()
  }

  return (
    <>
    {/* Print-specific styles */}
    <style jsx global>{`
      @media print {
        nav, footer, header, .no-print, .fixed { display: none !important; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        section { break-inside: avoid; }
        .print-container { max-width: 100% !important; }
      }
    `}</style>

    <div className="w-full bg-slate-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-hidden print-container">

      {/* ── PDF Export Button ── */}
      <div className="fixed bottom-8 right-8 z-50 no-print">
        <button
          onClick={handlePdfExport}
          className="flex items-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-full shadow-xl hover:bg-slate-800 hover:shadow-2xl transition-all text-sm font-bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          PDF İndir
        </button>
      </div>
      
      {/* ═══ 1. HERO SECTION ═══ */}
      <section className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {data.hero.image ? (
            <Image
              src={data.hero.image}
              alt="Blue Dreams Resort"
              fill
              className="object-cover object-center"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-amber-400 text-sm md:text-base uppercase tracking-[0.3em] font-semibold mb-6">
            {data.hero.tagline}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-serif mb-6 drop-shadow-lg leading-tight">
            {data.hero.title}
          </h1>
          <div className="w-24 h-0.5 bg-amber-400 mb-8 mx-auto" />
          <p className="text-slate-200 text-base md:text-lg lg:text-xl font-light tracking-wide whitespace-pre-line mb-8 drop-shadow-md">
            {data.hero.subtitle}
          </p>
          <p className="text-slate-100/90 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed">
            {data.hero.description}
          </p>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[1px] h-12 bg-gradient-to-b from-amber-400/0 via-amber-400 to-amber-400/0" />
        </div>
      </section>

      {/* ═══ 2. OVERVIEW STRIP ═══ */}
      {data.overview?.features?.length > 0 && (
        <section className="bg-slate-900 py-10 border-b border-amber-900/30">
          <div className="container mx-auto px-6">
            <div className={`grid grid-cols-2 md:grid-cols-${Math.min(data.overview.features.length, 4)} gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800`}>
              {data.overview.features.map((feature: string, i: number) => (
                <div key={i} className="pt-6 md:pt-0 px-4">
                  <span className="text-amber-500 font-serif text-lg lg:text-xl">{feature}</span>
                </div>
              ))}
            </div>
            {data.overview.highlights && (
              <p className="text-center text-slate-400 text-sm mt-6 max-w-2xl mx-auto">{data.overview.highlights}</p>
            )}
          </div>
        </section>
      )}

      {/* ═══ 3. LOCATION & CLIMATE ═══ */}
      {data.location && (
        <section className="py-24 bg-white relative">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
              <div className="w-full lg:w-1/2 space-y-8">
                <div>
                  <span className="text-amber-600 text-sm uppercase tracking-widest font-bold mb-3 block">
                    {data.location.subtitle}
                  </span>
                  <h2 className="text-4xl lg:text-5xl font-serif text-slate-900 mb-6 leading-tight">
                    {data.location.title}
                  </h2>
                  <div className="w-16 h-1 bg-amber-500 mb-6" />
                  <p className="text-slate-600 text-lg leading-relaxed font-light">
                    {data.location.description}
                  </p>
                </div>
                
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-start gap-4 mb-6">
                    <MapPin className="text-amber-500 shrink-0 mt-1" size={24} />
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{data.labels?.address || "Address"}</h4>
                      <p className="text-slate-600">{data.location.address}</p>
                    </div>
                  </div>
                  
                  {data.location.distances && (
                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">{data.labels?.distances || "Distances"}</h4>
                      {data.location.distances.map((dist: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-2">
                            {dist.label.toLowerCase().includes('airport') ? <Plane size={16} className="text-slate-400" /> : <Car size={16} className="text-slate-400" />}
                            {dist.label}
                          </span>
                          <span className="font-medium text-slate-900">{dist.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="w-full lg:w-1/2">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                  {data.location.image ? (
                    <Image
                      src={data.location.image}
                      alt="Resort Location"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-400" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══ 4. ACCOMMODATION ═══ */}
      {data.rooms?.length > 0 && (
        <section className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-amber-600 text-sm uppercase tracking-widest font-bold mb-3 block">
                {data.labels?.accommodation || "Accommodation"}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
                {data.labels?.roomsAndSuites || "Rooms & Suites"}
              </h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.rooms.map((room: any, i: number) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                  {room.image && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={room.image}
                        alt={room.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-serif text-slate-900 mb-2">{room.title}</h3>
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold mb-3">
                      {room.size}
                    </span>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {room.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 5. DINING ═══ */}
      {data.dining?.length > 0 && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-amber-600 text-sm uppercase tracking-widest font-bold mb-3 block">
                {data.labels?.gastronomy || "Gastronomy"}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
                {data.labels?.foodAndBeverage || "Food & Beverage"}
              </h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {data.dining.map((item: any, i: number) => (
                <div key={i} className="bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all duration-300 group">
                  {item.image && (
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-lg font-serif text-slate-900 mb-1">{item.title}</h3>
                    {item.cuisine && (
                      <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3">{item.cuisine}</span>
                    )}
                    <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 5b. BARS ═══ */}
      {data.bars?.length > 0 && (
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl font-serif text-slate-900 mb-4">
                {data.labels?.bars || "Bars"}
              </h2>
              <div className="w-12 h-1 bg-amber-500 mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {data.bars.map((bar: any, i: number) => (
                <div key={i} className="bg-white rounded-xl p-5 border border-slate-100 hover:shadow-md transition-all text-center">
                  <Wine className="text-amber-500 mx-auto mb-3" size={24} />
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{bar.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{bar.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 6. BEACH & POOLS ═══ */}
      {data.beachAndPools?.length > 0 && (
        <section className="py-24 bg-slate-900 text-white relative">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          
          <div className="container mx-auto px-6 lg:px-12 relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-amber-500 text-sm uppercase tracking-widest font-bold mb-3 block">
                {data.labels?.resortFacilities || "Resort Facilities"}
              </span>
              <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
                {data.labels?.beachAndPools || "Beach & Pools"}
              </h2>
              <div className="w-16 h-1 bg-amber-500 mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {data.beachAndPools.map((item: any, i: number) => (
                <div key={i} className="border-l-2 border-slate-700 pl-6 hover:border-amber-400 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <Waves className="text-amber-400" size={24} />
                    <h4 className="text-xl font-bold text-white">{item.title}</h4>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 7. FEATURE LISTS ═══ */}
      {data.features && (
        <section className="py-24 bg-white">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              
              {data.features.spa?.length > 0 && (
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                    <Sparkles className="text-amber-500" size={24} />
                    <h3 className="text-xl font-serif text-slate-900">{data.labels?.spaAndWellness || "Spa & Wellness"}</h3>
                  </div>
                  <ul className="space-y-4">
                    {data.features.spa.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                        <span className="text-slate-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.features.activities?.length > 0 && (
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                    <Waves className="text-amber-500" size={24} />
                    <h3 className="text-xl font-serif text-slate-900">{data.labels?.activities || "Activities"}</h3>
                  </div>
                  <ul className="space-y-4">
                    {data.features.activities.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                        <span className="text-slate-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {data.features.info?.length > 0 && (
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                    <Info className="text-amber-500" size={24} />
                    <h3 className="text-xl font-serif text-slate-900">{data.labels?.generalInfo || "General Info"}</h3>
                  </div>
                  <ul className="space-y-4">
                    {data.features.info.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span className="text-slate-600 text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </div>
          </div>
        </section>
      )}
    </div>
    </>
  )
}
