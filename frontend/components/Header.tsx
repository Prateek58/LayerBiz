'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
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
    <header className="h-14 border-b border-slate-800 bg-[#0f172a] flex items-center px-4 sm:px-6 gap-3 select-none shrink-0 z-20">
      {/* Mobile Hamburger Toggle Button */}
      <button
        onClick={onOpenMobileMenu}
        className="md:hidden text-slate-400 hover:text-white p-2 -ml-2 rounded-lg hover:bg-slate-800/60 transition-colors flex items-center justify-center"
        aria-label="Open Navigation Menu"
      >
        <i className="fas fa-bars text-base text-orange-500"></i>
      </button>

      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 sm:gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 truncate">
        <span className="text-slate-400 hidden sm:inline">LayerBiz</span>
        <i className="fas fa-chevron-right text-[8px] text-slate-600 hidden sm:inline"></i>
        <span className="text-slate-400 hidden sm:inline">Workspace</span>
        <i className="fas fa-chevron-right text-[8px] text-slate-600 hidden sm:inline"></i>
        <span className="text-orange-500 font-black truncate">{currentItem.name}</span>
      </nav>

      {/* Right-side status and indicators */}
      <div className="ml-auto flex items-center gap-3 sm:gap-6 shrink-0">
        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></span>
          <span className="hidden sm:inline">Mainnet Active</span>
          <span className="sm:hidden text-[9px] text-emerald-400 font-bold">LIVE</span>
        </div>
        <div className="h-4 w-px bg-slate-800"></div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-orange-500 transition-colors text-xs"
        >
          <i className="fab fa-github"></i>
        </a>
      </div>
    </header>
  );
};

export default Header;
