'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { NAV_ITEMS } from '../constants';

interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const pathname = usePathname();

  // Find current item based on path
  const currentItem = NAV_ITEMS.find(item => {
    if (item.path === '/') return pathname === '/';
    return pathname.startsWith(item.path);
  }) || NAV_ITEMS[0];

  return (
    <header className="h-14 border-b border-slate-800 bg-[#0f172a] flex items-center px-3 sm:px-6 gap-2 sm:gap-3 select-none shrink-0 z-20">
      {/* Mobile Hamburger Toggle Button */}
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors flex items-center justify-center"
        aria-label="Open Navigation Menu"
      >
        <i className="fas fa-bars text-base text-orange-500"></i>
      </button>

      {/* Direct Home Navigation Link (Always accessible on Mobile and Desktop) */}
      <Link
        href="/"
        className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
        title="Go to Home"
      >
        <i className="fas fa-house text-xs text-orange-400"></i>
        <span className="text-[11px] font-mono font-bold tracking-tight text-white hidden xs:inline">
          Layer<span className="text-orange-500">Biz</span>
        </span>
      </Link>

      <span className="text-slate-700 text-xs select-none">/</span>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">
        <span className="text-slate-400 hidden sm:inline">Workspace</span>
        <i className="fas fa-chevron-right text-[8px] text-slate-600 hidden sm:inline"></i>
        <span className="text-orange-400 font-black truncate">{currentItem.name}</span>
      </nav>

      {/* Right-side status and indicators */}
      <div className="ml-auto flex items-center gap-2 sm:gap-6 shrink-0">
        <Link
          href="/"
          className="md:hidden text-[10px] font-mono text-slate-400 hover:text-orange-400 bg-slate-900 border border-slate-800 px-2 py-1 rounded-md transition-colors flex items-center gap-1"
        >
          <i className="fas fa-home text-[9px] text-orange-400"></i>
          <span>Home</span>
        </Link>
        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></span>
          <span className="hidden sm:inline">Mainnet Active</span>
          <span className="sm:hidden text-[9px] text-emerald-400 font-bold hidden xs:inline">LIVE</span>
        </div>
        <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-orange-500 transition-colors text-xs hidden sm:inline"
          aria-label="GitHub Repository"
        >
          <i className="fab fa-github"></i>
        </a>
      </div>
    </header>
  );
};

export default Header;
