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

// Komponen Reusable untuk Input Warna + Transparansi
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
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-black/5 border border-white/5 transition-colors focus-within:border-white/20">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium" style={{ color: "var(--foreground)" }}>{label}</span>
        {allowTransparent && (
          <button
            onClick={() => onChange("transparent")}
            disabled={disabled}
            className="text-[9px] font-medium px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-all text-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Transparan
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-white/20">
          {/* Visual indikator untuk transparan */}
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
        <input 
          type="text" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Hex / rgba / transparent"
          className="w-full text-xs p-1.5 rounded-lg bg-black/20 border border-transparent text-white focus:outline-none focus:border-white/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
      <div className="sticky top-0 z-20 p-5 backdrop-blur-xl border-b transition-colors duration-300 bg-[color-mix(in_srgb,var(--background)_80%,transparent)] border-[var(--card-border)]">
        <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
          Pengaturan Tema
        </h1>
        <p className="text-xs mt-1 opacity-80" style={{ color: "var(--foreground)" }}>
          Personalisasi antarmuka dan warna obrolan sesuai preferensi Anda.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto space-y-8">
        
        {/* ADVANCED SECTION: Custom Themes & Chat Bubbles (Locked for Guests) */}
        <div 
          className="relative rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm"
          style={{ 
            backgroundColor: "var(--card-bg)", 
            borderColor: activeThemeId === "custom" ? "var(--accent)" : "var(--card-border)"
          }}
        >
          {/* Kustomisasi Lanjutan Header */}
          <div className="p-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-sm" style={{ color: "var(--foreground-heading)" }}>
                  Kustomisasi Lanjutan
                </h3>
                {!loadingAuth && (
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium tracking-wide ${
                    isLoggedIn ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                  }`}>
                    {isLoggedIn ? "Terbuka" : "Terkunci"}
                  </span>
                )}
              </div>
              <p className="text-[11px] opacity-70">Warna UI dasar, animasi gelombang, dan penanda pesan obrolan.</p>
            </div>
            
            <button
              disabled={!isLoggedIn}
              onClick={() => isLoggedIn && setTheme("custom")}
              className={`px-4 py-2 rounded-lg font-medium text-xs transition-all ${
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
          <div className={`p-5 space-y-6 ${!isLoggedIn && !loadingAuth ? "opacity-30 pointer-events-none blur-[2px] select-none" : ""}`}>
            
            {/* 1. UI & Wave Colors */}
            <div>
              <h4 className="text-xs font-semibold mb-3 opacity-90">Warna Antarmuka</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ColorInput label="Latar Belakang" value={customColors.bg} onChange={(v) => handleCustomColorChange("bg", v)} disabled={!isLoggedIn} />
                <ColorInput label="Warna Aksen" value={customColors.accent} onChange={(v) => handleCustomColorChange("accent", v)} disabled={!isLoggedIn} />
                <ColorInput label="Warna Teks" value={customColors.text} onChange={(v) => handleCustomColorChange("text", v)} disabled={!isLoggedIn} />
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-3 opacity-90">Animasi Gelombang</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ColorInput label="Gelombang Belakang" value={customColors.wave1} onChange={(v) => handleCustomColorChange("wave1", v)} disabled={!isLoggedIn} allowTransparent />
                <ColorInput label="Gelombang Tengah" value={customColors.wave2} onChange={(v) => handleCustomColorChange("wave2", v)} disabled={!isLoggedIn} allowTransparent />
                <ColorInput label="Gelombang Depan" value={customColors.wave3} onChange={(v) => handleCustomColorChange("wave3", v)} disabled={!isLoggedIn} allowTransparent />
              </div>
            </div>

            <div className="h-px w-full bg-white/5" />

            {/* 2. Chat Bubble Colors */}
            <div>
              <h4 className="text-xs font-semibold mb-3 opacity-90">Warna Kotak Obrolan</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                <div className="space-y-3">
                  <div className="text-[11px] font-semibold tracking-wider text-emerald-400 uppercase">User</div>
                  <ColorInput label="Label Nama (Pill)" value={userPillColor} onChange={(v) => updateChatSetting(setUserPillColor, "global_user_pill_color", v)} disabled={!isLoggedIn} allowTransparent />
                  <ColorInput label="Latar Kotak Pesan" value={userBubbleBg} onChange={(v) => updateChatSetting(setUserBubbleBg, "global_user_bubble_bg", v)} disabled={!isLoggedIn} allowTransparent />
                </div>

                <div className="space-y-3">
                  <div className="text-[11px] font-semibold tracking-wider text-rose-400 uppercase">Admin</div>
                  <ColorInput label="Label Nama (Pill)" value={adminPillColor} onChange={(v) => updateChatSetting(setAdminPillColor, "global_admin_pill_color", v)} disabled={!isLoggedIn} allowTransparent />
                  <ColorInput label="Latar Kotak Pesan" value={adminBubbleBg} onChange={(v) => updateChatSetting(setAdminBubbleBg, "global_admin_bubble_bg", v)} disabled={!isLoggedIn} allowTransparent />
                </div>

              </div>
            </div>
          </div>

          {/* Locked State Overlay */}
          {!isLoggedIn && !loadingAuth && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[1px]">
              <div className="text-center p-6 rounded-2xl bg-[#111] border border-white/10 shadow-2xl max-w-sm w-full">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <span className="block w-4 h-4 rounded-sm border-2 border-neutral-400" />
                </div>
                <h4 className="text-sm font-semibold text-white mb-2">Akses Dibatasi</h4>
                <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                  Fitur racik warna lanjutan, transparansi antarmuka, dan gaya obrolan kustom eksklusif untuk pengguna terdaftar.
                </p>
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center px-4 py-2.5 text-xs font-semibold rounded-xl text-black bg-white hover:bg-neutral-200 transition-all active:scale-95"
                >
                  Masuk Sekarang
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* PRESET THEMES SECTION */}
        <div>
          <h3 className="font-semibold text-sm mb-4 px-1" style={{ color: "var(--foreground-heading)" }}>
            Preset Tema
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themes.map((t: ThemeItem) => {
              const isActive = activeThemeId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => setTheme(t.id as any)}
                  className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between gap-3 ${
                    isActive ? "shadow-md" : "hover:bg-white/5"
                  }`}
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: isActive ? "var(--accent)" : "var(--card-border)",
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.preview} shadow-inner border border-white/10 shrink-0`} />
                    <div className="min-w-0">
                      <h3 className="font-medium text-xs sm:text-sm truncate" style={{ color: "var(--foreground-heading)" }}>
                        {t.name}
                      </h3>
                    </div>
                  </div>

                  <div
                    className="w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-300 shrink-0"
                    style={{ borderColor: isActive ? "var(--accent)" : "var(--card-border)" }}
                  >
                    {isActive && (
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--accent)" }} />
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