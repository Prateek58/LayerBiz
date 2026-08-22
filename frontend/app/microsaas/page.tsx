import MicroSaaS from '@/components/MicroSaaS';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Micro-SaaS Product Ecosystem & Prototypes',
  description:
    'Explore the LayerBiz high-performance micro-SaaS ecosystem: FlowState, DataLayer, BizMetrics, and SecureSync protocols.',
  alternates: {
    canonical: 'https://layerbiz.com/microsaas',
  },
};

export default function MicroSaaSPage() {
  return <MicroSaaS />;
}
