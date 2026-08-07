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

  // Deteksi Hash URL (#chat, #home, #tema, dll)
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

  // Sembunyikan jika berada di halaman MP3, sedang mengetik, atau lagu kosong
  if (isMp3Page || isInputFocused || !currentSong) {
    return null;
  }

  // Klik player -> Navigasi langsung ke /mp3
  const handlePlayerClick = () => {
    router.push('/mp3');
  };

  // Posisi presisi per rute
  const getPositionClass = () => {
    if (isChatTab) {
      // Pas di sebelah kiri tombol Keluar di Chat Header
      return "top-1.5 right-24 max-w-[160px] sm:max-w-[200px]"; 
    }
    if (isTemaTab) {
      // Ditinggikan ke top-1 agar sejajar dengan judul "Pengaturan Tema" di kanan
      return "top-1 right-3 max-w-[170px] sm:max-w-[210px]"; 
    }
    return "bottom-16 left-0 right-0 px-3 w-full max-w-md mx-auto"; // Di bawah untuk Home
  };

  const isHeaderMode = isChatTab || isTemaTab;

  return (
    <div className={`fixed z-40 flex justify-center pointer-events-auto transition-all duration-200 ${getPositionClass()}`}>
      <div
        onClick={handlePlayerClick}
        className={`w-full border shadow-lg flex items-center justify-between backdrop-blur-md cursor-pointer select-none transition-all duration-200 ${
          isHeaderMode
            ? "rounded-xl px-2 py-0.5"
            : "rounded-2xl px-3.5 py-2"
        }`}
        style={{
          // Mengikuti warna TEMA aplikasi secara otomatis
          backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.9))',
          borderColor: 'var(--card-border, rgba(255, 255, 255, 0.2))',
          color: 'var(--foreground-heading, #ffffff)',
        }}
      >
        {/* Info Lagu */}
        <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-0 pr-1">
          {/* Cover Gambar HANYA TAMPIL di Home, SEMBUNYI di Chat & Tema */}
          {!isHeaderMode && (
            currentSong.thumbnail ? (
              <img
                src={currentSong.thumbnail}
                alt=""
                className="w-9 h-9 rounded-lg object-cover shrink-0 pointer-events-none"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white/50">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              </div>
            )
          )}

          <div className="overflow-hidden min-w-0 flex-1">
            <h4 
              className={`${isHeaderMode ? "text-[9px]" : "text-xs"} font-bold truncate leading-tight`} 
              style={{ color: 'var(--foreground-heading, #fff)' }}
            >
              {currentSong.title}
            </h4>
            <p 
              className={`${isHeaderMode ? "text-[7.5px]" : "text-[10px]"} opacity-70 truncate mt-0.5`}
              style={{ color: 'var(--foreground, #aaa)' }}
            >
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Kontrol Musik */}
        <div
          className="flex items-center gap-0.5 shrink-0"
          onClick={(e) => e.stopPropagation()} // Supaya tombol play/next tidak mentrigger pindah rute
        >
          <button
            type="button"
            onClick={playPrev}
            disabled={searchResults.length === 0}
            className="p-1 opacity-80 hover:opacity-100 transition cursor-pointer disabled:opacity-20"
            style={{ color: 'var(--foreground-heading, #fff)' }}
          >
            <svg className={`${isHeaderMode ? "w-2.5 h-2.5" : "w-4 h-4"} fill-current`} viewBox="0 0 24 24">
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
              <svg className={`${isHeaderMode ? "w-3 h-3" : "w-5 h-5"} fill-current`} viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className={`${isHeaderMode ? "w-3 h-3" : "w-5 h-5"} fill-current ml-0.5`} viewBox="0 0 24 24">
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
            <svg className={`${isHeaderMode ? "w-2.5 h-2.5" : "w-4 h-4"} fill-current`} viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}