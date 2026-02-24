
import React, { useState } from 'react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail('');
    }, 5000);
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
            <p className="text-emerald-400/80 text-sm italic">You're on the list for the next build update.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
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
                className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-xl font-bold transition-all active:scale-[0.98] whitespace-nowrap"
              >
                Join Protocol
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
