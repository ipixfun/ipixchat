'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAudio } from '@/app/context/AudioContext';

export default function GlobalMiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentSong, isPlaying, togglePlayPause, playNext, playPrev, searchResults } = useAudio();
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [currentHash, setCurrentHash] = useState('');

  // Deteksi Hash URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentHash(window.location.hash);
      const handleHashChange = () => setCurrentHash(window.location.hash);
      window.addEventListener('hashchange', handleHashChange);
      return () => window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  // Sembunyikan player saat keyboard aktif / input fokus
  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsInputFocused(true);
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setIsInputFocused(false);
      }
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  const isMp3Page = pathname === '/mp3' || currentHash === '#mp3';
  const isChatTab = pathname === '/chat' || currentHash === '#chat';
  const isTemaTab = pathname === '/tema' || currentHash === '#tema';
  const isIpixTab = 
    pathname === '/tentang' || 
    pathname === '/ipix' || 
    currentHash === '#ipix' || 
    currentHash === '#tentang';

  if (isMp3Page || isInputFocused || !currentSong) {
    return null;
  }

  const handlePlayerClick = () => {
    router.push('/mp3');
  };

  const getPositionClass = () => {
    if (isChatTab) {
      return "top-2 right-19 sm:right-20 w-[185px] sm:w-[220px]"; 
    }
    if (isTemaTab) {
      return "top-1 right-3 w-[190px] sm:w-[230px]"; 
    }
    if (isIpixTab) {
      return "top-3 left-3 w-[175px] sm:w-[210px]"; 
    }
    return "bottom-20 left-0 right-0 px-3 w-full max-w-md mx-auto"; 
  };

  const isCompactHeader = isChatTab || isTemaTab || isIpixTab;

  return (
    <div className={`fixed z-40 flex justify-center pointer-events-auto transition-all duration-200 ${getPositionClass()}`}>
      <div
        onClick={handlePlayerClick}
        className={`w-full shadow-md flex items-center justify-between backdrop-blur-md cursor-pointer select-none transition-all duration-200 ${
          isCompactHeader
            ? "rounded-2xl px-2.5 py-1.5 border border-[var(--card-border)]" 
            : "rounded-2xl px-3 py-2 border border-[var(--card-border)]"
        }`}
        style={{
          backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.95))',
          color: 'var(--foreground-heading, #ffffff)',
        }}
      >
        {/* Info Lagu (Tanpa Cover Gambar) */}
        <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0 pr-1">
          <div className="overflow-hidden min-w-0 flex-1">
            <h4 
              className={`${isCompactHeader ? "text-[10px]" : "text-xs"} font-bold truncate leading-tight`} 
              style={{ color: 'var(--foreground-heading, #fff)' }}
            >
              {currentSong.title}
            </h4>
            <p 
              className={`${isCompactHeader ? "text-[8.5px]" : "text-[10px]"} opacity-70 truncate mt-0.5`}
              style={{ color: 'var(--foreground, #aaa)' }}
            >
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Tombol Kontrol Audio */}
        <div
          className="flex items-center gap-1 shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={playPrev}
            disabled={searchResults.length === 0}
            className="p-1 opacity-80 hover:opacity-100 transition cursor-pointer disabled:opacity-20"
            style={{ color: 'var(--foreground-heading, #fff)' }}
          >
            <svg className={`${isCompactHeader ? "w-3 h-3" : "w-4 h-4"} fill-current`} viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            className="p-1 rounded-full transition cursor-pointer"
            style={{ color: 'var(--foreground-heading, #fff)' }}
          >
            {isPlaying ? (
              <svg className={`${isCompactHeader ? "w-3.5 h-3.5" : "w-5 h-5"} fill-current`} viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className={`${isCompactHeader ? "w-3.5 h-3.5" : "w-5 h-5"} fill-current ml-0.5`} viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={playNext}
            disabled={searchResults.length === 0}
            className="p-1 opacity-80 hover:opacity-100 transition cursor-pointer disabled:opacity-20"
            style={{ color: 'var(--foreground-heading, #fff)' }}
          >
            <svg className={`${isCompactHeader ? "w-3 h-3" : "w-4 h-4"} fill-current`} viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}