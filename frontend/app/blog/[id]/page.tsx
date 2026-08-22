import { fetchBlogPost, fetchBlogPosts } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Metadata } from 'next';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://layerbiz.com';

export async function generateStaticParams() {
  const posts = await fetchBlogPosts();
  return posts.map((post: any) => ({
    id: post.id.toString(),
  }));
}

// 80/20 Dynamic RankMath-style SEO Metadata Generator with Dynamic Strapi Overrides
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await fetchBlogPost(params.id);

  if (!post) {
    return {
      title: 'Article Not Found | LayerBiz',
      description: 'The requested engineering log could not be found.',
    };
  }

  // Dynamic Overrides with Smart Fallbacks
  const postTitle = post.metaTitle || post.title;
  const postDescription =
    post.metaDescription ||
    post.excerpt ||
    'Deep dive into high-performance architectures and engineering practices at LayerBiz.';
  const postUrl = post.canonicalUrl || `${siteUrl}/blog/${post.slug || params.id}`;
  const keywords =
    Array.isArray(post.keywords) && post.keywords.length > 0
      ? post.keywords
      : Array.isArray(post.tags)
      ? post.tags
      : ['Engineering', 'Architecture', 'Micro-SaaS'];

  return {
    title: postTitle,
    description: postDescription,
    keywords: keywords,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      type: 'article',
      locale: 'en_US',
      url: postUrl,
      title: postTitle,
      description: postDescription,
      siteName: 'LayerBiz Engineering Logs',
      publishedTime: post.publishedAt || post.createdAt || post.date,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: ['LayerBiz Engineering'],
      tags: keywords,
      images: [
        {
          url: '/xLogoLayerbiz.png',
          width: 1200,
          height: 630,
          alt: postTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: postTitle,
      description: postDescription,
      images: ['/xLogoLayerbiz.png'],
      creator: '@layerbiz',
    },
  };
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const post = await fetchBlogPost(id);

  if (!post) {
    notFound();
  }

  const postTitle = post.metaTitle || post.title;
  const postDescription = post.metaDescription || post.excerpt || post.title;
  const postUrl = post.canonicalUrl || `${siteUrl}/blog/${post.slug || id}`;
  const keywords =
    Array.isArray(post.keywords) && post.keywords.length > 0
      ? post.keywords
      : Array.isArray(post.tags)
      ? post.tags
      : [];

  // Schema.org BlogPosting Structured Data for Google Rich Results
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: postTitle,
    description: postDescription,
    datePublished: post.publishedAt || post.createdAt || post.date,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    keywords: keywords.join(', '),
    author: {
      '@type': 'Organization',
      name: 'LayerBiz Engineering',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'LayerBiz',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/layerbiz-logo-light.svg`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
  };

  return (
    <div className="flex-1 bg-[#0f172a] p-6 sm:p-12 overflow-y-auto">
      {/* Inject Article JSON-LD for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />

      <div className="max-w-3xl mx-auto">
        <Link
          href="/blog"
          className="text-slate-500 hover:text-white mb-6 sm:mb-8 inline-flex items-center text-xs sm:text-sm"
        >
          <i className="fas fa-arrow-left mr-2"></i> Back to Logs
        </Link>

        <article>
          <header className="mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-500 text-[11px] sm:text-xs border-b border-slate-800 pb-4 sm:pb-6 font-mono">
              <span>BY: LayerBiz Engineering</span>
              <span>|</span>
              <span>{post.date}</span>
              <span>|</span>
              <span>{post.readTime}</span>
              {post.category && (
                <>
                  <span>|</span>
                  <span className="text-orange-500 font-bold uppercase">{post.category}</span>
                </>
              )}
            </div>
          </header>

          <div className="prose prose-invert prose-pre:bg-transparent prose-pre:p-0 max-w-none space-y-6 text-slate-300 text-sm sm:text-base leading-loose">
            {post.content ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  em({ children, ...props }: any) {
                    return (
                      <span className="text-base sm:text-lg text-slate-200 italic" style={{ fontStyle: 'italic' }} {...props}>
                        {children}
                      </span>
                    );
                  },
                  blockquote({ children }: any) {
                    return (
                      <blockquote className="border-l-4 border-orange-500 bg-slate-900/60 pl-5 pr-4 py-3 my-6 rounded-r-xl italic text-slate-300 font-sans not-prose">
                        {children}
                      </blockquote>
                    );
                  },
                  table({ children }: any) {
                    return (
                      <div className="my-6 overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120]/90 shadow-xl not-prose">
                        <table className="w-full text-left border-collapse text-xs sm:text-sm">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  thead({ children }: any) {
                    return (
                      <thead className="bg-[#1e293b] text-slate-200 border-b border-slate-800 uppercase text-[10px] sm:text-[11px] font-mono tracking-wider">
                        {children}
                      </thead>
                    );
                  },
                  th({ children }: any) {
                    return (
                      <th className="py-3 px-4 font-bold text-orange-400 border-r border-slate-800/40 last:border-r-0">
                        {children}
                      </th>
                    );
                  },
                  td({ children }: any) {
                    return (
                      <td className="py-3 px-4 border-b border-slate-800/40 border-r border-slate-800/30 last:border-r-0 text-slate-300 align-top font-sans">
                        {children}
                      </td>
                    );
                  },
                  tr({ children }: any) {
                    return (
                      <tr className="hover:bg-slate-800/30 transition-colors">
                        {children}
                      </tr>
                    );
                  },
                  pre({ children }: any) {
                    return <div className="not-prose my-6">{children}</div>;
                  },
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const contentString = String(children).replace(/\n$/, '');
                    const isMultiLine = contentString.includes('\n');

                    // 1. Syntax Highlighted Code Blocks
                    if (match) {
                      return (
                        <div className="not-prose overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] my-4 shadow-lg">
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              padding: '1.25rem',
                              backgroundColor: 'transparent',
                              background: 'transparent',
                              fontSize: '0.85rem',
                              lineHeight: '1.6',
                            }}
                            codeTagProps={{
                              style: {
                                backgroundColor: 'transparent',
                                background: 'transparent',
                              },
                            }}
                            {...props}
                          >
                            {contentString}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }

                    // 2. Multi-line Raw Code Block (without specified language)
                    if (isMultiLine) {
                      return (
                        <pre className="not-prose overflow-x-auto rounded-xl border border-slate-800 bg-[#0b1120] p-4 sm:p-5 font-mono text-xs sm:text-[13px] text-slate-300 whitespace-pre leading-relaxed my-4 shadow-lg">
                          {contentString}
                        </pre>
                      );
                    }

                    // 3. Clean Inline Code Badge (inside table cells, lists, or paragraphs)
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-orange-400 font-mono text-xs not-prose inline-block my-0.5" {...props}>
                        {contentString}
                      </code>
                    );
                  },
                }}
              >
                {post.content}
              </ReactMarkdown>
            ) : (
              <p className="text-base sm:text-lg text-slate-300 italic">
                No content available for this post.
              </p>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}
