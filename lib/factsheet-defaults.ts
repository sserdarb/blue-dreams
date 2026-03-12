/**
 * Default Factsheet data — shared between the server page route and the client editor.
 * Kept separate from 'use client' components so it can be imported in server components.
 */
export const defaultFactsheetData = {
  hero: {
    tagline: "Where Nature Meets Elegance",
    title: "Every Dream Starts With Blue",
    subtitle: "FACTSHEET — SEASON 2026\nBODRUM / TORBA — TÜRKİYE",
    description: "A 5-star luxury beach resort located on a 55,000m² area in the private Zeytinlikahve Cove. It features a unique architecture that blends with the natural landscape of Bodrum.",
    image: "/images/dining/hero.jpg"
  },
  overview: {
    features: ["700m private sandy beach", "Five-star service standards", "Season 2026 Ready"]
  },
  location: {
    subtitle: "DESTINATION",
    title: "The Pearl of the Aegean",
    description: "Bodrum, known in antiquity as Halicarnassus, is a stunning coastal city on Turkey's southwestern Aegean coast. Famous for turquoise waters, white-washed architecture, and vibrant culture, it offers the perfect backdrop for a luxury getaway.",
    address: "Torba Mahallesi, Herodot Bulvarı No:11, Bodrum / Muğla / Türkiye",
    image: "/images/rooms/Club-Room-Sea-View-3.jpg",
    distances: [
      { label: "Bodrum Center", value: "10 km" },
      { label: "Milas-Bodrum Airport (BJV)", value: "25 km" },
      { label: "Nearest Town (Torba)", value: "2 km" }
    ],
    climate: "Mediterranean climate with 300+ days of sunshine."
  },
  rooms: [
    { title: "Club Room", size: "24m²", description: "Garden or partial sea views, hillside bungalow style.", image: "/images/rooms/club-room/clubroom.jpg" },
    { title: "Club Sea View Room", size: "24m²", description: "Panoramic Aegean views with private balconies.", image: "/images/rooms/Club-Room-Sea-View-1.jpg" },
    { title: "Club Family Room", size: "35-40m²", description: "Two separate bedrooms, ideal for families.", image: "/images/rooms/Family-Room-Sea-View-1.jpg" },
    { title: "Deluxe Sea View Room", size: "40m²", description: "Located in the main building, premium furnishings, expansive sea views.", image: "/images/rooms/Deluxe-Room-1.jpg" }
  ],
  beachAndPools: [
    { title: "Beach", description: "700m coastline with a mix of sand and private wooden piers. Features exclusive relaxing cabanas." },
    { title: "Infinity Pool", description: "Breathtaking views of the cove." },
    { title: "Activity Pool", description: "The heart of resort entertainment." }
  ],
  dining: [
    { title: "Main Restaurant", description: "International buffet with live cooking stations and theme nights.", image: "/images/dining/hero.jpg" },
    { title: "La Locanda", description: "Italian fine dining with wood-fired pizza and handmade pasta.", image: "/images/dining/lalocanda.jpg" },
    { title: "Halicarnassus", description: "Turkish & Seafood à la carte with fresh Aegean catches.", image: "/images/dining/halicarnassus.jpg" },
    { title: "Sunset Bar", description: "Cocktails and live music with panoramic sunset views.", image: "/images/dining/sunsetbar.jpg" }
  ],
  features: {
    spa: ["Turkish Bath (Hamam)", "Sauna", "Steam Room", "Indoor Pool", "Professional massage treatments"],
    activities: ["Windsurfing & Canoeing", "Tennis & Basketball", "Kids Club", "Live Music & Evening Shows"],
    info: ["Check-in: 14:00", "Check-out: 12:00", "High-speed WiFi", "Languages: TR, EN, DE, RU"]
  }
}
