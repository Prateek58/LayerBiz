import { fetchBlogPost, fetchBlogPosts } from '@/lib/api';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export async function generateStaticParams() {
  const posts = await fetchBlogPosts();
  return posts.map((post: any) => ({
    id: post.id.toString(),
  }));
}

export default async function BlogPostPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const post = await fetchBlogPost(id);
  
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
                
                <div className="prose prose-invert prose-pre:bg-transparent prose-pre:p-0 max-w-none space-y-6 text-slate-400 leading-loose">
                  {post.content ? (
                    <ReactMarkdown
                      components={{
                        em({ children, ...props }: any) {
                          return (
                            <span className="text-lg text-slate-300 italic" style={{ fontStyle: 'italic' }} {...props}>
                              {children}
                            </span>
                          );
                        },
                        pre({ children }: any) {
                          return <div className="not-prose">{children}</div>;
                        },
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <div className="not-prose">
                              <SyntaxHighlighter
                                style={vscDarkPlus as any}
                                language={match[1]}
                                PreTag="div"
                                customStyle={{
                                  margin: '2rem 0',
                                  padding: '1.5rem',
                                  borderRadius: '0.75rem',
                                  backgroundColor: 'transparent',
                                  background: 'transparent',
                                  border: '1px solid #1e293b',
                                }}
                                codeTagProps={{
                                  style: {
                                    backgroundColor: 'transparent',
                                    background: 'transparent',
                                  },
                                }}
                                {...props}
                              >
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code className={`${className || ''} not-prose`} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="text-lg text-slate-300 italic">
                      No content available for this post.
                    </p>
                  )}
                </div>
             </article>
        </div>
    </div>
  );
}
