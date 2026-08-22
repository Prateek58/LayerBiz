'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';

interface BlogPost {
  id: string | number;
  title: string;
  slug: string;
  category?: string;
  date?: string;
  readTime?: string;
  excerpt?: string;
  tags?: string[];
}

interface BlogListClientProps {
  posts: BlogPost[];
}

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract all unique categories dynamically
  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [posts]);

  // Filter posts by category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesCategory =
        selectedCategory === 'All' ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesSearch =
        !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [posts, selectedCategory, searchQuery]);

  return (
    <div className="flex-1 bg-[#0f172a] overflow-y-auto relative">
      {/* 1. Header Section (Perfect Max-W Alignment) */}
      <div className="w-full pt-1 sm:pt-1">
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          <header className="mb-1 pb-4 border-b border-slate-800/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  The Builder&apos;s Logbook
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  // Real-world architectural blueprints, micro-SaaS systems &amp; field-tested workflows.
                </p>
              </div>

              {/* Search Input */}
              <div className="relative w-full md:w-64 shrink-0">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
                <input
                  type="text"
                  placeholder="Search topics or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 transition-colors font-mono"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* 2. Sticky Category Filter Bar (Exact Same Left/Right Alignment) */}
      <div className="sticky top-0 z-30 bg-[#0f172a] border-b-[3px] border-slate-800/90 shadow-2xl py-3 mb-6 select-none">
        <div className="max-w-5xl mx-auto px-6 sm:px-12 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
            Filter:
          </span>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count =
              cat === 'All'
                ? posts.length
                : posts.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border active:scale-95 ${isActive
                  ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 font-semibold shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                  : 'bg-[#1e293b]/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-[#1e293b]'
                  }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-500'
                    }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Blog Post Feed (Exact Same Left/Right Alignment) */}
      <div className="w-full pb-16">
        <div className="max-w-5xl mx-auto px-6 sm:px-12">
          {filteredPosts.length === 0 ? (
            <div className="bg-[#1e293b]/20 border border-slate-800/80 rounded-2xl p-12 text-center my-8">
              <i className="fas fa-filter text-3xl text-slate-600 mb-3"></i>
              <p className="text-slate-400 text-sm font-mono mb-2">
                No engineering logs found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="text-orange-500 hover:underline text-xs font-bold font-mono"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:gap-8">
              {filteredPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug || post.id}`}
                  className="group cursor-pointer bg-[#1e293b]/30 border border-slate-800/80 hover:border-orange-500/40 rounded-2xl p-6 sm:p-8 transition-all hover:bg-[#1e293b]/50 block relative overflow-hidden active:scale-[0.99]"
                >
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {post.category && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20 w-fit font-mono">
                        {post.category}
                      </span>
                    )}
                    <div className="flex items-center gap-2.5 text-slate-500 text-[10px] font-mono">
                      <span>{post.date}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors tracking-tight">
                    {post.title}
                  </h2>

                  <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/40">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags &&
                        Array.isArray(post.tags) &&
                        post.tags.map((tag: string) => (
                          <span
                            key={tag}
                            className="text-[9px] font-mono text-slate-500 border border-slate-800/80 px-2 py-0.5 rounded-md bg-[#0b1120]/40"
                          >
                            #{tag.toLowerCase()}
                          </span>
                        ))}
                    </div>
                    <span className="text-xs font-mono text-orange-500/80 group-hover:text-orange-400 group-hover:translate-x-1 transition-all inline-flex items-center gap-1.5 font-bold">
                      Read Article <i className="fas fa-arrow-right text-[10px]"></i>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
