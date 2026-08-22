import { fetchBlogPosts } from '@/lib/api';
import { Metadata } from 'next';
import BlogListClient from '@/components/BlogListClient';

export const metadata: Metadata = {
  title: 'Engineering Logs & Architecture Deep Dives',
  description:
    'Technical insights, architectural decisions, edge protocols, and micro-SaaS engineering logs from the LayerBiz engineering team.',
  alternates: {
    canonical: 'https://layerbiz.com/blog',
  },
  openGraph: {
    title: 'Engineering Logs & Architecture Deep Dives | LayerBiz',
    description:
      'Technical insights, architectural decisions, edge protocols, and micro-SaaS engineering logs from the LayerBiz engineering team.',
    url: 'https://layerbiz.com/blog',
  },
};

export default async function BlogPage() {
  const posts = await fetchBlogPosts();
  return <BlogListClient posts={posts} />;
}
