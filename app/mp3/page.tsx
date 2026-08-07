'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '@/app/context/AudioContext';
import { SongItem, SyncedLine, chunkArray } from './yt';

export default function Mp3Page() {
  const router = useRouter();
  const {
    isAuthenticated,
    checkingAuth,
    inputQuery,
    setInputQuery,
    searchResults,
    setSearchResults,
    quickPicks,
    isSearching,
    hasSearched,
    currentSong,
    isPlaying,
    playMode,
    progress,
    currentTime,
    duration,
    showLyricsModal,
    syncedLyrics,
    rawLyrics,
    isLoadingLyrics,
    activeLyricIndex,
    lyricsContainerRef,
    searchInputRef,
    setShowLyricsModal,
    playSong,
    togglePlayPause,
    playNext,
    playPrev,
    togglePlayMode,
    handleSeek,
    handleSearch,
    refreshQuickPicks,
    seekToTime,
  } = useAudio();

  const visibleSearchResults = isAuthenticated ? searchResults : searchResults.slice(0, 5);
  const visibleQuickPicks = isAuthenticated ? quickPicks : quickPicks.slice(0, 5);

  const chunkedSearchResults: SongItem[][] = chunkArray(visibleSearchResults, 5);
  const chunkedQuickPicks: SongItem[][] = chunkArray(visibleQuickPicks, 5);

  const handleOpenSearchFromModal = () => {
    if (!isAuthenticated) return router.push('/chat');
    setShowLyricsModal(false);
    setTimeout(() => searchInputRef.current?.focus(), 200);
  };

  const handleRefreshClick = () => {
    if (hasSearched && searchResults.length > 0) {
      const shuffled = [...searchResults].sort(() => Math.random() - 0.5);
      setSearchResults(shuffled);
    } else {
      refreshQuickPicks();
    }
  };

  return (
    <div
      className="min-h-screen pb-36 flex flex-col items-center transition-colors duration-300 font-sans select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--background, #030303)',
        color: 'var(--foreground, #f4f4f5)',
      }}
    >
      {/* AREA PENCARIAN - HANYA PILL INPUT MURNI */}
      <div className="w-full max-w-md px-4 pt-3 pb-1 flex items-center justify-center">
        <form onSubmit={(e) => handleSearch(e, () => router.push('/chat'))} className="w-full relative flex items-center">
          <input
            ref={searchInputRef}
            type="text"
            disabled={!isAuthenticated}
            placeholder={
              isAuthenticated
                ? 'Cari lagu, artis, atau album...'
                : '🔒 Daftar/Login untuk mencari lagu...'
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onClick={() => !isAuthenticated && router.push('/chat')}
            className={`w-full border rounded-full pl-10 pr-4 py-2 text-xs transition shadow-xs ${
              !isAuthenticated ? 'cursor-pointer opacity-70' : 'focus:outline-none'
            }`}
            style={{
              backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.08))',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.18))',
              color: 'var(--foreground, #fff)',
            }}
          />
          <svg
            className="w-4 h-4 absolute left-3.5 opacity-70 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--accent, #f43f5e)' }}
          >
            {isAuthenticated ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            )}
          </svg>
        </form>
      </div>

      {/* BANNER AJAKAN REGISTRASI */}
      {!checkingAuth && !isAuthenticated && (
        <div className="w-full max-w-md px-4 mt-3">
          <div
            onClick={() => router.push('/chat')}
            className="p-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 flex items-center justify-between cursor-pointer hover:bg-rose-500/20 transition"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-base">🔓</span>
              <div>
                <p className="text-xs font-bold text-rose-400">Akses Terbatas</p>
                <p className="text-[10px] opacity-70">Daftar sekarang untuk mencari & putar lagu tanpa batas.</p>
              </div>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500 text-white shrink-0">
              Daftar
            </span>
          </div>
        </div>
      )}

      <main className="w-full max-w-md px-4 flex flex-col gap-6 mt-4">
        {/* HASIL PENCARIAN / PILIHAN CEAPAT */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground-heading, #fff)' }}>
              {hasSearched ? 'Hasil Pencarian' : 'Pilihan Cepat'}
              {!isAuthenticated && <span className="text-xs font-normal opacity-50 ml-2">(Maks 5 Lagu)</span>}
            </h2>

            <button
              onClick={handleRefreshClick}
              title={hasSearched ? "Acak Hasil Pencarian" : "Refresh Pilihan Cepat"}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition font-medium opacity-80 cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
              style={{ backgroundColor: 'var(--card-bg, rgba(255,255,255,0.05))' }}
            >
              <svg className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {isSearching ? (
            <div className="h-48 flex items-center justify-center text-xs opacity-50 animate-pulse">Memuat lagu...</div>
          ) : chunkedSearchResults.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
              {chunkedSearchResults.map((column: SongItem[], colIdx: number) => (
                <div key={colIdx} className="w-[85%] shrink-0 snap-start flex flex-col gap-3">
                  {column.map((song: SongItem) => (
                    <div
                      key={song.id}
                      onClick={() => playSong(song)}
                      className="flex items-center justify-between p-1.5 rounded-xl transition cursor-pointer hover:bg-white/5 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {song.thumbnail ? (
                          <img src={song.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white/50">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-semibold truncate" style={{ color: currentSong?.id === song.id ? 'var(--accent, #f43f5e)' : 'var(--foreground-heading, #fff)' }}>
                            {song.title}
                          </h4>
                          <p className="text-[11px] opacity-60 truncate mt-0.5">{song.artist}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs opacity-50 border border-dashed border-white/10 rounded-2xl">Tidak ada lagu ditemukan</div>
          )}
        </section>

        {/* SECTION RIWAYAT */}
        {hasSearched && visibleQuickPicks.length > 0 && (
          <section className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground-heading, #fff)' }}>Pilihan Cepat</h2>
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
              {chunkedQuickPicks.map((column: SongItem[], colIdx: number) => (
                <div key={colIdx} className="w-[85%] shrink-0 snap-start flex flex-col gap-3">
                  {column.map((song: SongItem) => (
                    <div
                      key={`qp-${song.id}`}
                      onClick={() => playSong(song)}
                      className="flex items-center justify-between p-1.5 rounded-xl transition cursor-pointer hover:bg-white/5 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {song.thumbnail ? (
                          <img src={song.thumbnail} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white/50">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                            </svg>
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-semibold truncate" style={{ color: currentSong?.id === song.id ? 'var(--accent, #f43f5e)' : 'var(--foreground-heading, #fff)' }}>
                            {song.title}
                          </h4>
                          <p className="text-[11px] opacity-60 truncate mt-0.5">{song.artist}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* MODAL LIRIK */}
      <AnimatePresence>
        {showLyricsModal && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 bottom-16 left-0 right-0 z-[100] max-w-md mx-auto flex flex-col justify-between backdrop-blur-2xl p-4 sm:p-6 overflow-hidden border-x border-white/10 shadow-2xl"
            style={{ backgroundColor: 'var(--background, #09090b)', color: 'var(--foreground, #f4f4f5)' }}
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/10 shrink-0 gap-2">
              {currentSong?.thumbnail ? (
                <img src={currentSong.thumbnail} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 shadow-xs border border-white/10" />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white/50 border border-white/10">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
                </div>
              )}

              <div className="text-center overflow-hidden px-2 flex-1">
                <h3 className="text-xs font-bold truncate">{currentSong?.title || 'Lirik Lagu'}</h3>
                <p className="text-[10px] opacity-60 truncate mt-0.5">{currentSong?.artist}</p>
              </div>

              <button type="button" onClick={handleOpenSearchFromModal} className="p-2 -mr-2 rounded-full hover:bg-white/10 transition cursor-pointer text-xs flex items-center gap-1 opacity-80 hover:opacity-100 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>

            <div ref={lyricsContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth py-8 flex flex-col gap-5 no-scrollbar w-full text-center">
              {isLoadingLyrics ? (
                <div className="flex-1 flex items-center justify-center text-sm opacity-50 animate-pulse">Mencari lirik...</div>
              ) : syncedLyrics.length > 0 ? (
                syncedLyrics.map((line: SyncedLine, idx: number) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <p
                      key={idx}
                      onClick={() => seekToTime(line.time)}
                      className={`text-base sm:text-lg transition-all duration-300 cursor-pointer leading-relaxed break-words max-w-full px-2 ${
                        isActive ? 'opacity-100 font-black scale-105' : 'opacity-30 hover:opacity-70 font-bold'
                      }`}
                      style={{ color: isActive ? 'var(--accent, #f43f5e)' : 'var(--foreground)' }}
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm opacity-60 text-center whitespace-pre-line leading-relaxed px-4">
                  {rawLyrics || 'Lirik tidak tersedia'}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-3 border-t border-white/10 shrink-0 pb-2">
              <div className="flex flex-col gap-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
                  style={{ accentColor: 'var(--accent, #f43f5e)', backgroundColor: 'rgba(255,255,255,0.2)' }}
                />
                <div className="flex justify-between text-[10px] font-mono opacity-60">
                  <span>{currentTime}</span>
                  <span>{duration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-2 py-1">
                <button 
                  type="button" 
                  onClick={togglePlayMode} 
                  className="p-2 rounded-full hover:bg-white/10 transition cursor-pointer relative" 
                  style={{ color: playMode !== 'normal' ? 'var(--accent, #f43f5e)' : 'inherit', opacity: playMode !== 'normal' ? 1 : 0.5 }}
                >
                  {playMode === 'repeat-one' && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg>
                      <span className="text-[9px] font-bold absolute -top-1 -right-1 bg-white/20 px-1 rounded-full">1</span>
                    </div>
                  )}
                  {playMode === 'repeat-all' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg>
                  )}
                  {playMode === 'shuffle' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.45 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" /></svg>
                  )}
                  {playMode === 'normal' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg>
                  )}
                </button>

                <div className="flex items-center gap-6">
                  <button type="button" onClick={playPrev} className="p-2 opacity-80 hover:opacity-100 transition cursor-pointer">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                  </button>
                  <button type="button" onClick={togglePlayPause} className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold transition transform active:scale-95 cursor-pointer shadow-lg" style={{ backgroundColor: 'var(--accent, #f43f5e)' }}>
                    {isPlaying ? (
                      <svg className="w-6 h-6 fill-black" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
                    ) : (
                      <svg className="w-6 h-6 fill-black ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                  </button>
                  <button type="button" onClick={playNext} className="p-2 opacity-80 hover:opacity-100 transition cursor-pointer">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                  </button>
                </div>

                <button type="button" onClick={() => setShowLyricsModal(false)} className="p-2 rounded-full hover:bg-white/10 transition cursor-pointer opacity-80 hover:opacity-100">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINI PLAYER (Halaman MP3) */}
      <div className="fixed bottom-16 left-0 right-0 z-50 flex justify-center px-3 pointer-events-auto">
        <div
          className="w-full max-w-md border rounded-2xl px-3.5 py-2 shadow-2xl flex items-center justify-between backdrop-blur-xl transition-all duration-300"
          style={{
            backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.95))',
            borderColor: 'var(--card-border, rgba(255, 255, 255, 0.15))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.85)',
          }}
        >
          <div onClick={() => currentSong && setShowLyricsModal(true)} className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer pr-2">
            {currentSong?.thumbnail ? (
              <img src={currentSong.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white/50">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
              </div>
            )}
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--foreground-heading, #fff)' }}>
                {currentSong?.title || 'Tidak ada lagu'}
              </h4>
              <p className="text-[10px] opacity-60 truncate mt-0.5">{currentSong?.artist || 'Klik untuk melihat lirik'}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (currentSong) setShowLyricsModal(true);
              }}
              disabled={!currentSong}
              title="Buka Lirik"
              className="p-2 opacity-80 hover:opacity-100 active:scale-95 transition disabled:opacity-20 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
            </button>

            <button type="button" onClick={playPrev} disabled={visibleSearchResults.length === 0} className="p-1.5 opacity-80 hover:opacity-100 active:scale-95 transition disabled:opacity-20 cursor-pointer">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
            </button>

            <button type="button" onClick={togglePlayPause} disabled={!currentSong} className="p-1.5 rounded-full transition transform active:scale-90 disabled:opacity-30 cursor-pointer" style={{ color: 'var(--foreground-heading, #fff)' }}>
              {isPlaying ? (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
              ) : (
                <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              )}
            </button>

            <button type="button" onClick={playNext} disabled={visibleSearchResults.length === 0} className="p-1.5 opacity-80 hover:opacity-100 active:scale-95 transition disabled:opacity-20 cursor-pointer">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}