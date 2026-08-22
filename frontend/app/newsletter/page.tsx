import Newsletter from '@/components/Newsletter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'The Alpha Feed | Developer Protocol & Engineering Roadmap',
  description:
    'Subscribe to The Alpha Feed for early access to LayerBiz micro-SaaS prototypes, technical deep dives, and venture roadmap updates.',
  alternates: {
    canonical: 'https://layerbiz.com/newsletter',
  },
};

export default function NewsletterPage() {
  return <Newsletter />;
}
