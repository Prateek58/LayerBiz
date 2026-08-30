import React from 'react';
import { fetchAboutPage } from '@/lib/api';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Manifesto & Venture Engineering Philosophy | LayerBiz',
  description:
    'Discover the philosophy, engineering standards, and vision behind LayerBiz venture studio, our AI workflows, and micro-SaaS ecosystem.',
  alternates: {
    canonical: 'https://layerbiz.com/about',
  },
};

const DEFAULT_ABOUT_DATA = {
  title: 'The LayerBiz Protocol & Philosophy',
  paragraphs: [
    'We believe software is the fundamental leverage layer of modern business. We architect and build specialized, high-performance micro-SaaS products and practical AI workflows that solve complex problems with surgical precision.',
    'Founded for developers, solopreneurs, and fast-moving agencies who value lean architecture, zero-bloat code, and pragmatic AI execution. Every product, tool, and architectural blueprint in our ecosystem is engineered to be resilient, remarkably fast, and privacy-first.',
    'From edge-native architectures and zero-latency caching to automated AI task orchestrators, we document our engineering decisions in the open to help the community build, operate, and scale sustainable technology.',
  ],
  features: [
    { num: '01', title: 'Lean Systems', desc: 'Sub-50ms latency, zero-dependency tools, and edge compute.' },
    { num: '02', title: 'Pragmatic AI', desc: 'Task-driven orchestrators & practical workflows for builders.' },
    { num: '03', title: 'Micro-SaaS Velocity', desc: 'Decoupled architectures for rapid prototype-to-production.' },
    { num: '04', title: 'Open Engineering', desc: 'Publication-grade technical logs, blueprints, and transparent telemetry.' },
  ],
};

export default async function AboutPage() {
  const remoteData = await fetchAboutPage();

  const aboutData = {
    title: remoteData?.title || DEFAULT_ABOUT_DATA.title,
    paragraphs: Array.isArray(remoteData?.paragraphs) && remoteData.paragraphs.length > 0
      ? remoteData.paragraphs
      : DEFAULT_ABOUT_DATA.paragraphs,
    features: Array.isArray(remoteData?.features) && remoteData.features.length > 0
      ? remoteData.features
      : DEFAULT_ABOUT_DATA.features,
  };

  return (
    <div className="flex-1 bg-[#0b1120] p-6 sm:p-12 flex items-center justify-center overflow-y-auto font-sans">
      <div className="max-w-3xl w-full">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-xs font-mono">
          <Link
            href="/"
            className="text-slate-400 hover:text-white inline-flex items-center transition-colors bg-slate-900/60 border border-slate-800 px-2.5 py-1 rounded-md"
          >
            <i className="fas fa-home mr-1.5 text-orange-400 text-[11px]"></i> Home
          </Link>
          <span className="text-slate-700 select-none">/</span>
          <span className="text-orange-400 font-bold uppercase tracking-widest text-[10px]">
            Manifesto
          </span>
        </div>

        <div className="bg-[#1e293b] rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          {/* Terminal Window Header */}
          <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50"></div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 ml-2 uppercase tracking-widest truncate">
                About_LayerBiz.md
              </div>
            </div>
            <div className="text-[9px] font-mono text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              Protocol v2.0
            </div>
          </div>

          <div className="p-6 sm:p-10">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6 tracking-tight">
              {aboutData.title}
            </h1>

            <div className="space-y-4 sm:space-y-6 text-slate-300 font-sans text-sm sm:text-base leading-relaxed">
              {aboutData.paragraphs?.map((paragraph: string, index: number) => (
                <p key={index} className="flex gap-3 items-start">
                  <span className="text-orange-500 font-mono font-bold select-none">&gt;</span>
                  <span>{paragraph}</span>
                </p>
              ))}
            </div>

            {/* Feature Pillars Grid */}
            <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {aboutData.features?.map((feature: any, index: number) => (
                <div
                  key={index}
                  className="bg-[#0f172a] p-4 sm:p-5 rounded-xl border border-slate-800/90 hover:border-orange-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-orange-400 font-mono font-bold text-xs bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      {feature.num}
                    </span>
                    <span className="text-white text-xs font-bold uppercase tracking-wider">
                      {feature.title}
                    </span>
                  </div>
                  {feature.desc && (
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                      {feature.desc}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Action Links */}
            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <Link
                href="/blog"
                className="text-orange-400 hover:text-orange-300 font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Read Our Technical Logs</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
              <Link
                href="/contact"
                className="text-slate-400 hover:text-white inline-flex items-center gap-1.5 transition-colors"
              >
                <span>Direct Liaison</span>
                <i className="fas fa-envelope text-[10px] text-slate-500"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
