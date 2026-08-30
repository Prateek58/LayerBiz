'use client';

import React, { useState, useEffect } from 'react';

const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const ENGAGEMENT_TIME_THRESHOLD_SEC = 25; // 25 seconds active reading
const SCROLL_DEPTH_THRESHOLD_PCT = 25; // 25% scroll depth

export default function EngagementNewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loadedAt, setLoadedAt] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setLoadedAt(Date.now());

    if (typeof window === 'undefined') return;

    // Instant test trigger via URL param: e.g. /blog/some-post?preview_modal=1
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.has('preview_modal') || urlParams.has('newsletter_test');

    if (isTestMode) {
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }

    // Expose quick dev test trigger on window object
    (window as any).showNewsletterModal = () => setIsOpen(true);
    (window as any).resetNewsletterStorage = () => {
      localStorage.removeItem('layerbiz_newsletter_subscribed');
      localStorage.removeItem('layerbiz_newsletter_dismissed_at');
      console.log('[LayerBiz] Newsletter localStorage reset successfully.');
    };

    // 1. Check local storage suppression rules
    try {
      const isSubscribed = localStorage.getItem('layerbiz_newsletter_subscribed') === 'true';
      if (isSubscribed) return;

      const dismissedAt = localStorage.getItem('layerbiz_newsletter_dismissed_at');
      if (dismissedAt) {
        const timeSinceDismiss = Date.now() - parseInt(dismissedAt, 10);
        if (timeSinceDismiss < DISMISS_COOLDOWN_MS) {
          return;
        }
      }
    } catch {
      // Storage access blocked or restricted
    }

    let activeSeconds = 0;
    let maxScrollPct = 0;
    let hasTriggered = false;

    const triggerModal = () => {
      if (hasTriggered) return;
      hasTriggered = true;
      setIsOpen(true);
    };

    // 2. Active reading time accumulator (tracks when tab is visible)
    const timerInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        activeSeconds += 1;

        // Trigger condition A: Reached active time threshold AND scrolled at least 25%
        if (activeSeconds >= ENGAGEMENT_TIME_THRESHOLD_SEC && maxScrollPct >= SCROLL_DEPTH_THRESHOLD_PCT) {
          triggerModal();
          clearInterval(timerInterval);
        }

        // Trigger condition B: Reader spent over 40 seconds deeply reading even if minimal scroll
        if (activeSeconds >= 40) {
          triggerModal();
          clearInterval(timerInterval);
        }
      }
    }, 1000);

    // 3. Scroll depth tracker (handles both window scrolling and inner container scrolling)
    const handleScroll = (e?: any) => {
      let scrollPct = 0;

      // Check window scroll
      const windowScrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowScrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowScrollHeight > 0) {
        scrollPct = Math.max(scrollPct, Math.round((windowScrollTop / windowScrollHeight) * 100));
      }

      // Check inner container scroll if event target is an element
      if (e && e.target && e.target.scrollHeight && e.target.clientHeight) {
        const target = e.target;
        const targetScrollHeight = target.scrollHeight - target.clientHeight;
        if (targetScrollHeight > 0) {
          scrollPct = Math.max(scrollPct, Math.round((target.scrollTop / targetScrollHeight) * 100));
        }
      }

      if (scrollPct > maxScrollPct) {
        maxScrollPct = scrollPct;
        if (activeSeconds >= ENGAGEMENT_TIME_THRESHOLD_SEC && maxScrollPct >= SCROLL_DEPTH_THRESHOLD_PCT) {
          triggerModal();
          clearInterval(timerInterval);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true });

    return () => {
      clearInterval(timerInterval);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      document.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, []);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleDismiss();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    try {
      localStorage.setItem('layerbiz_newsletter_dismissed_at', Date.now().toString());
    } catch {
      // ignore storage errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          _hp: honeypot,
          _t: loadedAt,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setSubscribed(true);
      try {
        localStorage.setItem('layerbiz_newsletter_subscribed', 'true');
      } catch {
        // ignore storage errors
      }

      setTimeout(() => {
        setIsOpen(false);
      }, 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Subscription failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="engagement-modal-title"
    >
      <div className="relative w-full max-w-lg bg-[#0f172a] border border-orange-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-orange-950/40 animate-in zoom-in-95 duration-300 font-sans">
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
          aria-label="Close dialog"
        >
          <i className="fas fa-xmark text-base"></i>
        </button>

        {/* Decorative Badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center text-xs">
            <i className="fas fa-bolt"></i>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-orange-400 font-bold">
            // ALPHA PROTOCOL DISPATCH
          </span>
        </div>

        {subscribed ? (
          <div className="py-6 text-center animate-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <i className="fas fa-check text-lg"></i>
            </div>
            <h3 className="text-lg font-bold text-white mb-2 font-mono">CONNECTION ESTABLISHED</h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
              You are connected to private engineering logs and micro-SaaS architecture dispatches.
            </p>
          </div>
        ) : (
          <>
            <h3
              id="engagement-modal-title"
              className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2.5"
            >
              Building with AI? You&apos;re in the right place.
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              We share practical AI workflows and architectures for solopreneurs and agencies to build products and scale faster. Your support helps us keep experimenting and sharing with the community.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Invisible Honeypot */}
              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0, zIndex: -1 }}>
                <input
                  type="text"
                  name="modal_newsletter_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  required
                  placeholder="developer@host.com"
                  className="flex-1 bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin text-xs"></i>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <span>Join Protocol</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-mono text-slate-500">
                  * Zero spam • Curated weekly • Unsubscribe anytime
                </span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-[10px] font-mono text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
                >
                  Remind me later
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
