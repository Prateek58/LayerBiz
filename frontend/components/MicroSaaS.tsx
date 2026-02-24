
import Link from 'next/link';
import React, { useState } from 'react';

interface Product {
  id: number;
  name: string;
  desc: string;
  icon: string;
  color: string;
  status: string;
}

const products: Product[] = [
  { id: 1, name: 'FlowState', desc: 'AI-driven task orchestration for lean teams.', icon: 'fa-wind', color: 'text-blue-400', status: 'In Development' },
  { id: 2, name: 'DataLayer', desc: 'Zero-latency edge caching for global apps.', icon: 'fa-database', color: 'text-orange-400', status: 'Closed Beta' },
  { id: 3, name: 'BizMetrics', desc: 'Real-time financial pulse for micro-ventures.', icon: 'fa-chart-pie', color: 'text-emerald-400', status: 'Internal Alpha' },
  { id: 4, name: 'SecureSync', desc: 'End-to-end encrypted file sharing protocol.', icon: 'fa-shield-halved', color: 'text-purple-400', status: 'Architecting' },
];

const MicroSaaS: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="flex-1 bg-[#0f172a] p-12 overflow-y-auto relative">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">The Product Ecosystem</h2>
          <p className="text-slate-400 max-w-xl">We build targeted solutions for specific pain points. No bloat, just pure utility.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map(product => (
            <div 
              key={product.id} 
              onClick={() => setSelectedProduct(product)}
              className="group bg-[#1e293b] border border-slate-800 p-8 rounded-2xl hover:border-orange-500/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <i className={`fas ${product.icon} text-6xl`}></i>
              </div>
              
              <div className={`w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <i className={`fas ${product.icon} ${product.color} text-xl`}></i>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{product.name}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">
                {product.desc}
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-orange-500 uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                {product.status} <i className="fas fa-chevron-right text-[8px]"></i>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Access Request Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden scale-in-center">
            <div className="bg-[#0f172a] px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Protocol_Access_Request.log</span>
              <button onClick={() => setSelectedProduct(null)} className="text-slate-500 hover:text-white transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-8">
              <div className={`w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-6`}>
                <i className={`fas ${selectedProduct.icon} ${selectedProduct.color} text-2xl`}></i>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{selectedProduct.name}</h3>
              <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl mb-6 font-mono text-[11px] leading-relaxed">
                <p className="text-emerald-500 mb-1">$ layerbiz status --id {selectedProduct.id}</p>
                <p className="text-slate-400 mb-1">STATUS: {selectedProduct.status.toUpperCase()}</p>
                <p className="text-slate-400 mb-1">ENCRYPTION: AES-256-GCM</p>
                <p className="text-slate-500 italic mt-2">// Access restricted to LayerBiz partners and early testers.</p>
              </div>
              
              <div className="flex flex-col gap-3">
                <Link 
                  href="/newsletter"
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-900/20 active:scale-95 flex items-center justify-center"
                >
                  Join the Waitlist
                </Link>
                <button 
                  onClick={() => setSelectedProduct(null)}
                  className="w-full bg-transparent hover:bg-slate-800 text-slate-400 py-3 rounded-xl font-bold transition-all text-sm"
                >
                  Close Terminal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MicroSaaS;
