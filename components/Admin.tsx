"use client";
import { useState, useEffect, useRef } from "react";

interface AdminProps {
  privateUsers: any[];
  setSelectedPrivateUser: (username: string) => void;
  formatMessageTime: (time: any) => string;
  onDeleteAllMsgs?: (username: string) => void;
  onDeleteUser?: (username: string) => void;
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
  onUpdatePin,
  onUpdateUsername,
  onRefresh
}: AdminProps) {
  const [readBaselines, setReadBaselines] = useState<Record<string, number>>({});
  const [promptState, setPromptState] = useState<{
    isOpen: boolean; title: string; value: string; onConfirm: (val: string) => void;
  }>({ isOpen: false, title: "", value: "", onConfirm: () => {} });

  const [clearedUserMsgs, setClearedUserMsgs] = useState<Record<string, boolean>>({});

  // State & Ref untuk Dropdown Dinamis di Admin
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<"top" | "bottom">("top");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReadBaselines((prev) => {
      let hasChanges = false;
      const nextBaselines = { ...prev };
      privateUsers.forEach((user: any) => {
        const currentTotal = user.totalUserMsgs || 0;
        if (nextBaselines[user.username] === undefined || currentTotal < nextBaselines[user.username]) {
          nextBaselines[user.username] = Math.max(0, currentTotal - (user.count || 0));
          hasChanges = true;
        }
      });
      return hasChanges ? nextBaselines : prev;
    });
  }, [privateUsers]);

  // Hitung posisi terbawa / teratas untuk popup dropdown
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

  // Tutup dropdown jika klik di luar
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

  return (
    <div className="flex flex-col min-h-full p-3 gap-4 relative pb-44">
      {/* LIST KARTU USER */}
      <div className="space-y-3 flex-1">
        {privateUsers.map((user: any, index: number) => {
          const identifier = user.username || `anonymous-${index}`;
          const isCleared = clearedUserMsgs[user.username];
          
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
            <div key={identifier} onClick={() => handleUserClick(user)} className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col group gap-2 border" style={{ borderColor: "var(--card-border)" }}>
              <div className="flex justify-between items-center w-full gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  {/* TOMBOL EDIT USERNAME DI KIRI */}
                  <button onClick={(e) => handleEditUsername(e, user)} className="text-gray-400 hover:text-blue-600 p-0.5 rounded transition-colors text-xs shrink-0" title="Edit Username">✏️</button>
                  {/* USERNAME */}
                  <span className="font-bold text-blue-700 text-sm sm:text-base tracking-tight truncate max-w-[210px] sm:max-w-[280px]" title={user.username || 'User Tanpa Nama'}>{user.username || 'User Tanpa Nama'}</span>
                </div>
                <div className={`text-[10px] sm:text-xs font-medium whitespace-nowrap shrink-0 text-right ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>{user.last_active ? formatMessageTime(user.last_active) : "-"}</div>
              </div>

              <div className="flex justify-between items-center w-full gap-2 my-0.5">
                <div className={`text-xs font-medium truncate flex-1 min-w-0 ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>{lastMsg}</div>
                {(user.umur || user.berat) && (
                  <div className="flex gap-1.5 shrink-0 justify-end items-center">
                    {user.umur && <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">U: {user.umur}</span>}
                    {user.berat && <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200 whitespace-nowrap">B: {user.berat}</span>}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end pt-2 border-t border-gray-100 w-full gap-2">
                <div className="flex gap-1.5 items-center">
                  <button onClick={(e) => handleEditPin(e, user)} className="bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white text-[9px] font-black px-2 py-1 rounded shadow-sm border border-amber-200 hover:border-amber-500 transition-colors uppercase tracking-wider flex items-center gap-1" title="Klik untuk edit PIN user">🔑 PIN: {user.pin || '---'}</button>
                  <button onClick={(e) => handleDeleteAll(e, user.username)} className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white text-[9px] font-black px-2 py-1 rounded shadow-sm border border-orange-200 hover:border-orange-600 transition-colors uppercase tracking-wider">DELETE ALL</button>
                </div>
                <div className="flex gap-1.5 items-center shrink-0">
                  {hasUnread ? <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap animate-pulse">{displayCount} Baru</span> : <span className="bg-gray-400 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap">0</span>}
                  <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap" title="Total pesan dikirim oleh user">👤 {totalUserMsgs}</span>
                  <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-sm whitespace-nowrap" title="Total balasan admin ke user">⭐ {totalAdminMsgs}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* KOLOM KONTROL PUTIH (FROZEN DI ATAS NAVBAR BOTTOM) */}
      <div className="fixed bottom-[65px] left-3 right-3 z-40 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-gray-200 shadow-2xl flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-gray-500">Pilih obrolan di atas</span>
        </div>

        <div className="flex items-center gap-2">
          {/* DROPDOWN DINAMIS (ROLL) */}
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen((p) => !p)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold rounded-xl px-3 py-2 flex items-center justify-between text-left truncate active:scale-95 transition-all cursor-pointer"
            >
              <span className="truncate">Pilih user...</span>
              <span className="text-gray-400 text-[10px] ml-1 shrink-0">
                {isUserDropdownOpen ? (dropdownPosition === "top" ? "▲" : "▼") : "▼"}
              </span>
            </button>

            {/* POPUP MENU ROLL FULL LEBAR LAYAR HORISONTAL */}
            {isUserDropdownOpen && (
              <div
                className={`fixed left-2 right-2 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-[48vh] overflow-y-auto z-[99999] p-2 flex flex-col gap-1 transition-all ${
                  dropdownPosition === "top" ? "bottom-[145px]" : "top-[calc(100vh-120px)]"
                }`}
              >
                {privateUsers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-gray-400 font-medium">
                    Tidak ada user terdaftar
                  </div>
                ) : (
                  privateUsers.map((u: any, idx: number) => {
                    const username = typeof u === "string" ? u : u.username;
                    const pin = typeof u === "object" ? u.pin : null;
                    const umur = typeof u === "object" ? u.umur : null;
                    const berat = typeof u === "object" ? u.berat : null;
                    
                    // Hitung jumlah chat user
                    const userMsgs = typeof u === "object" ? (u.totalUserMsgs || 0) : 0;
                    const adminMsgs = typeof u === "object" ? (u.totalAdminMsgs || 0) : 0;
                    const totalChats = userMsgs + adminMsgs || (typeof u === "object" ? u.count : 0) || 0;

                    return (
                      <div
                        key={username || idx}
                        className="w-full px-2.5 py-2 hover:bg-blue-50/80 rounded-xl text-xs font-bold text-gray-700 flex items-center justify-between transition-colors border-b border-gray-100 last:border-0 gap-2"
                      >
                        {/* KIRI: TOMBOL HAPUS + USERNAME (20 HURUF) + PIN */}
                        <div
                          onClick={() => {
                            setSelectedPrivateUser(username);
                            setIsUserDropdownOpen(false);
                          }}
                          className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer"
                        >
                          {/* TOMBOL HAPUS (KIRI USERNAME) */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Hapus akun user "${username}" secara permanen?`)) {
                                onDeleteUser && onDeleteUser(username);
                              }
                            }}
                            className="px-2 py-0.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 rounded-lg transition-colors text-[10px] font-bold shrink-0 cursor-pointer"
                            title="Hapus User"
                          >
                            Hapus
                          </button>

                          {/* USERNAME (RESPONSIF UP TO 20 HURUF) */}
                          <span
                            className="truncate text-blue-900 font-extrabold max-w-[20ch] shrink-0"
                            title={username || `User #${idx + 1}`}
                          >
                            {username || `User #${idx + 1}`}
                          </span>

                          {/* PIN (KANAN USERNAME) */}
                          {pin && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                              PIN: {pin}
                            </span>
                          )}
                        </div>

                        {/* KANAN: INFO CHAT, UMUR, DAN BERAT */}
                        <div
                          onClick={() => {
                            setSelectedPrivateUser(username);
                            setIsUserDropdownOpen(false);
                          }}
                          className="flex gap-1 shrink-0 items-center cursor-pointer"
                        >
                          {totalChats > 0 && (
                            <span className="text-[8px] font-extrabold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 whitespace-nowrap" title="Jumlah Chat">
                              {totalChats} chat
                            </span>
                          )}
                          {umur && (
                            <span className="text-[8px] font-extrabold bg-gray-100 text-gray-600 px-1 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                              U: {umur}
                            </span>
                          )}
                          {berat && (
                            <span className="text-[8px] font-extrabold bg-gray-100 text-gray-600 px-1 py-0.5 rounded border border-gray-200 whitespace-nowrap">
                              B: {berat}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* JUMLAH USER & TOMBOL REFRESH */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="bg-gray-100 text-gray-800 text-xs font-bold px-2.5 py-2 rounded-xl border border-gray-300 whitespace-nowrap">
              {privateUsers.length} User
            </div>
            <button
              type="button"
              onClick={() => onRefresh ? onRefresh() : window.location.reload()}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs px-3 py-2 rounded-xl shadow transition-all tracking-wider uppercase cursor-pointer whitespace-nowrap"
            >
              REFRESH
            </button>
          </div>
        </div>
      </div>

      {/* POPUP PROMPT EDIT */}
      {promptState.isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none" onClick={() => setPromptState((p) => ({ ...p, isOpen: false }))}>
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