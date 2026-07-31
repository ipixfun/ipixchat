"use client";
import React from "react";

export default function Head({
  auth,
  ui,
  adminStat,
  onlineUsers,
  currentHash,
  getFmt,
  handleLogout,
  onBlockMgr,
  onTrashMgr,
  pinnedMsg,
  onEditPinned,
  onScrollToMsg,
}: any) {
  const isMsgAdmin = auth.user === "Admin●ipix.my.id";

  return (
    <header className="w-full shrink-0 p-3 sm:p-4 border-b transition-colors duration-300 z-30" style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}>
      {/* BARIS ATAS: SALAM & TOMBOL AKSI */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: "var(--foreground)" }}>
            {getFmt.greet()}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-sm font-black tracking-wide" style={{ color: "var(--foreground-heading)" }}>
              {isMsgAdmin ? "Admin" : auth.user || "Pengunjung"}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {ui.tab === "admin" && (
            <>
              <button
                type="button"
                onClick={onBlockMgr}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all active:scale-95"
              >
                Blokir
              </button>
              <button
                type="button"
                onClick={onTrashMgr}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all active:scale-95"
              >
                Sampah
              </button>
            </>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all active:scale-95"
          >
            Keluar
          </button>
        </div>
      </div>

      {/* BARIS BWAH: STATUS ONLINE & PESAN SEMATAN DINAMIS */}
      <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
        {/* PILL ONLINE COUNT */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 shrink-0 border border-white/5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>
            Online ({onlineUsers.length + (adminStat.online ? 1 : 0)})
          </span>
        </div>

        {/* PILL ADMIN STATUS */}
        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 bg-black/20 border border-white/5 ${adminStat.online ? "text-emerald-400" : "opacity-60"}`} style={{ color: adminStat.online ? undefined : "var(--foreground)" }}>
          Admin ({adminStat.online ? "Online" : "Offline"})
        </div>

        {/* PILL USER ONLINE */}
        {onlineUsers.map((u: string) => (
          <div key={u} className="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 bg-black/20 border border-white/5" style={{ color: "var(--foreground)" }}>
            {u}
          </div>
        ))}

        {/* PILL PESAN SEMATAN DINAMIS (SAMPLING DI BARIS ONLINE) */}
        {pinnedMsg && pinnedMsg.pesan !== "___DELETED___" && (
          <div
            onClick={() => onScrollToMsg?.(pinnedMsg.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all active:scale-95 cursor-pointer max-w-[180px] sm:max-w-[260px] shrink-0 shadow-sm ml-auto"
            style={{
              backgroundColor: "var(--card-bg, rgba(255,255,255,0.05))",
              borderColor: "var(--accent, #eab308)",
            }}
            title="Klik untuk melihat pesan sematan"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent, #eab308)" }}>
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
            <span className="text-[9px] font-bold uppercase tracking-wider shrink-0" style={{ color: "var(--accent, #eab308)" }}>
              Pin:
            </span>
            <span className="text-[10px] font-medium truncate leading-none" style={{ color: "var(--foreground, #ffffff)" }}>
              {pinnedMsg.pesan}
            </span>
            {ui.tab === "admin" && onEditPinned && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditPinned(pinnedMsg);
                }}
                className="ml-1 p-0.5 hover:opacity-80 shrink-0"
                title="Edit Pesan Sematan"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent, #eab308)" }}>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}