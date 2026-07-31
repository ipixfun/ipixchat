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

// Toggle Komponen - Dibuat Lebih Besar & Lebih Dinamis
const CompactToggle = ({ 
  label, checked, onChange, disabled, activeColor = "bg-[var(--accent)]", activeText = "text-[var(--accent)]" 
}: { 
  label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled: boolean; activeColor?: string; activeText?: string;
}) => (
  <label className={`flex items-center gap-2 cursor-pointer group select-none ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
    <span className={`text-[10px] sm:text-xs font-bold transition-all duration-300 ${checked ? `${activeText} scale-105 drop-shadow-[0_0_6px_rgba(255,255,255,0.3)]` : "text-neutral-400 group-hover:text-neutral-200"}`}>
      {label}
    </span>
    <div className="relative flex items-center">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
      <div className={`w-9 h-5 sm:w-10 sm:h-5.5 rounded-full border transition-all duration-300 shadow-inner relative flex items-center ${
        checked 
          ? `${activeColor} border-[var(--accent)] shadow-[0_0_12px_rgba(255,255,255,0.25)] scale-105` 
          : "bg-black/40 border-white/10 group-hover:border-white/20"
      }`}>
        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full transition-all duration-300 shadow-md ${
          checked 
            ? "translate-x-4.5 sm:translate-x-5 bg-white scale-110" 
            : "translate-x-0.5 bg-neutral-400"
        }`} />
      </div>
    </div>
  </label>
);

const ColorInput = ({ 
  label, value, onChange, disabled, allowTransparent, showHex, horizontal = false
}: { 
  label: string, value: string, onChange: (v: string) => void, disabled: boolean, allowTransparent?: boolean, showHex?: boolean, horizontal?: boolean
}) => {
  const isTransparent = value === "transparent" || value === "";
  const hexColor = (isTransparent || !value) ? "#000000" : value.slice(0, 7);

  const handleTransparentToggle = (checked: boolean) => {
    if (checked) {
      onChange("transparent");
    } else {
      onChange(hexColor === "#000000" ? "#ffffff" : hexColor);
    }
  };

  if (horizontal) {
    return (
      <div className="flex items-center justify-between bg-black/10 dark:bg-white/5 p-2 rounded-lg border border-white/5 w-full shadow-sm gap-2 hover:border-white/10 transition-colors">
        <span className="text-[10px] sm:text-[11px] font-bold leading-tight opacity-90 truncate shrink-0 w-28 text-[var(--foreground)]">
          {label}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {showHex && (
            <input 
              type="text" 
              value={isTransparent ? "trans" : value} 
              onChange={(e) => onChange(e.target.value)} 
              disabled={disabled || isTransparent}
              className="w-14 text-center text-[9.5px] font-mono bg-black/20 dark:bg-white/10 border border-white/10 rounded-md px-1 py-1 focus:outline-none focus:border-[var(--accent)]"
            />
          )}
          <div className={`relative w-7 h-7 rounded-md overflow-hidden border border-white/10 shadow-inner transition-transform ${disabled || isTransparent ? "opacity-50 cursor-not-allowed" : "hover:scale-110 cursor-pointer"}`}>
            {isTransparent && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 pointer-events-none" />}
            <input 
              type="color" 
              value={hexColor}
              onChange={(e) => { if(!isTransparent) onChange(e.target.value) }}
              disabled={disabled || isTransparent}
              className={`absolute -inset-2 w-12 h-12 border-0 bg-transparent ${isTransparent ? 'opacity-0' : 'opacity-100'} ${disabled || isTransparent ? "cursor-not-allowed" : "cursor-pointer"}`}
            />
          </div>

          {allowTransparent && (
            <label className="flex items-center gap-1.5 cursor-pointer group pl-2 border-l border-white/10" title="Atur Transparan">
              <div className="relative flex items-center shrink-0">
                <input type="checkbox" checked={isTransparent} onChange={(e) => handleTransparentToggle(e.target.checked)} disabled={disabled} className="sr-only peer" />
                <div className="w-7 h-3.5 bg-black/30 dark:bg-white/10 rounded-full peer-checked:bg-[var(--accent)] transition-colors after:content-[''] after:absolute after:top-[1.5px] after:left-[1.5px] after:bg-neutral-400 peer-checked:after:bg-white after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:after:translate-x-3.5 disabled:opacity-50 border border-white/10 shadow-inner"></div>
              </div>
              <span className={`text-[9px] font-bold tracking-wide transition-colors ${isTransparent ? 'text-[var(--accent)]' : 'text-neutral-500 group-hover:text-[var(--foreground)]'}`}>
                Transparan
              </span>
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between bg-black/10 dark:bg-white/5 p-2 rounded-lg border border-white/5 gap-1.5 w-full h-full shadow-sm">
      <span className="text-[9px] sm:text-[10px] font-bold text-center leading-tight truncate w-full opacity-90 text-[var(--foreground)]">
        {label}
      </span>
      <div className={`relative w-8 h-8 rounded-md overflow-hidden border border-white/10 shadow-inner shrink-0 transition-transform ${disabled ? "opacity-50" : "hover:scale-110 cursor-pointer"}`}>
        {isTransparent && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 pointer-events-none" />}
        <input type="color" value={hexColor} onChange={(e) => { if(!isTransparent) onChange(e.target.value) }} disabled={disabled || isTransparent} className={`absolute -inset-2 w-12 h-12 border-0 bg-transparent ${isTransparent ? 'opacity-0' : 'opacity-100'} ${disabled || isTransparent ? "cursor-not-allowed" : "cursor-pointer"}`} />
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

  // Review State (DRAFT) - Tidak langsung merubah global sebelum Terapkan diklik
  const [draftCustomColors, setDraftCustomColors] = useState<{ bg: string; accent: string; text: string; wave1: string; wave2: string; wave3: string }>({
    bg: "#121212",
    accent: "#10b981",
    text: "#ffffff",
    wave1: "#059669",
    wave2: "#10b981",
    wave3: "#34d399",
  });

  const [isCustomUiEnabled, setIsCustomUiEnabled] = useState<boolean>(false);
  const [isCustomChatEnabled, setIsCustomChatEnabled] = useState<boolean>(false);

  const [userPillColor, setUserPillColor] = useState<string>("#10b981");
  const [userBubbleBg, setUserBubbleBg] = useState<string>("");
  const [adminPillColor, setAdminPillColor] = useState<string>("#ef4444");
  const [adminBubbleBg, setAdminBubbleBg] = useState<string>("");
  
  const [isWaveDisabled, setIsWaveDisabled] = useState<boolean>(false);
  const [isCustomWaveEnabled, setIsCustomWaveEnabled] = useState<boolean>(false);

  // Collapse / Minimize States
  const [isThemeCollapsed, setIsThemeCollapsed] = useState<boolean>(true);
  const [isWaveCollapsed, setIsWaveCollapsed] = useState<boolean>(true);
  const [isChatCollapsed, setIsChatCollapsed] = useState<boolean>(true);

  const [isApplied, setIsApplied] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    
    setIsCustomUiEnabled(localStorage.getItem("global_enable_custom_ui") === "true");
    setIsCustomChatEnabled(localStorage.getItem("global_enable_custom_chat") === "true");
    setIsCustomWaveEnabled(localStorage.getItem("global_enable_custom_wave") === "true");
    
    setUserPillColor(localStorage.getItem("global_user_pill_color") || "#10b981");
    setUserBubbleBg(localStorage.getItem("global_user_bubble_bg") || "");
    setAdminPillColor(localStorage.getItem("global_admin_pill_color") || "#ef4444");
    setAdminBubbleBg(localStorage.getItem("global_admin_bubble_bg") || "");
    setIsWaveDisabled(localStorage.getItem("global_disable_wave") === "true");

    if (customColors) {
      setDraftCustomColors(customColors);
    }

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

        setIsLoggedIn(foundLogin);
        setIsAdmin(foundAdmin);

        if (!foundLogin) {
          setIsThemeCollapsed(true);
          setIsWaveCollapsed(true);
          setIsChatCollapsed(true);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoadingAuth(false);
      }
    };

    checkAuth();
  }, [customColors]);

  const activeThemeId = isMounted ? theme : "dark";

  const handleCustomColorChange = (key: string, value: string) => {
    setDraftCustomColors((prev) => ({ ...prev, [key]: value }));
  };

  const handleWaveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isWaveEnabled = e.target.checked;
    setIsWaveDisabled(!isWaveEnabled);
  };

  const handleCustomWaveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomWaveEnabled(e.target.checked);
  };

  // Logika Eksekusi Terapkan Tema (Hanya berjalan ketika tombol diklik)
  const handleApplyCustom = () => {
    localStorage.setItem("global_enable_custom_ui", isCustomUiEnabled.toString());
    localStorage.setItem("global_enable_custom_chat", isCustomChatEnabled.toString());
    localStorage.setItem("global_disable_wave", isWaveDisabled.toString());
    localStorage.setItem("global_enable_custom_wave", isCustomWaveEnabled.toString());

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
    
    // Terapkan custom colors draft ke konteks global
    setCustomColors(draftCustomColors);

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
      
      <div className="sticky top-0 z-20 p-3 sm:p-4 backdrop-blur-xl border-b transition-colors duration-300 bg-[color-mix(in_srgb,var(--background)_80%,transparent)] border-[var(--card-border)]">
        <div className="flex items-center justify-between">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight" style={{ color: "var(--accent)" }}>
            Pengaturan Tema
          </h1>
          {isAdmin && <span className="text-[9px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold tracking-widest">ADMIN</span>}
        </div>
      </div>

      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-5">
        
        <div 
          className="relative rounded-xl border transition-all duration-300 overflow-hidden shadow-sm"
          style={{ backgroundColor: "var(--card-bg)", borderColor: activeThemeId === "custom" ? "var(--accent)" : "var(--card-border)" }}
        >
          <div className="p-3 border-b border-white/5 flex flex-wrap items-center justify-between gap-2 bg-black/10 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs sm:text-sm" style={{ color: "var(--foreground-heading)" }}>
                Kustomisasi Lanjutan
              </h3>
              {!loadingAuth && (
                <span className={`text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-[4px] font-bold tracking-wide uppercase ${
                  isLoggedIn ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                }`}>
                  {isLoggedIn ? "Terbuka" : "Terkunci"}
                </span>
              )}
            </div>
            <span className="text-[9px] font-medium opacity-60 italic">Mode Pratinjau (Belum Diterapkan)</span>
          </div>

          <div className={`p-3 sm:p-4 flex flex-col gap-4 ${!isLoggedIn && !loadingAuth ? "opacity-30 pointer-events-none blur-[2px] select-none" : ""}`}>
            
            {/* BAGIAN 1: WARNA TEMA */}
            <div className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-2.5 sm:p-3">
              <div 
                className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-white/5"
                onClick={() => setIsThemeCollapsed(!isThemeCollapsed)}
              >
                <div className="flex items-center justify-between w-full pr-3">
                  <h4 className={`text-[10px] sm:text-[11px] uppercase tracking-widest transition-all duration-300 ${
                    isCustomUiEnabled 
                      ? "text-[var(--accent)] font-black drop-shadow-[0_0_8px_var(--accent)]" 
                      : "text-neutral-500 opacity-50 font-extrabold"
                  }`}>
                    WARNA TEMA
                  </h4>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CompactToggle label={isCustomUiEnabled ? "Aktif" : "Bawaan"} checked={isCustomUiEnabled} onChange={(e) => setIsCustomUiEnabled(e.target.checked)} disabled={!isLoggedIn} />
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-mono">{isThemeCollapsed ? "▼" : "▲"}</span>
              </div>

              {!isThemeCollapsed && (
                <div className={`pt-3 transition-all duration-300 ${!isCustomUiEnabled ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                  <div className="flex flex-col gap-2">
                    <ColorInput label="Latar" value={draftCustomColors.bg} onChange={(v) => handleCustomColorChange("bg", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} horizontal />
                    <ColorInput label="Aksen" value={draftCustomColors.accent} onChange={(v) => handleCustomColorChange("accent", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} horizontal />
                    <ColorInput label="Teks Utama" value={draftCustomColors.text} onChange={(v) => handleCustomColorChange("text", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} horizontal />
                  </div>
                </div>
              )}
            </div>

            {/* BAGIAN 2: GELEMBUNG CHAT */}
            <div className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-2.5 sm:p-3">
              <div 
                className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-white/5"
                onClick={() => setIsChatCollapsed(!isChatCollapsed)}
              >
                <div className="flex items-center justify-between w-full pr-3">
                  <h4 className={`text-[10px] sm:text-[11px] uppercase tracking-widest transition-all duration-300 ${
                    isCustomChatEnabled 
                      ? "text-emerald-400 font-black drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" 
                      : "text-neutral-500 opacity-50 font-extrabold"
                  }`}>
                    GELEMBUNG CHAT
                  </h4>
                  <div onClick={(e) => e.stopPropagation()}>
                    <CompactToggle label={isCustomChatEnabled ? "Aktif" : "Bawaan"} checked={isCustomChatEnabled} onChange={(e) => setIsCustomChatEnabled(e.target.checked)} disabled={!isLoggedIn} />
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-mono">{isChatCollapsed ? "▼" : "▲"}</span>
              </div>

              {!isChatCollapsed && (
                <div className={`pt-3 transition-all duration-300 grid grid-cols-1 sm:grid-cols-2 gap-3 ${!isCustomChatEnabled ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                  
                  <div className="bg-black/10 dark:bg-white/5 border border-white/5 rounded-xl p-2.5 shadow-inner flex flex-col gap-2.5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <div className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">User</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <ColorInput label="Nama & Outline Box" value={userPillColor} onChange={setUserPillColor} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                      <ColorInput label="Background Box" value={userBubbleBg} onChange={setUserBubbleBg} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                    </div>
                  </div>
                  
                  <div className="bg-black/10 dark:bg-white/5 border border-white/5 rounded-xl p-2.5 shadow-inner flex flex-col gap-2.5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                      <div className="text-[10px] font-extrabold tracking-widest text-rose-400 uppercase">Admin</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <ColorInput label="Nama & Outline Box" value={adminPillColor} onChange={setAdminPillColor} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                      <ColorInput label="Background Box" value={adminBubbleBg} onChange={setAdminBubbleBg} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* BAGIAN 3: WAVE */}
            <div className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-2.5 sm:p-3">
              <div 
                className="flex items-center justify-between cursor-pointer select-none pb-2 border-b border-white/5"
                onClick={() => setIsWaveCollapsed(!isWaveCollapsed)}
              >
                <div className="flex items-center justify-between w-full pr-3 flex-wrap gap-2">
                  <h4 className={`text-[10px] sm:text-[11px] uppercase tracking-widest transition-all duration-500 ${
                    !isWaveDisabled 
                      ? "bg-gradient-to-r from-teal-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent font-black animate-pulse drop-shadow-[0_0_8px_rgba(45,212,191,0.6)]" 
                      : "text-neutral-500 opacity-50 font-extrabold"
                  }`}>
                    WAVE
                  </h4>
                  <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <CompactToggle label={!isWaveDisabled ? "Tampilkan" : "Sembunyikan"} checked={!isWaveDisabled} onChange={handleWaveToggle} disabled={!isLoggedIn} />
                    <CompactToggle label={isCustomWaveEnabled ? "Warna Aktif" : "Bawaan"} checked={isCustomWaveEnabled} onChange={handleCustomWaveToggle} disabled={!isLoggedIn || isWaveDisabled} />
                  </div>
                </div>
                <span className="text-xs text-neutral-400 font-mono">{isWaveCollapsed ? "▼" : "▲"}</span>
              </div>

              {!isWaveCollapsed && (
                <div className={`pt-3 transition-all duration-300 ${(isWaveDisabled || !isCustomWaveEnabled) ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                  <div className="flex flex-col gap-2">
                    <ColorInput label="Belakang" value={draftCustomColors.wave1} onChange={(v) => handleCustomColorChange("wave1", v)} disabled={!isLoggedIn || isWaveDisabled || !isCustomWaveEnabled} showHex={isAdmin} horizontal />
                    <ColorInput label="Tengah" value={draftCustomColors.wave2} onChange={(v) => handleCustomColorChange("wave2", v)} disabled={!isLoggedIn || isWaveDisabled || !isCustomWaveEnabled} showHex={isAdmin} horizontal />
                    <ColorInput label="Depan" value={draftCustomColors.wave3} onChange={(v) => handleCustomColorChange("wave3", v)} disabled={!isLoggedIn || isWaveDisabled || !isCustomWaveEnabled} showHex={isAdmin} horizontal />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 mt-2 border-t border-white/5">
              <button
                disabled={!isLoggedIn}
                onClick={handleApplyCustom}
                className={`w-full py-3 rounded-lg font-bold text-[11px] sm:text-xs transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide ${
                  isApplied
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[0.99]"
                    : "bg-[var(--accent)] text-[var(--background)] hover:opacity-90 shadow-md hover:shadow-lg"
                }`}
              >
                {isApplied ? "✓ Tema Berhasil Diterapkan" : "Terapkan Tema"}
              </button>
            </div>

          </div>

          {!isLoggedIn && !loadingAuth && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]">
              <div className="text-center p-5 rounded-2xl bg-[#111] border border-white/10 shadow-2xl max-w-[280px] w-full">
                <h4 className="text-xs font-bold text-white mb-2">Akses Dibatasi</h4>
                <p className="text-[10px] text-neutral-400 mb-4 leading-relaxed">
                  Fitur racik warna lanjutan ini eksklusif hanya untuk member yang telah terdaftar.
                </p>
                <Link
                  href="/"
                  className="inline-flex w-full items-center justify-center px-4 py-2.5 text-[11px] font-bold rounded-lg text-black bg-white hover:bg-neutral-200 transition-all active:scale-95 shadow-md"
                >
                  Masuk Sekarang
                </Link>
              </div>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold text-[13px] mb-3 px-1" style={{ color: "var(--foreground-heading)" }}>
            Preset Tema Cepat
          </h3>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {themes.map((t: ThemeItem) => {
              const isActive = activeThemeId === t.id;

              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id as any);
                    setIsThemeCollapsed(true);
                    setIsChatCollapsed(true);
                    setIsWaveCollapsed(true);
                  }}
                  className={`p-2.5 rounded-lg border transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
                    isActive ? "shadow-sm bg-white/5" : "hover:bg-white/5 hover:border-white/20"
                  }`}
                  style={{
                    backgroundColor: isActive ? "transparent" : "var(--card-bg)",
                    borderColor: isActive ? "var(--accent)" : "var(--card-border)",
                  }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-md bg-gradient-to-br ${t.preview} shadow-inner border border-white/10 shrink-0`} />
                    <div className="min-w-0">
                      <h3 className="font-bold text-[10px] sm:text-[11px] truncate opacity-90" style={{ color: "var(--foreground-heading)" }}>
                        {t.name}
                      </h3>
                    </div>
                  </div>

                  <div
                    className="w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-all duration-300 shrink-0 shadow-sm"
                    style={{ borderColor: isActive ? "var(--accent)" : "var(--card-border)" }}
                  >
                    {isActive && (
                      <div className="w-1.5 h-1.5 rounded-[1px]" style={{ backgroundColor: "var(--accent)" }} />
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