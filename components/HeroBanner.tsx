'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';

const SLIDES = [
  { id: 'chat', src: '/1.webp', audio: '/1.mp3', text: 'CHAT', link: '/chat' },
  { id: 'tema', src: '/2.webp', audio: '/2.mp3', text: 'TEMA', link: '/tema' },
  { id: 'mp3', src: '/3.webp', audio: '/3.mp3', text: 'MP3', link: '/mp3' },
  { id: 'ipix', src: '/4.webp', audio: '/4.mp3', text: 'iPiX', link: '/tentang' },
];

// Palet warna tiap gambar
const SLIDE_COLORS: Record<string, string> = {
  chat: '#F97316', // Orange
  tema: '#06B6D4', // Biru Cyan
  mp3: '#22C55E',  // Hijau
  ipix: '#EF4444', // Merah Terang
};

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

// Durasi & kurva transisi ultra-halus
const TRANSITION_DURATION = 500;
const CUBIC_BEZIER = 'cubic-bezier(0.16, 1, 0.3, 1)';

export default function HeroBanner() {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentSlide = SLIDES[activeIndex];
  const activeTextColor = SLIDE_COLORS[currentSlide.id] || 'var(--accent)';

  // Deteksi ukuran layar (Mobile vs Desktop)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload gambar dan audio
  useEffect(() => {
    SLIDES.forEach((slide) => {
      const image = new Image();
      image.src = slide.src;
      
      const audio = new Audio();
      audio.src = slide.audio;
    });
  }, []);

  // Putar Sound Effect MP3 sesuai hero aktif jika tidak dibisukan
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!isMuted) {
      const soundPath = SLIDES[activeIndex].audio;
      const sound = new Audio(soundPath);
      sound.volume = 0.6;

      sound.play().catch(() => {
        // Menangani kebijakan Autoplay browser jika belum ada interaksi pengguna
      });

      audioRef.current = sound;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [activeIndex, isMuted]);

  // Auto slide interval 5 detik (5000ms)
  useEffect(() => {
    const timer = setInterval(() => {
      navigate('prev');
    }, 5000);

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

  const toggleMute = () => {
    setIsMuted((prev) => {
      const nextMuteState = !prev;
      if (nextMuteState && audioRef.current) {
        audioRef.current.pause();
      }
      return nextMuteState;
    });
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
      className="relative w-full overflow-hidden font-['Inter',sans-serif] rounded-3xl border shadow-lg select-none touch-pan-y backdrop-blur-md transform-gpu"
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

        /* ---------------- ANIMASI OUTLINE BERJALAN HURUF DEMI HURUF ---------------- */
        @keyframes letterStrokeRun {
          0% {
            -webkit-text-stroke: 0px transparent;
          }
          30% {
            -webkit-text-stroke: 1.2px color-mix(in srgb, var(--flash-color) 45%, transparent);
          }
          70% {
            -webkit-text-stroke: 1.2px color-mix(in srgb, var(--flash-color) 45%, transparent);
          }
          100% {
            -webkit-text-stroke: 0px transparent;
          }
        }

        .anim-letter-stroke {
          animation: letterStrokeRun 0.5s ease-in-out forwards;
        }

        /* ---------------- EFEK HERO TENGAH ---------------- */
        @keyframes ringLightScan {
          0% { top: 0%; opacity: 0; transform: translateX(-50%) rotateX(60deg) scale(0.75); }
          18% { opacity: 0.95; }
          75% { opacity: 0.85; }
          100% { top: 82%; opacity: 0; transform: translateX(-50%) rotateX(60deg) scale(1.15); }
        }

        @keyframes laserBeamScan {
          0% { top: 2%; opacity: 0; }
          15% { opacity: 1; }
          85% { opacity: 1; }
          100% { top: 85%; opacity: 0; }
        }

        @keyframes soundWavePulse1 {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0.9; border-width: 3px; }
          60% { opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; border-width: 1px; }
        }
        @keyframes soundWavePulse2 {
          0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
          25% { opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }

        @keyframes ipixHexPulse {
          0% { transform: translate(-50%, -50%) scale(0.3) rotate(0deg); opacity: 0.9; }
          50% { opacity: 0.8; }
          100% { transform: translate(-50%, -50%) scale(1.45) rotate(90deg); opacity: 0; }
        }
        @keyframes ipixEnergyGlow {
          0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.9; }
          100% { transform: translate(-50%, -50%) scale(1.2); opacity: 0; }
        }

        .anim-ring-light { animation: ringLightScan 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .anim-laser-beam { animation: laserBeamScan 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .anim-wave-1 { animation: soundWavePulse1 0.45s ease-out forwards; }
        .anim-wave-2 { animation: soundWavePulse2 0.55s ease-out forwards; }
        .anim-ipix-hex { animation: ipixHexPulse 0.48s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .anim-ipix-glow { animation: ipixEnergyGlow 0.4s ease-out forwards; }
      ` }} />

      <div className="relative w-full h-[220px] sm:h-[250px] overflow-hidden">

        {/* 1. Grain Noise Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[50] opacity-25"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundSize: '180px 180px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* 2. Tombol Sound On / Off (Pojok Kanan Atas) */}
        <div className="absolute top-3 right-4 z-[60]">
          <button
            onClick={toggleMute}
            className="w-8 h-8 flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-150 ease-out hover:scale-110 active:scale-95"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--foreground) 20%, transparent)',
            }}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? (
              <VolumeX size={16} strokeWidth={2.5} style={{ color: activeTextColor }} />
            ) : (
              <Volume2 size={16} strokeWidth={2.5} style={{ color: activeTextColor }} />
            )}
          </button>
        </div>

        {/* 3. Teks Raksasa "IPIXCHAT" (Efek Cekung/Inset Ke Dalam) */}
        <div
          className="absolute inset-x-0 top-3 sm:top-4 flex items-center justify-center pointer-events-none select-none z-[2] font-['Anton',sans-serif] uppercase whitespace-nowrap"
          style={{
            fontSize: 'clamp(50px, 16vw, 100px)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.01em',
            transform: 'skewX(-10deg)',
            opacity: 0.38,
            backgroundImage: 'linear-gradient(180deg, #0A0E17 0%, #1A2332 60%, #2D3A4E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: `
              drop-shadow(0px -1.5px 1px rgba(0, 0, 0, 0.95))
              drop-shadow(0px 1px 1px rgba(255, 255, 255, 0.12))
            `,
          }}
        >
          {'IPIXCHAT'.split('').map((letter, idx) => (
            <span
              key={`${activeIndex}-${idx}`}
              className="inline-block anim-letter-stroke"
              style={{
                animationDelay: `${idx * 45}ms`,
                '--flash-color': activeTextColor,
              } as React.CSSProperties}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* 4. Carousel 3D Characters */}
        <div className="absolute inset-0 z-[3]">
          {SLIDES.map((item, index) => {
            let role = 'back';
            if (index === activeIndex) role = 'center';
            else if (index === (activeIndex + 3) % 4) role = 'left';
            else if (index === (activeIndex + 1) % 4) role = 'right';

            if (role === 'back') return null;

            let left = '50%';
            let top = '18%';
            let height = isMobile ? '82%' : '88%';
            let opacity = 1;
            let zIndex = 20;
            let transform = `translateX(-50%) scale(${isMobile ? 1.05 : 1.15})`;

            if (role === 'center') {
              left = '50%';
              top = '18%';
              height = isMobile ? '82%' : '88%';
              opacity = 1;
              zIndex = 20;
              transform = `translateX(-50%) scale(${isMobile ? 1.05 : 1.15})`;
            } else if (role === 'left') {
              left = isMobile ? '18%' : '25%';
              top = '27%';
              height = isMobile ? '48%' : '54%';
              opacity = 0.65;
              zIndex = 10;
              transform = 'translateX(-50%) scale(0.82)';
            } else if (role === 'right') {
              left = isMobile ? '82%' : '75%';
              top = '27%';
              height = isMobile ? '48%' : '54%';
              opacity = 0.65;
              zIndex = 10;
              transform = 'translateX(-50%) scale(0.82)';
            }

            return (
              <div
                key={item.id}
                className="absolute aspect-[0.6/1] transform-gpu will-change-[transform,left,top,height,opacity]"
                style={{
                  left,
                  top,
                  height,
                  opacity,
                  zIndex,
                  transform,
                  filter: 'blur(0px)',
                  transition: `
                    transform ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    left ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    top ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    height ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    opacity ${TRANSITION_DURATION}ms ${CUBIC_BEZIER}
                  `,
                }}
              >
                {/* EFEK KHUSUS HERO TENGAH (CENTER) */}
                {role === 'center' && (
                  <>
                    {/* Glow Redup di Tengah Hero Sesuai Warna Theme */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full blur-2xl pointer-events-none z-[12] transition-colors duration-500 ease-out"
                      style={{
                        backgroundColor: activeTextColor,
                        opacity: 0.22,
                      }}
                    />

                    {item.id === 'chat' && (
                      <div
                        key={`ring-${activeIndex}`}
                        className="absolute left-1/2 w-32 h-16 rounded-[100%] border-[2.5px] pointer-events-none z-[25] anim-ring-light"
                        style={{
                          borderColor: activeTextColor,
                          boxShadow: `0 0 14px ${activeTextColor}, inset 0 0 10px ${activeTextColor}`,
                        }}
                      />
                    )}

                    {item.id === 'tema' && (
                      <div
                        key={`laser-${activeIndex}`}
                        className="absolute left-0 right-0 h-[3px] pointer-events-none z-[25] anim-laser-beam"
                        style={{
                          backgroundColor: activeTextColor,
                          boxShadow: `0 0 12px ${activeTextColor}, 0 0 25px ${activeTextColor}`,
                        }}
                      >
                        <div
                          className="absolute inset-x-0 h-12 -top-6 opacity-30"
                          style={{
                            background: `linear-gradient(180deg, transparent, ${activeTextColor}, transparent)`,
                          }}
                        />
                      </div>
                    )}

                    {item.id === 'mp3' && (
                      <div key={`wave-container-${activeIndex}`}>
                        <div
                          className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full border pointer-events-none z-[25] anim-wave-1"
                          style={{
                            borderColor: activeTextColor,
                            boxShadow: `0 0 15px ${activeTextColor}`,
                          }}
                        />
                        <div
                          className="absolute top-1/2 left-1/2 w-40 h-40 rounded-full border pointer-events-none z-[24] anim-wave-2"
                          style={{
                            borderColor: activeTextColor,
                            boxShadow: `0 0 20px ${activeTextColor}`,
                          }}
                        />
                      </div>
                    )}

                    {item.id === 'ipix' && (
                      <div key={`ipix-container-${activeIndex}`}>
                        <div
                          className="absolute top-1/2 left-1/2 w-32 h-32 border-[2px] rounded-[22px] pointer-events-none z-[25] anim-ipix-hex"
                          style={{
                            borderColor: activeTextColor,
                            boxShadow: `0 0 18px ${activeTextColor}, inset 0 0 12px ${activeTextColor}`,
                          }}
                        />
                        <div
                          className="absolute top-1/2 left-1/2 w-44 h-44 rounded-full blur-lg pointer-events-none z-[24] anim-ipix-glow"
                          style={{
                            backgroundColor: activeTextColor,
                          }}
                        />
                      </div>
                    )}

                    {/* Bayangan Hitam Sedikit di Bawah Hero Tengah */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[72%] h-2.5 rounded-[100%] blur-[3px] pointer-events-none z-[15] opacity-70"
                      style={{
                        backgroundColor: '#000000',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.85)',
                      }}
                    />
                  </>
                )}

                {/* Gambar Main Hero */}
                <img
                  src={item.src}
                  alt={`Slide Character ${index + 1}`}
                  draggable={false}
                  loading={role === 'center' ? 'eager' : 'lazy'}
                  // @ts-ignore
                  fetchpriority={role === 'center' ? 'high' : 'low'}
                  className="w-full h-full object-contain object-bottom pointer-events-none select-none relative z-[20] drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]"
                />

                {/* EFEK MIRROR / REFLEKSI DIBAWAH HERO KIRI DAN KANAN */}
                {(role === 'left' || role === 'right') && (
                  <div className="absolute top-[98%] left-0 right-0 h-[38%] overflow-hidden pointer-events-none opacity-25 select-none z-[18]">
                    <img
                      src={item.src}
                      alt=""
                      draggable={false}
                      className="w-full h-full object-contain object-top scale-y-[-1] filter blur-[1px]"
                      style={{
                        maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 80%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 80%)',
                      }}
                    />
                  </div>
                )}
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
              }}
              aria-label="Previous Slide"
            >
              <ArrowLeft size={16} strokeWidth={2.5} style={{ color: activeTextColor }} />
            </button>
            <button
              onClick={() => navigate('next')}
              className="w-8 h-8 flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-150 ease-out hover:scale-110 active:scale-95"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--foreground) 20%, transparent)',
              }}
              aria-label="Next Slide"
            >
              <ArrowRight size={16} strokeWidth={2.5} style={{ color: activeTextColor }} />
            </button>
          </div>
        </div>

        {/* 6. Tombol Explore Kanan Bawah */}
        <div className="absolute bottom-3 right-4 z-[60]">
          <Link
            href={currentSlide.link}
            className="group flex items-center gap-1.5 transition-all duration-200"
          >
            <span
              className="text-[11px] font-medium tracking-wide uppercase opacity-70 italic pb-0.5 border-b-2 transition-all duration-250"
              style={{
                color: 'var(--foreground)',
                borderColor: activeTextColor,
              }}
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