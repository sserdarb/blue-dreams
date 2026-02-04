import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Calendar, Facebook, Instagram, Youtube, Search, Sparkles } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import AiAssistant from './AiAssistant';

// Real WhatsApp Brand Icon SVG
const WhatsAppIcon = ({ size = 20, className = "" }: { size?: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const languages = [
    { code: 'TR', label: 'Türkçe' },
    { code: 'EN', label: 'English' },
    { code: 'DE', label: 'Deutsch' },
    { code: 'RU', label: 'Русский' },
  ];

  const socialLinks = [
    { icon: <Facebook size={16} />, href: 'https://www.facebook.com/BlueDreamsResortBodrum' },
    { icon: <Instagram size={16} />, href: 'https://www.instagram.com/bluedreamsresort/' },
    { icon: <Youtube size={16} />, href: 'https://www.youtube.com/@BlueDreamsResort' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-black/95 backdrop-blur-sm shadow-lg' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className={`flex items-center justify-between px-4 md:px-8 lg:px-12 transition-all duration-500 ${isScrolled ? 'h-16 md:h-20' : 'h-20 md:h-32'}`}>
          
          {/* Logo Area */}
          <a href="#" className="flex flex-col justify-center leading-tight z-50 group">
            <img 
              src="https://bluedreamsresort.com/wp-content/uploads/2023/03/bdrlogonewwhites.png" 
              alt="Blue Dreams Resort" 
              className={`w-auto object-contain transition-all duration-500 group-hover:scale-105 ${isScrolled ? 'h-10 md:h-12' : 'h-12 md:h-20'}`}
            />
          </a>

          {/* Desktop Header Actions (Hidden on Mobile) */}
          <div className="hidden xl:flex items-center h-full space-x-6">
            
            {/* Social Icons */}
            <div className="flex items-center space-x-3 border-r border-white/20 pr-6">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-white/70 hover:text-brand transition-colors p-1"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            {/* Languages */}
            <div className="flex items-center space-x-3 text-[10px] font-bold tracking-widest text-white/80 border-r border-white/20 pr-6">
              {languages.map((lang) => (
                <button key={lang.code} className="hover:text-brand transition-colors">
                  {lang.code}
                </button>
              ))}
            </div>

            {/* AI Assistant Button - REDESIGNED */}
            <button 
              onClick={() => setIsAiOpen(true)}
              className="group relative flex items-center gap-2 bg-gradient-to-r from-brand to-brand-light hover:from-brand-dark hover:to-brand text-white px-5 py-2.5 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(8,145,178,0.5)] hover:shadow-[0_0_25px_rgba(8,145,178,0.7)] transform hover:-translate-y-0.5"
            >
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse group-hover:animate-none"></div>
              <Sparkles size={16} className="relative z-10" />
              <span className="relative z-10 text-[10px] font-bold tracking-[0.2em] uppercase">Blue Concierge</span>
            </button>

            {/* Quick Contact Icons */}
            <div className="flex items-center space-x-4">
              <button className="text-white hover:text-brand transition-colors" title="Ara">
                 <Search size={18} />
              </button>
              <a 
                href="https://wa.me/902523371111" 
                target="_blank" 
                rel="noreferrer"
                className="text-white hover:text-[#25D366] transition-colors" 
                title="WhatsApp"
              >
                <WhatsAppIcon size={18} />
              </a>
              <a 
                href="tel:+902523371111" 
                className="text-white hover:text-brand transition-colors" 
                title="Telefon"
              >
                <Phone size={18} />
              </a>
            </div>

            {/* Reservation Button */}
            <a 
              href="https://bluedreamsresort.com/rezervasyon"
              className="bg-white hover:bg-gray-100 text-dark px-6 py-2 text-[11px] font-bold tracking-[0.15em] uppercase transition-all duration-300 rounded-sm"
            >
              Online Rezervasyon
            </a>

            {/* Menu Toggle Text */}
            <button 
              className="flex items-center space-x-2 text-white hover:text-brand transition-colors group ml-4"
              onClick={() => setIsMobileMenuOpen(true)}
            >
               <span className="text-xs font-bold tracking-widest uppercase hidden 2xl:block">Menü</span>
               <div className="space-y-1.5 p-2">
                  <span className="block w-6 h-0.5 bg-current group-hover:w-8 transition-all duration-300"></span>
                  <span className="block w-6 h-0.5 bg-current transition-all duration-300"></span>
                  <span className="block w-6 h-0.5 bg-current group-hover:w-4 ml-auto transition-all duration-300"></span>
               </div>
            </button>
          </div>

          {/* Mobile Actions */}
          <div className="flex xl:hidden items-center gap-1">
             {/* Mobile AI Button - Icon Removed, Compact */}
             <button 
              onClick={() => setIsAiOpen(true)}
              className="flex items-center justify-center bg-gradient-to-r from-brand to-brand-light text-white px-2.5 py-1.5 rounded-full border border-white/20 shadow-lg shadow-brand/20 mr-1"
            >
              <span className="text-[9px] font-bold tracking-widest uppercase whitespace-nowrap">Blue Concierge</span>
            </button>

            {/* Mobile Contact Icons */}
            <a 
              href="https://wa.me/902523371111" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 text-white hover:text-[#25D366] transition-colors"
              title="WhatsApp"
            >
              <WhatsAppIcon size={18} />
            </a>
            
            <a 
              href="tel:+902523371111"
              className="p-2 text-white hover:text-brand transition-colors"
              title="Telefon"
            >
              <Phone size={18} />
            </a>

             <a 
              href="https://bluedreamsresort.com/rezervasyon"
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-[9px] font-bold tracking-widest uppercase rounded-sm border border-white/10 hidden sm:block"
            >
              Rezervasyon
            </a>
             <button 
              className="text-white p-2"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* AI Assistant Component */}
      <AiAssistant isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Full Screen Menu Overlay - Moved OUTSIDE of <nav> to prevent scroll/position issues */}
      <div
        className={`fixed inset-0 bg-dark z-[100] flex flex-col items-center justify-start pt-32 pb-10 px-6 md:justify-center md:py-10 transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {/* Close Button Inside Menu */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-6 right-6 md:top-10 md:right-12 text-white/50 hover:text-white hover:rotate-90 transition-all duration-300 p-4 border border-white/10 rounded-full z-[101]"
        >
          <X size={32} strokeWidth={1.5} />
        </button>

        {/* Container for content */}
        <div className="w-full h-full overflow-y-auto flex flex-col items-center">
          
          {/* Menu Items */}
          <div className="flex flex-col items-center space-y-6 md:space-y-4 mb-12 md:mb-8 text-center animate-fade-in-up">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-3xl md:text-4xl lg:text-5xl font-serif text-white hover:text-brand transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="border-t border-white/10 w-full max-w-2xl my-8 md:my-6"></div>

          {/* Action Buttons in Menu */}
          <div className="flex flex-col md:flex-row gap-4 w-full max-w-md md:max-w-2xl justify-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {/* Primary Action: Online Reservation */}
            <a 
              href="https://bluedreamsresort.com/rezervasyon"
              className="bg-brand hover:bg-brand-light text-white w-full md:w-auto md:px-8 py-4 text-sm font-bold tracking-widest uppercase rounded shadow-lg flex items-center justify-center gap-3 transition-transform hover:-translate-y-1"
            >
              <Calendar size={18} />
              <span className="md:hidden lg:inline">Online</span> Rezervasyon
            </a>

            {/* Secondary Actions: Call & WhatsApp */}
            <a 
              href="https://wa.me/902523371111" 
              className="border border-white/20 hover:border-[#25D366] hover:bg-[#25D366] hover:text-white text-white px-6 py-4 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all flex-1 md:flex-none"
            >
              <WhatsAppIcon size={18} />
              WhatsApp
            </a>
            
            <a 
              href="tel:+902523371111" 
              className="border border-white/20 hover:border-brand hover:bg-brand text-white px-6 py-4 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-all flex-1 md:flex-none"
            >
              <Phone size={18} />
              Ara
            </a>
          </div>

          {/* Languages Mobile */}
          <div className="flex justify-center flex-wrap gap-6 mt-10 md:mt-8 text-white/60 text-xs font-bold tracking-widest uppercase animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {languages.map((lang) => (
              <button key={lang.code} className="hover:text-white">{lang.code}</button>
            ))}
          </div>

          {/* Socials Mobile */}
          <div className="flex justify-center space-x-8 mt-8 md:mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {socialLinks.map((social, index) => (
              <a 
                key={index} 
                href={social.href} 
                className="text-white/60 hover:text-brand transition-colors"
              >
                {social.icon}
              </a>
            ))}
          </div>

          <div className="mt-8 text-center animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
             <a href="tel:+902523371111" className="text-white/40 text-sm tracking-widest hover:text-white transition-colors">
              +90 252 337 11 11
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;