"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "../../components/bottomnav";
import { useTheme } from "../context/ThemeContext";

export default function TemaPage() {
  const { theme, setTheme, customColors, setCustomColors, mounted } = useTheme();
  
  // Status Login User/Admin
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Cek Status Login dengan Deteksi Otomatis Lebih Luas
  useEffect(() => {
    const checkAuth = () => {
      try {
        // 1. Daftar key umum yang sering dipakai untuk simpan login
        const commonKeys = [
          "user",
          "username",
          "admin",
          "session",
          "token",
          "auth",
          "sb-access-token",
          "supabase.auth.token"
        ];

        let foundLogin = false;

        // Cek key umum
        for (const key of commonKeys) {
          const val = localStorage.getItem(key);
          if (val && val !== "null" && val !== "undefined" && val !== "{}") {
            foundLogin = true;
            break;
          }
        }

        // 2. Jika belum ketemu, pindai seluruh isi localStorage
        // (Mencari key dari Supabase 'sb-*-auth-token' atau key lain yang mengandung user/auth)
        if (!foundLogin) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith("sb-") || key.includes("auth") || key.includes("user") || key.includes("session"))) {
              const val = localStorage.getItem(key);
              if (val && val !== "null" && val !== "undefined" && val !== "{}") {
                foundLogin = true;
                break;
              }
            }
          }
        }

        // 3. Cek Cookie jika login disimpan di Cookie
        if (!foundLogin && typeof document !== "undefined" && document.cookie) {
          if (
            document.cookie.includes("sb-") || 
            document.cookie.includes("token") || 
            document.cookie.includes("user") || 
            document.cookie.includes("session")
          ) {
            foundLogin = true;
          }
        }

        setIsLoggedIn(foundLogin);
      } catch (err) {
        console.error("Gagal memeriksa sesi login:", err);
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const themes = [
    { id: "dark", name: "Monochrome Dark", icon: "🖤", preview: "from-neutral-800 to-black" },
    { id: "navy-electric", name: "Navy Electric", icon: "⚡", preview: "from-blue-900 to-slate-900" },
    { id: "emerald-cream", name: "Emerald Cream", icon: "🍵", preview: "from-emerald-200 to-amber-100" },
    { id: "teal-coral", name: "Teal Coral", icon: "🏖️", preview: "from-orange-100 to-teal-200" },
    { id: "sea-citrus", name: "Sea Citrus", icon: "🍋", preview: "from-cyan-200 to-teal-100" },
    { id: "raisin-sunset", name: "Raisin Sunset", icon: "🌇", preview: "from-neutral-700 to-neutral-900" },
    { id: "gunmetal-platinum", name: "Gunmetal Platinum", icon: "🦾", preview: "from-slate-600 to-slate-800" },
    { id: "charcoal-ecru", name: "Charcoal Ecru", icon: "☕", preview: "from-stone-700 to-stone-900" },
    { id: "charcoal-sage", name: "Charcoal Sage", icon: "🌿", preview: "from-zinc-700 to-zinc-900" },
    { id: "cyber-neon", name: "Cyber Neon", icon: "👾", preview: "from-zinc-800 to-zinc-950" },
  ];

  const activeThemeId = mounted ? theme : "dark";

  return (
    <div 
      className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] transition-colors duration-300"
      style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
    >
      {/* Header */}
      <div 
        className="sticky top-0 z-20 p-4 backdrop-blur-md border-b transition-colors duration-300"
        style={{ 
          backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
          borderColor: "var(--card-border)"
        }}
      >
        <h1 style={{ color: "var(--accent)" }} className="text-xl font-bold drop-shadow-md">
          🎨 Pengaturan Tema
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--foreground)" }}>
          Pilih tema preset atau racik warna buatanmu sendiri (khusus member/admin).
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-6">
        
        {/* SECTION 1: CUSTOM COLOR & WAVE PICKER */}
        <div 
          className="relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 overflow-hidden"
          style={{ 
            backgroundColor: "var(--card-bg)", 
            borderColor: activeThemeId === "custom" ? "var(--accent)" : "var(--card-border)",
            boxShadow: activeThemeId === "custom" ? "0 0 15px var(--accent-glow)" : "none"
          }}
        >
          {/* Header Custom Theme */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm" style={{ color: "var(--foreground-heading)" }}>
                  🎨 Racik Tema & Gelombang Kustom
                </h3>
                {!loadingAuth && !isLoggedIn && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold border border-red-500/30">
                    🔒 Terkunci
                  </span>
                )}
                {!loadingAuth && isLoggedIn && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                    🔓 Terbuka
                  </span>
                )}
              </div>
              <p className="text-[10px] opacity-80 mt-0.5" style={{ color: "var(--foreground)" }}>
                Atur warna UI & animasi gelombang obrolan
              </p>
            </div>
            
            <button
              disabled={!isLoggedIn}
              onClick={() => isLoggedIn && setTheme("custom")}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all shadow-sm shrink-0 ${
                !isLoggedIn ? "opacity-50 cursor-not-allowed" : "active:scale-95"
              }`}
              style={{
                backgroundColor: activeThemeId === "custom" ? "var(--accent)" : "transparent",
                color: activeThemeId === "custom" ? "var(--background)" : "var(--accent)",
                border: "1px solid var(--accent)"
              }}
            >
              {activeThemeId === "custom" ? "✓ Aktif" : "Gunakan Kustom"}
            </button>
          </div>

          {/* COLOR PICKERS AREA */}
          <div className={!isLoggedIn && !loadingAuth ? "opacity-40 pointer-events-none select-none blur-[1px]" : ""}>
            {/* Warna UI Dasar */}
            <div className="mb-3">
              <span className="text-[11px] font-bold block mb-2" style={{ color: "var(--foreground-heading)" }}>
                1. Warna Dasar UI
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                  <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Latar</span>
                  <input 
                    type="color" 
                    disabled={!isLoggedIn}
                    value={customColors.bg}
                    onChange={(e) => {
                      setCustomColors({ ...customColors, bg: e.target.value });
                      if (activeThemeId !== "custom") setTheme("custom");
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                  <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Aksen</span>
                  <input 
                    type="color" 
                    disabled={!isLoggedIn}
                    value={customColors.accent}
                    onChange={(e) => {
                      setCustomColors({ ...customColors, accent: e.target.value });
                      if (activeThemeId !== "custom") setTheme("custom");
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                  <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Teks</span>
                  <input 
                    type="color" 
                    disabled={!isLoggedIn}
                    value={customColors.text}
                    onChange={(e) => {
                      setCustomColors({ ...customColors, text: e.target.value });
                      if (activeThemeId !== "custom") setTheme("custom");
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Warna Gelombang / Wave */}
            <div>
              <span className="text-[11px] font-bold block mb-2" style={{ color: "var(--foreground-heading)" }}>
                2. Warna Animasi Gelombang (Wave)
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                  <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Wave Belakang</span>
                  <input 
                    type="color" 
                    disabled={!isLoggedIn}
                    value={customColors.wave1}
                    onChange={(e) => {
                      setCustomColors({ ...customColors, wave1: e.target.value });
                      if (activeThemeId !== "custom") setTheme("custom");
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                  <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Wave Tengah</span>
                  <input 
                    type="color" 
                    disabled={!isLoggedIn}
                    value={customColors.wave2}
                    onChange={(e) => {
                      setCustomColors({ ...customColors, wave2: e.target.value });
                      if (activeThemeId !== "custom") setTheme("custom");
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                  <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Wave Depan</span>
                  <input 
                    type="color" 
                    disabled={!isLoggedIn}
                    value={customColors.wave3}
                    onChange={(e) => {
                      setCustomColors({ ...customColors, wave3: e.target.value });
                      if (activeThemeId !== "custom") setTheme("custom");
                    }}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OVERLAY BANNER LOGIN JIKA BELUM LOGIN */}
          {!isLoggedIn && !loadingAuth && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] transition-all">
              <div className="text-center p-4 rounded-2xl bg-neutral-900/90 border border-white/10 shadow-2xl max-w-xs">
                <div className="text-2xl mb-1">🔒</div>
                <h4 className="text-xs font-bold text-white">Fitur Racik Warna Terkunci</h4>
                <p className="text-[10px] text-neutral-400 mt-1 mb-3">
                  Silakan login terlebih dahulu untuk membuka fitur kustomisasi warna & gelombang.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-4 py-1.5 text-xs font-bold rounded-xl text-black bg-white hover:bg-neutral-200 transition-all active:scale-95 shadow-md"
                >
                  Login Sekarang
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 2: GRID PRESET THEMES */}
        <div>
          <h3 className="font-bold text-xs mb-3 px-1" style={{ color: "var(--foreground)" }}>
            Preset Tema Gratis:
          </h3>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {themes.map((t) => {
              const isActive = activeThemeId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between gap-1.5 sm:gap-2 ${
                    isActive ? "scale-[1.02]" : "hover:scale-[1.01]"
                  }`}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: isActive ? "var(--accent)" : "var(--card-border)",
                    boxShadow: isActive ? "0 0 15px var(--accent-glow)" : "none",
                  }}
                >
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${t.preview} flex items-center justify-center text-lg sm:text-xl shadow-lg border border-white/10 shrink-0`}>
                      {t.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-xs sm:text-sm truncate" style={{ color: "var(--foreground-heading)" }}>
                        {t.name}
                      </h3>
                      <p className="text-[9px] sm:text-[10px] mt-0.5 truncate" style={{ color: "var(--foreground)" }}>
                        {isActive ? "✓ Aktif" : "Terapkan"}
                      </p>
                    </div>
                  </div>

                  <div
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0"
                    style={{ borderColor: isActive ? "var(--accent)" : "var(--card-border)" }}
                  >
                    {isActive && (
                      <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}