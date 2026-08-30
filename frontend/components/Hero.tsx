import React from 'react';
import Link from 'next/link';
import LogoBlockAnimator from './LogoBlockAnimator';

const Hero: React.FC = () => {
  return (
    <div className="flex-1 bg-[#0b1120] p-6 sm:p-12 flex flex-col justify-center relative overflow-hidden">
      {/* Decorative Grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#ea580c 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}
      ></div>

      <div className="max-w-4xl mx-auto relative z-10 w-full">
        {/* Animated Kinetic Logo Blocks Area */}
        <LogoBlockAnimator />

        <Link
          href="/blog"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-[10px] font-bold tracking-widest uppercase mb-6 transition-all group cursor-pointer w-fit"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          <span>Explore Engineering Logs &amp; AI Blueprints</span>
          <i className="fas fa-arrow-right text-[9px] group-hover:translate-x-1 transition-transform"></i>
        </Link>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight tracking-tighter mb-6 sm:mb-8">
          Architect &amp; Build <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
            AI-Powered Micro-SaaS
          </span>
        </h1>

        <p className="text-base sm:text-xl text-slate-300 mb-8 sm:mb-10 leading-relaxed max-w-2xl font-sans">
          LayerBiz is a venture studio and engineering lab. We build practical AI workflows, edge architectures, and high-performance micro-SaaS tools empowering solopreneurs and modern agencies to build faster and scale with zero bloat.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-wrap">
          <Link
            href="/microsaas"
            className="bg-orange-600 hover:bg-orange-500 text-white px-7 py-3.5 rounded-xl font-bold shadow-lg shadow-orange-900/20 transition-all flex items-center justify-center gap-2 active:scale-95 text-center text-sm sm:text-base"
          >
            Explore Ecosystem <i className="fas fa-arrow-right text-xs"></i>
          </Link>
          <Link
            href="/blog"
            className="border border-slate-700 hover:border-orange-500/50 hover:bg-slate-800/40 text-slate-200 px-7 py-3.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 text-center text-sm sm:text-base group"
          >
            <i className="fas fa-book-open text-xs text-orange-500 group-hover:scale-110 transition-transform"></i>
            Engineering Logs
          </Link>
          <Link
            href="/about"
            className="border border-slate-800 hover:border-slate-600 text-slate-400 hover:text-slate-300 px-6 py-3.5 rounded-xl font-bold transition-all active:scale-95 text-center text-sm sm:text-base"
          >
            Manifesto
          </Link>
        </div>
      </div>

      {/* Code Snippet Decor */}
      <div className="absolute bottom-8 right-8 opacity-20 hidden xl:block transform rotate-3 scale-105 pointer-events-none">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-mono text-[11px] text-slate-500 shadow-2xl">
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
