"use client";
import React from "react";
import BottomNav from "../../components/bottomnav";
import { useTheme } from "../context/ThemeContext";

export default function TemaPage() {
  const { theme, setTheme, customColors, setCustomColors, mounted } = useTheme();

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
          Pilih tema preset atau racik warna & gelombang buatanmu sendiri.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-6">
        
        {/* SECTION 1: CUSTOM COLOR & WAVE PICKER */}
        <div 
          className="p-4 sm:p-5 rounded-2xl border transition-all duration-300"
          style={{ 
            backgroundColor: "var(--card-bg)", 
            borderColor: activeThemeId === "custom" ? "var(--accent)" : "var(--card-border)",
            boxShadow: activeThemeId === "custom" ? "0 0 15px var(--accent-glow)" : "none"
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm" style={{ color: "var(--foreground-heading)" }}>
                🎨 Racik Tema & Gelombang Sendiri
              </h3>
              <p className="text-[10px] opacity-80" style={{ color: "var(--foreground)" }}>
                Atur warna UI & animasi gelombang obrolan
              </p>
            </div>
            
            <button
              onClick={() => setTheme("custom")}
              className="px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-sm shrink-0"
              style={{
                backgroundColor: activeThemeId === "custom" ? "var(--accent)" : "transparent",
                color: activeThemeId === "custom" ? "var(--background)" : "var(--accent)",
                border: "1px solid var(--accent)"
              }}
            >
              {activeThemeId === "custom" ? "✓ Aktif" : "Gunakan Kustom"}
            </button>
          </div>

          {/* Warna UI Dasar */}
          <div className="mb-3">
            <span className="text-[11px] font-bold block mb-2" style={{ color: "var(--foreground-heading)" }}>1. Warna Dasar UI</span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Latar</span>
                <input 
                  type="color" 
                  value={customColors.bg}
                  onChange={(e) => {
                    setCustomColors({ ...customColors, bg: e.target.value });
                    if (activeThemeId !== "custom") setTheme("custom");
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
              </div>

              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Aksen</span>
                <input 
                  type="color" 
                  value={customColors.accent}
                  onChange={(e) => {
                    setCustomColors({ ...customColors, accent: e.target.value });
                    if (activeThemeId !== "custom") setTheme("custom");
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
              </div>

              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Teks</span>
                <input 
                  type="color" 
                  value={customColors.text}
                  onChange={(e) => {
                    setCustomColors({ ...customColors, text: e.target.value });
                    if (activeThemeId !== "custom") setTheme("custom");
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Warna Gelombang / Wave */}
          <div>
            <span className="text-[11px] font-bold block mb-2" style={{ color: "var(--foreground-heading)" }}>2. Warna Animasi Gelombang (Wave)</span>
            <div className="grid grid-cols-3 gap-2.5">
              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Wave Belakang</span>
                <input 
                  type="color" 
                  value={customColors.wave1}
                  onChange={(e) => {
                    setCustomColors({ ...customColors, wave1: e.target.value });
                    if (activeThemeId !== "custom") setTheme("custom");
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
              </div>

              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Wave Tengah</span>
                <input 
                  type="color" 
                  value={customColors.wave2}
                  onChange={(e) => {
                    setCustomColors({ ...customColors, wave2: e.target.value });
                    if (activeThemeId !== "custom") setTheme("custom");
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
              </div>

              <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-black/20 border border-white/10">
                <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>Wave Depan</span>
                <input 
                  type="color" 
                  value={customColors.wave3}
                  onChange={(e) => {
                    setCustomColors({ ...customColors, wave3: e.target.value });
                    if (activeThemeId !== "custom") setTheme("custom");
                  }}
                  className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: GRID PRESET THEMES */}
        <div>
          <h3 className="font-bold text-xs mb-3 px-1" style={{ color: "var(--foreground)" }}>
            Atau pilih Preset Tema:
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