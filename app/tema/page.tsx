"use client";
import React, { useState } from "react";
import BottomNav from "../../components/bottomnav"; // Sesuaikan path

export default function TemaPage() {
  const [activeTheme, setActiveTheme] = useState("dark");

  const themes = [
    { id: "dark", name: "Midnight Dark", icon: "🌙", color: "bg-slate-900 border-slate-700" },
    { id: "blue", name: "Ocean Blue", icon: "🌊", color: "bg-blue-900/40 border-blue-500/50" },
    { id: "emerald", name: "Emerald Green", icon: "🌲", color: "bg-emerald-900/40 border-emerald-500/50" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-slate-950 text-white pb-[70px]">
      
      {/* Header */}
      <div className="sticky top-0 z-20 p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <h1 className="text-xl font-bold text-blue-400">🎨 Pengaturan Tema</h1>
        <p className="text-xs text-white/50 mt-1">Sesuaikan tampilan aplikasi dengan selera Anda.</p>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        <div className="flex flex-col gap-4">
          {themes.map((t) => (
            <div 
              key={t.id}
              onClick={() => setActiveTheme(t.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                activeTheme === t.id 
                  ? `${t.color} shadow-[0_0_15px_rgba(255,255,255,0.1)] scale-[1.02]` 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-3xl">{t.icon}</div>
                <div>
                  <h3 className="font-bold text-sm">{t.name}</h3>
                  <p className="text-[10px] text-white/50">Terapkan tema ini</p>
                </div>
              </div>
              
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${activeTheme === t.id ? "border-blue-400" : "border-white/30"}`}>
                {activeTheme === t.id && <div className="w-2.5 h-2.5 bg-blue-400 rounded-full" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}