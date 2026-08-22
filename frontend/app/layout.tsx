import React from 'react';
import AppLayout from '../components/AppLayout';
import './globals.css';
import { Metadata, Viewport } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://layerbiz.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'LayerBiz - High-Performance Micro-SaaS Venture Studio',
    template: '%s | LayerBiz',
  },
  description:
    'LayerBiz is a venture studio specializing in high-performance micro-SaaS, edge architectures, zero-latency protocols, and AI orchestration.',
  keywords: [
    'Micro-SaaS',
    'Venture Studio',
    'Edge Computing',
    'Next.js',
    'Rust',
    'AI Task Orchestration',
    'Zero-Latency Systems',
  ],
  authors: [{ name: 'LayerBiz Engineering' }],
  creator: 'LayerBiz',
  publisher: 'LayerBiz',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'LayerBiz',
    title: 'LayerBiz - High-Performance Micro-SaaS Venture Studio',
    description:
      'We bridge the gap between complex edge engineering and elegant micro-SaaS user experiences.',
    images: [
      {
        url: '/xLogoLayerbiz.png',
        width: 1200,
        height: 630,
        alt: 'LayerBiz Venture Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LayerBiz - High-Performance Micro-SaaS Venture Studio',
    description:
      'Building targeted, high-performance micro-SaaS applications and edge systems.',
    images: ['/xLogoLayerbiz.png'],
    creator: '@layerbiz',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Global Schema.org Structured Data (Organization & WebSite for Google Knowledge Graph)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LayerBiz',
    url: siteUrl,
    logo: `${siteUrl}/layerbiz-logo-light.svg`,
    description:
      'Venture studio specializing in high-performance micro-SaaS, edge architectures, and AI task orchestrators.',
    sameAs: ['https://twitter.com/layerbiz', 'https://github.com/layerbiz'],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LayerBiz',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <head>
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
        />
        {/* Google Knowledge Graph JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteSchema),
          }}
        />
      </head>
      <body className="bg-[#0f172a] text-slate-200 antialiased selection:bg-orange-500/30 overflow-hidden">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
