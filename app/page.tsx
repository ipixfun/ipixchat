'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/bottomnav';
import { motion } from 'framer-motion';

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoUrl = "https://res.cloudinary.com/bjamo8ld/video/upload/v1785016972/pixvideo_z1kfhn.mp4";
  const apkDownloadUrl = "https://github.com/ipixfun/ipix.apk/raw/refs/heads/main/ipixchat.apk";

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] relative overflow-hidden bg-[var(--background)]">
      {/* Custom Keyframes & Style CSS */}
      <style>{`
        .hide-scroll::-webkit-scrollbar {
          display: none;
        }
        .hide-scroll {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .glow-text {
          text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent);
        }
        .glass-card {
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .pulse-dot {
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
        }
        .color-shift-bg {
          background-size: 300% 300%;
          animation: color-shift 5s ease infinite;
        }
        @keyframes color-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Header Modern Glassmorphism */}
      <header
        className="sticky top-0 z-20 px-5 py-4 glass-card border-b transition-all duration-500"
        style={{
          backgroundColor: "color-mix(in srgb, var(--background) 75%, transparent)",
          borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md"
              style={{
                backgroundColor: "var(--accent)",
                boxShadow: "0 6px 20px color-mix(in srgb, var(--accent) 40%, transparent)",
              }}
            >
              💬
            </div>
            <div>
              <h1
                className="text-xl font-black tracking-tight glow-text leading-tight"
                style={{ color: "var(--foreground-heading)" }}
              >
                ipixchat
              </h1>
              <p
                className="text-[11px] font-semibold flex items-center gap-1.5 opacity-80"
                style={{ color: "var(--foreground)" }}
              >
                <span className="w-2 h-2 rounded-full pulse-dot" style={{ backgroundColor: "var(--accent)" }} />
                Komunitas & Hiburan
              </p>
            </div>
          </div>

          <Link
            href="/profile"
            className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-md transition-transform hover:scale-105 active:scale-95"
            style={{
              backgroundColor: "color-mix(in srgb, var(--accent) 20%, var(--card-bg))",
              color: "var(--foreground-heading)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)"
            }}
          >
            U
          </Link>
        </div>
      </header>

      {/* Konten Utama (Scrollable) */}
      <div className="flex-1 overflow-y-auto hide-scroll space-y-5 pt-4 pb-6 px-4 sm:px-6">
        
        {/* Top Hero: Embedded Video Player Estetik */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full rounded-3xl overflow-hidden p-2 sm:p-3 transition-all"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            boxShadow: "0 15px 35px -10px color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          {/* Frame Video */}
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black/50 group">
            <video
              src={videoUrl}
              controls
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover rounded-2xl"
            />
            {/* Efek Kaca Shine Hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
          </div>

          {/* Banner Info Video */}
          <div className="flex items-center justify-between px-3 pt-3 pb-1">
            <div className="flex items-center gap-2">
              <span 
                className="w-2.5 h-2.5 rounded-full animate-pulse"
                style={{ backgroundColor: 'var(--accent)' }}
              />
              <span className="font-extrabold text-xs sm:text-sm tracking-wide" style={{ color: 'var(--foreground-heading)' }}>
                ipix Ecosystem Highlight
              </span>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold opacity-75" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
              HD Video
            </span>
          </div>
        </motion.div>

        {/* Hero Banner: Download App ipixchat.apk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="p-5 sm:p-6 rounded-3xl relative overflow-hidden transition-all border"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 25%, var(--background)) 0%, var(--card-bg) 100%)`,
            borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
            boxShadow: "0 12px 35px color-mix(in srgb, var(--accent) 15%, transparent)",
          }}
        >
          {/* Background Decorative Circles */}
          <div
            className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-15 pointer-events-none blur-2xl"
            style={{ backgroundColor: "var(--accent)" }}
          />
          <div
            className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-15 pointer-events-none blur-xl"
            style={{ backgroundColor: "var(--accent)" }}
          />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase mb-1"
                style={{
                  backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                  color: 'var(--accent)',
                  border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)'
                }}
              >
                📱 Android App Available
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: "var(--foreground-heading)" }}>
                Download <span style={{ color: "var(--accent)" }}>ipixchat</span> App
              </h2>
              <p className="text-xs sm:text-sm opacity-85 leading-relaxed" style={{ color: "var(--foreground)" }}>
                Nikmati pengalaman chat & jelajah ekosistem ipix yang lebih cepat, ringan, dan responsif langsung di smartphone Android kamu.
              </p>
            </div>

            {/* Tombol Download APK */}
            <motion.a
              href={apkDownloadUrl}
              download="ipixchat.apk"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-xl color-shift-bg shrink-0"
              style={{
                backgroundImage: 'linear-gradient(270deg, var(--accent), #ff6b6b, #4ecdc4, var(--accent))'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/>
              </svg>
              Download APK
            </motion.a>
          </div>
        </motion.div>

        {/* Quick Actions / Menu Utama */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/chat"
            className="p-5 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.96] relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, #ff6b6b) 100%)`,
              boxShadow: "0 10px 30px color-mix(in srgb, var(--accent) 35%, transparent)",
            }}
          >
            <span className="text-4xl mb-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              💬
            </span>
            <p className="text-sm font-extrabold text-white tracking-wide">Mulai Chat</p>
            <p className="text-[10px] text-white/80 mt-0.5">Temukan teman baru!</p>
          </Link>

          <Link
            href="/tema"
            className="p-5 rounded-3xl flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.96] relative overflow-hidden group"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
              boxShadow: "0 8px 25px color-mix(in srgb, var(--foreground) 5%, transparent)",
            }}
          >
            <span className="text-4xl mb-2 drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-12">
              🎨
            </span>
            <p className="text-sm font-extrabold tracking-wide" style={{ color: "var(--foreground-heading)" }}>
              Ubah Tema
            </p>
            <p className="text-[10px] mt-0.5 opacity-70" style={{ color: "var(--foreground)" }}>
              Kustomisasi tampilan
            </p>
          </Link>
        </div>

        {/* Card Ekosistem Links / Quick Portal */}
        <div
          className="p-5 rounded-3xl space-y-3"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <h3 className="font-extrabold text-sm tracking-wide" style={{ color: "var(--foreground-heading)" }}>
            🌐 Ekosistem ipix
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: "ipix", url: "https://ipix.my.id", icon: "🌐" },
              { name: "sukachub", url: "https://sukachub.my.id", icon: "👥" },
              { name: "ipixfun", url: "https://ipix.fun", icon: "🎮" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-transform hover:scale-105 active:scale-95"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--accent) 10%, var(--background))",
                  border: "1px solid color-mix(in srgb, var(--accent) 20%, transparent)"
                }}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs font-bold" style={{ color: "var(--foreground-heading)" }}>
                  {item.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Tips Hari Ini */}
        <div
          className="p-4 sm:p-5 rounded-3xl relative overflow-hidden"
          style={{
            background: `linear-gradient(to right, color-mix(in srgb, var(--accent) 12%, transparent), transparent)`,
            border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold opacity-70" style={{ color: "var(--foreground)" }}>
                💡 Tips
              </p>
              <p className="text-xs sm:text-sm font-bold mt-0.5" style={{ color: "var(--foreground-heading)" }}>
                Unduh file APK di atas untuk akses fitur penuh tanpa hambatan browser!
              </p>
            </div>
            <span className="text-3xl shrink-0">🚀</span>
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}