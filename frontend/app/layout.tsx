import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LayerBiz Workspace',
  description: 'LayerBiz Workspace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-[#0f172a] text-slate-200 antialiased selection:bg-orange-500/30 overflow-hidden">
        <div className="flex h-screen w-screen bg-[#0f172a] text-slate-300 overflow-hidden font-sans">
            <Sidebar />
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#0b1120]">
                 <Header />
                 <div className="flex-1 flex flex-col overflow-hidden relative">
                    {children}
                 </div>
                 <Footer />
            </main>
        </div>
      </body>
    </html>
  );
}
