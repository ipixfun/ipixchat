"use client";
import React, { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/bottomnav";
import { motion, AnimatePresence } from 'framer-motion';
import Ipix, { SiteInfo } from "./ipix";

export default function HomePage() {
  // State untuk menyimpan data web yang sedang diklik
  const [selectedSite, setSelectedSite] = useState<SiteInfo | null>(null);

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] relative overflow-hidden bg-[var(--background)]">
      {/* Gaya Animasi Keyframes */}
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
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .pulse-dot {
          animation: pulse-dot 2s infinite;
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        /* Animasi warna berpindah untuk tombol link */
        .color-shift-bg {
          background-size: 300% 300%;
          animation: color-shift 4s ease infinite;
        }
        @keyframes color-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Header Modern dengan Efek Glass */}
      <header
        className="sticky top-0 z-20 p-4 glass-card border-b transition-all duration-500"
        style={{
          backgroundColor: "color-mix(in srgb, var(--background) 75%, transparent)",
          borderColor: "color-mix(in srgb, var(--accent) 30%, transparent)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-black tracking-tight glow-text"
              style={{ color: "var(--foreground-heading)" }}
            >
              💬 ipixchat
            </h1>
            <p
              className="text-xs mt-0.5 font-medium flex items-center gap-1.5"
              style={{ color: "var(--foreground)" }}
            >
              <span className="w-2 h-2 rounded-full pulse-dot" style={{ backgroundColor: "var(--accent)" }} />
              Online sekarang
            </p>
          </div>
          {/* Avatar Mini */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg transition-transform hover:scale-110 active:scale-95"
            style={{
              backgroundColor: "var(--accent)",
              boxShadow: "0 4px 15px color-mix(in srgb, var(--accent) 40%, transparent)",
            }}
          >
            U
          </div>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="flex-1 overflow-y-auto hide-scroll space-y-4 pb-6">
        
        {/* Hero Section: 3 Logo Web Dinamis */}
        <div className="w-full pt-4 pb-0">
          <Ipix 
            className="scale-90 sm:scale-100" 
            selectedId={selectedSite?.id}
            onSelect={(site) => setSelectedSite(selectedSite?.id === site.id ? null : site)} 
          />
        </div>

        {/* Arahan & Deskripsi Link (Muncul Saat Logo Diklik) */}
        <AnimatePresence>
          {selectedSite && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20, margin: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="px-5 overflow-hidden"
            >
              <div 
                className="p-5 rounded-3xl text-center border relative"
                style={{ 
                  backgroundColor: "var(--card-bg)", 
                  borderColor: selectedSite.shadow,
                  boxShadow: `0 10px 30px -10px ${selectedSite.shadow}`
                }}
              >
                <button 
                  onClick={() => setSelectedSite(null)}
                  className="absolute top-3 right-4 text-xs font-bold opacity-50 hover:opacity-100 transition-opacity"
                >
                  ✕ Tutup
                </button>
                <h3 className="font-extrabold text-lg mb-2" style={{ color: "var(--foreground-heading)" }}>
                  Menuju <span style={{ color: "var(--accent)" }}>{selectedSite.name}</span>
                </h3>
                <p className="text-sm opacity-90 leading-relaxed mb-5" style={{ color: "var(--foreground)" }}>
                  {selectedSite.desc}
                </p>
                
                {/* Tombol Lanjutkan dengan Warna Berpindah */}
                <motion.a
                  href={selectedSite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block w-full sm:w-auto px-8 py-3 rounded-full text-white font-bold text-sm tracking-wide shadow-lg color-shift-bg"
                  style={{
                    backgroundImage: 'linear-gradient(270deg, var(--accent), #ff6b6b, #4ecdc4, var(--accent))'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  🚀 Buka Situs Sekarang
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ucapan Selamat Datang dengan Gradient Background */}
        <div className="px-5 mt-2">
          <div
            className="p-5 rounded-3xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02]"
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, var(--accent) 20%, var(--background)) 0%, var(--card-bg) 100%)`,
              border: "1px solid var(--card-border)",
              boxShadow: "0 8px 30px color-mix(in srgb, var(--accent) 8%, transparent)",
            }}
          >
            <div
              className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-10 pointer-events-none"
              style={{ backgroundColor: "var(--accent)", transform: "translate(20%, -20%)" }}
            />
            <div
              className="absolute bottom-0 left-0 w-24 h-24 rounded-full opacity-10 pointer-events-none"
              style={{ backgroundColor: "var(--accent)", transform: "translate(-20%, 20%)" }}
            />

            <h2
              className="text-xl font-extrabold mb-2 flex items-center gap-2"
              style={{ color: "var(--foreground-heading)" }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                className="text-2xl inline-block"
              >
                👋
              </motion.span>
              Halo, Sobat!
            </h2>
            <p className="text-sm opacity-90 leading-relaxed" style={{ color: "var(--foreground)" }}>
              Jelajahi ekosistem kami dengan mengklik salah satu logo di atas. Temukan keseruan baru di <strong style={{ color: "var(--accent)" }}>ipix.fun</strong> dan lainnya!
            </p>
          </div>
        </div>

        {/* Quick Actions dengan Desain Modern */}
        <div className="grid grid-cols-2 gap-4 px-5">
          <Link
            href="/chat"
            className="p-5 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.96] relative overflow-hidden group"
            style={{
              background: `linear-gradient(135deg, var(--accent) 0%, color-mix(in srgb, var(--accent) 70%, #ff6b6b) 100%)`,
              boxShadow: "0 10px 30px color-mix(in srgb, var(--accent) 40%, transparent)",
            }}
          >
            <span className="text-4xl mb-2 drop-shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              💬
            </span>
            <p className="text-sm font-bold text-white tracking-wide">Mulai Chat</p>
            <p className="text-[10px] text-white/80 mt-1">Teman baru menanti!</p>
          </Link>

          <Link
            href="/tema"
            className="p-5 rounded-3xl flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.96] relative overflow-hidden group"
            style={{
              backgroundColor: "var(--card-bg)",
              border: "1px solid var(--card-border)",
              boxShadow: "0 8px 25px color-mix(in srgb, var(--foreground) 5%, transparent)",
            }}
          >
            <span className="text-4xl mb-2 drop-shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
              🎨
            </span>
            <p className="text-sm font-bold tracking-wide" style={{ color: "var(--foreground-heading)" }}>
              Ubah Tema
            </p>
            <p className="text-[10px] mt-1 opacity-70" style={{ color: "var(--foreground)" }}>
              Sesuaikan gayamu
            </p>
          </Link>
        </div>

        {/* Status Hari Ini */}
        <div className="px-5 pb-4">
          <div
            className="p-5 rounded-3xl relative overflow-hidden"
            style={{
              background: `linear-gradient(to right, color-mix(in srgb, var(--accent) 10%, transparent), transparent)`,
              border: "1px solid color-mix(in srgb, var(--accent) 25%, transparent)",
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold opacity-70" style={{ color: "var(--foreground)" }}>
                  💡 Tips Hari Ini
                </p>
                <p className="text-sm font-bold mt-1" style={{ color: "var(--foreground-heading)" }}>
                  Gunakan tema gelap untuk kenyamanan mata di malam hari!
                </p>
              </div>
              <span className="text-3xl">🌙</span>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}