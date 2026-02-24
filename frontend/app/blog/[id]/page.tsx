import { posts } from '@/lib/blog';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return posts.map((post) => ({
    id: post.id.toString(),
  }));
}

export default function BlogPostPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const post = posts.find(p => p.id.toString() === id);
  
  if (!post) {
    notFound();
  }

  return (
    <div className="flex-1 bg-[#0f172a] p-12 overflow-y-auto">
        <div className="max-w-3xl mx-auto">
             <Link href="/blog" className="text-slate-500 hover:text-white mb-8 inline-block">
                <i className="fas fa-arrow-left mr-2"></i> Back to Logs
             </Link>

             <article>
                <header className="mb-10">
                     <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">{post.title}</h1>
                     <div className="flex items-center gap-4 text-slate-500 text-xs border-b border-slate-800 pb-6 font-mono">
                        <span>BY: LayerBiz Engineering</span>
                        <span>|</span>
                        <span>{post.date}</span>
                        <span>|</span>
                        <span>{post.readTime}</span>
                     </div>
                </header>
                
                <div className="prose prose-invert max-w-none space-y-6 text-slate-400 leading-loose">
                  <p className="text-lg text-slate-300 italic">
                    This is a simulated read view. In a production environment, this would render full Markdown or CMS content.
                  </p>
                  <p>
                    Building robust edge systems requires a fundamental shift in how we perceive data consistency and availability. At LayerBiz, we leverage a combination of global edge workers and localized caching strategies to ensure our users experience zero perceived lag.
                  </p>
                  <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm border border-slate-800 my-8">
                    <p className="text-blue-400">// Sample configuration for edge orchestration</p>
                    <p><span className="text-purple-400">export const</span> <span className="text-emerald-400">config</span> = {'{'}</p>
                    <p className="pl-4">runtime: <span className="text-orange-400">'edge'</span>,</p>
                    <p className="pl-4">regions: [<span className="text-orange-400">'fra1'</span>, <span className="text-orange-400">'sfo1'</span>, <span className="text-orange-400">'sin1'</span>],</p>
                    <p className="pl-4">cacheStrategy: <span className="text-orange-400">'stale-while-revalidate'</span></p>
                    <p>{'}'};</p>
                  </div>
                  <p>
                    The transition to React 19 has enabled us to optimize our server component patterns, reducing initial bundle sizes by nearly 40%. This is critical for our micro-SaaS ecosystem where every millisecond counts toward conversion and user satisfaction.
                  </p>
                </div>
             </article>
        </div>
    </div>
  );
}
