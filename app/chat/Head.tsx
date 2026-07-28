"use client";
import React from "react";

interface HeadProps {
  auth: { isAuth: boolean; user: string };
  ui: { tab: "user" | "admin" };
  adminStat: { online: boolean; offlineTime: string };
  onlineUsers: string[];
  currentHash: string;
  getFmt: { greet: () => string };
  handleLogout: () => void;
  onBlockMgr?: () => void;
  onTrashMgr?: () => void;
}

export default function Head({ auth, ui, adminStat, onlineUsers, currentHash, getFmt, handleLogout, onBlockMgr, onTrashMgr }: HeadProps) {
  if (currentHash === "#block") return null;

  return (
    <>
      <style>{`
        @keyframes wave-slide { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-wave-fast { animation: wave-slide 10s linear infinite; }
        .animate-wave-slow { animation: wave-slide 18s linear infinite; }
      `}</style>

      <div className="sticky top-0 z-20 flex flex-col backdrop-blur-xl border-b transition-colors duration-500 overflow-hidden shadow-sm" style={{ backgroundColor: "color-mix(in srgb, var(--background) 80%, transparent)", borderColor: "var(--card-border)" }}>
        <div className="absolute inset-0 z-0 pointer-events-none flex items-end opacity-20">
          <svg className="absolute bottom-0 w-[200%] h-full animate-wave-slow opacity-60" viewBox="0 0 1600 150" preserveAspectRatio="none">
            <path fill="var(--accent)" d="M0,90 C200,30 200,150 400,90 C600,30 600,150 800,90 C1000,30 1000,150 1200,90 C1400,30 1400,150 1600,90 L1600,150 L0,150 Z" />
          </svg>
          <svg className="absolute bottom-0 w-[200%] h-[120%] animate-wave-fast" viewBox="0 0 1600 150" preserveAspectRatio="none">
            <path fill="var(--accent)" d="M0,60 C200,120 200,0 400,60 C600,120 600,0 800,60 C1000,120 1000,0 1200,60 C1400,120 1400,0 1600,60 L1600,150 L0,150 Z" />
          </svg>
        </div>

        <div className="p-4 relative z-10">
          <div className="absolute top-4 right-4 z-30 flex gap-2">
            {auth.isAuth && ui.tab === "admin" ? (
              <>
                <button onClick={onBlockMgr} className="px-3 py-1.5 rounded-full font-black text-white tracking-widest text-[9px] cursor-pointer select-none bg-red-600 border border-red-700 shadow-[0_3px_0_#991b1b,0_6px_10px_rgba(0,0,0,0.3)] active:translate-y-[3px] active:shadow-none transition-all duration-150 text-center">BLOCK MGR</button>
                <button onClick={onTrashMgr} className="px-3 py-1.5 rounded-full font-black text-white tracking-widest text-[9px] cursor-pointer select-none bg-orange-600 border border-orange-700 shadow-[0_3px_0_#c2410c,0_6px_10px_rgba(0,0,0,0.3)] active:translate-y-[3px] active:shadow-none transition-all duration-150 text-center">TRASH MGR</button>
              </>
            ) : (
              auth.isAuth && (
                <button onClick={handleLogout} className="text-[10px] bg-red-500/90 hover:bg-red-600 text-white px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm transition-all duration-300 font-semibold active:scale-95 ring-1 ring-red-400/50 hover:shadow-red-500/30">
                  Keluar
                </button>
              )
            )}
          </div>

          <div className="flex justify-between items-center relative z-20">
            <div className="flex flex-col max-w-[65%] gap-0.5">
              <span className="text-[10px] uppercase tracking-widest font-semibold opacity-70" style={{ color: "var(--foreground)" }}>{getFmt.greet()}</span>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-black tracking-tight" style={{ color: "var(--foreground-heading)" }}>{auth.user || "Guest"}</span>
                {auth.isAuth && <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse" />}
              </div>
            </div>

            {ui.tab !== "admin" && (
              <div className={`text-center flex-1 flex flex-col items-end ${auth.isAuth ? "mr-16" : ""}`}>
                <a href="https://ipix.my.id" target="_blank" rel="noopener noreferrer" className="font-extrabold text-sm relative group overflow-hidden px-1" style={{ color: "var(--accent)" }}>
                  <span className="relative z-10 block transition-transform duration-300 group-hover:-translate-y-[120%]">ipix.my.id</span>
                  <span className="absolute inset-0 z-10 flex items-center justify-center transition-transform duration-300 translate-y-[120%] group-hover:translate-y-0 opacity-80">ipix.my.id</span>
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-current scale-x-0 origin-right transition-transform duration-300 group-hover:scale-x-100 group-hover:origin-left rounded-full" />
                </a>
              </div>
            )}
          </div>
        </div>

        {auth.isAuth && ui.tab === "admin" && (
          <div className="relative z-10 flex items-center overflow-x-auto gap-2.5 px-4 py-2.5 border-t text-xs whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors duration-500 shadow-inner" style={{ backgroundColor: "color-mix(in srgb, var(--card-bg) 60%, transparent)", borderColor: "var(--card-border)", backdropFilter: "blur(12px)" }}>
            <span className="font-bold flex items-center mr-1" style={{ color: "var(--foreground-heading)" }}>
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_6px_#22c55e] animate-pulse" /> Online ({onlineUsers.length + (adminStat.online ? 1 : 0)})
            </span>
            {adminStat.online && <span className="bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-0.5 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md">Admin</span>}
            {onlineUsers.map((u) => (
              <span key={u} className="px-3 py-0.5 rounded-full text-[10px] font-medium border shadow-sm transition-all hover:scale-105 cursor-default" style={{ backgroundColor: "color-mix(in srgb, var(--background) 50%, transparent)", color: "var(--foreground)", borderColor: "var(--card-border)" }}>{u.split("●")[0]}</span>
            ))}
            {onlineUsers.length === 0 && !adminStat.online && (
              <span className="italic text-[10px] opacity-60 font-medium" style={{ color: "var(--foreground)" }}>Sepi...</span>
            )}
          </div>
        )}
      </div>
    </>
  );
}