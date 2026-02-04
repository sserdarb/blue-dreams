import Hero from '@/components/sections/Hero'
import About from '@/components/sections/About'
import Rooms from '@/components/sections/Rooms'
import Experience from '@/components/sections/Experience'
import LocalGuide from '@/components/sections/LocalGuide'
import Gallery from '@/components/sections/Gallery'
import Reviews from '@/components/sections/Reviews'
import Sustainability from '@/components/sections/Sustainability'
import LocationMap from '@/components/sections/LocationMap'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params

  return (
    <div className="font-sans antialiased text-gray-900 bg-sand">
      <main>
        <Hero />
        <About />
        <Rooms />
        <Experience />
        <LocalGuide />
        <Gallery />
        <Reviews />
        <Sustainability />
        <LocationMap />
      </main>
    </div>
  )
}
