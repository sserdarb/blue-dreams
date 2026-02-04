import React from 'react';
import { ArrowRight } from 'lucide-react';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="bg-sand">
      
      {/* Block 1: Nature / Location */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="relative h-[500px] md:h-auto">
          <img 
            src="https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg" 
            alt="Doğa ve Odalar" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center p-12 md:p-20 bg-sand">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Doğa & Konfor</span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
            Doğa ile <br/>
            <span className="italic font-light">bütünleşin</span>
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed font-light">
            Torba'nın çam ormanlarıyla kaplı tepelerinde, Ege'nin turkuaz sularına nazır bir konum. 
            Müstakil girişli odalarımız ve doğal mimarimiz ile kalabalıktan uzak, kendinizle baş başa kalabileceğiniz 
            özel bir yaşam alanı sunuyoruz.
          </p>
          <a href="#rooms" className="bg-[#b08d55] hover:bg-[#9a7b4f] text-white px-8 py-3 w-fit text-xs font-bold tracking-widest uppercase rounded-sm transition-colors">
            Odaları Keşfet
          </a>
        </div>
      </div>

      {/* Block 2: Gastronomy (Reversed) */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="flex flex-col justify-center p-12 md:p-20 bg-white order-2 md:order-1">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">Gastronomi</span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
            Taze. Yerel. <br/>
            <span className="italic font-light">Sürdürülebilir.</span>
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed font-light">
            Blue Dreams mutfağında her tabak bir hikaye anlatır. Yerel üreticilerden temin edilen taze Ege otları, 
            günlük deniz ürünleri ve ödüllü şeflerimizin modern yorumlarıyla hazırlanan A la Carte restoranlarımızda 
            gerçek bir lezzet yolculuğuna çıkın.
          </p>
          <button className="bg-[#d97706] hover:bg-[#b45309] text-white px-8 py-3 w-fit text-xs font-bold tracking-widest uppercase rounded-sm transition-colors">
            Lezzetleri Tat
          </button>
        </div>
        <div className="relative h-[500px] md:h-auto order-1 md:order-2">
           <img 
            src="https://bluedreamsresort.com/wp-content/uploads/2023/03/ITALIAN-ALACART-1.jpg" 
            alt="Gastronomi" 
            className="w-full h-full object-cover"
          />
           {/* Inset small image style */}
           <div className="absolute bottom-10 left-10 w-40 h-40 border-4 border-white shadow-xl hidden lg:block overflow-hidden">
              <img 
                src="https://bluedreamsresort.com/wp-content/uploads/2023/03/OPEN-BUFFET-1.jpg" 
                alt="Detay" 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
           </div>
        </div>
      </div>

      {/* Block 3: Wellness / Relax */}
      <div className="grid grid-cols-1 md:grid-cols-2">
         <div className="relative h-[500px] md:h-auto">
          <img 
            src="https://bluedreamsresort.com/wp-content/uploads/2023/03/INFINITY-POOL-1.jpg" 
            alt="Wellness ve Havuz" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col justify-center p-12 md:p-20 bg-[#f0eee9]">
          <span className="text-xs font-bold tracking-widest uppercase text-gray-400 mb-4">İyi Hisset</span>
          <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mb-6 leading-tight">
            Rahatla. Yenilen. <br/>
            <span className="italic font-light">Keyfini Çıkar.</span>
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed font-light">
            Sonsuzluk havuzumuzda gün batımını izlerken veya Spa merkezimizin dingin atmosferinde ruhunuzu dinlendirirken 
            zamanın yavaşladığını hissedeceksiniz. Türk hamamı ritüelleri ve masaj terapileri ile kendinizi şımartın.
          </p>
          <button className="bg-brand hover:bg-brand-dark text-white px-8 py-3 w-fit text-xs font-bold tracking-widest uppercase rounded-sm transition-colors">
            Spa & Wellness
          </button>
        </div>
      </div>

    </section>
  );
};

export default Experience;