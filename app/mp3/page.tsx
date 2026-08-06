'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '../context/ThemeContext'; // Sesuaikan path jika menggunakan '@/context/ThemeContext'

export default function Mp3Page() {
  const { theme, mounted } = useTheme();

  const [inputUrl, setInputUrl] = useState('');
  const [title, setTitle] = useState('Belum Ada Lagu Diputar');
  const [artist, setArtist] = useState('-');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('0:00');
  const [duration, setDuration] = useState('0:00');

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const loadAndPlaySong = async (id: string) => {
    if (!id) return;
    setIsLoading(true);
    setIsPlaying(false);

    try {
      const res = await fetch(`/api/yt?v=${id}&type=info`);
      const data = await res.json();
      setTitle(data.title || 'Judul Tidak Diketahui');
      setArtist(data.artist || 'Artis Tidak Diketahui');

      if (audioRef.current) {
        audioRef.current.src = `/api/yt?v=${id}`;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error(err);
      setTitle('Gagal Memuat Lagu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    let extractedId = inputUrl.trim();

    if (extractedId.includes('v=')) {
      extractedId = extractedId.split('v=')[1]?.split('&')[0] || '';
    } else if (extractedId.includes('youtu.be/')) {
      extractedId = extractedId.split('youtu.be/')[1]?.split('?')[0] || '';
    }

    if (extractedId) {
      loadAndPlaySong(extractedId);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration;
      if (dur) {
        setProgress((cur / dur) * 100);
        setCurrentTime(formatTime(cur));
        setDuration(formatTime(dur));
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      const seekTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = seekTime;
    }
  };

  return (
    <div
      className="min-h-screen p-4 flex flex-col items-center justify-center transition-colors duration-300"
      style={{
        backgroundColor: "var(--background, #09090b)",
        color: "var(--foreground, #f4f4f5)",
      }}
    >
      {/* Top Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-8">
        <Link
          href="/"
          className="text-xs transition opacity-70 hover:opacity-100"
          style={{ color: "var(--foreground)" }}
        >
          ← Kembali
        </Link>
        <span
          className="text-xs font-semibold tracking-wider uppercase transition-colors"
          style={{ color: "var(--accent)" }}
        >
          TEMA: {mounted ? theme : 'DARK'}
        </span>
      </div>

      {/* Input Box Link YouTube */}
      <form onSubmit={handleSearch} className="w-full max-w-md mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Tempel Link / Video ID YouTube..."
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          className="flex-1 border rounded-xl px-3.5 py-2.5 text-xs focus:outline-none transition"
          style={{
            backgroundColor: "color-mix(in srgb, var(--background) 80%, white 10%)",
            borderColor: "var(--card-border, rgba(255,255,255,0.1))",
            color: "var(--foreground-heading, #fff)",
          }}
        />
        <button
          type="submit"
          className="text-xs px-4 py-2.5 rounded-xl transition font-medium text-black"
          style={{
            backgroundColor: "var(--accent)",
            boxShadow: "0 0 12px var(--accent-glow, transparent)",
          }}
        >
          Putar
        </button>
      </form>

      {/* CARD MP3 PLAYER DENGAN STYLE TEMA DINAMIS */}
      <div
        className="w-full max-w-md border rounded-2xl p-6 transition-all duration-300 flex flex-col gap-6 backdrop-blur-md"
        style={{
          backgroundColor: "var(--card-bg, rgba(24, 24, 27, 0.8))",
          borderColor: "var(--card-border, rgba(255, 255, 255, 0.1))",
          boxShadow: "0 8px 32px var(--accent-glow, rgba(0, 0, 0, 0.3))",
        }}
      >
        {/* Info Teks Lagu */}
        <div className="text-center">
          <h2
            className="text-base font-semibold truncate"
            style={{ color: "var(--foreground-heading, #fff)" }}
          >
            {isLoading ? 'Memuat Lagu...' : title}
          </h2>
          <p
            className="text-xs mt-1 truncate"
            style={{ color: "var(--foreground, #a1a1aa)" }}
          >
            {artist}
          </p>
        </div>

        {/* Timeline Slider */}
        <div className="flex flex-col gap-1.5">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="w-full h-1 rounded-lg cursor-pointer"
            style={{
              accentColor: "var(--accent)",
              backgroundColor: "color-mix(in srgb, var(--foreground) 20%, transparent)",
            }}
          />
          <div
            className="flex justify-between text-[11px] font-mono"
            style={{ color: "var(--foreground, #a1a1aa)" }}
          >
            <span>{currentTime}</span>
            <span>{duration}</span>
          </div>
        </div>

        {/* Kontrol Tombol Utama */}
        <div className="flex items-center justify-center gap-6">
          <button
            className="text-lg hover:opacity-100 opacity-60 transition"
            style={{ color: "var(--foreground-heading)" }}
          >
            ⏮
          </button>
          <button
            onClick={togglePlayPause}
            disabled={isLoading}
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{
              backgroundColor: "var(--accent)",
              color: "#000000",
              boxShadow: "0 0 15px var(--accent-glow, transparent)",
            }}
          >
            {isLoading ? '⌛' : isPlaying ? '⏸' : '▶'}
          </button>
          <button
            className="text-lg hover:opacity-100 opacity-60 transition"
            style={{ color: "var(--foreground-heading)" }}
          >
            ⏭
          </button>
        </div>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
      />
    </div>
  );
}