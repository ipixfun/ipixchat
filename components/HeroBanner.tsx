'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const IMAGES = [
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png',
    bg: '#F4845F',
    panel: '#F79B7F',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png',
    bg: '#6BBF7A',
    panel: '#85CC92',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png',
    bg: '#E882B4',
    panel: '#ED9DC4',
  },
  {
    src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png',
    bg: '#6EB5FF',
    panel: '#8DC4FF',
  },
];

// Data URI untuk efek Noise/Grain SVG
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

export default function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Preload gambar pada saat mount
  useEffect(() => {
    IMAGES.forEach((img) => {
      const image = new Image();
      image.src = img.src;
    });
  }, []);

  // Fungsi navigasi Carousel dengan lock animasi (650ms)
  const navigate = (dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setActiveIndex((prev) => {
      if (dir === 'next') return (prev + 1) % 4;
      return (prev + 3) % 4;
    });

    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  };

  return (
    <div
      className="relative w-full overflow-hidden font-['Inter',sans-serif] rounded-3xl border border-white/10 shadow-lg"
      style={{
        backgroundColor: IMAGES[activeIndex].bg,
        transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      {/* Mengubah height menjadi 220px seperti ukuran banner di gambar */}
      <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden">
        
        {/* 1. Grain overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-50 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* 2. Giant ghost text "IPIXCHAT" (Diperkecil dan ditengah) */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none z-[2] font-['Anton',sans-serif] uppercase text-white/20 whitespace-nowrap"
          style={{
            fontSize: 'clamp(60px, 18vw, 120px)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          IPIXCHAT
        </div>

        {/* 3. Top-left brand label */}
        <div className="absolute top-3 left-4 z-[60] text-[9px] font-black uppercase text-white tracking-[0.15em] bg-black/20 px-2 py-1 rounded-full backdrop-blur-md">
          TOONHUB
        </div>

        {/* 4. Carousel 3D Characters (Ukuran disesuaikan untuk layout card 220px) */}
        <div className="absolute inset-0 z-[3]">
          {IMAGES.map((item, index) => {
            let role = 'back';
            if (index === activeIndex) role = 'center';
            else if (index === (activeIndex + 3) % 4) role = 'left';
            else if (index === (activeIndex + 1) % 4) role = 'right';

            let transform = 'translateX(-50%) scale(1)';
            let filter = 'blur(4px)';
            let opacity = 1;
            let zIndex = 5;
            let left = '50%';
            let height = '40%';
            let bottom = '15%';

            if (role === 'center') {
              transform = 'translateX(-50%) scale(1.1)';
              filter = 'blur(0px)';
              opacity = 1;
              zIndex = 20;
              left = '50%';
              height = '90%';
              bottom = '-5%'; // Sedikit tenggelam di bawah
            } else if (role === 'left') {
              transform = 'translateX(-50%) scale(0.9)';
              filter = 'blur(2px)';
              opacity = 0.75;
              zIndex = 10;
              left = '20%';
              height = '60%';
              bottom = '10%';
            } else if (role === 'right') {
              transform = 'translateX(-50%) scale(0.9)';
              filter = 'blur(2px)';
              opacity = 0.75;
              zIndex = 10;
              left = '80%';
              height = '60%';
              bottom = '10%';
            }

            return (
              <div
                key={index}
                className="absolute aspect-[0.6/1] will-change-[transform,filter,opacity]"
                style={{
                  transform,
                  filter,
                  opacity,
                  zIndex,
                  left,
                  height,
                  bottom,
                  transition: `
                    transform 650ms cubic-bezier(0.4,0,0.2,1),
                    filter 650ms cubic-bezier(0.4,0,0.2,1),
                    opacity 650ms cubic-bezier(0.4,0,0.2,1),
                    left 650ms cubic-bezier(0.4,0,0.2,1),
                    height 650ms cubic-bezier(0.4,0,0.2,1),
                    bottom 650ms cubic-bezier(0.4,0,0.2,1)
                  `,
                }}
              >
                <img
                  src={item.src}
                  alt={`Toonhub Character ${index + 1}`}
                  draggable={false}
                  className="w-full h-full object-contain object-bottom pointer-events-none select-none"
                />
              </div>
            );
          })}
        </div>

        {/* 5. Bottom-left Nav buttons (Dibuat lebih ringkas) */}
        <div className="absolute bottom-3 left-4 z-[60]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('prev')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/40 bg-black/20 backdrop-blur-md text-white transition-all duration-150 ease-out hover:scale-110 active:scale-95"
              aria-label="Previous figurine"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => navigate('next')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/40 bg-black/20 backdrop-blur-md text-white transition-all duration-150 ease-out hover:scale-110 active:scale-95"
              aria-label="Next figurine"
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* 6. Bottom-right link "EXPLORE" */}
        <div className="absolute bottom-3 right-4 z-[60] bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
          <a
            href="#"
            className="group flex items-center gap-1.5 font-['Anton',sans-serif] text-white opacity-95 hover:opacity-100 transition-opacity duration-200 uppercase"
            style={{
              fontSize: '14px',
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}
          >
            EXPLORE
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" strokeWidth={3} />
          </a>
        </div>

      </div>
    </div>
  );
}