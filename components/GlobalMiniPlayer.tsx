'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAudio } from '@/app/context/AudioContext';

export default function GlobalMiniPlayer() {
  const pathname = usePathname();
  const { currentSong, isPlaying, togglePlayPause, playNext, playPrev, setShowLyricsModal, searchResults } = useAudio();
  const [isChatActive, setIsChatActive] = useState(false);

  useEffect(() => {
    // Fungsi cek langsung ke DOM: Apakah ada input chat di layar?
    const checkChatAndFocus = () => {
      const chatInputEl = document.getElementById('chat-input');
      const isFocused = document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA';
      
      // Jika halaman adalah /chat ATAU / ATAU ditemukannya #chat-input di layar, aktifkan status chat
      const isInChat = pathname === '/chat' || pathname === '/' || !!chatInputEl || isFocused;
      setIsChatActive(isInChat);
    };

    // Jalankan cek saat komponen mount & setiap kali ada perubahan fokus/interaksi
    checkChatAndFocus();
    
    const observer = new MutationObserver(checkChatAndFocus);
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('focusin', checkChatAndFocus);
    window.addEventListener('focusout', checkChatAndFocus);

    return () => {
      observer.disconnect();
      window.removeEventListener('focusin', checkChatAndFocus);
      window.removeEventListener('focusout', checkChatAndFocus);
    };
  }, [pathname]);

  // JIKA DI CHAT, DI HALAMAN MP3, ATAU TIDAK ADA LAGU -> MATIKAN TOTAL MINI PLAYER (RETURN NULL)
  if (pathname === '/mp3' || isChatActive || !currentSong) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 flex justify-center px-3 pointer-events-auto transition-all duration-300">
      <div
        className="w-full max-w-md border rounded-2xl px-3.5 py-2 shadow-2xl flex items-center justify-between backdrop-blur-xl transition-all duration-300"
        style={{
          backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.95))',
          borderColor: 'var(--card-border, rgba(255, 255, 255, 0.15))',
          boxShadow: '0 10px 30px rgba(0,0,0,0.85)',
        }}
      >
        <div onClick={() => setShowLyricsModal(true)} className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer pr-2">
          {currentSong.thumbnail ? (
            <img src={currentSong.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white/50">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
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

        <div className="flex items-center gap-1.5 shrink-0">
          <button type="button" onClick={playPrev} disabled={searchResults.length === 0} className="p-1.5 opacity-80 hover:opacity-100 transition cursor-pointer disabled:opacity-20">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
          </button>

          <button type="button" onClick={togglePlayPause} className="p-1.5 rounded-full transition cursor-pointer">
            {isPlaying ? (
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
            ) : (
              <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>

          <button type="button" onClick={playNext} disabled={searchResults.length === 0} className="p-1.5 opacity-80 hover:opacity-100 transition cursor-pointer disabled:opacity-20">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}