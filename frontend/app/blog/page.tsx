import Link from 'next/link';
import { fetchBlogPosts } from '@/lib/api';
import { Metadata } from 'next';

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
  
  return (
    <div className="flex-1 bg-[#0f172a] p-6 sm:p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 sm:mb-12 border-b border-slate-800 pb-6 sm:pb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">Engineering Logs</h2>
          <p className="text-slate-400 max-w-2xl font-mono text-xs sm:text-sm leading-relaxed">
            // Technical insights, architectural decisions, and the occasional rant about semicolon placement.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          {posts.map((post: any) => (
            <Link 
              key={post.id}
              href={`/blog/${post.id}`}
              className="group cursor-pointer bg-[#1e293b]/40 border border-slate-800 hover:border-orange-500/30 rounded-2xl p-6 sm:p-8 transition-all hover:bg-[#1e293b]/60 block"
            >
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-orange-500/10 text-orange-500 rounded border border-orange-500/20 w-fit">
                  {post.category}
                </span>
                <div className="flex items-center gap-2.5 text-slate-500 text-[10px] font-mono">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors tracking-tight">
                {post.title}
              </h3>
              
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap gap-2">
                {post.tags && Array.isArray(post.tags) && post.tags.map((tag: string) => (
                  <span key={tag} className="text-[9px] font-mono text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full">
                    #{tag.toLowerCase()}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
