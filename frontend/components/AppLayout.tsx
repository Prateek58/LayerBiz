'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-[#0f172a] text-slate-300 overflow-hidden font-sans">
      {/* Sidebar (Responsive: static on desktop, slide-over drawer on mobile) */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main App Canvas */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-[#0b1120]">
        <Header onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <div className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative">
          {children}
        </div>
        <Footer />
      </main>
    </div>
  );
}
