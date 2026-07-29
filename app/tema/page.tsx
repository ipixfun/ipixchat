"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "../../components/bottomnav";
import { useTheme } from "../context/ThemeContext";

interface ThemeItem {
  id: string;
  name: string;
  preview: string;
}

const themes: ThemeItem[] = [
  { id: "dark", name: "Monochrome Dark", preview: "from-neutral-800 to-black" },
  { id: "navy-electric", name: "Navy Electric", preview: "from-blue-900 to-slate-900" },
  { id: "emerald-cream", name: "Emerald Cream", preview: "from-emerald-200 to-amber-100" },
  { id: "teal-coral", name: "Teal Coral", preview: "from-orange-100 to-teal-200" },
  { id: "sea-citrus", name: "Sea Citrus", preview: "from-cyan-200 to-teal-100" },
  { id: "raisin-sunset", name: "Raisin Sunset", preview: "from-neutral-700 to-neutral-900" },
  { id: "gunmetal-platinum", name: "Gunmetal Platinum", preview: "from-slate-600 to-slate-800" },
  { id: "charcoal-ecru", name: "Charcoal Ecru", preview: "from-stone-700 to-stone-900" },
  { id: "charcoal-sage", name: "Charcoal Sage", preview: "from-zinc-700 to-zinc-900" },
  { id: "cyber-neon", name: "Cyber Neon", preview: "from-zinc-800 to-zinc-950" },
];

// Komponen Palet Warna yang Jauh Lebih Modern & Compact (Cocok untuk 2 Kolom Mobile)
const ColorInput = ({ 
  label, 
  value, 
  onChange, 
  disabled,
  allowTransparent 
}: { 
  label: string, 
  value: string, 
  onChange: (v: string) => void, 
  disabled: boolean,
  allowTransparent?: boolean 
}) => {
  const isTransparent = value === "transparent" || value === "";
  const hexColor = (isTransparent || !value) ? "#000000" : value.slice(0, 7);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-medium opacity-80" style={{ color: "var(--foreground)" }}>
          {label}
        </span>
        {allowTransparent && (
          <button
            onClick={() => onChange("transparent")}
            disabled={disabled}
            className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/10 transition-colors text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Kosongkan
          </button>
        )}
      </div>
      
      {/* Input Box Modern */}
      <div className="relative flex items-center gap-2 p-1.5 rounded-xl bg-black/10 border border-white/5 transition-all focus-within:border-white/30 hover:bg-black/20 shadow-sm">
        
        {/* Swatch / Lingkaran Warna */}
        <div className="relative w-7 h-7 rounded-lg overflow-hidden shrink-0 shadow-inner border border-white/10">
          {isTransparent && (
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />
          )}
          <input 
            type="color" 
            value={hexColor}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`absolute -inset-2 w-12 h-12 cursor-pointer border-0 bg-transparent ${isTransparent ? 'opacity-0' : 'opacity-100'} disabled:cursor-not-allowed`}
          />
        </div>

        {/* Input Teks Inline */}
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Hex / trans"
          className="w-full min-w-0 text-[11px] font-mono bg-transparent border-none text-white focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide placeholder-neutral-500"
        />
      </div>
    </div>
  );
};

export default function TemaPage() {
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  const [userPillColor, setUserPillColor] = useState<string>("#10b981");
  const [userBubbleBg, setUserBubbleBg] = useState<string>("");
  const [adminPillColor, setAdminPillColor] = useState<string>("#ef4444");
  const [adminBubbleBg, setAdminBubbleBg] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
    setUserPillColor(localStorage.getItem("global_user_pill_color") || "#10b981");
    setUserBubbleBg(localStorage.getItem("global_user_bubble_bg") || "");
    setAdminPillColor(localStorage.getItem("global_admin_pill_color") || "#ef4444");
    setAdminBubbleBg(localStorage.getItem("global_admin_bubble_bg") || "");

    const checkAuth = () => {
      try {
        const commonKeys = ["user", "username", "admin", "session", "token", "auth", "sb-access-token", "supabase.auth.token"];
        let foundLogin = false;

        for (const key of commonKeys) {
          const val = localStorage.getItem(key);
          if (val && val !== "null" && val !== "undefined" && val !== "{}") {
            foundLogin = true;
            break;
          }
        }

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

        if (!foundLogin && typeof document !== "undefined" && document.cookie) {
          if (document.cookie.match(/(sb-|token|user|session)/)) {
            foundLogin = true;
          }
        }

        setIsLoggedIn(foundLogin);
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAuth();
  }, []);

  const activeThemeId = isMounted ? theme : "dark";

  const handleCustomColorChange = (key: string, value: string) => {
    setCustomColors({ ...customColors, [key]: value });
    if (activeThemeId !== "custom") setTheme("custom");
  };

  const updateChatSetting = (setter: React.Dispatch<React.SetStateAction<string>>, key: string, value: string) => {
    setter(value);
    localStorage.setItem(key, value);
    window.dispatchEvent(new Event("globalColorChanged"));
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] bg-[var(--background)] text-[var(--foreground)]">
        <div className="p-4 text-xs opacity-50">Memuat pengaturan...</div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] transition-colors duration-300 bg-[var(--background)] text-[var(--foreground)]">
      
      {/* Header */}
      <div className="sticky top-0 z-20 p-4 sm:p-5 backdrop-blur-xl border-b transition-colors duration-300 bg-[color-mix(in_srgb,var(--background)_80%,transparent)] border-[var(--card-border)]">
        <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
          Pengaturan Tema
        </h1>
        <p className="text-[11px] sm:text-xs mt-1 opacity-80" style={{ color: "var(--foreground)" }}>
          Personalisasi antarmuka dan warna obrolan sesuai preferensi Anda.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-6 sm:space-y-8">
        
        {/* ADVANCED SECTION: Custom Themes & Chat Bubbles (Locked for Guests) */}
        <div 
          className="relative rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm"
          style={{ 
            backgroundColor: "var(--card-bg)", 
            borderColor: activeThemeId === "custom" ? "var(--accent)" : "var(--card-border)"
          }}
        >
          {/* Kustomisasi Lanjutan Header */}
          <div className="p-4 sm:p-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-xs sm:text-sm" style={{ color: "var(--foreground-heading)" }}>
                  Kustomisasi Lanjutan
                </h3>
                {!loadingAuth && (
                  <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full font-medium tracking-wide ${
                    isLoggedIn ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                  }`}>
                    {isLoggedIn ? "Terbuka" : "Terkunci"}
                  </span>
                )}
              </div>
            </div>
            
            <button
              disabled={!isLoggedIn}
              onClick={() => isLoggedIn && setTheme("custom")}
              className={`px-3 py-1.5 rounded-lg font-medium text-[10px] sm:text-xs transition-all ${
                !isLoggedIn ? "opacity-50 cursor-not-allowed" : "active:scale-95"
              }`}
              style={{
                backgroundColor: activeThemeId === "custom" ? "var(--accent)" : "transparent",
                color: activeThemeId === "custom" ? "var(--background)" : "var(--accent)",
                border: "1px solid var(--accent)"
              }}
            >
              {activeThemeId === "custom" ? "Aktif" : "Terapkan Kustom"}
            </button>
          </div>

          {/* Pengaturan Content */}
          <div className={`p-4 sm:p-5 space-y-6 ${!isLoggedIn && !loadingAuth ? "opacity-30 pointer-events-none blur-[2px] select-none" : ""}`}>
            
            {/* 1. UI & Wave Colors - GRID 2 KOLOM */}
            <div>
              <h4 className="text-[11px] font-semibold mb-2.5 opacity-80 uppercase tracking-wider">Warna UI</h4>
              <div className="grid grid-cols-2 gap-3">
                <ColorInput label="Latar Belakang" value={customColors.bg} onChange={(v) => handleCustomColorChange("bg", v)} disabled={!isLoggedIn} />
                <ColorInput label="Warna Aksen" value={customColors.accent} onChange={(v) => handleCustomColorChange("accent", v)} disabled={!isLoggedIn} />
                <div className="col-span-2 sm:col-span-1">
                  <ColorInput label="Warna Teks" value={customColors.text} onChange={(v) => handleCustomColorChange("text", v)} disabled={!isLoggedIn} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-[11px] font-semibold mb-2.5 opacity-80 uppercase tracking-wider">Animasi Wave</h4>
              <div className="grid grid-cols-2 gap-3">
                <ColorInput label="Wave Belakang" value={customColors.wave1} onChange={(v) => handleCustomColorChange("wave1", v)} disabled={!isLoggedIn} allowTransparent />
                <ColorInput label="Wave Tengah" value={customColors.wave2} onChange={(v) => handleCustomColorChange("wave2", v)} disabled={!isLoggedIn} allowTransparent />
                <div className="col-span-2 sm:col-span-1">
                  <ColorInput label="Wave Depan" value={customColors.wave3} onChange={(v) => handleCustomColorChange("wave3", v)} disabled={!isLoggedIn} allowTransparent />
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-white/5" />

            {/* 2. Chat Bubble Colors - GRID 2 KOLOM KIRI KANAN (User vs Admin) */}
            <div>
              <h4 className="text-[11px] font-semibold mb-3 opacity-80 uppercase tracking-wider">Warna Pesan Obrolan</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                
                {/* Kolom Kiri: User */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase border-b border-white/5 pb-1 mb-2">Pesan User</div>
                  <ColorInput label="Label Nama" value={userPillColor} onChange={(v) => updateChatSetting(setUserPillColor, "global_user_pill_color", v)} disabled={!isLoggedIn} allowTransparent />
                  <ColorInput label="Kotak Pesan" value={userBubbleBg} onChange={(v) => updateChatSetting(setUserBubbleBg, "global_user_bubble_bg", v)} disabled={!isLoggedIn} allowTransparent />
                </div>

                {/* Kolom Kanan: Admin */}
                <div className="space-y-2.5">
                  <div className="text-[10px] font-semibold tracking-wider text-rose-400 uppercase border-b border-white/5 pb-1 mb-2">Pesan Admin</div>
                  <ColorInput label="Label Nama" value={adminPillColor} onChange={(v) => updateChatSetting(setAdminPillColor, "global_admin_pill_color", v)} disabled={!isLoggedIn} allowTransparent />
                  <ColorInput label="Kotak Pesan" value={adminBubbleBg} onChange={(v) => updateChatSetting(setAdminBubbleBg, "global_admin_bubble_bg", v)} disabled={!isLoggedIn} allowTransparent />
                </div>

              </div>
            </div>
          </div>

          {/* Locked State Overlay */}
          {!isLoggedIn && !loadingAuth && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[1px]">
              <div className="text-center p-5 rounded-2xl bg-[#111] border border-white/10 shadow-2xl max-w-[280px] w-full">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 border border-white/10">
                  <span className="block w-3.5 h-3.5 rounded-sm border-2 border-neutral-400" />
                </div>
                <h4 className="text-xs font-semibold text-white mb-2">Akses Dibatasi</h4>
                <p className="text-[10px] text-neutral-400 mb-4 leading-relaxed">
                  Fitur racik warna lanjutan dan kustomisasi kotak obrolan eksklusif untuk member terdaftar.
                </p>
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center px-4 py-2 text-[11px] font-semibold rounded-xl text-black bg-white hover:bg-neutral-200 transition-all active:scale-95"
                >
                  Masuk Sekarang
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* PRESET THEMES SECTION - GRID 2 KOLOM (Mobile) */}
        <div>
          <h3 className="font-semibold text-sm mb-3 px-1" style={{ color: "var(--foreground-heading)" }}>
            Preset Tema
          </h3>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
            {themes.map((t: ThemeItem) => {
              const isActive = activeThemeId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-2.5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
                    isActive ? "shadow-md bg-white/5" : "hover:bg-white/5"
                  }`}
                  style={{
                    backgroundColor: isActive ? "transparent" : "var(--card-bg)",
                    borderColor: isActive ? "var(--accent)" : "var(--card-border)",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${t.preview} shadow-inner border border-white/10 shrink-0`} />
                    <div className="min-w-0">
                      <h3 className="font-medium text-[11px] sm:text-xs truncate" style={{ color: "var(--foreground-heading)" }}>
                        {t.name}
                      </h3>
                    </div>
                  </div>

                  <div
                    className="w-3 h-3 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0"
                    style={{ borderColor: isActive ? "var(--accent)" : "var(--card-border)" }}
                  >
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
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