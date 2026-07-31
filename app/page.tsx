'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomNav from '@/components/bottomnav';
import { motion, AnimatePresence } from 'framer-motion';

// --- DATA DINAMIS ---
const APP_INFO = {
  version: "v1.0",
  apkSize: "4.45 MB",
  videoUrl: "https://res.cloudinary.com/bjamo8ld/video/upload/v1785508218/ipixchat_dryqj3.mp4",
  apkDownloadUrl: "https://ipix.my.id/ipixchat.apk",
  year: new Date().getFullYear(),
};

const ECOSYSTEM_LINKS = [
  { name: "ipix.my.id", url: "https://ipix.my.id" },
  { name: "sukachub", url: "https://sukachub.my.id" },
  { name: "ipix.fun", url: "https://ipix.fun" },
];

const FEATURES = [
  {
    id: 1,
    title: "Akses Instan & Praktis",
    text: "Cukup daftarkan Username dan PIN 6 digit angka untuk langsung berinteraksi dengan saya/pix. Akses auto-login membuat sesi percakapan Anda berjalan mulus tanpa hambatan.",
    action: { label: "Mulai Chat", href: "/chat" }
  },
  {
    id: 2,
    title: "Pengiriman Media Interaktif",
    text: "Fitur berbagi gambar dan media yang responsif langsung dari kolom percakapan.",
    action: null
  },
  {
    id: 3,
    title: "Kustomisasi Tema Personal",
    text: "Sesuaikan antarmuka visual aplikasi sesuai selera Anda setelah berhasil masuk.",
    action: { label: "Ubah Tema", href: "/tema" }
  },
  {
    id: 4,
    title: "Navigasi & Ekosistem Terpadu",
    text: "Jelajahi informasi media sosial dan tautan ekosistem ipix hanya dengan menggeser atau melepas kontrol pill.",
    action: null
  },
  {
    id: 5,
    title: "Pengembangan Berkelanjutan",
    text: "Pembaruan fitur baru dan peningkatan performa akan terus dikembangkan secara rutin.",
    isHighlight: true,
    action: null
  }
];
// --------------------

export default function HomePage() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [isApk, setIsApk] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  // 1. Deteksi Khusus Mode APK (Bukan Web Browser / PWA)
  useEffect(() => {
    const checkIsApkNative = () => {
      if (typeof window === 'undefined') return false;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // HANYA true jika dibuka dari WebView APK Android murni
      // PWA (standalone) dan Web Browser umum akan bernilai false
      const isWebView = userAgent.includes('wv') || userAgent.includes('ipixchat');
      return isWebView;
    };

    const isApkMode = checkIsApkNative();
    setIsApk(isApkMode);

    // Pengarahan otomatis pertama kali jika dibuka via APK Android
    if (isApkMode) {
      const hasInitialRedirected = localStorage.getItem('ipix_apk_first_open');
      if (!hasInitialRedirected) {
        localStorage.setItem('ipix_apk_first_open', 'true');
        router.push('/chat');
      }
    }
  }, [router]);

  // 2. Deteksi Notifikasi Masuk -> Otomatis Ke Tab /chat
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'chat' || params.get('redirect') === 'chat' || params.get('from') === 'notification') {
      router.push('/chat');
    }

    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.action === 'OPEN_CHAT' || event.data?.type === 'NOTIFICATION_CLICK') {
        router.push('/chat');
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
    };
  }, [router]);

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] relative overflow-hidden bg-[var(--background)]">
      {/* Custom Style & Animation CSS */}
      <style>{`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .glow-text { text-shadow: 0 0 20px color-mix(in srgb, var(--accent) 50%, transparent); }
        .glass-card { backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .color-shift-bg { background-size: 300% 300%; animation: color-shift 5s ease infinite; }
        
        @keyframes color-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @keyframes wave-motion {
          0% { transform: translateX(0) translateZ(0) scaleY(1); }
          50% { transform: translateX(-25%) translateZ(0) scaleY(0.85); }
          100% { transform: translateX(0) translateZ(0) scaleY(1); }
        }

        .animate-wave {
          animation: wave-motion 9s ease-in-out infinite;
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
              className="w-full max-w-sm p-5 sm:p-6 rounded-3xl text-center shadow-2xl"
              style={{
                backgroundColor: "var(--card-bg)",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
              }}
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: "color-mix(in srgb, var(--accent) 20%, transparent)", color: "var(--accent)" }}
              >
                <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
                  <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/>
                </svg>
              </div>
              
              <h3 className="text-base sm:text-lg font-black mb-2" style={{ color: "var(--foreground-heading)" }}>
                Konfirmasi Unduhan
              </h3>
              <p className="text-xs sm:text-sm mb-6 opacity-80 break-words" style={{ color: "var(--foreground)" }}>
                Setuju mengunduh <strong>ipixchat.apk</strong> ({APP_INFO.apkSize})?
              </p>
              
              <div className="flex gap-2.5">
                <button 
                  onClick={() => setShowDownloadConfirm(false)}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm transition-transform active:scale-95"
                  style={{ backgroundColor: "var(--background)", color: "var(--foreground)", border: "1px solid var(--card-border)" }}
                >
                  Batal
                </button>
                <a 
                  href={APP_INFO.apkDownloadUrl}
                  download="ipixchat.apk"
                  onClick={() => setShowDownloadConfirm(false)}
                  className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-transform active:scale-95 color-shift-bg flex items-center justify-center"
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
        className="sticky top-0 z-20 px-3.5 sm:px-5 py-3 glass-card border-b transition-all duration-500"
        style={{
          backgroundColor: "color-mix(in srgb, var(--background) 75%, transparent)",
          borderColor: "color-mix(in srgb, var(--accent) 25%, transparent)",
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center shadow-md shrink-0 overflow-hidden bg-black/10"
              style={{
                boxShadow: "0 6px 20px color-mix(in srgb, var(--accent) 40%, transparent)",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)"
              }}
            >
              <img src="/icon.png" alt="ipixchat" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1
                className="text-base sm:text-xl font-black tracking-tight glow-text leading-tight"
                style={{ color: "var(--foreground-heading)" }}
              >
                ipixchat
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap justify-end min-w-0">
            {ECOSYSTEM_LINKS.map((item) => (
              <a
                key={item.name}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[10px] font-extrabold tracking-wide transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
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

      {/* Konten Utama */}
      <div className="flex-1 overflow-y-auto hide-scroll space-y-4 sm:space-y-5 pt-3 sm:pt-4 pb-6 px-3.5 sm:px-6">
        
        {/* 1. Video Player Section dengan Pull Down Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden p-2 sm:p-3 transition-all"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            boxShadow: "0 15px 35px -10px color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          {/* Bar Pull-Down / Toggle Sembunyikan Video */}
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 mb-1.5 rounded-xl transition-all hover:bg-white/5 active:scale-[0.99] outline-none"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--accent) 8%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full animate-pulse shrink-0" style={{ backgroundColor: 'var(--accent)' }} />
              <span className="font-extrabold text-xs sm:text-sm tracking-wide truncate" style={{ color: 'var(--foreground-heading)' }}>
                Panduan Video ipixchat
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold opacity-75" style={{ color: 'var(--accent)' }}>
                {showVideo ? 'Sembunyikan' : 'Tampilkan'}
              </span>
              <motion.svg
                animate={{ rotate: showVideo ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="w-4 h-4 fill-current"
                style={{ color: 'var(--accent)' }}
                viewBox="0 0 24 24"
              >
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </motion.svg>
            </div>
          </button>

          {/* Video Container Collapse Animation */}
          <AnimatePresence initial={false}>
            {showVideo && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden bg-black flex justify-center items-center group mt-1">
                  <video
                    src={APP_INFO.videoUrl}
                    controls
                    loop
                    playsInline
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    className="w-full h-auto max-h-[55vh] object-contain rounded-xl sm:rounded-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl sm:rounded-2xl" />
                </div>

                <div className="flex items-center justify-between gap-2 px-2 pt-2.5 pb-0.5">
                  <span className="text-[10px] sm:text-xs font-medium opacity-80" style={{ color: 'var(--foreground)' }}>
                    Tutorial & Fitur Utama
                  </span>
                  <span className="text-[9px] sm:text-[10px] px-2 py-0.5 sm:py-1 rounded-full font-bold opacity-75 shrink-0 whitespace-nowrap" style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent)' }}>
                    Musik: Diatas Normal
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 2. Dynamic Section: Terima Kasih (HANYA APK) OR Download Banner (Web Browser / PWA) */}
        {isApk ? (
          /* Kolom Terima Kasih HANYA Tampil di APK */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="py-8 sm:py-10 px-4 sm:px-6 rounded-2xl sm:rounded-3xl relative overflow-hidden transition-all border text-center flex flex-col items-center justify-center gap-2 sm:gap-3"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, var(--background)) 0%, var(--card-bg) 100%)`,
              borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
              boxShadow: "0 12px 35px color-mix(in srgb, var(--accent) 15%, transparent)",
            }}
          >
            {/* Wave Animation Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-2xl sm:rounded-3xl opacity-25">
              <svg 
                className="absolute -bottom-2 left-0 w-[200%] h-24 animate-wave" 
                viewBox="0 0 1200 120" 
                preserveAspectRatio="none"
              >
                <path 
                  d="M0,0 C150,90 350,-40 500,40 C650,120 900,10 1200,40 L1200,120 L0,120 Z" 
                  fill="var(--accent)" 
                />
              </svg>
            </div>

            <div className="absolute -bottom-14 -left-12 w-48 h-48 rounded-full opacity-20 pointer-events-none blur-3xl" style={{ backgroundColor: "var(--accent)" }} />
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-25 pointer-events-none blur-2xl" style={{ backgroundColor: "var(--accent)" }} />

            <div className="relative z-10 w-full">
              <h2 className="text-xl sm:text-3xl font-black tracking-tight mb-1.5" 
                style={{ color: "var(--accent)", textShadow: "0 0 15px color-mix(in srgb, var(--accent) 40%, transparent)" }}>
                Terima Kasih!
              </h2>
              <p className="text-xs sm:text-sm font-medium leading-relaxed max-w-[280px] sm:max-w-md mx-auto break-words" style={{ color: "var(--foreground)" }}>
                Terima kasih supportnya sudah menggunakan apk <span className="font-black" style={{ color: "var(--accent)" }}>ipixchat</span>. Nikmati pengalaman berinteraksi yang lebih cepat dan lancar.
              </p>
            </div>
          </motion.div>
        ) : (
          /* Tampil di Web Browser & PWA: Banner Unduh APK */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden transition-all border"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 25%, var(--background)) 0%, var(--card-bg) 100%)`,
              borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)",
              boxShadow: "0 12px 35px color-mix(in srgb, var(--accent) 15%, transparent)",
            }}
          >
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-15 pointer-events-none blur-2xl" style={{ backgroundColor: "var(--accent)" }} />
            <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full opacity-15 pointer-events-none blur-xl" style={{ backgroundColor: "var(--accent)" }} />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 sm:gap-4">
              <div className="space-y-1 flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mb-1"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' }}
                >
                  Aplikasi Android
                </div>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight leading-snug" style={{ color: "var(--foreground-heading)" }}>
                  Unduh <span style={{ color: "var(--accent)" }}>ipixchat</span> <span className="text-xs sm:text-sm font-bold opacity-80 whitespace-nowrap">({APP_INFO.apkSize})</span>
                </h2>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed break-words" style={{ color: "var(--foreground)" }}>
                  Dapatkan pengalaman interaksi yang lebih optimal, ringan, dan cepat langsung melalui perangkat Android Anda.
                </p>
              </div>

              <motion.button
                onClick={() => setShowDownloadConfirm(true)}
                className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl text-white font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-xl color-shift-bg shrink-0 outline-none"
                style={{ backgroundImage: 'linear-gradient(270deg, var(--accent), #ff6b6b, #4ecdc4, var(--accent))' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z"/>
                </svg>
                Unduh APK
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* 3. Kolom Platform */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden text-left"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
            boxShadow: "0 10px 30px color-mix(in srgb, var(--accent) 10%, transparent)",
          }}
        >
          <span 
            className="inline-block px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase mb-2"
            style={{ 
              backgroundColor: 'color-mix(in srgb, var(--accent) 15%, transparent)', 
              color: 'var(--accent)',
              border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)'
            }}
          >
            Platform Perpesanan
          </span>
          <h2 className="text-lg sm:text-2xl font-black tracking-tight mb-2 leading-snug break-words" style={{ color: "var(--foreground-heading)" }}>
            Ruang Interaksi Personal bersama <span style={{ color: "var(--accent)" }}>pix</span>
          </h2>
          <p className="text-xs sm:text-sm opacity-85 leading-relaxed break-words" style={{ color: "var(--foreground)" }}>
            Aplikasi ini didesain secara khusus untuk memudahkan Anda terhubung dan berinteraksi secara cepat dan terstruktur. Cukup buat <strong>Username</strong> dan <strong>PIN 6 digit angka</strong> tanpa proses pendaftaran yang rumit.
          </p>
        </motion.div>

        {/* 4. Dynamic Section: Fitur Utama */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl relative overflow-hidden"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            boxShadow: "0 10px 30px color-mix(in srgb, var(--accent) 15%, transparent)",
          }}
        >
          <div className="flex items-center justify-between mb-4 border-b pb-3.5" style={{ borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-md border shrink-0" 
                   style={{ backgroundColor: "color-mix(in srgb, var(--accent) 10%, transparent)", borderColor: "var(--accent)" }}>
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
              </div>
              <h3 className="text-base sm:text-lg font-black tracking-tight truncate" style={{ color: "var(--foreground-heading)" }}>
                Fitur Utama ipixchat
              </h3>
            </div>
            <span className="text-[10px] sm:text-xs font-extrabold px-2.5 py-0.5 rounded-full border shrink-0"
              style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, transparent)", color: "var(--accent)" }}
            >
              {APP_INFO.version}
            </span>
          </div>

          <ul className="space-y-3.5 sm:space-y-4">
            {FEATURES.map((feature) => (
              <li key={feature.id} className={feature.action ? "space-y-2" : "flex gap-2.5 sm:gap-3"}>
                <div className="flex gap-2.5 sm:gap-3 min-w-0">
                  <span className="font-black text-xs sm:text-sm mt-0.5 shrink-0" style={{ color: "var(--accent)" }}>
                    {feature.id}.
                  </span>
                  <div className="min-w-0 flex-1">
                    {feature.title && (
                      <h4 className="text-xs sm:text-sm font-bold mb-0.5 leading-snug break-words" style={{ color: "var(--foreground-heading)" }}>
                        {feature.title}
                      </h4>
                    )}
                    <p 
                      className={`text-[11px] sm:text-sm opacity-85 leading-relaxed break-words ${feature.isHighlight ? 'font-bold italic' : ''}`} 
                      style={{ color: feature.isHighlight ? "var(--accent)" : "var(--foreground)" }}
                    >
                      {feature.text}
                    </p>
                  </div>
                </div>
                
                {feature.action && (
                  <div className="pl-6 sm:pl-7">
                    <Link
                      href={feature.action.href}
                      className="inline-flex items-center justify-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-white font-bold text-[11px] sm:text-xs shadow-md transition-transform hover:scale-105 active:scale-95"
                      style={{
                        background: "linear-gradient(135deg, color-mix(in srgb, var(--accent) 60%, white), var(--accent))",
                        boxShadow: "0 4px 15px color-mix(in srgb, var(--accent) 40%, transparent)",
                        textShadow: "0 1px 2px rgba(0,0,0,0.15)"
                      }}
                    >
                      {feature.action.label}
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </motion.div>
        
        {/* Footer */}
        <div className="flex flex-col items-center justify-center mt-6 sm:mt-8 mb-2 space-y-1">
          <div className="w-8 sm:w-10 h-1 rounded-full mb-1" style={{ backgroundColor: "color-mix(in srgb, var(--accent) 40%, transparent)" }} />
          <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: "var(--accent)" }}>
            ipixchat © {APP_INFO.year}
          </p>
          <p className="text-[8px] sm:text-[9px] font-bold opacity-60 uppercase tracking-widest" style={{ color: "var(--foreground)" }}>
            All Rights Reserved
          </p>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}