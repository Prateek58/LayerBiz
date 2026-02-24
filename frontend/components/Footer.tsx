import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="h-6 bg-[#0f172a] border-t border-slate-800 flex items-center px-4 justify-between select-none">
      <div className="flex items-center gap-4 text-[9px] uppercase tracking-tighter text-slate-500 font-bold">
        <span className="flex items-center gap-1.5">
          <i className="fas fa-code-branch text-orange-500"></i>
          v1.0.4-stable
        </span>
      </div>
      <div className="flex items-center gap-4 text-[9px] uppercase tracking-tighter text-slate-500 font-bold">
        <span>Build Time: 18ms</span>
        <span className="text-orange-500/80">Next.js 14</span>
      </div>
    </footer>
  );
};

export default Footer;
