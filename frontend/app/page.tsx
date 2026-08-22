import Hero from '@/components/Hero';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'LayerBiz - High-Performance Micro-SaaS Venture Studio',
  description:
    'LayerBiz is a venture studio specializing in high-performance micro-SaaS, edge architectures, zero-latency protocols, and AI orchestration.',
  alternates: {
    canonical: 'https://layerbiz.com',
  },
};

export default function Home() {
  return <Hero />;
}
