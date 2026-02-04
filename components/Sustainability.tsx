import React from 'react';

const Sustainability: React.FC = () => {
  return (
    <section className="relative h-[600px] w-full overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="https://bluedreamsresort.com/wp-content/uploads/2023/03/Club-Room-Sea-View-3.jpg" 
          alt="Nature Texture" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      {/* Content Box */}
      <div className="relative z-10 max-w-3xl mx-4 text-center">
         <h2 className="text-5xl md:text-7xl font-serif text-white mb-6 drop-shadow-md">
           Sürdürülebilirlik <br/>
           <span className="italic font-light text-brand-light">Taahhüdümüz</span>
         </h2>
         
         <div className="bg-black/30 backdrop-blur-md p-8 md:p-12 border border-white/10 rounded-sm">
           <p className="text-white text-lg font-light leading-relaxed mb-8">
             Yaşadığımız doğayı seviyoruz ve sorumluluk bilinciyle hareket ediyoruz. 
             Blue Dreams Resort olarak, plastik kullanımını azaltıyor, enerji verimliliğini artırıyor 
             ve yerel ekosistemi korumak için çalışıyoruz. Bu sadece bir trend değil, bir zihniyet.
           </p>
           
           <button className="bg-[#b45309] hover:bg-[#92400e] text-white px-8 py-3 text-xs font-bold tracking-widest uppercase transition-colors shadow-lg">
             Nasıl Yapıyoruz?
           </button>
         </div>
      </div>
    </section>
  );
};

export default Sustainability;