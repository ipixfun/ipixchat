"use client";
import React from "react";
import BottomNav from "../../components/bottomnav";
import { useTheme } from "../context/ThemeContext";

export default function TemaPage() {
  const { theme, setTheme, mounted } = useTheme();

  // 10 Model Tema beserta visual preview-nya
  const themes = [
    { 
      id: "dark", 
      name: "Monochrome Dark", 
      icon: "🖤", 
      preview: "from-neutral-800 to-black"
    },
    { 
      id: "navy-electric", 
      name: "Navy Electric", 
      icon: "⚡", 
      preview: "from-blue-900 to-slate-900"
    },
    { 
      id: "emerald-cream", 
      name: "Emerald Cream", 
      icon: "🍵", 
      preview: "from-emerald-200 to-amber-100"
    },
    { 
      id: "teal-coral", 
      name: "Teal Coral", 
      icon: "🏖️", 
      preview: "from-orange-100 to-teal-200"
    },
    { 
      id: "sea-citrus", 
      name: "Sea Citrus", 
      icon: "🍋", 
      preview: "from-cyan-200 to-teal-100"
    },
    { 
      id: "raisin-sunset", 
      name: "Raisin Sunset", 
      icon: "🌇", 
      preview: "from-neutral-700 to-neutral-900"
    },
    { 
      id: "gunmetal-platinum", 
      name: "Gunmetal Platinum", 
      icon: "🦾", 
      preview: "from-slate-600 to-slate-800"
    },
    { 
      id: "charcoal-ecru", 
      name: "Charcoal Ecru", 
      icon: "☕", 
      preview: "from-stone-700 to-stone-900"
    },
    { 
      id: "charcoal-sage", 
      name: "Charcoal Sage", 
      icon: "🌿", 
      preview: "from-zinc-700 to-zinc-900"
    },
    { 
      id: "cyber-neon", 
      name: "Cyber Neon", 
      icon: "👾", 
      preview: "from-zinc-800 to-zinc-950"
    },
  ];

  // Penanganan aman Hydration: sebelum mounted, fallback ke tema 'dark'
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
          Sesuaikan tampilan aplikasi dengan selera Anda.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {themes.map((t) => {
            const isActive = activeThemeId === t.id;

            return (
              <div
                key={t.id}
                onClick={() => setTheme(t.id as any)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center justify-between ${
                  isActive ? "scale-[1.02]" : "hover:scale-[1.01]"
                }`}
                style={{
                  backgroundColor: "var(--card-bg)",
                  borderColor: isActive ? "var(--accent)" : "var(--card-border)",
                  boxShadow: isActive ? "0 0 15px var(--accent-glow)" : "none",
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.preview} flex items-center justify-center text-2xl shadow-lg border border-white/10`}>
                    {t.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm" style={{ color: "var(--foreground-heading)" }}>
                      {t.name}
                    </h3>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--foreground)" }}>
                      {isActive ? "✓ Tema sedang aktif" : "Ketuk untuk terapkan"}
                    </p>
                  </div>
                </div>

                {/* Radio Indicator */}
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300"
                  style={{ 
                    borderColor: isActive ? "var(--accent)" : "var(--card-border)" 
                  }}
                >
                  {isActive && (
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: "var(--accent)" }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Section */}
        <div 
          className="mt-8 p-5 rounded-2xl transition-colors duration-300" 
          style={{ 
            backgroundColor: "var(--card-bg)", 
            border: "1px solid var(--card-border)" 
          }}
        >
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--foreground-heading)" }}>
            👁️ Preview Tampilan
          </h3>
          <div className="space-y-3">
            <div 
              className="p-3 rounded-lg border" 
              style={{ 
                backgroundColor: "var(--background)",
                borderColor: "var(--card-border)" 
              }}
            >
              <p className="text-xs" style={{ color: "var(--foreground)" }}>
                Ini adalah contoh komponen teks dengan tema <strong style={{ color: "var(--foreground-heading)" }}>{themes.find(t => t.id === activeThemeId)?.name}</strong> saat ini.
              </p>
            </div>
            <button
              className="w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300"
              style={{
                backgroundColor: "var(--accent)",
                color: "var(--background)",
                boxShadow: `0 4px 20px var(--accent-glow)`,
              }}
            >
              Tombol Aksi Utama
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}