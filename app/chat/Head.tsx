"use client";
import React, { useState } from "react";

export interface HeadProps {
  auth: any;
  ui: any;
  adminStat: any;
  onlineUsers: string[];
  currentHash: string;
  getFmt: any;
  handleLogout: () => void;
  onBlockMgr: () => void;
  onTrashMgr: () => void;
  adminPinnedMsg?: any;
  userPinnedMsg?: any;
  onEditPinned?: (msg: any) => void;
  onScrollToMsg?: (id: number) => void;
}

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
  adminPinnedMsg,
  userPinnedMsg,
  onEditPinned,
  onScrollToMsg,
}: HeadProps) {
  const [isOnlineExpanded, setIsOnlineExpanded] = useState(false);
  const isMsgAdmin = auth.user === "Admin●ipix.my.id";
  const totalOnline = onlineUsers.length + (adminStat.online ? 1 : 0);

  const displayUserName = auth.user ? auth.user.split("●")[0] : "Pengunjung";
  const userPinName = userPinnedMsg ? userPinnedMsg.username.split("●")[0] : displayUserName;

  return (
    <header className="w-full shrink-0 p-3 sm:p-4 border-b transition-colors duration-300 z-30 relative" style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}>
      <div className="relative z-10">
        {/* BARIS ATAS: SALAM & TOMBOL AKSI */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xs font-bold uppercase tracking-wider opacity-60" style={{ color: "var(--foreground)" }}>
              {getFmt.greet()}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-sm font-black tracking-wide" style={{ color: "var(--foreground-heading, var(--foreground))" }}>
                {isMsgAdmin ? "Admin" : displayUserName}
              </span>
              {!isMsgAdmin && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
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

            {/* TOMBOL KELUAR (Hanya tampil jika auth.user terisi, berlaku untuk Admin & User) */}
            {auth.user && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all active:scale-95"
              >
                Keluar
              </button>
            )}
          </div>
        </div>

        {/* HEADER ADMIN: STATUS ONLINE DENGAN SEGITIGA PULL DOWN & TANPA TEKS ADMIN ONLINE / KELIP HIJAU */}
        {isMsgAdmin && (
          <div className="mt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsOnlineExpanded(!isOnlineExpanded)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 shrink-0 border border-white/5 active:scale-95 transition-all cursor-pointer"
              >
                <span className="text-[10px] font-bold" style={{ color: "var(--foreground)" }}>
                  Online ({totalOnline})
                </span>
                {onlineUsers.length > 2 && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-3 h-3 transition-transform duration-200 ${isOnlineExpanded ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ color: "var(--foreground)" }}
                  >
                    <path d="M12 15l-5-5h10z" />
                  </svg>
                )}
              </button>

              {/* DAFTAR HORISONTAL KETIKA TIDAK DI-EXPAND */}
              {!isOnlineExpanded && (
                <div className="flex items-center gap-2 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden py-0.5">
                  {onlineUsers.map((u: string) => (
                    <div key={u} className="px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 bg-black/20 border border-white/5" style={{ color: "var(--foreground)" }}>
                      {u}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DAFTAR USER ONLINE PULL DOWN KETIKA DI-EXPAND */}
            {isOnlineExpanded && (
              <div className="flex flex-wrap gap-1.5 mt-2 p-2 rounded-xl bg-black/30 border border-white/10 max-h-36 overflow-y-auto">
                {onlineUsers.map((u: string) => (
                  <div key={u} className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/40 border border-white/10" style={{ color: "var(--foreground)" }}>
                    {u}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HEADER USER: SEMATAN DUA KOLOM + STATUS ADMIN DINAMIS */}
        {!isMsgAdmin && (
          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            {/* KOLOM KIRI: SEMATAN ADMIN */}
            <div 
              onClick={() => adminPinnedMsg && onScrollToMsg?.(adminPinnedMsg.id)} 
              className={`p-2 rounded-xl transition-all border backdrop-blur-md relative shadow-sm flex items-center gap-1.5 ${adminPinnedMsg ? "cursor-pointer active:scale-[0.98]" : "opacity-40"}`}
              style={{ 
                backgroundColor: "var(--card-bg, rgba(255,255,255,0.05))", 
                borderColor: "var(--card-border)" 
              }}
            >
              <div className="shrink-0 opacity-90" style={{ color: "var(--accent)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17v5" />
                  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <div className="flex items-center gap-1 max-w-full overflow-hidden">
                  <span className="text-[9px] font-bold uppercase tracking-wider shrink-0" style={{ color: "var(--accent)" }}>
                    Admin
                  </span>
                  <span className={`text-[8px] font-bold truncate ${adminStat.online ? "text-emerald-400" : "opacity-60"}`} style={{ color: adminStat.online ? undefined : "var(--foreground)" }}>
                    ({adminStat.online ? "Online" : adminStat.offlineTime ? `Offline ${adminStat.offlineTime}` : "Offline"})
                  </span>
                </div>
                <p className="text-[11px] truncate font-medium leading-tight opacity-90" style={{ color: "var(--foreground)" }}>
                  {adminPinnedMsg ? adminPinnedMsg.pesan : "Belum ada sematan"}
                </p>
              </div>
            </div>

            {/* KOLOM KANAN: SEMATAN USER */}
            <div 
              onClick={() => userPinnedMsg && onScrollToMsg?.(userPinnedMsg.id)} 
              className={`p-2 rounded-xl transition-all border backdrop-blur-md relative shadow-sm flex items-center gap-1.5 ${userPinnedMsg ? "cursor-pointer active:scale-[0.98]" : "opacity-40"}`}
              style={{ 
                backgroundColor: "var(--card-bg, rgba(255,255,255,0.05))", 
                borderColor: "var(--card-border)" 
              }}
            >
              <div className="shrink-0 opacity-90" style={{ color: "var(--accent)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17v5" />
                  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 overflow-hidden">
                <span className="text-[9px] font-bold uppercase tracking-wider truncate" style={{ color: "var(--accent)" }}>
                  {userPinName}
                </span>
                <p className="text-[11px] truncate font-medium leading-tight opacity-90" style={{ color: "var(--foreground)" }}>
                  {userPinnedMsg ? userPinnedMsg.pesan : "Belum ada sematan"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}