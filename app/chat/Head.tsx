"use client";
import React from "react";

interface HeadProps {
  auth: {
    isAuth: boolean;
    user: string;
  };
  ui: {
    tab: "user" | "admin";
  };
  adminStat: {
    online: boolean;
    offlineTime: string;
  };
  onlineUsers: string[];
  currentHash: string;
  getFmt: {
    greet: () => string;
  };
  handleLogout: () => void;
}

export default function Head({
  auth,
  ui,
  adminStat,
  onlineUsers,
  currentHash,
  getFmt,
  handleLogout,
}: HeadProps) {
  if (currentHash === "#block") return null;

  return (
    <div className="sticky top-0 z-20 flex flex-col bg-emerald-900/30 backdrop-blur-md">
      <div className="p-3 relative">
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 text-[10px] bg-red-500/80 text-white px-3 py-1 rounded-full shadow backdrop-blur-sm z-30"
        >
          Keluar
        </button>
        <div className="flex justify-between items-center text-white relative z-20">
          <div className="flex flex-col max-w-[65%]">
            <span className="text-[10px] text-white/70 uppercase tracking-wider">
              {getFmt.greet()}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold text-white">
                {auth.user || "Guest"}
              </span>
            </div>
          </div>
          <div className="text-center flex-1 flex flex-col items-end mr-16">
            <a
              href="https://ipix.my.id"
              target="_blank"
              className="text-emerald-400 font-bold text-sm underline"
            >
              ipix.my.id
            </a>
          </div>
        </div>
      </div>

      {auth.isAuth && ui.tab === "admin" && (
        <div className="flex items-center overflow-x-auto gap-2 px-3 py-1.5 border-t border-b text-xs whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-emerald-400/20 bg-emerald-950/40">
          <span className="font-bold text-white flex items-center mr-1">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 shadow-[0_0_5px_#22c55e] animate-pulse" />
            Online ({onlineUsers.length + (adminStat.online ? 1 : 0)})
          </span>
          {adminStat.online && (
            <span className="bg-red-600/90 text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm">
              Admin
            </span>
          )}
          {onlineUsers.map((u) => (
            <span
              key={u}
              className="bg-white/20 text-white/90 px-2.5 py-0.5 rounded-full text-[10px] border border-white/10 shadow-sm"
            >
              {u.split("●")[0]}
            </span>
          ))}
          {onlineUsers.length === 0 && !adminStat.online && (
            <span className="text-white/40 italic text-[10px]">Sepi...</span>
          )}
        </div>
      )}
    </div>
  );
}