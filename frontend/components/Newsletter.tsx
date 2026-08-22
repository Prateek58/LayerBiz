'use client';

import React, { useState, useEffect } from 'react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loadedAt, setLoadedAt] = useState<number>(0);
  const [subscribed, setSubscribed] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoadedAt(Date.now());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          _hp: honeypot, // Invisible bot honeypot
          _t: loadedAt,  // Time-trap validation
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setMessage(data.message || "You're on the list for the next build update.");
      setSubscribed(true);
      setEmail('');
      setHoneypot('');
      setTimeout(() => {
        setSubscribed(false);
      }, 6000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0b1120] p-12 overflow-y-auto flex items-center justify-center relative">
      <div className="max-w-xl w-full text-center relative z-10">
        <div className="mb-8 flex justify-center">
          <div className="w-16 h-16 bg-orange-500/10 rounded-2xl border border-orange-500/20 flex items-center justify-center">
            <i className="fas fa-bolt-lightning text-2xl text-orange-500"></i>
          </div>
        </div>

        <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tighter">
          The Alpha Feed
        </h2>
        <p className="text-slate-400 text-lg mb-10 leading-relaxed font-mono text-sm">
          // Early access to micro-SaaS prototypes, technical deep dives, and the LayerBiz roadmap.
        </p>

        {subscribed ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-2xl animate-in zoom-in duration-300">
            <h3 className="text-emerald-400 font-bold mb-2 font-mono">CONNECTED</h3>
            <p className="text-emerald-400/80 text-sm italic">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs mb-4 font-mono">
                {error}
              </div>
            )}

            {/* Honeypot field - Invisible to humans, traps automated spam bots */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, width: 0, zIndex: -1 }}>
              <input
                type="text"
                name="newsletter_hp"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="email"
                required
                className="flex-1 bg-[#1e293b] border border-slate-800 rounded-xl px-6 py-4 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                placeholder="developer@host.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-[0.98] whitespace-nowrap flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin text-xs"></i>
                    Connecting...
                  </>
                ) : (
                  'Join Protocol'
                )}
              </button>
            </div>
            <p className="mt-6 text-[10px] text-slate-600 uppercase tracking-widest font-bold">
              * Secure Subscription • No Junk • Opt-out Anytime
            </p>
          </form>
        )}
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none font-mono text-8xl text-white font-black">
        BIZ
      </div>
      <div className="absolute bottom-0 left-0 p-12 opacity-5 pointer-events-none font-mono text-8xl text-white font-black">
        LAYER
      </div>
    </div>
  );
};

export default Newsletter;
