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
    <div 
      className="sticky top-0 z-20 flex flex-col backdrop-blur-md border-b transition-colors duration-300"
      style={{ 
        backgroundColor: "color-mix(in srgb, var(--background) 85%, transparent)",
        borderColor: "var(--card-border)"
      }}
    >
      <div className="p-3 relative">
        <button
          onClick={handleLogout}
          className="absolute top-3.5 right-4 text-[10px] bg-red-600/80 hover:bg-red-600 text-white px-3 py-1 rounded-full shadow backdrop-blur-sm z-30 transition-all font-semibold active:scale-95"
        >
          Keluar
        </button>

        <div className="flex justify-between items-center relative z-20">
          <div className="flex flex-col max-w-[65%]">
            <span 
              className="text-[10px] uppercase tracking-wider font-medium opacity-80"
              style={{ color: "var(--foreground)" }}
            >
              {getFmt.greet()}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span 
                className="text-[11px] font-bold"
                style={{ color: "var(--foreground-heading)" }}
              >
                {auth.user || "Guest"}
              </span>
            </div>
          </div>

          <div className="text-center flex-1 flex flex-col items-end mr-16">
            <a
              href="https://ipix.my.id"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm underline transition-colors hover:opacity-80"
              style={{ color: "var(--accent)" }}
            >
              ipix.my.id
            </a>
          </div>
        </div>
      </div>

      {/* Baris Status Online (Menu Admin) */}
      {auth.isAuth && ui.tab === "admin" && (
        <div 
          className="flex items-center overflow-x-auto gap-2 px-3 py-1.5 border-t text-xs whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] transition-colors duration-300"
          style={{ 
            backgroundColor: "var(--card-bg)",
            borderColor: "var(--card-border)"
          }}
        >
          <span 
            className="font-bold flex items-center mr-1"
            style={{ color: "var(--foreground-heading)" }}
          >
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
              className="px-2.5 py-0.5 rounded-full text-[10px] border shadow-sm transition-colors"
              style={{ 
                backgroundColor: "var(--card-bg)",
                color: "var(--foreground)",
                borderColor: "var(--card-border)"
              }}
            >
              {u.split("●")[0]}
            </span>
          ))}

          {onlineUsers.length === 0 && !adminStat.online && (
            <span 
              className="italic text-[10px] opacity-60"
              style={{ color: "var(--foreground)" }}
            >
              Sepi...
            </span>
          )}
        </div>
      )}
    </div>
  );
}