'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '../constants';

const Header = () => {
  const pathname = usePathname();
  
  // Find current item based on path
  const currentItem = NAV_ITEMS.find(item => {
    if (item.path === '/') return pathname === '/';
    return pathname.startsWith(item.path);
  }) || NAV_ITEMS[0];

  return (
    <header className="h-14 border-b border-slate-200 bg-white flex items-center px-6 gap-3 select-none">
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
        <span className="text-slate-500">LayerBiz</span>
        <i className="fas fa-chevron-right text-[8px] text-slate-300"></i>
        <span className="text-slate-500">Workspace</span>
        <i className="fas fa-chevron-right text-[8px] text-slate-300"></i>
        <span className="text-orange-600 font-black">{currentItem.name}</span>
      </nav>
      
      <div className="ml-auto flex items-center gap-6">
        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          Mainnet Active
        </div>
        <div className="h-6 w-px bg-slate-200"></div>
        <button className="text-slate-400 hover:text-orange-600 transition-colors">
             <i className="fas fa-bell"></i>
        </button>
      </div>
    </header>
  );
};

export default Header;
