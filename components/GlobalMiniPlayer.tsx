'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAudio } from '@/app/context/AudioContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalMiniPlayer() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentSong, isPlaying, togglePlayPause, playNext, playPrev, setShowLyricsModal, searchResults } = useAudio();
  
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Sembunyikan player jika fokus ke input/textarea
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

  // Reset status tersembunyi jika lagu berganti
  useEffect(() => {
    setIsDismissed(false);
  }, [currentSong?.id]);

  const isMp3Page = pathname === '/mp3';
  const isChatPage = pathname === '/' || pathname === '/chat';

  // Sembunyikan jika tidak ada lagu atau sedang mengetik
  if (isInputFocused || !currentSong) {
    return null;
  }

  // Handler saat player diklik ketika dalam keadaan tersembunyi (di luar /mp3)
  const handleMiniPlayerClick = () => {
    if (isDismissed && !isMp3Page) {
      setIsDismissed(false);
      router.push('/mp3');
    } else {
      setShowLyricsModal(true);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className={`fixed left-0 right-0 z-40 flex justify-center px-3 pointer-events-auto transition-all duration-200 ${
          isChatPage ? "top-[64px]" : "bottom-16"
        }`}
      >
        <motion.div
          drag={isMp3Page ? false : "x"} // Swipe kiri/kanan diaktifkan jika BUKAN di /mp3
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          onDragEnd={(_, info) => {
            if (!isMp3Page && Math.abs(info.offset.x) > 80) {
              setIsDismissed(true); // Sembunyikan saat di-swipe melebihi ambang batas
            }
          }}
          onClick={handleMiniPlayerClick}
          initial={{ opacity: 1, scale: 1 }}
          animate={{
            opacity: isDismissed && !isMp3Page ? 0.25 : 1,
            scale: isDismissed && !isMp3Page ? 0.85 : 1,
            x: 0
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`w-full max-w-md border rounded-2xl px-3.5 py-1.5 shadow-2xl flex items-center justify-between backdrop-blur-xl cursor-pointer select-none ${
            isDismissed && !isMp3Page ? "opacity-30 hover:opacity-80 transition-opacity" : ""
          }`}
          style={{
            backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.95))',
            borderColor: 'var(--card-border, rgba(255, 255, 255, 0.15))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.85)',
          }}
        >
          {/* Info Lagu */}
          <div className="flex items-center gap-3 overflow-hidden flex-1 pr-2">
            {currentSong.thumbnail ? (
              <img src={currentSong.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 pointer-events-none" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white/50">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--foreground-heading, #fff)' }}>
                {currentSong.title}
              </h4>
              <p className="text-[10px] opacity-60 truncate mt-0.5">{currentSong.artist}</p>
            </div>
          </div>

          {/* Kontrol Musik */}
          <div 
            className="flex items-center gap-1.5 shrink-0" 
            onClick={(e) => e.stopPropagation()} // Mencegah pemicu navigasi saat menekan tombol kontrol
          >
            <button type="button" onClick={playPrev} disabled={searchResults.length === 0} className="p-1 opacity-80 hover:opacity-100 transition cursor-pointer disabled:opacity-20">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
            </button>

            <button type="button" onClick={togglePlayPause} className="p-1 rounded-full transition cursor-pointer">
              {isPlaying ? (
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            <button type="button" onClick={playNext} disabled={searchResults.length === 0} className="p-1 opacity-80 hover:opacity-100 transition cursor-pointer disabled:opacity-20">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}