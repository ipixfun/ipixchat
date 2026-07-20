"use client";
import React from "react";
import Admin from "./Admin";

/* ---- Fluid Blob Atas (2 Layer, Smooth & Glowing) ---- */
const FluidTop = ({ mode }: { mode: "public" | "private" }) => {
  const c = mode === "public" ? "59, 130, 246" : "16, 185, 129";
  const glow = mode === "public" ? "drop-shadow(0 0 15px rgba(59,130,246,0.6))" : "drop-shadow(0 0 15px rgba(16,185,129,0.6))";
  
  return (
    <div 
      className="absolute top-0 left-0 w-full h-[8%] overflow-hidden pointer-events-none origin-top animate-blob-bounce-top" 
      style={{ zIndex: 1, filter: glow }}
    >
      {/* Layer 1 - Aliran ke Kiri */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave"
        style={{
          animationDuration: "12s",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0 L0,60 C150,20 350,120 600,60 C850,0 1050,100 1200,60 L1200,0 Z' fill='rgba(${c},0.4)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "50% 100%",
        }}
      />
      {/* Layer 2 - Aliran ke Kanan */}
      <div
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse"
        style={{
          animationDuration: "15s",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,0 L0,40 C200,100 400,0 600,40 C800,80 1000,-20 1200,40 L1200,0 Z' fill='rgba(${c},0.7)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat-x",
          backgroundSize: "50% 100%",
        }}
      />
    </div>
  );
};

/* ---- Fluid Blob Bawah (2 Layer, Smooth & Glowing) ---- */
const FluidBottom = ({ mode }: { mode: "public" | "private" }) => {
  const c = mode === "public" ? "59, 130, 246" : "16, 185, 129";
  const glow = mode === "public" ? "drop-shadow(0 0 20px rgba(59,130,246,0.5))" : "drop-shadow(0 0 20px rgba(16,185,129,0.5))";

  return (
    <div 
      className="absolute bottom-0 left-0 w-full h-[30%] overflow-hidden pointer-events-none origin-bottom animate-blob-bounce-bottom" 
      style={{ zIndex: 1, filter: glow }}
    >
      {/* Layer 1 - Aliran ke Kiri */}
      <div 
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave" 
        style={{ 
          animationDuration: "14s", 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,60 C150,100 350,0 600,60 C850,120 1050,20 1200,60 L1200,120 Z' fill='rgba(${c},0.35)'/%3E%3C/svg%3E")`, 
          backgroundRepeat: "repeat-x", 
          backgroundSize: "50% 100%" 
        }} 
      />
      {/* Layer 2 - Aliran ke Kanan */}
      <div 
        className="absolute bottom-0 left-0 w-[200%] h-full animate-wave-reverse" 
        style={{ 
          animationDuration: "18s", 
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M0,120 L0,80 C200,20 400,120 600,80 C800,40 1000,140 1200,80 L1200,120 Z' fill='rgba(${c},0.65)'/%3E%3C/svg%3E")`, 
          backgroundRepeat: "repeat-x", 
          backgroundSize: "50% 100%" 
        }} 
      />
    </div>
  );
};

/* ---- Main layout ---- */
export default function ChatLayout({ 
  cMode, 
  viewMode, 
  hInteract, 
  hScroll, 
  aTab, 
  selPrivUser, 
  pUsers, 
  pubMsgs, 
  privMsgs, 
  isPill, 
  pDelta, 
  pTouchX, 
  capIdx, 
  setPTouchX, 
  setPDelta, 
  setCapPause, 
  setIsPill, 
  renderMsgs,
  renderInput, 
  fmtTime, 
  setSelPriv 
}: any) {
  
  const isPublicFull = viewMode === "full-public";
  const isPrivateFull = viewMode === "full-private";

  return (
    <>
      <style>{`
        /* Animasi Translasi X untuk pergerakan arus */
        @keyframes wave { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes wave-reverse { from { transform: translateX(-50%); } to { transform: translateX(0); } }
        .animate-wave { animation: wave linear infinite; }
        .animate-wave-reverse { animation: wave-reverse linear infinite; }
        
        /* Animasi Bouncing/Breathing (Liquid Blob Effect) */
        @keyframes blob-bounce-top {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.3); }
        }
        @keyframes blob-bounce-bottom {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.15); }
        }
        .animate-blob-bounce-top {
          animation: blob-bounce-top 6s ease-in-out infinite;
        }
        .animate-blob-bounce-bottom {
          animation: blob-bounce-bottom 8s ease-in-out infinite;
        }
      `}</style>

      <div className="flex w-full h-full relative transition-all duration-500 ease-in-out">
        
        {/* Kolom Public Chat */}
        <div 
          className={`h-full flex flex-col transition-all duration-500 ease-out relative bg-transparent overflow-hidden ${isPublicFull ? "w-full" : isPrivateFull ? "w-0 opacity-0 pointer-events-none" : "w-1/2"}`} 
          onClick={() => hInteract("public")} 
          onTouchStart={() => hInteract("public")} 
          onWheel={() => hInteract("public")}
        >
          <FluidTop mode="public" />
          <FluidBottom mode="public" />
          
          <div onScroll={hScroll} className="relative z-10 p-1 sm:p-2 space-y-2 overflow-y-auto overflow-x-hidden flex-1 h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="text-center text-[9px] font-bold text-blue-500/70 mb-2 tracking-widest uppercase">Ruang Publik</div>
            {renderMsgs(pubMsgs, "public")}
            <div id="messages-end-public" className="h-0" />
          </div>
          {/* Kotak Input melekat hanya di mode dan kolom yang aktif */}
          {cMode === "public" && renderInput()}
        </div>

        {/* Kolom Private Chat */}
        <div 
          className={`h-full flex flex-col transition-all duration-500 ease-out relative bg-transparent overflow-hidden ${isPrivateFull ? "w-full" : isPublicFull ? "w-0 opacity-0 pointer-events-none" : "w-1/2"}`} 
          onClick={() => hInteract("private")} 
          onTouchStart={() => hInteract("private")} 
          onWheel={() => hInteract("private")}
        >
          <FluidTop mode="private" />
          <FluidBottom mode="private" />
          
          <div onScroll={hScroll} className="relative z-10 p-1 sm:p-2 space-y-2 overflow-y-auto overflow-x-hidden flex-1 h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="text-center text-[9px] font-bold text-emerald-500/70 mb-2 tracking-widest uppercase">Ruang Private</div>
            {aTab === "admin" && cMode === "private" && !selPrivUser ? (
              <Admin privateUsers={pUsers} setSelectedPrivateUser={setSelPriv} formatMessageTime={fmtTime} />
            ) : (
              renderMsgs(privMsgs, "private")
            )}
            <div id="messages-end-private" className="h-0" />
          </div>
          {/* Kotak Input melekat hanya di mode dan kolom yang aktif */}
          {cMode === "private" && renderInput()}
        </div>

        {isPill && (
          <div
            className="absolute bottom-4 left-1/2 z-30 flex justify-center select-none shadow-lg rounded-full"
            style={{ transform: `translateX(calc(-50% + ${pDelta}px))`, transition: pDelta === 0 ? "transform 0.3s ease-out, opacity 0.5s" : "none", opacity: Math.abs(pDelta) > 100 ? 0 : 1 }}
            onTouchStart={(e) => {
              setCapPause(!0);
              setPTouchX(e.touches[0].clientX);
            }}
            onTouchMove={(e) => setPDelta(e.touches[0].clientX - pTouchX)}
            onTouchEnd={() => {
              setCapPause(!1);
              if (Math.abs(pDelta) > 70) setIsPill(!1);
              setPDelta(0);
            }}
          >
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-800 border shadow-sm text-center tracking-wide relative overflow-hidden flex items-center justify-center w-[300px] sm:min-w-[310px] h-[34px] cursor-grab active:cursor-grabbing bg-white/60 backdrop-blur-md ${cMode === "private" ? "border-emerald-300/50" : "border-blue-300/50"}`}>
              <div className={`absolute flex items-center gap-1 transition-all duration-500 w-full justify-center ${capIdx === 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}>
                <span>Bijaklah berinteraksi salam toleransi |</span>
                <a href="https://ipix.my.id" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 underline font-black" onClick={(e) => e.stopPropagation()}>
                  ipix.my.id
                </a>
              </div>
              <div className={`absolute flex items-center gap-2 transition-all duration-500 w-full justify-center ${capIdx === 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"}`}>
                <span className={`inline-block anim-slide-left font-black text-sm leading-none ${cMode === "private" ? "text-emerald-600" : "text-blue-600"}`}>&lt;</span>
                <span>geser hapus/balas</span>
                <span className={`inline-block anim-slide-right font-black text-sm leading-none ${cMode === "private" ? "text-emerald-600" : "text-blue-600"}`}>&gt;</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}