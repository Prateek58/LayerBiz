import React from 'react';
import AppLayout from '../components/AppLayout';
import './globals.css';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'LayerBiz Workspace',
  description: 'LayerBiz - High-performance micro-SaaS venture studio',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="bg-[#0f172a] text-slate-200 antialiased selection:bg-orange-500/30 overflow-hidden">
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
