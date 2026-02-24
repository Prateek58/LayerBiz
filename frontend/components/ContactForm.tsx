'use client';
import React, { useState } from 'react';
import { ContactData } from '../types';

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to send message');

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0f172a] p-12 overflow-y-auto">
      <div className="max-w-2xl mx-auto">
        <header className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Direct Liaison</h2>
          <p className="text-slate-400">
            Connecting with LayerBiz? Our founders review every partnership inquiry.
          </p>
        </header>

        {submitted ? (
          <div role="alert" className="bg-orange-500/10 border border-orange-500/20 p-8 rounded-2xl text-orange-400 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
            <i className="fas fa-terminal text-2xl"></i>
            <div>
              <p className="font-bold font-mono">System: Message Transmitted</p>
              <p className="text-sm opacity-80">Our protocol will process your inquiry shortly.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Identity</label>
                <input
                  type="text"
                  required
                  className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                  placeholder="name/org"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Endpoint</label>
                <input
                  type="email"
                  required
                  className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                  placeholder="email@host.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Subject</label>
              <input
                type="text"
                required
                className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all font-mono"
                placeholder="re: Collaboration"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Payload</label>
              <textarea
                required
                rows={5}
                className="w-full bg-[#1e293b] border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all resize-none font-mono text-sm"
                placeholder="Write your message here..."
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto bg-[#ea580c] hover:bg-[#d94e0b] disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-bold shadow-xl shadow-orange-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  Transmitting...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane text-xs"></i>
                  Transmit Message
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ContactForm;
