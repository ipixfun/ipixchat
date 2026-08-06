'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { SongItem, SyncedLine, searchSongs, fetchLyrics, chunkArray } from './yt';
import { supabase } from '@/app/lib/supabaseClient';

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

type PlayMode = 'normal' | 'repeat-one' | 'repeat-all' | 'shuffle';

export default function Mp3Page() {
  const { theme } = useTheme();
  const router = useRouter();

  // State Autentikasi / Registration
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const [inputQuery, setInputQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SongItem[]>([]);
  const [quickPicks, setQuickPicks] = useState<SongItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playMode, setPlayMode] = useState<PlayMode>('normal');

  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  // State Lirik
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [syncedLyrics, setSyncedLyrics] = useState<SyncedLine[]>([]);
  const [rawLyrics, setRawLyrics] = useState<string>('');
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);

  const playerRef = useRef<any>(null);
  const isSeeking = useRef(false);
  const intervalRef = useRef<any>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activePlaylistRef = useRef<SongItem[]>([]);

  // 0. Cek Status Login / Registrasi User
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session?.user);
      } catch (err) {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. YouTube IFrame API Loader
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Refresh Pilihan Cepat (Jika belum login, batasi hanya 5 lagu)
  const refreshQuickPicks = useCallback(async () => {
    setIsSearching(true);
    const keywords = [
      'Lagu Populer Indonesia',
      'Hits Indonesia 2026',
      'Lagu Viral Tiktok',
      'Pop Hits Indonesia',
      'Indie Indonesia Terbaru'
    ];
    const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
    const songs = await searchSongs(randomKeyword, isAuthenticated ? 20 : 5);
    setSearchResults(songs);
    setIsSearching(false);
  }, [isAuthenticated]);

  // Load Awal untuk Pilihan Cepat
  useEffect(() => {
    if (!checkingAuth) {
      refreshQuickPicks();
    }
  }, [checkingAuth, refreshQuickPicks]);

  // Update Active Playlist Ref
  useEffect(() => {
    activePlaylistRef.current = searchResults;
  }, [searchResults]);

  // 2. Fetch Lirik saat lagu aktif berganti
  useEffect(() => {
    if (!currentSong) return;

    const loadLyrics = async () => {
      setIsLoadingLyrics(true);
      setSyncedLyrics([]);
      setRawLyrics('');
      setActiveLyricIndex(-1);

      const res = await fetchLyrics(currentSong);
      if (res.syncedLyrics) {
        setSyncedLyrics(res.syncedLyrics);
      } else {
        setRawLyrics(res.rawLyrics || 'Lirik tidak tersedia');
      }
      setIsLoadingLyrics(false);
    };

    loadLyrics();
  }, [currentSong]);

  // 3. Highlight Lirik Otomatis
  useEffect(() => {
    if (syncedLyrics.length === 0) return;

    let index = -1;
    for (let i = 0; i < syncedLyrics.length; i++) {
      if (currentTimeSec >= syncedLyrics[i].time) {
        index = i;
      } else {
        break;
      }
    }

    if (index !== activeLyricIndex) {
      setActiveLyricIndex(index);
      if (lyricsContainerRef.current && index !== -1) {
        const activeElem = lyricsContainerRef.current.children[index] as HTMLElement;
        if (activeElem) {
          activeElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTimeSec, syncedLyrics, activeLyricIndex]);

  // 4. Progress Tracker
  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && !isSeeking.current) {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        setCurrentTimeSec(cur);
        if (dur > 0) {
          setProgress((cur / dur) * 100);
          setDuration(formatTime(dur));
        }
        setCurrentTime(formatTime(cur));
      }
    }, 300);
  }, []);

  const stopProgressTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleSongEnded = useCallback(() => {
    if (!currentSong) return;
    const playlist = activePlaylistRef.current;

    if (playMode === 'repeat-one') {
      if (playerRef.current) {
        playerRef.current.seekTo(0, true);
        playerRef.current.playVideo();
      }
      return;
    }

    if (playMode === 'shuffle') {
      if (playlist.length > 0) {
        const randomIndex = Math.floor(Math.random() * playlist.length);
        playSong(playlist[randomIndex]);
      }
      return;
    }

    const currentIndex = playlist.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      playSong(playlist[currentIndex + 1]);
    } else if (playMode === 'repeat-all' && playlist.length > 0) {
      playSong(playlist[0]);
    }
  }, [currentSong, playMode]);

  // 5. Eksekusi Putar Lagu
  const playSong = useCallback(
    (song: SongItem) => {
      setCurrentSong(song);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime('0:00');
      setCurrentTimeSec(0);

      setQuickPicks((prev: SongItem[]) => {
        if (prev.some((item: SongItem) => item.id === song.id)) return prev;
        const updated = [song, ...prev];
        return isAuthenticated ? updated : updated.slice(0, 5);
      });

      if (!window.YT || !window.YT.Player) return;

      if (playerRef.current) {
        playerRef.current.loadVideoById(song.id);
      } else {
        playerRef.current = new window.YT.Player('yt-hidden-player', {
          height: '1',
          width: '1',
          videoId: song.id,
          playerVars: { autoplay: 1, controls: 0, disablekb: 1, fs: 0, rel: 0 },
          events: {
            onReady: (event: any) => event.target.playVideo(),
            onStateChange: (event: any) => {
              if (event.data === 1) {
                setIsPlaying(true);
                startProgressTimer();
              } else if (event.data === 2) {
                setIsPlaying(false);
                stopProgressTimer();
              } else if (event.data === 0) {
                setIsPlaying(false);
                stopProgressTimer();
                setProgress(0);
                handleSongEnded();
              }
            },
          },
        });
      }
    },
    [startProgressTimer, handleSongEnded, isAuthenticated]
  );

  // 6. Handler Pencarian Baru (Mengarahkan ke /chat Jika Belum Login)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push('/chat');
      return;
    }

    if (!inputQuery.trim()) return;

    let queryOrId = inputQuery.trim();

    const ytMatch = queryOrId.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      queryOrId = ytMatch[1];
      playSong({ id: queryOrId, title: 'Memuat Video...', artist: 'YouTube', duration: '0:00' });
      return;
    }

    setIsSearching(true);
    const newSongs = await searchSongs(queryOrId, 20);

    if (searchResults.length > 0) {
      setQuickPicks((prev: SongItem[]) => {
        const combined = [...searchResults, ...prev];
        const unique = combined.filter(
          (v: SongItem, i: number, a: SongItem[]) => a.findIndex((t: SongItem) => t.id === v.id) === i
        );
        return unique;
      });
    }

    setSearchResults(newSongs);
    setHasSearched(true);
    setIsSearching(false);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const playNext = useCallback(() => {
    if (!currentSong || searchResults.length === 0) return;
    if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * searchResults.length);
      playSong(searchResults[randomIndex]);
      return;
    }
    const currentIndex = searchResults.findIndex((s: SongItem) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % searchResults.length;
    playSong(searchResults[nextIndex]);
  }, [currentSong, searchResults, playMode, playSong]);

  const playPrev = useCallback(() => {
    if (!currentSong || searchResults.length === 0) return;
    if (playMode === 'shuffle') {
      const randomIndex = Math.floor(Math.random() * searchResults.length);
      playSong(searchResults[randomIndex]);
      return;
    }
    const currentIndex = searchResults.findIndex((s: SongItem) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
    playSong(searchResults[prevIndex]);
  }, [currentSong, searchResults, playMode, playSong]);

  const togglePlayMode = () => {
    if (playMode === 'normal') setPlayMode('repeat-one');
    else if (playMode === 'repeat-one') setPlayMode('repeat-all');
    else if (playMode === 'repeat-all') setPlayMode('shuffle');
    else setPlayMode('normal');
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value);
    setProgress(newProgress);
    if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
      const dur = playerRef.current.getDuration();
      if (dur > 0) {
        const seekTime = (newProgress / 100) * dur;
        playerRef.current.seekTo(seekTime, true);
        setCurrentTimeSec(seekTime);
      }
    }
  };

  const handleOpenSearchFromModal = () => {
    if (!isAuthenticated) {
      router.push('/chat');
      return;
    }
    setShowLyricsModal(false);
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 200);
  };

  // 7. INTEGRASI NOTIFIKASI MEDIA SYSTEM (DENGAN /icon.png)
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSong) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentSong.title,
      artist: currentSong.artist,
      album: 'iPix Chat MP3',
      artwork: [
        { src: '/icon.png', sizes: '96x96', type: 'image/png' },
        { src: '/icon.png', sizes: '128x128', type: 'image/png' },
        { src: '/icon.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon.png', sizes: '512x512', type: 'image/png' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      if (playerRef.current) playerRef.current.playVideo();
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      if (playerRef.current) playerRef.current.pauseVideo();
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      playPrev();
    });

    navigator.mediaSession.setActionHandler('nexttrack', () => {
      playNext();
    });

    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined && playerRef.current) {
        playerRef.current.seekTo(details.seekTime, true);
        setCurrentTimeSec(details.seekTime);
      }
    });
  }, [currentSong, playNext, playPrev]);

  // Sync Playback State ke Notifikasi HP
  useEffect(() => {
    if (!('mediaSession' in navigator)) return;
    navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
  }, [isPlaying]);

  // Batasi daftar lagu menjadi maksimal 5 jika belum terautentikasi
  const visibleSearchResults = isAuthenticated ? searchResults : searchResults.slice(0, 5);
  const visibleQuickPicks = isAuthenticated ? quickPicks : quickPicks.slice(0, 5);

  const chunkedSearchResults: SongItem[][] = chunkArray(visibleSearchResults, 5);
  const chunkedQuickPicks: SongItem[][] = chunkArray(visibleQuickPicks, 5);

  return (
    <div
      className="min-h-screen pb-36 flex flex-col items-center transition-colors duration-300 font-sans select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--background, #030303)',
        color: 'var(--foreground, #f4f4f5)',
      }}
    >
      <div className="absolute opacity-0 pointer-events-none -z-50 w-1 h-1 overflow-hidden">
        <div id="yt-hidden-player"></div>
      </div>

      {/* HEADER: KOLOM PENCARIAN TERKUNCI JIKA BELUM REGISTER */}
      <header className="w-full max-w-md sticky top-0 z-30 px-4 py-3 backdrop-blur-md bg-black/60 border-b border-white/5 flex items-center gap-3">
        <Link href="/" className="opacity-80 hover:opacity-100 transition shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputQuery(e.target.value)}
            onClick={() => {
              if (!isAuthenticated) router.push('/chat');
            }}
            className={`w-full border rounded-full pl-10 pr-4 py-2 text-xs transition shadow-sm ${
              !isAuthenticated ? 'cursor-pointer opacity-70 bg-white/5' : 'focus:outline-none'
            }`}
            style={{
              backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.08))',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.18))',
              color: 'var(--foreground, #fff)',
            }}
          />
          <svg
            className="w-4 h-4 absolute left-3.5 opacity-60 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            style={{ color: 'var(--accent, #f43f5e)' }}
          >
            {isAuthenticated ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            )}
          </svg>
        </form>
      </header>

      {/* BANNER AJAKAN REGISTRASI - DIARAHKAN KE /chat */}
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
        {/* UTAMA: PILIHAN CEAPAT / HASIL PENCARIAN */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground-heading, #fff)' }}>
              {hasSearched ? 'Hasil Pencarian' : 'Pilihan Cepat'}
              {!isAuthenticated && <span className="text-xs font-normal opacity-50 ml-2">(Maks 5 Lagu)</span>}
            </h2>

            {/* PILL REFRESH DENGAN SVG */}
            <button
              onClick={refreshQuickPicks}
              title="Refresh Pilihan Cepat"
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition font-medium opacity-80 cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              style={{ backgroundColor: 'var(--card-bg, rgba(255,255,255,0.05))' }}
            >
              <svg
                className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {isSearching ? (
            <div className="h-48 flex items-center justify-center text-xs opacity-50 animate-pulse">
              Memuat lagu...
            </div>
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
                          <h4
                            className="text-xs font-semibold truncate"
                            style={{
                              color:
                                currentSong?.id === song.id
                                  ? 'var(--accent, #f43f5e)'
                                  : 'var(--foreground-heading, #fff)',
                            }}
                          >
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
            <div className="p-8 text-center text-xs opacity-50 border border-dashed border-white/10 rounded-2xl">
              Tidak ada lagu ditemukan
            </div>
          )}
        </section>

        {/* SECTION RIWAYAT / PILIHAN CEAPAT LAMA */}
        {hasSearched && visibleQuickPicks.length > 0 && (
          <section className="flex flex-col gap-3 border-t border-white/10 pt-4">
            <div className="flex justify-between items-center px-1">
              <h2
                className="text-lg font-extrabold tracking-tight"
                style={{ color: 'var(--foreground-heading, #fff)' }}
              >
                Pilihan Cepat
              </h2>
            </div>

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
                          <h4
                            className="text-xs font-semibold truncate"
                            style={{
                              color:
                                currentSong?.id === song.id
                                  ? 'var(--accent, #f43f5e)'
                                  : 'var(--foreground-heading, #fff)',
                            }}
                          >
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
            style={{
              backgroundColor: 'var(--background, #09090b)',
              color: 'var(--foreground, #f4f4f5)',
            }}
          >
            {/* HEADER MODAL LIRIK */}
            <div className="flex justify-between items-center pb-3 border-b border-white/10 shrink-0 gap-2">
              {/* KIRI ATAS: FOTO COVER ALBUM/LAGU */}
              {currentSong?.thumbnail ? (
                <img
                  src={currentSong.thumbnail}
                  alt=""
                  className="w-9 h-9 rounded-lg object-cover shrink-0 shadow-sm border border-white/10"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-white/50 border border-white/10">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )}

              {/* TENGAH: JUDUL & ARTIS */}
              <div className="text-center overflow-hidden px-2 flex-1">
                <h3 className="text-xs font-bold truncate">{currentSong?.title || 'Lirik Lagu'}</h3>
                <p className="text-[10px] opacity-60 truncate mt-0.5">{currentSong?.artist}</p>
              </div>

              {/* KANAN ATAS: TOMBOL CARI LAGU LAIN */}
              <button
                type="button"
                onClick={handleOpenSearchFromModal}
                title="Cari Lagu Lain"
                className="p-2 -mr-2 rounded-full hover:bg-white/10 transition cursor-pointer text-xs flex items-center gap-1 opacity-80 hover:opacity-100 shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>

            {/* CONTAINER TEKS LIRIK */}
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth py-8 flex flex-col gap-5 no-scrollbar w-full text-center"
            >
              {isLoadingLyrics ? (
                <div className="flex-1 flex items-center justify-center text-sm opacity-50 animate-pulse">
                  Mencari lirik...
                </div>
              ) : syncedLyrics.length > 0 ? (
                syncedLyrics.map((line: SyncedLine, idx: number) => {
                  const isActive = idx === activeLyricIndex;
                  return (
                    <p
                      key={idx}
                      onClick={() => {
                        if (playerRef.current) {
                          playerRef.current.seekTo(line.time, true);
                          setCurrentTimeSec(line.time);
                        }
                      }}
                      className={`text-base sm:text-lg transition-all duration-300 cursor-pointer leading-relaxed break-words max-w-full px-2 ${
                        isActive ? 'opacity-100 font-black scale-105' : 'opacity-30 hover:opacity-70 font-bold'
                      }`}
                      style={{
                        color: isActive ? 'var(--accent, #f43f5e)' : 'var(--foreground)',
                      }}
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

            {/* CONTROLS DI DALAM MODAL LIRIK */}
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
                  style={{
                    accentColor: 'var(--accent, #f43f5e)',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                  }}
                />
                <div className="flex justify-between text-[10px] font-mono opacity-60">
                  <span>{currentTime}</span>
                  <span>{duration}</span>
                </div>
              </div>

              {/* FOOTER CONTROLS */}
              <div className="flex items-center justify-between px-2 py-1">
                <button
                  type="button"
                  onClick={togglePlayMode}
                  title={`Mode: ${playMode}`}
                  className="p-2 rounded-full hover:bg-white/10 transition cursor-pointer relative"
                  style={{
                    color: playMode !== 'normal' ? 'var(--accent, #f43f5e)' : 'inherit',
                    opacity: playMode !== 'normal' ? 1 : 0.5,
                  }}
                >
                  {playMode === 'repeat-one' && (
                    <div className="flex items-center">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                      </svg>
                      <span className="text-[9px] font-bold absolute -top-1 -right-1 bg-white/20 px-1 rounded-full">
                        1
                      </span>
                    </div>
                  )}
                  {playMode === 'repeat-all' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                    </svg>
                  )}
                  {playMode === 'shuffle' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.45 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                    </svg>
                  )}
                  {playMode === 'normal' && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
                    </svg>
                  )}
                </button>

                <div className="flex items-center gap-6">
                  <button type="button" onClick={playPrev} className="p-2 opacity-80 hover:opacity-100 transition cursor-pointer">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={togglePlayPause}
                    className="w-12 h-12 rounded-full flex items-center justify-center text-black font-bold transition transform active:scale-95 cursor-pointer shadow-lg"
                    style={{ backgroundColor: 'var(--accent, #f43f5e)' }}
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6 fill-black" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6 fill-black ml-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <button type="button" onClick={playNext} className="p-2 opacity-80 hover:opacity-100 transition cursor-pointer">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                    </svg>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLyricsModal(false)}
                  title="Minimize Lirik"
                  className="p-2 rounded-full hover:bg-white/10 transition cursor-pointer opacity-80 hover:opacity-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINI PLAYER */}
      <div className="fixed bottom-16 left-0 right-0 z-50 flex justify-center px-3 pointer-events-auto">
        <div
          className="w-full max-w-md border rounded-2xl px-3.5 py-2 shadow-2xl flex items-center justify-between backdrop-blur-xl transition-all duration-300"
          style={{
            backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.95))',
            borderColor: 'var(--card-border, rgba(255, 255, 255, 0.15))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.85)',
          }}
        >
          <div
            onClick={() => currentSong && setShowLyricsModal(true)}
            className="flex items-center gap-3 overflow-hidden flex-1 cursor-pointer pr-2"
          >
            {currentSong?.thumbnail ? (
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
                {currentSong?.title || 'Tidak ada lagu'}
              </h4>
              <p className="text-[10px] opacity-60 truncate mt-0.5">
                {currentSong?.artist || 'Klik untuk melihat lirik'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (currentSong) setShowLyricsModal(true);
              }}
              disabled={!currentSong}
              title="Buka Lirik"
              className="p-2 opacity-80 hover:opacity-100 active:scale-95 transition disabled:opacity-20 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={playPrev}
              disabled={visibleSearchResults.length === 0}
              className="p-1.5 opacity-80 hover:opacity-100 active:scale-95 transition disabled:opacity-20 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              disabled={!currentSong}
              className="p-1.5 rounded-full transition transform active:scale-90 disabled:opacity-30 cursor-pointer"
              style={{
                color: 'var(--foreground-heading, #fff)',
              }}
            >
              {isPlaying ? (
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              onClick={playNext}
              disabled={visibleSearchResults.length === 0}
              className="p-1.5 opacity-80 hover:opacity-100 active:scale-95 transition disabled:opacity-20 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}