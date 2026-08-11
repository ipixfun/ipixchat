'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/app/context/ThemeContext';

interface SlideItem {
  id: string;
  src: string;
  audio: string;
  text: string;
  link: string;
  isVideo?: boolean;
}

const SLIDES: SlideItem[] = [
  { id: 'welcome', src: '/0.webp', audio: '/0.mp3', text: 'WELCOME', link: '#' },
  { id: 'chat', src: '/1.webp', audio: '/1.mp3', text: 'CHAT', link: '/chat' },
  { id: 'tema', src: '/2.webp', audio: '/2.mp3', text: 'TEMA', link: '/tema' },
  { id: 'mp3', src: '/3.webp', audio: '/3.mp3', text: 'MP3', link: '/mp3' },
  { id: 'ipix', src: '/4.webp', audio: '/4.mp3', text: 'iPiX', link: '/tentang' },
];

const SLIDE_COLORS: Record<string, string> = {
  welcome: '#EAB308', // Kuning Hero 0
  chat: '#F97316',    // Orange
  tema: '#06B6D4',    // Biru Cyan
  mp3: '#22C55E',     // Hijau
  ipix: '#EF4444',    // Merah Terang
};

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E")`;

const TRANSITION_DURATION = 800;
const CUBIC_BEZIER = 'cubic-bezier(0.16, 1, 0.3, 1)';

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
  const isLight = (theme as string) === 'light';

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [slideDuration, setSlideDuration] = useState(5000);

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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const currentSlide = SLIDES[activeIndex];
  const activeTextColor = SLIDE_COLORS[currentSlide.id] || 'var(--accent)';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('hero_slide_change', { detail: { index: activeIndex } })
      );
    }
  }, [activeIndex]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    SLIDES.forEach((slide) => {
      const audio = new Audio();
      audio.src = slide.audio;
      if (!slide.isVideo) {
        const image = new Image();
        image.src = slide.src;
      }
    });
  }, []);

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
    }, 60);

    return () => clearInterval(timer);
  }, [activeIndex]);

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
    audio.volume = 1.0;
    audio.muted = isMuted;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        const calculatedDuration = Math.max(5000, Math.ceil(audio.duration * 1000) + 200);
        setSlideDuration(calculatedDuration);
      } else {
        setSlideDuration(5000);
      }
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    if (!isMuted) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            initAudioAnalyser(audio);
          })
          .catch(() => {});
      }
    } else {
      audio.pause();
      setAudioLevel(0);
    }

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
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
    } catch (e) {}
  };

  useEffect(() => {
    const timer = setInterval(() => {
      navigate('next');
    }, slideDuration);

    return () => clearInterval(timer);
  }, [activeIndex, isAnimating, slideDuration]);

  const navigate = (dir: 'next' | 'prev') => {
    if (isAnimating) return;
    setIsAnimating(true);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

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
          audioRef.current.volume = 1.0;
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
    
    // Swipe jari ke kiri -> putaran hero ke kiri
    if (distance > 40) navigate('prev');
    // Swipe jari ke kanan -> putaran hero ke kanan
    else if (distance < -40) navigate('next');
  };

  const isWelcomeSlide = currentSlide.id === 'welcome';
  const fullTargetText = isWelcomeSlide ? 'SELAMAT DATANG' : `EXPLORE ${SLIDES[activeIndex].text}`;
  const currentTypedString = fullTargetText.slice(0, typedCount);

  const word1 = currentTypedString.slice(0, 7);
  const hasSpace = currentTypedString.length > 7;
  const word2 = currentTypedString.length > 8 ? currentTypedString.slice(8) : '';

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

        @keyframes heroFrontSway {
          0% { transform: rotateY(-18deg) rotateZ(-1.5deg); }
          50% { transform: rotateY(18deg) rotateZ(1.5deg); }
          100% { transform: rotateY(-18deg) rotateZ(-1.5deg); }
        }

        .anim-front-hero-sway {
          animation: heroFrontSway 5.5s ease-in-out infinite;
          transform-origin: bottom center;
          transform-style: preserve-3d;
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
            opacity: isLight ? 0.12 + audioLevel * 0.35 : 0.08 + audioLevel * 0.42,
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

        {/* 3. Teks Raksasa "SUKACHUB" */}
        <div
          className="absolute inset-x-0 top-3 sm:top-4 flex items-center justify-center pointer-events-none select-none z-[2] font-['Anton',sans-serif] uppercase whitespace-nowrap"
          style={{
            fontSize: 'clamp(46px, 15vw, 100px)',
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-0.01em',
            transform: 'skewX(-10deg)',
            opacity: isLight ? 0.45 : 0.38,
            backgroundImage: isLight
              ? 'linear-gradient(180deg, #1E293B 0%, #475569 60%, #64748B 100%)'
              : 'linear-gradient(180deg, #0A0E17 0%, #1A2332 60%, #2D3A4E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: isLight
              ? `
                drop-shadow(0px 1px 2px rgba(255, 255, 255, 0.9))
                drop-shadow(0px -1px 1px rgba(0, 0, 0, 0.25))
              `
              : `
                drop-shadow(0px -1.5px 1px rgba(0, 0, 0, 0.95))
                drop-shadow(0px 1px 1px rgba(255, 255, 255, 0.12))
              `,
          }}
        >
          {'SUKACHUB'.split('').map((letter, idx) => (
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

        {/* 4. Carousel 3D Orbit */}
        <div
          className="absolute inset-0 z-[3]"
          style={{
            perspective: '1200px',
            transformStyle: 'preserve-3d',
          }}
        >
          {SLIDES.map((item, index) => {
            let offset = index - activeIndex;
            if (offset > 2) offset -= SLIDES.length;
            if (offset < -2) offset += SLIDES.length;

            let role = 'back';
            if (offset === 0) role = 'center';      // DEPAN
            else if (offset === 1) role = 'left';    // KIRI
            else if (offset === -1) role = 'right';  // KANAN

            let left = '50%';
            let top = '21%';
            let height = isMobile ? '78%' : '78%';
            let opacity = 1;
            let zIndex = 20;

            let transform = 'translateX(-50%) translateZ(0px)';

            if (role === 'center') {
              left = '50%';
              top = index === 0 ? (isMobile ? '18%' : '18%') : (isMobile ? '15%' : '15%');
              height = isMobile ? '78%' : '78%';
              opacity = 1;
              zIndex = 30;
              transform = `translateX(-50%) translateZ(120px) rotateY(0deg) scale(${isMobile ? 0.98 : 1.0})`;
            } else if (role === 'left') {
              left = isMobile ? '22%' : '24%';
              top = '26%';
              height = isMobile ? '48%' : '48%';
              opacity = 0.7;
              zIndex = 15;
              transform = 'translateX(-50%) translateZ(-80px) rotateY(38deg) scale(0.8)';
            } else if (role === 'right') {
              left = isMobile ? '78%' : '76%';
              top = '26%';
              height = isMobile ? '48%' : '48%';
              opacity = 0.7;
              zIndex = 15;
              transform = 'translateX(-50%) translateZ(-80px) rotateY(-38deg) scale(0.8)';
            } else {
              left = '50%';
              top = '30%';
              height = isMobile ? '48%' : '48%';
              opacity = 0;
              zIndex = 1;
              transform = 'translateX(-50%) translateZ(-300px) rotateY(0deg) scale(0.35)';
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
                  transformStyle: 'preserve-3d',
                  transition: `
                    transform ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    left ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    top ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    height ${TRANSITION_DURATION}ms ${CUBIC_BEZIER},
                    opacity ${TRANSITION_DURATION}ms ${CUBIC_BEZIER}
                  `,
                }}
              >
                {/* DUDUKAN ACTION FIGURE 3D BULAT DINAMIS */}
                {role === 'center' && (
                  <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[72%] max-w-[150px] h-3 pointer-events-none z-[15] transition-all duration-300 ease-out">
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[105%] h-2.5 rounded-[100%] blur-[3px] opacity-80"
                      style={{ backgroundColor: '#000000' }}
                    />
                    
                    <div
                      className="w-full h-full rounded-[100%] transition-all duration-100 transform-gpu relative"
                      style={{
                        background: `radial-gradient(ellipse at 50% 30%, color-mix(in srgb, ${activeTextColor} 65%, #ffffff 20%) 0%, color-mix(in srgb, ${activeTextColor} 30%, #0f172a) 60%, color-mix(in srgb, ${activeTextColor} 80%, #000000) 100%)`,
                        border: `1px solid color-mix(in srgb, ${activeTextColor} 90%, #ffffff)`,
                        boxShadow: `
                          0 3px 6px rgba(0, 0, 0, 0.75),
                          inset 0 1px 1.5px rgba(255, 255, 255, 0.6),
                          inset 0 -2px 4px color-mix(in srgb, ${activeTextColor} 90%, #000000)
                        `,
                      }}
                    >
                      <div
                        className="absolute inset-[1.5px] rounded-[100%] opacity-80 transition-all duration-300"
                        style={{
                          border: `0.8px solid color-mix(in srgb, ${activeTextColor} 95%, #ffffff)`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* DUDUKAN ACTION FIGURE 3D SISI KIRI & KANAN */}
                {(role === 'left' || role === 'right') && (
                  <div className="absolute bottom-[2px] left-1/2 -translate-x-1/2 w-[75%] max-w-[110px] h-2.5 pointer-events-none z-[15] opacity-80">
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[105%] h-2 rounded-[100%] blur-[2px] opacity-90"
                      style={{ backgroundColor: '#000000' }}
                    />
                    
                    <div
                      className="w-full h-full rounded-[100%] relative"
                      style={{
                        background: 'radial-gradient(ellipse at 50% 30%, #4b5563 0%, #1f2937 60%, #0f172a 100%)',
                        border: '1px solid #6b7280',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                      }}
                    >
                      <div
                        className="absolute inset-[1px] rounded-[100%] opacity-60"
                        style={{ border: '0.8px solid #9ca3af' }}
                      />
                    </div>
                  </div>
                )}

                {/* HERO PALING DEPAN */}
                {role === 'center' ? (
                  <div className="w-full h-full anim-front-hero-sway relative z-[20]">
                    {item.isVideo ? (
                      <video
                        src={item.src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain object-bottom pointer-events-none select-none"
                        style={{
                          filter: `
                            drop-shadow(0.8px -0.8px 0px ${activeTextColor})
                            drop-shadow(0.4px -0.4px 0.5px color-mix(in srgb, ${activeTextColor} 60%, transparent))
                          `,
                        }}
                      />
                    ) : (
                      <img
                        src={item.src}
                        alt={`Slide Character ${index}`}
                        draggable={false}
                        loading="eager"
                        // @ts-ignore
                        fetchpriority="high"
                        className="w-full h-full object-contain object-bottom pointer-events-none select-none"
                        style={{
                          filter: `
                            drop-shadow(0.8px -0.8px 0px ${activeTextColor})
                            drop-shadow(0.4px -0.4px 0.5px color-mix(in srgb, ${activeTextColor} 60%, transparent))
                          `,
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <FrozenWebP
                    src={item.src}
                    className="w-full h-full object-contain object-bottom pointer-events-none select-none relative z-[20]"
                    style={{
                      filter: 'grayscale(100%) opacity(0.75) drop-shadow(0 3px 5px rgba(0,0,0,0.4))',
                    }}
                  />
                )}

                {/* Refleksi Mirror Hero */}
                {(role === 'left' || role === 'right') && (
                  <div className="absolute top-[98%] left-0 right-0 h-[38%] overflow-hidden pointer-events-none opacity-20 select-none z-[18]">
                    <FrozenWebP
                      src={item.src}
                      className="w-full h-full object-contain object-top scale-y-[-1]"
                      style={{
                        filter: 'grayscale(100%) blur(1px)',
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

        {/* 5. Pill Kiri Bawah */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-4 z-[60]">
          <Link
            href={currentSlide.link}
            className="group flex items-center gap-1 transition-all duration-200 px-2.5 py-1 rounded-full backdrop-blur-md shadow-sm active:scale-95 border"
            style={{
              backgroundColor: "color-mix(in srgb, var(--card-bg) 75%, transparent)",
              borderColor: "color-mix(in srgb, var(--card-border) 80%, transparent)",
            }}
          >
            <div className="inline-flex items-center whitespace-nowrap text-xs sm:text-sm font-black tracking-wide uppercase italic">
              {word1 && (
                <span
                  className={`text-[10px] sm:text-[11px] font-extrabold pb-0.5 transition-colors duration-250 ${
                    isWelcomeSlide ? '' : 'border-b-2 opacity-90'
                  }`}
                  style={{
                    color: 'var(--foreground)',
                    borderColor: isWelcomeSlide ? 'transparent' : activeTextColor,
                  }}
                >
                  {word1}
                </span>
              )}

              {hasSpace && <span className="inline-block w-1">&nbsp;</span>}

              {word2 && (
                <span
                  className="text-xs sm:text-sm font-black transition-colors duration-250"
                  style={{
                    color: isWelcomeSlide ? '#EAB308' : activeTextColor,
                  }}
                >
                  {word2}
                </span>
              )}

              <span
                className="text-xs sm:text-sm font-black italic anim-typing-cursor ml-0.5"
                style={{ color: isWelcomeSlide ? '#EAB308' : activeTextColor }}
              >
                |
              </span>
            </div>

            {!isWelcomeSlide && (
              <ArrowRight
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 anim-bounce-right ml-0.5 transition-colors duration-250"
                style={{ color: activeTextColor }}
                strokeWidth={3}
              />
            )}
          </Link>
        </div>

        {/* 6. Tombol Navigasi Kanan Bawah */}
        <div className="absolute bottom-2.5 sm:bottom-3 right-2.5 sm:right-4 z-[60]">
          <div
            className="flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 rounded-full backdrop-blur-md border transition-all duration-300 shadow-sm"
            style={{
              backgroundColor: "color-mix(in srgb, var(--card-bg) 75%, transparent)",
              borderColor: "color-mix(in srgb, var(--card-border) 80%, transparent)",
            }}
          >
            <button
              onClick={() => navigate('prev')}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-150 ease-out hover:scale-110 active:scale-95 shadow-sm"
              style={{
                backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
              }}
              aria-label="Previous Slide"
            >
              <ArrowLeft size={isMobile ? 13 : 16} strokeWidth={2.5} style={{ color: activeTextColor }} />
            </button>

            <button
              onClick={toggleMute}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-transform duration-75 ease-out shadow-sm border"
              style={{
                backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
                borderColor: isMuted ? 'transparent' : activeTextColor,
                transform: !isMuted ? `scale(${1 + audioLevel * 0.25})` : 'scale(1)',
              }}
              aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? (
                <VolumeX size={isMobile ? 13 : 16} strokeWidth={2.5} style={{ color: 'var(--foreground)', opacity: 0.6 }} />
              ) : (
                <Volume2
                  size={isMobile ? 13 : 16}
                  strokeWidth={2.5}
                  style={{
                    color: activeTextColor,
                    transform: `scale(${1 + audioLevel * 0.2})`,
                    transition: 'transform 75ms ease-out',
                  }}
                />
              )}
            </button>

            <button
              onClick={() => navigate('next')}
              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-all duration-150 ease-out hover:scale-110 active:scale-95 shadow-sm"
              style={{
                backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
              }}
              aria-label="Next Slide"
            >
              <ArrowRight size={isMobile ? 13 : 16} strokeWidth={2.5} style={{ color: activeTextColor }} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}