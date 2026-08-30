'use client';

import React, { useState, useEffect } from 'react';

interface CommentItem {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  initials: string;
}

interface CommentSectionProps {
  postSlug: string;
  postTitle?: string;
}

export default function CommentSection({ postSlug, postTitle }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  // Anti-Spam State
  const [honeypot, setHoneypot] = useState('');
  const [websiteHoneypot, setWebsiteHoneypot] = useState('');
  const [loadedAt, setLoadedAt] = useState<number>(0);

  // Dynamic Human Verification Challenge (Math / Proof-of-Human)
  const [challengeNum1, setChallengeNum1] = useState(3);
  const [challengeNum2, setChallengeNum2] = useState(4);
  const [userChallengeAnswer, setUserChallengeAnswer] = useState('');

  // Submission UI State
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const generateNewChallenge = () => {
    const n1 = Math.floor(Math.random() * 8) + 2;
    const n2 = Math.floor(Math.random() * 8) + 1;
    setChallengeNum1(n1);
    setChallengeNum2(n2);
    setUserChallengeAnswer('');
  };

  useEffect(() => {
    setLoadedAt(Date.now());
    generateNewChallenge();

    // Fetch existing comments
    const fetchComments = async () => {
      try {
        setLoadingComments(true);
        const res = await fetch(`/api/comments?slug=${encodeURIComponent(postSlug)}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.comments)) {
            setComments(data.comments);
          }
        }
      } catch (err) {
        console.error('Error fetching comments:', err);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchComments();
  }, [postSlug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Pre-flight challenge check
    const expectedAnswer = challengeNum1 + challengeNum2;
    if (parseInt(userChallengeAnswer.trim(), 10) !== expectedAnswer) {
      setErrorMessage('Human verification calculation is incorrect. Please verify and try again.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postSlug,
          name: name.trim(),
          email: email.trim(),
          content: content.trim(),
          _hp: honeypot,
          _website_hp: websiteHoneypot,
          _t: loadedAt,
          _challengeAns: userChallengeAnswer.trim(),
          _challengeExpected: String(expectedAnswer),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit comment');
      }

      setSuccessMessage(data.message || 'Your comment has been published.');
      if (data.comment) {
        setComments((prev) => [data.comment, ...prev]);
      }

      // Reset form
      setContent('');
      setUserChallengeAnswer('');
      generateNewChallenge();
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while posting your comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <section className="mt-16 pt-12 border-t border-slate-800/80 font-sans" aria-label="Article Discussion">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
        <div>
          <div className="text-[10px] font-mono text-orange-400 uppercase tracking-widest font-bold mb-1">
            // PEER REVIEW & DISCUSSION
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <i className="fas fa-comments text-orange-500 text-base"></i>
            Reader Discussion ({comments.length})
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg w-fit">
          <i className="fas fa-shield-halved text-emerald-400"></i>
          <span>100% Anti-Spam Protected</span>
        </div>
      </div>

      {/* Comment Form Card */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-6 sm:p-8 mb-10 shadow-xl relative overflow-hidden">
        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <i className="fas fa-terminal text-orange-400"></i>
          <span>Add Your Engineering Perspective</span>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-3">
            <i className="fas fa-circle-check text-emerald-400 text-sm"></i>
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-3">
            <i className="fas fa-triangle-exclamation text-red-400 text-sm"></i>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative">
          {/* Invisible Anti-Bot Honeypot Traps */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0, zIndex: -1 }}>
            <input
              type="text"
              name="comment_hp"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
            <input
              type="text"
              name="website_url_hp"
              tabIndex={-1}
              autoComplete="off"
              value={websiteHoneypot}
              onChange={(e) => setWebsiteHoneypot(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="comment_name" className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                Display Name *
              </label>
              <input
                id="comment_name"
                type="text"
                required
                maxLength={60}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-[#1e293b]/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="comment_email" className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                Email (Kept Private) *
              </label>
              <input
                id="comment_email"
                type="email"
                required
                maxLength={100}
                placeholder="developer@host.com"
                className="w-full bg-[#1e293b]/70 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="comment_content" className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              Comment *
            </label>
            <textarea
              id="comment_content"
              required
              rows={4}
              maxLength={3000}
              placeholder="Share your thoughts, architectural feedback, or performance insights..."
              className="w-full bg-[#1e293b]/70 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all leading-relaxed"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 mt-1">
              <span>Markdown supported</span>
              <span>{content.length} / 3000 chars</span>
            </div>
          </div>

          {/* Proof of Human Interactive Challenge */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-800/60">
            <div className="flex items-center gap-3 bg-[#1e293b]/50 border border-slate-800 px-4 py-2.5 rounded-xl">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                <i className="fas fa-robot text-orange-400 text-xs"></i>
                <span className="text-slate-400">Human Check:</span>
                <span className="font-bold text-orange-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {challengeNum1} + {challengeNum2} =
                </span>
              </div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                required
                placeholder="?"
                className="w-12 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center text-sm text-orange-400 font-mono font-bold focus:outline-none focus:ring-1 focus:ring-orange-500"
                value={userChallengeAnswer}
                onChange={(e) => setUserChallengeAnswer(e.target.value)}
              />
              <button
                type="button"
                onClick={generateNewChallenge}
                title="Refresh challenge"
                className="text-slate-500 hover:text-slate-300 text-xs transition-colors p-1"
              >
                <i className="fas fa-arrows-rotate"></i>
              </button>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] flex items-center justify-center gap-2 self-end sm:self-auto shadow-lg shadow-orange-900/20"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  <span>Verifying & Posting...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane text-xs"></i>
                  <span>Post Comment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {loadingComments ? (
          <div className="text-center py-10 text-slate-500 text-xs font-mono flex items-center justify-center gap-2">
            <i className="fas fa-spinner fa-spin text-orange-500"></i>
            <span>Loading discussion thread...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 px-6 rounded-2xl border border-slate-800/80 bg-[#0b1120]/40">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-comment-dots text-lg"></i>
            </div>
            <h4 className="text-sm font-bold text-white mb-1">No comments posted yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Be the first to share an engineering perspective, question an architectural choice, or provide feedback.
            </p>
          </div>
        ) : (
          comments.map((item) => (
            <article
              key={item.id}
              className="bg-[#0b1120] border border-slate-800/80 rounded-xl p-5 sm:p-6 transition-colors hover:border-slate-700/80 shadow-md"
            >
              <header className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 font-mono font-bold text-xs flex items-center justify-center">
                    {item.initials}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{item.name}</h4>
                    <time dateTime={item.createdAt} className="text-[10px] font-mono text-slate-500 block">
                      {formatDate(item.createdAt)}
                    </time>
                  </div>
                </div>
                <div className="text-[9px] font-mono uppercase tracking-widest text-slate-500 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  Verified Human
                </div>
              </header>
              <div className="text-xs sm:text-sm text-slate-300 leading-relaxed pl-11 whitespace-pre-wrap">
                {item.content}
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
