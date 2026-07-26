'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/bottomnav';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [isApk, setIsApk] = useState(false); // State untuk deteksi APK/WebView
  
  const videoUrl = "https://res.cloudinary.com/bjamo8ld/video/upload/v1785016972/pixvideo_z1kfhn.mp4";
  const apkDownloadUrl = "https://github.com/ipixfun/ipix.apk/raw/refs/heads/main/ipixchat.apk";

  useEffect(() => {
    // Fungsi untuk mendeteksi apakah diakses dari dalam APK / WebView / Standalone
    const checkIsApp = () => {
      if (typeof window === 'undefined') return false;

      const userAgent = navigator.userAgent.toLowerCase();
      // Deteksi Android WebView (mengandung 'wv')
      const isWebView = userAgent.includes('wv');
      // Deteksi PWA / TWA (standalone mode) menggunakan type assertion as any untuk menghindari error TypeScript
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

      return isWebView || isStandalone;
    };

    setIsApk(checkIsApp());
  }, []);

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

      {/* Popup Konfirmasi Download */}
      <AnimatePresence>
        {showDownloadConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 glass-card"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm p-6 rounded-3xl text-center shadow-2xl"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
              }}
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-3xl shadow-lg"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 20%, transparent)" }}
              >
                📲
              </div>
              <h3 className="text-lg font-black mb-2" style={{ color: "var(--foreground-heading)" }}>
                Konfirmasi Unduhan
              </h3>
              <p className="text-sm mb-6 opacity-80" style={{ color: "var(--foreground)" }}>
                Setuju download <strong>ipixchat.apk</strong>?
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDownloadConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-transform active:scale-95"
                  style={{ backgroundColor: "var(--background)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                >
                  Batal
                </button>
                <a 
                  href={apkDownloadUrl}
                  download="ipixchat.apk"
                  onClick={() => setShowDownloadConfirm(false)}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-transform active:scale-95 color-shift-bg"
                  style={{ backgroundImage: 'linear-gradient(270deg, var(--accent), #ff6b6b, #4ecdc4, var(--accent))' }}
                >
                  Setuju
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Modern Glassmorphism */}
      <header
        className="sticky top-0 z-20 px-4 sm:px-5 py-3 sm:py-4 glass-card border-b transition-all duration-500"
        style={{
          backgroundColor: "color-mix(in srgb, var(--background) 75%, transparent)",
          borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)",
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Logo dari icon.png */}
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-md shrink-0 overflow-hidden bg-black/10"
              style={{
                boxShadow: "0 6px 20px color-mix(in srgb, var(--accent) 40%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)"
              }}
            >
              <img src="/icon.png" alt="ipixchat" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1
                className="text-lg sm:text-xl font-black tracking-tight glow-text leading-tight"
                style={{ color: "var(--foreground-heading)" }}
              >
                ipixchat
              </h1>
            </div>
          </div>

          {/* Link Ekosistem bergaya Pill Outline */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {[
              { name: "ipix.my.id", url: "https://ipix.my.id" },
              { name: "sukachub", url: "https://sukachub.my.id" },
              { name: "ipix.fun", url: "https://ipix.fun" },
            ].map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
                style={{
                  color: "var(--accent)",
                  border: "1px solid color-mix(in srgb, var(--accent) 60%, transparent)",
                  backgroundColor: "color-mix(in srgb, var(--accent) 5%, transparent)",
                }}
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Konten Utama (Scrollable) */}
      <div className="flex-1 overflow-y-auto hide-scroll space-y-5 pt-4 pb-6 px-4 sm:px-6">
        
        {/* Top Hero: Embedded Video Player */}
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
          <div className="relative w-full rounded-2xl overflow-hidden bg-black flex justify-center items-center group">
            <video
              src={videoUrl}
              controls
              loop
              playsInline
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-auto max-h-[60vh] object-contain rounded-2xl"
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
                Tutorial ipix chat
              </span>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold opacity-75" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
              Lagu : Diatas Normal ( NOAH )
            </span>
          </div>
        </motion.div>

        {/* Dynamic Section: Thank You (APK) OR Download Banner (Web) */}
        {isApk ? (
          // Tampilan jika dibuka di dalam APK / Standalone PWA
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="py-10 px-5 sm:px-6 rounded-3xl relative overflow-hidden transition-all border text-center flex flex-col items-center justify-center gap-3"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 10%, var(--background)) 0%, var(--card-bg) 100%)`,
              borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
              boxShadow: "0 12px 35px color-mix(in srgb, var(--accent) 15%, transparent)",
            }}
          >
            {/* Background Decorative Bulat Besar Kiri Bawah */}
            <div
              className="absolute -bottom-14 -left-12 w-48 h-48 rounded-full opacity-25 pointer-events-none blur-3xl"
              style={{ backgroundColor: "var(--accent)" }}
            />
            {/* Background Decorative Bulat Kecil Kanan Atas */}
            <div
              className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-30 pointer-events-none blur-2xl"
              style={{ backgroundColor: "var(--accent)" }}
            />

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2" 
                style={{ 
                  color: "var(--accent)", 
                  textShadow: "0 0 15px color-mix(in srgb, var(--accent) 40%, transparent)" 
                }}>
                Terima Kasih!
              </h2>
              <p className="text-xs sm:text-sm opacity-90 leading-relaxed max-w-[260px] mx-auto" style={{ color: "var(--foreground)" }}>
                Sudah menggunakan <span className="font-extrabold" style={{ color: "var(--accent)" }}>ipixchat</span> versi Aplikasi Android. Nikmati pengalaman menjelajah yang lebih cepat dan lancar.
              </p>
            </div>
          </motion.div>
        ) : (
          // Tampilan Banner Download jika dibuka di Browser biasa
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
                  📱 Android App
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: "var(--foreground-heading)" }}>
                  Download <span style={{ color: "var(--accent)" }}>ipixchat</span>
                </h2>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed" style={{ color: "var(--foreground)" }}>
                  Nikmati pengalaman chat & jelajah ekosistem ipix yang lebih cepat, ringan, dan responsif langsung di smartphone Android kamu.
                </p>
              </div>

              {/* Tombol Download */}
              <motion.button
                onClick={() => setShowDownloadConfirm(true)}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-white font-extrabold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-xl color-shift-bg shrink-0 outline-none"
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
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* --- SECTION: Info Versi & Actions --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-5 sm:p-6 rounded-3xl relative overflow-hidden"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            boxShadow: "0 10px 30px color-mix(in srgb, var(--accent) 15%, transparent)",
          }}
        >
          {/* Header Versi */}
          <div className="flex items-center gap-3 mb-5 border-b pb-4" style={{ borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-base shadow-md" style={{ backgroundColor: "var(--accent)" }}>
              🚀
            </div>
            <h3 className="text-lg font-black tracking-tight" style={{ color: "var(--foreground-heading)" }}>
              ipixchat v1.0.0
            </h3>
          </div>

          {/* Daftar Fitur / Update */}
          <ul className="space-y-4">
            {/* Poin 1 & Tombol Chat */}
            <li className="space-y-2.5">
              <div className="flex gap-3">
                <span className="font-black text-sm mt-0.5" style={{ color: "var(--accent)" }}>1.</span>
                <p className="text-sm opacity-90 leading-relaxed" style={{ color: "var(--foreground)" }}>
                  Chat auto login setelah register nama dan pin. Untuk ubah nama dan pin hubungi admin by chat.
                </p>
              </div>
              <div className="pl-6">
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full text-white font-bold text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 60%, white), var(--accent))",
                    boxShadow: "0 4px 15px color-mix(in srgb, var(--accent) 40%, transparent)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.15)"
                  }}
                >
                  <span className="mr-1.5 text-sm drop-shadow-md">💬</span> Mulai Chat
                </Link>
              </div>
            </li>

            {/* Poin 2 */}
            <li className="flex gap-3">
              <span className="font-black text-sm mt-0.5" style={{ color: "var(--accent)" }}>2.</span>
              <p className="text-sm opacity-90 leading-relaxed" style={{ color: "var(--foreground)" }}>
                Kirim gambar di kolom input chat.
              </p>
            </li>

            {/* Poin 3 & Tombol Tema */}
            <li className="space-y-2.5">
              <div className="flex gap-3">
                <span className="font-black text-sm mt-0.5" style={{ color: "var(--accent)" }}>3.</span>
                <p className="text-sm opacity-90 leading-relaxed" style={{ color: "var(--foreground)" }}>
                  Ubah tema setelah login bisa costumisasi tema sesuka kamu.
                </p>
              </div>
              <div className="pl-6">
                <Link
                  href="/tema"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-full text-white font-bold text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
                  style={{
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 60%, white), var(--accent))",
                    boxShadow: "0 4px 15px color-mix(in srgb, var(--accent) 40%, transparent)",
                    textShadow: "0 1px 2px rgba(0,0,0,0.15)"
                  }}
                >
                  <span className="mr-1.5 text-sm drop-shadow-md">🎨</span> Ubah Tema
                </Link>
              </div>
            </li>

            {/* Poin 4 */}
            <li className="flex gap-3">
              <span className="font-black text-sm mt-0.5" style={{ color: "var(--accent)" }}>4.</span>
              <p className="text-sm opacity-90 leading-relaxed" style={{ color: "var(--foreground)" }}>
                Tentang ipix geser pill dan drop pill untuk info sosmed ipix.
              </p>
            </li>

            {/* Poin 5 */}
            <li className="flex gap-3">
              <span className="font-black text-sm mt-0.5" style={{ color: "var(--accent)" }}>5.</span>
              <p className="text-sm opacity-90 leading-relaxed font-bold italic" style={{ color: "var(--accent)" }}>
                Next...
              </p>
            </li>
          </ul>
        </motion.div>
        
        {/* Footer / Copyright Mark */}
        <div className="flex flex-col items-center justify-center mt-8 mb-2 space-y-1.5">
          <div className="w-10 h-1 rounded-full mb-1" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }} />
          <p className="text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>
            ipixchat © {new Date().getFullYear()}
          </p>
          <p className="text-[9px] font-bold opacity-60 uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
            All Rights Reserved
          </p>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}