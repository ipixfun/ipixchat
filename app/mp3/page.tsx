'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

interface SongItem {
  id: string;
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
}

interface LyricLine {
  time: number;
  text: string;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

export default function Mp3Page() {
  const { theme, mounted } = useTheme();

  const [inputQuery, setInputQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SongItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const [progress, setProgress] = useState(0);
  const [currentTimeSec, setCurrentTimeSec] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  // Lirik State
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  const [rawLyrics, setRawLyrics] = useState<string>('');
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [activeLyricIndex, setActiveLyricIndex] = useState<number>(-1);

  const playerRef = useRef<any>(null);
  const isSeeking = useRef(false);
  const intervalRef = useRef<any>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const parseLrc = (lrcText: string): LyricLine[] => {
    const lines = lrcText.split('\n');
    const result: LyricLine[] = [];
    const timeReg = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/;

    for (const line of lines) {
      const match = timeReg.exec(line);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3], 10) / (match[3].length === 2 ? 100 : 1000) : 0;
        const timeInSeconds = min * 60 + sec + ms;
        const text = line.replace(timeReg, '').trim();
        if (text) {
          result.push({ time: timeInSeconds, text });
        }
      }
    }
    return result.sort((a, b) => a.time - b.time);
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

  // Function Fetch Lagu
  const fetchSongs = useCallback(async (query: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/yt?q=${encodeURIComponent(query)}&limit=20`);
      const data = await res.json();
      if (data.songs) {
        setSearchResults(data.songs);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // 2. Load Rekomendasi Lagu Saat Pertama Membuka Page
  useEffect(() => {
    fetchSongs('Lagu Populer Indonesia');
  }, [fetchSongs]);

  // 3. Fetch Lirik
  useEffect(() => {
    if (!currentSong) return;

    const fetchLyrics = async () => {
      setIsLoadingLyrics(true);
      setLyrics([]);
      setRawLyrics('');
      setActiveLyricIndex(-1);

      try {
        const res = await fetch(
          `/api/lyrics?title=${encodeURIComponent(currentSong.title)}&artist=${encodeURIComponent(currentSong.artist)}`
        );
        const data = await res.json();

        if (data.lrc) {
          const parsed = parseLrc(data.lrc);
          setLyrics(parsed);
        } else if (data.lyrics) {
          setRawLyrics(data.lyrics);
        } else {
          setRawLyrics('Lirik tidak tersedia untuk lagu ini.');
        }
      } catch (err) {
        console.error('Failed to fetch lyrics:', err);
        setRawLyrics('Gagal memuat lirik.');
      } finally {
        setIsLoadingLyrics(false);
      }
    };

    fetchLyrics();
  }, [currentSong]);

  // 4. Auto Scroll & Highlight Lirik
  useEffect(() => {
    if (lyrics.length === 0) return;

    let index = -1;
    for (let i = 0; i < lyrics.length; i++) {
      if (currentTimeSec >= lyrics[i].time) {
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
  }, [currentTimeSec, lyrics, activeLyricIndex]);

  // 5. Progress Tracker
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

  // 6. Play Song Callback
  const playSong = useCallback(
    (song: SongItem) => {
      setCurrentSong(song);
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime('0:00');
      setCurrentTimeSec(0);

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
              }
            },
          },
        });
      }
    },
    [startProgressTimer]
  );

  // 7. Pencarian Manual
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
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

    fetchSongs(queryOrId);
  };

  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const playNext = useCallback(() => {
    if (!currentSong || searchResults.length === 0) return;
    const currentIndex = searchResults.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % searchResults.length;
    playSong(searchResults[nextIndex]);
  }, [currentSong, searchResults, playSong]);

  const playPrev = useCallback(() => {
    if (!currentSong || searchResults.length === 0) return;
    const currentIndex = searchResults.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
    playSong(searchResults[prevIndex]);
  }, [currentSong, searchResults, playSong]);

  // Chunking per 4 item
  const chunkedResults = [];
  for (let i = 0; i < searchResults.length; i += 4) {
    chunkedResults.push(searchResults.slice(i, i + 4));
  }

  return (
    <div
      className="min-h-screen pb-48 flex flex-col items-center transition-colors duration-300 font-sans select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--background, #030303)',
        color: 'var(--foreground, #f4f4f5)',
      }}
    >
      {/* Hidden YouTube Player */}
      <div className="absolute opacity-0 pointer-events-none -z-50 w-1 h-1 overflow-hidden">
        <div id="yt-hidden-player"></div>
      </div>

      {/* HEADER: KOLOM PENCARIAN */}
      <header className="w-full max-w-md sticky top-0 z-30 px-4 py-3 backdrop-blur-md bg-black/60 border-b border-white/5 flex items-center gap-3">
        <Link href="/" className="opacity-80 hover:opacity-100 transition shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <form onSubmit={handleSearch} className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Cari lagu, artis, atau album..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full border rounded-full pl-10 pr-4 py-2 text-xs focus:outline-none transition"
            style={{
              backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.08))',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.1))',
              color: 'var(--foreground-heading, #fff)',
            }}
          />
          <svg
            className="w-4 h-4 absolute left-3.5 opacity-50 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </form>
      </header>

      <main className="w-full max-w-md px-4 flex flex-col gap-6 mt-4">
        {/* SECTION 1: PILIHAN CEPAT */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground-heading, #fff)' }}>
              Pilihan cepat
            </h2>
            <button
              onClick={() => searchResults.length > 0 && playSong(searchResults[0])}
              className="text-xs px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition font-medium opacity-80"
            >
              Putar semua
            </button>
          </div>

          {isSearching ? (
            <div className="h-48 flex items-center justify-center text-xs opacity-50 animate-pulse">
              Memuat rekomendasi lagu...
            </div>
          ) : chunkedResults.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
              {chunkedResults.map((column, colIdx) => (
                <div
                  key={colIdx}
                  className="w-[85%] shrink-0 snap-start flex flex-col gap-3"
                >
                  {column.map((song) => (
                    <div
                      key={song.id}
                      onClick={() => playSong(song)}
                      className="flex items-center justify-between p-1.5 rounded-xl transition cursor-pointer hover:bg-white/5 active:scale-[0.99]"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {song.thumbnail ? (
                          <img
                            src={song.thumbnail}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
                            🎵
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h4
                            className="text-xs font-semibold truncate"
                            style={{
                              color: currentSong?.id === song.id ? 'var(--accent, #f43f5e)' : 'var(--foreground-heading, #fff)',
                            }}
                          >
                            {song.title}
                          </h4>
                          <p className="text-[11px] opacity-60 truncate mt-0.5">
                            {song.artist}
                          </p>
                        </div>
                      </div>

                      <button className="p-2 opacity-50 hover:opacity-100 shrink-0">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs opacity-50 border border-dashed border-white/10 rounded-2xl">
              Gagal memuat rekomendasi
            </div>
          )}
        </section>

        {/* SECTION 2: KOLOM LIRIK */}
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-lg font-extrabold tracking-tight" style={{ color: 'var(--foreground-heading, #fff)' }}>
              Lirik
            </h2>
          </div>

          <div
            className="w-full rounded-2xl p-5 border shadow-xl flex flex-col h-72 relative overflow-hidden backdrop-blur-md"
            style={{
              backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.8))',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.1))',
            }}
          >
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth py-10 flex flex-col gap-5 no-scrollbar w-full"
            >
              {isLoadingLyrics ? (
                <div className="flex-1 flex items-center justify-center text-xs opacity-50 animate-pulse">
                  Memuat lirik...
                </div>
              ) : lyrics.length > 0 ? (
                lyrics.map((line, idx) => {
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
                      className={`text-base transition-all duration-300 cursor-pointer leading-snug break-words max-w-full ${
                        isActive ? 'opacity-100 font-extrabold' : 'opacity-30 hover:opacity-70 font-semibold'
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
                <div className="flex-1 flex items-center justify-center text-xs opacity-50 text-center whitespace-pre-line leading-relaxed">
                  {rawLyrics || 'Putar lagu untuk melihat lirik'}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* FLOATING & DRAGGABLE MINI PLAYER */}
      <motion.div
        drag
        dragMomentum={false}
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 cursor-grab active:cursor-grabbing touch-none"
      >
        <div
          className="w-full border rounded-2xl px-3.5 py-2.5 shadow-2xl flex items-center justify-between backdrop-blur-xl transition-all duration-300"
          style={{
            backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.95))',
            borderColor: 'var(--card-border, rgba(255, 255, 255, 0.18))',
            boxShadow: '0 10px 30px rgba(0,0,0,0.85)',
          }}
        >
          {/* Gagang/Handle Geser */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-white/20" />

          {/* Info Lagu */}
          <div className="flex items-center gap-3 overflow-hidden flex-1 pr-2 mt-1">
            {currentSong?.thumbnail ? (
              <img
                src={currentSong.thumbnail}
                alt=""
                className="w-10 h-10 rounded-lg object-cover shrink-0 pointer-events-none"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0 flex items-center justify-center text-xs pointer-events-none">
                🎵
              </div>
            )}
            <div className="overflow-hidden pointer-events-none">
              <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--foreground-heading, #fff)' }}>
                {currentSong?.title || 'Tidak ada lagu'}
              </h4>
              <p className="text-[10px] opacity-60 truncate mt-0.5">
                {currentSong?.artist || 'Bisa digeser bebas'}
              </p>
            </div>
          </div>

          {/* Tombol Kontrol */}
          <div className="flex items-center gap-1.5 shrink-0 mt-1">
            <button
              onClick={playPrev}
              disabled={searchResults.length === 0}
              className="p-2 opacity-80 hover:opacity-100 transition disabled:opacity-20"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            <button
              onClick={togglePlayPause}
              disabled={!currentSong}
              className="p-2 rounded-full transition transform active:scale-90 disabled:opacity-30"
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
              onClick={playNext}
              disabled={searchResults.length === 0}
              className="p-2 opacity-80 hover:opacity-100 transition disabled:opacity-20"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}