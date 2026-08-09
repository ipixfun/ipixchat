'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Import Theme Context dari aplikasi
import { useTheme } from '@/app/context/ThemeContext';

const SLIDES = [
  {
    id: 'chat',
    src: '/1.webp',
    text: 'CHAT',
    link: '/chat',
  },
  {
    id: 'tema',
    src: '/2.webp',
    text: 'TEMA',
    link: '/tema',
  },
  {
    id: 'mp3',
    src: '/3.webp',
    text: 'MP3',
    link: '/mp3',
  },
  {
    id: 'ipix',
    src: '/4.webp',
    text: 'iPiX',
    link: '/tentang',
  },
];

// Map warna teks khusus per slide jika tema yang aktif adalah 'dark'
const DARK_SLIDE_COLORS: Record<string, string> = {
  chat: '#F97316', // Orange
  tema: '#06B6D4', // Biru Cyan
  mp3: '#22C55E',  // Hijau
  ipix: '#881337', // Merah Maroon
};

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

// Durasi transisi dipercepat ke 250ms & cubic bezier ultra smooth
const TRANSITION_DURATION = 250;
const CUBIC_BEZIER = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function HeroBanner() {
  const { theme } = useTheme();

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const isDark = theme === 'dark';
  const currentSlide = SLIDES[activeIndex];

  // Menentukan warna teks aktif (khusus jika tema dark)
  const activeTextColor = isDark
    ? DARK_SLIDE_COLORS[currentSlide.id] || 'var(--accent)'
    : 'var(--accent)';

  useEffect(() => {
    SLIDES.forEach((slide) => {
      const image = new Image();
      image.src = slide.src;
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      navigate('prev');
    }, 3500);

    return () => clearInterval(timer);
  }, [activeIndex, isAnimating]);

  const navigate = (dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);

    setActiveIndex((prev) => {
      if (dir === 'next') return (prev + 1) % SLIDES.length;
      return (prev + SLIDES.length - 1) % SLIDES.length;
    });

    setTimeout(() => {
      setIsAnimating(false);
    }, TRANSITION_DURATION);
  };

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
    if (distance > 40) navigate('next');
    else if (distance < -40) navigate('prev');
  };

  return (
    <div
      className="relative w-full overflow-hidden font-['Inter',sans-serif] rounded-3xl border shadow-lg select-none touch-pan-y backdrop-blur-md"
      style={{
        backgroundColor: "var(--card-bg)",
        borderColor: "var(--card-border)",
        color: "var(--foreground)",
        transition: `background-color ${TRANSITION_DURATION}ms ${CUBIC_BEZIER}, border-color ${TRANSITION_DURATION}ms ${CUBIC_BEZIER}`,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounceRight {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .anim-bounce-right { display: inline-block; animation: bounceRight 0.8s ease-in-out infinite; }
      ` }} />

      <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden">

        {/* 1. Grain Noise Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-50 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundSize: '200px 200px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* 2. Glow Blur Belakang Tengah (Ditransparansikan ke opacity 0.2 / 20%) */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full blur-[70px] pointer-events-none opacity-20 z-[1]"
          style={{
            backgroundColor: activeTextColor,
            transition: `background-color ${TRANSITION_DURATION}ms ${CUBIC_BEZIER}`,
          }}
        />

        {/* 3. Teks Raksasa Latar Belakang */}
        <div
          className="absolute inset-x-0 top-2 sm:top-3 flex items-center justify-center pointer-events-none select-none z-[2] font-['Anton',sans-serif] uppercase whitespace-nowrap"
          style={{
            fontSize: 'clamp(50px, 16vw, 100px)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: activeTextColor,
            opacity: 0.15,
            transition: `color ${TRANSITION_DURATION}ms ${CUBIC_BEZIER}`,
          }}
        >
          IPIXCHAT
        </div>

        {/* 4. Carousel Slide Items (Kiri & Kanan Tetap Blur 3px & Opacity 0.65) */}
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
              filter = 'blur(3px)';
              opacity = 0.65;
              zIndex = 10;
              left = '20%';
              height = '55%';
              bottom = '10%';
            } else if (role === 'right') {
              transform = 'translateX(-50%) scale(0.85)';
              filter = 'blur(3px)';
              opacity = 0.65;
              zIndex = 10;
              left = '80%';
              height = '55%';
              bottom = '10%';
            }

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
                    transform ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    filter ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    opacity ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    left ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    height ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    bottom ${TRANSITION_DURATION}ms ${CUBIC_BEZIER}
                  `,
                }}
              >
                <img
                  src={item.src}
                  alt={`Slide ${item.text}`}
                  draggable={false}
                  className="w-full h-full object-contain object-bottom pointer-events-none select-none"
                />
              </div>
            );
          })}
        </div>

        {/* 5. Tombol Navigasi Kiri Bawah */}
        <div className="absolute bottom-3 left-4 z-[60]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigate('prev')}
              className="w-8 h-8 flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-150 ease-out hover:scale-110 active:scale-95"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--foreground) 20%, transparent)',
                color: 'var(--foreground)',
              }}
              aria-label="Previous Slide"
            >
              <ArrowLeft size={16} strokeWidth={2.5} />
            </button>
            <button
              onClick={() => navigate('next')}
              className="w-8 h-8 flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-150 ease-out hover:scale-110 active:scale-95"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--foreground) 20%, transparent)',
                color: 'var(--foreground)',
              }}
              aria-label="Next Slide"
            >
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* 6. Tombol Explore Kanan Bawah */}
        <div
          className="absolute bottom-3 right-4 z-[60] px-3.5 py-1.5 rounded-full backdrop-blur-md border transition-colors duration-250"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--background) 60%, transparent)',
            borderColor: 'var(--card-border)',
          }}
        >
          <Link
            href={currentSlide.link}
            className="group flex items-center gap-1.5 transition-opacity duration-200"
          >
            <span
              className="text-[11px] font-medium tracking-wide uppercase opacity-70"
              style={{ color: 'var(--foreground)' }}
            >
              explore
            </span>
            <span
              className="text-sm font-black tracking-wide uppercase transition-colors duration-250"
              style={{ color: activeTextColor }}
            >
              {currentSlide.text}
            </span>
            <ArrowRight
              className="w-3.5 h-3.5 anim-bounce-right ml-0.5 transition-colors duration-250"
              style={{ color: activeTextColor }}
              strokeWidth={3}
            />
          </Link>
        </div>

      </div>
    </div>
  );
}