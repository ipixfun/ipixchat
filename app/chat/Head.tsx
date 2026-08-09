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

  const renderContentWithIcon = (msg: any) => {
    if (!msg) return "Belum ada sematan";

    return (
      <span className="flex items-center gap-1.5 truncate">
        {/* Icon SVG Gambar */}
        {msg.image_url && (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        )}

        {/* Icon SVG Voice Note */}
        {msg.audio_url && (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="22" />
          </svg>
        )}

        <span className="truncate">
          {msg.pesan && !msg.pesan.startsWith("___")
            ? msg.pesan
            : msg.image_url
            ? "Gambar"
            : msg.audio_url
            ? "Voice Note"
            : "Sematkan"}
        </span>
      </span>
    );
  };

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
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all active:scale-95 cursor-pointer"
                >
                  Blokir
                </button>
                <button
                  type="button"
                  onClick={onTrashMgr}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition-all active:scale-95 cursor-pointer"
                >
                  Sampah
                </button>
              </>
            )}

            {/* TOMBOL KELUAR */}
            {auth.user && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                Keluar
              </button>
            )}
          </div>
        </div>

        {/* HEADER ADMIN: STATUS ONLINE */}
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

        {/* HEADER USER: SEMATAN DUA KOLOM DENGAN ICON SVG KONSISTEN */}
        {!isMsgAdmin && (
          <div className="grid grid-cols-2 gap-2 w-full mt-2">
            {/* KOLOM KIRI: SEMATAN ADMIN */}
            <div
              onClick={() => adminPinnedMsg && onScrollToMsg?.(adminPinnedMsg.id)}
              className={`p-2 rounded-xl transition-all border backdrop-blur-md relative shadow-sm flex items-center gap-1.5 ${adminPinnedMsg ? "cursor-pointer active:scale-[0.98]" : "opacity-40"}`}
              style={{
                backgroundColor: "var(--card-bg, rgba(255,255,255,0.05))",
                borderColor: "var(--card-border)",
              }}
            >
              {/* Icon SVG Jarum Pin */}
              <div className="shrink-0 opacity-90" style={{ color: "var(--accent)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17v5" />
                  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 1 1 1z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                <div className="flex items-center gap-1 max-w-full overflow-hidden" style={{ color: "var(--accent)" }}>
                  {/* Icon SVG Shield Admin */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span className="text-[9px] font-bold uppercase tracking-wider shrink-0">
                    Admin
                  </span>
                  <span className={`text-[8px] font-bold truncate ${adminStat.online ? "text-emerald-400" : "opacity-60"}`} style={{ color: adminStat.online ? undefined : "var(--foreground)" }}>
                    ({adminStat.online ? "Online" : adminStat.offlineTime ? `Offline ${adminStat.offlineTime}` : "Offline"})
                  </span>
                </div>
                <p className="text-[11px] truncate font-medium leading-tight opacity-90" style={{ color: "var(--foreground)" }}>
                  {renderContentWithIcon(adminPinnedMsg)}
                </p>
              </div>
            </div>

            {/* KOLOM KANAN: SEMATAN USER */}
            <div
              onClick={() => userPinnedMsg && onScrollToMsg?.(userPinnedMsg.id)}
              className={`p-2 rounded-xl transition-all border backdrop-blur-md relative shadow-sm flex items-center gap-1.5 ${userPinnedMsg ? "cursor-pointer active:scale-[0.98]" : "opacity-40"}`}
              style={{
                backgroundColor: "var(--card-bg, rgba(255,255,255,0.05))",
                borderColor: "var(--card-border)",
              }}
            >
              {/* Icon SVG Jarum Pin */}
              <div className="shrink-0 opacity-90" style={{ color: "var(--accent)" }}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 17v5" />
                  <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 1 1 1z" />
                </svg>
              </div>
              <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                <div className="flex items-center gap-1" style={{ color: "var(--accent)" }}>
                  {/* Icon SVG User Avatar */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-[9px] font-bold uppercase tracking-wider truncate">
                    {userPinName}
                  </span>
                </div>
                <p className="text-[11px] truncate font-medium leading-tight opacity-90" style={{ color: "var(--foreground)" }}>
                  {renderContentWithIcon(userPinnedMsg)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}