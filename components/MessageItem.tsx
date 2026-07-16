"use client";
import React, { useRef, useState } from "react";

export function MessageItem({
  m,
  colType,
  isMinimized,
  currentDeviceId,
  activeTab,
  isAdminOnline,
  adminOfflineTime,
  userStatus,
  activeMenuId,
  setActiveMenuId,
  swipingId,
  setSwipingId,
  handleTag,
  handleReply,
  deleteMsg,
  copyToClipboard,
  handleEditLimit,
  editMsg,
  editNama,
  blockUser,
  inviteToPrivate,
  setPopupMsg,
  handleLongPress,
  approveImage,
  applyCensor,
  scrollToMessage,
  formatMessageTime,
  authUser,
}: any) {
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [isHorizontalSwipe, setIsHorizontalSwipe] = useState(false);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchInitialY, setTouchInitialY] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);

  const shortBrowser = m.user_browser
    ? m.user_browser.split("(")[0].trim() +
      (m.user_browser.includes("(")
        ? ` (${m.user_browser.split("(")[1].split(")")[0]})`
        : "")
    : "Unknown Browser";
    
  const isMsgAdmin = m.username === "Admin●ipix.my.id";
  const isMsgMine = m.device_id === currentDeviceId || m.username === authUser;
  const isEdited =
    m.is_edited === true ||
    m.edited_by != null ||
    (typeof window !== "undefined"
      ? parseInt(localStorage.getItem(`edit_count_${m.id}`) || "0") > 0
      : false);

  if (m.pesan === "___DELETED___") {
    const isDeletedByAdmin = m.deleted_by_admin === true;
    return (
      <div
        id={`msg-${m.id}`}
        className="relative w-full flex justify-start mb-2 z-10 px-2 group"
      >
        <div className="bg-white/10 backdrop-blur-md border border-white/20 border-dashed rounded-xl p-2.5 flex flex-col w-full max-w-[240px] shadow-sm relative">
          {activeTab === "admin" && (
            <div
              className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-white shadow-sm z-20 cursor-help"
              title="Dihapus (Dilihat oleh Admin)"
            >
              X
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="bg-gray-500/20 text-gray-400 text-[8px] px-1.5 py-0.5 rounded uppercase font-black tracking-tighter">
              🚫 Dihapus
            </span>
            <span
              className={`text-[10px] font-bold ${
                isDeletedByAdmin ? "text-red-600" : "text-blue-600"
              }`}
            >
              oleh {isDeletedByAdmin ? "Admin" : m.username}
            </span>
          </div>
          <div className="text-[8px] text-gray-500 mt-1 flex items-center gap-1 font-mono">
            <span>{formatMessageTime(m.created_at)}</span>
          </div>
          {activeTab === "admin" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteMsg(m, false);
              }}
              className="absolute right-2 top-2 text-[14px] bg-red-100/80 hover:bg-red-200 text-red-600 w-7 h-7 flex items-center justify-center rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all transform active:scale-95"
              title="Hapus Permanen dari Database"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  }

  const isPrivateAndNotAdmin = m.is_private && !isMsgAdmin;
  
  // MERAH TUA DI KANAN DAN BAWAH UNTUK ADMIN
  const borderThicknessClass = isMsgAdmin
    ? "border-r-[3px] border-b-[3px] border-t-[1px] border-l-[1px] border-t-black/5 border-l-black/5"
    : "border-b-[3px] border-r-[3px] border-t-[1px] border-l-[1px] border-t-black/5 border-l-black/5";
    
  const borderColorClass = isMsgAdmin
    ? "border-r-red-800 border-b-red-800"
    : isPrivateAndNotAdmin
    ? "border-b-emerald-500 border-r-emerald-500"
    : isMsgMine
    ? "border-b-blue-500 border-r-blue-500"
    : "border-b-gray-400 border-r-gray-400";
    
  const bgBubbleClass = m.is_private ? "bg-emerald-50/95" : "bg-blue-50/95";
  const needsApproval = m.image_url && m.is_approved === false && !isMsgAdmin;
  const showBlurred = needsApproval && activeTab !== "admin";

  const renderTextWithTags = (t: string) => {
    const parts = t.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        const uname = part.substring(1).toLowerCase();
        let color = "text-green-600";
        if (uname === "admin") color = "text-red-600";
        else if (
          authUser &&
          uname === authUser.split("●")[0].toLowerCase()
        )
          color = "text-blue-600";
        return (
          <span
            key={i}
            className={`font-bold ${color} cursor-pointer hover:underline`}
            onClick={(e) => {
              e.stopPropagation();
              handleTag(part.substring(1));
            }}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderContent = (text: string, isMin: boolean) => {
    if (!text) return null;
    const match = text.match(/^@(\w+)\s\("(.*?)"\)\s?(.*)$/);
    const textSize = isMin ? "text-[11px] leading-tight" : "text-sm leading-relaxed";

    if (match) {
      const [_, user, quotedText, replyText] = match;
      let tagColor = "text-green-600";
      if (user.toLowerCase() === "admin") tagColor = "text-red-600";
      else if (
        authUser &&
        user.toLowerCase() === authUser.split("●")[0].toLowerCase()
      )
        tagColor = "text-blue-600";

      return (
        <>
          <div
            className={`text-[9px] text-gray-500 italic bg-white/70 ${
              isMin ? "p-1.5" : "p-2"
            } rounded cursor-pointer hover:bg-gray-200 border-l-2 mb-1 transition-colors ${
              colType === "private" ? "border-emerald-500" : "border-blue-500"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              scrollToMessage(quotedText);
            }}
          >
            <span className={`font-bold ${tagColor}`}>@{user}</span>: "
            {applyCensor(quotedText)}"
          </div>
          <div className={`${textSize} text-gray-800 break-words`}>
            {renderTextWithTags(applyCensor(replyText))}
          </div>
        </>
      );
    }
    return (
      <div className={`${textSize} text-gray-800 break-words`}>
        {renderTextWithTags(applyCensor(text))}
      </div>
    );
  };

  const isOtherOnline =
    userStatus && userStatus[m.username] && userStatus[m.username].online;
  const pillColor = isMsgAdmin
    ? "bg-red-600"
    : isMsgMine
    ? "bg-blue-600"
    : isOtherOnline
    ? "bg-green-600"
    : "bg-gray-700";

  return (
    <div id={`msg-${m.id}`} className="relative w-full">
      {swipingId === m.id && swipeDelta !== 0 && (
        <div
          className={`absolute inset-0 flex items-center px-5 transition-colors duration-200 ${
            isMinimized ? "rounded-md" : "rounded-xl"
          } ${
            swipeDelta > 0
              ? "bg-red-500 justify-start"
              : colType === "private"
              ? "bg-emerald-500 justify-end"
              : "bg-blue-500 justify-end"
          }`}
        >
          {swipeDelta > 0 ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white opacity-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          ) : (
            <div className="flex items-center gap-1 text-white font-bold text-sm opacity-90">
              <span>Balas</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
            </div>
          )}
        </div>
      )}
      <div
        id={`msg-bubble-${m.id}`}
        className={`relative z-10 ${bgBubbleClass} transition-colors duration-300 ${
          isMinimized ? "p-1.5 rounded-md" : "p-3 rounded-xl"
        } ${borderThicknessClass} shadow-sm w-full select-none ${borderColorClass}`}
        onMouseDown={(e) => {
          if (e.button !== 0) return;
          longPressTimer.current = setTimeout(() => {
            handleLongPress(m);
            if (navigator.vibrate) navigator.vibrate(50);
          }, 350);
        }}
        onMouseMove={() => {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }}
        onMouseUp={() => {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
        }}
        onTouchStart={(e) => {
          setTouchStartX(e.touches[0].clientX);
          setTouchInitialY(e.touches[0].clientY);
          setSwipingId(m.id);
          setSwipeDelta(0);
          setIsHorizontalSwipe(false);
          longPressTimer.current = setTimeout(() => {
            setSwipingId(null);
            handleLongPress(m);
            if (navigator.vibrate) navigator.vibrate(50);
          }, 350);
        }}
        onTouchMove={(e) => {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
          if (swipingId !== m.id) return;
          const deltaX = e.touches[0].clientX - touchStartX;
          const deltaY = e.touches[0].clientY - touchInitialY;
          if (
            !isHorizontalSwipe &&
            Math.abs(deltaX) > Math.abs(deltaY) &&
            Math.abs(deltaX) > 10
          )
            setIsHorizontalSwipe(true);
          if (isHorizontalSwipe) {
            let allowedDelta = deltaX;
            if (allowedDelta > 0 && !(activeTab === "admin" || isMsgMine))
              allowedDelta = 0;
            setSwipeDelta(Math.max(-75, Math.min(75, allowedDelta)));
          }
        }}
        onTouchEnd={() => {
          if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
          }
          if (swipingId === m.id && isHorizontalSwipe) {
            if (swipeDelta > 50) {
              if (activeTab === "admin" || isMsgMine) {
                deleteMsg(m, true);
              } else {
                alert("Anda hanya bisa menghapus pesan milik Anda sendiri.");
              }
            } else if (swipeDelta < -50) handleReply(m);
          }
          setSwipingId(null);
          setSwipeDelta(0);
          setIsHorizontalSwipe(false);
        }}
        style={{
          transform:
            swipingId === m.id ? `translateX(${swipeDelta}px)` : "translateX(0px)",
          transition:
            swipingId === m.id
              ? "none"
              : "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <div
          className={`flex justify-between items-start ${
            isMinimized ? "mb-0.5" : "mb-1"
          }`}
        >
          <div className="flex items-center gap-1.5 flex-wrap">
            <b
              onClick={(e) => {
                e.stopPropagation();
                handleTag(m.username);
              }}
              className={`px-2 py-0.5 rounded-full text-white cursor-pointer shadow-sm active:scale-95 transition-transform ${pillColor} ${
                isMinimized ? "text-[8px]" : "text-[10px]"
              }`}
            >
              {m.username}
            </b>
            {m.is_private && !isMinimized && (
              <span
                className={`text-[10px] ${
                  isMsgAdmin ? "text-red-500" : "text-emerald-600"
                }`}
              >
                🔒 Private
              </span>
            )}
          </div>
          <div className="text-right shrink-0">
            {isMsgAdmin ? (
              <span
                className={`px-1.5 py-0.5 rounded bg-white/60 text-[8px] ${
                  isAdminOnline
                    ? "text-green-600 font-bold"
                    : "text-gray-500"
                }`}
              >
                {isAdminOnline ? "Online" : adminOfflineTime}
              </span>
            ) : (
              userStatus[m.username] && (
                <span
                  className={`px-1.5 py-0.5 rounded bg-white/60 text-[8px] ${
                    userStatus[m.username].online
                      ? "text-green-600 font-bold"
                      : "text-gray-500"
                  }`}
                >
                  {userStatus[m.username].online
                    ? "Online"
                    : userStatus[m.username].offlineTime}
                </span>
              )
            )}
          </div>
        </div>

        <div className="flex items-start gap-3 mt-1.5 mb-1">
          {m.image_url && (
            <div className="relative cursor-zoom-in group shrink-0 w-max">
              <img
                src={m.image_url}
                alt="attachment"
                onClick={(e) => {
                  e.stopPropagation();
                  setPopupMsg(m);
                }}
                className={`object-cover rounded-lg border border-black/10 shadow-sm transition-all bg-black/5 group-hover:brightness-90 ${
                  isMinimized ? "w-16 h-16" : "w-24 h-24 sm:w-28 sm:h-28"
                } ${showBlurred ? "blur-md" : ""}`}
                loading="lazy"
              />
              {showBlurred && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg pointer-events-none">
                  <span className="text-white text-[8px] sm:text-[9px] font-bold px-1.5 py-1 bg-black/60 rounded text-center leading-tight">
                    Menunggu
                    <br />
                    Persetujuan
                  </span>
                </div>
              )}
              {needsApproval && activeTab === "admin" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    approveImage(m.id);
                  }}
                  className="absolute -top-2 -right-2 bg-green-500 hover:bg-green-600 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow-md active:scale-95 transition-all"
                >
                  Setujui
                </button>
              )}
            </div>
          )}
          {m.pesan && (
            <div className="min-w-0 flex-1">
              <div
                className={`break-words whitespace-pre-wrap ${
                  m.image_url && !isExpanded ? "line-clamp-5" : ""
                }`}
              >
                {renderContent(m.pesan, isMinimized)}
              </div>
              {m.image_url &&
                (m.pesan.length > 150 || m.pesan.split("\n").length > 5) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(!isExpanded);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-[10px] font-black mt-1 bg-white/50 px-2 py-0.5 rounded shadow-sm transition-colors block"
                  >
                    {isExpanded ? "Tampilkan lebih sedikit" : "Selengkapnya..."}
                  </button>
                )}
            </div>
          )}
        </div>

        <div
          className={`${
            isMinimized ? "mt-1 pt-1" : "mt-2 pt-2"
          } border-t border-black/10 flex justify-between gap-3 ${
            activeTab === "admin" ? "items-end" : "items-center"
          }`}
        >
          <div className="flex-1 overflow-hidden flex flex-col gap-1 justify-end items-start text-left">
            {isEdited && (
              <div className="flex items-center flex-wrap gap-1 mt-0.5">
                <span className="text-yellow-600 font-black text-[9px] lowercase bg-yellow-100/70 px-1 rounded shadow-sm">
                  (edited)
                </span>
                {m.edited_by && (
                  <span
                    className={`text-[9px] font-bold ${
                      m.edited_by === "Admin●ipix.my.id"
                        ? "text-red-600"
                        : "text-blue-600"
                    }`}
                  >
                    oleh{" "}
                    {m.edited_by === "Admin●ipix.my.id"
                      ? "Admin"
                      : m.edited_by.split("●")[0]}
                  </span>
                )}
              </div>
            )}

            {m.is_private && isMinimized && (
              <span
                className={`text-[8px] font-bold ${
                  isMsgAdmin ? "text-red-500" : "text-emerald-600"
                }`}
              >
                🔒 Private
              </span>
            )}
            {activeTab === "admin" && (
              <div className="flex flex-col gap-1 text-[8px] text-gray-400 font-sans w-full">
                <span
                  className="text-blue-600 font-mono cursor-pointer hover:underline break-all leading-tight"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(m.device_id, "Device ID");
                  }}
                >
                  ID: {m.device_id}
                </span>
                <span
                  className="text-orange-600 truncate font-medium max-w-[200px]"
                  title={m.user_browser || ""}
                >
                  🌐 {shortBrowser}
                </span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 pb-0.5">
            <span className="text-[8px] text-gray-400 font-bold bg-white/50 px-1 rounded">
              {formatMessageTime(m.created_at)}
            </span>
            <div className="flex items-center gap-2 text-[10px]">
              {!isMinimized && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReply(m);
                  }}
                  className={`font-bold underline mr-1 transition-colors ${
                    colType === "private"
                      ? "text-emerald-600 hover:text-emerald-700"
                      : "text-blue-600 hover:text-blue-700"
                  }`}
                >
                  Balas
                </button>
              )}
              {activeTab === "admin" && (
                <div className="relative flex items-center">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId !== m.id ? m.id : null);
                    }}
                    className="text-gray-500 hover:text-gray-800 text-base font-bold px-2 py-1 rounded hover:bg-white/50 transition-colors"
                  >
                    ⋮
                  </button>
                  {activeMenuId === m.id && (
                    <>
                      <div
                        className="fixed inset-0 z-[90]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(null);
                        }}
                      />
                      {/* --- Pop up Di Atas Titik Tiga, Horizontal, Dinamis, Warna-Warni --- */}
                      <div
                        className="absolute right-0 bottom-full mb-2 bg-gray/95 backdrop-blur-md shadow-xl border border-gray-200 rounded-full z-[100] p-1.5 flex flex-row items-center gap-1 min-w-max origin-bottom-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            editMsg(m.id);
                            setActiveMenuId(null);
                          }}
                          className="px-3 py-1.5 text-[8px] font-black text-white bg-blue-500 hover:bg-blue-600 rounded-full shadow-sm transition-all active:scale-95"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            editNama(m.id);
                            setActiveMenuId(null);
                          }}
                          className="px-3 py-1.5 text-[8px] font-black text-white bg-purple-500 hover:bg-purple-600 rounded-full shadow-sm transition-all active:scale-95"
                        >
                          Nama
                        </button>
                        
                        {!isMsgAdmin && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                blockUser(m.device_id, m.username);
                                setActiveMenuId(null);
                              }}
                              className="px-3 py-1.5 text-[8px] font-black text-white bg-red-600 hover:bg-red-700 rounded-full shadow-sm transition-all active:scale-95"
                            >
                              Blokir
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                inviteToPrivate(m.device_id, m.username);
                                setActiveMenuId(null);
                              }}
                              className="px-3 py-1.5 text-[8px] font-black text-white bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-sm transition-all active:scale-95"
                            >
                              Private
                            </button>
                          </>
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