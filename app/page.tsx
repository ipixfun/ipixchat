import React from "react";
import Link from "next/link";
import BottomNav from "../components/bottomnav"; // Sesuaikan path jika error (misal: "./components/bottomnav")

export default function HomePage() {
  return (
    <div className="w-full max-w-2xl mx-auto h-dvh flex flex-col bg-slate-950 text-white relative overflow-hidden pb-[70px]">
      
      {/* Background Ornamen */}
      <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10">
        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center border border-white/20 mb-6 shadow-2xl backdrop-blur-sm">
          <span className="text-5xl">👋</span>
        </div>
        
        <h1 className="text-4xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 drop-shadow-sm">
          Welcome to iPix
        </h1>
        
        <p className="text-white/60 mb-8 max-w-sm text-sm leading-relaxed">
          Platform chat publik dan privat modern dengan fitur real-time. Temukan teman baru atau hubungi admin dengan aman.
        </p>

        <Link 
          href="/chat" 
          className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 rounded-full font-bold shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-sm"
        >
          Mulai Chatting Sekarang 🚀
        </Link>
      </div>

      <BottomNav />
    </div>
  );
}