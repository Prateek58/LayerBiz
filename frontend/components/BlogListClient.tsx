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
  publishedAt?: string;
  createdAt?: string;
}

interface BlogListClientProps {
  posts: BlogPost[];
}

type SortOption = 'latest' | 'oldest' | 'quickReads' | 'deepDives' | 'alpha';

export default function BlogListClient({ posts }: BlogListClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('latest');

  // Extract all unique categories dynamically
  const categories = useMemo(() => {
    const cats = new Set<string>();
    posts.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['All', ...Array.from(cats).sort()];
  }, [posts]);

  // Helper to parse read time in minutes
  const parseReadMinutes = (readTimeStr?: string): number => {
    if (!readTimeStr) return 5;
    const match = readTimeStr.match(/\d+/);
    return match ? parseInt(match[0], 10) : 5;
  };

  // Helper to parse dates into timestamp for reliable sorting
  const parseTimestamp = (post: BlogPost): number => {
    if (post.publishedAt) {
      const ts = new Date(post.publishedAt).getTime();
      if (!isNaN(ts)) return ts;
    }
    if (post.date) {
      const ts = new Date(post.date).getTime();
      if (!isNaN(ts)) return ts;
    }
    if (post.createdAt) {
      const ts = new Date(post.createdAt).getTime();
      if (!isNaN(ts)) return ts;
    }
    return 0;
  };

  // Filter and Sort posts
  const processedPosts = useMemo(() => {
    // 1. Filter
    const filtered = posts.filter((post) => {
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

    // 2. Sort
    return filtered.sort((a, b) => {
      if (sortBy === 'latest') {
        return parseTimestamp(b) - parseTimestamp(a);
      }
      if (sortBy === 'oldest') {
        return parseTimestamp(a) - parseTimestamp(b);
      }
      if (sortBy === 'quickReads') {
        return parseReadMinutes(a.readTime) - parseReadMinutes(b.readTime);
      }
      if (sortBy === 'deepDives') {
        return parseReadMinutes(b.readTime) - parseReadMinutes(a.readTime);
      }
      if (sortBy === 'alpha') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [posts, selectedCategory, searchQuery, sortBy]);

  // Featured Cornerstone Article (The top article when in default 'All' & 'Latest' view without search)
  const isDefaultView = selectedCategory === 'All' && !searchQuery && sortBy === 'latest';
  const featuredPost = isDefaultView && processedPosts.length > 0 ? processedPosts[0] : null;
  const feedPosts = isDefaultView && processedPosts.length > 0 ? processedPosts.slice(1) : processedPosts;

  return (
    <div className="flex-1 bg-[#0f172a] overflow-y-auto relative font-sans">
      {/* 1. Header Section */}
      <div className="w-full pt-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          <header className="mb-6 pb-6 border-b border-slate-800/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-mono text-orange-400 uppercase tracking-widest font-bold mb-1">
                  // PRODUCTION LOGS &amp; DISPATCHES
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  The Builder&apos;s Logbook
                </h1>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Real-world architectural blueprints, AI workflows, and micro-SaaS engineering.
                </p>
              </div>

              {/* Search & Sort Controls Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                {/* Search Input */}
                <div className="relative w-full sm:w-56">
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
                      aria-label="Clear search"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sort articles"
                    className="w-full sm:w-auto bg-[#0b1120] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-orange-500/50 font-mono cursor-pointer appearance-none pr-8"
                  >
                    <option value="latest">Sort: Latest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="quickReads">Sort: Quick Reads (&lt; 5m)</option>
                    <option value="deepDives">Sort: Deep Dives (8m+)</option>
                    <option value="alpha">Sort: Title (A–Z)</option>
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 pointer-events-none"></i>
                </div>
              </div>
            </div>
          </header>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="sticky top-0 z-30 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/90 py-3 mb-6 select-none shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 flex flex-wrap items-center gap-2">
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
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border active:scale-95 ${
                  isActive
                    ? 'bg-orange-500/10 border-orange-500/50 text-orange-400 font-semibold shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                    : 'bg-[#1e293b]/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 hover:bg-[#1e293b]'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Feed Container */}
      <div className="w-full pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          {/* Featured Cornerstone Spotlight Card (Plan B) */}
          {featuredPost && (
            <div className="mb-8 sm:mb-10">
              <Link
                href={`/blog/${featuredPost.slug || featuredPost.id}`}
                className="group block relative bg-gradient-to-br from-[#1e293b]/90 via-[#0f172a] to-[#0b1120] border-2 border-orange-500/40 hover:border-orange-500 rounded-2xl p-6 sm:p-10 shadow-2xl shadow-orange-950/20 transition-all hover:scale-[1.005]"
              >
                {/* Glowing Corner Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-orange-500 text-slate-950 rounded-md font-mono flex items-center gap-1.5 shadow-md">
                      <i className="fas fa-star text-[9px]"></i>
                      Featured Blueprint
                    </span>
                    {featuredPost.category && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-md border border-orange-500/20 font-mono">
                        {featuredPost.category}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-mono">
                    <span>{featuredPost.date}</span>
                    <span>•</span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                </div>

                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 group-hover:text-orange-400 transition-colors tracking-tight">
                  {featuredPost.title}
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6 max-w-3xl">
                  {featuredPost.excerpt}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80">
                  <div className="flex flex-wrap gap-1.5">
                    {featuredPost.tags &&
                      Array.isArray(featuredPost.tags) &&
                      featuredPost.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono text-slate-400 border border-slate-700 px-2 py-0.5 rounded-md bg-[#0b1120]/60"
                        >
                          #{tag.toLowerCase()}
                        </span>
                      ))}
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                    Read Featured Dispatch <i className="fas fa-arrow-right text-[10px]"></i>
                  </span>
                </div>
              </Link>
            </div>
          )}

          {/* Section Divider Header for Feed */}
          {featuredPost && (
            <div className="text-[11px] font-mono uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
              <i className="fas fa-layer-group text-orange-400 text-xs"></i>
              <span>Chronological Engineering Dispatches ({feedPosts.length})</span>
            </div>
          )}

          {/* Empty State */}
          {processedPosts.length === 0 ? (
            <div className="bg-[#1e293b]/20 border border-slate-800/80 rounded-2xl p-12 text-center my-8">
              <i className="fas fa-filter text-3xl text-slate-600 mb-3"></i>
              <p className="text-slate-400 text-sm font-mono mb-3">
                No engineering logs found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                  setSortBy('latest');
                }}
                className="text-orange-400 hover:underline text-xs font-bold font-mono inline-flex items-center gap-1.5"
              >
                <i className="fas fa-arrows-rotate text-[10px]"></i>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {feedPosts.map((post: any) => (
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
