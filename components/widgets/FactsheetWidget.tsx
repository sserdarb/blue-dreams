'use client'

import React from 'react'
import Image from 'next/image'
import { MapPin, Plane, Car, Waves, Utensils, Sparkles, Check, Info, BedDouble } from 'lucide-react'

export interface FactsheetData {
  hero: {
    tagline: string;
    title: string;
    subtitle: string;
    description: string;
  };
  overview: {
    features: string[];
  };
  location: {
    subtitle: string;
    title: string;
    description: string;
    address: string;
    distances: { label: string; value: string }[];
    climate: string;
  };
  rooms: {
    title: string;
    size: string;
    description: string;
  }[];
  beachAndPools: {
    title: string;
    description: string;
  }[];
  dining: {
    title: string;
    description: string;
  }[];
  features: {
    spa: string[];
    activities: string[];
    info: string[];
  };
}

export function FactsheetWidget({ data }: { data: FactsheetData }) {
  if (!data || !data.hero) return null;

  return (
    <div className="w-full bg-slate-50 text-slate-800 font-sans selection:bg-amber-100 selection:text-amber-900 overflow-hidden">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full h-screen min-h-[600px] flex items-center justify-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/gallery/havuz.jpg" // Fallback to an existing image
            alt="Blue Dreams Resort Factsheet"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Elegant dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-900/40 to-slate-900/80" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
          <span className="text-amber-400 text-sm md:text-md uppercase tracking-[0.3em] font-semibold mb-6 animate-fade-in-up">
            {data.hero.tagline}
          </span>
          <h1 className="text-4xl md:text-6xl lg:text-7xl text-white font-serif mb-6 drop-shadow-lg leading-tight animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {data.hero.title}
          </h1>
          <div className="w-24 h-0.5 bg-amber-400 mb-8 mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }} />
          <p className="text-slate-200 text-base md:text-lg lg:text-xl font-light tracking-wide whitespace-pre-line mb-8 drop-shadow-md animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            {data.hero.subtitle}
          </p>
          <p className="text-slate-100/90 text-sm md:text-base max-w-2xl mx-auto font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {data.hero.description}
          </p>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-[1px] h-12 bg-gradient-to-b from-amber-400/0 via-amber-400 to-amber-400/0" />
        </div>
      </section>

      {/* 2. OVERVIEW STRIP */}
      {data.overview?.features?.length > 0 && (
        <section className="bg-slate-900 py-10 border-b border-amber-900/30">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
              {data.overview.features.map((feature, i) => (
                <div key={i} className="pt-6 md:pt-0 px-4">
                  <span className="text-amber-500 font-serif text-lg lg:text-xl">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. LOCATION & CLIMATE */}
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
                    <h4 className="font-bold text-slate-900 mb-1">Address</h4>
                    <p className="text-slate-600">{data.location.address}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">Distances</h4>
                  {data.location.distances.map((dist, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        {dist.label.toLowerCase().includes('airport') ? <Plane size={16} className="text-slate-400" /> : <Car size={16} className="text-slate-400" />}
                        {dist.label}
                      </span>
                      <span className="font-medium text-slate-900">{dist.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full lg:w-1/2">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/gallery/iskele.jpeg" // Fallback image
                  alt="Resort Location"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ACCOMMODATION (ROOMS) */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-amber-600 text-sm uppercase tracking-widest font-bold mb-3 block">
              Accommodation
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
              Rooms & Suites
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.rooms.map((room, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
                <BedDouble className="text-amber-400 mb-6 group-hover:scale-110 transition-transform duration-300" size={32} />
                <h3 className="text-xl font-serif text-slate-900 mb-2">{room.title}</h3>
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold mb-4">
                  {room.size}
                </span>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {room.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EXPERIENCES (POOLS, DINING, SPA, ACTIVITIES) */}
      <section className="py-24 bg-slate-900 text-white relative">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#fbbf24 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-amber-500 text-sm uppercase tracking-widest font-bold mb-3 block">
              Resort Facilities
            </span>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              A World of Experiences
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Pools & Beach */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Waves className="text-amber-400" size={28} />
                </div>
                <h3 className="text-2xl font-serif text-white">Beach & Pools</h3>
              </div>
              <div className="space-y-6">
                {data.beachAndPools.map((item, i) => (
                  <div key={i} className="border-l-2 border-slate-700 pl-6 hover:border-amber-400 transition-colors">
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dining */}
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-xl">
                  <Utensils className="text-amber-400" size={28} />
                </div>
                <h3 className="text-2xl font-serif text-white">Food & Beverage</h3>
              </div>
              <div className="space-y-6">
                {data.dining.map((item, i) => (
                  <div key={i} className="border-l-2 border-slate-700 pl-6 hover:border-amber-400 transition-colors">
                    <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FEATURES LISTS (SPA, ACTIVITIES, INFO) */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* SPA */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                <Sparkles className="text-amber-500" size={24} />
                <h3 className="text-xl font-serif text-slate-900">Spa & Wellness</h3>
              </div>
              <ul className="space-y-4">
                {data.features.spa.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Activities */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                <Waves className="text-amber-500" size={24} />
                <h3 className="text-xl font-serif text-slate-900">Activities</h3>
              </div>
              <ul className="space-y-4">
                {data.features.activities.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="text-emerald-500 shrink-0 mt-0.5" size={16} />
                    <span className="text-slate-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Info */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3 mb-6 border-b border-slate-200 pb-4">
                <Info className="text-amber-500" size={24} />
                <h3 className="text-xl font-serif text-slate-900">General Info</h3>
              </div>
              <ul className="space-y-4">
                {data.features.info.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="text-slate-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </section>
      
    </div>
  )
}
