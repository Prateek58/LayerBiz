import React from 'react';

export default function AboutPage() {
  return (
    <div className="flex-1 bg-[#0b1120] p-12 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="bg-[#0f172a] px-4 py-2 border-b border-slate-800 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 ml-2 uppercase tracking-widest">About_LayerBiz.md</div>
          </div>
          <div className="p-10">
            <h2 className="text-3xl font-bold text-white mb-6">The LayerBiz Protocol</h2>
            <div className="space-y-6 text-slate-400 font-mono text-sm leading-relaxed">
              <p>
                <span className="text-orange-500 font-bold">&gt;</span> We believe software is the fundamental layer of modern business. Our mission is to build specialized, high-performance micro-SaaS that solves complex problems with surgical precision.
              </p>
              <p>
                <span className="text-orange-500 font-bold">&gt;</span> Founded by developers who value code quality, user privacy, and zero-bloat architecture. Every product in our ecosystem is built to be resilient and remarkably fast.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-4">
              <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                <div className="text-orange-500 font-bold text-lg mb-1">01</div>
                <div className="text-white text-xs font-bold uppercase tracking-wider">Lean Systems</div>
              </div>
              <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                <div className="text-orange-500 font-bold text-lg mb-1">02</div>
                <div className="text-white text-xs font-bold uppercase tracking-wider">Human Design</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
