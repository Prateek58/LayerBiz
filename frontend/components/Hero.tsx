
import React from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
  return (
    <div className="flex-1 bg-[#0b1120] p-12 flex flex-col justify-center relative overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ea580c 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-bold tracking-widest uppercase mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          Next Gen Micro-SaaS
        </div>
        
        <h1 className="text-6xl md:text-7xl font-extrabold text-white leading-none tracking-tighter mb-8">
          Code the Future <br /> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            Build the Vision
          </span>
        </h1>
        
        <p className="text-xl text-slate-400 mb-10 leading-relaxed max-w-2xl">
          LayerBiz is a venture studio specializing in high-performance micro-SaaS. 
          We bridge the gap between complex engineering and elegant user experiences.
        </p>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/microsaas"
            className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-900/20 transition-all flex items-center gap-2 active:scale-95"
          >
            Explore Ecosystem <i className="fas fa-arrow-right text-xs"></i>
          </Link>
          <Link 
            href="/about"
            className="border border-slate-700 hover:border-slate-500 text-slate-300 px-8 py-4 rounded-xl font-bold transition-all active:scale-95"
          >
            Our Manifesto
          </Link>
        </div>
      </div>
      
      {/* Code Snippet Decor */}
      <div className="absolute bottom-12 right-12 opacity-20 hidden lg:block transform rotate-3 scale-110">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 font-mono text-[10px] text-slate-500 shadow-2xl">
          <p><span className="text-purple-400">const</span> <span className="text-blue-400">LayerBiz</span> = {'{'}</p>
          <p className="pl-4 text-emerald-400">mission: "Excellence",</p>
          <p className="pl-4 text-emerald-400">stack: ["Next.js", "Rust", "AI"],</p>
          <p className="pl-4 text-emerald-400">impact: "Global"</p>
          <p>{'}'};</p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
