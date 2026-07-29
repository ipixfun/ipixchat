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

const CompactToggle = ({ 
  label, checked, onChange, disabled, activeColor = "bg-[var(--accent)]", activeText = "text-[var(--accent)]" 
}: { 
  label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled: boolean; activeColor?: string; activeText?: string;
}) => (
  <label className="flex items-center gap-1 cursor-pointer group">
    <span className={`text-[8.5px] font-bold transition-colors ${checked ? activeText : "text-neutral-400 group-hover:text-white"}`}>
      {label}
    </span>
    <div className="relative flex items-center">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
      <div className={`w-5 h-2.5 bg-black/20 dark:bg-white/10 rounded-[4px] peer-focus:outline-none peer peer-checked:after:translate-x-[10px] after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-neutral-400 peer-checked:after:bg-white after:rounded-sm after:h-2 after:w-2 after:transition-all ${checked ? activeColor : ''} disabled:opacity-50 border border-white/10 shadow-inner`}></div>
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
      <div className="flex items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-white/5 w-full shadow-sm gap-2">
        <span className="text-[10px] font-bold leading-tight opacity-90 truncate shrink-0 w-12" style={{ color: "var(--foreground)" }}>
          {label}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {showHex && (
            <input 
              type="text" 
              value={isTransparent ? "trans" : value} 
              onChange={(e) => onChange(e.target.value)} 
              disabled={disabled || isTransparent}
              className="w-12 text-center text-[9px] font-mono bg-black/10 dark:bg-white/10 border border-white/5 rounded-[4px] px-1 py-1 focus:outline-none focus:border-[var(--accent)]"
            />
          )}
          <div className={`relative w-7 h-7 rounded-md overflow-hidden border border-white/10 shadow-inner transition-transform ${disabled || isTransparent ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}>
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
            <label className="flex items-center gap-1 cursor-pointer group pl-1.5 border-l border-white/10" title="Atur Transparan">
              <div className="relative flex items-center shrink-0">
                <input type="checkbox" checked={isTransparent} onChange={(e) => handleTransparentToggle(e.target.checked)} disabled={disabled} className="sr-only peer" />
                <div className="w-5 h-2.5 bg-black/20 dark:bg-white/10 rounded-[4px] peer-checked:bg-[var(--accent)] transition-colors after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-neutral-400 peer-checked:after:bg-white after:rounded-sm after:h-2 after:w-2 after:transition-all peer-checked:after:translate-x-[10px] disabled:opacity-50 border border-white/5 shadow-inner"></div>
              </div>
              <span className={`text-[8px] font-bold tracking-wide transition-colors ${isTransparent ? 'text-[var(--accent)]' : 'text-neutral-500 group-hover:text-[var(--foreground)]'}`}>
                Transparan
              </span>
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-between bg-black/5 dark:bg-white/5 p-2 rounded-lg border border-white/5 gap-1.5 w-full h-full shadow-sm">
      <span className="text-[9px] font-bold text-center leading-tight truncate w-full opacity-90" style={{ color: "var(--foreground)" }}>
        {label}
      </span>
      <div className={`relative w-8 h-8 rounded-md overflow-hidden border border-white/10 shadow-inner shrink-0 transition-transform ${disabled ? "opacity-50" : "hover:scale-105"}`}>
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

  const [isCustomUiEnabled, setIsCustomUiEnabled] = useState<boolean>(false);
  const [isCustomChatEnabled, setIsCustomChatEnabled] = useState<boolean>(false);

  const [userPillColor, setUserPillColor] = useState<string>("#10b981");
  const [userBubbleBg, setUserBubbleBg] = useState<string>("");
  const [adminPillColor, setAdminPillColor] = useState<string>("#ef4444");
  const [adminBubbleBg, setAdminBubbleBg] = useState<string>("");
  
  const [isWaveDisabled, setIsWaveDisabled] = useState<boolean>(false);
  const [isCustomWaveEnabled, setIsCustomWaveEnabled] = useState<boolean>(false);

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
    const isWaveEnabled = e.target.checked;
    const newVal = !isWaveEnabled; 
    
    setIsWaveDisabled(newVal);
    localStorage.setItem("global_disable_wave", newVal.toString());
    window.dispatchEvent(new Event("globalColorChanged"));
  };

  const handleCustomWaveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsCustomWaveEnabled(checked);
    localStorage.setItem("global_enable_custom_wave", checked.toString());
    window.dispatchEvent(new Event("globalColorChanged"));
  };

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
          </div>

          <div className={`p-3 sm:p-4 flex flex-col gap-4 ${!isLoggedIn && !loadingAuth ? "opacity-30 pointer-events-none blur-[2px] select-none" : ""}`}>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              
              <div className="pr-0 sm:pr-2 sm:border-r transition-colors duration-300 flex flex-col" style={{ borderColor: "var(--card-border)" }}>
                <div className="flex flex-col mb-3 border-b border-white/5 pb-2 gap-1">
                  <h4 className="text-[10px] sm:text-[11px] font-extrabold opacity-90 uppercase tracking-widest text-[var(--foreground)]">WARNA TEMA</h4>
                  <div className="self-start">
                    <CompactToggle label={isCustomUiEnabled ? "Aktif" : "Bawaan"} checked={isCustomUiEnabled} onChange={(e) => setIsCustomUiEnabled(e.target.checked)} disabled={!isLoggedIn} />
                  </div>
                </div>
                
                <div className={`flex-1 transition-all duration-300 ${!isCustomUiEnabled ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                  <div className="flex flex-col gap-2">
                    <ColorInput label="Latar" value={customColors.bg} onChange={(v) => handleCustomColorChange("bg", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} horizontal />
                    <ColorInput label="Aksen" value={customColors.accent} onChange={(v) => handleCustomColorChange("accent", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} horizontal />
                    <ColorInput label="Teks Utama" value={customColors.text} onChange={(v) => handleCustomColorChange("text", v)} disabled={!isLoggedIn || !isCustomUiEnabled} showHex={isAdmin} horizontal />
                  </div>
                </div>
              </div>

              <div className="pl-0 sm:pl-2 flex flex-col">
                <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2 gap-1 flex-wrap">
                  <h4 className="text-[10px] sm:text-[11px] font-extrabold opacity-90 uppercase tracking-widest text-[var(--foreground)]">WAVE</h4>
                  <div className="flex items-center gap-2">
                    <CompactToggle label={!isWaveDisabled ? "Tampil" : "Sembunyi"} checked={!isWaveDisabled} onChange={handleWaveToggle} disabled={!isLoggedIn} />
                    <CompactToggle label={isCustomWaveEnabled ? "Aktif" : "Bawaan"} checked={isCustomWaveEnabled} onChange={handleCustomWaveToggle} disabled={!isLoggedIn || isWaveDisabled} />
                  </div>
                </div>

                <div className={`flex-1 transition-all duration-300 ${(isWaveDisabled || !isCustomWaveEnabled) ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                  <div className="flex flex-col gap-2">
                    <ColorInput label="Belakang" value={customColors.wave1} onChange={(v) => handleCustomColorChange("wave1", v)} disabled={!isLoggedIn || isWaveDisabled || !isCustomWaveEnabled} showHex={isAdmin} horizontal />
                    <ColorInput label="Tengah" value={customColors.wave2} onChange={(v) => handleCustomColorChange("wave2", v)} disabled={!isLoggedIn || isWaveDisabled || !isCustomWaveEnabled} showHex={isAdmin} horizontal />
                    <ColorInput label="Depan" value={customColors.wave3} onChange={(v) => handleCustomColorChange("wave3", v)} disabled={!isLoggedIn || isWaveDisabled || !isCustomWaveEnabled} showHex={isAdmin} horizontal />
                  </div>
                </div>
              </div>

            </div>

            <div className="h-px w-full transition-colors duration-300 opacity-50 my-1" style={{ backgroundColor: "var(--card-border)" }} />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[10px] sm:text-[11px] font-extrabold opacity-90 uppercase tracking-widest text-[var(--foreground)]">WARNA GELEMBUNG CHAT</h4>
                <CompactToggle label={isCustomChatEnabled ? "Aktif" : "Bawaan"} checked={isCustomChatEnabled} onChange={(e) => setIsCustomChatEnabled(e.target.checked)} disabled={!isLoggedIn} />
              </div>
              
              <div className={`transition-all duration-300 grid grid-cols-1 sm:grid-cols-2 gap-3 ${!isCustomChatEnabled ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                
                <div className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-2.5 shadow-inner flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <div className="text-[10px] font-extrabold tracking-widest text-emerald-400 uppercase">User</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <ColorInput label="Nama" value={userPillColor} onChange={setUserPillColor} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                    <ColorInput label="Pesan" value={userBubbleBg} onChange={setUserBubbleBg} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                  </div>
                </div>
                
                <div className="bg-black/5 dark:bg-white/5 border border-white/5 rounded-xl p-2.5 shadow-inner flex flex-col gap-2.5">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                    <div className="text-[10px] font-extrabold tracking-widest text-rose-400 uppercase">Admin</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <ColorInput label="Nama" value={adminPillColor} onChange={setAdminPillColor} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                    <ColorInput label="Pesan" value={adminBubbleBg} onChange={setAdminBubbleBg} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-white/5">
              <button
                disabled={!isLoggedIn}
                onClick={handleApplyCustom}
                className={`w-full py-3 rounded-lg font-bold text-[11px] sm:text-xs transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide ${
                  isApplied
                    ? "bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "bg-[var(--accent)] text-[var(--background)] hover:opacity-90 shadow-md"
                }`}
              >
                {isApplied ? "✓ Pengaturan Diterapkan" : "Terapkan Kustomisasi"}
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
                  onClick={() => setTheme(t.id as any)}
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