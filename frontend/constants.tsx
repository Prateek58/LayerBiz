
import { NavItem } from './types';

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    name: 'Home.tsx',
    icon: 'fa-house-laptop text-blue-400',
    label: 'Brand Hero',
    path: '/'
  },
  {
    id: 'blog',
    name: 'Blog.tsx',
    icon: 'fa-book-open text-amber-400',
    label: 'Engineering Logs',
    path: '/blog'
  },
  {
    id: 'microsaas',
    name: 'MicroSaaS.tsx',
    icon: 'fa-cubes text-purple-400',
    label: 'Product Suite',
    path: '/microsaas'
  },
  {
    id: 'about',
    name: 'About.tsx',
    icon: 'fa-user-gear text-emerald-400',
    label: 'Our Vision',
    path: '/about'
  },
  {
    id: 'contact',
    name: 'Contact.tsx',
    icon: 'fa-envelope text-orange-400',
    label: 'Get in Touch',
    path: '/contact'
  },
  {
    id: 'newsletter',
    name: 'Newsletter.tsx',
    icon: 'fa-paper-plane text-pink-400',
    label: 'Stay Updated',
    path: '/newsletter'
  }
];
