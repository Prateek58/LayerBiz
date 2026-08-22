import ContactForm from '@/components/ContactForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Direct Liaison & Partnership Inquiries',
  description:
    'Connect with LayerBiz founders and engineering leads regarding micro-SaaS partnerships, investments, and protocol integrations.',
  alternates: {
    canonical: 'https://layerbiz.com/contact',
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
