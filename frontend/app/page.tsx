import Hero from '@/components/Hero';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LayerBiz - AI Workflows & High-Performance Micro-SaaS Venture Studio',
  description:
    'LayerBiz builds practical AI workflows, edge architectures, and high-performance micro-SaaS tools for solopreneurs, developers, and fast-moving agencies.',
  keywords: [
    'AI Workflows',
    'Micro-SaaS Venture Studio',
    'Solopreneur AI Tools',
    'Edge Computing',
    'Next.js',
    'Rust',
    'AI Task Orchestration',
    'Zero-Latency Systems',
  ],
  alternates: {
    canonical: 'https://layerbiz.com',
  },
};

export default function Home() {
  return <Hero />;
}
