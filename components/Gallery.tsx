import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

interface GalleryImage {
  src: string;
  category: string;
  title: string;
  className?: string;
}

const Gallery: React.FC = () => {
  const allImages: GalleryImage[] = [
    {
      src: "https://bluedreamsresort.com/wp-content/uploads/2025/07/DJI_0302.jpg",
      category: "Genel",
      title: "Kuş Bakışı Blue Dreams",
    },
    {
      src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg",
      category: "Plaj & Havuz",
      title: "Sonsuzluk Havuzu",
    },
    {
      src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Deluxe-Room-5.jpg",
      category: "Odalar",
      title: "Deluxe Oda Detayları",
    },
    {
      src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/SANDY-BEACH-1.jpg",
      category: "Plaj & Havuz",
      title: "Özel Plaj",
    },
    {
      src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg",
      category: "Gastronomi",
      title: "İtalyan A la Carte",
    },
    {
      src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg",
      category: "Odalar",
      title: "Club Oda Manzarası",
    },
    {
      src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg",
      category: "Gastronomi",
      title: "Açık Büfe Sunumu",
    },
    {
      src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-2.jpg",
      category: "Plaj & Havuz",
      title: "Gün Batımı ve Havuz",
    },
    {
      src: "https://bluedreamsresort.com/wp-content/uploads/2023/03/Family-Room-Sea-View-6.jpg",
      category: "Odalar",
      title: "Aile Suiti Konforu",
    }
  ];

  const categories = ["Tümü", "Odalar", "Plaj & Havuz", "Gastronomi"];
  const [activeCategory, setActiveCategory] = useState("Tümü");
  const [filteredImages, setFilteredImages] = useState(allImages);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (activeCategory === "Tümü") {
      setFilteredImages(allImages);
    } else {
      setFilteredImages(allImages.filter(img => img.category === activeCategory));
    }
  }, [activeCategory]);

  const openModal = (index: number) => {
    setSelectedIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = useCallback(() => {
    setSelectedIndex(null);
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev !== null ? (prev + 1) % filteredImages.length : null));
    }
  }, [selectedIndex, filteredImages.length]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev !== null ? (prev - 1 + filteredImages.length) % filteredImages.length : null));
    }
  }, [selectedIndex, filteredImages.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, closeModal, nextImage, prevImage]);

  return (
    <section id="gallery" className="py-24 bg-white relative">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header & Filter */}
        <div className="flex flex-col items-center mb-16 space-y-8">
          <div className="text-center animate-fade-in-up">
            <span className="text-brand text-xs font-bold tracking-[0.3em] uppercase block mb-3">Keşfet</span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900">Görsel Hikayemiz</h2>
          </div>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all duration-300 rounded-full border ${
                  activeCategory === cat 
                    ? 'bg-brand text-white border-brand shadow-lg transform -translate-y-1' 
                    : 'bg-transparent text-gray-500 border-gray-200 hover:border-brand hover:text-brand'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Masonry Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredImages.map((image, index) => (
            <div 
              key={`${image.src}-${index}`} 
              className="break-inside-avoid relative group overflow-hidden cursor-pointer rounded-sm shadow-md hover:shadow-xl transition-all duration-500"
              onClick={() => openModal(index)}
            >
              <div className="overflow-hidden">
                <img 
                  src={image.src} 
                  alt={image.title} 
                  className="w-full h-auto object-cover transition-transform duration-1000 group-hover:scale-110" 
                />
              </div>
              
              {/* Elegant Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="text-brand-light text-[10px] font-bold tracking-[0.2em] uppercase mb-2 block">
                    {image.category}
                  </span>
                  <h3 className="text-white font-serif text-2xl italic">
                    {image.title}
                  </h3>
                </div>
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                  <ZoomIn size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Fullscreen Lightbox */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
          onClick={closeModal}
        >
          <button 
            onClick={closeModal} 
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-20 hover:rotate-90 duration-300 p-2"
          >
            <X size={32} strokeWidth={1} />
          </button>

          <button 
            onClick={prevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-20 p-3 border border-white/10 rounded-full hover:bg-white/10 hover:scale-110"
          >
            <ChevronLeft size={32} />
          </button>

          <div className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center p-2 md:p-8">
            <img
              src={filteredImages[selectedIndex].src}
              alt={filteredImages[selectedIndex].title}
              className="max-h-[85vh] max-w-full object-contain shadow-2xl rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-6 text-center">
              <h3 className="text-white font-serif text-3xl mb-2 italic">{filteredImages[selectedIndex].title}</h3>
              <div className="inline-block px-4 py-1 border border-white/20 rounded-full">
                <p className="text-brand-light text-[10px] font-bold tracking-[0.2em] uppercase">{filteredImages[selectedIndex].category}</p>
              </div>
            </div>
          </div>

          <button 
            onClick={nextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all z-20 p-3 border border-white/10 rounded-full hover:bg-white/10 hover:scale-110"
          >
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </section>
  );
};

export default Gallery;