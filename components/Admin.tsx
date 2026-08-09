"use client";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/app/lib/supabaseClient";

interface AdminProps {
  privateUsers: any[];
  setSelectedPrivateUser: (username: string) => void;
  formatMessageTime: (time: any) => string;
  onDeleteAllMsgs?: (username: string) => void;
  onDeleteUser?: (username: string) => void;
  onBlockUser?: (username: string) => void;
  onUnblockUser?: (username: string) => void;
  blockedList?: any[];
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
  onUnblockUser,
  blockedList = [],
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

  const [isRegisterLocked, setIsRegisterLocked] = useState<boolean>(false);

  // State Rekap Media: User (Biru) vs Admin (Merah)
  const [mediaCounts, setMediaCounts] = useState<Record<string, { 
    userImages: number; 
    userVoices: number; 
    adminImages: number; 
    adminVoices: number; 
  }>>({});

  useEffect(() => {
    const fetchRegisterLockStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("app_settings")
          .select("value")
          .eq("key", "register_locked")
          .maybeSingle();

        if (error) return;

        if (data) {
          const val = String(data.value).toLowerCase().trim();
          const isLocked = val === "true" || val === "1";
          setIsRegisterLocked(isLocked);
          localStorage.setItem("is_register_locked", isLocked ? "true" : "false");
        }
      } catch (e) {}
    };

    const fetchAllMediaCounts = async () => {
      try {
        const { data: msgs, error } = await supabase
          .from("messages")
          .select("*")
          .limit(3000);

        if (error || !msgs) return;

        const countsMap: Record<string, { 
          userImages: number; 
          userVoices: number; 
          adminImages: number; 
          adminVoices: number; 
        }> = {};

        msgs.forEach((m: any) => {
          const rawUname = m.username || m.sender || m.from || "";
          const rawChatWith = m.chat_with || "";

          let uNameLower = String(rawUname).trim().toLowerCase();
          let chatWithLower = String(rawChatWith).trim().toLowerCase();

          let targetUser = "";
          if (uNameLower && !uNameLower.includes("admin")) {
            targetUser = uNameLower;
          } else if (chatWithLower && !chatWithLower.includes("admin")) {
            targetUser = chatWithLower;
          }

          if (!targetUser) return;

          if (!countsMap[targetUser]) {
            countsMap[targetUser] = { userImages: 0, userVoices: 0, adminImages: 0, adminVoices: 0 };
          }

          const txt = String(m.pesan || m.message || m.text || "").toLowerCase();
          const imgUrl = String(m.image_url || m.imageUrl || m.url || "").toLowerCase();
          const audUrl = String(m.audio_url || m.audioUrl || "").toLowerCase();

          const isImg = 
            (imgUrl.length > 5 && !imgUrl.includes("null")) ||
            txt.includes("cloudinary.com") ||
            txt.includes("supabase.co/storage") ||
            txt.includes("data:image") ||
            txt.includes("[gambar]") ||
            /\.(jpg|jpeg|png|webp|gif)$/i.test(txt);

          const isAud = 
            (audUrl.length > 5 && !audUrl.includes("null")) ||
            txt.includes("audio") ||
            txt.includes(".mp3") ||
            txt.includes(".wav") ||
            txt.includes(".ogg") ||
            txt.includes("[voice note]");

          const isAdminMsg = 
            m.is_admin === true || 
            String(m.is_admin) === "true" || 
            String(m.is_admin) === "1" || 
            uNameLower.includes("admin");

          if (isAdminMsg) {
            if (isImg) countsMap[targetUser].adminImages += 1;
            if (isAud) countsMap[targetUser].adminVoices += 1;
          } else {
            if (isImg) countsMap[targetUser].userImages += 1;
            if (isAud) countsMap[targetUser].userVoices += 1;
          }
        });

        setMediaCounts(countsMap);
      } catch (e) {
        console.error("Error Fetch Media Counts:", e);
      }
    };

    fetchRegisterLockStatus();
    fetchAllMediaCounts();

    const channel = supabase
      .channel("admin_realtime_media_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "app_settings" },
        (payload: any) => {
          if (payload.new && payload.new.key === "register_locked") {
            const val = String(payload.new.value).toLowerCase().trim();
            const isLocked = val === "true" || val === "1";
            setIsRegisterLocked(isLocked);
            localStorage.setItem("is_register_locked", isLocked ? "true" : "false");
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "messages" },
        () => {
          fetchAllMediaCounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleToggleRegister = async () => {
    const nextIsLocked = !isRegisterLocked;
    const valueStr = nextIsLocked ? "true" : "false";

    setIsRegisterLocked(nextIsLocked);

    try {
      const { data, error } = await supabase
        .from("app_settings")
        .update({ value: valueStr })
        .eq("key", "register_locked")
        .select();

      if (error) {
        setIsRegisterLocked(!nextIsLocked);
        alert("Gagal update database: " + error.message);
      } else {
        localStorage.setItem("is_register_locked", valueStr);
      }
    } catch (err: any) {
      setIsRegisterLocked(!nextIsLocked);
    }
  };

  const filteredUsers = privateUsers.filter((u: any) => {
    const name = (typeof u === "string" ? u : u.username || "").toLowerCase();
    const email = (typeof u === "object" && u.email ? u.email : "").toLowerCase();
    return !name.includes("admin") && !email.includes("admin");
  });

  const sortedUsers = [...filteredUsers].sort((a: any, b: any) => {
    const aCleared = clearedUserMsgs[a.username];
    const aTotalUser = aCleared ? 0 : (a.totalUserMsgs || 0);
    const aBaseline = readBaselines[a.username];
    const aUnread = aCleared ? 0 : (aBaseline !== undefined ? Math.max(0, aTotalUser - aBaseline) : (a.count || 0));

    const bCleared = clearedUserMsgs[b.username];
    const bTotalUser = bCleared ? 0 : (b.totalUserMsgs || 0);
    const bBaseline = readBaselines[b.username];
    const bUnread = bCleared ? 0 : (bBaseline !== undefined ? Math.max(0, bTotalUser - bBaseline) : (b.count || 0));

    if (aUnread > 0 && bUnread === 0) return -1;
    if (bUnread > 0 && aUnread === 0) return 1;

    const timeA = a.last_active ? new Date(a.last_active).getTime() : 0;
    const timeB = b.last_active ? new Date(b.last_active).getTime() : 0;

    return timeB - timeA;
  });

  const isUserBlocked = (username: string) => {
    if (!blockedList || blockedList.length === 0) return false;
    return blockedList.some((b: any) => {
      const bName = typeof b === "string" ? b : b.username;
      return bName && bName.toLowerCase() === username.toLowerCase();
    });
  };

  const formatLastMessage = (user: any, isCleared: boolean, totalMsgs: number) => {
    if (isCleared) return "-";
    const msg = user.last_message;

    if (msg === "___DELETED___") return "(Pesan dihapus)";

    if ((!msg || msg.trim() === "") && totalMsgs > 0) {
      return "[Gambar]";
    }

    if (msg) {
      const lower = msg.toLowerCase();
      const isVoiceNote = lower.includes("audio") || lower.includes(".mp3") || lower.includes(".wav") || lower.includes(".ogg") || msg.includes("Voice Note");
      if (isVoiceNote) return "[Voice Note]";

      const isUrlOrImage = 
        lower.startsWith("http://") || 
        lower.startsWith("https://") || 
        lower.startsWith("data:image") ||
        lower.includes("supabase.co/storage") ||
        lower.includes("cloudinary.com") ||
        /\.(jpg|jpeg|png|webp|gif)$/i.test(lower) ||
        msg.includes("Gambar");

      if (isUrlOrImage) return "[Gambar]";
      return msg;
    }

    return "(Belum ada pesan)";
  };

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

  const handleDeleteUserAccount = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    if (onDeleteUser) {
      onDeleteUser(username);
    }
  };

  const handleToggleBlockUserAccount = (e: React.MouseEvent, username: string) => {
    e.stopPropagation();
    const currentlyBlocked = isUserBlocked(username);
    if (currentlyBlocked) {
      if (onUnblockUser) {
        onUnblockUser(username);
      } else if (onBlockUser) {
        onBlockUser(username);
      }
    } else {
      if (onBlockUser) {
        onBlockUser(username);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-full p-2 gap-2.5 relative pb-32">
      <style dangerouslySetInnerHTML={{ __html: `
        audio, 
        .audio-player, 
        .mp3-player, 
        [class*="player"], 
        [class*="audio"] {
          display: none !important;
        }

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

      <div className="space-y-2 flex-1 pt-1">
        {sortedUsers.length === 0 ? (
          <div className="bg-white p-4 rounded-xl border text-center text-gray-400 font-medium text-xs">
            Belum ada user terdaftar.
          </div>
        ) : (
          sortedUsers.map((user: any, index: number) => {
            const identifier = user.username || `anonymous-${index}`;
            const isCleared = clearedUserMsgs[user.username];
            const isHighlighted = highlightedUser === user.username;
            const blocked = isUserBlocked(user.username);
            
            const totalUserMsgs = isCleared ? 0 : (user.totalUserMsgs || 0);
            const totalAdminMsgs = isCleared ? 0 : (user.totalAdminMsgs || 0);

            const userLower = (user.username || "").toLowerCase().trim();
            const counts = mediaCounts[userLower] || { userImages: 0, userVoices: 0, adminImages: 0, adminVoices: 0 };
            
            const userImages = isCleared ? 0 : counts.userImages;
            const userVoices = isCleared ? 0 : counts.userVoices;
            const adminImages = isCleared ? 0 : counts.adminImages;
            const adminVoices = isCleared ? 0 : counts.adminVoices;

            const baseline = readBaselines[user.username];
            
            let displayCount = isCleared 
              ? 0 
              : (baseline !== undefined ? Math.max(0, totalUserMsgs - baseline) : (user.count || 0));
            
            const hasUnread = displayCount > 0;
            const lastMsg = formatLastMessage(user, isCleared, totalUserMsgs);

            return (
              <div 
                key={identifier} 
                id={`user-card-${user.username}`}
                onClick={() => handleUserClick(user)} 
                className={`bg-white p-3 rounded-xl shadow-xs hover:shadow-sm cursor-pointer transition-all flex flex-col gap-1 border ${
                  isHighlighted ? "active-card-highlight" : ""
                }`} 
                style={{ borderColor: isHighlighted ? "#f59e0b" : "var(--card-border)" }}
              >
                <div className="flex justify-between items-center w-full gap-1.5">
                  <div className="flex items-center gap-1 min-w-0 flex-1">
                    <button onClick={(e) => handleEditUsername(e, user)} className="text-gray-400 hover:text-blue-600 p-0.5 rounded transition-colors text-xs shrink-0" title="Edit Username">✏️</button>
                    <span className="font-bold text-blue-700 text-xs tracking-tight truncate max-w-[150px] sm:max-w-[220px]" title={user.username || 'User Tanpa Nama'}>
                      {user.username || 'User Tanpa Nama'}
                    </span>
                    {blocked && (
                      <span className="text-[8px] bg-red-100 text-red-600 font-bold px-1 py-0.5 rounded border border-red-200 shrink-0">
                        BLOKIR
                      </span>
                    )}
                  </div>
                  <div className={`text-[9px] font-medium whitespace-nowrap shrink-0 text-right ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>
                    {user.last_active ? formatMessageTime(user.last_active) : "-"}
                  </div>
                </div>

                <div className="flex justify-between items-center w-full gap-1.5 my-0.5">
                  <div className={`text-[11px] font-medium truncate flex-1 min-w-0 ${hasUnread ? 'text-emerald-600 font-semibold' : 'text-gray-500'}`}>
                    {lastMsg}
                  </div>
                  <div className="flex gap-1 shrink-0 items-center">
                    {/* USER (BIRU) */}
                    <span className="text-[8px] font-bold bg-blue-50 text-blue-600 px-1 py-0.5 rounded border border-blue-200 whitespace-nowrap" title="Gambar User">
                      G: {userImages}
                    </span>
                    <span className="text-[8px] font-bold bg-blue-50 text-blue-600 px-1 py-0.5 rounded border border-blue-200 whitespace-nowrap" title="Voice Note User">
                      V: {userVoices}
                    </span>

                    {/* ADMIN (MERAH) */}
                    <span className="text-[8px] font-bold bg-red-50 text-red-600 px-1 py-0.5 rounded border border-red-200 whitespace-nowrap" title="Gambar Admin">
                      G: {adminImages}
                    </span>
                    <span className="text-[8px] font-bold bg-red-50 text-red-600 px-1 py-0.5 rounded border border-red-200 whitespace-nowrap" title="Voice Note Admin">
                      V: {adminVoices}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-gray-100 w-full gap-1.5">
                  <div className="flex gap-1 items-center">
                    <button onClick={(e) => handleEditPin(e, user)} className="bg-amber-50 hover:bg-amber-500 text-amber-700 hover:text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-amber-200 transition-colors uppercase tracking-wider flex items-center gap-0.5">PIN: {user.pin || '---'}</button>
                    <button onClick={(e) => handleDeleteAll(e, user.username)} className="bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white text-[8px] font-black px-1.5 py-0.5 rounded border border-orange-200 transition-colors uppercase tracking-wider">DEL ALL</button>
                  </div>
                  <div className="flex gap-1 items-center shrink-0">
                    {hasUnread ? <span className="bg-emerald-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap animate-pulse">{displayCount} Baru</span> : <span className="bg-gray-400 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap">0</span>}
                    <span className="bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap" title="Total pesan user">U: {totalUserMsgs}</span>
                    <span className="bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap" title="Total balasan admin">A: {totalAdminMsgs}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="fixed bottom-[52px] left-2 right-2 z-40 bg-white/95 backdrop-blur-md p-2 rounded-xl border border-gray-200 shadow-lg flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <div className="relative flex-1" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsUserDropdownOpen((p) => !p)}
              className="w-full bg-gray-50 border border-gray-300 text-gray-800 text-[11px] font-semibold rounded-lg px-2 py-1.5 flex items-center justify-between text-left truncate active:scale-95 transition-all cursor-pointer"
            >
              <span className="truncate">Pilih user ({sortedUsers.length})...</span>
              <span className="text-gray-400 text-[9px] ml-1 shrink-0">
                {isUserDropdownOpen ? (dropdownPosition === "top" ? "▲" : "▼") : "▼"}
              </span>
            </button>

            {isUserDropdownOpen && (
              <div
                className={`fixed left-2 right-2 bg-slate-100 border border-slate-300 rounded-xl shadow-2xl max-h-[280px] overflow-y-auto z-[99999] p-1 flex flex-col gap-1 transition-all ${
                  dropdownPosition === "top" ? "bottom-[90px]" : "top-[calc(100vh-100px)]"
                }`}
              >
                {sortedUsers.length === 0 ? (
                  <div className="p-2 text-center text-xs text-gray-400 font-medium">
                    Tidak ada user terdaftar
                  </div>
                ) : (
                  sortedUsers.map((u: any, idx: number) => {
                    const username = typeof u === "string" ? u : u.username;
                    const umur = typeof u === "object" && u.umur ? u.umur : "-";
                    const berat = typeof u === "object" && u.berat ? u.berat : "-";
                    const userMsgs = typeof u === "object" ? (u.totalUserMsgs || 0) : 0;
                    const adminMsgs = typeof u === "object" ? (u.totalAdminMsgs || 0) : 0;
                    const totalPesan = userMsgs + adminMsgs;
                    const blocked = isUserBlocked(username);

                    return (
                      <div
                        key={username || idx}
                        className="w-full px-2 py-1 bg-white hover:bg-blue-50/90 rounded-lg text-xs font-bold text-gray-800 flex items-center justify-between transition-colors border border-slate-200 gap-1"
                      >
                        <div className="flex items-center gap-1 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={(e) => handleDeleteUserAccount(e, username)}
                            className="px-1 py-0.5 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 rounded text-[8px] font-bold shrink-0 transition-colors"
                          >
                            Hapus
                          </button>

                          <span
                            onClick={() => handleSelectFromDropdown(username)}
                            className="truncate text-blue-900 font-extrabold flex-1 min-w-0 cursor-pointer text-[11px]"
                          >
                            {username || `User #${idx + 1}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <div
                            onClick={() => handleSelectFromDropdown(username)}
                            className="bg-gray-50 text-[9px] font-black px-1.5 py-0.5 rounded-full border border-gray-200 whitespace-nowrap flex items-center gap-0.5 cursor-pointer"
                          >
                            <span className="text-emerald-600">{umur}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-red-500">{berat}</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-blue-600">{totalPesan}</span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleToggleBlockUserAccount(e, username)}
                            className={`px-1.5 py-0.5 rounded-full text-[8px] font-extrabold cursor-pointer transition-colors whitespace-nowrap ${
                              blocked
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
                                : "bg-red-100 text-red-700 border border-red-300"
                            }`}
                          >
                            {blocked ? "Buka" : "Blokir"}
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
            <div className="bg-blue-50 text-blue-800 text-[10px] font-extrabold px-2 py-1 rounded-lg border border-blue-200 whitespace-nowrap">
              {sortedUsers.length} U
            </div>

            <button
              type="button"
              onClick={handleToggleRegister}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-0.5 border uppercase tracking-wider ${
                isRegisterLocked
                  ? "bg-rose-600 text-white border-rose-400"
                  : "bg-emerald-600 text-white border-emerald-400"
              }`}
            >
              <span>Reg:</span>
              <span className="bg-black/30 px-1 py-0.5 rounded text-[9px]">
                {isRegisterLocked ? "OFF" : "ON"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="bg-amber-500 text-white font-black text-[10px] px-2 py-1 rounded-lg transition-all uppercase cursor-pointer whitespace-nowrap"
            >
              REFRESH
            </button>
          </div>
        </div>
      </div>

      {promptState.isOpen && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 select-none" onClick={() => setPromptState((p) => ({ ...p, isOpen: false }))}>
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col gap-3 text-white" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xs font-bold text-slate-200 tracking-wide">{promptState.title}</h3>
            <input
              type="text" autoFocus value={promptState.value}
              onChange={(e) => setPromptState((p) => ({ ...p, value: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  promptState.onConfirm(promptState.value);
                  setPromptState((p) => ({ ...p, isOpen: false }));
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2 w-full mt-1">
              <button type="button" onClick={() => setPromptState((p) => ({ ...p, isOpen: false }))} className="w-full py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-lg border border-slate-700">Batal</button>
              <button type="button" onClick={() => { promptState.onConfirm(promptState.value); setPromptState((p) => ({ ...p, isOpen: false })); }} className="w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg border border-blue-500/50">OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}