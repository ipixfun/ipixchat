'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';

const SLIDES = [
  { id: 'chat', src: '/1.webp', text: 'CHAT', link: '/chat' },
  { id: 'tema', src: '/2.webp', text: 'TEMA', link: '/tema' },
  { id: 'mp3', src: '/3.webp', text: 'MP3', link: '/mp3' },
  { id: 'ipix', src: '/4.webp', text: 'iPiX', link: '/tentang' },
];

// Palet warna tiap gambar
const SLIDE_COLORS: Record<string, string> = {
  chat: '#F97316', // Orange
  tema: '#06B6D4', // Biru Cyan
  mp3: '#22C55E',  // Hijau
  ipix: '#EF4444', // Merah Terang
};

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`;

const TRANSITION_DURATION = 250;
const CUBIC_BEZIER = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function HeroBanner() {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentSlide = SLIDES[activeIndex];
  const activeTextColor = SLIDE_COLORS[currentSlide.id] || 'var(--accent)';

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
      className="relative w-full overflow-hidden font-['Inter',sans-serif] rounded-3xl border shadow-lg select-none touch-pan-y backdrop-blur-md will-change-transform"
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

        /* KILATAN PETIR SAMBARAN HALUS */
        @keyframes lightningStrikeLeft {
          0% { opacity: 0; transform: scale(0.7) rotate(-8deg); }
          20% { opacity: 0.85; transform: scale(1) rotate(0deg); }
          40% { opacity: 0.2; }
          60% { opacity: 0.6; }
          100% { opacity: 0; transform: scale(0.95) rotate(3deg); }
        }

        @keyframes lightningStrikeRight {
          0% { opacity: 0; transform: scale(0.7) rotate(8deg); }
          25% { opacity: 0.8; transform: scale(1) rotate(0deg); }
          45% { opacity: 0.2; }
          65% { opacity: 0.55; }
          100% { opacity: 0; transform: scale(0.95) rotate(-3deg); }
        }

        /* PULSA LISTRIK BELAKANG GAMBAR */
        @keyframes shockwavePulse {
          0% { transform: translate(-50%, -50%) scale(0.3); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.25); opacity: 0; }
        }

        /* RING LIGHT SCANNING ATAS KE BAWAH (PROPORSI LEBIH BULAT) */
        @keyframes ringLightScan {
          0% {
            top: 0%;
            opacity: 0;
            transform: translateX(-50%) rotateX(60deg) scale(0.75);
          }
          18% {
            opacity: 0.95;
          }
          75% {
            opacity: 0.85;
          }
          100% {
            top: 82%;
            opacity: 0;
            transform: translateX(-50%) rotateX(60deg) scale(1.15);
          }
        }

        /* GLITCH HALUS TEKS IPIXCHAT */
        @keyframes subtleGlitch {
          0%, 82%, 100% {
            transform: translate(0);
            text-shadow: none;
            opacity: 0.15;
          }
          83% {
            transform: translate(-1.5px, 0.5px);
            text-shadow: 2px 0 6px currentColor, -1px 0 3px currentColor;
            opacity: 0.28;
          }
          85% {
            transform: translate(1.5px, -0.5px);
            text-shadow: -2px 0 6px currentColor, 1px 0 3px currentColor;
            opacity: 0.22;
          }
          87% {
            transform: translate(0);
            text-shadow: none;
            opacity: 0.15;
          }
        }

        .anim-lightning-left {
          animation: lightningStrikeLeft 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .anim-lightning-right {
          animation: lightningStrikeRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .anim-shockwave {
          animation: shockwavePulse 0.35s ease-out forwards;
        }

        .anim-ring-light {
          animation: ringLightScan 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }

        .anim-glitch-subtle {
          animation: subtleGlitch 2.8s infinite ease-in-out;
        }
      ` }} />

      <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden">

        {/* 1. Grain Noise Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[4] opacity-25"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundSize: '150px 150px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* 2. Glow Blur Belakang Tengah */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[270px] h-[270px] rounded-full blur-[65px] pointer-events-none opacity-30 z-[1]"
          style={{
            backgroundColor: activeTextColor,
            transition: `background-color ${TRANSITION_DURATION}ms ${CUBIC_BEZIER}`,
          }}
        />

        {/* 3. Teks Raksasa Latar Belakang "IPIXCHAT" dengan Glitch Halus */}
        <div
          className="absolute inset-x-0 top-2 sm:top-3 flex items-center justify-center pointer-events-none select-none z-[2] font-['Anton',sans-serif] uppercase whitespace-nowrap anim-glitch-subtle"
          style={{
            fontSize: 'clamp(50px, 16vw, 100px)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            color: activeTextColor,
            transition: `color ${TRANSITION_DURATION}ms ${CUBIC_BEZIER}`,
          }}
        >
          IPIXCHAT
        </div>

        {/* 4. Carousel Slide Items */}
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
                {/* EFEK SLIDE TENGAH: PETIR + RING LIGHT ATAS KE BAWAH */}
                {role === 'center' && (
                  <>
                    {/* Ring Shockwave Gelombang Listrik Belakang */}
                    <div
                      key={`shockwave-${activeIndex}`}
                      className="absolute top-1/2 left-1/2 w-36 h-36 rounded-full blur-md pointer-events-none z-[15] anim-shockwave"
                      style={{
                        backgroundColor: activeTextColor,
                        boxShadow: `0 0 22px ${activeTextColor}`,
                      }}
                    />

                    {/* RING LIGHT LEBIH BULAT & SWEEP DARI ATAS KE BAWAH LALU HILANG */}
                    <div
                      key={`ring-${activeIndex}`}
                      className="absolute left-1/2 w-32 h-16 rounded-[100%] border-[2.5px] pointer-events-none z-[25] anim-ring-light"
                      style={{
                        borderColor: activeTextColor,
                        boxShadow: `0 0 14px ${activeTextColor}, inset 0 0 10px ${activeTextColor}`,
                      }}
                    />

                    {/* SAMBARAN PETIR KIRI */}
                    <svg
                      key={`bolt-left-${activeIndex}`}
                      className="absolute top-1 left-0 w-16 h-32 pointer-events-none z-[30] anim-lightning-left"
                      viewBox="0 0 60 120"
                      fill="none"
                      style={{
                        filter: `drop-shadow(0 0 9px ${activeTextColor})`,
                      }}
                    >
                      <path
                        d="M38 0 L18 42 L28 45 L8 85 L22 85 L4 120"
                        stroke={activeTextColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    {/* SAMBARAN PETIR KANAN */}
                    <svg
                      key={`bolt-right-${activeIndex}`}
                      className="absolute top-0 right-0 w-16 h-32 pointer-events-none z-[30] anim-lightning-right"
                      viewBox="0 0 60 120"
                      fill="none"
                      style={{
                        filter: `drop-shadow(0 0 9px ${activeTextColor})`,
                      }}
                    >
                      <path
                        d="M22 0 L42 42 L32 45 L52 85 L38 85 L56 120"
                        stroke={activeTextColor}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </>
                )}

                <img
                  src={item.src}
                  alt={`Slide ${item.text}`}
                  draggable={false}
                  loading={role === 'center' ? 'eager' : 'lazy'}
                  // @ts-ignore
                  fetchpriority={role === 'center' ? 'high' : 'low'}
                  className="w-full h-full object-contain object-bottom pointer-events-none select-none relative z-[20]"
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
              className="text-[11px] font-medium tracking-wide uppercase opacity-70 italic"
              style={{ color: 'var(--foreground)' }}
            >
              explore
            </span>
            <span
              className="text-sm font-black tracking-wide uppercase italic transition-colors duration-250"
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