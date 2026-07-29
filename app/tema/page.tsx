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

// Komponen Palet Warna Dinamis
const ColorInput = ({ 
  label, 
  value, 
  onChange, 
  disabled,
  allowTransparent,
  showHex 
}: { 
  label: string, 
  value: string, 
  onChange: (v: string) => void, 
  disabled: boolean,
  allowTransparent?: boolean,
  showHex?: boolean
}) => {
  const isTransparent = value === "transparent" || value === "";
  const hexColor = (isTransparent || !value) ? "#000000" : value.slice(0, 7);

  if (showHex) {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[10px] font-medium opacity-80" style={{ color: "var(--foreground)" }}>
            {label}
          </span>
          {allowTransparent && (
            <button onClick={() => onChange("transparent")} disabled={disabled} className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/15 transition-colors text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed">
              Transparan
            </button>
          )}
        </div>
        <div className="relative flex items-center gap-2 p-1.5 rounded-lg bg-black/10 border border-white/5 transition-all focus-within:border-white/30 hover:bg-black/20 shadow-sm">
          <div className="relative w-7 h-7 rounded-md overflow-hidden shrink-0 shadow-inner border border-white/10">
            {isTransparent && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30" />}
            <input type="color" value={hexColor} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`absolute -inset-2 w-12 h-12 cursor-pointer border-0 bg-transparent ${isTransparent ? 'opacity-0' : 'opacity-100'} disabled:cursor-not-allowed`} />
          </div>
          <input type="text" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} placeholder="Hex / trans" className="w-full min-w-0 text-[11px] font-mono bg-transparent border-none text-white focus:outline-none focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide placeholder-neutral-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between gap-1.5 w-full h-full">
      <span 
        className="text-[9px] leading-[1.2] text-center font-medium opacity-80 break-words w-full px-0.5 flex items-end justify-center min-h-[22px]" 
        style={{ color: "var(--foreground)" }}
      >
        {label}
      </span>
      
      <div 
        className={`relative w-8 h-8 rounded-lg overflow-hidden shadow-inner border border-white/10 transition-all shrink-0 ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:scale-110 hover:border-white/30 active:scale-95"
        }`}
      >
        {isTransparent && (
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 pointer-events-none" />
        )}
        <input 
          type="color" 
          value={hexColor}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`absolute -inset-4 w-[200%] h-[200%] border-0 bg-transparent ${
            isTransparent ? 'opacity-0' : 'opacity-100'
          } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
        />
      </div>
      
      <div className="h-[18px] flex items-start justify-center w-full">
        {allowTransparent && (
          <button
            onClick={() => onChange("transparent")}
            disabled={disabled}
            className="text-[7.5px] font-medium px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/15 transition-colors text-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Transparan
          </button>
        )}
      </div>
    </div>
  );
};

export default function TemaPage() {
  const { theme, setTheme, customColors, setCustomColors } = useTheme();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Status Toggle
  const [isCustomUiEnabled, setIsCustomUiEnabled] = useState<boolean>(false);
  const [isCustomChatEnabled, setIsCustomChatEnabled] = useState<boolean>(false);

  const [userPillColor, setUserPillColor] = useState<string>("#10b981");
  const [userBubbleBg, setUserBubbleBg] = useState<string>("");
  const [adminPillColor, setAdminPillColor] = useState<string>("#ef4444");
  const [adminBubbleBg, setAdminBubbleBg] = useState<string>("");
  const [isWaveDisabled, setIsWaveDisabled] = useState<boolean>(false);

  const [isApplied, setIsApplied] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Load initial states
    setIsCustomUiEnabled(localStorage.getItem("global_enable_custom_ui") === "true");
    setIsCustomChatEnabled(localStorage.getItem("global_enable_custom_chat") === "true");
    
    setUserPillColor(localStorage.getItem("global_user_pill_color") || "#10b981");
    setUserBubbleBg(localStorage.getItem("global_user_bubble_bg") || "");
    setAdminPillColor(localStorage.getItem("global_admin_pill_color") || "#ef4444");
    setAdminBubbleBg(localStorage.getItem("global_admin_bubble_bg") || "");
    setIsWaveDisabled(localStorage.getItem("global_disable_wave") === "true");

    const checkAuth = () => {
      try {
        const commonKeys = ["user", "username", "admin", "session", "token", "auth", "role", "sb-access-token", "supabase.auth.token"];
        let foundLogin = false;
        let foundAdmin = false;

        for (const key of commonKeys) {
          const val = localStorage.getItem(key);
          if (val && val !== "null" && val !== "undefined" && val !== "{}") {
            if (key !== "role" && key !== "admin") foundLogin = true;
            if (key === "admin" && val === "true") foundAdmin = true;
            if (key === "role" && val === "admin") foundAdmin = true;
            if (val.includes('"role":"admin"') || val.includes('"is_admin":true') || val.includes('"isAdmin":true')) foundAdmin = true;
          }
        }

        if (!foundLogin && typeof document !== "undefined" && document.cookie) {
          if (document.cookie.match(/(sb-|token|user|session)/)) foundLogin = true;
          if (document.cookie.includes("role=admin") || document.cookie.includes("admin=true")) foundAdmin = true;
        }

        setIsLoggedIn(foundLogin);
        setIsAdmin(foundAdmin);
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
  };

  const handleWaveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Karena toggle mewakili "Dengan Wave" (menyala), jika di-cek berarti wave aktif (tidak disable).
    // Jadi jika e.target.checked = true (wave nyala), isWaveDisabled = false.
    const isWaveEnabled = e.target.checked;
    const newVal = !isWaveEnabled; 
    
    setIsWaveDisabled(newVal);
    localStorage.setItem("global_disable_wave", newVal.toString());
    window.dispatchEvent(new Event("globalColorChanged"));
  };

  const handleApplyCustom = () => {
    localStorage.setItem("global_enable_custom_ui", isCustomUiEnabled.toString());
    localStorage.setItem("global_enable_custom_chat", isCustomChatEnabled.toString());
    localStorage.setItem("global_disable_wave", isWaveDisabled.toString());

    // Simpan atau Reset warna Pesan Obrolan berdasarkan Toggle
    if (isCustomChatEnabled) {
      localStorage.setItem("global_user_pill_color", userPillColor);
      localStorage.setItem("global_user_bubble_bg", userBubbleBg);
      localStorage.setItem("global_admin_pill_color", adminPillColor);
      localStorage.setItem("global_admin_bubble_bg", adminBubbleBg);
    } else {
      localStorage.removeItem("global_user_pill_color");
      localStorage.removeItem("global_user_bubble_bg");
      localStorage.removeItem("global_admin_pill_color");
      localStorage.removeItem("global_admin_bubble_bg");
    }
    
    // Terapkan Warna UI Custom jika diaktifkan, jika tidak kembalikan ke standar/dark
    if (isCustomUiEnabled) {
      setTheme("custom");
    } else if (theme === "custom") {
      setTheme("dark");
    }

    window.dispatchEvent(new Event("globalColorChanged"));

    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 2000);
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
      
      <div className="sticky top-0 z-20 p-4 sm:p-5 backdrop-blur-xl border-b transition-colors duration-300 bg-[color-mix(in_srgb,var(--background)_80%,transparent)] border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
            Pengaturan Tema
          </h1>
          {isAdmin && <span className="text-[9px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold">MODE ADMIN</span>}
        </div>
        <p className="text-[11px] sm:text-xs mt-1 opacity-80" style={{ color: "var(--foreground)" }}>
          Personalisasi antarmuka dan warna obrolan sesuai preferensi Anda.
        </p>
      </div>

      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-6 sm:space-y-8">
        
        <div 
          className="relative rounded-xl border transition-all duration-300 overflow-hidden shadow-sm"
          style={{ 
            backgroundColor: "var(--card-bg)", 
            borderColor: activeThemeId === "custom" ? "var(--accent)" : "var(--card-border)"
          }}
        >
          <div className="p-4 sm:p-5 border-b border-white/5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs sm:text-sm" style={{ color: "var(--foreground-heading)" }}>
                Kustomisasi Lanjutan
              </h3>
              {!loadingAuth && (
                <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-md font-medium tracking-wide ${
                  isLoggedIn ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                }`}>
                  {isLoggedIn ? "Terbuka" : "Terkunci"}
                </span>
              )}
            </div>
            
            <div className="text-[10px] font-medium opacity-70">
              {activeThemeId === "custom" ? "✨ Sedang Digunakan" : "Pilih warna, lalu terapkan"}
            </div>
          </div>

          <div className={`p-4 sm:p-5 space-y-6 ${!isLoggedIn && !loadingAuth ? "opacity-30 pointer-events-none blur-[2px] select-none" : ""}`}>
            
            {/* --- SEKSI WARNA UI --- */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h4 className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Warna UI</h4>
                
                <label className="flex items-center gap-2 cursor-pointer group">
                  <span className={`text-[9px] font-medium transition-colors ${isCustomUiEnabled ? "text-[var(--accent)]" : "text-neutral-400 group-hover:text-white"}`}>
                    {isCustomUiEnabled ? "Aktif" : "Bawaan Tema"}
                  </span>
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={isCustomUiEnabled} onChange={(e) => setIsCustomUiEnabled(e.target.checked)} disabled={!isLoggedIn} className="sr-only peer" />
                    <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-md peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-sm after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--accent)] disabled:opacity-50 border border-white/10"></div>
                  </div>
                </label>
              </div>

              <div className={`transition-all duration-300 ${!isCustomUiEnabled ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                <div className={isAdmin ? "grid grid-cols-2 gap-3" : "grid grid-cols-3 gap-1.5"}>
                  <ColorInput label="Latar Belakang" value={customColors.bg} onChange={(v) => handleCustomColorChange("bg", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} />
                  <ColorInput label="Warna Aksen" value={customColors.accent} onChange={(v) => handleCustomColorChange("accent", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} />
                  <div className={isAdmin ? "col-span-2 sm:col-span-1" : "col-span-1"}>
                    <ColorInput label="Warna Teks" value={customColors.text} onChange={(v) => handleCustomColorChange("text", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} />
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-white/5" />

            {/* --- SEKSI WARNA PESAN OBROLAN --- */}
            <div>
              <div className="flex items-center justify-between mb-4 px-1">
                <h4 className="text-[11px] font-semibold opacity-80 uppercase tracking-wider text-center sm:text-left">Warna Pesan Obrolan</h4>
                
                <label className="flex items-center gap-2 cursor-pointer group">
                  <span className={`text-[9px] font-medium transition-colors ${isCustomChatEnabled ? "text-[var(--accent)]" : "text-neutral-400 group-hover:text-white"}`}>
                    {isCustomChatEnabled ? "Aktif" : "Bawaan Tema"}
                  </span>
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={isCustomChatEnabled} onChange={(e) => setIsCustomChatEnabled(e.target.checked)} disabled={!isLoggedIn} className="sr-only peer" />
                    <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-md peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-sm after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--accent)] disabled:opacity-50 border border-white/10"></div>
                  </div>
                </label>
              </div>

              <div className={`transition-all duration-300 ${!isCustomChatEnabled ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                <div className="grid grid-cols-2 gap-x-2 gap-y-4">
                  <div>
                    <div className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase border-b border-white/5 pb-1.5 mb-3 text-center sm:text-left">Pesan User</div>
                    <div className={isAdmin ? "space-y-3" : "flex justify-evenly gap-1"}>
                      <ColorInput label="Label Nama" value={userPillColor} onChange={setUserPillColor} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent showHex={isAdmin} />
                      <ColorInput label="Kotak Pesan" value={userBubbleBg} onChange={setUserBubbleBg} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent showHex={isAdmin} />
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-semibold tracking-wider text-rose-400 uppercase border-b border-white/5 pb-1.5 mb-3 text-center sm:text-left">Pesan Admin</div>
                    <div className={isAdmin ? "space-y-3" : "flex justify-evenly gap-1"}>
                      <ColorInput label="Label Nama" value={adminPillColor} onChange={setAdminPillColor} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent showHex={isAdmin} />
                      <ColorInput label="Kotak Pesan" value={adminBubbleBg} onChange={setAdminBubbleBg} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent showHex={isAdmin} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-white/5" />

            {/* --- SEKSI ANIMASI WAVE --- */}
            <div>
              <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
                <h4 className="text-[11px] font-semibold opacity-80 uppercase tracking-wider">Animasi Wave</h4>
                
                {/* Toggle Dinamis: Dengan Wave / Tanpa Wave */}
                <label className="flex items-center gap-2 cursor-pointer group">
                  <span className={`text-[9px] font-medium transition-colors ${!isWaveDisabled ? "text-[var(--accent)]" : "text-neutral-400 group-hover:text-white"}`}>
                    {!isWaveDisabled ? "Dengan Wave" : "Tanpa Wave"}
                  </span>
                  <div className="relative flex items-center">
                    {/* Checkbox bernilai TRUE jika wave aktif (!isWaveDisabled) */}
                    <input type="checkbox" checked={!isWaveDisabled} onChange={handleWaveToggle} disabled={!isLoggedIn} className="sr-only peer" />
                    <div className="w-8 h-4 bg-white/10 peer-focus:outline-none rounded-md peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 peer-checked:after:bg-white after:border-gray-300 after:border after:rounded-sm after:h-3 after:w-3 after:transition-all peer-checked:bg-[var(--accent)] disabled:opacity-50 border border-white/10"></div>
                  </div>
                </label>
              </div>

              <div className={`transition-all duration-300 ${(isWaveDisabled || !isCustomUiEnabled) ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                <div className={isAdmin ? "grid grid-cols-2 gap-3" : "grid grid-cols-3 gap-1.5"}>
                  <ColorInput label="Wave Belakang" value={customColors.wave1} onChange={(v) => handleCustomColorChange("wave1", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} />
                  <ColorInput label="Wave Tengah" value={customColors.wave2} onChange={(v) => handleCustomColorChange("wave2", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} />
                  <div className={isAdmin ? "col-span-2 sm:col-span-1" : "col-span-1"}>
                    <ColorInput label="Wave Depan" value={customColors.wave3} onChange={(v) => handleCustomColorChange("wave3", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-white/5">
              <button
                disabled={!isLoggedIn}
                onClick={handleApplyCustom}
                className={`w-full py-3 rounded-lg font-bold text-[11px] sm:text-xs transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  isApplied
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "bg-[var(--accent)] text-[var(--background)] hover:opacity-90 shadow-md"
                }`}
              >
                {isApplied ? "✓ Kustomisasi Diterapkan" : "Terapkan Kustomisasi"}
              </button>
            </div>

          </div>

          {!isLoggedIn && !loadingAuth && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/40 backdrop-blur-[1px]">
              <div className="text-center p-5 rounded-xl bg-[#111] border border-white/10 shadow-2xl max-w-[280px] w-full">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mx-auto mb-3 border border-white/10">
                  <span className="block w-3.5 h-3.5 rounded-sm border-2 border-neutral-400" />
                </div>
                <h4 className="text-xs font-semibold text-white mb-2">Akses Dibatasi</h4>
                <p className="text-[10px] text-neutral-400 mb-4 leading-relaxed">
                  Fitur racik warna lanjutan dan kustomisasi kotak obrolan eksklusif untuk member terdaftar.
                </p>
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center px-4 py-2 text-[11px] font-semibold rounded-lg text-black bg-white hover:bg-neutral-200 transition-all active:scale-95"
                >
                  Masuk Sekarang
                </Link>
              </div>
            </div>
          )}
        </div>

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
                  className={`p-2.5 rounded-lg border transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
                    isActive ? "shadow-md bg-white/5" : "hover:bg-white/5"
                  }`}
                  style={{
                    backgroundColor: isActive ? "transparent" : "var(--card-bg)",
                    borderColor: isActive ? "var(--accent)" : "var(--card-border)",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${t.preview} shadow-inner border border-white/10 shrink-0`} />
                    <div className="min-w-0">
                      <h3 className="font-medium text-[11px] sm:text-xs truncate" style={{ color: "var(--foreground-heading)" }}>
                        {t.name}
                      </h3>
                    </div>
                  </div>

                  <div
                    className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-all duration-300 shrink-0"
                    style={{ borderColor: isActive ? "var(--accent)" : "var(--card-border)" }}
                  >
                    {isActive && (
                      <div className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: "var(--accent)" }} />
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