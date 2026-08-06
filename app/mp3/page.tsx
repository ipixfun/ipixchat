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

export default function Mp3Page() {
  const { theme, mounted } = useTheme();

  const [inputQuery, setInputQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SongItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [currentSong, setCurrentSong] = useState<SongItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const [totalSeconds, setTotalSeconds] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isSeeking = useRef(false);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || !isFinite(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const parseDurationToSeconds = (durStr: string): number => {
    if (!durStr || durStr === '0:00') return 0;
    const parts = durStr.split(':').map(Number);
    if (parts.some(isNaN)) return 0;
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return 0;
  };

  // ===== PENCARIAN =====
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    setIsSearching(true);
    setSearchResults([]);

    let queryOrId = inputQuery.trim();

    // Deteksi YouTube URL
    const ytMatch = queryOrId.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    if (ytMatch) {
      queryOrId = ytMatch[1];
      playSong({ id: queryOrId, title: 'Memuat...', artist: '-', duration: '0:00' });
      setIsSearching(false);
      return;
    }

    if (/^[a-zA-Z0-9_-]{11}$/.test(queryOrId)) {
      playSong({ id: queryOrId, title: 'Memuat...', artist: '-', duration: '0:00' });
      setIsSearching(false);
      return;
    }

    try {
      const res = await fetch(`/api/yt?q=${encodeURIComponent(queryOrId)}`);
      const data = await res.json();
      if (data.songs && data.songs.length > 0) {
        setSearchResults(data.songs);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // ===== PUTAR LAGU =====
  const playSong = useCallback((song: SongItem) => {
    setCurrentSong(song);
    setIsLoadingAudio(true);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime('0:00');
    setDuration(song.duration || '0:00');
    setTotalSeconds(parseDurationToSeconds(song.duration || '0:00'));

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = `/api/yt?v=${song.id}`;
      audioRef.current.load();
    }
  }, []);

  // Auto-play setelah audio siap
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleCanPlay = () => {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setIsLoadingAudio(false);
          })
          .catch((err) => {
            console.error('Autoplay gagal:', err);
            setIsLoadingAudio(false);
          });
      }
    };

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setTotalSeconds(audio.duration);
        setDuration(formatTime(audio.duration));
      }
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [currentSong?.id]);

  // ===== PLAY / PAUSE =====
  const togglePlayPause = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.error('Play error:', err));
    }
  };

  // ===== TIME UPDATE =====
  const handleTimeUpdate = () => {
    if (!audioRef.current || isSeeking.current) return;

    const cur = audioRef.current.currentTime;
    let total = totalSeconds;

    if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
      total = audioRef.current.duration;
    }

    if (total > 0) {
      setProgress((cur / total) * 100);
      setDuration(formatTime(total));
    }
    setCurrentTime(formatTime(cur));
  };

  // ===== SEEKING HANDLERS =====
  const handleSeekStart = () => {
    isSeeking.current = true;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  const handleSeekEnd = () => {
    if (!audioRef.current) return;

    let total = totalSeconds;
    if (audioRef.current.duration && isFinite(audioRef.current.duration)) {
      total = audioRef.current.duration;
    }

    if (total > 0) {
      const seekTime = (progress / 100) * total;
      audioRef.current.currentTime = seekTime;
    }

    isSeeking.current = false;
  };

  // ===== NAVIGASI LAGU =====
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
      {/* Top Bar */}
      <div className="w-full max-w-md flex justify-between items-center my-4">
        <Link href="/" className="text-xs transition opacity-70 hover:opacity-100">
          ← Kembali
        </Link>
        <span
          className="text-xs font-semibold tracking-wider uppercase"
          style={{ color: 'var(--accent)' }}
        >
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
                  currentSong?.id === song.id
                    ? 'var(--accent)'
                    : 'var(--card-border, rgba(255,255,255,0.1))',
              }}
            >
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                {song.thumbnail && (
                  <img
                    src={song.thumbnail}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover shrink-0"
                  />
                )}
                <div className="overflow-hidden">
                  <h4
                    className="text-xs font-semibold truncate"
                    style={{ color: 'var(--foreground-heading)' }}
                  >
                    {song.title}
                  </h4>
                  <p className="text-[10px] opacity-70 truncate">{song.artist}</p>
                </div>
              </div>
              <span className="text-[10px] font-mono opacity-50 shrink-0">
                {song.duration}
              </span>
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
        {/* Thumbnail & Info */}
        <div className="flex flex-col items-center gap-3">
          {currentSong?.thumbnail && (
            <img
              src={currentSong.thumbnail}
              alt={currentSong.title}
              className="w-32 h-32 rounded-xl object-cover shadow-lg"
            />
          )}
          <div className="text-center w-full">
            <h2
              className="text-base font-semibold truncate"
              style={{ color: 'var(--foreground-heading, #fff)' }}
            >
              {isLoadingAudio
                ? 'Memuat Audio...'
                : currentSong?.title || 'Belum Ada Lagu Diputar'}
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
          <div
            className="flex justify-between text-[11px] font-mono"
            style={{ color: 'var(--foreground, #a1a1aa)' }}
          >
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
            disabled={isLoadingAudio || !currentSong}
            className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-40"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#000000',
              boxShadow: '0 0 20px var(--accent-glow, transparent)',
            }}
          >
            {isLoadingAudio ? (
              <span className="animate-spin">⏳</span>
            ) : isPlaying ? (
              '⏸'
            ) : (
              '▶'
            )}
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

      {/* Audio Element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
          setCurrentTime('0:00');
          if (searchResults.length > 0) {
            playNext();
          }
        }}
        onWaiting={() => setIsLoadingAudio(true)}
        onPlaying={() => {
          setIsLoadingAudio(false);
          setIsPlaying(true);
        }}
        onError={(e) => {
          console.error('Audio error:', e);
          setIsLoadingAudio(false);
          setIsPlaying(false);
        }}
      />
    </div>
  );
}