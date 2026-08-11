'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';

const SLIDES = [
  { id: 'welcome', src: '/0.webp', audio: '/0.mp3', text: 'WELCOME', link: '#' },
  { id: 'chat', src: '/1.webp', audio: '/1.mp3', text: 'CHAT', link: '/chat' },
  { id: 'tema', src: '/2.webp', audio: '/2.mp3', text: 'TEMA', link: '/tema' },
  { id: 'mp3', src: '/3.webp', audio: '/3.mp3', text: 'MP3', link: '/mp3' },
  { id: 'ipix', src: '/4.webp', audio: '/4.mp3', text: 'iPiX', link: '/tentang' },
];

const SLIDE_COLORS: Record<string, string> = {
  welcome: '#FACC15', // Kuning Hero 0
  chat: '#F97316',    // Orange
  tema: '#06B6D4',    // Biru Cyan
  mp3: '#22C55E',     // Hijau
  ipix: '#EF4444',    // Merah Terang
};

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

const TRANSITION_DURATION = 500;
const CUBIC_BEZIER = 'cubic-bezier(0.16, 1, 0.3, 1)';

// Component pembeku gambar WebP (Mengambil frame static ke canvas)
function FrozenWebP({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = img.naturalWidth || 400;
      canvas.height = img.naturalHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
    };
  }, [src]);

  return <canvas ref={canvasRef} className={className} style={style} />;
}

export default function HeroBanner() {
  const { theme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Ambil pilihan Mute terakhir dari localStorage
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ipix_hero_muted') === 'true';
    }
    return false;
  });

  const [audioLevel, setAudioLevel] = useState(0);
  const [typedCount, setTypedCount] = useState(0);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Web Audio API Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentSlide = SLIDES[activeIndex];
  const activeTextColor = SLIDE_COLORS[currentSlide.id] || 'var(--accent)';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preload gambar dan audio
  useEffect(() => {
    SLIDES.forEach((slide) => {
      const audio = new Audio();
      audio.src = slide.audio;
      const image = new Image();
      image.src = slide.src;
    });
  }, []);

  // Efek Ketikan Teks Dinamis
  useEffect(() => {
    setTypedCount(0);
    const isWelcomeSlide = SLIDES[activeIndex].id === 'welcome';
    const fullText = isWelcomeSlide ? 'SELAMAT DATANG' : `EXPLORE ${SLIDES[activeIndex].text}`;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      setTypedCount(current);
      if (current >= fullText.length) {
        clearInterval(timer);
      }
    }, 65);

    return () => clearInterval(timer);
  }, [activeIndex]);

  // Handle perpindahan tab browser
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!audioRef.current) return;

      if (document.hidden) {
        audioRef.current.pause();
      } else {
        if (!isMuted) {
          audioRef.current.play().catch(() => {});
        } else {
          audioRef.current.pause();
          audioRef.current.muted = true;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMuted]);

  // Audio Setup & Analyser
  useEffect(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = 'anonymous';
    }

    const audio = audioRef.current;
    audio.pause();
    audio.src = SLIDES[activeIndex].audio;
    audio.currentTime = 0;
    audio.volume = 0.7;
    audio.muted = isMuted;

    if (!isMuted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            initAudioAnalyser(audio);
          })
          .catch(() => {
            // Autoplay browser fallback
          });
      }
    } else {
      audio.pause();
      setAudioLevel(0);
    }

    return () => {
      audio.pause();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [activeIndex, isMuted]);

  const initAudioAnalyser = (audioElement: HTMLAudioElement) => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }

      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (!analyserRef.current) {
        analyserRef.current = audioCtxRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        analyserRef.current.smoothingTimeConstant = 0.75;
      }

      if (!sourceRef.current) {
        sourceRef.current = audioCtxRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioCtxRef.current.destination);
      }

      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderFrame = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(1, avg / 130);

        setAudioLevel(normalized);
        animFrameRef.current = requestAnimationFrame(renderFrame);
      };

      renderFrame();
    } catch (e) {
      // AudioContext fallback
    }
  };

  // Loop Slide Otomatis (0 -> 1 -> 2 -> 3 -> 4 -> 0)
  useEffect(() => {
    const timer = setInterval(() => {
      navigate('next');
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
      const nextMute = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('ipix_hero_muted', String(nextMute));
      }

      if (audioRef.current) {
        audioRef.current.muted = nextMute;
        if (nextMute) {
          audioRef.current.pause();
          setAudioLevel(0);
        } else {
          audioRef.current.play().catch(() => {});
        }
      }
      return nextMute;
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

  // Kalkulasi teks ketikan dinamis
  const isWelcomeSlide = currentSlide.id === 'welcome';
  const fullTargetText = isWelcomeSlide ? 'SELAMAT DATANG' : `EXPLORE ${SLIDES[activeIndex].text}`;
  const currentTypedString = fullTargetText.slice(0, typedCount);
  const word1 = currentTypedString.slice(0, 7); // "SELAMAT" / "EXPLORE"
  const word2 = currentTypedString.length > 8 ? currentTypedString.slice(8) : ''; // "DATANG" / Nama menu

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

        @keyframes letterStrokeRun {
          0% { -webkit-text-stroke: 0px transparent; }
          30% { -webkit-text-stroke: 1.2px color-mix(in srgb, var(--flash-color) 45%, transparent); }
          70% { -webkit-text-stroke: 1.2px color-mix(in srgb, var(--flash-color) 45%, transparent); }
          100% { -webkit-text-stroke: 0px transparent; }
        }

        .anim-letter-stroke {
          animation: letterStrokeRun 0.5s ease-in-out forwards;
        }

        /* ANIMASI BARU: PUTARAN KOLEKTOR ACTION FIGURE HALUS 3D */
        @keyframes actionFigureRotate {
          0% { rotateY(-18deg); }
          50% { rotateY(18deg); }
          100% { rotateY(-18deg); }
        }

        .anim-figure-rotation {
          animation: actionFigureRotate 10s ease-in-out infinite;
          transform-origin: center bottom;
          backface-visibility: hidden;
        }

        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .anim-typing-cursor {
          animation: blinkCursor 0.6s infinite;
        }
      ` }} />

      <div className="relative w-full h-[220px] sm:h-[250px] overflow-hidden">

        {/* 1. Dynamic Audio Background Glow */}
        <div
          className="absolute inset-0 pointer-events-none z-[1] transform-gpu transition-all duration-75 ease-out"
          style={{
            background: `radial-gradient(ellipse 90% 80% at 50% 50%, ${activeTextColor} 0%, transparent 75%)`,
            opacity: 0.08 + audioLevel * 0.42,
            filter: `blur(${12 + audioLevel * 20}px)`,
            transform: `scale(${1 + audioLevel * 0.15})`,
          }}
        />

        {/* 2. Grain Noise Overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-[50] opacity-25"
          style={{
            backgroundImage: NOISE_SVG,
            backgroundSize: '180px 180px',
            backgroundRepeat: 'repeat',
          }}
        />

        {/* 3. Teks Raksasa "IPIXCHAT" dengan Efek Cekung */}
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
            let role = 'back-right';
            if (index === activeIndex) role = 'center';
            else if (index === (activeIndex + SLIDES.length - 1) % SLIDES.length) role = 'left';
            else if (index === (activeIndex + 1) % SLIDES.length) role = 'right';
            else if (index === (activeIndex + SLIDES.length - 2) % SLIDES.length) role = 'back-left';

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
            } else if (role === 'back-left') {
              left = '0%';
              top = '27%';
              height = isMobile ? '48%' : '54%';
              opacity = 0;
              zIndex = 1;
              transform = 'translateX(-50%) scale(0.5)';
            } else {
              left = '100%';
              top = '27%';
              height = isMobile ? '48%' : '54%';
              opacity = 0;
              zIndex = 1;
              transform = 'translateX(-50%) scale(0.5)';
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
                {/* EFEK KHUSUS HERO TENGAH (BERLAKU UNTUK SEMUA HERO) */}
                {role === 'center' && (
                  <>
                    {/* Glow Aura Redup di Belakang Hero */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 rounded-full blur-2xl pointer-events-none z-[12] transition-colors duration-500 ease-out"
                      style={{
                        backgroundColor: activeTextColor,
                        opacity: 0.22,
                      }}
                    />

                    {/* SOROTAN LAMPU PENDAR DARI BAWAH MENYOROT HERO */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-[13] transition-all duration-500 ease-out"
                      style={{
                        width: isMobile ? '140px' : '180px',
                        height: '110%',
                        background: `linear-gradient(to top, ${activeTextColor} 0%, color-mix(in srgb, ${activeTextColor} 35%, transparent) 45%, transparent 100%)`,
                        clipPath: 'polygon(30% 100%, 70% 100%, 100% 0%, 0% 0%)',
                        filter: 'blur(10px)',
                        opacity: 0.35 + audioLevel * 0.25,
                      }}
                    />

                    {/* SEMUA EFEK RING PENDAR SPESIFIK HERO (CHATTING RING, LASER TEMA, MP3 WAVE, IPIX HEX) DIHAPUS */}
                    
                    {/* Shadow Dasar Karakter */}
                    <div
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[72%] h-2.5 rounded-[100%] blur-[3px] pointer-events-none z-[15] opacity-70"
                      style={{
                        backgroundColor: '#000000',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.85)',
                      }}
                    />
                  </>
                )}

                {/* Karakter Depan (Center): Bergerak & PUTARAN ACTION FIGURE kolektor Halus 3D */}
                {role === 'center' ? (
                  item.isVideo ? (
                    <video
                      src={item.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-contain object-bottom pointer-events-none select-none relative z-[20] drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] anim-figure-rotation"
                    />
                  ) : (
                    <img
                      src={item.src}
                      alt={`Slide Character ${index}`}
                      draggable={false}
                      loading="eager"
                      // @ts-ignore
                      fetchpriority="high"
                      className="w-full h-full object-contain object-bottom pointer-events-none select-none relative z-[20] drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)] anim-figure-rotation"
                    />
                  )
                ) : (
                  // Karakter Samping (Membeku & Mirror)
                  <FrozenWebP
                    src={item.src}
                    className="w-full h-full object-contain object-bottom pointer-events-none select-none relative z-[20] drop-shadow-[0_4px_6px_rgba(0,0,0,0.35)]"
                  />
                )}

                {/* Refleksi Mirror Hero Kiri dan Kanan */}
                {(role === 'left' || role === 'right') && (
                  <div className="absolute top-[98%] left-0 right-0 h-[38%] overflow-hidden pointer-events-none opacity-25 select-none z-[18]">
                    <FrozenWebP
                      src={item.src}
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

        {/* 5. Tombol Navigasi & Sound (Pojok Kiri Bawah) */}
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

            {/* Tombol Sound On / Off */}
            <button
              onClick={toggleMute}
              className="w-8 h-8 flex items-center justify-center rounded-full border backdrop-blur-md transition-all duration-150 ease-out hover:scale-110 active:scale-95"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--foreground) 10%, transparent)',
                borderColor: isMuted
                  ? 'color-mix(in srgb, var(--foreground) 20%, transparent)'
                  : activeTextColor,
              }}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? (
                <VolumeX size={16} strokeWidth={2.5} className="text-gray-400 opacity-70" />
              ) : (
                <Volume2
                  size={16}
                  strokeWidth={2.5}
                  style={{ color: activeTextColor }}
                />
              )}
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

        {/* 6. Tombol Explore / Teks Ketikan (Pojok Kanan Bawah) */}
        <div className="absolute bottom-3 right-4 z-[60]">
          <Link
            href={currentSlide.link}
            className="group flex items-center gap-1 transition-all duration-200"
          >
            {word1 && (
              <span
                className={`text-[11px] font-extrabold tracking-wide uppercase italic pb-0.5 transition-all duration-250 ${
                  isWelcomeSlide ? '' : 'border-b-2 opacity-70'
                }`}
                style={{
                  color: isWelcomeSlide ? '#D1D5DB' : 'var(--foreground)', // Abu-abu muda untuk "SELAMAT"
                  borderColor: isWelcomeSlide ? 'transparent' : activeTextColor,
                }}
              >
                {word1}
              </span>
            )}
            {word2 && (
              <span
                className="text-sm font-black tracking-wide uppercase italic transition-colors duration-250 ml-1"
                style={{
                  color: isWelcomeSlide ? '#FACC15' : activeTextColor, // Kuning hero 0 untuk "DATANG"
                }}
              >
                {word2}
              </span>
            )}
            {/* Dash Kedip-kedip Miring (Italic) */}
            <span
              className="text-sm font-black italic anim-typing-cursor -ml-0.5"
              style={{ color: isWelcomeSlide ? '#FACC15' : activeTextColor }}
            >
              |
            </span>
            <ArrowRight
              className="w-3.5 h-3.5 anim-bounce-right ml-0.5 transition-colors duration-250"
              style={{ color: isWelcomeSlide ? '#FACC15' : activeTextColor }}
              strokeWidth={3}
            />
          </Link>
        </div>

      </div>
    </div>
  );
}