"use client";
import React from "react";
import BottomNav from "../../components/bottomnav";
import { useTheme } from "../context/ThemeContext";

export default function TemaPage() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { 
      id: "dark" as const, 
      name: "Midnight Dark", 
      icon: "🌙", 
      color: "bg-slate-900 border-slate-700",
      preview: "from-slate-900 to-slate-800"
    },
    { 
      id: "blue" as const, 
      name: "Ocean Blue", 
      icon: "🌊", 
      color: "bg-blue-900/40 border-blue-500/50",
      preview: "from-blue-900 to-blue-800"
    },
    { 
      id: "emerald" as const, 
      name: "Emerald Green", 
      icon: "🌲", 
      color: "bg-emerald-900/40 border-emerald-500/50",
      preview: "from-emerald-900 to-emerald-800"
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col text-white pb-[70px]"
         style={{ backgroundColor: "var(--background)" }}
    >
      {/* Header */}
      <div className="sticky top-0 z-20 p-4 backdrop-blur-md border-b"
           style={{ 
             backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)",
             borderColor: "var(--card-border)"
           }}
      >
        <h1 style={{ color: "var(--accent)" }} className="text-xl font-bold">
          🎨 Pengaturan Tema
        </h1>
        <p className="text-xs mt-1" style={{ color: "var(--foreground)" }}>
          Sesuaikan tampilan aplikasi dengan selera Anda.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {themes.map((t) => (
            <div
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                theme === t.id
                  ? `${t.color} shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-[1.02]`
                  : "hover:scale-[1.01]"
              }`}
              style={{
                backgroundColor: theme === t.id ? undefined : "var(--card-bg)",
                borderColor: theme === t.id ? undefined : "var(--card-border)",
              }}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.preview} flex items-center justify-center text-2xl shadow-lg`}>
                  {t.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm" style={{ color: "var(--foreground-heading)" }}>
                    {t.name}
                  </h3>
                  <p className="text-[10px]" style={{ color: "var(--foreground)" }}>
                    {theme === t.id ? "✓ Tema aktif" : "Terapkan tema ini"}
                  </p>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  theme === t.id ? "border-white" : "border-white/30"
                }`}
              >
                {theme === t.id && (
                  <div 
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: "var(--accent)" }}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Preview Section */}
        <div className="mt-6 p-4 rounded-2xl" 
             style={{ 
               backgroundColor: "var(--card-bg)", 
               border: "1px solid var(--card-border)" 
             }}
        >
          <h3 className="font-bold text-sm mb-3" style={{ color: "var(--foreground-heading)" }}>
            👁️ Preview
          </h3>
          <div className="space-y-2">
            <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--background)" }}>
              <p className="text-xs" style={{ color: "var(--foreground)" }}>
                Teks contoh dengan tema saat ini
              </p>
            </div>
            <button
              className="w-full py-2 rounded-lg font-bold text-sm text-white transition-all"
              style={{
                backgroundColor: "var(--accent)",
                boxShadow: `0 0 20px var(--accent-glow)`,
              }}
            >
              Tombol Aksen
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}