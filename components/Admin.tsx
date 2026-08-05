"use client";
import { useState, useEffect, useRef } from "react";

interface AdminProps {
  privateUsers: any[];
  setSelectedPrivateUser: (username: string) => void;
  formatMessageTime: (time: any) => string;
  onDeleteAllMsgs?: (username: string) => void;
  onDeleteUser?: (username: string) => void;
  onBlockUser?: (username: string) => void;
  onUpdatePin?: (username: string, newPin: string) => void;
  onUpdateUsername?: (oldUsername: string, newUsername: string) => void;
  onRefresh?: () => void;
}

export default function Admin({
  privateUsers = [],
  setSelectedPrivateUser,
  formatMessageTime,
  onDeleteAllMsgs,
  onDeleteUser,
  onBlockUser,
  onUpdatePin,
  onUpdateUsername,
  onRefresh
}: AdminProps) {
  const [readBaselines, setReadBaselines] = useState<Record<string, number>>({});
  const [promptState, setPromptState] = useState<{
    isOpen: boolean; title: string; value: string; onConfirm: (val: string) => void;
  }>({ isOpen: false, title: "", value: "", onConfirm: () => {} });

  const [clearedUserMsgs, setClearedUserMsgs] = useState<Record<string, boolean>>({});
  const [highlightedUser, setHighlightedUser] = useState<string | null>(null);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">("top");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredUsers = privateUsers.filter((u: any) => {
    const name = (typeof u === "string" ? u : u.username || "").toLowerCase();
    const email = (typeof u === "object" && u.email ? u.email : "").toLowerCase();
    return !name.includes("admin") && !email.includes("admin");
  });

  useEffect(() => {
    setReadBaselines((prev) => {
      let hasChanges = false;
      const nextBaselines = { ...prev };
      filteredUsers.forEach((user: any) => {
        const currentTotal = user.totalUserMsgs || 0;
        if (nextBaselines[user.username] === undefined || currentTotal < nextBaselines[user.username]) {
          nextBaselines[user.username] = Math.max(0, currentTotal - (user.count || 0));
          hasChanges = true;
        }
      });
      return hasChanges ? nextBaselines : prev;
    });
  }, [privateUsers]);

  useEffect(() => {
    if (isUserDropdownOpen && dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow > spaceAbove && spaceBelow > 200) {
        setDropdownPosition("bottom");
      } else {
        setDropdownPosition("top");
      }
    }
  }, [isUserDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleUserClick = (user: any) => {
    const username = typeof user === "string" ? user : user.username;
    setSelectedPrivateUser(username);
    setReadBaselines((prev) => ({ ...prev, [username]: user.totalUserMsgs || 0 }));
  };

  const handleSelectFromDropdown = (username: string) => {
    setIsUserDropdownOpen(false);
    setHighlightedUser(username);
    const cardEl = document.getElementById(`user-card-${username}`);
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setTimeout(() => {
      setHighlightedUser(null);
    }, 2500);
  };

  const handleEditPin = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const currentPin = user.pin || "";
    setPromptState({
      isOpen: true,
      title: `Edit PIN untuk user (${user.username}):`,
      value: currentPin,
      onConfirm: (val) => {
        if (val.trim() !== "" && val.trim() !== currentPin) {
          onUpdatePin && onUpdatePin(user.username, val.trim());
        }
      }
    });
  };

  const handleEditUsername = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    const currentName = user.username || "";
    setPromptState({
      isOpen: true,
      title: `Edit Username untuk (${currentName}):`,
      value: currentName,
      onConfirm: (val) => {
        if (val.trim() !== "" && val.trim() !== currentName) {
          onUpdateUsername && onUpdateUsername(currentName, val.trim());
        }
      }
    });
  };

  const handleDeleteAll = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    if (confirm(`Hapus semua pesan untuk user "${username}"? User tidak akan terhapus.`)) {
      setClearedUserMsgs((prev) => ({ ...prev, [username]: true }));
      setReadBaselines((prev) => ({ ...prev, [username]: 0 }));
      onDeleteAllMsgs && onDeleteAllMsgs(username);
    }
  };

  // EKSEKUSI HAPUS USER
  const handleDeleteUserAccount = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    if (onDeleteUser) {
      onDeleteUser(username);
    }
  };

  // EKSEKUSI BLOKIR USER
  const handleBlockUserAccount = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    if (onBlockUser) {
      onBlockUser(username);
    }
  };

  return (
    <div className="flex flex-col min-h-full p-2.5 gap-3 relative pb-32">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shakeGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0px transparent; }
          10%, 30%, 50%, 70%, 90% { transform: scale(1.02) translateX(-4px); }
          20%, 40%, 60%, 80% { transform: scale(1.02) translateX(4px); }
          15%, 85% { border-color: #f59e0b !important; box-shadow: 0 0 20px rgba(245, 158, 11, 0.8), inset 0 0 10px rgba(245, 158, 11, 0.3); }
        }
        .active-card-highlight {
          animation: shakeGlow 2.2s cubic-bezier(.36,.07,.19,.97) both !important;
          border-width: 2px !important;
          border-color: #f59e0b !important;
          z-index: 10;
        }
      ` }} />

      {/* LIST KARTU USER BESAR */}
      <div className="space-y-2.5 flex-1">
        {filteredUsers.length === 0 ? (
          <div className="bg-white p-5 rounded-2xl border text-center text-gray-400 font-medium text-xs">
            Belum ada user terdaftar.
          </div>
        ) : (
          filteredUsers.map((user: any, index: number) => {
            const identifier = user.username || `anonymous-${index}`;
            const isCleared = clearedUserMsgs[user.username];
            const isHighlighted = highlightedUser === user.username;
            
            const totalUserMsgs = isCleared ? 0 : (user.totalUserMsgs || 0);
            const totalAdminMsgs = isCleared ? 0 : (user.totalAdminMsgs || 0);
            const baseline = readBaselines[user.username];
            
            let displayCount = isCleared 
              ? 0 
              : (baseline !== undefined ? Math.max(0, totalUserMsgs - baseline) : (user.count || 0));
            
            const hasUnread = displayCount > 0;
            const lastMsg = isCleared 
              ? "-" 
              : (user.last_message === "___DELETED___" 
                  ? "(Pesan dihapus)" 
                  : user.last_message || "(Belum ada pesan)");

            return (
              <div 
                key={identifier} 
                id={`user-card-${user.username}`}
                onClick={() => handleUserClick(user)} 
                className={`bg-white p-3.5 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col group gap-1.5 border ${
                  isHighlighted ? "active-card-highlight" : ""
                }`} 
                style={{ borderColor: isHighlighted ? "#f59e0b" : "var(--card-border)" }}
              >
                <div className="flex justify-between items-center w-full gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <button onClick={(e) => handleEditUsername(e, user)} className="text-gray-400 hover:text-blue-600 p-0.5 rounded transition-colors text-xs shrink-0" title="Edit Username">✏️</button>
                    <span className="font-bold text-blue-700 text-xs sm:text-sm tracking-tight truncate max-w-[210px] sm:max-w-[280px]" title={user.username || 'User Tanpa Nama'}>
                      {user.username || 'User Tanpa Nama'}
                    </span>
                  </div>
                  <div className={`text-[10px] font-medium whitespace-nowrap shrink-0 text-right ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                    {user.last_active ? formatMessageTime(user.last_active) : "-"}
                  </div>
                </div>

                <div className="flex justify-between items-center w-full gap-2 my-0.5">
                  <div className={`text-xs font-medium truncate flex-1 min-w-0 ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                    {lastMsg}
                  </div>
                  {(user.umur || user.berat) && (
                    <div className="flex gap-1 shrink-0 justify-end items-center">
                      {user.umur && <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">U: {user.umur}</span>}
                      {user.berat && <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">B: {user.berat}</span>}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end pt-1.5 border-t border-gray-100 w-full gap-2">
                  <div className="flex gap-1 items-center">
                    <button onClick={(e) => handleEditPin(e, user)} className="bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs border border-amber-200 hover:border-amber-500 transition-colors uppercase tracking-wider flex items-center gap-1" title="Klik untuk edit PIN user">🔑 PIN: {user.pin || '---'}</button>
                    <button onClick={(e) => handleDeleteAll(e, user.username)} className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs border border-orange-200 hover:border-orange-600 transition-colors uppercase tracking-wider">DELETE ALL</button>
                  </div>
                  <div className="flex gap-1 items-center shrink-0">
                    {hasUnread ? <span className="bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap animate-pulse">{displayCount} Baru</span> : <span className="bg-gray-400 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap">0</span>}
                    <span className="bg-blue-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap" title="Total pesan dikirim oleh user">👤 {totalUserMsgs}</span>
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs whitespace-nowrap" title="Total balasan admin ke user">⭐ {totalAdminMsgs}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* KOLOM KONTROL UTAMA DI BAWAH */}
      <div className="fixed bottom-[52px] left-2.5 right-2.5 z-40 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-gray-200 shadow-xl flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen((p) => !p)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg px-2.5 py-1.5 flex items-center justify-between text-left truncate active:scale-95 transition-all cursor-pointer"
            >
              <span className="truncate">Pilih user ({filteredUsers.length})...</span>
              <span className="text-gray-400 text-[10px] ml-1 shrink-0">
                {isUserDropdownOpen ? (dropdownPosition === "top" ? "▲" : "▼") : "▼"}
              </span>
            </button>

            {/* POPUP PULL-DOWN / PULL-UP */}
            {isUserDropdownOpen && (
              <div
                className={`fixed left-2 right-2 bg-slate-100 border border-slate-300 rounded-xl shadow-2xl max-h-[320px] overflow-y-auto z-[99999] p-1.5 flex flex-col gap-1 transition-all ${
                  dropdownPosition === "top" ? "bottom-[95px]" : "top-[calc(100vh-100px)]"
                }`}
              >
                {filteredUsers.length === 0 ? (
                  <div className="p-2.5 text-center text-xs text-gray-400 font-medium">
                    Tidak ada user terdaftar
                  </div>
                ) : (
                  filteredUsers.map((u: any, idx: number) => {
                    const username = typeof u === "string" ? u : u.username;
                    const umur = typeof u === "object" && u.umur ? u.umur : "-";
                    const berat = typeof u === "object" && u.berat ? u.berat : "-";
                    const userMsgs = typeof u === "object" ? (u.totalUserMsgs || 0) : 0;
                    const adminMsgs = typeof u === "object" ? (u.totalAdminMsgs || 0) : 0;
                    const totalPesan = userMsgs + adminMsgs;

                    return (
                      <div
                        key={username || idx}
                        className="w-full px-2 py-1.5 bg-white hover:bg-blue-50/90 rounded-lg text-xs font-bold text-gray-800 flex items-center justify-between transition-colors border border-slate-200/80 gap-1.5"
                      >
                        {/* KIRI: TOMBOL HAPUS + NAMA USER */}
                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteUserAccount(e, username)}
                            className="px-1.5 py-0.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 rounded text-[9px] font-bold shrink-0 cursor-pointer transition-colors"
                            title="Hapus User dari Supabase"
                          >
                            Hapus
                          </button>

                          <span
                            onClick={() => handleSelectFromDropdown(username)}
                            className="truncate text-blue-900 font-extrabold flex-1 min-w-0 cursor-pointer"
                            title={username}
                          >
                            {username || `User #${idx + 1}`}
                          </span>
                        </div>

                        {/* KANAN: STATISTIK & TOMBOL BLOKIR */}
                        <div className="flex items-center gap-1 shrink-0">
                          <div
                            onClick={() => handleSelectFromDropdown(username)}
                            className="bg-gray-50 text-[10px] font-black px-2 py-0.5 rounded-full border border-gray-200 whitespace-nowrap shadow-2xs flex items-center gap-0.5 cursor-pointer"
                          >
                            <span className="text-emerald-600">{umur}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-red-500">{berat}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-blue-600">{totalPesan}</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleBlockUserAccount(e, username)}
                            className="px-1.5 py-0.5 bg-red-100 hover:bg-red-600 text-red-700 hover:text-white border border-red-300 rounded-full text-[9px] font-extrabold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-0.5 shadow-2xs"
                            title="Blokir User"
                          >
                            🚫 Blokir
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <div className="bg-blue-50 text-blue-800 text-[11px] font-extrabold px-2 py-1.5 rounded-lg border border-blue-200 whitespace-nowrap">
              {filteredUsers.length} User
            </div>
            <button
              type="button"
              onClick={() => onRefresh ? onRefresh() : window.location.reload()}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-[11px] px-2.5 py-1.5 rounded-lg shadow-xs transition-all tracking-wider uppercase cursor-pointer whitespace-nowrap"
            >
              REFRESH
            </button>
          </div>
        </div>
      </div>

      {promptState.isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none" onClick={() => setPromptState((p) => ({ ...p, isOpen: false }))}>
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-scaleUp text-white" onClick={(e) => e.stopPropagation()}>
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xl shadow-inner">✏️</div>
            <h3 className="text-sm font-bold text-slate-200 tracking-wide">{promptState.title}</h3>
            <input
              type="text" autoFocus value={promptState.value}
              onChange={(e) => setPromptState((p) => ({ ...p, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptState.onConfirm(promptState.value);
                  setPromptState((p) => ({ ...p, isOpen: false }));
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
            />
            <div className="grid grid-cols-2 gap-2.5 w-full mt-1">
              <button type="button" onClick={() => setPromptState((p) => ({ ...p, isOpen: false }))} className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all active:scale-95 border border-slate-700">Batal</button>
              <button type="button" onClick={() => { promptState.onConfirm(promptState.value); setPromptState((p) => ({ ...p, isOpen: false })); }} className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 border border-blue-500/50">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}