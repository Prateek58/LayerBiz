'use client';

import React, { useEffect, useState } from 'react';

const LogoBlockAnimator: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-fit h-20 relative flex items-center mb-4 select-none pointer-events-none">
      {/* Interactive 3D Stepped Logo Cluster */}
      <div
        className="relative transition-transform duration-300 ease-out"
        style={{
          transform: `translate(${mousePos.x}px, ${mousePos.y}px)`,
        }}
      >
        {/* Exact Stepped 3-Square Layout */}
        <div className="relative w-16 h-16">
          {/* Tile 1 (Bottom Left) */}
          <div
            className="absolute w-6 h-6 rounded-sm bg-orange-600 shadow-[0_0_12px_rgba(234,88,12,0.5)] animate-stepped-tile-1"
            style={{
              left: '0px',
              bottom: '0px',
            }}
          />

          {/* Tile 2 (Middle) */}
          <div
            className="absolute w-6 h-6 rounded-sm bg-orange-500 shadow-[0_0_16px_rgba(249,115,22,0.6)] animate-stepped-tile-2"
            style={{
              left: '12px',
              bottom: '12px',
            }}
          />

          {/* Tile 3 (Top Right) */}
          <div
            className="absolute w-6 h-6 rounded-sm bg-orange-400 shadow-[0_0_20px_rgba(251,146,60,0.7)] animate-stepped-tile-3"
            style={{
              left: '24px',
              bottom: '24px',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default LogoBlockAnimator;
