'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
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

  // State Lirik
  const [showLyrics, setShowLyrics] = useState(false);
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

  // Parser Lirik LRC ([00:12.34] Teks)
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

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // Fetch Lirik
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
          setRawLyrics('Lirik tidak ditemukan untuk lagu ini.');
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

  // Sync Lirik & Auto-Scroll
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

  // Timer Progress
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

  // Play Song Function
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

  // Search Handler
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    let queryOrId = inputQuery.trim();

    const ytMatch = queryOrId.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      queryOrId = ytMatch[1];
      playSong({ id: queryOrId, title: 'Memuat Video...', artist: 'YouTube', duration: '0:00' });
      setIsSearching(false);
      return;
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(queryOrId)) {
      playSong({ id: queryOrId, title: 'Memuat Video...', artist: 'YouTube', duration: '0:00' });
      setIsSearching(false);
      return;
    }

    try {
      const res = await fetch(`/api/yt?q=${encodeURIComponent(queryOrId)}`);
      const data = await res.json();
      if (data.songs) setSearchResults(data.songs);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Play Pause Controls
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  const handleSeekStart = () => {
    isSeeking.current = true;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  const handleSeekEnd = () => {
    if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
      const dur = playerRef.current.getDuration();
      if (dur > 0) {
        const seekTime = (progress / 100) * dur;
        playerRef.current.seekTo(seekTime, true);
        setCurrentTimeSec(seekTime);
      }
    }
    isSeeking.current = false;
  };

  const playNext = () => {
    if (!currentSong || searchResults.length === 0) return;
    const currentIndex = searchResults.findIndex((s) => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % searchResults.length;
    playSong(searchResults[nextIndex]);
  };

  const playPrev = () => {
    if (!currentSong || searchResults.length === 0) return;
    const currentIndex = searchResults.findIndex((s) => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + searchResults.length) % searchResults.length;
    playSong(searchResults[prevIndex]);
  };

  return (
    <div
      className="min-h-screen p-4 pb-12 flex flex-col items-center transition-colors duration-300 font-sans"
      style={{
        backgroundColor: 'var(--background, #09090b)',
        color: 'var(--foreground, #f4f4f5)',
      }}
    >
      {/* Hidden Player */}
      <div className="absolute opacity-0 pointer-events-none -z-50 w-1 h-1 overflow-hidden">
        <div id="yt-hidden-player"></div>
      </div>

      {/* Top Header */}
      <div className="w-full max-w-md flex justify-between items-center my-3 px-1">
        <Link href="/" className="text-xs opacity-70 hover:opacity-100 transition flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <span
          className="text-[11px] font-bold tracking-widest uppercase"
          style={{ color: 'var(--accent)' }}
        >
          MUSIC PRO ({mounted ? theme : 'THEME'})
        </span>
      </div>

      {/* Form Pencarian */}
      <form onSubmit={handleSearch} className="w-full max-w-md mb-4 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Cari lagu, artis, atau url YouTube..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="w-full border rounded-full px-4 py-2.5 text-xs focus:outline-none transition"
            style={{
              backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.1))',
              color: 'var(--foreground-heading, #fff)',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isSearching}
          className="text-xs px-5 py-2.5 rounded-full font-bold text-black transition hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 12px var(--accent-glow, transparent)',
          }}
        >
          {isSearching ? '...' : 'Cari'}
        </button>
      </form>

      {/* Main Display: Lirik / Hasil Cari / Player Cover */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center my-2">
        {showLyrics ? (
          /* TAMPILAN LIRIK YT MUSIC PRO STYLE */
          <div
            className="w-full rounded-2xl p-6 border shadow-2xl flex flex-col h-[400px] relative overflow-hidden backdrop-blur-md"
            style={{
              backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.9))',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.1))',
              boxShadow: '0 8px 32px var(--accent-glow, rgba(0, 0, 0, 0.3))',
            }}
          >
            <div className="flex justify-between items-center pb-3 border-b border-white/10 z-10">
              <span className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--accent)' }}>
                LIRIK LAGU
              </span>
              <button
                onClick={() => setShowLyrics(false)}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition"
                style={{ color: 'var(--foreground)' }}
              >
                Tutup ✕
              </button>
            </div>

            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto scroll-smooth py-12 flex flex-col gap-6 no-scrollbar"
            >
              {isLoadingLyrics ? (
                <div className="flex-1 flex items-center justify-center text-xs opacity-50 animate-pulse">
                  Mencari lirik...
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
                      className={`text-lg font-bold transition-all duration-300 cursor-pointer leading-snug tracking-tight ${
                        isActive ? 'scale-105 opacity-100' : 'opacity-30 hover:opacity-70'
                      }`}
                      style={{
                        color: isActive ? 'var(--accent)' : 'var(--foreground)',
                        textShadow: isActive ? '0 0 12px var(--accent-glow, transparent)' : 'none',
                      }}
                    >
                      {line.text}
                    </p>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs opacity-60 text-center whitespace-pre-line leading-relaxed">
                  {rawLyrics || 'Lirik tidak ditemukan.'}
                </div>
              )}
            </div>
          </div>
        ) : searchResults.length > 0 ? (
          /* HASIL PENCARIAN LAGU */
          <div
            className="w-full rounded-2xl p-4 border max-h-[380px] overflow-y-auto flex flex-col gap-2 backdrop-blur-md"
            style={{
              backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.8))',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.1))',
            }}
          >
            <p className="text-[11px] font-bold opacity-60 px-1 uppercase tracking-wider mb-1">
              Hasil Pencarian
            </p>
            {searchResults.map((song) => (
              <div
                key={song.id}
                onClick={() => playSong(song)}
                className={`p-2.5 rounded-lg cursor-pointer transition flex justify-between items-center hover:opacity-80 border ${
                  currentSong?.id === song.id ? 'ring-1' : ''
                }`}
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--card-bg) 70%, white 5%)',
                  borderColor:
                    currentSong?.id === song.id ? 'var(--accent)' : 'var(--card-border, rgba(255,255,255,0.05))',
                }}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {song.thumbnail ? (
                    <img src={song.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0 flex items-center justify-center">
                      <svg className="w-5 h-5 opacity-40" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                      </svg>
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <h4
                      className="text-xs font-semibold truncate"
                      style={{
                        color: currentSong?.id === song.id ? 'var(--accent)' : 'var(--foreground-heading, #fff)',
                      }}
                    >
                      {song.title}
                    </h4>
                    <p className="text-[10px] opacity-70 truncate">{song.artist}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono opacity-50 shrink-0 ml-2">{song.duration}</span>
              </div>
            ))}
          </div>
        ) : (
          /* TAMPILAN COVER ART UTAMA YT MUSIC STYLE */
          <div
            className="w-full rounded-2xl p-6 border shadow-2xl flex flex-col items-center backdrop-blur-md"
            style={{
              backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.8))',
              borderColor: 'var(--card-border, rgba(255, 255, 255, 0.1))',
              boxShadow: '0 8px 32px var(--accent-glow, rgba(0, 0, 0, 0.3))',
            }}
          >
            <div className="w-60 h-60 rounded-2xl overflow-hidden shadow-2xl bg-black/20 mb-6 flex items-center justify-center relative group border border-white/10">
              {currentSong?.thumbnail ? (
                <img
                  src={currentSong.thumbnail}
                  alt={currentSong.title}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <svg className="w-16 h-16 opacity-20" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                </svg>
              )}
            </div>
            <div className="w-full text-left">
              <h2 className="text-lg font-bold truncate" style={{ color: 'var(--foreground-heading, #fff)' }}>
                {currentSong?.title || 'Pilih Lagu'}
              </h2>
              <p className="text-xs opacity-70 truncate mt-0.5" style={{ color: 'var(--foreground)' }}>
                {currentSong?.artist || 'Cari judul lagu di atas'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* PLAYER CONTROLS YT MUSIC PRO */}
      <div
        className="w-full max-w-md border rounded-2xl p-4 mt-2 shadow-2xl flex flex-col gap-3 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.8))',
          borderColor: 'var(--card-border, rgba(255, 255, 255, 0.1))',
          boxShadow: '0 8px 32px var(--accent-glow, rgba(0, 0, 0, 0.3))',
        }}
      >
        {/* Progress Slider */}
        <div className="flex flex-col gap-1">
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={progress}
            onChange={handleSeek}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
            style={{
              accentColor: 'var(--accent)',
              background: `linear-gradient(to right, var(--accent) ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
            }}
          />
          <div className="flex justify-between text-[10px] font-mono opacity-70">
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between px-2 pt-1">
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            disabled={!currentSong}
            className={`text-[11px] font-bold px-3.5 py-1.5 rounded-full transition border flex items-center gap-1.5 ${
              showLyrics ? 'bg-white/20 border-white/40' : 'opacity-70 hover:opacity-100 border-white/10'
            }`}
            style={{
              color: showLyrics ? 'var(--accent)' : 'var(--foreground)',
              borderColor: showLyrics ? 'var(--accent)' : 'var(--card-border, rgba(255,255,255,0.1))',
            }}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
            LIRIK
          </button>

          <div className="flex items-center gap-5">
            {/* Prev Icon */}
            <button
              onClick={playPrev}
              disabled={searchResults.length === 0}
              className="opacity-70 hover:opacity-100 transition disabled:opacity-20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play/Pause Icon */}
            <button
              onClick={togglePlayPause}
              disabled={!currentSong}
              className="w-11 h-11 rounded-full text-black font-extrabold flex items-center justify-center transition transform hover:scale-105 active:scale-95 disabled:opacity-40"
              style={{
                backgroundColor: 'var(--accent)',
                boxShadow: '0 0 16px var(--accent-glow, transparent)',
              }}
            >
              {isPlaying ? (
                <svg className="w-5 h-5 fill-black" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 fill-black ml-0.5" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next Icon */}
            <button
              onClick={playNext}
              disabled={searchResults.length === 0}
              className="opacity-70 hover:opacity-100 transition disabled:opacity-20"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>

          <div className="w-12"></div>
        </div>
      </div>
    </div>
  );
}