import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Rooms from './components/Rooms';
import Experience from './components/Experience';
import Gallery from './components/Gallery';
import Reviews from './components/Reviews';
import Sustainability from './components/Sustainability';
import LocationMap from './components/LocationMap';
import Footer from './components/Footer';
import BookingWidget from './components/BookingWidget';
import LocalGuide from './components/LocalGuide';

function App() {
  return (
    <div className="font-sans antialiased text-gray-900 bg-sand">
      <Navbar />
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
      <Footer />
      <BookingWidget />
    </div>
  );
}

export default App;