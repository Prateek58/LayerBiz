'use client';

import React from 'react';
import { NAV_ITEMS } from '../constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const sidebarContent = (
    <div className="w-72 bg-[#0f172a] border-r border-slate-800 flex flex-col h-full select-none shrink-0">
      {/* Brand Header */}
      <div className="p-6 flex items-center justify-between">
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-2">
          <svg
            width="32"
            height="32"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-orange-500"
          >
            <rect x="6" y="22" width="12" height="12" rx="1.5" fill="currentColor" />
            <rect x="14" y="14" width="12" height="12" rx="1.5" fill="currentColor" fillOpacity="0.8" />
            <rect x="22" y="6" width="12" height="12" rx="1.5" fill="currentColor" fillOpacity="0.6" />
          </svg>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Layer<span className="text-orange-500">Biz</span>
          </h1>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg bg-slate-800/50"
          aria-label="Close Navigation"
        >
          <i className="fas fa-times text-sm"></i>
        </button>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 px-2">
          Project Explorer
        </h2>

        <div className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              onClick={handleLinkClick}
              className={`w-full flex flex-col px-3 py-2.5 rounded-lg transition-all duration-200 group border ${
                isActive(item.path)
                  ? 'bg-[#1e293b] text-slate-100 border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:bg-[#1e293b]/50 hover:text-slate-300 border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <i className={`fas ${item.icon} text-xs ${isActive(item.path) ? 'text-orange-500' : 'text-slate-500 group-hover:text-slate-300'}`}></i>
                <span className="text-sm font-medium">{item.name}</span>
              </div>
              <span className="text-[9px] ml-7 text-slate-500 font-mono italic">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Status Box */}
      <div className="p-6 border-t border-slate-800">
        <div className="bg-[#1e293b]/50 p-4 rounded-xl border border-slate-800">
          <p className="text-[10px] text-slate-500 font-mono mb-2 uppercase tracking-tighter">Status: Mainnet Live</p>
          <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-emerald-500"></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <div className="hidden md:flex h-full shrink-0">
        {sidebarContent}
      </div>

      {/* Mobile Drawer (Slide-over with Backdrop) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-in fade-in duration-200">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <div className="relative z-10 h-full shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
