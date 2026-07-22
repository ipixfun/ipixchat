import React from "react";
import BottomNav from "../../components/bottomnav"; // Sesuaikan path

export default function TentangPage() {
  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-slate-950 text-white pb-[70px]">
      
      {/* Header */}
      <div className="sticky top-0 z-20 p-4 bg-slate-950/80 backdrop-blur-md border-b border-white/10">
        <h1 className="text-xl font-bold text-emerald-400">ℹ️ Tentang iPix</h1>
      </div>

      {/* Content */}
      <div className="flex-1 p-5 overflow-y-auto">
        
        {/* Logo / Banner */}
        <div className="w-full py-8 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/40 to-emerald-900/40 rounded-3xl border border-white/10 mb-6 shadow-inner">
          <div className="text-5xl mb-2 drop-shadow-lg">✨</div>
          <h2 className="text-2xl font-black tracking-widest">iPIX CHAT</h2>
          <span className="text-xs bg-white/10 px-3 py-1 rounded-full mt-2 border border-white/10">Versi 1.0.0</span>
        </div>

        <div className="bg-white/5 p-5 rounded-2xl border border-white/10 text-sm text-white/80 leading-relaxed space-y-4">
          <p>
            <strong>iPix Chat</strong> adalah platform komunikasi real-time modern yang dirancang untuk memberikan pengalaman bertukar pesan secara instan, aman, dan fleksibel.
          </p>
          
          <p>
            Mendukung berbagai fitur canggih seperti obrolan publik dan pribadi (langsung dengan admin), notifikasi badge real-time, sensor kata otomatis, hingga pengiriman file media.
          </p>

          <div className="pt-4 border-t border-white/10 mt-4">
            <h3 className="font-bold text-white mb-2">Teknologi yang digunakan:</h3>
            <div className="flex gap-2 flex-wrap text-xs">
              <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-md border border-blue-500/30">Next.js App Router</span>
              <span className="bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md border border-emerald-500/30">Supabase</span>
              <span className="bg-sky-500/20 text-sky-300 px-2 py-1 rounded-md border border-sky-500/30">Tailwind CSS</span>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-white/40 mt-8 mb-4">
          © 2026 iPix.my.id - All Rights Reserved.
        </div>

      </div>

      <BottomNav />
    </div>
  );
}