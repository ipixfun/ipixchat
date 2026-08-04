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
  { id: "ivory-lime", name: "Ivory Lime", preview: "from-stone-100 to-lime-300" },
  { id: "gunmetal-platinum", name: "Gunmetal Platinum", preview: "from-slate-600 to-slate-800" },
  { id: "charcoal-ecru", name: "Charcoal Ecru", preview: "from-stone-700 to-stone-900" },
  { id: "black-neon", name: "Black Neon", preview: "from-black to-lime-400" },
  { id: "cyber-neon", name: "Cyber Neon", preview: "from-zinc-800 to-zinc-950" },
];

const CompactToggle = ({ 
  label, checked, onChange, disabled, activeColor = "bg-[var(--accent)]"
}: { 
  label?: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; disabled: boolean; activeColor?: string;
}) => (
  <label className={`flex items-center gap-2 cursor-pointer group select-none ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}>
    {label && (
      <span 
        className={`text-[10px] sm:text-xs transition-all duration-300 ${
          checked ? "font-extrabold opacity-100" : "opacity-50 font-bold"
        }`}
        style={{ color: checked ? "var(--foreground-heading)" : "var(--foreground)" }}
      >
        {label}
      </span>
    )}
    <div className="relative flex items-center">
      <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="sr-only peer" />
      <div 
        className={`w-9 h-5 sm:w-10 sm:h-5.5 rounded-md border transition-all duration-300 relative flex items-center p-0.5 ${
          checked 
            ? `${activeColor} border-[var(--accent)]` 
            : "bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] border-[color-mix(in_srgb,var(--foreground)_15%,transparent)]"
        }`}
      >
        <div 
          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-[4px] transition-all duration-300 shadow-sm ${
            checked 
              ? "translate-x-4 sm:translate-x-4.5 bg-[var(--background)]" 
              : "translate-x-0 bg-[color-mix(in_srgb,var(--foreground)_40%,transparent)]"
          }`} 
        />
      </div>
    </div>
  </label>
);

const DirectionSelector = ({
  direction,
  onChange,
  disabled
}: {
  direction: "left" | "right";
  onChange: (dir: "left" | "right") => void;
  disabled?: boolean;
}) => (
  <div 
    className={`flex items-center p-0.5 rounded-md border ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
    style={{
      backgroundColor: "color-mix(in srgb, var(--foreground) 6%, transparent)",
      borderColor: "color-mix(in srgb, var(--foreground) 12%, transparent)"
    }}
  >
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange("left")}
      className={`px-2 py-0.5 rounded-[4px] text-[9px] transition-all duration-200 ${
        direction === "left"
          ? "bg-[var(--accent)] text-[var(--background)] font-extrabold opacity-100"
          : "opacity-50 hover:opacity-100"
      }`}
      style={{ color: direction === "left" ? "var(--background)" : "var(--foreground)" }}
    >
      Kiri
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange("right")}
      className={`px-2 py-0.5 rounded-[4px] text-[9px] transition-all duration-200 ${
        direction === "right"
          ? "bg-[var(--accent)] text-[var(--background)] font-extrabold opacity-100"
          : "opacity-50 hover:opacity-100"
      }`}
      style={{ color: direction === "right" ? "var(--background)" : "var(--foreground)" }}
    >
      Kanan
    </button>
  </div>
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
      <div 
        className="flex items-center justify-between p-2 rounded-lg border w-full shadow-sm gap-2 transition-colors"
        style={{
          backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)",
          borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)"
        }}
      >
        <span 
          className="text-[10px] sm:text-[11px] font-bold leading-tight opacity-90 truncate shrink-0 w-28"
          style={{ color: "var(--foreground-heading)" }}
        >
          {label}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {showHex && (
            <input 
              type="text" 
              value={isTransparent ? "trans" : value} 
              onChange={(e) => onChange(e.target.value)} 
              disabled={disabled || isTransparent}
              className="w-14 text-center text-[9.5px] font-mono border rounded-md px-1 py-1 focus:outline-none focus:border-[var(--accent)]"
              style={{
                backgroundColor: "color-mix(in srgb, var(--foreground) 8%, transparent)",
                borderColor: "color-mix(in srgb, var(--foreground) 15%, transparent)",
                color: "var(--foreground)"
              }}
            />
          )}
          <div 
            className={`relative w-7 h-7 rounded-md overflow-hidden border shadow-inner transition-transform ${disabled || isTransparent ? "opacity-50 cursor-not-allowed" : "hover:scale-105 cursor-pointer"}`}
            style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}
          >
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
            <label 
              className="flex items-center gap-1.5 cursor-pointer group pl-2 border-l"
              style={{ borderColor: "color-mix(in srgb, var(--foreground) 15%, transparent)" }}
              title="Atur Transparan"
            >
              <div className="relative flex items-center shrink-0">
                <input type="checkbox" checked={isTransparent} onChange={(e) => handleTransparentToggle(e.target.checked)} disabled={disabled} className="sr-only peer" />
                <div 
                  className="w-7 h-3.5 rounded-md peer-checked:bg-[var(--accent)] transition-colors after:content-[''] after:absolute after:top-[1.5px] after:left-[1.5px] after:bg-[var(--foreground)] peer-checked:after:bg-[var(--background)] after:rounded-[3px] after:h-2.5 after:w-2.5 after:transition-all peer-checked:after:translate-x-3.5 disabled:opacity-50 border shadow-inner"
                  style={{
                    backgroundColor: isTransparent ? "var(--accent)" : "color-mix(in srgb, var(--foreground) 15%, transparent)",
                    borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)"
                  }}
                />
              </div>
              <span 
                className={`text-[9px] font-bold tracking-wide transition-colors ${isTransparent ? 'font-extrabold opacity-100' : 'opacity-50'}`}
                style={{ color: isTransparent ? "var(--foreground-heading)" : "var(--foreground)" }}
              >
                Transparan
              </span>
            </label>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center justify-between p-2 rounded-lg border gap-1.5 w-full h-full shadow-sm"
      style={{
        backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)",
        borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)"
      }}
    >
      <span 
        className="text-[9px] sm:text-[10px] font-bold text-center leading-tight truncate w-full opacity-90"
        style={{ color: "var(--foreground-heading)" }}
      >
        {label}
      </span>
      <div 
        className={`relative w-8 h-8 rounded-md overflow-hidden border shadow-inner shrink-0 transition-transform ${disabled ? "opacity-50" : "hover:scale-105 cursor-pointer"}`}
        style={{ borderColor: "color-mix(in srgb, var(--foreground) 20%, transparent)" }}
      >
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

  const [l1Show, setL1Show] = useState<boolean>(true);
  const [l2Show, setL2Show] = useState<boolean>(true);
  const [l3Show, setL3Show] = useState<boolean>(true);

  const [l1Dir, setL1Dir] = useState<"left" | "right">("left");
  const [l2Dir, setL2Dir] = useState<"left" | "right">("left");
  const [l3Dir, setL3Dir] = useState<"left" | "right">("right");

  const [isThemeCollapsed, setIsThemeCollapsed] = useState<boolean>(true);
  const [isWaveCollapsed, setIsWaveCollapsed] = useState<boolean>(true);
  const [isChatCollapsed, setIsChatCollapsed] = useState<boolean>(true);

  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("Tema Berhasil Diterapkan!");

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

    setL1Show(localStorage.getItem("global_wave_l1_show") !== "false");
    setL2Show(localStorage.getItem("global_wave_l2_show") !== "false");
    setL3Show(localStorage.getItem("global_wave_l3_show") !== "false");

    setL1Dir((localStorage.getItem("global_wave_l1_dir") as "left" | "right") || "left");
    setL2Dir((localStorage.getItem("global_wave_l2_dir") as "left" | "right") || "left");
    setL3Dir((localStorage.getItem("global_wave_l3_dir") as "left" | "right") || "right");

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
    setIsWaveDisabled(!e.target.checked);
  };

  const handleCustomWaveToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsCustomWaveEnabled(e.target.checked);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 4200);
  };

  const handleApplyCustom = () => {
    localStorage.setItem("global_enable_custom_ui", isCustomUiEnabled.toString());
    localStorage.setItem("global_enable_custom_chat", isCustomChatEnabled.toString());
    localStorage.setItem("global_disable_wave", isWaveDisabled.toString());
    localStorage.setItem("global_enable_custom_wave", isCustomWaveEnabled.toString());

    localStorage.setItem("global_wave_l1_show", l1Show.toString());
    localStorage.setItem("global_wave_l2_show", l2Show.toString());
    localStorage.setItem("global_wave_l3_show", l3Show.toString());

    localStorage.setItem("global_wave_l1_dir", l1Dir);
    localStorage.setItem("global_wave_l2_dir", l2Dir);
    localStorage.setItem("global_wave_l3_dir", l3Dir);

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
    
    setCustomColors(draftCustomColors);

    if (isCustomUiEnabled) {
      setTheme("custom");
    } else if (theme === "custom") {
      setTheme("dark");
    }

    window.dispatchEvent(new Event("globalColorChanged"));

    triggerToast("Tema Berhasil Diterapkan!");
  };

  if (!isMounted) {
    return (
      <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col pb-[70px] bg-[var(--background)] text-[var(--foreground)]">
        <div className="p-4 text-xs opacity-50">Memuat pengaturan...</div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes waveLetter {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3.5px); }
        }
        .animate-wave-letter {
          animation: waveLetter 1.2s ease-in-out infinite;
        }
        @keyframes toastPopIn {
          0% { transform: translateY(-20px) scale(0.92); opacity: 0; }
          60% { transform: translateY(4px) scale(1.02); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .animate-toast-pop {
          animation: toastPopIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* POP-UP DINAMIS TENTU PRESISI DI TENGAH */}
      {showToast && (
        <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto animate-toast-pop flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-xl border border-[var(--accent)] bg-[color-mix(in_srgb,var(--card-bg)_92%,transparent)] text-[var(--foreground-heading)] w-full max-w-xs sm:max-w-sm">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-extrabold text-xs shadow-inner">
              ✓
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold tracking-wide leading-tight truncate">
                {toastMessage}
              </span>
              <span className="text-[10px] opacity-70 leading-tight truncate mt-0.5" style={{ color: "var(--foreground)" }}>
                Perubahan tata warna & tema berhasil disimpan.
              </span>
            </div>
          </div>
        </div>
      )}

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
            <div 
              className="p-3 border-b flex flex-wrap items-center justify-between gap-2"
              style={{ 
                backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)"
              }}
            >
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
              
              {/* BAGIAN 1: WARNA TEMA */}
              <div 
                className="border rounded-xl p-2.5 sm:p-3"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--foreground) 3%, transparent)",
                  borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)"
                }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer select-none pb-2 border-b"
                  style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}
                  onClick={() => setIsThemeCollapsed(!isThemeCollapsed)}
                >
                  <div className="flex items-center justify-between w-full pr-3">
                    <h4 
                      className="text-[10px] sm:text-[11px] uppercase tracking-widest transition-all duration-300"
                      style={{ 
                        color: isCustomUiEnabled ? "var(--foreground-heading)" : "var(--foreground)",
                        opacity: isCustomUiEnabled ? 1 : 0.4,
                        fontWeight: isCustomUiEnabled ? 800 : 700
                      }}
                    >
                      WARNA TEMA
                    </h4>
                    <div onClick={(e) => e.stopPropagation()}>
                      <CompactToggle label={isCustomUiEnabled ? "Aktif" : "Bawaan"} checked={isCustomUiEnabled} onChange={(e) => setIsCustomUiEnabled(e.target.checked)} disabled={!isLoggedIn} />
                    </div>
                  </div>
                  <span className="text-xs font-mono opacity-60" style={{ color: "var(--foreground)" }}>{isThemeCollapsed ? "▼" : "▲"}</span>
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
              <div 
                className="border rounded-xl p-2.5 sm:p-3"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--foreground) 3%, transparent)",
                  borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)"
                }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer select-none pb-2 border-b"
                  style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}
                  onClick={() => setIsChatCollapsed(!isChatCollapsed)}
                >
                  <div className="flex items-center justify-between w-full pr-3">
                    <h4 
                      className="text-[10px] sm:text-[11px] uppercase tracking-widest transition-all duration-300"
                      style={{ 
                        color: isCustomChatEnabled ? "var(--foreground-heading)" : "var(--foreground)",
                        opacity: isCustomChatEnabled ? 1 : 0.4,
                        fontWeight: isCustomChatEnabled ? 800 : 700
                      }}
                    >
                      GELEMBUNG CHAT
                    </h4>
                    <div onClick={(e) => e.stopPropagation()}>
                      <CompactToggle label={isCustomChatEnabled ? "Aktif" : "Bawaan"} checked={isCustomChatEnabled} onChange={(e) => setIsCustomChatEnabled(e.target.checked)} disabled={!isLoggedIn} />
                    </div>
                  </div>
                  <span className="text-xs font-mono opacity-60" style={{ color: "var(--foreground)" }}>{isChatCollapsed ? "▼" : "▲"}</span>
                </div>

                {!isChatCollapsed && (
                  <div className={`pt-3 transition-all duration-300 grid grid-cols-1 sm:grid-cols-2 gap-3 ${!isCustomChatEnabled ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                    
                    <div 
                      className="border rounded-xl p-2.5 shadow-inner flex flex-col gap-2.5"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                        borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)"
                      }}
                    >
                      <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
                        <div className="text-[10px] font-extrabold tracking-widest text-emerald-500 uppercase">User</div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <ColorInput label="Nama & Outline Box" value={userPillColor} onChange={setUserPillColor} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                        <ColorInput label="Background Box" value={userBubbleBg} onChange={setUserBubbleBg} disabled={!isLoggedIn || !isCustomChatEnabled} allowTransparent horizontal />
                      </div>
                    </div>
                    
                    <div 
                      className="border rounded-xl p-2.5 shadow-inner flex flex-col gap-2.5"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                        borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)"
                      }}
                    >
                      <div className="flex items-center justify-between border-b pb-1.5" style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}>
                        <div className="text-[10px] font-extrabold tracking-widest text-rose-500 uppercase">Admin</div>
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
              <div 
                className="border rounded-xl p-2.5 sm:p-3"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--foreground) 3%, transparent)",
                  borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)"
                }}
              >
                <div 
                  className="flex items-center justify-between cursor-pointer select-none pb-2 border-b"
                  style={{ borderColor: "color-mix(in srgb, var(--foreground) 8%, transparent)" }}
                  onClick={() => setIsWaveCollapsed(!isWaveCollapsed)}
                >
                  <div className="flex items-center justify-between w-full pr-3 flex-wrap gap-2">
                    {!isWaveDisabled ? (
                      <div className="flex items-center text-[10px] sm:text-[11px] font-extrabold tracking-widest" style={{ color: "var(--foreground-heading)" }}>
                        {"WAVE".split("").map((char, idx) => (
                          <span
                            key={idx}
                            className="inline-block animate-wave-letter"
                            style={{ animationDelay: `${idx * 0.15}s` }}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <h4 className="text-[10px] sm:text-[11px] uppercase tracking-widest opacity-40 font-bold" style={{ color: "var(--foreground)" }}>
                        WAVE
                      </h4>
                    )}
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      <CompactToggle label={!isWaveDisabled ? "Tampilkan Wave" : "Sembunyikan Wave"} checked={!isWaveDisabled} onChange={handleWaveToggle} disabled={!isLoggedIn} />
                      <CompactToggle label={isCustomWaveEnabled ? "Warna Kustom" : "Warna Bawaan"} checked={isCustomWaveEnabled} onChange={handleCustomWaveToggle} disabled={!isLoggedIn || isWaveDisabled} />
                    </div>
                  </div>
                  <span className="text-xs font-mono opacity-60" style={{ color: "var(--foreground)" }}>{isWaveCollapsed ? "▼" : "▲"}</span>
                </div>

                {!isWaveCollapsed && (
                  <div className={`pt-3 transition-all duration-300 flex flex-col gap-3 ${isWaveDisabled ? "opacity-30 grayscale pointer-events-none" : ""}`}>
                    
                    {/* LAYER 1: BELAKANG */}
                    <div 
                      className="border p-2.5 rounded-xl flex flex-col gap-2"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                        borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)"
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          className="text-[10px] sm:text-[11px] transition-all duration-300"
                          style={{
                            color: l1Show && !isWaveDisabled ? "var(--foreground-heading)" : "var(--foreground)",
                            opacity: l1Show && !isWaveDisabled ? 1 : 0.4,
                            fontWeight: l1Show && !isWaveDisabled ? 800 : 700
                          }}
                        >
                          Layer Belakang
                        </span>
                        <div className="flex items-center gap-2.5">
                          <DirectionSelector direction={l1Dir} onChange={setL1Dir} disabled={!isLoggedIn || isWaveDisabled || !l1Show} />
                          <CompactToggle checked={l1Show} onChange={(e) => setL1Show(e.target.checked)} disabled={!isLoggedIn || isWaveDisabled} />
                        </div>
                      </div>
                      {isCustomWaveEnabled && (
                        <ColorInput label="Warna Belakang" value={draftCustomColors.wave1} onChange={(v) => handleCustomColorChange("wave1", v)} disabled={!isLoggedIn || isWaveDisabled || !l1Show} showHex={isAdmin} horizontal />
                      )}
                    </div>

                    {/* LAYER 2: TENGAH */}
                    <div 
                      className="border p-2.5 rounded-xl flex flex-col gap-2"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                        borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)"
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          className="text-[10px] sm:text-[11px] transition-all duration-300"
                          style={{
                            color: l2Show && !isWaveDisabled ? "var(--foreground-heading)" : "var(--foreground)",
                            opacity: l2Show && !isWaveDisabled ? 1 : 0.4,
                            fontWeight: l2Show && !isWaveDisabled ? 800 : 700
                          }}
                        >
                          Layer Tengah
                        </span>
                        <div className="flex items-center gap-2.5">
                          <DirectionSelector direction={l2Dir} onChange={setL2Dir} disabled={!isLoggedIn || isWaveDisabled || !l2Show} />
                          <CompactToggle checked={l2Show} onChange={(e) => setL2Show(e.target.checked)} disabled={!isLoggedIn || isWaveDisabled} />
                        </div>
                      </div>
                      {isCustomWaveEnabled && (
                        <ColorInput label="Warna Tengah" value={draftCustomColors.wave2} onChange={(v) => handleCustomColorChange("wave2", v)} disabled={!isLoggedIn || isWaveDisabled || !l2Show} showHex={isAdmin} horizontal />
                      )}
                    </div>

                    {/* LAYER 3: DEPAN */}
                    <div 
                      className="border p-2.5 rounded-xl flex flex-col gap-2"
                      style={{
                        backgroundColor: "color-mix(in srgb, var(--foreground) 5%, transparent)",
                        borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)"
                      }}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span 
                          className="text-[10px] sm:text-[11px] transition-all duration-300"
                          style={{
                            color: l3Show && !isWaveDisabled ? "var(--foreground-heading)" : "var(--foreground)",
                            opacity: l3Show && !isWaveDisabled ? 1 : 0.4,
                            fontWeight: l3Show && !isWaveDisabled ? 800 : 700
                          }}
                        >
                          Layer Depan
                        </span>
                        <div className="flex items-center gap-2.5">
                          <DirectionSelector direction={l3Dir} onChange={setL3Dir} disabled={!isLoggedIn || isWaveDisabled || !l3Show} />
                          <CompactToggle checked={l3Show} onChange={(e) => setL3Show(e.target.checked)} disabled={!isLoggedIn || isWaveDisabled} />
                        </div>
                      </div>
                      {isCustomWaveEnabled && (
                        <ColorInput label="Warna Depan" value={draftCustomColors.wave3} onChange={(v) => handleCustomColorChange("wave3", v)} disabled={!isLoggedIn || isWaveDisabled || !l3Show} showHex={isAdmin} horizontal />
                      )}
                    </div>

                  </div>
                )}
              </div>

              <div className="pt-2 mt-2 border-t" style={{ borderColor: "color-mix(in srgb, var(--foreground) 10%, transparent)" }}>
                <button
                  disabled={!isLoggedIn}
                  onClick={handleApplyCustom}
                  className="w-full py-3 rounded-lg font-bold text-[11px] sm:text-xs transition-all active:scale-95 flex items-center justify-center gap-2 tracking-wide bg-[var(--accent)] text-[var(--background)] hover:opacity-90 shadow-md"
                >
                  Terapkan Tema
                </button>
              </div>

            </div>

            {!isLoggedIn && !loadingAuth && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 backdrop-blur-[2px]" style={{ backgroundColor: "color-mix(in srgb, var(--background) 70%, transparent)" }}>
                <div 
                  className="text-center p-5 rounded-2xl border shadow-2xl max-w-[280px] w-full"
                  style={{
                    backgroundColor: "var(--card-bg)",
                    borderColor: "var(--card-border)"
                  }}
                >
                  <h4 className="text-xs font-bold mb-2" style={{ color: "var(--foreground-heading)" }}>Akses Dibatasi</h4>
                  <p className="text-[10px] mb-4 leading-relaxed opacity-70" style={{ color: "var(--foreground)" }}>
                    Fitur racik warna lanjutan ini eksklusif hanya untuk member yang telah terdaftar.
                  </p>
                  <Link
                    href="/"
                    className="inline-flex w-full items-center justify-center px-4 py-2.5 text-[11px] font-bold rounded-lg transition-all active:scale-95 shadow-md"
                    style={{
                      backgroundColor: "var(--accent)",
                      color: "var(--background)"
                    }}
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
                      triggerToast(`Preset "${t.name}" Diterapkan!`);
                    }}
                    className={`p-2.5 rounded-lg border transition-all duration-300 cursor-pointer flex items-center justify-between gap-2 ${
                      isActive ? "shadow-sm" : "hover:opacity-90"
                    }`}
                    style={{
                      backgroundColor: isActive 
                        ? "color-mix(in srgb, var(--foreground) 8%, transparent)" 
                        : "var(--card-bg)",
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
    </>
  );
}