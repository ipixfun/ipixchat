'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const SLIDES = [
  {
    id: 'chat',
    src: '/1.webp',
    text: 'CHAT',
    bg: '#F4845F',
    link: '/chat',
    animClass: 'anim-wave',
  },
  {
    id: 'tema',
    src: '/2.webp',
    text: 'TEMA',
    bg: '#6EB5FF',
    link: '/tema',
    animClass: 'anim-splash',
  },
  {
    id: 'mp3',
    src: '/3.webp',
    text: 'MP3',
    bg: '#6BBF7A',
    link: '/mp3',
    animClass: 'anim-bounce',
  },
  {
    id: 'ipix',
    src: '/4.webp',
    text: 'iPiX',
    bg: '#E882B4',
    link: '/tentang',
    animClass: 'anim-brutal',
  },
];

// Data URI untuk efek Noise/Grain SVG
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

export default function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ref untuk swipe gesture
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Preload gambar lokal
  useEffect(() => {
    SLIDES.forEach((slide) => {
      const image = new Image();
      image.src = slide.src;
    });
  }, []);

  // Auto Slide setiap 4.5 detik
  useEffect(() => {
    const timer = setInterval(() => {
      navigate('next');
    }, 4500);

    return () => clearInterval(timer);
  }, [activeIndex, isAnimating]);

  // Fungsi Navigasi
  const navigate = (dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);

    setActiveIndex((prev) => {
      if (dir === 'next') return (prev + 1) % SLIDES.length;
      return (prev + SLIDES.length - 1) % SLIDES.length;
    });

    setTimeout(() => {
      setIsAnimating(false);
    }, 650);
  };

  // Handlers untuk Swipe Mobile (Touch)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe) {
      navigate('next');
    } else if (isRightSwipe) {
      navigate('prev');
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden font-['Inter',sans-serif] rounded-3xl border border-white/10 shadow-lg select-none touch-pan-y"
      style={{
        backgroundColor: SLIDES[activeIndex].bg,
        transition: 'background-color 650ms cubic-bezier(0.4,0,0.2,1)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Dynamic Keyframe Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes animWave {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-3deg); }
        }
        @keyframes animSplash {
          0%, 100% { filter: hue-rotate(0deg) saturate(1); transform: scale(1); text-shadow: 0 0 0 transparent; }
          50% { filter: hue-rotate(50deg) saturate(1.8); transform: scale(1.08); text-shadow: 0 0 22px rgba(255,255,255,0.9); }
        }
        @keyframes animBounce {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-16px) scaleY(1.08); }
        }
        @keyframes animBrutal {
          0%, 100% { transform: translate(0,0) rotate(0deg); filter: drop-shadow(0px 0px 0px #000); }
          25% { transform: translate(3px,-3px) rotate(4deg) scale(1.06); filter: drop-shadow(-4px 4px 0px #000); }
          50% { transform: translate(-3px,3px) rotate(-4deg) scale(0.95); filter: drop-shadow(4px -4px 0px #000); }
          75% { transform: translate(3px,3px) rotate(3deg) scale(1.06); filter: drop-shadow(-4px -4px 0px #000); }
        }
        @keyframes bounceRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }

        .anim-wave { display: inline-block; animation: animWave 2.8s ease-in-out infinite; }
        .anim-splash { display: inline-block; animation: animSplash 2s ease-in-out infinite; }
        .anim-bounce { display: inline-block; animation: animBounce 0.75s cubic-bezier(0.28, 0.84, 0.42, 1) infinite; }
        .anim-brutal { display: inline-block; animation: animBrutal 0.22s steps(2) infinite; }
        .anim-bounce-right { display: inline-block; animation: bounceRight 0.8s ease-in-out infinite; }

        @keyframes floatFast { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-12px) rotate(8deg); } }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-7px) rotate(-8deg); } }
        .anim-float-fast { animation: floatFast 1.8s ease-in-out infinite; }
        .anim-float-slow { animation: floatSlow 2.8s ease-in-out infinite; }
      ` }} />

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

        {/* 2. Giant ghost text "IPIXCHAT" */}
        <div
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none z-[2] font-['Anton',sans-serif] uppercase text-white/15 whitespace-nowrap"
          style={{
            fontSize: 'clamp(60px, 18vw, 120px)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          IPIXCHAT
        </div>

        {/* 3. Carousel Items (Gambar + Teks Animasi & SVG Dekoratif) */}
        <div className="absolute inset-0 z-[3]">
          {SLIDES.map((item, index) => {
            let role = 'back';
            if (index === activeIndex) role = 'center';
            else if (index === (activeIndex + 3) % 4) role = 'left';
            else if (index === (activeIndex + 1) % 4) role = 'right';

            let transform = 'translateX(-50%) scale(1)';
            let filter = 'blur(4px)';
            let opacity = 1;
            let zIndex = 5;
            let left = '50%';
            let height = '45%';
            let bottom = '10%';

            if (role === 'center') {
              transform = 'translateX(-50%) scale(1.05)';
              filter = 'blur(0px)';
              opacity = 1;
              zIndex = 20;
              left = '50%';
              height = '85%';
              bottom = '-2%';
            } else if (role === 'left') {
              transform = 'translateX(-50%) scale(0.85)';
              filter = 'blur(2px)';
              opacity = 0.65;
              zIndex = 10;
              left = '20%';
              height = '55%';
              bottom = '10%';
            } else if (role === 'right') {
              transform = 'translateX(-50%) scale(0.85)';
              filter = 'blur(2px)';
              opacity = 0.65;
              zIndex = 10;
              left = '80%';
              height = '55%';
              bottom = '10%';
            }

            const isActive = role === 'center';

            return (
              <div
                key={item.id}
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
                {/* Gambar Karakter Lokal (1.webp - 4.webp) */}
                <img
                  src={item.src}
                  alt={`Slide ${item.text}`}
                  draggable={false}
                  className="w-full h-full object-contain object-bottom pointer-events-none select-none"
                />

                {/* Teks Animasi Utama & SVG Dekoratif di Atas Kepala Karakter */}
                {isActive && (
                  <div className="absolute top-[12%] inset-x-0 flex justify-center items-center pointer-events-none z-30">
                    <div className={`relative font-['Anton',sans-serif] uppercase text-white tracking-wider ${item.animClass}`} style={{ fontSize: 'clamp(2.2rem, 8vw, 3.4rem)', textShadow: '0 6px 16px rgba(0,0,0,0.35)' }}>
                      {item.text}

                      {/* 1. SVG Chat Lucu untuk CHAT */}
                      {item.id === 'chat' && (
                        <>
                          <svg className="absolute -top-5 -right-6 w-8 h-8 text-yellow-300 drop-shadow-md anim-float-fast" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3.5 8c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-6 0c0 .83-.67 1.5-1.5 1.5S7.5 10.83 7.5 10s.67-1.5 1.5-1.5 1.5.67 1.5 1.5z"/>
                          </svg>
                          <svg className="absolute -bottom-3 -left-5 w-6 h-6 text-white drop-shadow-md anim-float-slow" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.82 1.54 5.3 3.94 6.84L5.5 22l3.8-1.55c.86.23 1.77.35 2.7.35 5.52 0 10-3.92 10-8.75S17.52 2 12 2z"/>
                          </svg>
                        </>
                      )}

                      {/* 2. SVG Palette/Splash Lucu untuk TEMA */}
                      {item.id === 'tema' && (
                        <>
                          <svg className="absolute -top-5 -left-7 w-9 h-9 text-pink-300 drop-shadow-md anim-float-slow" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8z"/>
                          </svg>
                          <svg className="absolute -bottom-2 -right-5 w-6 h-6 text-yellow-200 drop-shadow-md anim-float-fast" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61z"/>
                          </svg>
                        </>
                      )}

                      {/* 3. SVG Nada Musik Bouncing untuk MP3 */}
                      {item.id === 'mp3' && (
                        <>
                          <svg className="absolute -top-6 -right-5 w-8 h-8 text-emerald-200 drop-shadow-md anim-bounce" viewBox="0 0 24 24" fill="currentColor" style={{ animationDuration: '0.8s' }}>
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                          </svg>
                          <svg className="absolute -bottom-3 -left-5 w-7 h-7 text-white drop-shadow-md anim-bounce" viewBox="0 0 24 24" fill="currentColor" style={{ animationDuration: '1.1s' }}>
                            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                          </svg>
                        </>
                      )}

                      {/* 4. SVG Sosmed Mini Explosion untuk iPiX */}
                      {item.id === 'ipix' && (
                        <>
                          <svg className="absolute -top-5 -right-6 w-7 h-7 text-yellow-300 drop-shadow-md anim-brutal" viewBox="0 0 24 24" fill="currentColor" style={{ animationDuration: '0.3s' }}>
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          <svg className="absolute -bottom-3 -left-6 w-7 h-7 text-cyan-200 drop-shadow-md anim-brutal" viewBox="0 0 24 24" fill="currentColor" style={{ animationDuration: '0.2s' }}>
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                          </svg>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 4. Bottom-left Nav buttons */}
        <div className="absolute bottom-3 left-4 z-[60]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('prev')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/40 bg-black/20 backdrop-blur-md text-white transition-all duration-150 ease-out hover:scale-110 active:scale-95"
              aria-label="Previous Slide"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => navigate('next')}
              className="w-8 h-8 flex items-center justify-center rounded-full border border-white/40 bg-black/20 backdrop-blur-md text-white transition-all duration-150 ease-out hover:scale-110 active:scale-95"
              aria-label="Next Slide"
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* 5. Bottom-right link "EXPLORE [NAMA SLIDE]" dengan Animasi Bouncing ke Kanan */}
        <div className="absolute bottom-3 right-4 z-[60] bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/20">
          <Link
            href={SLIDES[activeIndex].link}
            className="group flex items-center gap-1.5 font-['Anton',sans-serif] text-white opacity-95 hover:opacity-100 transition-opacity duration-200 uppercase"
            style={{
              fontSize: '14px',
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}
          >
            <span>EXPLORE {SLIDES[activeIndex].text}</span>
            <ArrowRight className="w-3.5 h-3.5 anim-bounce-right" strokeWidth={3} />
          </Link>
        </div>

      </div>
    </div>
  );
}