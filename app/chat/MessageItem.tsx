"use client";
import React, { useRef, useState, useEffect } from "react";

export function PinnedMessage({ 
  adminPinnedMsg,
  userPinnedMsg,
  uiTab, 
  onEditPinned, 
  onScrollToMsg 
}: { 
  adminPinnedMsg?: any; 
  userPinnedMsg?: any; 
  uiTab?: string; 
  onEditPinned?: (msg: any) => void; 
  onScrollToMsg?: (id: number) => void; 
}) {
  if (!adminPinnedMsg && !userPinnedMsg) return null;

  return (
    <div className="w-full px-3 py-1.5 z-10 shrink-0 border-b transition-all duration-300" style={{ backgroundColor: "var(--background)", borderColor: "var(--card-border)" }}>
      <div className="grid grid-cols-2 gap-2 w-full">
        {/* KOLOM KIRI: SEMATAN ADMIN */}
        <div 
          onClick={() => adminPinnedMsg && onScrollToMsg?.(adminPinnedMsg.id)} 
          className={`p-2 rounded-xl transition-all border backdrop-blur-md relative shadow-sm flex items-center gap-2 ${adminPinnedMsg ? "cursor-pointer active:scale-[0.98]" : "opacity-40"}`}
          style={{ backgroundColor: "var(--card-bg, rgba(255,255,255,0.03))", borderColor: "var(--card-border)" }}
        >
          <div className="shrink-0 opacity-90" style={{ color: "var(--accent)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden pr-3">
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              Admin
            </span>
            <p className="text-[11px] truncate font-medium leading-tight opacity-90" style={{ color: "var(--foreground)" }}>
              {adminPinnedMsg ? adminPinnedMsg.pesan : "Belum ada sematan"}
            </p>
          </div>
          {uiTab === "admin" && onEditPinned && adminPinnedMsg && (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); onEditPinned(adminPinnedMsg); }} 
              className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-amber-400 rounded hover:bg-white/5"
              title="Edit Sematan Admin"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          )}
        </div>

        {/* KOLOM KANAN: SEMATAN USER */}
        <div 
          onClick={() => userPinnedMsg && onScrollToMsg?.(userPinnedMsg.id)} 
          className={`p-2 rounded-xl transition-all border backdrop-blur-md relative shadow-sm flex items-center gap-2 ${userPinnedMsg ? "cursor-pointer active:scale-[0.98]" : "opacity-40"}`}
          style={{ backgroundColor: "var(--card-bg, rgba(255,255,255,0.03))", borderColor: "var(--card-border)" }}
        >
          <div className="shrink-0 opacity-90" style={{ color: "var(--accent)" }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 17v5" />
              <path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z" />
            </svg>
          </div>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-[8px] font-bold uppercase tracking-wider truncate" style={{ color: "var(--accent)" }}>
              {userPinnedMsg ? userPinnedMsg.username.split("●")[0] : "User"}
            </span>
            <p className="text-[11px] truncate font-medium leading-tight opacity-90" style={{ color: "var(--foreground)" }}>
              {userPinnedMsg ? userPinnedMsg.pesan : "Belum ada sematan"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MessageItem({
  m, colType, isMinimized, activeTab, isAdminOnline, adminOfflineTime, userStatus,
  activeMenuId, setActiveMenuId, swipingId, setSwipingId, handleTag, handleReply,
  deleteMsg, copyToClipboard, handleEditLimit, editMsg, blockUser, setPopupMsg,
  handleLongPress, approveImage, applyCensor, scrollToMessage, formatMessageTime, authUser,
}: any) {
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchInitialY, setTouchInitialY] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const formatOfflineTime = (timeStr: any) => {
    if (!timeStr) return "";
    const str = String(timeStr);
    const match = str.match(/(\d+)\s*jam/i);
    if (match) {
      const hours = parseInt(match[1], 10);
      if (hours >= 24) return `${Math.floor(hours / 24)} hari lalu`;
      return str;
    }
    const parsedDate = Date.parse(str);
    if (!isNaN(parsedDate)) {
      const diffInHours = Math.floor((Date.now() - parsedDate) / (1000 * 60 * 60));
      if (diffInHours >= 24) return `${Math.floor(diffInHours / 24)} hari lalu`;
    }
    return str;
  };

  const isMsgAdmin = m.username === "Admin●ipix.my.id";
  const isMsgMine = authUser ? (m.username === authUser) : !isMsgAdmin;
  const isRightAligned = isMsgMine;

  const [pillColor, setPillColor] = useState(() => {
    if (typeof window !== "undefined") {
      const isCustomChatEnabled = localStorage.getItem("global_enable_custom_chat") === "true";
      if (!isCustomChatEnabled) return "";
      return isMsgAdmin 
        ? (localStorage.getItem("global_admin_pill_color") || "")
        : (localStorage.getItem("global_user_pill_color") || "");
    }
    return "";
  });

  const [bubbleBg, setBubbleBg] = useState(() => {
    if (typeof window !== "undefined") {
      const isCustomChatEnabled = localStorage.getItem("global_enable_custom_chat") === "true";
      if (!isCustomChatEnabled) return "";
      return isMsgAdmin 
        ? (localStorage.getItem("global_admin_bubble_bg") || "")
        : (localStorage.getItem("global_user_bubble_bg") || "");
    }
    return "";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        const isCustomChatEnabled = localStorage.getItem("global_enable_custom_chat") === "true";
        if (!isCustomChatEnabled) {
          setPillColor("");
          setBubbleBg("");
        } else {
          setPillColor(isMsgAdmin ? (localStorage.getItem("global_admin_pill_color") || "") : (localStorage.getItem("global_user_pill_color") || ""));
          setBubbleBg(isMsgAdmin ? (localStorage.getItem("global_admin_bubble_bg") || "") : (localStorage.getItem("global_user_bubble_bg") || ""));
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("globalColorChanged", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("globalColorChanged", handleStorageChange);
    };
  }, [isMsgAdmin]);

  const clearTimer = () => { if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null; } };
  const shortBrowser = m.user_browser ? m.user_browser.split("(")[0].trim() + (m.user_browser.includes("(") ? ` (${m.user_browser.split("(")[1].split(")")[0]})` : "") : "Unknown Browser";
  
  const isEdited = m.is_edited === true || m.edited_by != null || (typeof window !== "undefined" ? parseInt(localStorage.getItem(`edit_count_${m.id}`) || "0") > 0 : false);
  
  // Timestamp aktif: Menggunakan waktu edit terbaru (updated_at/edited_at) sehingga saat pesan diedit, 
  // sorting list berdasarkan timestamp ini akan menaikkan posisi pesan ke bawah (seperti pesan baru) di panel admin.
  const activeMessageTimestamp = m.updated_at || m.edited_at || m.created_at;

  const handleQuoteClick = (quotedText: string) => {
    if (typeof window !== "undefined" && navigator.vibrate) {
      try { navigator.vibrate([80, 50, 80]); } catch (e) {}
    }
    scrollToMessage(quotedText);
  };

  if (m.pesan === "___DELETED___") {
    const isDeletedByAdmin = m.deleted_by_admin === true;
    return (
      <div id={`msg-${m.id}`} className="relative w-full mb-2 z-10 group">
        <div className="bg-white/10 backdrop-blur-md border rounded-xl p-2.5 flex flex-col w-full shadow-sm relative" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
          {activeTab === "admin" && <div className="absolute -top-2 -right-2 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white shadow-sm z-20 cursor-help" style={{ backgroundColor: "var(--accent)" }} title="Dihapus (Dilihat oleh Admin)">X</div>}
          <div className="flex items-center gap-2">
            <span className="bg-gray-500/20 text-gray-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">🚫 Dihapus</span>
            <span className="text-[10px] font-bold" style={{ color: isDeletedByAdmin ? "var(--accent)" : "var(--foreground)" }}>oleh {isDeletedByAdmin ? "Admin" : m.username}</span>
          </div>
          <div className="text-[8px] opacity-60 mt-1 flex items-center gap-1 font-mono"><span>{formatMessageTime ? formatMessageTime(m.created_at) : m.created_at}</span></div>
          {activeTab === "admin" && (
            <button onClick={(e) => { e.stopPropagation(); deleteMsg(m, false); }} className="absolute right-2 top-2 text-[14px] hover:opacity-80 w-7 h-7 flex items-center justify-center rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all transform active:scale-95" style={{ backgroundColor: "var(--accent)", color: "var(--background)" }} title="Hapus Permanen dari Database">🗑️</button>
          )}
        </div>
      </div>
    );
  }

  const renderTextWithTags = (t: string) => t.split(/(@\w+)/g).map((part, i) => {
    if (part.startsWith("@")) {
      const uname = part.substring(1).toLowerCase();
      const color = uname === "admin" ? "text-red-500 font-bold" : (authUser && uname === authUser.split("●")[0].toLowerCase()) ? "text-blue-400 font-bold" : "text-emerald-400 font-bold";
      return <span key={i} className={`${color} cursor-pointer hover:underline`} onClick={(e) => { e.stopPropagation(); handleTag(part.substring(1)); }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });

  const renderContent = (text: string, isMin: boolean) => {
    if (!text) return null;
    const match = text.match(/^@(\w+)\s\("([\s\S]*?)"\)\s?([\s\S]*)$/);
    const textSize = isMin ? "text-xs sm:text-sm leading-relaxed" : "text-sm leading-relaxed";
    if (match) {
      const [_, user, quotedText, replyText] = match;
      const tagColor = user.toLowerCase() === "admin" ? "text-red-400 font-bold" : (authUser && user.toLowerCase() === authUser.split("●")[0].toLowerCase()) ? "text-blue-400 font-bold" : "text-emerald-400 font-bold";
      return (
        <>
          <div 
            className="text-[10px] italic p-2 rounded-lg cursor-pointer hover:opacity-100 border-l-2 mb-1.5 transition-colors break-words overflow-hidden shadow-inner" 
            style={{ backgroundColor: "rgba(0,0,0,0.15)", borderColor: "var(--accent)", color: "var(--foreground)" }} 
            onClick={(e) => { e.stopPropagation(); handleQuoteClick(quotedText); }}
          >
            <span className={tagColor}>@{user}</span>: "{applyCensor(quotedText)}"
          </div>
          <div className={`${textSize} break-words overflow-wrap-anywhere`} style={{ color: "var(--foreground)" }}>{renderTextWithTags(applyCensor(replyText))}</div>
        </>
      );
    }
    return <div className={`${textSize} break-words overflow-wrap-anywhere`} style={{ color: "var(--foreground)" }}>{renderTextWithTags(applyCensor(text))}</div>;
  };

  const activeBorderColor = pillColor === "transparent" ? "transparent" : (pillColor || (isMsgAdmin ? "var(--accent)" : isMsgMine ? "var(--accent)" : "var(--card-border)"));
  const activeBgColor = bubbleBg === "transparent" ? "transparent" : (bubbleBg || "var(--card-bg)");
  const displayCleanUsername = m.username ? m.username.split("●")[0] : "User";

  return (
    <div id={`msg-${m.id}`} className={`relative w-full mb-3 flex ${isRightAligned ? "justify-end" : "justify-start"}`}>
      <style>{`
        @keyframes smoothShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-smooth-shake { animation: smoothShake 0.4s ease-in-out infinite; }
        .overflow-wrap-anywhere { overflow-wrap: anywhere; word-break: break-word; }
      `}</style>

      {swipingId === m.id && swipeDelta !== 0 && (
        <div className={`absolute inset-0 flex items-center px-4 transition-colors duration-200 bg-transparent rounded-xl ${swipeDelta > 0 ? "justify-start" : "justify-end"}`}>
          {swipeDelta > 0 ? (
            <div className="flex flex-col items-center gap-0.5 text-red-500 opacity-90 drop-shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span className="text-[9px] font-bold uppercase tracking-wider">Hapus</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5 opacity-90 drop-shadow-sm" style={{ color: "var(--accent)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              <span className="text-[9px] font-bold uppercase tracking-wider">Balas</span>
            </div>
          )}
        </div>
      )}
      
      <div
        id={`msg-bubble-${m.id}`}
        className="relative z-10 transition-all duration-200 max-w-[85%] sm:max-w-[75%] min-w-[140px] p-3 border-[1.5px] shadow-sm select-none rounded-2xl"
        onMouseDown={(e) => { if (e.button === 0) longPressTimer.current = setTimeout(() => { handleLongPress(m); if (navigator.vibrate) navigator.vibrate(50); }, 350); }}
        onMouseMove={clearTimer}
        onMouseUp={clearTimer}
        onTouchStart={(e) => {
          setTouchStartX(e.touches[0].clientX); setTouchInitialY(e.touches[0].clientY);
          setSwipingId(m.id); setSwipeDelta(0); setIsHorizontalSwipe(false);
          longPressTimer.current = setTimeout(() => { setSwipingId(null); handleLongPress(m); if (navigator.vibrate) navigator.vibrate(50); }, 350);
        }}
        onTouchMove={(e) => {
          clearTimer();
          if (swipingId !== m.id) return;
          const deltaX = e.touches[0].clientX - touchStartX, deltaY = e.touches[0].clientY - touchInitialY;
          if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) setIsHorizontalSwipe(true);
          if (isHorizontalSwipe) setSwipeDelta(Math.max(-75, Math.min(75, (deltaX > 0 && !(activeTab === "admin" || isMsgMine)) ? 0 : deltaX)));
        }}
        onTouchEnd={() => {
          clearTimer();
          if (swipingId === m.id && isHorizontalSwipe) {
            if (swipeDelta > 50) (activeTab === "admin" || isMsgMine) ? deleteMsg(m, true) : alert("Anda hanya bisa menghapus pesan milik Anda sendiri.");
            else if (swipeDelta < -50) handleReply(m);
          }
          setSwipingId(null); setSwipeDelta(0); setIsHorizontalSwipe(false);
        }}
        style={{ 
          transform: swipingId === m.id ? `translateX(${swipeDelta}px)` : "translateX(0px)", 
          transition: swipingId === m.id ? "none" : "transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
          backgroundColor: activeBgColor,
          borderColor: activeBorderColor
        }}
      >
        {/* ICON SVG BERUANG LUCU DI POJOK ATAS GELEMBUNG */}
        {m.is_pinned && (
          <div className="absolute -top-3 right-2.5 z-20 pointer-events-none filter drop-shadow-md" title="Pesan Disematkan">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="var(--accent)" stroke="var(--background)" strokeWidth="1.2">
              <circle cx="6.5" cy="6.5" r="3" />
              <circle cx="17.5" cy="6.5" r="3" />
              <circle cx="6.5" cy="6.5" r="1.5" fill="var(--background)" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="var(--background)" />
              <circle cx="12" cy="13" r="7" />
              <ellipse cx="12" cy="14.5" rx="2.8" ry="2" fill="var(--background)" />
              <ellipse cx="12" cy="13.8" rx="1.2" ry="0.8" fill="var(--accent)" />
              <circle cx="9.5" cy="11.5" r="0.9" fill="var(--background)" />
              <circle cx="14.5" cy="11.5" r="0.9" fill="var(--background)" />
            </svg>
          </div>
        )}

        {/* EKOR BUBBLE */}
        {isRightAligned ? (
          <>
            <div 
              className="absolute top-1/2 -translate-y-1/2 -right-[7px] w-0 h-0 border-t-[6px] border-t-transparent border-l-[7px] border-b-[6px] border-b-transparent"
              style={{ borderLeftColor: activeBorderColor }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 -right-[5px] w-0 h-0 z-10 border-t-[5px] border-t-transparent border-l-[5px] border-b-[5px] border-b-transparent"
              style={{ borderLeftColor: activeBgColor }}
            />
          </>
        ) : (
          <>
            <div 
              className="absolute top-1/2 -translate-y-1/2 -left-[7px] w-0 h-0 border-t-[6px] border-t-transparent border-r-[7px] border-b-[6px] border-b-transparent"
              style={{ borderRightColor: activeBorderColor }}
            />
            <div 
              className="absolute top-1/2 -translate-y-1/2 -left-[5px] w-0 h-0 z-10 border-t-[5px] border-t-transparent border-r-[5px] border-b-[5px] border-b-transparent"
              style={{ borderRightColor: activeBgColor }}
            />
          </>
        )}

        {/* HEADER BUBBLE */}
        <div className="flex justify-between items-center gap-2 mb-1.5 w-full">
          <div className="flex items-center gap-1.5 shrink-0">
            <span 
              onClick={(e) => { e.stopPropagation(); handleTag(m.username); }} 
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black shrink-0 cursor-pointer shadow-sm active:scale-95 transition-transform"
              style={{ backgroundColor: pillColor === "transparent" ? "rgba(255,255,255,0.1)" : (pillColor || "var(--accent)"), color: "var(--background, #ffffff)" }}
            >
              {displayCleanUsername}
            </span>
          </div>
          
          <div className="flex items-center shrink-0">
            {isMsgAdmin ? (
              <span className={`px-2 py-0.5 rounded-full bg-black/20 text-[8px] font-bold ${isAdminOnline ? "text-emerald-400" : "opacity-60"}`}>
                {isAdminOnline ? "Online" : formatOfflineTime(adminOfflineTime)}
              </span>
            ) : (
              userStatus[m.username] && (
                <span className={`px-2 py-0.5 rounded-full bg-black/20 text-[8px] font-bold ${userStatus[m.username].online ? "text-emerald-400" : "opacity-60"}`}>
                  {userStatus[m.username].online ? "Online" : formatOfflineTime(userStatus[m.username].offlineTime)}
                </span>
              )
            )}
          </div>
        </div>

        {/* ISI PESAN / GAMBAR */}
        <div className="flex items-start gap-2.5 my-1">
          {m.image_url && (
            <div className="relative cursor-zoom-in group shrink-0 w-max">
              <img src={m.image_url} alt="attachment" onClick={(e) => { e.stopPropagation(); setPopupMsg(m); }} className={`object-cover rounded-lg border border-black/10 shadow-sm transition-all bg-black/5 group-hover:brightness-90 ${isMinimized ? "w-20 h-20" : "w-28 h-28"}`} loading="lazy" />
            </div>
          )}
          
          {m.pesan && (() => {
            const isPage2Private = colType === "private";
            const maxLines = isPage2Private ? 4 : 2, maxChars = isPage2Private ? 120 : 60; 
            const paragraphs = m.pesan.split("\n");
            const isLongText = paragraphs.length > maxLines || m.pesan.length > maxChars;

            return (
              <div className="min-w-0 flex-1">
                <div className={`break-words overflow-wrap-anywhere ${isLongText ? (isPage2Private ? "line-clamp-4" : "line-clamp-2") : ""}`} style={isLongText ? { display: '-webkit-box', WebkitLineClamp: isPage2Private ? 4 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}>
                  {renderContent(m.pesan, isMinimized)}
                </div>
                {isLongText && <button onClick={(e) => { e.stopPropagation(); setPopupMsg(m); }} className="text-[9px] font-bold mt-1 px-2 py-0.5 rounded shadow-sm transition-colors block" style={{ backgroundColor: "rgba(0,0,0,0.2)", color: "var(--foreground)" }}>Selengkapnya...</button>}
              </div>
            );
          })()}
        </div>

        {/* KETERANGAN EDITED (DI BARIS BAWAH AGAR JELAS TERLIHAT) */}
        {isEdited && (
          <div className="mt-1.5 pt-1 border-t border-black/10 flex items-center gap-1.5">
            <span className="text-amber-400 font-bold text-[9px] lowercase">(edited)</span>
            {m.edited_by && (
              <span className="text-[9px] opacity-85 truncate" style={{ color: "var(--foreground)" }}>
                oleh {m.edited_by === "Admin●ipix.my.id" ? "Admin" : m.edited_by.split("●")[0]}
              </span>
            )}
          </div>
        )}

        {/* FOOTER BUBBLE */}
        <div className="mt-1.5 pt-1 border-t border-black/10 flex justify-between items-center gap-2">
          <div className="flex-1 overflow-hidden flex flex-col gap-0.5 text-left">
            {activeTab === "admin" && (
              <span className="truncate font-mono text-[8px] opacity-50" title={m.user_browser || ""}>🌐 {shortBrowser}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {/* TANGGAL DAN WAKTU TERTANAH SESUAI WAKTU EDIT TERAKHIR ATAU CREATED */}
            <span className="text-[8px] font-bold opacity-60 font-mono">
              {formatMessageTime ? formatMessageTime(activeMessageTimestamp) : activeMessageTimestamp}
            </span>
            {!isMinimized && <button type="button" onClick={(e) => { e.stopPropagation(); handleReply(m); }} className="text-[9px] font-bold underline" style={{ color: "var(--accent)" }}>Balas</button>}
            
            {activeTab === "admin" && (
              <div className="relative flex items-center">
                <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId !== m.id ? m.id : null); }} className="text-xs font-bold px-1.5 py-0.5 rounded" style={{ color: "var(--foreground)" }}>⋮</button>
                {activeMenuId === m.id && (
                  <>
                    <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                    <div className="absolute right-0 bottom-full mb-2 bg-slate-900 border border-slate-700 shadow-xl rounded-full z-[100] p-1 flex items-center gap-1 min-w-max" onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => { editMsg(m.id); setActiveMenuId(null); }} className="px-2.5 py-1 text-[8px] font-bold text-white bg-blue-600 rounded-full">Edit</button>
                      {!isMsgAdmin && (
                        <button type="button" onClick={() => { blockUser(m.username); setActiveMenuId(null); }} className="px-2.5 py-1 text-[8px] font-bold text-white bg-red-600 rounded-full">Blokir</button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}