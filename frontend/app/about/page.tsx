import React from 'react';
import { fetchAboutPage } from '@/lib/api';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Manifesto & Venture Engineering Philosophy',
  description:
    'Discover the philosophy, engineering standards, and vision behind LayerBiz venture studio and our micro-SaaS ecosystem.',
  alternates: {
    canonical: 'https://layerbiz.com/about',
  },
};

export default async function AboutPage() {
  const aboutData = await fetchAboutPage();

  if (!aboutData) {
    return <div className="text-white p-6 sm:p-12 font-mono text-sm">Loading or Failed to load...</div>;
  }

  return (
    <div className="flex-1 bg-[#0b1120] p-6 sm:p-12 flex items-center justify-center overflow-y-auto">
      <div className="max-w-2xl w-full">
        <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
            </div>
            <div className="text-[10px] font-mono text-slate-500 ml-2 uppercase tracking-widest truncate">About_LayerBiz.md</div>
          </div>
          <div className="p-6 sm:p-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-6">{aboutData.title}</h2>
            <div className="space-y-4 sm:space-y-6 text-slate-400 font-mono text-xs sm:text-sm leading-relaxed">
              {aboutData.paragraphs?.map((paragraph: string, index: number) => (
                <p key={index}>
                  <span className="text-orange-500 font-bold">&gt;</span> {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {aboutData.features?.map((feature: any, index: number) => (
                <div key={index} className="bg-[#0f172a] p-4 rounded-xl border border-slate-800">
                  <div className="text-orange-500 font-bold text-base sm:text-lg mb-1">{feature.num}</div>
                  <div className="text-white text-xs font-bold uppercase tracking-wider">{feature.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
