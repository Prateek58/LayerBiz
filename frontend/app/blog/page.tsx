import Link from 'next/link';
import { posts } from '@/lib/blog';

export default function BlogPage() {
  return (
    <div className="flex-1 bg-[#0f172a] p-12 overflow-y-auto">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 border-b border-slate-800 pb-8">
          <h2 className="text-4xl font-bold text-white mb-4">Engineering Logs</h2>
          <p className="text-slate-400 max-w-2xl font-mono text-sm">
            // Technical insights, architectural decisions, and the occasional rant about semicolon placement.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-8">
          {posts.map(post => (
            <Link 
              key={post.id}
              href={`/blog/${post.id}`}
              className="group cursor-pointer bg-[#1e293b]/40 border border-slate-800 hover:border-orange-500/30 rounded-2xl p-8 transition-all hover:bg-[#1e293b]/60 block"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-orange-500/10 text-orange-500 rounded border border-orange-500/20 w-fit">
                  {post.category}
                </span>
                <div className="flex items-center gap-3 text-slate-500 text-[10px] font-mono">
                  <span>{post.date}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span>{post.readTime}</span>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors tracking-tight">
                {post.title}
              </h3>
              
              <p className="text-slate-400 leading-relaxed mb-6 max-w-3xl">
                {post.excerpt}
              </p>

              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
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
