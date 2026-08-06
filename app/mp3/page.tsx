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
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const playerRef = useRef<any>(null);
  const isSeeking = useRef(false);
  const intervalRef = useRef<any>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 1. LOAD YOUTUBE IFRAME API SCRIPT
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }
  }, []);

  // 2. TIMELINE PROGRESS TRACKER
  const startProgressTimer = useCallback(() => {
    stopProgressTimer();
    intervalRef.current = setInterval(() => {
      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function' && !isSeeking.current) {
        const cur = playerRef.current.getCurrentTime() || 0;
        const dur = playerRef.current.getDuration() || 0;
        if (dur > 0) {
          setProgress((cur / dur) * 100);
          setDuration(formatTime(dur));
        }
        setCurrentTime(formatTime(cur));
      }
    }, 500);
  }, []);

  const stopProgressTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  // 3. INIT OR PLAY SONG IN IFRAME PLAYER
  const playSong = useCallback((song: SongItem) => {
    setCurrentSong(song);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime('0:00');

    if (!window.YT || !window.YT.Player) return;

    if (playerRef.current) {
      playerRef.current.loadVideoById(song.id);
    } else {
      playerRef.current = new window.YT.Player('yt-hidden-player', {
        height: '1',
        width: '1',
        videoId: song.id,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          fs: 0,
          rel: 0,
        },
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
          },
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
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
  }, [startProgressTimer]);

  // 4. PENCARIAN LAGU (VIA INVIDIOUS / PUBLIC SEARCH)
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

  // 5. KONTROL UTAMA (PLAY / PAUSE)
  const togglePlayPause = () => {
    if (!playerRef.current) return;
    if (isPlaying) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  };

  // 6. SEEKING HANDLERS
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
      className="min-h-screen p-4 pb-28 flex flex-col items-center transition-colors duration-300"
      style={{
        backgroundColor: 'var(--background, #09090b)',
        color: 'var(--foreground, #f4f4f5)',
      }}
    >
      {/* Hidden YouTube Player Frame */}
      <div className="absolute opacity-0 pointer-events-none -z-50 w-1 h-1 overflow-hidden">
        <div id="yt-hidden-player"></div>
      </div>

      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center my-4">
        <Link href="/" className="text-xs transition opacity-70 hover:opacity-100">
          ← Kembali
        </Link>
        <span className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--accent)' }}>
          YT MUSIC ({mounted ? theme : 'DARK'})
        </span>
      </div>

      {/* Form Pencarian */}
      <form onSubmit={handleSearch} className="w-full max-w-md mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Cari judul lagu / penyanyi / link YT..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--background) 80%, white 10%)',
            borderColor: 'var(--card-border, rgba(255,255,255,0.1))',
            color: 'var(--foreground-heading, #fff)',
          }}
        />
        <button
          type="submit"
          disabled={isSearching}
          className="text-xs px-4 py-2.5 rounded-xl transition font-medium text-black disabled:opacity-50"
          style={{
            backgroundColor: 'var(--accent)',
            boxShadow: '0 0 12px var(--accent-glow, transparent)',
          }}
        >
          {isSearching ? '...' : 'Cari'}
        </button>
      </form>

      {/* Hasil Pencarian */}
      {searchResults.length > 0 && (
        <div className="w-full max-w-md mb-6 flex flex-col gap-2">
          <p className="text-[11px] opacity-60 font-medium px-1">Hasil Pencarian:</p>
          {searchResults.map((song) => (
            <div
              key={song.id}
              onClick={() => playSong(song)}
              className={`p-3 border rounded-xl cursor-pointer transition flex justify-between items-center hover:opacity-80 ${
                currentSong?.id === song.id ? 'ring-1' : ''
              }`}
              style={{
                backgroundColor: 'var(--card-bg, rgba(255,255,255,0.05))',
                borderColor:
                  currentSong?.id === song.id ? 'var(--accent)' : 'var(--card-border, rgba(255,255,255,0.1))',
              }}
            >
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                {song.thumbnail && (
                  <img src={song.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                )}
                <div className="overflow-hidden">
                  <h4 className="text-xs font-semibold truncate" style={{ color: 'var(--foreground-heading)' }}>
                    {song.title}
                  </h4>
                  <p className="text-[10px] opacity-70 truncate">{song.artist}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono opacity-50 shrink-0">{song.duration}</span>
            </div>
          ))}
        </div>
      )}

      {/* Player Card */}
      <div
        className="w-full max-w-md border rounded-2xl p-6 transition-all duration-300 flex flex-col gap-6 backdrop-blur-md mt-2"
        style={{
          backgroundColor: 'var(--card-bg, rgba(24, 24, 27, 0.8))',
          borderColor: 'var(--card-border, rgba(255, 255, 255, 0.1))',
          boxShadow: '0 8px 32px var(--accent-glow, rgba(0, 0, 0, 0.3))',
        }}
      >
        <div className="flex flex-col items-center gap-3">
          {currentSong?.thumbnail && (
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-32 h-32 rounded-xl object-cover shadow-lg"
            />
          )}
          <div className="text-center w-full">
            <h2 className="text-base font-semibold truncate" style={{ color: 'var(--foreground-heading, #fff)' }}>
              {currentSong?.title || 'Belum Ada Lagu Diputar'}
            </h2>
            <p className="text-xs mt-1 truncate" style={{ color: 'var(--foreground, #a1a1aa)' }}>
              {currentSong?.artist || 'Ketik judul lagu di atas untuk memutar'}
            </p>
          </div>
        </div>

        {/* Timeline Slider */}
        <div className="flex flex-col gap-1.5">
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
            className="w-full h-1.5 rounded-lg cursor-pointer appearance-none"
            style={{
              accentColor: 'var(--accent)',
              background: `linear-gradient(to right, var(--accent) ${progress}%, rgba(255,255,255,0.15) ${progress}%)`,
            }}
          />
          <div className="flex justify-between text-[11px] font-mono" style={{ color: 'var(--foreground, #a1a1aa)' }}>
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Kontrol Utama */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={playPrev}
            disabled={searchResults.length === 0}
            className="text-lg opacity-60 hover:opacity-100 transition disabled:opacity-20"
          >
            ⏮
          </button>
          <button
            onClick={togglePlayPause}
            disabled={!currentSong}
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#000000',
              boxShadow: '0 0 20px var(--accent-glow, transparent)',
            }}
          >
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button
            onClick={playNext}
            disabled={searchResults.length === 0}
            className="text-lg opacity-60 hover:opacity-100 transition disabled:opacity-20"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
}