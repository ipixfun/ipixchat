"use client";
import React, { useRef, useState, useEffect } from "react";

// =========================================================
// 1. KOMPONEN PESAN SEMATAN (BERSIH & TANPA LOGIKA ROLL UP)
// =========================================================
export function PinnedMessage({ pinnedMsg, onUnpin }: { pinnedMsg?: any; onUnpin?: () => void }) {
  if (!pinnedMsg) return null;

  return (
    <div className="w-full mb-3 px-1 sticky top-0 z-30">
      <div 
        className="relative overflow-hidden rounded-xl border backdrop-blur-md shadow-lg p-3"
        style={{ 
          backgroundColor: "rgba(15, 23, 42, 0.85)", 
          borderColor: "var(--accent, #3b82f6)",
          boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.4)"
        }}
      >
        <div 
          className="absolute left-0 top-0 bottom-0 w-1.5"
          style={{ backgroundColor: "var(--accent, #3b82f6)" }}
        />
        
        <div className="flex items-center justify-between mb-1.5 pl-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-red-500/20 text-red-400 text-xs shadow-inner border border-red-500/30">
              📌
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-200">
                Pesan Sematan
              </span>
              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                oleh Admin
              </span>
            </div>
          </div>

          {onUnpin && (
            <button
              type="button"
              onClick={onUnpin}
              className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/40 text-red-300 text-xs transition-colors active:scale-95"
              title="Lepas Sematan"
            >
              ✕
            </button>
          )}
        </div>

        <div className="pl-1 text-xs text-gray-100 leading-relaxed break-words font-medium">
          {pinnedMsg.pesan}
        </div>
      </div>
    </div>
  );
}

// =========================================================
// 2. KOMPONEN MESSAGE ITEM (EKOR SESUAI POSISI: KANAN/KIRI)
// =========================================================
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
      if (hours >= 24) {
        return `${Math.floor(hours / 24)} hari lalu`;
      }
      return str;
    }
    const parsedDate = Date.parse(str);
    if (!isNaN(parsedDate)) {
      const diffInHours = Math.floor((Date.now() - parsedDate) / (1000 * 60 * 60));
      if (diffInHours >= 24) {
        return `${Math.floor(diffInHours / 24)} hari lalu`;
      }
    }
    return str;
  };

  const isMsgAdmin = m.username === "Admin●ipix.my.id";
  const isMsgMine = authUser ? (m.username === authUser) : !isMsgAdmin;
  
  // Jika pesan milik saya -> posisi di KANAN & ekor di KANAN
  // Jika pesan orang lain -> posisi di KIRI & ekor di KIRI
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

  const handleQuoteClick = (quotedText: string) => {
    scrollToMessage(quotedText);
    setTimeout(() => {
      const messageElements = document.querySelectorAll('[id^="msg-bubble-"]');
      for (const el of messageElements) {
        if (el.textContent?.includes(quotedText)) {
          const htmlEl = el as HTMLElement;
          htmlEl.classList.add("ring-4", "ring-[var(--accent)]", "scale-[1.03]", "animate-smooth-shake", "transition-all", "duration-300");
          htmlEl.style.boxShadow = "0 0 25px var(--accent)";
          setTimeout(() => {
            htmlEl.classList.remove("ring-4", "ring-[var(--accent)]", "scale-[1.03]", "animate-smooth-shake");
            htmlEl.style.boxShadow = "";
          }, 2000);
          break;
        }
      }
    }, 120);
  };

  if (m.pesan === "___DELETED___") {
    const isDeletedByAdmin = m.deleted_by_admin === true;
    return (
      <div id={`msg-${m.id}`} className="relative w-full mb-2 z-10 group">
        <div className="bg-white/15 backdrop-blur-md border rounded-xl p-2.5 flex flex-col w-full shadow-sm relative" style={{ borderColor: "var(--card-border)", backgroundColor: "var(--card-bg)" }}>
          {activeTab === "admin" && <div className="absolute -top-2 -right-2 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white shadow-sm z-20 cursor-help" style={{ backgroundColor: "var(--accent)" }} title="Dihapus (Dilihat oleh Admin)">X</div>}
          <div className="flex items-center gap-2">
            <span className="bg-gray-500/20 text-gray-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">🚫 Dihapus</span>
            <span className="text-[10px] font-bold" style={{ color: isDeletedByAdmin ? "var(--accent)" : "var(--foreground)" }}>oleh {isDeletedByAdmin ? "Admin" : m.username}</span>
          </div>
          <div className="text-[8px] opacity-60 mt-1 flex items-center gap-1 font-mono"><span>{formatMessageTime(m.created_at)}</span></div>
          {activeTab === "admin" && (
            <button onClick={(e) => { e.stopPropagation(); deleteMsg(m, false); }} className="absolute right-2 top-2 text-[14px] hover:opacity-80 w-7 h-7 flex items-center justify-center rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all transform active:scale-95" style={{ backgroundColor: "var(--accent)", color: "var(--background)" }} title="Hapus Permanen dari Database">🗑️</button>
          )}
        </div>
      </div>
    );
  }

  const needsApproval = m.image_url && m.is_approved === false && !isMsgAdmin;
  const showBlurred = needsApproval && activeTab !== "admin";

  const renderTextWithTags = (t: string) => t.split(/(@\w+)/g).map((part, i) => {
    if (part.startsWith("@")) {
      const uname = part.substring(1).toLowerCase();
      const color = uname === "admin" ? "text-red-600" : (authUser && uname === authUser.split("●")[0].toLowerCase()) ? "text-blue-600" : "text-green-600";
      return <span key={i} className={`font-bold ${color} cursor-pointer hover:underline`} onClick={(e) => { e.stopPropagation(); handleTag(part.substring(1)); }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });

  const renderContent = (text: string, isMin: boolean) => {
    if (!text) return null;
    const match = text.match(/^@(\w+)\s\("(.*?)"\)\s?(.*)$/);
    const textSize = isMin ? "text-[11px] leading-tight" : "text-sm leading-relaxed";
    if (match) {
      const [_, user, quotedText, replyText] = match;
      const tagColor = user.toLowerCase() === "admin" ? "text-red-600" : (authUser && user.toLowerCase() === authUser.split("●")[0].toLowerCase()) ? "text-blue-600" : "text-green-600";
      return (
        <>
          <div 
            className={`text-[10px] italic p-2 rounded cursor-pointer hover:opacity-100 border-l-4 mb-1.5 transition-colors break-words break-all shadow-inner`} 
            style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--accent)", color: "var(--foreground)" }} 
            onClick={(e) => { e.stopPropagation(); handleQuoteClick(quotedText); }}
          >
            <span className={`font-bold ${tagColor}`}>@{user}</span>: "{applyCensor(quotedText)}"
          </div>
          <div className={`${textSize} break-words break-all`} style={{ color: "var(--foreground)" }}>{renderTextWithTags(applyCensor(replyText))}</div>
        </>
      );
    }
    return <div className={`${textSize} break-words break-all`} style={{ color: "var(--foreground)" }}>{renderTextWithTags(applyCensor(text))}</div>;
  };

  const activeBorderColor = pillColor === "transparent" ? "transparent" : (pillColor || (isMsgAdmin ? "var(--accent)" : isMsgMine ? "var(--accent)" : "var(--card-border)"));
  const activeBgColor = bubbleBg === "transparent" ? "transparent" : (bubbleBg || "var(--card-bg)");

  return (
    <div id={`msg-${m.id}`} className={`relative w-full mb-2 flex ${isRightAligned ? "justify-end" : "justify-start"}`}>
      <style>{`
        @keyframes smoothShake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }
        .animate-smooth-shake { animation: smoothShake 0.4s ease-in-out infinite; }
      `}</style>

      {swipingId === m.id && swipeDelta !== 0 && (
        <div className={`absolute inset-0 flex items-center px-5 transition-colors duration-200 bg-transparent ${isMinimized ? "rounded-md" : "rounded-xl"} ${swipeDelta > 0 ? "justify-start" : "justify-end"}`}>
          {swipeDelta > 0 ? (
            <div className="flex flex-col items-center gap-0.5 text-red-600 opacity-90 drop-shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span className="text-[10px] font-bold">Hapus</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-0.5 opacity-90 drop-shadow-sm" style={{ color: "var(--accent)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
              <span className="text-[10px] font-bold">Balas</span>
            </div>
          )}
        </div>
      )}
      
      <div
        id={`msg-bubble-${m.id}`}
        className={`relative z-10 transition-all duration-300 max-w-[85%] sm:max-w-[75%] ${
          isMinimized 
            ? (isRightAligned ? "p-1.5 rounded-tl-md rounded-b-md rounded-tr-none" : "p-1.5 rounded-tr-md rounded-b-md rounded-tl-none")
            : (isRightAligned ? "p-3 rounded-tl-xl rounded-b-xl rounded-tr-none" : "p-3 rounded-tr-xl rounded-b-xl rounded-tl-none")
        } border-[2px] shadow-sm select-none`}
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
          transition: swipingId === m.id ? "none" : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)", 
          backgroundColor: activeBgColor,
          borderColor: activeBorderColor
        }}
      >
        {/* EKOR BUBBLE */}
        {isRightAligned ? (
          <>
            {/* EKOR KANAN (MENUNJUK KELUAR KE KANAN) */}
            <div 
              className="absolute top-[-2px] -right-[10px] w-0 h-0 border-t-[0px] border-t-transparent border-l-[10px] border-b-[14px] border-b-transparent"
              style={{ borderLeftColor: activeBorderColor }}
            />
            <div 
              className="absolute top-[0px] -right-[7px] w-0 h-0 z-10 border-t-[0px] border-t-transparent border-l-[10px] border-b-[12px] border-b-transparent"
              style={{ borderLeftColor: activeBgColor }}
            />
          </>
        ) : (
          <>
            {/* EKOR KIRI (MENUNJUK KELUAR KE KIRI) */}
            <div 
              className="absolute top-[-2px] -left-[10px] w-0 h-0 border-t-[0px] border-t-transparent border-r-[10px] border-b-[14px] border-b-transparent"
              style={{ borderRightColor: activeBorderColor }}
            />
            <div 
              className="absolute top-[0px] -left-[7px] w-0 h-0 z-10 border-t-[0px] border-t-transparent border-r-[10px] border-b-[12px] border-b-transparent"
              style={{ borderRightColor: activeBgColor }}
            />
          </>
        )}

        <div className={`flex justify-between items-center ${isMinimized ? "mb-0.5" : "mb-1"}`}>
          <div className="flex items-center gap-1.5 flex-wrap relative z-20">
            <b 
              onClick={(e) => { e.stopPropagation(); handleTag(m.username); }} 
              className={`px-2.5 py-1 rounded-full text-white cursor-pointer shadow-sm active:scale-95 transition-transform ${isMinimized ? "text-[8px] px-2 py-0.5" : "text-[10px]"}`}
              style={{ backgroundColor: pillColor === "transparent" ? "transparent" : (pillColor || "var(--accent)"), color: "var(--background)" }}
            >
              {m.username}
            </b>
          </div>
          
          <div className="flex items-center shrink-0 relative z-20 ml-2">
            {isMsgAdmin ? (
              <span className={`px-2.5 py-1 rounded-full bg-black/20 text-[9px] ${isAdminOnline ? "text-green-400 font-bold" : "opacity-60"}`}>
                {isAdminOnline ? "Online" : formatOfflineTime(adminOfflineTime)}
              </span>
            ) : (
              userStatus[m.username] && (
                <span className={`px-2.5 py-1 rounded-full bg-black/20 text-[9px] ${userStatus[m.username].online ? "text-green-400 font-bold" : "opacity-60"}`}>
                  {userStatus[m.username].online ? "Online" : formatOfflineTime(userStatus[m.username].offlineTime)}
                </span>
              )
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 mt-1.5 mb-1 relative z-20">
          {m.image_url && (
            <div className="relative cursor-zoom-in group shrink-0 w-max">
              <img src={m.image_url} alt="attachment" onClick={(e) => { e.stopPropagation(); setPopupMsg(m); }} className={`object-cover rounded-lg border border-black/10 shadow-sm transition-all bg-black/5 group-hover:brightness-90 ${isMinimized ? "w-16 h-16" : "w-24 h-24 sm:w-28 sm:h-28"} ${showBlurred ? "blur-md" : ""}`} loading="lazy" />
              {showBlurred && <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg pointer-events-none"><span className="text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-1 bg-black/60 rounded text-center leading-tight">Menunggu<br />Persetujuan</span></div>}
              {needsApproval && activeTab === "admin" && <button onClick={(e) => { e.stopPropagation(); approveImage(m.id); }} className="absolute -top-2 -right-2 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md active:scale-95 transition-all" style={{ backgroundColor: "var(--accent)" }}>Setujui</button>}
            </div>
          )}
          
          {m.pesan && (() => {
            const isPage2Private = colType === "private";
            const maxLines = isPage2Private ? 4 : 2, maxChars = isPage2Private ? 120 : 60; 
            const paragraphs = m.pesan.split("\n");
            const isLongText = paragraphs.length > maxLines || m.pesan.length > maxChars;

            return (
              <div className="min-w-0 flex-1 relative z-20">
                <div className={`break-words break-all whitespace-pre-wrap ${isLongText ? (isPage2Private ? "line-clamp-4" : "line-clamp-2") : ""}`} style={isLongText ? { display: '-webkit-box', WebkitLineClamp: isPage2Private ? 4 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}>
                  {renderContent(m.pesan, isMinimized)}
                </div>
                {isLongText && <button onClick={(e) => { e.stopPropagation(); setPopupMsg(m); }} className="text-[10px] font-black mt-1 px-2 py-0.5 rounded shadow-sm transition-colors block" style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}>Selengkapnya...</button>}
              </div>
            );
          })()}
        </div>

        <div className={`${isMinimized ? "mt-1 pt-1" : "mt-2 pt-2"} border-t border-black/10 flex justify-between items-center gap-3 relative z-20`}>
          <div className="flex-1 overflow-hidden flex flex-col gap-1 justify-end items-start text-left">
            {isEdited && (
              <div className="flex items-center flex-wrap gap-1 mt-0.5">
                <span className="text-yellow-500 font-black text-[9px] lowercase bg-yellow-500/10 px-1 rounded shadow-sm">(edited)</span>
                {m.edited_by && <span className="text-[9px] font-bold" style={{ color: m.edited_by === "Admin●ipix.my.id" ? "#dc2626" : "var(--accent)" }}>oleh {m.edited_by === "Admin●ipix.my.id" ? "Admin" : m.edited_by.split("●")[0]}</span>}
              </div>
            )}
            {activeTab === "admin" && (
              <div className="flex flex-col gap-1 text-[8px] opacity-60 font-sans w-full">
                <span className="truncate font-medium max-w-[200px]" title={m.user_browser || ""}>🌐 {shortBrowser}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-1 shrink-0 pb-0.5">
            <span className="text-[8px] opacity-60 font-bold px-1 rounded">{formatMessageTime(m.created_at)}</span>
            <div className="flex items-center gap-2 text-[10px]">
              {!isMinimized && <button type="button" onClick={(e) => { e.stopPropagation(); handleReply(m); }} className={`font-bold underline mr-1 transition-colors`} style={{ color: "var(--accent)" }}>Balas</button>}
              
              {activeTab === "admin" && (
                <div className="relative flex items-center">
                  <button type="button" onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId !== m.id ? m.id : null); }} className="text-base font-bold px-2 py-1 rounded transition-colors" style={{ color: "var(--foreground)" }}>⋮</button>
                  {activeMenuId === m.id && (
                    <>
                      <div className="fixed inset-0 z-[90]" onClick={(e) => { e.stopPropagation(); setActiveMenuId(null); }} />
                      <div className="absolute right-0 bottom-full mb-2 bg-white backdrop-blur-md shadow-xl border rounded-full z-[100] p-1.5 flex flex-row items-center gap-1 min-w-max origin-bottom-right" style={{ borderColor: "var(--accent)" }} onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => { editMsg(m.id); setActiveMenuId(null); }} className="px-3 py-1.5 text-[8px] font-black text-white bg-blue-500 hover:bg-blue-600 rounded-full shadow-sm transition-all active:scale-95">Edit</button>
                        {!isMsgAdmin && (
                          <button type="button" onClick={() => { blockUser(m.username); setActiveMenuId(null); }} className="px-3 py-1.5 text-[8px] font-black text-white bg-red-600 hover:bg-red-700 rounded-full shadow-sm transition-all active:scale-95">Blokir</button>
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
    </div>
  );
}